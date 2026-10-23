use crate::{crypto, database, internal, pg, ApiError, AppState, DayCount, Stats};
use axum::http::{HeaderMap, StatusCode};
use rusqlite::Connection;
use serde_json::{json, Value};
use serde::{Serialize, Deserialize};
use std::{
    collections::BTreeMap,
    net::IpAddr,
    sync::{Arc, Mutex},
    time::{Duration, SystemTime, UNIX_EPOCH},
};

pub const REFRESH_INTERVAL: Duration = Duration::from_secs(15 * 60);
pub type Cache = Arc<Mutex<Option<Arc<Snapshot>>>>;

#[derive(Clone, Default, Serialize, Deserialize)]
pub struct Counts {
    pub clicks: u64,
    pub uv: u64,
}

#[derive(Clone)]
pub struct Snapshot {
    pub stats: Stats,
    pub campaigns: BTreeMap<(String, u8, u64), Counts>,
}

pub fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

fn normalized(ip: IpAddr) -> IpAddr {
    match ip {
        IpAddr::V6(v) => v.to_ipv4_mapped().map(IpAddr::V4).unwrap_or(ip),
        _ => ip,
    }
}

#[derive(Clone, Copy)]
pub struct TrustedProxy { address: IpAddr, prefix: u8 }

impl std::str::FromStr for TrustedProxy {
    type Err = &'static str;
    fn from_str(value: &str) -> Result<Self, Self::Err> {
        let (address, prefix) = value.split_once('/').map_or((value, None), |(a, p)| (a, Some(p)));
        let address: IpAddr = address.parse().map_err(|_| "Invalid proxy IP address")?;
        let bits = if address.is_ipv4() { 32 } else { 128 };
        let prefix = prefix.map(|p| p.parse::<u8>()).transpose().map_err(|_| "Invalid proxy prefix")?.unwrap_or(bits);
        if prefix > bits { return Err("Invalid proxy prefix"); }
        Ok(Self { address, prefix })
    }
}

impl TrustedProxy {
    fn contains(&self, ip: IpAddr) -> bool {
        match (self.address, normalized(ip)) {
            (IpAddr::V4(a), IpAddr::V4(b)) => u32::from(a).checked_shr(32 - self.prefix as u32).unwrap_or(0) == u32::from(b).checked_shr(32 - self.prefix as u32).unwrap_or(0),
            (IpAddr::V6(a), IpAddr::V6(b)) => u128::from(a).checked_shr(128 - self.prefix as u32).unwrap_or(0) == u128::from(b).checked_shr(128 - self.prefix as u32).unwrap_or(0),
            _ => false,
        }
    }
}

pub fn visitor_id(peer: IpAddr, headers: &HeaderMap, trusted: &[TrustedProxy], salt: &str) -> String {
    let peer = normalized(peer);
    let mut ip = peer;
    // Only configured proxy peers may supply IPs; walk from the trusted end of the chain.
    if trusted.iter().any(|proxy| proxy.contains(ip)) {
        if let Some(value) = headers.get("x-forwarded-for").and_then(|v| v.to_str().ok()) {
            for part in value.rsplit(',') {
                if !trusted.iter().any(|proxy| proxy.contains(ip)) {
                    break;
                }
                match part.trim().parse::<IpAddr>() {
                    Ok(next) => ip = normalized(next),
                    Err(_) => {
                        ip = peer;
                        break;
                    }
                }
            }
        }
    }
    crypto::hex(&crypto::keccak(format!("{salt}\0{ip}")))
}

pub fn cached(state: &AppState) -> Result<Arc<Snapshot>, ApiError> {
    state
        .analytics
        .lock()
        .map_err(|_| internal())?
        .clone()
        .ok_or(ApiError(
            StatusCode::SERVICE_UNAVAILABLE,
            "analytics_unavailable",
        ))
}

