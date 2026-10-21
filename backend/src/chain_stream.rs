use crate::{burn, claims::rpc, crypto, mining, ApiError, AppState};
use axum::http::StatusCode;
use futures_util::{SinkExt, StreamExt};
use serde_json::{json, Value};
use std::{
    collections::BTreeMap,
    time::{Duration, Instant},
};
use tokio_tungstenite::{connect_async, tungstenite::Message};
fn error(code: &'static str) -> ApiError {
    ApiError(StatusCode::BAD_GATEWAY, code)
}
fn number(v: &Value) -> Result<u64, ApiError> {
    v.as_str()
        .and_then(|s| s.strip_prefix("0x"))
        .and_then(|s| u64::from_str_radix(s, 16).ok())
        .ok_or_else(|| error("invalid_chain_response"))
}
pub fn endpoint() -> Result<String, Box<dyn std::error::Error>> {
    let value = std::env::var("ONHOLD_CHAIN_WS_URL")
        .map_err(|_| "Set ONHOLD_CHAIN_WS_URL for market and burn indexing")?;
    let url = reqwest::Url::parse(&value)?;
    if url.scheme() != "wss"
        && !(url.scheme() == "ws" && matches!(url.host_str(), Some("127.0.0.1" | "localhost")))
    {
        return Err("Use a secure WebSocket provider".into());
    }
    Ok(value)
}
struct Buffer {
    cursor: u64,
    floor: u64,
    headers: BTreeMap<u64, Value>,
    logs: BTreeMap<(u64, u64), Value>,
    addresses: Vec<String>,
    live: bool,
}
impl Buffer {
    fn new(header: Value, addresses: Vec<String>) -> Result<Self, ApiError> {
        let cursor = number(&header["number"])?;
        crypto::bytes(header["hash"].as_str().unwrap_or(""), 32)
            .map_err(|_| error("invalid_chain_response"))?;
        Ok(Self {
            cursor,
            floor: cursor,
            headers: BTreeMap::from([(cursor, header)]),
            logs: BTreeMap::new(),
            addresses,
            live: false,
        })
    }
    fn header(&mut self, header: Value) -> Result<(), ApiError> {
        let n = number(&header["number"])?;
        crypto::bytes(header["hash"].as_str().unwrap_or(""), 32)
            .map_err(|_| error("invalid_chain_response"))?;
        number(&header["timestamp"])?;
        if let Some(saved) = self.headers.get(&n) {
            return if saved["hash"] == header["hash"] {
                Ok(())
            } else {
                Err(error("chain_reorg"))
            };
        }
        if n <= self.cursor {
            return if self.live {
                Err(error("chain_reorg"))
            } else {
                Ok(())
            };
        }
        let (last, prior) = self
            .headers
            .last_key_value()
            .ok_or_else(|| error("ws_head_gap"))?;
        if n != last + 1 {
            return Err(error("ws_head_gap"));
        }
        if header["parentHash"] != prior["hash"] {
            return Err(error("chain_reorg"));
        }
        self.headers.insert(n, header);
        self.live = true;
        if self.headers.len() > 4096 {
            return Err(error("ws_buffer_full"));
        }
        Ok(())
    }
    fn log(&mut self, log: Value) -> Result<(), ApiError> {
        if log["removed"] == true {
            return Err(error("chain_reorg"));
        }
        let address = log["address"]
            .as_str()
            .ok_or_else(|| error("invalid_chain_response"))?
            .to_lowercase();
        if !self.addresses.contains(&address) {
            return Err(error("invalid_log_address"));
        }
        let key = (number(&log["blockNumber"])?, number(&log["logIndex"])?);
        crypto::bytes(log["blockHash"].as_str().unwrap_or(""), 32)
            .map_err(|_| error("invalid_chain_response"))?;
        crypto::bytes(log["transactionHash"].as_str().unwrap_or(""), 32)
            .map_err(|_| error("invalid_chain_response"))?;
        if let Some(saved) = self.logs.get(&key) {
            if ["blockHash", "transactionHash", "topics", "data"]
                .iter()
                .any(|k| saved[*k] != log[*k])
            {
                return Err(error("chain_reorg"));
            }
            return Ok(());
        }
        if key.0 <= self.floor {
            return Ok(());
        }
        // A late unseen log must replay the projection; silently ignoring it would lose an event.
        if key.0 <= self.cursor {
            return Err(error("ws_late_log"));
        }
        let mut log = log;
        log["address"] = json!(address);
        self.logs.insert(key, log);
        if self.logs.len() > 50000 {
            return Err(error("ws_buffer_full"));
        }
        Ok(())
    }
    fn ready(&self) -> Result<Option<(Value, Vec<Value>)>, ApiError> {
        let head = *self
            .headers
            .last_key_value()
            .ok_or_else(|| error("ws_head_gap"))?
            .0;
        let to = head.saturating_sub(3);
        if to <= self.cursor {
            return Ok(None);
        }
        let header = self
            .headers
            .get(&to)
            .ok_or_else(|| error("ws_head_gap"))?
            .clone();
        let mut logs = Vec::new();
        for ((n, _), log) in self.logs.range((self.cursor + 1, 0)..=(to, u64::MAX)) {
            if self
                .headers
                .get(n)
                .is_none_or(|h| h["hash"] != log["blockHash"])
            {
                return Err(error("chain_reorg"));
            }
            logs.push(log.clone());
        }
        Ok(Some((header, logs)))
    }
    fn commit(&mut self, to: u64) {
        self.cursor = to;
        let keep = to.saturating_sub(64);
        self.headers.retain(|n, _| *n >= keep);
        self.logs.retain(|(n, _), _| *n >= keep);
    }
    fn notification(&mut self, v: &Value, heads: &str, logs: &str) -> Result<(), ApiError> {
        if v["method"] != "eth_subscription" {
            return Ok(());
        }
        let subscription = v["params"]["subscription"]
            .as_str()
            .ok_or_else(|| error("invalid_chain_response"))?;
        if subscription == heads {
            self.header(v["params"]["result"].clone())
        } else if subscription == logs {
            self.log(v["params"]["result"].clone())
        } else {
            Err(error("unknown_ws_subscription"))
        }
    }
}
async fn session(state: &AppState, url: &str) -> Result<(), ApiError> {
    if rpc(state, "eth_chainId", json!([])).await? != "0x61" {
        return Err(error("wrong_chain"));
    }
    mining::check(state).await?;
    let mut addresses = Vec::new();
    if let Some(t) = &state.mining {
        addresses.push(t.market.clone());
        if t.nft != t.market { addresses.push(t.nft.clone()); }
    }
    if let Some(t) = &state.burn {
        addresses.push(t.vault.clone());
    }
    let (mut socket, _) = tokio::time::timeout(Duration::from_secs(20), connect_async(url))
        .await
        .map_err(|_| error("ws_connect_timeout"))?
        .map_err(|_| error("ws_connect_failed"))?;
    for request in [
        json!({"jsonrpc":"2.0","id":1,"method":"eth_subscribe","params":["newHeads"]}),
        json!({"jsonrpc":"2.0","id":2,"method":"eth_subscribe","params":["logs",{"address":addresses}]}),
        json!({"jsonrpc":"2.0","id":3,"method":"eth_chainId","params":[]}),
    ] {
        socket
            .send(Message::Text(request.to_string().into()))
            .await
            .map_err(|_| error("ws_closed"))?;
    }
    let (mut heads, mut logs, mut chain) = (None, None, false);
    let mut queued = Vec::new();
    let handshake = async {
        while heads.is_none() || logs.is_none() || !chain {
            match socket
                .next()
                .await
                .ok_or_else(|| error("ws_closed"))?
                .map_err(|_| error("ws_closed"))?
            {
                Message::Text(text) => {
                    let v: Value =
                        serde_json::from_str(&text).map_err(|_| error("invalid_chain_response"))?;
                    if v.get("error").is_some() {
                        return Err(error("ws_subscription_rejected"));
                    }
                    match v["id"].as_u64() {
                        Some(1) => {
                            heads = Some(
                                v["result"]
                                    .as_str()
                                    .ok_or_else(|| error("ws_subscription_rejected"))?
                                    .to_string(),
                            )
                        }
                        Some(2) => {
                            logs = Some(
                                v["result"]
                                    .as_str()
                                    .ok_or_else(|| error("ws_subscription_rejected"))?
                                    .to_string(),
                            )
                        }
                        Some(3) => {
                            if v["result"] != "0x61" {
                                return Err(error("wrong_ws_chain"));
                            }
                            chain = true;
                        }
                        _ => {
                            queued.push(v);
                            if queued.len() > 10000 {
                                return Err(error("ws_buffer_full"));
                            }
                        }
                    }
                }
                Message::Ping(data) => socket
                    .send(Message::Pong(data))
                    .await
                    .map_err(|_| error("ws_closed"))?,
                Message::Close(_) => return Err(error("ws_closed")),
                _ => {}
            }
        }
        Ok::<_, ApiError>(())
    };
    tokio::time::timeout(Duration::from_secs(20), handshake)
        .await
        .map_err(|_| error("ws_subscribe_timeout"))??;
    let heads = heads.ok_or_else(|| error("ws_subscription_rejected"))?;
    let logs = logs.ok_or_else(|| error("ws_subscription_rejected"))?;
    let head = number(&rpc(state, "eth_blockNumber", json!([])).await?)?;
    if let Some(t) = &state.mining {
        while mining::backfill(state, t, head).await? {}
    }
    if let Some(t) = &state.burn {
        while burn::backfill(state, t, head).await? {}
    }
    let confirmed = head.saturating_sub(3);
    let anchor = rpc(
        state,
        "eth_getBlockByNumber",
        json!([format!("0x{confirmed:x}"), false]),
    )
    .await?;
    let store = state.pg.as_ref().ok_or_else(crate::pg::error)?;
    let client = store.read.get().await.map_err(|_| crate::pg::error())?;
    if let Some(t) = &state.mining {
        let row = client
            .query_one(
                "SELECT data->>'hash' FROM chain_state WHERE market=$1",
                &[&t.market],
            )
            .await
            .map_err(|_| crate::pg::error())?;
        if row.get::<_, String>(0) != anchor["hash"].as_str().unwrap_or("") {
            return Err(error("chain_reorg"));
        }
    }
    if let Some(t) = &state.burn {
        let row = client
            .query_one(
                "SELECT block_hash FROM buyback_state WHERE vault=$1",
                &[&t.vault],
            )
            .await
            .map_err(|_| crate::pg::error())?;
        if row.get::<_, String>(0) != anchor["hash"].as_str().unwrap_or("") {
            return Err(error("chain_reorg"));
        }
    }
    drop(client);
    let mut buffer = Buffer::new(anchor, addresses.clone())?;
    // Prime the unconfirmed overlap once, closing the subscribe/backfill race.
    for n in confirmed + 1..=head {
        buffer.header(
            rpc(
                state,
                "eth_getBlockByNumber",
                json!([format!("0x{n:x}"), false]),
            )
            .await?,
        )?;
    }
    let overlap=rpc(state,"eth_getLogs",json!([{"address":addresses,"fromBlock":format!("0x{:x}",confirmed+1),"toBlock":format!("0x{head:x}")}])).await?;
    for log in overlap
        .as_array()
        .ok_or_else(|| error("invalid_chain_response"))?
    {
        buffer.log(log.clone())?;
    }
    buffer.live = false;
    for v in queued {
        buffer.notification(&v, &heads, &logs)?;
    }
    buffer.live = true;
    mining::status(state, true, false, None);
    burn::status(state, true, None).await;
    eprintln!("chain WS subscribed; market and burn projections caught up");
    let mut seen = Instant::now();
    let mut ping = Instant::now();
    let mut tick = tokio::time::interval(Duration::from_secs(1));
    loop {
        tokio::select! {
            incoming=socket.next()=>{match incoming.ok_or_else(||error("ws_closed"))?.map_err(|_|error("ws_closed"))?{
                Message::Text(text)=>{let v:Value=serde_json::from_str(&text).map_err(|_|error("invalid_chain_response"))?;if v.get("error").is_some(){return Err(error("ws_subscription_rejected"));}if v["params"]["subscription"]==heads{seen=Instant::now();}buffer.notification(&v,&heads,&logs)?;},
                Message::Ping(data)=>socket.send(Message::Pong(data)).await.map_err(|_|error("ws_closed"))?,Message::Close(_)=>return Err(error("ws_closed")),_=>{}
            }},
            _=tick.tick()=>{
                if seen.elapsed()>Duration::from_secs(45){return Err(error("ws_head_timeout"));}
                if ping.elapsed()>=Duration::from_secs(15){socket.send(Message::Ping(Vec::new().into())).await.map_err(|_|error("ws_closed"))?;ping=Instant::now();}
                if let Some((header,logs))=buffer.ready()?{
                    mining::apply_stream(state,&header,&logs).await?;
                    burn::apply_stream(state,&header,&logs,&buffer.headers).await?;
                    buffer.commit(number(&header["number"])?);
                    mining::status(state,true,false,None);
                }
            }
        }
    }
}
pub async fn run(state: AppState) {
    if state.mining.is_none() && state.burn.is_none() {
        return;
    }
    mining::status(&state, false, true, None);
    burn::status(&state, false, None).await;
    let url = match endpoint() {
        Ok(url) => url,
        Err(_) => {
            eprintln!("chain WS configuration missing or invalid");
            return;
        }
    };
    loop {
        match mining::load(&state).await {
            Ok(()) => break,
            Err(_) => tokio::time::sleep(Duration::from_secs(5)).await,
        }
    }
    loop {
        if let Err(cause) = session(&state, &url).await {
            eprintln!("chain WS reconnect required: {}", cause.1);
            mining::status(&state, false, true, Some(cause.1));
            burn::status(&state, false, Some(cause.1)).await;
            if cause.1 == "ws_late_log" || cause.1 == "projection_mismatch" {
                mining::replay(&state);
                burn::replay(&state).await;
            }
        }
        tokio::time::sleep(Duration::from_secs(5)).await;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn hash(n: u64) -> String {
        crypto::hex(&crypto::keccak(format!("block-{n}")))
    }
    fn header(n: u64) -> Value {
        json!({"number":format!("0x{n:x}"),"hash":hash(n),"parentHash":hash(n-1),"timestamp":format!("0x{:x}",1000+n)})
    }
    fn log(n: u64, index: u64) -> Value {
        json!({"address":"0x1111111111111111111111111111111111111111","blockNumber":format!("0x{n:x}"),"blockHash":hash(n),"logIndex":format!("0x{index:x}"),"transactionHash":hash(999),"topics":[],"data":"0x","removed":false})
    }
    fn buffer() -> Buffer {
        Buffer::new(
            header(100),
            vec!["0x1111111111111111111111111111111111111111".into()],
        )
        .unwrap()
    }
    #[test]
    fn confirms_after_three_heads_sorts_and_deduplicates_logs() {
        let mut b = buffer();
        b.log(log(101, 2)).unwrap();
        b.log(log(101, 0)).unwrap();
        b.log(log(101, 0)).unwrap();
        for n in 101..=103 {
            b.header(header(n)).unwrap();
        }
        assert!(b.ready().unwrap().is_none());
        b.header(header(104)).unwrap();
        let (h, logs) = b.ready().unwrap().unwrap();
        assert_eq!(number(&h["number"]).unwrap(), 101);
        assert_eq!(logs.len(), 2);
        assert_eq!(logs[0]["logIndex"], "0x0");
        b.commit(101);
        b.log(log(101, 0)).unwrap();
        assert!(b.ready().unwrap().is_none());
        assert_eq!(b.log(log(101, 1)).unwrap_err().1, "ws_late_log");
    }
    #[test]
    fn shared_stream_preserves_nft_and_vault_log_order() {
        let nft="0x1111111111111111111111111111111111111111";
        let vault="0x2222222222222222222222222222222222222222";
        let mut b=Buffer::new(header(100),vec![nft.into(),vault.into()]).unwrap();
        let first=log(101,0);let mut second=log(101,1);second["address"]=json!(vault);
        b.log(second).unwrap();b.log(first).unwrap();
        for n in 101..=104 {b.header(header(n)).unwrap();}
        let (_,logs)=b.ready().unwrap().unwrap();assert_eq!(logs.len(),2);
        assert_eq!(logs[0]["address"],nft);assert_eq!(logs[1]["address"],vault);
    }
    #[test]
    fn gaps_reorgs_removed_logs_and_wrong_sources_require_recovery() {
        assert_eq!(buffer().header(header(102)).unwrap_err().1, "ws_head_gap");
        let mut wrong = header(101);
        wrong["parentHash"] = json!(hash(1));
        assert_eq!(buffer().header(wrong).unwrap_err().1, "chain_reorg");
        let mut b = buffer();
        b.header(header(101)).unwrap();
        assert_eq!(b.header(header(1)).unwrap_err().1, "chain_reorg");
        let mut removed = log(101, 0);
        removed["removed"] = json!(true);
        assert_eq!(buffer().log(removed).unwrap_err().1, "chain_reorg");
        let mut foreign = log(101, 0);
        foreign["address"] = json!("0x2222222222222222222222222222222222222222");
        assert_eq!(buffer().log(foreign).unwrap_err().1, "invalid_log_address");
        let mut invalid = log(101, 0);
        invalid["blockHash"] = json!(hash(1));
        let mut b = buffer();
        b.log(invalid).unwrap();
        for n in 101..=104 {
            b.header(header(n)).unwrap();
        }
        assert_eq!(b.ready().unwrap_err().1, "chain_reorg");
    }
}
