use crate::{mining, stats, ApiError, AppState};
use axum::{body::{to_bytes, Body, Bytes}, extract::{Query, Request, State}, http::{header, HeaderMap, Method, StatusCode}, middleware::Next, response::{Html, IntoResponse, Response}, Json};
use serde_json::{json, Value};
use std::{future::Future, sync::Arc, time::{Duration, Instant, SystemTime, UNIX_EPOCH}};
use tokio::sync::{Mutex, Notify};

const FRESH: Duration = Duration::from_secs(5);
const RETAIN: Duration = Duration::from_secs(15);
const PERIODS: [&str; 6] = ["1h", "4h", "1d", "7d", "30d", "90d"];
#[derive(Default)]
struct Slot { state: Mutex<SlotState>, changed: Notify }
#[derive(Default)]
struct SlotState { value: Option<Entry>, refreshing: bool, generation: u64 }
struct Entry { at: Instant, headers: HeaderMap, body: Bytes }
#[derive(Default)]
pub struct Cache { slots: [Slot; 12] }

fn eligible(request: &Request, market: Option<&str>) -> Option<usize> {
    if request.method()!=Method::GET || request.headers().contains_key(header::AUTHORIZATION) || request.headers().contains_key(header::COOKIE) { return None; }
    let query=request.uri().query().unwrap_or("");
    match request.uri().path() {
        "/api/stats" if query.is_empty()=>Some(1),
        "/api/chain" if query.is_empty() || query.strip_prefix("market=").zip(market).is_some_and(|(a,b)|a.starts_with("0x")&&a.eq_ignore_ascii_case(b))=>Some(2),
        "/api/burn" if query.is_empty()=>Some(3),
        "/api/ads" if matches!(query,""|"page=1")=>Some(4),
        "/api/nfts" if matches!(query,""|"page=1"|"tier=all"|"tier=all&page=1"|"page=1&tier=all")=>Some(5),
        "/api/mining-stats"=>PERIODS.iter().position(|period|query==format!("period={period}") || (query.is_empty()&&*period=="1d")).map(|i|i+6),
        _=>None,
    }
}
fn valid(value: &Value, key: usize) -> bool {
    if key==0 { return value["version"]==1 && value["paths"].as_object().is_some_and(|parts|parts.len()==3&&parts.values().all(|v|valid(v,1))); }
    value.is_object() && value.get("error").is_none() && value["available"]!=false && value["configured"]!=false
}
impl Entry {
    fn response(&self, status: &'static str)->Response {
        let mut response=Response::new(Body::from(self.body.clone()));
        *response.headers_mut()=self.headers.clone();
        response.headers_mut().insert("x-response-cache",status.parse().unwrap());
        response.headers_mut().insert(header::AGE,self.at.elapsed().as_secs().to_string().parse().unwrap());
        response
    }
}
impl Cache {
    async fn refresh<F:Future<Output=Response>+Send+'static>(self:Arc<Self>, key:usize, generation:u64, load:F)->Response {
        let response=tokio::spawn(async move {tokio::time::timeout(Duration::from_secs(3),load).await}).await.ok().and_then(Result::ok).unwrap_or_else(||(StatusCode::SERVICE_UNAVAILABLE,Json(json!({"error":"read_unavailable"}))).into_response());
        let (mut parts,body)=response.into_parts();
        // These handlers already construct bounded public JSON pages in memory.
        let bytes=to_bytes(body,usize::MAX).await.unwrap_or_default();
        let value=serde_json::from_slice::<Value>(&bytes).ok();
        let reusable=parts.status==StatusCode::OK && !parts.headers.contains_key(header::SET_COOKIE) && bytes.len()<=1024*1024 && value.as_ref().is_some_and(|v|valid(v,key));
        parts.headers.insert("x-response-cache","MISS".parse().unwrap());
        parts.headers.insert(header::CACHE_CONTROL,if reusable {"public, max-age=0, s-maxage=5, stale-while-revalidate=10"}else{"no-store"}.parse().unwrap());
        let mut state=self.slots[key].state.lock().await;
        if reusable && state.generation==generation { state.value=Some(Entry{at:Instant::now(),headers:parts.headers.clone(),body:bytes.clone()}); }
        state.refreshing=false;drop(state);self.slots[key].changed.notify_waiters();
        Response::from_parts(parts,Body::from(bytes))
    }
    async fn get<F,Fut>(self:Arc<Self>,key:usize,fresh:bool,load:F)->Response where F:FnOnce()->Fut+Send+'static,Fut:Future<Output=Response>+Send+'static {
        let requested=Instant::now();let mut load=Some(load);
        loop {
            let mut state=self.slots[key].state.lock().await;
            if let Some(entry)=&state.value {
                if entry.at.elapsed()<FRESH && (!fresh||entry.at>=requested) {return entry.response("HIT");}
                if !fresh && entry.at.elapsed()<RETAIN {
                    let response=entry.response("STALE");
                    if !state.refreshing {state.refreshing=true;let generation=state.generation;let cache=self.clone();let task=load.take().unwrap();tokio::spawn(async move{cache.refresh(key,generation,task()).await;});}
                    return response;
                }
            }
            if state.refreshing {let changed=self.slots[key].changed.notified();drop(state);changed.await;continue;}
            state.refreshing=true;let generation=state.generation;drop(state);
            return self.clone().refresh(key,generation,load.take().unwrap()()).await;
        }
    }
    pub async fn invalidate(&self) {for slot in &self.slots {let mut state=slot.state.lock().await;state.generation+=1;state.value=None;}}
}
fn fresh(headers:&HeaderMap)->bool {headers.get(header::CACHE_CONTROL).and_then(|v|v.to_str().ok()).is_some_and(|v|v.contains("no-cache"))}
pub async fn middleware(State(state):State<AppState>,request:Request,next:Next)->Response {
    let start=Instant::now();let api=request.uri().path().starts_with("/api/");
    let invalidate=request.method()==Method::POST && matches!(request.uri().path(),"/api/nft/receipt"|"/api/nft/authorize");
    let key=eligible(&request,state.mining.as_ref().map(|t|t.market.as_str()));
    let mut response=if let Some(key)=key {state.public_cache.clone().get(key,fresh(request.headers()),move||async move{next.run(request).await}).await}else{next.run(request).await};
    if invalidate && response.status().is_success(){state.public_cache.invalidate().await;}
    if api {
        response.headers_mut().insert("server-timing",format!("app;dur={:.3}",start.elapsed().as_secs_f64()*1000.).parse().unwrap());
        if !response.headers().contains_key(header::CACHE_CONTROL){response.headers_mut().insert(header::CACHE_CONTROL,"no-store".parse().unwrap());}
    }
    response
}
async fn value(response:Response)->Result<Value,ApiError>{
    if !response.status().is_success(){return Err(crate::internal());}
    serde_json::from_slice(&to_bytes(response.into_body(),1024*1024).await.map_err(|_|crate::internal())?).map_err(|_|crate::internal())
}
async fn home_value(state:AppState)->Result<Value,ApiError>{
    let market=state.mining.as_ref().map(|t|t.market.clone()).ok_or_else(crate::internal)?;
    let query=serde_json::from_value(json!({"market":market})).map_err(|_|crate::internal())?;
    let period=serde_json::from_value(json!({"period":"30d"})).map_err(|_|crate::internal())?;
    let (stats,chain,history)=tokio::try_join!(stats(State(state.clone())),mining::snapshot(State(state.clone()),Query(query)),mining::network_stats(State(state),Query(period)))?;
    let (stats,chain,history)=tokio::try_join!(value(stats.into_response()),value(chain.into_response()),value(history.into_response()))?;
    let now=SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_millis() as u64;
    let mut paths=serde_json::Map::new();paths.insert("/api/stats".into(),stats);paths.insert(format!("/api/chain?market={}",market.to_lowercase()),chain);paths.insert("/api/mining-stats?period=30d".into(),history);
    Ok(json!({"version":1,"capturedAt":now,"paths":paths}))
}
async fn home_response(state:AppState,fresh:bool)->Response {
    state.public_cache.clone().get(0,fresh,move||async move{match home_value(state).await {Ok(value)=>Json(value).into_response(),Err(error)=>error.into_response()}}).await
}
pub async fn home(State(state):State<AppState>,headers:HeaderMap,uri:axum::http::Uri)->Response {
    if uri.query().is_some(){return (StatusCode::BAD_REQUEST,Json(json!({"error":"invalid_query"}))).into_response();}
    home_response(state,fresh(&headers)).await
}
pub async fn html(state:AppState,template:Arc<str>)->Response {
    let start=Instant::now();let response=home_response(state,false).await;
    let snapshot=value(response).await.ok().filter(|v|valid(v,0));
    let html=if let Some(snapshot)=snapshot {let safe=snapshot.to_string().replace('<',"\\u003c");template.replace("</head>",&format!("<script id=\"onhold-home-data\" type=\"application/json\">{safe}</script></head>"))}else{template.to_string()};
    let mut response=Html(html).into_response();response.headers_mut().insert("server-timing",format!("home;dur={:.3}",start.elapsed().as_secs_f64()*1000.).parse().unwrap());response
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize,Ordering};
    async fn body(response:Response)->Value {serde_json::from_slice(&to_bytes(response.into_body(),usize::MAX).await.unwrap()).unwrap()}
    #[test]
    fn only_known_public_queries_can_share_entries(){
        let market="0x1111111111111111111111111111111111111111";
        for path in ["/api/chain?wallet=a","/api/chain?market=other","/api/chain?market=0x1111111111111111111111111111111111111111&wallet=x","/api/nfts?wallet=x&position=owned","/api/nfts?page=2","/api/stats?user=x","/api/mining-stats?period=2d","/api/verify"] {assert!(eligible(&Request::get(path).body(Body::empty()).unwrap(),Some(market)).is_none(),"{path}");}
        assert_eq!(eligible(&Request::get(format!("/api/chain?market={market}")).body(Body::empty()).unwrap(),Some(market)),Some(2));
        for name in [header::AUTHORIZATION,header::COOKIE] {assert!(eligible(&Request::get("/api/stats").header(name,"private").body(Body::empty()).unwrap(),Some(market)).is_none());}
    }
    #[tokio::test]
    async fn cold_burst_and_stale_burst_each_trigger_one_refresh(){
        let cache=Arc::new(Cache::default());let calls=Arc::new(AtomicUsize::new(0));
        for expected in [1,2] {
            if expected==2 {cache.slots[1].state.lock().await.value.as_mut().unwrap().at=Instant::now()-Duration::from_secs(6);}
            let mut tasks=Vec::new();
            for _ in 0..20 {let cache=cache.clone();let calls=calls.clone();tasks.push(tokio::spawn(async move{cache.get(1,false,move||async move{let n=calls.fetch_add(1,Ordering::SeqCst)+1;tokio::time::sleep(Duration::from_millis(25)).await;Json(json!({"n":n})).into_response()}).await}));}
            for task in tasks {let response=task.await.unwrap();if expected==2 {assert_eq!(response.headers()["x-response-cache"],"STALE");}assert_eq!(body(response).await["n"],1);}
            tokio::time::sleep(Duration::from_millis(50)).await;assert_eq!(calls.load(Ordering::SeqCst),expected);
        }
        assert_eq!(body(cache.clone().get(1,false,||async{panic!("must hit cache")}).await).await["n"],2);
    }
    #[tokio::test]
    async fn errors_do_not_replace_valid_snapshots_and_expired_data_is_not_served(){
        let cache=Arc::new(Cache::default());
        cache.clone().get(1,false,||async{Json(json!({"n":1})).into_response()}).await;
        cache.slots[1].state.lock().await.value.as_mut().unwrap().at=Instant::now()-Duration::from_secs(6);
        assert_eq!(body(cache.clone().get(1,false,||async{StatusCode::SERVICE_UNAVAILABLE.into_response()}).await).await["n"],1);
        tokio::time::sleep(Duration::from_millis(20)).await;
        assert_eq!(serde_json::from_slice::<Value>(&cache.slots[1].state.lock().await.value.as_ref().unwrap().body).unwrap()["n"],1);
        cache.slots[1].state.lock().await.value.as_mut().unwrap().at=Instant::now()-Duration::from_secs(16);
        assert_eq!(cache.clone().get(1,false,||async{StatusCode::SERVICE_UNAVAILABLE.into_response()}).await.status(),StatusCode::SERVICE_UNAVAILABLE);
    }
    #[tokio::test]
    async fn invalidation_prevents_an_old_inflight_refresh_from_repopulating_cache(){
        let cache=Arc::new(Cache::default());let task_cache=cache.clone();
        let task=tokio::spawn(async move{task_cache.get(1,false,||async{tokio::time::sleep(Duration::from_millis(30)).await;Json(json!({"n":1})).into_response()}).await});
        tokio::time::sleep(Duration::from_millis(10)).await;cache.invalidate().await;task.await.unwrap();assert!(cache.slots[1].state.lock().await.value.is_none());
    }
    #[tokio::test]
    async fn confirmed_snapshot_preserves_source_staleness_when_cached(){
        let cache=Arc::new(Cache::default());
        let source=json!({"available":true,"configured":true,"stale":true,"confirmedBlock":42});
        let original=source.clone();
        assert_eq!(body(cache.clone().get(2,false,move||async move{Json(source).into_response()}).await).await,original);
        let hit=cache.get(2,false,||async{panic!("must hit confirmed snapshot")}).await;
        assert_eq!(hit.headers()["x-response-cache"],"HIT");assert_eq!(body(hit).await,original);
    }
    #[test]
    fn unsafe_or_unavailable_responses_are_not_cacheable(){for value in [json!({"available":false}),json!({"configured":false}),json!({"error":"unavailable"}),Value::Null] {assert!(!valid(&value,1));}}
}

#[cfg(test)]
mod html_tests {
    use super::*;
    #[tokio::test]
    async fn embedded_public_snapshot_round_trips_without_script_injection(){
        let (_,state)=crate::tests::app_with_state();
        let malicious="</script><script>alert('x')</script>";
        let snapshot=json!({"version":1,"capturedAt":1,"paths":{"/api/stats":{"text":malicious},"/api/chain?market=x":{"available":true},"/api/mining-stats?period=30d":{"available":true}}});
        state.public_cache.slots[0].state.lock().await.value=Some(Entry{at:Instant::now(),headers:HeaderMap::new(),body:Bytes::from(snapshot.to_string())});
        let response=html(state,Arc::from("<html><head></head><body></body></html>")).await;
        let text=String::from_utf8(to_bytes(response.into_body(),usize::MAX).await.unwrap().to_vec()).unwrap();
        assert_eq!(text.matches("</script>").count(),1);assert!(!text.contains(malicious));
        let encoded=text.split("type=\"application/json\">").nth(1).unwrap().split("</script>").next().unwrap();
        assert_eq!(serde_json::from_str::<Value>(encoded).unwrap(),snapshot);
    }
}
