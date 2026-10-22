use crate::{claims::rpc, crypto, internal, pg, ApiError, AppState};
use axum::{
    extract::State,
    http::{header, StatusCode},
    Json,
};
use serde_json::{json, Value};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Clone)]
pub struct Tracker {
    pub vault: String,
    pub start: u64,
    pub flap_live: bool,
    pub official: bool,
}
impl Tracker {
    pub fn from_env() -> Result<Option<Self>, Box<dyn std::error::Error>> {
        let vault = std::env::var("ONHOLD_BUYBACK_VAULT").ok();
        let token = std::env::var("ONHOLD_FLAP_BURN_TOKEN").ok();
        if vault.is_some() && token.is_some() {
            return Err("Configure only one burn source: vault or Flap token".into());
        }
        let official = token.is_some();
        match (
            token.or(vault),
            std::env::var("ONHOLD_BUYBACK_FROM_BLOCK").ok(),
        ) {
            (None, None) => Ok(None),
            (Some(vault), Some(start)) => {
                crate::chain_stream::endpoint()?;
                let flap_live = match std::env::var("ONHOLD_BUYBACK_FLAP_LIVE").as_deref() {
                    Ok("false") => false,
                    Ok("true") | Err(_) => true,
                    _ => return Err("Invalid ONHOLD_BUYBACK_FLAP_LIVE".into()),
                };
                Ok(Some(Self {
                    vault: crypto::address(&vault).map_err(|_| "Invalid buyback vault")?,
                    start: start.parse()?,
                    flap_live,
                    official,
                }))
            }
            _ => Err("Configure both ONHOLD_BUYBACK_VAULT and ONHOLD_BUYBACK_FROM_BLOCK".into()),
        }
    }
}
pub fn token_symbol() -> String {
    format!("${}",std::env::var("ONHOLD_BUYBACK_TOKEN_SYMBOL").unwrap_or_else(|_|"OnHold".into()))
}
fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}
fn policy() -> Result<Value, ApiError> {
    Ok(
        serde_json::from_str::<Value>(include_str!("../../contracts/buyback-policy.json"))
            .map_err(|_| internal())?["97"]
            .clone(),
    )
}
pub async fn snapshot(
    State(state): State<AppState>,
) -> Result<impl axum::response::IntoResponse, ApiError> {
    let mut value = if let Some(tracker) = state.burn {
        let store = state.pg.as_ref().ok_or_else(pg::error)?;
        let mut client = store.read.get().await.map_err(|_| pg::error())?;
        let tx = client
            .build_transaction()
            .isolation_level(tokio_postgres::IsolationLevel::RepeatableRead)
            .read_only(true)
            .start()
            .await
            .map_err(|_| pg::error())?;
        let mut value = tx
            .query_opt(
                "SELECT data FROM buyback_state WHERE vault=$1",
                &[&tracker.vault],
            )
            .await
            .map_err(|_| pg::error())?
            .map(|r| r.get::<_, Value>(0))
            .unwrap_or_else(
                || json!({"configured":true,"available":false,"status":"syncing","totals":null}),
            );
        let block = value["confirmed_block"].as_i64().unwrap_or(0);
        let rows=tx.query("SELECT data FROM buyback_events WHERE vault=$1 AND block_number<=$2 ORDER BY block_number DESC,log_index DESC LIMIT 100",&[&tracker.vault,&block]).await.map_err(|_|pg::error())?;
        value["events"] = json!(rows
            .into_iter()
            .map(|r| r.get::<_, Value>(0))
            .collect::<Vec<_>>());
        tx.commit().await.map_err(|_| pg::error())?;
        value["stale"] = json!(value["connected"] != true || value["syncing"] == true || now().saturating_sub(
            value["seen_at"].as_u64().or(value["checked_at"].as_u64()).unwrap_or(0),
        ) >= 60);
        value["available"] = json!(block > 0 && value["totals"].is_object());
        value["vault"] = json!(tracker.vault);
        value
    } else {
        json!({"configured":false,"available":true,"events":[],"totals":null,"status":"unconfigured"})
    };
    value["token_symbol"] = json!(token_symbol());
    value["chain_id"] = json!(97);
    value["storage"] = json!("postgresql");
    if value["source"] != "flap" { value["policy"] = policy()?; }
    Ok(([(header::CACHE_CONTROL, "no-store")], Json(value)))
}
fn quantity(value: &Value) -> Result<u64, ApiError> {
    u64::from_str_radix(value.as_str().unwrap_or("").trim_start_matches("0x"), 16)
        .map_err(|_| internal())
}
fn units(raw: &str) -> Result<u128, ApiError> {
    if raw.len() > 64 || raw.is_empty() || !raw.bytes().all(|b| b.is_ascii_hexdigit()) {
        return Err(internal());
    }
    u128::from_str_radix(raw, 16).map_err(|_| internal())
}
fn decimal(value: u128) -> String {
    format!("{}.{:018}", value / 10u128.pow(18), value % 10u128.pow(18))
}
#[cfg(test)]
fn amount(value: &str) -> Result<String, ApiError> {
    if value.len() != 64 {
        return Err(internal());
    }
    Ok(decimal(units(value)?))
}
async fn call(
    state: &AppState,
    address: &str,
    method: &str,
    block: &str,
) -> Result<String, ApiError> {
    let selector = crypto::hex(&crypto::keccak(method)[..4]);
    let result = rpc(
        state,
        "eth_call",
        json!([{"to":address,"data":selector},block]),
    )
    .await?;
    let raw = result
        .as_str()
        .unwrap_or("")
        .strip_prefix("0x")
        .ok_or_else(internal)?;
    if raw.len() != 64 || !raw.bytes().all(|b| b.is_ascii_hexdigit()) {
        return Err(internal());
    }
    Ok(raw.into())
}
fn address(word: &str) -> Result<String, ApiError> {
    if word.len() != 64 || !word.is_ascii() || word[..24].bytes().any(|b| b != b'0') {
        return Err(internal());
    }
    crypto::address(&format!("0x{}", &word[24..])).map_err(|_| internal())
}
async fn block_at(state: &AppState, number: u64) -> Result<Value, ApiError> {
    let block = rpc(
        state,
        "eth_getBlockByNumber",
        json!([format!("0x{number:x}"), false]),
    )
    .await?;
    crypto::bytes(block["hash"].as_str().unwrap_or(""), 32).map_err(|_| internal())?;
    if quantity(&block["number"])? != number {
        return Err(internal());
    }
    Ok(block)
}
#[derive(Clone, Debug, Default, PartialEq)]
struct Projection {
    received: u128,
    spent: u128,
    burned: u128,
    gas: u128,
    balance: u128,
    accounted: u128,
    unsettled: u128,
    last: u64,
    checked: u64,
    processor: Option<String>,
    black_hole: Option<String>,
    policy: Option<Value>,
}
impl Projection {
    fn read(data: &Value) -> Result<Self, ApiError> {
        let p = &data["projection"];
        let get = |key: &str| {
            p[key]
                .as_str()
                .and_then(|s| s.parse::<u128>().ok())
                .ok_or_else(internal)
        };
        Ok(Self {
            received: get("received")?,
            spent: get("spent")?,
            burned: get("burned")?,
            gas: get("gas")?,
            balance: get("balance")?,
            accounted: get("accounted")?,
            unsettled: get("unsettled")?,
            last: data["last_execution"].as_u64().ok_or_else(internal)?,
            checked: data["checked_at"].as_u64().ok_or_else(internal)?,
            processor: p["processor"].as_str().map(str::to_owned),
            black_hole: p["black_hole"].as_str().map(str::to_owned),
            policy: p["policy"].as_object().map(|_| p["policy"].clone()),
        })
    }
    fn data(&self, tracker: &Tracker, header: &Value) -> Result<Value, ApiError> {
        let eligible = self
            .balance
            .checked_add(self.unsettled)
            .ok_or_else(internal)?;
        let minimum = policy()?["minimum_wei"]
            .as_str()
            .and_then(|s| s.parse::<u128>().ok())
            .ok_or_else(internal)?;
        let timestamp = quantity(&header["timestamp"])?;
        let status = if eligible < minimum {
            "accumulating"
        } else if timestamp < self.last.saturating_add(180) {
            "cooldown"
        } else {
            "eligible"
        };
        let mut data =
            json!({"configured":true,"available":true,"connected":true,"syncing":false,"last_error":null,"status":status,"flap_live":tracker.flap_live,"confirmed_block":quantity(&header["number"])? ,"indexing":false,"seen_at":now(),"checked_at":self.checked,"next_check_at":self.checked+180,"last_execution":self.last,
          "totals":{"received":decimal(self.received),"spent":decimal(self.spent),"burned":decimal(self.burned),"pending":decimal(self.balance),"unsettled_creator_fees":if tracker.flap_live {json!(decimal(self.unsettled))}else{Value::Null},"eligible_balance":decimal(eligible),"gas_refunded":decimal(self.gas)},
          "projection":{"received":self.received.to_string(),"spent":self.spent.to_string(),"burned":self.burned.to_string(),"gas":self.gas.to_string(),"balance":self.balance.to_string(),"accounted":self.accounted.to_string(),"unsettled":self.unsettled.to_string(),"processor":self.processor,"black_hole":self.black_hole,"policy":self.policy}});
        data["source"] = json!(if tracker.official {"flap"} else {"vault"});
        if tracker.official {
            data["status"] = json!("listening");
            data["token"] = json!(tracker.vault);
            data["processor"] = json!(self.processor);
            data["burn_address"] = json!(self.black_hole);
            data["policy"] = json!(self.policy);
            data["next_check_at"] = Value::Null;
            for key in ["received", "spent", "pending", "unsettled_creator_fees", "eligible_balance", "gas_refunded"] {
                data["totals"][key] = Value::Null;
            }
        }
        Ok(data)
    }
    fn apply(&mut self, log: &Value, timestamp: u64) -> Result<(), ApiError> {
        let topic = log["topics"][0].as_str().ok_or_else(internal)?;
        let raw = log["data"]
            .as_str()
            .and_then(|s| s.strip_prefix("0x"))
            .ok_or_else(internal)?;
        if topic == crypto::hex(&crypto::keccak("RevenueReceived(uint256)")) {
            let value = units_checked(raw)?;
            self.received = self.received.checked_add(value).ok_or_else(internal)?;
            self.accounted = self.accounted.checked_add(value).ok_or_else(internal)?;
            // RevenueReceived includes any previously unaccounted native transfer.
            self.balance = self.accounted;
        } else if topic == crypto::hex(&crypto::keccak("BuybackBurned(uint256,uint256)")) {
            if raw.len() != 128 {
                return Err(internal());
            }
            let spent = units_checked(&raw[..64])?;
            let burned = units_checked(&raw[64..])?;
            self.spent = self.spent.checked_add(spent).ok_or_else(internal)?;
            self.burned = self.burned.checked_add(burned).ok_or_else(internal)?;
            self.balance = self.balance.checked_sub(spent).ok_or_else(internal)?;
            self.accounted = self.accounted.checked_sub(spent).ok_or_else(internal)?;
            self.last = timestamp;
        } else if topic == crypto::hex(&crypto::keccak("KeeperGasRefunded(address,uint256)")) {
            let refund = units_checked(raw)?;
            self.gas = self.gas.checked_add(refund).ok_or_else(internal)?;
            self.balance = self.balance.checked_sub(refund).ok_or_else(internal)?;
            self.accounted = self.accounted.checked_sub(refund).ok_or_else(internal)?;
        }
        Ok(())
    }
}
const DEAD: &str = "0x000000000000000000000000000000000000dead";
const ZERO: &str = "0x0000000000000000000000000000000000000000";

