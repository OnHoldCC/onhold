use crate::{ApiError, AppState};
use axum::http::StatusCode;
use redis::aio::{ConnectionManager, ConnectionManagerConfig};
use serde_json::Value;
use std::{
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc,
    },
    time::{Duration, SystemTime, UNIX_EPOCH},
};
use tokio::sync::Mutex;
use tokio_postgres::Client;
use tokio_postgres_rustls::MakeRustlsConnect;
#[derive(Clone)]
pub struct Store {
    pub read: deadpool_postgres::Pool,
    pub write: Arc<Mutex<Client>>,
    pub redis: Option<ConnectionManager>,
    pub visitor_salt: String,
    retry_after: Arc<AtomicU64>,
}
fn clock() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}
pub fn error() -> ApiError {
    ApiError(StatusCode::SERVICE_UNAVAILABLE, "database_unavailable")
}
async fn connect(url: &str) -> Result<Client, Box<dyn std::error::Error>> {
    let (client, connection) =
        tokio_postgres::connect(url, MakeRustlsConnect::with_webpki_roots()).await?;
    tokio::spawn(async move {
        let _ = connection.await;
    });
    Ok(client)
}
impl Store {
    pub async fn from_env() -> Result<Option<Self>, Box<dyn std::error::Error>> {
        let Ok(url) = std::env::var("DATABASE_URL") else {
            return Ok(None);
        };
        let write = connect(&url)
            .await
            .map_err(|_| "Unable to connect to PostgreSQL")?;
        write
            .batch_execute(include_str!("../sql/chain.sql"))
            .await
            .map_err(|_| "Unable to initialize PostgreSQL schema")?;
        write.execute("INSERT INTO analytics_settings(name,value) VALUES('visitor_salt',$1) ON CONFLICT(name) DO NOTHING",&[&uuid::Uuid::new_v4().to_string()]).await.map_err(|_|"Unable to initialize visitor salt")?;
        let visitor_salt = write
            .query_one(
                "SELECT value FROM analytics_settings WHERE name='visitor_salt'",
                &[],
            )
            .await
            .map_err(|_| "Unable to read visitor salt")?
            .get(0);
        let config: tokio_postgres::Config = url
            .parse()
            .map_err(|_| "Invalid PostgreSQL configuration")?;
        let manager =
            deadpool_postgres::Manager::new(config, MakeRustlsConnect::with_webpki_roots());
        let read = deadpool_postgres::Pool::builder(manager)
            .max_size(16)
            .build()
            .map_err(|_| "Unable to create PostgreSQL pool")?;
        let redis = match std::env::var("REDIS_URL") {
            Ok(url) => {
                let client = redis::Client::open(url).map_err(|_| "Invalid Redis configuration")?;
                Some(
                    ConnectionManager::new_with_config(
                        client,
                        ConnectionManagerConfig::new()
                            .set_number_of_retries(1)
                            .set_connection_timeout(Some(Duration::from_secs(2)))
                            .set_response_timeout(Some(Duration::from_millis(500))),
                    )
                    .await
                    .map_err(|_| "Unable to connect to Redis")?,
                )
            }
            Err(_) => None,
        };
        Ok(Some(Self {
            read,
            write: Arc::new(Mutex::new(write)),
            redis,
            visitor_salt,
            retry_after: Arc::new(AtomicU64::new(0)),
        }))
    }
    pub async fn metadata(&self, hashes: &[String]) -> Vec<Option<Value>> {
        let mut values = vec![None; hashes.len()];
        if self.retry_after.load(Ordering::Relaxed) > clock() {
            return values;
        }
        let Some(mut redis) = self.redis.clone() else {
            return values;
        };
        if hashes.is_empty() {
            return values;
        }
        let keys = hashes
            .iter()
            .map(|h| format!("onhold:nft-metadata:v3:{h}"))
            .collect::<Vec<_>>();
        if let Ok(cached) = redis::cmd("MGET")
            .arg(keys)
            .query_async::<Vec<Option<String>>>(&mut redis)
            .await
        {
            for ((target, raw), hash) in values.iter_mut().zip(cached).zip(hashes) {
                *target = raw
                    .and_then(|v| serde_json::from_str::<Value>(&v).ok())
                    .filter(|value| {
                        crate::crypto::hex(&crate::crypto::keccak(value.to_string())) == *hash
                    });
            }
        } else {
            self.retry_after.store(clock() + 30, Ordering::Relaxed);
        }
        values
    }
    pub async fn cache_metadata(&self, hash: &str, record: &Value) {
        if self.retry_after.load(Ordering::Relaxed) > clock() {
            return;
        }
        if let Some(mut redis) = self.redis.clone() {
            let _: Result<(), _> = redis::cmd("SET")
                .arg(format!("onhold:nft-metadata:v3:{hash}"))
                .arg(record.to_string())
                .arg("EX")
                .arg(86400)
                .query_async(&mut redis)
                .await;
        }
    }
}
// Existing telemetry is copied idempotently; SQLite files and legacy claims are preserved.
pub async fn import_telemetry(state: &AppState) -> Result<(), ApiError> {
    let Some(pg) = &state.pg else {
        return Ok(());
    };
    let rows = crate::database(state.clone(), |db| {
        let mut query = db.prepare(
            "SELECT event_id,kind,page,site_id,market,campaign_version,created_at,visitor_id FROM events",
        )?;
        let rows = query
            .query_map([], |r| {
                Ok((
                    r.get::<_, String>(0)?,
                    r.get::<_, String>(1)?,
                    r.get::<_, String>(2)?,
                    r.get::<_, Option<i16>>(3)?,
                    r.get::<_, Option<String>>(4)?,
                    r.get::<_, Option<i64>>(5)?,
                    r.get::<_, i64>(6)?,
                    r.get::<_, Option<String>>(7)?,
                ))
            })?
            .collect::<Result<Vec<_>, _>>()?;
        Ok(rows)
    })
    .await?;
    let mut connection = pg.write.lock().await;
    let tx = connection.transaction().await.map_err(|_| error())?;
    for r in rows {
        tx.execute("INSERT INTO analytics_events(event_id,kind,page,site_id,market,campaign_version,created_at,visitor_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(event_id) DO NOTHING",&[&r.0,&r.1,&r.2,&r.3,&r.4,&r.5,&r.6,&r.7]).await.map_err(|_|error())?;
    }
    tx.commit().await.map_err(|_| error())
}

