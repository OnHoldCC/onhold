use crate::{analytics, pg, ApiError, DayCount, Stats};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::BTreeMap;

#[derive(Serialize, Deserialize)]
struct Cached {
    ready: bool,
    stats: Stats,
    campaigns: BTreeMap<String, analytics::Counts>,
}

pub fn key(store: &pg::Store) -> String {
    format!("onhold:analytics:v1:{}", crate::crypto::hex(&crate::crypto::keccak(&store.visitor_salt)))
}

pub async fn read(store: &pg::Store) -> Option<analytics::Snapshot> {
    let mut redis = store.redis.clone()?;
    let raw = redis::cmd("HGET").arg(key(store)).arg("data")
        .query_async::<Option<String>>(&mut redis).await.ok()??;
    let cached: Cached = serde_json::from_str(&raw).ok()?;
    if !cached.ready { return None; }
    let mut campaigns = BTreeMap::new();
    for (key, counts) in cached.campaigns {
        let mut parts = key.rsplitn(3, ':');
        let version = parts.next()?.parse::<u64>().ok()?;
        let slot = parts.next()?.parse::<u8>().ok()?;
        let market = parts.next()?.to_owned();
        if slot > 5 || version == 0 { return None; }
        campaigns.insert((market, slot, version), counts);
    }
    Some(analytics::Snapshot {stats: cached.stats, campaigns})
}

pub async fn sync(store: &pg::Store) -> Result<bool, ApiError> {
    let Some(mut redis) = store.redis.clone() else { return Ok(false); };
    let mut client = store.read.get().await.map_err(|_| pg::error())?;
    let tx = client.transaction().await.map_err(|_| pg::error())?;
    // Serialize projection/rebuilds across API replicas; event inserts remain independent.
    if !tx.query_one("SELECT pg_try_advisory_xact_lock(716240913)", &[]).await.map_err(|_| pg::error())?.get::<_, bool>(0) {
        return Ok(false);
    }
    let cache_key = key(store);
    let cached:Result<(Option<String>,Option<String>),redis::RedisError>=redis::cmd("HMGET").arg(&cache_key).arg(&["generation","data"]).query_async(&mut redis).await;
    let (redis_generation, raw) = match cached {
        Ok(value)=>value,
        Err(cause) if cause.code()==Some("WRONGTYPE")=>{
            redis::cmd("DEL").arg(&cache_key).query_async::<i32>(&mut redis).await.map_err(|_|pg::error())?;
            (None,None)
        }
        Err(_)=>return Err(pg::error()),
    };
    let valid = raw.and_then(|v|serde_json::from_str::<Cached>(&v).ok()).is_some();
    let stored = tx.query_opt("SELECT value FROM analytics_settings WHERE name='redis_generation'", &[])
        .await.map_err(|_| pg::error())?.map(|r| r.get::<_, String>(0));
    let generation = if !valid || stored.is_none() || stored != redis_generation {
        let generation = uuid::Uuid::new_v4().to_string();
        tx.execute("UPDATE analytics_events SET redis_pending=true WHERE NOT redis_pending", &[]).await.map_err(|_| pg::error())?;
        tx.execute("INSERT INTO analytics_settings(name,value) VALUES('redis_generation',$1) ON CONFLICT(name) DO UPDATE SET value=excluded.value", &[&generation]).await.map_err(|_| pg::error())?;
        generation
    } else { stored.unwrap() };
    let calendar = tx.query("SELECT to_char(day,'YYYY-MM-DD') FROM generate_series((now() AT TIME ZONE 'Asia/Shanghai')::date-29,(now() AT TIME ZONE 'Asia/Shanghai')::date,interval '1 day') day ORDER BY day", &[])
        .await.map_err(|_| pg::error())?.into_iter().map(|r| DayCount {date:r.get(0),clicks:0}).collect::<Vec<_>>();
    let initial = Cached {
        ready:false,
        stats:Stats {page_views:0,page_uv:0,ad_clicks:0,wallet_connections:0,clicks_by_site:[0;6],uv_by_site:[0;6],updated_at:analytics::now(),daily_clicks:calendar.clone(),timezone:"Asia/Shanghai".into(),financial:json!({"symbol":"$Claude","confirmed":false,"claimed_count":null,"claimed_total":null,"burned_total":null})},
        campaigns:BTreeMap::new(),
    };
    let rows = tx.query("SELECT event_id,kind,site_id,market,campaign_version,visitor_id,to_char(to_timestamp(created_at) AT TIME ZONE 'Asia/Shanghai','YYYY-MM-DD') FROM analytics_events WHERE redis_pending ORDER BY created_at,event_id LIMIT 1000", &[])
        .await.map_err(|_| pg::error())?;
    let mut ids = Vec::<String>::new();
    let mut events = Vec::new();
    for row in &rows {
        let id:String=row.get(0);
        let site:Option<i16>=row.get(2);
        let market:Option<String>=row.get(3);
        let version:Option<i64>=row.get(4);
        let campaign=market.zip(version).zip(site).map(|((m,v),s)|format!("{m}:{s}:{v}"));
        events.push(json!({"id":id,"kind":row.get::<_,String>(1),"site":site,"campaign":campaign,"visitor":row.get::<_,Option<String>>(5),"day":row.get::<_,String>(6)}));
        ids.push(id);
    }
    let ready:i32=redis::cmd("EVAL").arg(include_str!("analytics-cache.lua")).arg(1).arg(&cache_key)
        .arg(&generation).arg(serde_json::to_string(&initial).map_err(|_| pg::error())?)
        .arg(serde_json::to_string(&calendar).map_err(|_| pg::error())?).arg(serde_json::to_string(&events).map_err(|_| pg::error())?)
        .arg(analytics::now()).arg(if rows.len()<1000 {"1"}else{"0"})
        .query_async(&mut redis).await.map_err(|_| pg::error())?;
    if !ids.is_empty() {
        tx.execute("UPDATE analytics_events SET redis_pending=false WHERE event_id=ANY($1)", &[&ids]).await.map_err(|_| pg::error())?;
    }
    tx.commit().await.map_err(|_| pg::error())?;
    if !ids.is_empty() {
        // Keep replay guards until the database acknowledgement commits.
        let fields=ids.iter().map(|id|format!("event:{id}")).collect::<Vec<_>>();
        let _:Result<i32,_>=redis::cmd("EVAL").arg("if redis.call('HGET',KEYS[1],'generation')~=ARGV[1] then return 0 end; return redis.call('HDEL',KEYS[1],unpack(ARGV,2))")
            .arg(1).arg(cache_key).arg(generation).arg(fields).query_async(&mut redis).await;
    }
    Ok(ready==1)
}