fn official_burn(log: &Value, p: &Projection, token: &str) -> Result<Option<u128>, ApiError> {
    // Transfer is the canonical amount; counting TokensBurned too would duplicate the same burn.
    if log["topics"][0] != crypto::hex(&crypto::keccak("Transfer(address,address,uint256)")) {
        return Ok(None);
    }
    let topic_address = |index: usize| {
        let word = log["topics"][index].as_str().unwrap_or("").strip_prefix("0x").unwrap_or("");
        if word == "0".repeat(64) { Ok(ZERO.to_owned()) } else { address(word) }
    };
    let from = topic_address(1)?;
    let to = topic_address(2)?;
    if Some(from.as_str()) != p.processor.as_deref() && from != token {
        return Ok(None);
    }
    if to != DEAD && to != ZERO && Some(to.as_str()) != p.black_hole.as_deref() {
        return Ok(None);
    }
    let value = units_checked(log["data"].as_str().unwrap_or("").strip_prefix("0x").unwrap_or(""))?;
    Ok((value > 0).then_some(value))
}

async fn init_official(state: &AppState, tracker: &Tracker, p: &mut Projection, tag: &str) -> Result<(), ApiError> {
    if p.processor.is_none() {
        let processor = address(&call(state, &tracker.vault, "taxProcessor()", tag).await?)?;
        if processor == ZERO || address(&call(state, &processor, "taxToken()", tag).await?)? != tracker.vault
            || units_checked(&call(state, &tracker.vault, "decimals()", tag).await?)? != 18 {
            return Err(internal());
        }
        p.black_hole = Some(address(&call(state, &processor, "flapBlackHole()", tag).await?)?);
        let fees = rpc(state, "eth_call", json!([{"to":processor,"data":crypto::hex(&crypto::keccak("feeConfig()")[..4])},tag])).await?;
        let fees = fees.as_str().and_then(|s|s.strip_prefix("0x")).ok_or_else(internal)?;
        if fees.len() != 384 || !fees.is_ascii() { return Err(internal()); }
        let fields = fees.as_bytes().chunks_exact(64).map(|word| units_checked(std::str::from_utf8(word).map_err(|_|internal())?)).collect::<Result<Vec<_>,_>>()?;
        if fields[..4].iter().any(|v| *v > 10000) || fields[..4].iter().sum::<u128>() != 10000 || fields[4] > 10000 || fields[5] > 1 { return Err(internal()); }
        p.policy = Some(json!({"buy_tax_bps":units_checked(&call(state, &tracker.vault, "buyTaxRate()", tag).await?)?,"sell_tax_bps":units_checked(&call(state, &tracker.vault, "sellTaxRate()", tag).await?)?,"market_bps":fields[0],"deflation_bps":fields[1],"lp_bps":fields[2],"dividend_bps":fields[3],"fee_rate_bps":fields[4]}));
        p.processor = Some(processor);
    }
    Ok(())
}