pub async fn stats(store: &Store) -> Result<crate::analytics::Snapshot, ApiError> {
    let mut connection = store.read.get().await.map_err(|_| error())?;
    let client = connection
        .build_transaction()
        .isolation_level(tokio_postgres::IsolationLevel::RepeatableRead)
        .read_only(true)
        .start()
        .await
        .map_err(|_| error())?;
    let row=client.query_one("SELECT count(*) FILTER(WHERE kind='page_view'),count(*) FILTER(WHERE kind='ad_click'),count(*) FILTER(WHERE kind='wallet_connect'),count(DISTINCT visitor_id) FILTER(WHERE kind='page_view') FROM analytics_events",&[]).await.map_err(|_|error())?;
    let mut clicks_by_site = [0; 6];
    let mut uv_by_site = [0; 6];
    for r in client.query("SELECT site_id,count(*),count(DISTINCT visitor_id) FROM analytics_events WHERE kind='ad_click' GROUP BY site_id",&[]).await.map_err(|_|error())? {
        if let Some(site)=r.get::<_,Option<i16>>(0).filter(|v|(0..6).contains(v)) {
            clicks_by_site[site as usize]=r.get::<_,i64>(1) as u64;
            uv_by_site[site as usize]=r.get::<_,i64>(2) as u64;
        }
    }
    let daily_clicks=client.query("SELECT to_char(day,'YYYY-MM-DD'),count(e.event_id) FROM generate_series((now() AT TIME ZONE 'Asia/Shanghai')::date-29,(now() AT TIME ZONE 'Asia/Shanghai')::date,interval '1 day') day LEFT JOIN analytics_events e ON e.kind='ad_click' AND (to_timestamp(e.created_at) AT TIME ZONE 'Asia/Shanghai')::date=day::date AND e.created_at>=extract(epoch FROM now()-interval '30 days') GROUP BY day ORDER BY day",&[]).await.map_err(|_|error())?.into_iter().map(|r|crate::DayCount{date:r.get(0),clicks:r.get::<_,i64>(1) as u64}).collect();
    let mut campaigns = std::collections::BTreeMap::new();
    for r in client.query("SELECT market,site_id,campaign_version,count(*),count(DISTINCT visitor_id) FROM analytics_events WHERE kind='ad_click' AND market IS NOT NULL GROUP BY market,site_id,campaign_version",&[]).await.map_err(|_|error())? {
        campaigns.insert((r.get::<_,String>(0),r.get::<_,i16>(1) as u8,r.get::<_,i64>(2) as u64),crate::analytics::Counts{clicks:r.get::<_,i64>(3) as u64,uv:r.get::<_,i64>(4) as u64});
    }
    client.commit().await.map_err(|_| error())?;
    Ok(crate::analytics::Snapshot {
        stats: crate::Stats {
            page_views: row.get::<_, i64>(0) as u64,
            page_uv: row.get::<_, i64>(3) as u64,
            ad_clicks: row.get::<_, i64>(1) as u64,
            wallet_connections: row.get::<_, i64>(2) as u64,
            clicks_by_site,
            uv_by_site,
            daily_clicks,
            updated_at: crate::analytics::now(),
            timezone: "Asia/Shanghai".into(),
            financial: serde_json::json!({"symbol":"$Claude","confirmed":false,"claimed_count":null,"claimed_total":null,"burned_total":null}),
        },
        campaigns,
    })
}
