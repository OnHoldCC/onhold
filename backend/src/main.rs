mod public_cache;
mod analytics;
mod analytics_cache;
mod artwork;
mod burn;
mod chain_stream;
mod claims;
mod referrals;
mod crypto;
mod mining;
mod pg;
mod uploads;
use axum::{
    extract::{ConnectInfo, DefaultBodyLimit, State},
    http::{header, HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{
    net::{IpAddr, SocketAddr},
    path::PathBuf,
    sync::{Arc, Mutex},
    time::Duration,
};
use tower_http::services::ServeDir;

#[derive(Clone)]
struct AppState {
    db: Arc<Mutex<Connection>>,
    origin: String,
    http: reqwest::Client,
    claims: Option<claims::ClaimSigner>,
    burn: Option<burn::Tracker>,
    mining: Option<mining::Tracker>,
    pg: Option<pg::Store>,
    analytics: analytics::Cache,
    public_cache: Arc<public_cache::Cache>,
    visitor_salt: String,
    trusted_proxies: Vec<IpAddr>,
}
#[derive(Debug)]
struct ApiError(StatusCode, &'static str);
impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        (self.0, Json(json!({"error": self.1}))).into_response()
    }
}
fn internal() -> ApiError {
    ApiError(StatusCode::INTERNAL_SERVER_ERROR, "storage_unavailable")
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "snake_case")]
enum EventKind {
    PageView,
    AdClick,
    WalletConnect,
}
impl EventKind {
    fn as_str(&self) -> &'static str {
        match self {
            Self::PageView => "page_view",
            Self::AdClick => "ad_click",
            Self::WalletConnect => "wallet_connect",
        }
    }
}
#[derive(Deserialize, Serialize, Debug)]
#[serde(deny_unknown_fields)]
struct Event {
    event_id: String,
    kind: EventKind,
    page: String,
    site_id: Option<u8>,
    market: Option<String>,
    campaign_version: Option<u64>,
}
impl Event {
    fn validate(&self) -> Result<(), ApiError> {
        if !(16..=64).contains(&self.event_id.len())
            || !self
                .event_id
                .bytes()
                .all(|c| c.is_ascii_alphanumeric() || c == b'-')
        {
            return Err(ApiError(StatusCode::BAD_REQUEST, "invalid_event_id"));
        }
        if !["home", "claim", "analytics", "burn", "docs"].contains(&self.page.as_str()) {
            return Err(ApiError(StatusCode::BAD_REQUEST, "invalid_page"));
        }
        if self.market.is_some() != self.campaign_version.is_some()
            || self
                .campaign_version
                .is_some_and(|v| v == 0 || v > i64::MAX as u64)
            || self
                .market
                .as_deref()
                .is_some_and(|v| crypto::address(v).is_err())
        {
            return Err(ApiError(StatusCode::BAD_REQUEST, "invalid_campaign"));
        }
        if !matches!(self.kind, EventKind::AdClick) && self.market.is_some() {
            return Err(ApiError(StatusCode::BAD_REQUEST, "unexpected_campaign"));
        }
        match self.kind {
            EventKind::AdClick if self.page != "home" || !matches!(self.site_id, Some(0..=5)) => {
                return Err(ApiError(StatusCode::BAD_REQUEST, "invalid_site"))
            }
            EventKind::PageView | EventKind::WalletConnect if self.site_id.is_some() => {
                return Err(ApiError(StatusCode::BAD_REQUEST, "unexpected_site"))
            }
            _ => {}
        }
        Ok(())
    }
}
#[derive(Clone, Serialize, Deserialize)]
struct DayCount {
    date: String,
    clicks: u64,
}
#[derive(Clone, Serialize, Deserialize)]
struct Stats {
    page_views: u64,
    page_uv: u64,
    ad_clicks: u64,
    wallet_connections: u64,
    clicks_by_site: [u64; 6],
    uv_by_site: [u64; 6],
    updated_at: u64,
    daily_clicks: Vec<DayCount>,
    timezone: String,
    financial: Value,
}
fn init_db(connection: &Connection) -> rusqlite::Result<()> {
    connection.busy_timeout(Duration::from_secs(3))?;
    connection.execute_batch(
        "PRAGMA journal_mode=WAL;
        CREATE TABLE IF NOT EXISTS events (
          event_id TEXT PRIMARY KEY,
          kind TEXT NOT NULL CHECK(kind IN ('page_view','ad_click','wallet_connect')),
          page TEXT NOT NULL CHECK(page IN ('home','claim','analytics','burn','docs')),
          site_id INTEGER,
          created_at INTEGER NOT NULL DEFAULT (unixepoch())
        );
        CREATE INDEX IF NOT EXISTS events_kind_site ON events(kind, site_id);
        CREATE INDEX IF NOT EXISTS events_created ON events(created_at);
        CREATE TABLE IF NOT EXISTS request_limits(kind TEXT NOT NULL, created_at INTEGER NOT NULL DEFAULT (unixepoch()));
        CREATE INDEX IF NOT EXISTS request_limits_created ON request_limits(created_at);
        CREATE TABLE IF NOT EXISTS verified_accounts(nullifier TEXT PRIMARY KEY,tier INTEGER NOT NULL CHECK(tier IN (0,1,2)),base_tokens INTEGER NOT NULL,banned_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS verification_sessions(token_hash TEXT PRIMARY KEY,nullifier TEXT NOT NULL,expires_at INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS nft_artwork(record_hash TEXT PRIMARY KEY,image TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS verified_nft_records(token_hash TEXT PRIMARY KEY,record TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS claims(nullifier TEXT PRIMARY KEY,wallet TEXT NOT NULL UNIQUE,tier INTEGER NOT NULL,base_tokens INTEGER NOT NULL,referrer TEXT NOT NULL,deadline INTEGER NOT NULL,status TEXT NOT NULL CHECK(status IN ('authorized','confirmed')),tx_hash TEXT UNIQUE);
        CREATE TABLE IF NOT EXISTS wallet_referrals(market TEXT NOT NULL,wallet TEXT NOT NULL,referrer TEXT NOT NULL,bound_at INTEGER NOT NULL,PRIMARY KEY(market,wallet));
        CREATE TABLE IF NOT EXISTS referral_challenges(nonce TEXT PRIMARY KEY,market TEXT NOT NULL,wallet TEXT NOT NULL,referrer TEXT NOT NULL,expires_at INTEGER NOT NULL);
        CREATE INDEX IF NOT EXISTS referral_challenges_expiry ON referral_challenges(expires_at);
        CREATE TABLE IF NOT EXISTS invites(code TEXT PRIMARY KEY,wallet TEXT NOT NULL UNIQUE);
        CREATE TABLE IF NOT EXISTS nft_mints(nullifier TEXT NOT NULL,wallet TEXT NOT NULL,tier INTEGER NOT NULL,referrer TEXT NOT NULL,deadline INTEGER NOT NULL,status TEXT NOT NULL CHECK(status IN ('authorized','confirmed')),tx_hash TEXT UNIQUE,token_id TEXT,market TEXT NOT NULL DEFAULT '',PRIMARY KEY(market,nullifier));
        CREATE TABLE IF NOT EXISTS chain_snapshots(market TEXT PRIMARY KEY,snapshot TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS burn_cursor(vault TEXT PRIMARY KEY,next_block INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS burn_events(vault TEXT NOT NULL,tx_hash TEXT NOT NULL,log_index INTEGER NOT NULL,block INTEGER NOT NULL,spent TEXT NOT NULL,burned TEXT NOT NULL,PRIMARY KEY(vault,tx_hash,log_index));",
    )?;
    let account_schema:String=connection.query_row("SELECT sql FROM sqlite_master WHERE name='verified_accounts'",[],|row|row.get(0))?;
    if !account_schema.contains("(0,1,2)") {
        connection.execute_batch("BEGIN IMMEDIATE; ALTER TABLE verified_accounts RENAME TO old_verified_accounts;
        CREATE TABLE verified_accounts(nullifier TEXT PRIMARY KEY,tier INTEGER NOT NULL CHECK(tier IN (0,1,2)),base_tokens INTEGER NOT NULL,banned_at TEXT NOT NULL);
        INSERT INTO verified_accounts SELECT * FROM old_verified_accounts; DROP TABLE old_verified_accounts; COMMIT;")?;
    }
    let has_artwork: bool = connection.query_row(
        "SELECT COUNT(*)>0 FROM pragma_table_info('verified_nft_records') WHERE name='image'",
        [],
        |r| r.get(0),
    )?;
    if !has_artwork {
        connection.execute_batch("ALTER TABLE verified_nft_records ADD COLUMN image TEXT;")?;
    }
    let mint_schema: String = connection.query_row(
        "SELECT sql FROM sqlite_master WHERE name='nft_mints'",
        [],
        |r| r.get(0),
    )?;
    if !mint_schema.contains("PRIMARY KEY(market,nullifier)") {
        let legacy_market=std::env::var("ONHOLD_PREVIOUS_MARKET_ADDRESS").or_else(|_|std::env::var("ONHOLD_MARKET_ADDRESS")).unwrap_or_default().to_lowercase();
        connection.execute_batch("BEGIN IMMEDIATE; ALTER TABLE nft_mints RENAME TO old_nft_mints;
        CREATE TABLE nft_mints(nullifier TEXT NOT NULL,wallet TEXT NOT NULL,tier INTEGER NOT NULL,referrer TEXT NOT NULL,deadline INTEGER NOT NULL,status TEXT NOT NULL CHECK(status IN ('authorized','confirmed')),tx_hash TEXT UNIQUE,token_id TEXT,market TEXT NOT NULL DEFAULT '',PRIMARY KEY(market,nullifier));")?;
        connection.execute("INSERT INTO nft_mints SELECT nullifier,wallet,tier,referrer,deadline,status,tx_hash,token_id,?1 FROM old_nft_mints",[legacy_market])?;
        connection.execute_batch("DROP TABLE old_nft_mints; COMMIT;")?;
    }
    connection.execute(
        "CREATE INDEX IF NOT EXISTS nft_mints_wallet ON nft_mints(wallet)",
        [],
    )?;
    let schema: String = connection.query_row(
        "SELECT sql FROM sqlite_master WHERE name='events'",
        [],
        |row| row.get(0),
    )?;
    let has_campaign: bool = connection.query_row(
        "SELECT COUNT(*)>0 FROM pragma_table_info('events') WHERE name='market'",
        [],
        |r| r.get(0),
    )?;
    if !schema.contains("'docs'") {
        let columns = if has_campaign {
            "event_id,kind,page,site_id,created_at,market,campaign_version"
        } else {
            "event_id,kind,page,site_id,created_at,NULL,NULL"
        };
        connection.execute_batch(&format!("BEGIN IMMEDIATE; ALTER TABLE events RENAME TO old_events;
        CREATE TABLE events(event_id TEXT PRIMARY KEY,kind TEXT NOT NULL CHECK(kind IN ('page_view','ad_click','wallet_connect')),page TEXT NOT NULL CHECK(page IN ('home','claim','analytics','burn','docs')),site_id INTEGER,created_at INTEGER NOT NULL DEFAULT(unixepoch()),market TEXT,campaign_version INTEGER);
        INSERT INTO events SELECT {columns} FROM old_events; DROP TABLE old_events;
        CREATE INDEX events_kind_site ON events(kind,site_id); CREATE INDEX events_created ON events(created_at); COMMIT;"))?;
    } else if !has_campaign {
        connection.execute_batch("ALTER TABLE events ADD COLUMN market TEXT; ALTER TABLE events ADD COLUMN campaign_version INTEGER;")?;
    }
    connection.execute("CREATE INDEX IF NOT EXISTS events_campaign ON events(market,site_id,campaign_version) WHERE kind='ad_click'",[])?;
    let has_visitor: bool = connection.query_row(
        "SELECT COUNT(*)>0 FROM pragma_table_info('events') WHERE name='visitor_id'",
        [],
        |r| r.get(0),
    )?;
    if !has_visitor {
        connection.execute_batch("ALTER TABLE events ADD COLUMN visitor_id TEXT;")?;
    }
    connection.execute_batch(
        "CREATE TABLE IF NOT EXISTS analytics_settings(name TEXT PRIMARY KEY,value TEXT NOT NULL);",
    )?;
    connection.execute(
        "INSERT OR IGNORE INTO analytics_settings(name,value) VALUES('visitor_salt',?1)",
        [uuid::Uuid::new_v4().to_string()],
    )?;
    Ok(())
}
async fn database<T: Send + 'static>(
    state: AppState,
    job: impl FnOnce(&Connection) -> rusqlite::Result<T> + Send + 'static,
) -> Result<T, ApiError> {
    tokio::task::spawn_blocking(move || {
        let connection = state.db.lock().map_err(|_| internal())?;
        job(&connection).map_err(|_| internal())
    })
    .await
    .map_err(|_| internal())?
}
async fn ingest(
    State(state): State<AppState>,
    headers: HeaderMap,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    Json(mut event): Json<Event>,
) -> Result<Json<Value>, ApiError> {
    if let Some(origin) = headers.get(header::ORIGIN) {
        if origin.to_str().ok() != Some(state.origin.as_str()) {
            return Err(ApiError(StatusCode::FORBIDDEN, "origin_not_allowed"));
        }
    }
    event.validate()?;
    event.market = event.market.map(|v| v.to_lowercase());
    let visitor = matches!(event.kind, EventKind::AdClick | EventKind::PageView).then(|| {
        analytics::visitor_id(
            peer.ip(),
            &headers,
            &state.trusted_proxies,
            &state.visitor_salt,
        )
    });
    if let Some(pg) = &state.pg {
        let client = pg.read.get().await.map_err(|_| pg::error())?;
        let inserted=client.execute("INSERT INTO analytics_events(event_id,kind,page,site_id,market,campaign_version,visitor_id,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,extract(epoch FROM now())::bigint) ON CONFLICT(event_id) DO NOTHING",&[&event.event_id,&event.kind.as_str(),&event.page,&event.site_id.map(|v|v as i16),&event.market,&event.campaign_version.map(|v|v as i64),&visitor]).await.map_err(|_|pg::error())?;
        drop(client);
        let cached = analytics_cache::sync(pg).await.unwrap_or(false);
        return Ok(Json(json!({"accepted":true,"duplicate":inserted==0,"cached":cached})));
    }
    let inserted = database(state, move |db| {
        db.execute(
            "INSERT OR IGNORE INTO events(event_id,kind,page,site_id,market,campaign_version,visitor_id) VALUES(?1,?2,?3,?4,?5,?6,?7)",
            params![
                event.event_id,
                event.kind.as_str(),
                event.page,
                event.site_id,event.market,event.campaign_version,visitor
            ],
        )
    })
    .await?;
    Ok(Json(json!({"accepted": true, "duplicate": inserted == 0})))
}
async fn stats(State(state): State<AppState>) -> Result<impl IntoResponse, ApiError> {
    let (snapshot, source) = analytics::read(&state).await?;
    Ok((
        [("cache-control", "no-store"),("x-analytics-source", source)],
        Json(snapshot.stats.clone()),
    ))
}
async fn static_headers(mut request: axum::extract::Request, next: axum::middleware::Next) -> axum::response::Response {
    let path = request.uri().path().to_owned();
    let page=matches!(path.as_str(),"/claim"|"/analytics"|"/burn"|"/docs");
    if page { *request.uri_mut()=axum::http::Uri::from_static("/index.html"); }
    let mut response = next.run(request).await;
    if !path.starts_with("/api/") && response.status().is_success() {
        let policy = if path.rsplit_once('.').is_some_and(|(stem,ext)| matches!(ext,"js"|"css") && stem.rsplit_once('-').is_some_and(|(_,hash)| matches!(hash.len(),8|12) && hash.bytes().all(|c| c.is_ascii_alphanumeric()))) {
            "public, max-age=31536000, immutable"
        } else if page || path.ends_with('/') || path.ends_with(".html") {
            "no-cache"
        } else {
            "public, max-age=3600"
        };
        response.headers_mut().insert(header::CACHE_CONTROL, policy.parse().unwrap());
    }
    response
}
async fn health(State(state): State<AppState>) -> Result<Json<Value>, ApiError> {
    let mut chain = mining::health(&state)?;
    if state.mining.is_none() {
        if let Some(tracker) = &state.burn {
            let store = state.pg.as_ref().ok_or_else(pg::error)?;
            let client = store.read.get().await.map_err(|_| pg::error())?;
            let row = client.query_opt("SELECT data FROM buyback_state WHERE vault=$1", &[&tracker.vault]).await.map_err(|_| pg::error())?;
            let data = row.map(|r| r.get::<_, Value>(0)).unwrap_or(Value::Null);
            let now = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_secs();
            chain = json!({"configured":true,"available":data["available"]==true&&data["connected"]==true&&data["syncing"]!=true&&now.saturating_sub(data["seen_at"].as_u64().unwrap_or(0))<60,"confirmed_block":data["confirmed_block"],"last_error":data["last_error"]});
        }
    }
    Ok(Json(json!({"status":if chain["available"]==true{"ok"}else{"degraded"},"chain":chain})))
}
async fn ready(state: State<AppState>) -> Result<impl IntoResponse, ApiError> {
    let Json(value) = health(state).await?;
    let status = if value["status"]=="ok" { StatusCode::OK } else { StatusCode::SERVICE_UNAVAILABLE };
    Ok((status, [(header::CACHE_CONTROL,"no-store")], Json(value)))
}
fn router(state: AppState, dist: PathBuf) -> Router {
    let template=std::fs::read_to_string(dist.join("index.html")).ok().map(Arc::<str>::from);
    let mut app=Router::new()
        .route(
            "/api/health",
            get(health),
        )
        .route("/api/ready", get(ready))
        .route("/api/events", post(ingest).layer(DefaultBodyLimit::max(4096)))
        .route("/api/uploads/avatar", post(uploads::upload_avatar).layer(DefaultBodyLimit::max(uploads::MAX_IMAGE_BYTES+65536)))
        .route("/api/home", get(public_cache::home))
        .route("/api/stats", get(stats))
        .route("/api/burn", get(burn::snapshot))
        .route("/api/chain", get(mining::snapshot))
        .route("/api/transactions/{hash}", get(mining::transaction_status))
        .route("/api/mining-stats", get(mining::network_stats))
        .route("/api/ads", get(mining::ads))
        .route("/api/nfts", get(mining::gallery))
        .route("/api/status",get(|State(state):State<AppState>|async move{Json(json!({"uploads_configured":true,"upload_provider":"pons-ipfs","gameplay_configured":state.mining.as_ref().is_some_and(|t|!t.nft_only),"nft_configured":state.claims.is_some(),"nft":state.claims.as_ref().map(|claim|claim.market.clone()),"protocol":"nft-staking-v4","chain_index_configured":state.mining.is_some(),"market":state.mining.map(|index|index.market).or_else(||state.claims.map(|claim|claim.market)),"chain_id":97}))}))
        .route("/api/referrals/bind",post(referrals::bind).layer(DefaultBodyLimit::max(4096)))
        .route("/api/referrals",get(referrals::history))
        .route("/api/invites",post(claims::invite).layer(DefaultBodyLimit::max(1024)))
        .route("/api/verify",post(claims::verify).layer(DefaultBodyLimit::max(4096)))
        .route("/api/nft/create",post(artwork::upload).layer(DefaultBodyLimit::max(uploads::MAX_IMAGE_BYTES+65536)))
        .route("/api/nft/quote",post(claims::quote).layer(DefaultBodyLimit::max(4096)))
        .route("/api/nft/authorize",post(claims::authorize).layer(DefaultBodyLimit::max(4096)))
        .route("/api/nft/receipt",post(claims::receipt).layer(DefaultBodyLimit::max(4096)))
        .fallback_service(ServeDir::new(dist).precompressed_br().precompressed_gzip());
    if let Some(template)=template {app=app.route("/",get(move|State(state):State<AppState>|{let template=template.clone();async move{public_cache::html(state,template).await}}));}
    app.layer(axum::middleware::from_fn(static_headers))
        .layer(axum::middleware::from_fn_with_state(state.clone(),public_cache::middleware))
        .with_state(state)
}
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let address = std::env::var("ONHOLD_ADDR").unwrap_or_else(|_| "127.0.0.1:4190".into());
    let origin = std::env::var("ONHOLD_ORIGIN").unwrap_or_else(|_| format!("http://{address}"));
    let directory =
        PathBuf::from(std::env::var("ONHOLD_DATA_DIR").unwrap_or_else(|_| "backend/data".into()));
    let dist =
        PathBuf::from(std::env::var("ONHOLD_DIST_DIR").unwrap_or_else(|_| "front/dist".into()));
    std::fs::create_dir_all(&directory)?;
    let connection = Connection::open(directory.join("events.sqlite3"))?;
    init_db(&connection)?;
    let pg = pg::Store::from_env().await?;
    let visitor_salt = match &pg {
        Some(store) => store.visitor_salt.clone(),
        None => connection.query_row(
            "SELECT value FROM analytics_settings WHERE name='visitor_salt'",
            [],
            |r| r.get(0),
        )?,
    };
    let trusted_proxies = std::env::var("ONHOLD_TRUSTED_PROXIES")
        .unwrap_or_default()
        .split(',')
        .filter(|v| !v.trim().is_empty())
        .map(|v| v.trim().parse::<IpAddr>())
        .collect::<Result<Vec<_>, _>>()
        .map_err(|_| "Invalid ONHOLD_TRUSTED_PROXIES IP address")?;
    let state = AppState {
        db: Arc::new(Mutex::new(connection)),
        origin,
        http: reqwest::Client::builder()
            .redirect(reqwest::redirect::Policy::none())
            .timeout(Duration::from_secs(20))
            .build()?,
        claims: claims::ClaimSigner::from_env()?,
        burn: burn::Tracker::from_env()?,
        mining: mining::Tracker::from_env()?,
        pg,
        analytics: Default::default(),
            public_cache: Default::default(),
        visitor_salt,
        trusted_proxies,
    };
    if (state.mining.is_some() || state.burn.is_some()) && state.pg.is_none() {
        return Err("Set DATABASE_URL for the chain indexer".into());
    }
    pg::import_telemetry(&state)
        .await
        .map_err(|_| "Unable to import existing telemetry")?;
    analytics::refresh(&state)
        .await
        .map_err(|_| "Unable to aggregate analytics")?;
    tokio::spawn(analytics::run(state.clone()));
    tokio::spawn(chain_stream::run(state.clone()));
    tokio::spawn(mining::run_stats(state.clone()));
    let listener = tokio::net::TcpListener::bind(&address).await?;
    println!("ONHOLD Rust API + React: http://{address}");
    axum::serve(
        listener,
        router(state, dist).into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{body::Body, http::Request};
    use http_body_util::BodyExt;
    use tower::ServiceExt;
    pub(super) fn app_with_state() -> (Router, AppState) {
        let db = Connection::open_in_memory().unwrap();
        init_db(&db).unwrap();
        let state = AppState {
            db: Arc::new(Mutex::new(db)),
            origin: "http://localhost:4190".into(),
            http: reqwest::Client::new(),
            claims: None,
            burn: None,
            mining: None,
            pg: None,
            analytics: Default::default(),
            public_cache: Default::default(),
            visitor_salt: "test-secret".into(),
            trusted_proxies: Vec::new(),
        };
        let app = router(state.clone(), PathBuf::from("/nonexistent")).layer(axum::Extension(
            ConnectInfo("127.0.0.1:1234".parse::<SocketAddr>().unwrap()),
        ));
        (app, state)
    }
    #[tokio::test]
    async fn nft_wallet_filters_validate_before_reading_state() {
        let (app,_)=app_with_state();
        for query in ["wallet=bad&position=staked","position=staked","wallet=0x1111111111111111111111111111111111111111","wallet=0x1111111111111111111111111111111111111111&position=unknown"] {
            let response=app.clone().oneshot(Request::get(format!("/api/nfts?{query}")).body(Body::empty()).unwrap()).await.unwrap();
            assert_eq!(response.status(),StatusCode::BAD_REQUEST, "{query}");
        }
        for position in ["owned","staked"] {
            let response=app.clone().oneshot(Request::get(format!("/api/nfts?wallet=0x1111111111111111111111111111111111111111&position={position}")).body(Body::empty()).unwrap()).await.unwrap();
            assert_eq!(response.status(),StatusCode::OK);
        }
    }
    #[tokio::test]
    async fn static_assets_are_versioned_and_compressed_without_caching_api_responses() {
        let directory=std::env::temp_dir().join(format!("onhold-static-{}",uuid::Uuid::new_v4()));
        std::fs::create_dir_all(directory.join("assets/build")).unwrap();
        std::fs::write(directory.join("index.html"),"<div id=root></div>").unwrap();
        std::fs::write(directory.join("app-ABCDEFGH.js"),"export default 1").unwrap();
        std::fs::write(directory.join("app-ABCDEFGH.js.br"),b"precompressed").unwrap();
        let (_,state)=app_with_state();let app=router(state,directory.clone());
        let html=app.clone().oneshot(Request::get("/").body(Body::empty()).unwrap()).await.unwrap();
        assert_eq!(html.headers()[header::CACHE_CONTROL],"no-cache");
        for page in ["claim","analytics","burn","docs"] {
            let clean=app.clone().oneshot(Request::get(format!("/{page}?ref=abcdef123456")).body(Body::empty()).unwrap()).await.unwrap();
            assert_eq!(clean.status(),StatusCode::OK);
            assert_eq!(clean.headers()[header::CACHE_CONTROL],"no-cache");
            assert_eq!(clean.headers()[header::CONTENT_TYPE],"text/html");
            let old=app.clone().oneshot(Request::get(format!("/{page}.html?ref=abcdef123456")).body(Body::empty()).unwrap()).await.unwrap();
            assert_eq!(old.status(),StatusCode::NOT_FOUND);
            assert!(old.headers().get(header::LOCATION).is_none());
        }
        let missing=app.clone().oneshot(Request::get("/missing.js").body(Body::empty()).unwrap()).await.unwrap();
        assert_eq!(missing.status(),StatusCode::NOT_FOUND);
        let asset=app.clone().oneshot(Request::get("/app-ABCDEFGH.js").header(header::ACCEPT_ENCODING,"br").body(Body::empty()).unwrap()).await.unwrap();
        assert_eq!(asset.status(),StatusCode::OK);
        assert_eq!(asset.headers()[header::CACHE_CONTROL],"public, max-age=31536000, immutable");
        assert_eq!(asset.headers()[header::CONTENT_ENCODING],"br");
        assert!(asset.headers()[header::CONTENT_TYPE].to_str().unwrap().contains("javascript"));
        let api=app.oneshot(Request::get("/api/health").body(Body::empty()).unwrap()).await.unwrap();
        assert_eq!(api.headers()[header::CACHE_CONTROL],"no-store");
        assert!(api.headers().get("server-timing").is_some());
        std::fs::remove_dir_all(directory).unwrap();
    }
    #[tokio::test]
    async fn nft_artwork_requires_origin_live_verification_and_only_image_fields() {
        let (app, state) = app_with_state();
        let token = "a".repeat(64);
        let hash = crypto::hex(&crypto::keccak(&token));
        {
            let db = state.db.lock().unwrap();
            db.execute(
                "INSERT INTO verification_sessions VALUES(?1,'uuid',unixepoch()+600)",
                [&hash],
            )
            .unwrap();
            db.execute(
                "INSERT INTO verified_nft_records(token_hash,record) VALUES(?1,'{}')",
                [&hash],
            )
            .unwrap();
        }
        let body = |token: &str, extra: &str| {
            format!("--boundary\r\nContent-Disposition: form-data; name=\"verification_token\"\r\n\r\n{token}\r\n--boundary\r\nContent-Disposition: form-data; name=\"wallet\"\r\n\r\n0x2222222222222222222222222222222222222222\r\n--boundary\r\nContent-Disposition: form-data; name=\"file\"; filename=\"pass.png\"\r\nContent-Type: image/png\r\n\r\ninvalid png\r\n{extra}--boundary--\r\n")
        };
        let request = |origin: &str, body: String| {
            Request::post("/api/nft/create")
                .header("Origin", origin)
                .header("Content-Type", "multipart/form-data; boundary=boundary")
                .body(Body::from(body))
                .unwrap()
        };
        assert_eq!(
            app.clone()
                .oneshot(request("https://untrusted.example", body(&token, "")))
                .await
                .unwrap()
                .status(),
            StatusCode::FORBIDDEN
        );
        assert_eq!(
            app.clone()
                .oneshot(request(&state.origin, body(&"b".repeat(64), "")))
                .await
                .unwrap()
                .status(),
            StatusCode::UNAUTHORIZED
        );
        assert_eq!(
            app.clone()
                .oneshot(request(&state.origin, body(&token, "")))
                .await
                .unwrap()
                .status(),
            StatusCode::UNSUPPORTED_MEDIA_TYPE
        );
        let extra = "--boundary\r\nContent-Disposition: form-data; name=\"tier\"\r\n\r\n2\r\n";
        assert_eq!(
            app.clone()
                .oneshot(request(&state.origin, body(&token, extra)))
                .await
                .unwrap()
                .status(),
            StatusCode::BAD_REQUEST
        );
        state.db.lock().unwrap().execute("UPDATE verified_nft_records SET image='https://gateway.pinata.cloud/ipfs/existing'",[]).unwrap();
        let response = app
            .oneshot(request(&state.origin, body(&token, "")))
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
        let value: Value =
            serde_json::from_slice(&response.into_body().collect().await.unwrap().to_bytes())
                .unwrap();
        assert_eq!(value["error"], "nft_not_configured");
    }
    #[test]
    fn artwork_migration_preserves_existing_verified_records() {
        let db = Connection::open_in_memory().unwrap();
        db.execute_batch("CREATE TABLE verified_nft_records(token_hash TEXT PRIMARY KEY,record TEXT NOT NULL); INSERT INTO verified_nft_records VALUES('old','{}');").unwrap();
        init_db(&db).unwrap();
        init_db(&db).unwrap();
        let row: (String, Option<String>) = db
            .query_row(
                "SELECT record,image FROM verified_nft_records WHERE token_hash='old'",
                [],
                |r| Ok((r.get(0)?, r.get(1)?)),
            )
            .unwrap();
        assert_eq!(row, ("{}".into(), None));
    }
    fn app() -> Router {
        app_with_state().0
    }
    fn event(id: &str, kind: &str, site: Option<u8>) -> Value {
        json!({"event_id":id,"kind":kind,"page":"home","site_id":site})
    }
    async fn send(app: Router, payload: Value) -> Response {
        app.oneshot(
            Request::post("/api/events")
                .header("content-type", "application/json")
                .body(Body::from(payload.to_string()))
                .unwrap(),
        )
        .await
        .unwrap()
    }
    #[tokio::test]
    async fn deduplicates_and_keeps_financial_counts_out_of_telemetry() {
        let (app, state) = app_with_state();
        let payload = event("unique-ad-click-event-0001", "ad_click", Some(2));
        assert_eq!(
            send(app.clone(), payload.clone()).await.status(),
            StatusCode::OK
        );
        assert_eq!(send(app.clone(), payload).await.status(), StatusCode::OK);
        assert_eq!(
            send(
                app.clone(),
                event("unique-page-view-event-0001", "page_view", None)
            )
            .await
            .status(),
            StatusCode::OK
        );
        analytics::refresh(&state).await.unwrap();
        let response = app
            .oneshot(Request::get("/api/stats").body(Body::empty()).unwrap())
            .await
            .unwrap();
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let stats: Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(stats["ad_clicks"], 1);
        assert_eq!(stats["page_views"], 1);
        assert_eq!(stats["page_uv"], 1);
        assert_eq!(stats["clicks_by_site"][2], 1);
        assert_eq!(stats["uv_by_site"][2], 1);
        assert_eq!(stats["daily_clicks"].as_array().unwrap().len(), 30);
        assert_eq!(
            stats["daily_clicks"].as_array().unwrap().last().unwrap()["clicks"],
            1
        );
        assert!(stats["financial"]["claimed_total"].is_null());
        assert_eq!(stats["financial"]["confirmed"], false);
    }
    #[tokio::test]
    async fn stats_reads_the_last_aggregation_instead_of_recounting_events() {
        let (app, state) = app_with_state();
        analytics::refresh(&state).await.unwrap();
        send(
            app.clone(),
            event("cached-click-event-00001", "ad_click", Some(0)),
        )
        .await;
        async fn read(app: Router) -> Value {
            let response = app
                .oneshot(Request::get("/api/stats").header(header::CACHE_CONTROL,"no-cache").body(Body::empty()).unwrap())
                .await
                .unwrap();
            serde_json::from_slice(&response.into_body().collect().await.unwrap().to_bytes())
                .unwrap()
        }
        let before = read(app.clone()).await;
        assert_eq!(before["clicks_by_site"][0], 0);
        assert_eq!(before["uv_by_site"][0], 0);
        analytics::refresh(&state).await.unwrap();
        let after = read(app.clone()).await;
        assert_eq!(after["clicks_by_site"][0], 1);
        assert_eq!(after["uv_by_site"][0], 1);
        assert!(after.get("visitor_id").is_none());
        send(
            app.clone(),
            event("cached-click-event-00002", "ad_click", Some(0)),
        )
        .await;
        assert_eq!(read(app.clone()).await["ad_clicks"], 1);
        analytics::refresh(&state).await.unwrap();
        let final_counts = read(app).await;
        assert_eq!(final_counts["ad_clicks"], 2);
        assert_eq!(final_counts["uv_by_site"][0], 1);
    }
    #[tokio::test]
    async fn rejects_unknown_data_and_invalid_events() {
        assert_eq!(
            send(app(), event("valid-event-0000001", "ad_click", Some(6)))
                .await
                .status(),
            StatusCode::BAD_REQUEST
        );
        assert_eq!(
            send(app(), event("valid-event-0000001", "page_view", Some(1)))
                .await
                .status(),
            StatusCode::BAD_REQUEST
        );
        assert_eq!(
            send(app(), event("valid-event-0000001", "claim", None))
                .await
                .status(),
            StatusCode::UNPROCESSABLE_ENTITY
        );
        let mut payload = event("valid-event-0000001", "page_view", None);
        payload["sessionKey"] = json!("not-a-real-session");
        assert_eq!(
            send(app(), payload).await.status(),
            StatusCode::UNPROCESSABLE_ENTITY
        );
    }
    #[tokio::test]
    async fn rejects_cross_origin_submissions() {
        let response = app()
            .oneshot(
                Request::post("/api/events")
                    .header("content-type", "application/json")
                    .header("origin", "https://another.example")
                    .body(Body::from(
                        event("valid-event-0000001", "page_view", None).to_string(),
                    ))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::FORBIDDEN);
    }
    #[test]
    fn event_survives_reopening_database() {
        let path = std::env::temp_dir().join(format!("onhold-test-{}.sqlite3", std::process::id()));
        {
            let db = Connection::open(&path).unwrap();
            init_db(&db).unwrap();
            db.execute("INSERT OR IGNORE INTO events(event_id,kind,page) VALUES('persistent-event-001','page_view','home')",[]).unwrap();
        }
        {
            let db = Connection::open(&path).unwrap();
            assert_eq!(
                db.query_row("SELECT COUNT(*) FROM events", [], |row| row
                    .get::<_, u64>(0))
                    .unwrap(),
                1
            );
        }
        std::fs::remove_file(path).unwrap();
    }
    #[test]
    fn adding_burn_preserves_existing_events_and_accepts_new_page() {
        let db = Connection::open_in_memory().unwrap();
        db.execute_batch("CREATE TABLE events(event_id TEXT PRIMARY KEY,kind TEXT,page TEXT CHECK(page IN ('home','claim','analytics')),site_id INTEGER,created_at INTEGER); INSERT INTO events VALUES('old-event','page_view','home',NULL,123);") .unwrap();
        init_db(&db).unwrap();
        init_db(&db).unwrap();
        assert_eq!(
            db.query_row(
                "SELECT created_at FROM events WHERE event_id='old-event'",
                [],
                |row| row.get::<_, u64>(0)
            )
            .unwrap(),
            123
        );
        db.execute(
            "INSERT INTO events(event_id,kind,page) VALUES('new-event','page_view','burn')",
            [],
        )
        .unwrap();
    }
    #[test]
    fn free_tier_and_market_migration_preserve_old_records_and_invites() {
        let db=Connection::open_in_memory().unwrap();
        db.execute_batch("CREATE TABLE verified_accounts(nullifier TEXT PRIMARY KEY,tier INTEGER NOT NULL CHECK(tier IN (1,2)),base_tokens INTEGER NOT NULL,banned_at TEXT NOT NULL);
        INSERT INTO verified_accounts VALUES('old',2,0,'2026-10-21');
        CREATE TABLE nft_mints(nullifier TEXT PRIMARY KEY,wallet TEXT NOT NULL,tier INTEGER NOT NULL,referrer TEXT NOT NULL,deadline INTEGER NOT NULL,status TEXT NOT NULL,tx_hash TEXT UNIQUE,token_id TEXT);
        INSERT INTO nft_mints VALUES('old','wallet',2,'referrer',0,'confirmed','tx','1');").unwrap();
        init_db(&db).unwrap();
        assert_eq!(db.query_row("SELECT tier FROM verified_accounts WHERE nullifier='old'",[],|r|r.get::<_,u8>(0)).unwrap(),2);
        db.execute("INSERT INTO verified_accounts VALUES('free',0,0,'2026-10-21')",[]).unwrap();
        db.execute("INSERT INTO invites VALUES('abcdef123456','wallet')",[]).unwrap();
        db.execute("INSERT INTO nft_mints(nullifier,wallet,tier,referrer,deadline,status,market) VALUES('old','wallet',0,'referrer',0,'authorized','new-market')",[]).unwrap();
        init_db(&db).unwrap();
        assert_eq!(db.query_row("SELECT count(*) FROM nft_mints WHERE nullifier='old'",[],|r|r.get::<_,u8>(0)).unwrap(),2);
        assert_eq!(db.query_row("SELECT code FROM invites WHERE wallet='wallet'",[],|r|r.get::<_,String>(0)).unwrap(),"abcdef123456");
    }
    #[test]
    fn nft_migration_keeps_legacy_claims_and_allows_many_nfts_per_wallet() {
        let db = Connection::open_in_memory().unwrap();
        init_db(&db).unwrap();
        db.execute(
            "INSERT INTO claims VALUES('old','wallet',1,500,'ref',123,'confirmed','tx')",
            [],
        )
        .unwrap();
        init_db(&db).unwrap();
        assert_eq!(
            db.query_row(
                "SELECT base_tokens FROM claims WHERE nullifier='old'",
                [],
                |r| r.get::<_, u64>(0)
            )
            .unwrap(),
            500
        );
        db.execute("INSERT INTO nft_mints(nullifier,wallet,tier,referrer,deadline,status) VALUES('new','wallet',1,'ref',123,'authorized')",[]).unwrap();
        db.execute("INSERT INTO nft_mints(nullifier,wallet,tier,referrer,deadline,status) VALUES('other','wallet',2,'ref',123,'authorized')",[]).unwrap();
        assert!(db.execute("INSERT INTO nft_mints(nullifier,wallet,tier,referrer,deadline,status) VALUES('other','another-wallet',2,'ref',123,'authorized')",[]).is_err());
    }
    #[tokio::test]
    async fn unconfigured_services_do_not_report_fake_financial_results() {
        let response = app()
            .oneshot(
                Request::builder()
                    .uri("/api/burn")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        let value: Value =
            serde_json::from_slice(&response.into_body().collect().await.unwrap().to_bytes())
                .unwrap();
        assert_eq!(value["configured"], false);
        assert!(value["totals"].is_null());
        let response = app()
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/api/verify")
                    .header(header::CONTENT_TYPE, "application/json")
                    .header(header::ORIGIN, "http://localhost:4190")
                    .body(Body::from(r#"{"session_key":"invalid"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::BAD_REQUEST);
    }
}