pub fn sqlite_snapshot(db: &Connection) -> rusqlite::Result<Snapshot> {
    let count = |kind: &str| {
        db.query_row("SELECT COUNT(*) FROM events WHERE kind=?1", [kind], |r| {
            r.get::<_, u64>(0)
        })
    };
    let mut clicks_by_site = [0; 6];
    let mut uv_by_site = [0; 6];
    let mut statement = db.prepare("SELECT site_id,COUNT(*),COUNT(DISTINCT visitor_id) FROM events WHERE kind='ad_click' GROUP BY site_id")?;
    for row in statement.query_map([], |r| {
        Ok((
            r.get::<_, usize>(0)?,
            r.get::<_, u64>(1)?,
            r.get::<_, u64>(2)?,
        ))
    })? {
        let (site, clicks, uv) = row?;
        if site < 6 {
            clicks_by_site[site] = clicks;
            uv_by_site[site] = uv;
        }
    }
    let mut statement = db.prepare("WITH RECURSIVE days(day) AS (
        SELECT date('now','+8 hours','-29 days') UNION ALL
        SELECT date(day,'+1 day') FROM days WHERE day < date('now','+8 hours')
        ) SELECT day,COUNT(e.event_id) FROM days LEFT JOIN events e ON e.kind='ad_click'
        AND date(e.created_at,'unixepoch','+8 hours')=day AND e.created_at>=unixepoch('now','-30 days') GROUP BY day ORDER BY day")?;
    let daily_clicks = statement
        .query_map([], |r| {
            Ok(DayCount {
                date: r.get(0)?,
                clicks: r.get(1)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;
    let mut campaigns = BTreeMap::new();
    let mut statement = db.prepare("SELECT market,site_id,campaign_version,COUNT(*),COUNT(DISTINCT visitor_id) FROM events WHERE kind='ad_click' AND market IS NOT NULL GROUP BY market,site_id,campaign_version")?;
    for row in statement.query_map([], |r| {
        Ok((
            (
                r.get::<_, String>(0)?,
                r.get::<_, u8>(1)?,
                r.get::<_, u64>(2)?,
            ),
            Counts {
                clicks: r.get(3)?,
                uv: r.get(4)?,
            },
        ))
    })? {
        let (key, value) = row?;
        campaigns.insert(key, value);
    }
    Ok(Snapshot {
        stats: Stats {
            page_views: count("page_view")?,
            page_uv: db.query_row("SELECT COUNT(DISTINCT visitor_id) FROM events WHERE kind='page_view'", [], |r| r.get(0))?,
            ad_clicks: count("ad_click")?,
            wallet_connections: count("wallet_connect")?,
            clicks_by_site,
            uv_by_site,
            daily_clicks,
            updated_at: now(),
            timezone: "Asia/Shanghai".into(),
            financial: json!({"symbol":"$OnHold","confirmed":false,"claimed_count":null,"claimed_total":null,"burned_total":null}),
        },
        campaigns,
    })
}

pub async fn read(state: &AppState) -> Result<(Arc<Snapshot>, &'static str), ApiError> {
    if let Some(store) = &state.pg {
        if let Some(snapshot) = crate::analytics_cache::read(store).await {
            return Ok((Arc::new(snapshot), "redis"));
        }
        return Ok((Arc::new(pg::stats(store).await?), "postgresql"));
    }
    Ok((cached(state)?, "memory"))
}

pub async fn refresh(state: &AppState) -> Result<(), ApiError> {
    if let Some(store) = &state.pg {
        if crate::analytics_cache::sync(store).await.is_err() {
            eprintln!("Analytics Redis sync deferred; database events retained for replay");
        }
    }
    let snapshot = if state.pg.is_some() {
        read(state).await?.0
    } else {
        Arc::new(database(state.clone(), sqlite_snapshot).await?)
    };
    *state.analytics.lock().map_err(|_| internal())? = Some(snapshot);
    Ok(())
}

pub async fn run(state: AppState) {
    let interval = if state.pg.as_ref().is_some_and(|s|s.redis.is_some()) { Duration::from_secs(2) } else { REFRESH_INTERVAL };
    let mut timer = tokio::time::interval_at(tokio::time::Instant::now() + interval, interval);
    timer.set_missed_tick_behavior(tokio::time::MissedTickBehavior::Skip);
    loop {
        timer.tick().await;
        if refresh(&state).await.is_err() {
            eprintln!("Analytics aggregation failed; retaining previous snapshot");
        }
    }
}

pub fn apply_campaigns(snapshot: &Snapshot, market: &str, ads: &mut [Value]) {
    for ad in ads {
        let key = (
            market.to_string(),
            ad["id"].as_u64().unwrap_or(0) as u8,
            ad["version"]
                .as_str()
                .and_then(|v| v.parse().ok())
                .unwrap_or(0),
        );
        let counts = snapshot.campaigns.get(&key).cloned().unwrap_or_default();
        ad["clicks"] = json!(counts.clicks);
        ad["uv"] = json!(counts.uv);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn cidr_proxies_unwrap_cloudflare_without_trusting_forged_client_prefixes() {
        let trusted = ["10.42.0.1", "104.16.0.0/13", "2606:4700::/32"].map(|v| v.parse().unwrap());
        let mut headers = HeaderMap::new();
        let client = "198.51.100.7".parse().unwrap();
        let expected = visitor_id(client, &HeaderMap::new(), &[], "secret");
        for edge in ["104.16.1.2", "2606:4700::1234"] {
            headers.insert("x-forwarded-for", format!("192.0.2.66, {client}, {edge}").parse().unwrap());
            assert_eq!(visitor_id("10.42.0.1".parse().unwrap(), &headers, &trusted, "secret"), expected);
            assert_eq!(visitor_id(client, &headers, &trusted, "secret"), expected);
        }
        headers.insert("x-forwarded-for", "198.51.100.8, 104.16.1.2".parse().unwrap());
        assert_ne!(visitor_id("10.42.0.1".parse().unwrap(), &headers, &trusted, "secret"), expected);
        for invalid in ["104.16.0.0/33", "2606:4700::/129", "10.42.0.1/-1", "10.42.0.1/", "not-an-ip", "10.42.0.1/8/9"] {
            assert!(invalid.parse::<TrustedProxy>().is_err());
        }
        for (network, inside, outside) in [("104.16.0.0/13", "104.23.255.255", "104.24.0.0"), ("2606:4700::/32", "2606:4700:ffff::1", "2606:4701::1"), ("10.42.0.1", "10.42.0.1", "10.42.0.2")] {
            let proxy: TrustedProxy = network.parse().unwrap();
            assert!(proxy.contains(inside.parse().unwrap()));
            assert!(!proxy.contains(outside.parse().unwrap()));
        }
        assert!("0.0.0.0/0".parse::<TrustedProxy>().unwrap().contains(client));
        assert!("::/0".parse::<TrustedProxy>().unwrap().contains("::1".parse().unwrap()));
    }
    #[test]
    fn proxy_headers_require_trust_and_ipv4_mapped_addresses_deduplicate() {
        let peer = "127.0.0.1".parse().unwrap();
        let mut headers = HeaderMap::new();
        headers.insert(
            "x-forwarded-for",
            "198.51.100.7, 203.0.113.8".parse().unwrap(),
        );
        assert_eq!(
            visitor_id(peer, &headers, &[], "secret"),
            visitor_id(peer, &HeaderMap::new(), &[], "secret")
        );
        assert_eq!(
            visitor_id(peer, &headers, &["127.0.0.1".parse().unwrap()], "secret"),
            visitor_id(
                "203.0.113.8".parse().unwrap(),
                &HeaderMap::new(),
                &[],
                "secret"
            )
        );
        assert_eq!(
            visitor_id(
                peer,
                &headers,
                &["127.0.0.1".parse().unwrap(), "203.0.113.8".parse().unwrap()],
                "secret"
            ),
            visitor_id(
                "198.51.100.7".parse().unwrap(),
                &HeaderMap::new(),
                &[],
                "secret"
            )
        );
        assert_eq!(
            visitor_id(peer, &HeaderMap::new(), &[], "secret"),
            visitor_id(
                "::ffff:127.0.0.1".parse().unwrap(),
                &HeaderMap::new(),
                &[],
                "secret"
            )
        );
        assert_ne!(
            visitor_id(peer, &headers, &[], "secret"),
            visitor_id(peer, &headers, &[], "other secret")
        );
    }
    #[test]
    fn counts_unique_ips_per_campaign_without_inventing_legacy_uv_or_mutating_cached_counts() {
        let db = Connection::open_in_memory().unwrap();
        crate::init_db(&db).unwrap();
        for (id, version, visitor) in [
            ("a", 1, Some("ip1")),
            ("b", 1, Some("ip1")),
            ("c", 1, Some("ip2")),
            ("d", 2, Some("ip1")),
            ("legacy", 1, None),
        ] {
            db.execute("INSERT INTO events(event_id,kind,page,site_id,market,campaign_version,visitor_id) VALUES(?1,'ad_click','home',0,'market',?2,?3)",rusqlite::params![id,version,visitor]).unwrap();
        }
        let snapshot = sqlite_snapshot(&db).unwrap();
        assert_eq!(snapshot.stats.clicks_by_site[0], 5);
        assert_eq!(snapshot.stats.uv_by_site[0], 2);
        let mut ads = vec![json!({"id":0,"version":"1"}), json!({"id":0,"version":"2"})];
        apply_campaigns(&snapshot, "market", &mut ads);
        assert_eq!(ads[0]["clicks"], 4);
        assert_eq!(ads[0]["uv"], 2);
        assert_eq!(ads[1]["uv"], 1);
        db.execute("INSERT INTO events(event_id,kind,page,site_id,visitor_id) VALUES('next','ad_click','home',0,'ip3')",[]).unwrap();
        assert_eq!(snapshot.stats.uv_by_site[0], 2);
        assert_eq!(sqlite_snapshot(&db).unwrap().stats.uv_by_site[0], 3);
        crate::init_db(&db).unwrap();
        assert_eq!(sqlite_snapshot(&db).unwrap().stats.clicks_by_site[0], 6);
        assert_eq!(REFRESH_INTERVAL.as_secs(), 900);
    }
}
