use axum::{
    extract::{DefaultBodyLimit, State},
    http::{header, HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{
    path::PathBuf,
    sync::{Arc, Mutex},
    time::Duration,
};
use tower_http::services::ServeDir;

#[derive(Clone)]
struct AppState {
    db: Arc<Mutex<Connection>>,
    origin: String,
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
        if !["home", "claim", "analytics"].contains(&self.page.as_str()) {
            return Err(ApiError(StatusCode::BAD_REQUEST, "invalid_page"));
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
#[derive(Serialize)]
struct DayCount {
    date: String,
    clicks: u64,
}
#[derive(Serialize)]
struct Stats {
    page_views: u64,
    ad_clicks: u64,
    wallet_connections: u64,
    clicks_by_site: [u64; 6],
    daily_clicks: Vec<DayCount>,
    timezone: &'static str,
    financial: Value,
}
fn init_db(connection: &Connection) -> rusqlite::Result<()> {
    connection.busy_timeout(Duration::from_secs(3))?;
    connection.execute_batch(
        "PRAGMA journal_mode=WAL;
        CREATE TABLE IF NOT EXISTS events (
          event_id TEXT PRIMARY KEY,
          kind TEXT NOT NULL CHECK(kind IN ('page_view','ad_click','wallet_connect')),
          page TEXT NOT NULL CHECK(page IN ('home','claim','analytics')),
          site_id INTEGER,
          created_at INTEGER NOT NULL DEFAULT (unixepoch())
        );
        CREATE INDEX IF NOT EXISTS events_kind_site ON events(kind, site_id);
        CREATE INDEX IF NOT EXISTS events_created ON events(created_at);",
    )
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
    Json(event): Json<Event>,
) -> Result<Json<Value>, ApiError> {
    if let Some(origin) = headers.get(header::ORIGIN) {
        if origin.to_str().ok() != Some(state.origin.as_str()) {
            return Err(ApiError(StatusCode::FORBIDDEN, "origin_not_allowed"));
        }
    }
    event.validate()?;
    let inserted = database(state, move |db| {
        db.execute(
            "INSERT OR IGNORE INTO events(event_id,kind,page,site_id) VALUES(?1,?2,?3,?4)",
            params![
                event.event_id,
                event.kind.as_str(),
                event.page,
                event.site_id
            ],
        )
    })
    .await?;
    Ok(Json(json!({"accepted": true, "duplicate": inserted == 0})))
}
async fn stats(State(state): State<AppState>) -> Result<impl IntoResponse, ApiError> {
    let result = database(state, |db| {
        let count = |kind: &str| db.query_row("SELECT COUNT(*) FROM events WHERE kind=?1", [kind], |row| row.get::<_,u64>(0));
        let mut clicks_by_site = [0;6];
        let mut statement = db.prepare("SELECT site_id,COUNT(*) FROM events WHERE kind='ad_click' GROUP BY site_id")?;
        for row in statement.query_map([], |row| Ok((row.get::<_,usize>(0)?,row.get::<_,u64>(1)?)))? {
            let (site,total) = row?;
            if let Some(value) = clicks_by_site.get_mut(site) { *value = total; }
        }
        let mut statement = db.prepare("WITH RECURSIVE days(day) AS (
            SELECT date('now','+8 hours','-29 days') UNION ALL
            SELECT date(day,'+1 day') FROM days WHERE day < date('now','+8 hours')
          ) SELECT day,COUNT(e.event_id) FROM days
          LEFT JOIN events e ON e.kind='ad_click' AND date(e.created_at,'unixepoch','+8 hours')=day
            AND e.created_at >= unixepoch('now','-30 days')
          GROUP BY day ORDER BY day")?;
        let daily_clicks = statement.query_map([], |row| Ok(DayCount{date:row.get(0)?,clicks:row.get(1)?}))?.collect::<Result<Vec<_>,_>>()?;
        Ok(Stats {page_views:count("page_view")?,ad_clicks:count("ad_click")?,wallet_connections:count("wallet_connect")?,clicks_by_site,daily_clicks,timezone:"Asia/Shanghai",
            // Financial totals must come from confirmed chain events, never browser telemetry.
            financial:json!({"symbol":"$Claude","confirmed":false,"claimed_count":null,"claimed_total":null,"burned_total":null})})
    }).await?;
    Ok(([(header::CACHE_CONTROL, "no-store")], Json(result)))
}
fn router(state: AppState, dist: PathBuf) -> Router {
    Router::new()
        .route(
            "/api/health",
            get(|| async { Json(json!({"status":"ok"})) }),
        )
        .route("/api/events", post(ingest))
        .route("/api/stats", get(stats))
        .layer(DefaultBodyLimit::max(4096))
        .fallback_service(ServeDir::new(dist))
        .with_state(state)
}
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let address = std::env::var("ONHOLD_ADDR").unwrap_or_else(|_| "127.0.0.1:4190".into());
    let origin = std::env::var("ONHOLD_ORIGIN").unwrap_or_else(|_| format!("http://{address}"));
    let directory =
        PathBuf::from(std::env::var("ONHOLD_DATA_DIR").unwrap_or_else(|_| "backend/data".into()));
    let dist = PathBuf::from(std::env::var("ONHOLD_DIST_DIR").unwrap_or_else(|_| "dist".into()));
    std::fs::create_dir_all(&directory)?;
    let connection = Connection::open(directory.join("events.sqlite3"))?;
    init_db(&connection)?;
    let state = AppState {
        db: Arc::new(Mutex::new(connection)),
        origin,
    };
    let listener = tokio::net::TcpListener::bind(&address).await?;
    println!("ONHOLD Rust API + React: http://{address}");
    axum::serve(listener, router(state, dist)).await?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{body::Body, http::Request};
    use http_body_util::BodyExt;
    use tower::ServiceExt;
    fn app() -> Router {
        let db = Connection::open_in_memory().unwrap();
        init_db(&db).unwrap();
        router(
            AppState {
                db: Arc::new(Mutex::new(db)),
                origin: "http://localhost:4190".into(),
            },
            PathBuf::from("/nonexistent"),
        )
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
        let app = app();
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
        let response = app
            .oneshot(Request::get("/api/stats").body(Body::empty()).unwrap())
            .await
            .unwrap();
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let stats: Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(stats["ad_clicks"], 1);
        assert_eq!(stats["page_views"], 1);
        assert_eq!(stats["clicks_by_site"][2], 1);
        assert_eq!(stats["daily_clicks"].as_array().unwrap().len(), 30);
        assert_eq!(
            stats["daily_clicks"].as_array().unwrap().last().unwrap()["clicks"],
            1
        );
        assert!(stats["financial"]["claimed_total"].is_null());
        assert_eq!(stats["financial"]["confirmed"], false);
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
}