fn apply_log(p: &mut Projection, tracker: &Tracker, log: &Value, timestamp: u64) -> Result<(), ApiError> {
    if tracker.official {
        if let Some(value) = official_burn(log, p, &tracker.vault)? {
            p.burned = p.burned.checked_add(value).ok_or_else(internal)?;
            p.last = timestamp;
        }
        Ok(())
    } else {
        p.apply(log, timestamp)
    }
}
fn units_checked(raw: &str) -> Result<u128, ApiError> {
    if raw.len() != 64 {
        return Err(internal());
    }
    units(raw)
}
async fn balances(
    state: &AppState,
    tracker: &Tracker,
    p: &mut Projection,
    tag: &str,
    verify: bool,
) -> Result<(), ApiError> {
    let balance = rpc(state, "eth_getBalance", json!([tracker.vault, tag])).await?;
    let accounted = units_checked(&call(state, &tracker.vault, "accountedQuote()", tag).await?)?;
    if verify && accounted != p.accounted {
        return Err(ApiError(StatusCode::BAD_GATEWAY, "projection_mismatch"));
    }
    p.balance = units(balance.as_str().unwrap_or("").trim_start_matches("0x"))?;
    p.accounted = accounted;
    p.unsettled = if tracker.flap_live {
        let token = address(&call(state, &tracker.vault, "taxToken()", tag).await?)?;
        let processor = address(&call(state, &token, "taxProcessor()", tag).await?)?;
        if address(&call(state, &processor, "marketAddress()", tag).await?)? != tracker.vault
            || address(&call(state, &processor, "taxToken()", tag).await?)? != token
        {
            return Err(internal());
        }
        let quote = call(state, &processor, "getQuoteToken()", tag).await?;
        if quote == "0".repeat(64) || quote != call(state, &processor, "weth()", tag).await? {
            return Err(internal());
        }
        units_checked(&call(state, &processor, "marketQuoteBalance()", tag).await?)?
    } else {
        0
    };
    p.checked = now();
    Ok(())
}
fn receipts(logs: &[Value], tracker: &Tracker, p: &Projection) -> Result<Vec<Value>, ApiError> {
    let mut events = Vec::new();
    let mut refunds = std::collections::BTreeMap::new();
    for log in logs {
        let hash = log["transactionHash"]
            .as_str()
            .ok_or_else(internal)?
            .to_string();
        crypto::bytes(&hash, 32).map_err(|_| internal())?;
        let raw = log["data"]
            .as_str()
            .and_then(|s| s.strip_prefix("0x"))
            .ok_or_else(internal)?;
        if tracker.official {
            if let Some(value) = official_burn(log, p, &tracker.vault)? {
                events.push(json!({"tx_hash":hash,"log_index":quantity(&log["logIndex"])? ,"block":quantity(&log["blockNumber"])? ,"spent":null,"burned":decimal(value),"gas_refunded":null,"source":"flap","kind":"deflation"}));
            }
        } else if log["topics"][0] == crypto::hex(&crypto::keccak("BuybackBurned(uint256,uint256)")) {
            if raw.len() != 128 {
                return Err(internal());
            }
            events.push(json!({"tx_hash":hash,"log_index":quantity(&log["logIndex"])? ,"block":quantity(&log["blockNumber"])? ,"spent":decimal(units_checked(&raw[..64])?),"burned":decimal(units_checked(&raw[64..])?)}));
        } else if log["topics"][0]
            == crypto::hex(&crypto::keccak("KeeperGasRefunded(address,uint256)"))
        {
            refunds.insert(hash, decimal(units_checked(raw)?));
        }
    }
    for event in events.iter_mut().filter(|_| !tracker.official) {
        event["gas_refunded"] = json!(refunds
            .get(event["tx_hash"].as_str().ok_or_else(internal)?)
            .cloned()
            .unwrap_or_else(|| decimal(0)));
    }
    Ok(events)
}
async fn save(
    state: &AppState,
    tracker: &Tracker,
    header: &Value,
    data: &Value,
    logs: &[Value],
    reset: bool,
) -> Result<(), ApiError> {
    let store = state.pg.as_ref().ok_or_else(pg::error)?;
    let events = receipts(logs, tracker, &Projection::read(data)?)?;
    let mut client = store.write.lock().await;
    let tx = client.transaction().await.map_err(|_| pg::error())?;
    if reset {
        tx.execute(
            "DELETE FROM buyback_events WHERE vault=$1",
            &[&tracker.vault],
        )
        .await
        .map_err(|_| pg::error())?;
    }
    for event in events {
        tx.execute("INSERT INTO buyback_events(vault,tx_hash,log_index,block_number,data) VALUES($1,$2,$3,$4,$5) ON CONFLICT(vault,tx_hash,log_index) DO NOTHING",&[&tracker.vault,&event["tx_hash"].as_str().ok_or_else(internal)?,&(event["log_index"].as_u64().ok_or_else(internal)? as i64),&(event["block"].as_u64().ok_or_else(internal)? as i64),&event]).await.map_err(|_|pg::error())?;
    }
    let next = quantity(&header["number"])?
        .checked_add(1)
        .ok_or_else(internal)? as i64;
    let hash = header["hash"].as_str().ok_or_else(internal)?;
    tx.execute("INSERT INTO buyback_state(vault,next_block,block_hash,data) VALUES($1,$2,$3,$4) ON CONFLICT(vault) DO UPDATE SET next_block=excluded.next_block,block_hash=excluded.block_hash,data=excluded.data",&[&tracker.vault,&next,&hash,&data]).await.map_err(|_|pg::error())?;
    tx.commit().await.map_err(|_| pg::error())?;
    Ok(())
}
pub async fn backfill(state: &AppState, tracker: &Tracker, head: u64) -> Result<bool, ApiError> {
    let store = state.pg.as_ref().ok_or_else(pg::error)?;
    let latest = head.saturating_sub(3);
    if latest < tracker.start {
        return Err(internal());
    }
    let client = store.read.get().await.map_err(|_| pg::error())?;
    let saved = client
        .query_opt(
            "SELECT next_block,block_hash,data FROM buyback_state WHERE vault=$1",
            &[&tracker.vault],
        )
        .await
        .map_err(|_| pg::error())?;
    drop(client);
    let (mut from, hash, replay, saved_data) = saved
        .map(|r| {
            let data:Value=r.get(2);
            (
                r.get::<_, i64>(0) as u64,
                r.get::<_, Option<String>>(1),
                data["replay"] == true,
                Some(data),
            )
        })
        .unwrap_or((tracker.start, None, false, None));
    let reset = if replay || from > latest + 1 || hash.is_none() {
        true
    } else if let Some(hash) = hash {
        block_at(state, from - 1).await?["hash"] != hash
    } else {
        false
    };
    if reset {
        from = tracker.start;
    }
    let confirmed = if from <= latest {
        (from + 999).min(latest)
    } else {
        latest
    };
    let header = block_at(state, confirmed).await?;
    let tag = format!("0x{confirmed:x}");
    let logs = if from <= confirmed {
        rpc(
            state,
            "eth_getLogs",
            json!([{"address":tracker.vault,"fromBlock":format!("0x{from:x}"),"toBlock":tag}]),
        )
        .await?
    } else {
        json!([])
    };
    let logs = logs.as_array().ok_or_else(internal)?;
    for log in logs {
        if log["removed"] == true
            || log["address"].as_str().map(str::to_lowercase) != Some(tracker.vault.clone())
            || quantity(&log["blockNumber"])? < from
            || quantity(&log["blockNumber"])? > confirmed
        {
            return Err(internal());
        }
    }
    let mut p = if confirmed < latest || tracker.official {
        // Replay intermediate ranges from events; verify balances at the fresh final checkpoint.
        let mut p=if reset {Projection::default()} else {saved_data.as_ref().map(Projection::read).transpose()?.unwrap_or_default()};
        if tracker.official { init_official(state, tracker, &mut p, &tag).await?; }
        for log in logs {
            if tracker.official && official_burn(log, &p, &tracker.vault)?.is_none() { continue; }
            let block=block_at(state,quantity(&log["blockNumber"])?).await?;
            apply_log(&mut p, tracker, log, quantity(&block["timestamp"])? )?;
        }
        p
    } else { Projection {
        received: units_checked(&call(state, &tracker.vault, "totalReceived()", &tag).await?)?,
        spent: units_checked(&call(state, &tracker.vault, "totalSpent()", &tag).await?)?,
        burned: units_checked(&call(state, &tracker.vault, "totalBurned()", &tag).await?)?,
        gas: units_checked(&call(state, &tracker.vault, "totalGasRefunded()", &tag).await?)?,
        last: units_checked(&call(state, &tracker.vault, "lastExecution()", &tag).await?)?
            .try_into()
            .map_err(|_| internal())?,
        ..Default::default()
    }};
    if tracker.official { p.checked = now(); }
    else if confirmed == latest { balances(state, tracker, &mut p, &tag, false).await?; }
    if block_at(state, confirmed).await?["hash"] != header["hash"] {
        return Err(internal());
    }
    let mut data = p.data(tracker, &header)?;
    data["indexing"] = json!(confirmed < latest);
    data["syncing"] = json!(true);
    data["connected"] = json!(false);
    data["available"] = json!(false);
    save(state, tracker, &header, &data, logs, reset).await?;
    Ok(confirmed < latest)
}
pub async fn apply_stream(
    state: &AppState,
    header: &Value,
    logs: &[Value],
    headers: &std::collections::BTreeMap<u64, Value>,
) -> Result<(), ApiError> {
    let Some(tracker) = &state.burn else {
        return Ok(());
    };
    let store = state.pg.as_ref().ok_or_else(pg::error)?;
    let client = store.read.get().await.map_err(|_| pg::error())?;
    let row = client
        .query_one(
            "SELECT next_block,data FROM buyback_state WHERE vault=$1",
            &[&tracker.vault],
        )
        .await
        .map_err(|_| pg::error())?;
    drop(client);
    let next = row.get::<_, i64>(0) as u64;
    let to = quantity(&header["number"])?;
    if to < next {
        return Ok(());
    }
    let mut p = Projection::read(&row.get::<_, Value>(1))?;
    let logs = logs
        .iter()
        .filter(|l| {
            l["address"].as_str() == Some(&tracker.vault)
                && quantity(&l["blockNumber"]).is_ok_and(|n| n >= next)
        })
        .cloned()
        .collect::<Vec<_>>();
    for log in &logs {
        let h = headers
            .get(&quantity(&log["blockNumber"])?)
            .ok_or_else(internal)?;
        apply_log(&mut p, tracker, log, quantity(&h["timestamp"])?)?;
    }
    // Actual native balance and external Flap fees are checked every 3 minutes; events drive receipts and totals.
    let settled = tracker.flap_live
        && logs.iter().any(|l| {
            l["topics"][0] == crypto::hex(&crypto::keccak("BuybackBurned(uint256,uint256)"))
        });
    if tracker.official { p.checked = now(); }
    else if settled || now().saturating_sub(p.checked) >= 180 {
        balances(state, tracker, &mut p, &format!("0x{to:x}"), true).await?;
    }
    save(
        state,
        tracker,
        header,
        &p.data(tracker, header)?,
        &logs,
        false,
    )
    .await
}
pub async fn status(state: &AppState, connected: bool, error: Option<&str>) {
    if let (Some(store), Some(tracker)) = (&state.pg, &state.burn) {
        let mut patch = json!({"configured":true,"available":connected,"connected":connected,"syncing":!connected,"last_error":error,"seen_at":now()});
        if !connected {
            patch["status"] = json!("unavailable");
        }
        let _ = store.write.lock().await.execute(
            "INSERT INTO buyback_state(vault,next_block,data) VALUES($1,$2,$3) ON CONFLICT(vault) DO UPDATE SET data=buyback_state.data || excluded.data",
            &[&tracker.vault,&(tracker.start as i64),&patch],
        ).await;
    }
}
pub async fn replay(state: &AppState) {
    if let (Some(store), Some(tracker)) = (&state.pg, &state.burn) {
        let _ = store
            .write
            .lock()
            .await
            .execute(
                r#"UPDATE buyback_state SET data=data || '{"replay":true}'::jsonb WHERE vault=$1"#,
                &[&tracker.vault],
            )
            .await;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn exact_token_amounts_and_malformed_rpc_data() {
        assert_eq!(
            amount(&format!("{:064x}", 115u128 * 10u128.pow(18))).unwrap(),
            "115.000000000000000000"
        );
        assert!(amount("01").is_err());
        assert!(amount(&"f".repeat(64)).is_err());
        assert!(address(&"f".repeat(64)).is_err());
    }
}

#[cfg(test)]
mod projection_tests {
    use super::*;
    fn event(name: &str, values: &[u128]) -> Value {
        json!({"topics":[crypto::hex(&crypto::keccak(name))],"data":format!("0x{}",values.iter().map(|v|format!("{v:064x}")).collect::<String>()),"transactionHash":crypto::hex(&crypto::keccak("tx")),"blockNumber":"0x10","logIndex":"0x0"})
    }
    #[test]
    fn revenue_burn_and_refund_replay_exactly_without_double_counting_forced_bnb() {
        let mut p = Projection {
            received: 100,
            balance: 105,
            accounted: 100,
            ..Default::default()
        };
        p.apply(&event("RevenueReceived(uint256)", &[30]), 100)
            .unwrap();
        assert_eq!(p.balance, 130);
        p.apply(&event("BuybackBurned(uint256,uint256)", &[90, 1000]), 101)
            .unwrap();
        p.apply(&event("KeeperGasRefunded(address,uint256)", &[10]), 101)
            .unwrap();
        assert_eq!(
            (
                p.received,
                p.spent,
                p.burned,
                p.gas,
                p.balance,
                p.accounted,
                p.last
            ),
            (130, 90, 1000, 10, 30, 30, 101)
        );
        let tracker = Tracker {
            vault: "0x1111111111111111111111111111111111111111".into(),
            start: 1,
            flap_live: false,
            official: false,
        };
        let data = p
            .data(&tracker, &json!({"number":"0x10","timestamp":"0x65"}))
            .unwrap();
        assert_eq!(Projection::read(&data).unwrap(), p);
        assert!(p
            .apply(&event("BuybackBurned(uint256,uint256)", &[31, 1]), 102)
            .is_err());
    }
    #[test]
    fn buyback_and_refund_are_one_receipt_regardless_of_log_order() {
        let logs = vec![
            event("KeeperGasRefunded(address,uint256)", &[10]),
            event("BuybackBurned(uint256,uint256)", &[90, 1000]),
        ];
        let tracker = Tracker { vault: ZERO.into(), start: 1, flap_live: false, official: false };
        let rows = receipts(&logs, &tracker, &Projection::default()).unwrap();
        assert_eq!(rows.len(), 1);
        assert_eq!(rows[0]["gas_refunded"], decimal(10));
        assert_eq!(rows[0]["spent"], decimal(90));
    }

    #[test]
    fn official_burn_counts_only_protocol_transfers_once_and_has_no_invented_spend() {
        let token = "0x1111111111111111111111111111111111111111";
        let processor = "0x2222222222222222222222222222222222222222";
        let black_hole = "0x3333333333333333333333333333333333333333";
        let user = "0x4444444444444444444444444444444444444444";
        let tracker = Tracker { vault: token.into(), start: 1, flap_live: true, official: true };
        let mut p = Projection {processor: Some(processor.into()), black_hole: Some(black_hole.into()), ..Default::default()};
        let transfer = |from: &str, to: &str, value: u128| {
            let mut log = event("Transfer(address,address,uint256)", &[value]);
            log["topics"] = json!([crypto::hex(&crypto::keccak("Transfer(address,address,uint256)")), format!("0x{:0>64}",&from[2..]),format!("0x{:0>64}",&to[2..])]);
            log
        };
        let mut logs = vec![transfer(processor, black_hole, 100), transfer(token, DEAD, 50), transfer(processor, ZERO, 25), transfer(user, DEAD, 900), transfer(processor, user, 800), transfer(processor, DEAD, 0),event("TokensBurned(uint256)", &[175])];
        for (i,log) in logs.iter_mut().enumerate() { log["logIndex"] = json!(format!("0x{i:x}")); apply_log(&mut p, &tracker, log, 123).unwrap(); }
        assert_eq!(p.burned, 175);
        let rows = receipts(&logs, &tracker, &p).unwrap();
        assert_eq!(rows.len(), 3);
        assert!(rows.iter().all(|r| r["spent"].is_null() && r["gas_refunded"].is_null() && r["source"] == "flap"));
        let data = p.data(&tracker, &json!({"number":"0x10","timestamp":"0x65"})).unwrap();
        assert_eq!(data["source"], "flap");
        assert_eq!(data["totals"]["spent"], Value::Null);
        assert_eq!(Projection::read(&data).unwrap(), p);
        let mut malformed = transfer(processor, DEAD, 1); malformed["topics"][2] = json!("0x01");
        assert!(official_burn(&malformed, &p, token).is_err());
    }
}
