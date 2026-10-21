use crate::{claims::rpc, crypto, pg, ApiError, AppState};
use axum::{
    extract::{Path, Query, State},
    http::{header, StatusCode},
    Json,
};
use k256::elliptic_curve::bigint::{Encoding, U256};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{
    collections::{BTreeMap, BTreeSet},
    sync::{Arc, Mutex},
    time::{SystemTime, UNIX_EPOCH},
};
const ZERO: &str = "0x0000000000000000000000000000000000000000";
const POOL: u128 = 100_000_000_000_000_000_000_000_000;
const BASE: u128 = POOL * 100 / 115;
const MINING_DURATION: u64 = 365 * 86400;
fn invalid() -> ApiError {
    ApiError(StatusCode::BAD_GATEWAY, "invalid_chain_response")
}
fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}
fn zero() -> String {
    "0".repeat(64)
}
pub(crate) fn uint(s: &str) -> Result<U256, ApiError> {
    if s.len() != 64 || !s.bytes().all(|v| v.is_ascii_hexdigit()) {
        return Err(invalid());
    }
    Ok(U256::from_be_hex(s))
}
fn hex(v: U256) -> String {
    format!("{v:064x}")
}
fn small(s: &str) -> Result<u64, ApiError> {
    u64::from_str_radix(s, 16).map_err(|_| invalid())
}
fn quantity(v: &Value) -> Result<u64, ApiError> {
    small(v.as_str().ok_or_else(invalid)?.trim_start_matches("0x"))
}
pub(crate) fn amount(v: U256) -> Result<String, ApiError> {
    let bytes = v.to_be_bytes();
    if bytes[..16].iter().any(|v| *v != 0) {
        return Err(invalid());
    }
    let n = u128::from_be_bytes(bytes[16..].try_into().map_err(|_| invalid())?);
    Ok(format!("{}.{:018}", n / 10u128.pow(18), n % 10u128.pow(18)))
}
pub(crate) fn word(data: &str, index: usize) -> Result<&str, ApiError> {
    data.get(
        index.checked_mul(64).ok_or_else(invalid)?
            ..index
                .checked_add(1)
                .and_then(|n| n.checked_mul(64))
                .ok_or_else(invalid)?,
    )
    .filter(|s| s.bytes().all(|v| v.is_ascii_hexdigit()))
    .ok_or_else(invalid)
}
pub(crate) fn address(data: &str, index: usize) -> Result<String, ApiError> {
    let w = word(data, index)?;
    if w[..24].bytes().any(|b| b != b'0') {
        return Err(invalid());
    }
    Ok(format!("0x{}", &w[24..]).to_lowercase())
}
fn text_at(data: &str, offset: usize, max: usize) -> Result<String, ApiError> {
    if offset % 32 != 0 {
        return Err(invalid());
    }
    let start = offset.checked_mul(2).ok_or_else(invalid)?;
    let length = small(word(data, start / 64)?)? as usize;
    if length > max {
        return Err(invalid());
    }
    let start = start.checked_add(64).ok_or_else(invalid)?;
    let raw = data
        .get(start..start.checked_add(length * 2).ok_or_else(invalid)?)
        .ok_or_else(invalid)?;
    let bytes = crypto::bytes(&format!("0x{raw}"), length).map_err(|_| invalid())?;
    String::from_utf8(bytes).map_err(|_| invalid())
}
pub(super) fn text(data: &str, index: usize, max: usize) -> Result<String, ApiError> {
    let offset = small(word(data, index)?)? as usize;
    if offset % 32 != 0 {
        return Err(invalid());
    }
    text_at(data, offset, max)
}
fn strings(data: &str, index: usize) -> Result<Vec<String>, ApiError> {
    let offset = small(word(data, index)?)? as usize;
    if offset % 32 != 0 {
        return Err(invalid());
    }
    let count = small(word(data, offset / 32)?)? as usize;
    if count > 10 {
        return Err(invalid());
    }
    let base = offset + 32;
    (0..count)
        .map(|i| {
            text_at(
                data,
                base.checked_add(small(word(data, base / 32 + i)?)? as usize)
                    .ok_or_else(invalid)?,
                40,
            )
        })
        .collect()
}
fn released(start: u64, time: u64) -> u128 {
    if start == 0 || time <= start {
        return 0;
    }
    BASE * (time - start).min(MINING_DURATION) as u128 / MINING_DURATION as u128
}
#[derive(Clone, Serialize, Deserialize)]
struct Wallet {
    weight: u64,
    paid: String,
    pending: String,
    referrer: String,
    referral_pending: String,
    referral_earned: String,
}
impl Default for Wallet {
    fn default() -> Self {
        Self {
            weight: 0,
            paid: zero(),
            pending: zero(),
            referrer: ZERO.into(),
            referral_pending: zero(),
            referral_earned: zero(),
        }
    }
}
#[derive(Clone, Serialize, Deserialize)]
struct Pass {
    id: u64,
    tier: u8,
    owner: String,
    staker: Option<String>,
    record: Option<crypto::AccountRecord>,
    #[serde(default)]
    image: Option<String>,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Ad {
    id: u8,
    version: String,
    advertiser: String,
    #[serde(default)]
    tx_hash: Option<String>,
    bid: String,
    started_at: u64,
    ended_at: Option<u64>,
    url: String,
    description: String,
    avatar: String,
    tags: Vec<String>,
}
#[derive(Clone, Serialize, Deserialize)]
struct Funding {
    base: String,
    referral: String,
    at: u64,
    released: String,
    remaining: String,
}
#[derive(Clone, Serialize, Deserialize)]
struct Snapshot {
    next_block: u64,
    block: u64,
    hash: String,
    time: u64,
    started: u64,
    updated: u64,
    total_weight: u64,
    rpt: String,
    allocated: String,
    minted: u64,
    claimed: String,
    referral_bonus: String,
    #[serde(default)]
    funding: Option<Funding>,
    #[serde(default)]
    mock_minimum: Option<String>,
    #[serde(default)]
    ad_price_interval: Option<u64>,
    #[serde(default = "zero")]
    ad_team: String,
    #[serde(default = "zero")]
    ad_reserve: String,
    #[serde(default = "zero")]
    ad_reinvested: String,
    recipients: BTreeSet<String>,
    #[serde(default)]
    recipient_count: usize,
    wallets: BTreeMap<String, Wallet>,
    passes: BTreeMap<u64, Pass>,
    ads: BTreeMap<u8, Ad>,
    history: Vec<Ad>,
}
impl Snapshot {
    fn new(start: u64) -> Self {
        Self {
            next_block: start,
            block: 0,
            hash: String::new(),
            time: 0,
            started: 0,
            updated: 0,
            total_weight: 0,
            rpt: zero(),
            allocated: zero(),
            minted: 0,
            claimed: zero(),
            referral_bonus: zero(),
            funding: None,
            mock_minimum: None,
            ad_price_interval: None,
            ad_team: zero(),
            ad_reserve: zero(),
            ad_reinvested: zero(),
            recipients: BTreeSet::new(),
            recipient_count: 0,
            wallets: BTreeMap::new(),
            passes: BTreeMap::new(),
            ads: BTreeMap::new(),
            history: Vec::new(),
        }
    }
    fn apply(&mut self, log: &Value) -> Result<(), ApiError> {
        if log["removed"] == true {
            return Err(invalid());
        }
        let topics = log["topics"].as_array().ok_or_else(invalid)?;
        let topic = topics.first().and_then(Value::as_str).ok_or_else(invalid)?;
        let data = log["data"]
            .as_str()
            .ok_or_else(invalid)?
            .strip_prefix("0x")
            .ok_or_else(invalid)?;
        let is = |signature: &str| topic == crypto::hex(&crypto::keccak(signature));
        let arg = |n: usize| -> Result<&str, ApiError> {
            let s = topics
                .get(n)
                .and_then(Value::as_str)
                .and_then(|v| v.strip_prefix("0x"))
                .ok_or_else(invalid)?;
            word(s, 0)
        };
        if is("MockConfiguration(uint256,address)") {
            self.mock_minimum = Some(word(data, 0)?.into());
        } else if is("AdPriceIntervalConfigured(uint256)") {
            let interval = small(word(data, 0)?)?;
            if interval != 60 { return Err(invalid()); }
            self.ad_price_interval = Some(interval);
        } else if is("RewardsCheckpoint(address,uint256,uint256,uint256,uint256,uint256,uint256)") {
            self.rpt = word(data, 0)?.into();
            self.updated = small(word(data, 1)?)?;
            self.allocated = word(data, 2)?.into();
            let wallet = self.wallets.entry(address(arg(1)?, 0)?).or_default();
            wallet.weight = small(word(data, 3)?)?;
            wallet.paid = word(data, 4)?.into();
            wallet.pending = word(data, 5)?.into();
        } else if is("MiningRewardsAdded(uint256,uint256,uint256,uint256,uint256,uint256)") {
            self.funding = Some(Funding {
                base: word(data, 1)?.into(),
                referral: word(data, 2)?.into(),
                at: small(word(data, 3)?)?,
                released: word(data, 4)?.into(),
                remaining: word(data, 5)?.into(),
            });
        } else if is("AdRevenueSplit(uint256,uint256)") {
            self.ad_team = hex(uint(&self.ad_team)?.wrapping_add(&uint(word(data, 0)?)?));
            self.ad_reserve = hex(uint(&self.ad_reserve)?.wrapping_add(&uint(word(data, 1)?)?));
        } else if is("RevenueWithdrawn(address,uint256)") {
            self.ad_team = hex(uint(&self.ad_team)?.wrapping_sub(&uint(word(data, 0)?)?));
        } else if is("AdRewardsReinvested(uint256,uint256)") {
            self.ad_reserve = hex(uint(&self.ad_reserve)?.wrapping_sub(&uint(word(data, 0)?)?));
            self.ad_reinvested =
                hex(uint(&self.ad_reinvested)?.wrapping_add(&uint(word(data, 1)?)?));
        } else if is("MiningStarted(uint256)") {
            self.started = small(word(data, 0)?)?;
            self.updated = self.started;
        } else if is("Staked(address,uint256)") || is("Withdrawn(address,uint256)") {
            let wallet = self.wallets.entry(address(arg(1)?, 0)?).or_default();
            let n = small(word(data, 0)?)?;
            if is("Staked(address,uint256)") {
                wallet.weight = wallet.weight.checked_add(n).ok_or_else(invalid)?;
                self.total_weight = self.total_weight.checked_add(n).ok_or_else(invalid)?;
            } else {
                wallet.weight = wallet.weight.checked_sub(n).ok_or_else(invalid)?;
                self.total_weight = self.total_weight.checked_sub(n).ok_or_else(invalid)?;
            }
        } else if is("RewardPaid(address,uint256)") {
            let account = address(arg(1)?, 0)?;
            self.wallets.entry(account.clone()).or_default().pending = zero();
            self.claimed = hex(uint(&self.claimed)?.wrapping_add(&uint(word(data, 0)?)?));
            self.recipients.insert(account);
            self.recipient_count = self.recipients.len();
        } else if is("ReferralBound(address,address)") {
            self.wallets
                .entry(address(arg(1)?, 0)?)
                .or_default()
                .referrer = address(arg(2)?, 0)?;
        } else if is("ReferralAccrued(address,address,uint256,uint256)") {
            let wallet = self.wallets.entry(address(arg(2)?, 0)?).or_default();
            let n = uint(word(data, 1)?)?;
            wallet.referral_pending = hex(uint(&wallet.referral_pending)?.wrapping_add(&n));
            wallet.referral_earned = hex(uint(&wallet.referral_earned)?.wrapping_add(&n));
        } else if is("ReferralPaid(address,uint256)") {
            let account = address(arg(1)?, 0)?;
            self.wallets
                .entry(account.clone())
                .or_default()
                .referral_pending = zero();
            let n = uint(word(data, 0)?)?;
            self.claimed = hex(uint(&self.claimed)?.wrapping_add(&n));
            self.referral_bonus = hex(uint(&self.referral_bonus)?.wrapping_add(&n));
            self.recipients.insert(account);
            self.recipient_count = self.recipients.len();
        } else if is("Transfer(address,address,uint256)") {
            let id = small(arg(3)?)?;
            let owner = address(arg(2)?, 0)?;
            self.passes
                .entry(id)
                .and_modify(|p| p.owner = owner.clone())
                .or_insert(Pass {
                    id,
                    tier: 0,
                    owner,
                    staker: None,
                    record: None,
                    image: None,
                });
        } else if is("PassMinted(address,bytes32,uint256,uint8,uint256,address)") {
            let id = small(arg(3)?)?;
            let pass = self.passes.get_mut(&id).ok_or_else(invalid)?;
            pass.tier = small(word(data, 0)?)? as u8;
            self.minted += 1;
        } else if is("PassRecorded(uint256,string,string,string,string)") {
            let id = small(arg(1)?)?;
            self.passes.get_mut(&id).ok_or_else(invalid)?.record = Some(crypto::AccountRecord {
                account: text(data, 0, 640)?,
                uuid: text(data, 1, 36)?,
                banned_at: text(data, 2, 64)?,
                plan: text(data, 3, 80)?,
            });
        } else if is("PassStaked(address,uint256,uint256)") {
            self.passes
                .get_mut(&small(arg(2)?)?)
                .ok_or_else(invalid)?
                .staker = Some(address(arg(1)?, 0)?);
        } else if is("PassUnstaked(address,uint256,uint256)") {
            self.passes
                .get_mut(&small(arg(2)?)?)
                .ok_or_else(invalid)?
                .staker = None;
        } else if is(
            "AdPublished(uint8,uint256,address,uint256,uint256,string,string,string,string[])",
        ) {
            let slot = small(arg(1)?)? as u8;
            if slot >= 6 {
                return Err(invalid());
            }
            let started = small(word(data, 2)?)? * 1000;
            let ad = Ad {
                id: slot,
                version: small(arg(2)?)?.to_string(),
                advertiser: address(data, 0)?,
                tx_hash: log["transactionHash"].as_str().map(String::from),
                bid: decimal(uint(word(data, 1)?)?)?,
                started_at: started,
                ended_at: None,
                url: text(data, 3, 300)?,
                description: text(data, 4, 320)?,
                avatar: text(data, 5, 300)?,
                tags: strings(data, 6)?,
            };
            if let Some(mut old) = self.ads.insert(slot, ad) {
                old.ended_at = Some(started);
                self.history.push(old);
            }
        }
        Ok(())
    }
    fn released(&self, time: u64) -> Result<u128, ApiError> {
        let Some(funding) = &self.funding else {
            return Ok(released(self.started, time));
        };
        let end = self.started + MINING_DURATION;
        if time >= end {
            return units(&funding.base);
        }
        if time < funding.at || funding.at >= end {
            return Err(invalid());
        }
        let additional = units(&funding.remaining)?
            .checked_mul((time - funding.at) as u128)
            .ok_or_else(invalid)?
            / (end - funding.at) as u128;
        units(&funding.released)?
            .checked_add(additional)
            .ok_or_else(invalid)
    }
    fn daily_emission(&self) -> Result<u128, ApiError> {
        let ends_at = self.started + MINING_DURATION;
        Ok(if self.started == 0 || self.total_weight == 0 || self.time >= ends_at {
            0
        } else {
            match &self.funding {
                Some(funding) => {
                    units(&funding.remaining)?
                        .checked_mul(86400)
                        .ok_or_else(invalid)?
                        / (ends_at - funding.at) as u128
                }
                None => BASE * 86400 / MINING_DURATION as u128,
            }
        })
    }
    fn mining(&self, account: Option<&str>) -> Result<Value, ApiError> {
        let ends_at = if self.started == 0 {
            0
        } else {
            self.started + MINING_DURATION
        };
        let daily = self.daily_emission()?;
        let mut rpt = uint(&self.rpt)?;
        if self.total_weight > 0 {
            let delta = self
                .released(self.time)?
                .checked_sub(self.released(self.updated)?)
                .ok_or_else(invalid)?;
            rpt = rpt.wrapping_add(
                &U256::from_u128(delta)
                    .wrapping_mul(&U256::from_u128(10u128.pow(24)))
                    .wrapping_div(&U256::from_u64(self.total_weight)),
            );
        }
        let wallet = account
            .and_then(|a| self.wallets.get(a))
            .cloned()
            .unwrap_or_default();
        let earned = U256::from_u64(wallet.weight)
            .wrapping_mul(&rpt.wrapping_sub(&uint(&wallet.paid)?))
            .wrapping_div(&U256::from_u128(10u128.pow(24)))
            .wrapping_add(&uint(&wallet.pending)?);
        let owned = self
            .passes
            .values()
            .filter(|p| account.is_some_and(|a| p.owner == a))
            .collect::<Vec<_>>();
        let staked = self
            .passes
            .values()
            .filter(|p| account.is_some_and(|a| p.staker.as_deref() == Some(a)))
            .collect::<Vec<_>>();
        let passes = owned
            .iter()
            .take(50)
            .map(|p| json!({"id":p.id.to_string(),"tier":p.tier,"staked":false,"record":p.record,"image":p.image}))
            .chain(staked.iter().take(50).map(
                |p| json!({"id":p.id.to_string(),"tier":p.tier,"staked":true,"record":p.record,"image":p.image}),
            ))
            .collect::<Vec<_>>();
        let base = self
            .funding
            .as_ref()
            .map(|v| units(&v.base))
            .transpose()?
            .unwrap_or(BASE);
        let referral = self
            .funding
            .as_ref()
            .map(|v| units(&v.referral))
            .transpose()?
            .unwrap_or(POOL - BASE);
        Ok(
            json!({"startedAt":self.started,"endsAt":ends_at,"durationDays":365,"daily":amount(U256::from_u128(daily))?,"totalWeight":self.total_weight,"totalEffective":self.total_weight,"minted":self.minted,"claimed":amount(uint(&self.claimed)?)?,"passes":passes,"ownedCount":owned.len(),"stakedCount":staked.len(),"earned":amount(earned)?,"weight":wallet.weight,"effective":wallet.weight,"shareBps":if self.total_weight==0 {0} else {(wallet.weight as u128*10000/self.total_weight as u128) as u64},"referrer":wallet.referrer,"referralRewards":amount(uint(&wallet.referral_pending)?)?,"referralEarned":amount(uint(&wallet.referral_earned)?)?,"poolBudget":amount(U256::from_u128(base.checked_add(referral).ok_or_else(invalid)?))?,"basePool":amount(U256::from_u128(base))?,"referralPool":amount(U256::from_u128(referral))?,"adTeamRevenue":amount(uint(&self.ad_team)?)?,"adBuybackReserve":amount(uint(&self.ad_reserve)?)?,"adReinvested":amount(uint(&self.ad_reinvested)?)?,"estimated":true}),
        )
    }
}
fn units(value: &str) -> Result<u128, ApiError> {
    u128::from_str_radix(value, 16).map_err(|_| invalid())
}
fn decimal(v: U256) -> Result<String, ApiError> {
    let bytes = v.to_be_bytes();
    if bytes[..16].iter().any(|v| *v != 0) {
        return Err(invalid());
    }
    Ok(u128::from_be_bytes(bytes[16..].try_into().map_err(|_| invalid())?).to_string())
}
#[derive(Clone)]
pub struct Tracker {
    pub market: String,
    start: u64,
    cache: Arc<Mutex<Cache>>,
}
struct Cache {
    snapshot: Snapshot,
    connected: bool,
    syncing: bool,
    seen: u64,
    last_error: Option<&'static str>,
    replay: bool,
    network: Option<Value>,
}
impl Tracker {
    pub fn from_env() -> Result<Option<Self>, Box<dyn std::error::Error>> {
        let ws = std::env::var("ONHOLD_CHAIN_WS_URL").ok();
        let start = std::env::var("ONHOLD_MARKET_FROM_BLOCK").ok();
        match (ws, start) {
            (None, None) => Ok(None),
            (Some(_), None) if std::env::var("ONHOLD_MARKET_ADDRESS").is_err() => Ok(None),
            (Some(ws), Some(start)) => {
                let market = crypto::address(&std::env::var("ONHOLD_MARKET_ADDRESS")?)
                    .map_err(|_| "Invalid indexed market")?;
                let url = reqwest::Url::parse(&ws)?;
                if url.scheme() != "wss"
                    && !(url.scheme() == "ws"
                        && matches!(url.host_str(), Some("127.0.0.1" | "localhost")))
                {
                    return Err("Use a secure WebSocket provider".into());
                }
                let start = start.parse::<u64>()?;
                if start == 0 {
                    return Err("Set the actual deployment block".into());
                }
                Ok(Some(Self {
                    market,
                    start,
                    cache: Arc::new(Mutex::new(Cache {
                        snapshot: Snapshot::new(start),
                        connected: false,
                        syncing: true,
                        seen: 0,
                        last_error: None,
                        replay: false,
                        network: None,
                    })),
                }))
            }
            _ => Err("Configure ONHOLD_CHAIN_WS_URL and ONHOLD_MARKET_FROM_BLOCK together".into()),
        }
    }
}
#[derive(Default)]
struct Dirty {
    wallets: BTreeSet<String>,
    passes: BTreeSet<u64>,
    ads: BTreeSet<(u8, String)>,
    payees: BTreeSet<String>,
}
impl Dirty {
    fn collect(&mut self, snapshot: &Snapshot, log: &Value) -> Result<(), ApiError> {
        let topics = log["topics"].as_array().ok_or_else(invalid)?;
        let topic = topics.first().and_then(Value::as_str).ok_or_else(invalid)?;
        let is = |signature: &str| topic == crypto::hex(&crypto::keccak(signature));
        let arg = |n: usize| -> Result<&str, ApiError> {
            topics
                .get(n)
                .and_then(Value::as_str)
                .and_then(|v| v.strip_prefix("0x"))
                .ok_or_else(invalid)
        };
        if is("RewardsCheckpoint(address,uint256,uint256,uint256,uint256,uint256,uint256)")
            || is("Staked(address,uint256)")
            || is("Withdrawn(address,uint256)")
            || is("ReferralBound(address,address)")
        {
            self.wallets.insert(address(arg(1)?, 0)?);
        }
        if is("RewardPaid(address,uint256)") || is("ReferralPaid(address,uint256)") {
            let account = address(arg(1)?, 0)?;
            self.wallets.insert(account.clone());
            self.payees.insert(account);
        }
        if is("ReferralAccrued(address,address,uint256,uint256)") {
            self.wallets.insert(address(arg(2)?, 0)?);
        }
        if is("Transfer(address,address,uint256)")
            || is("PassMinted(address,bytes32,uint256,uint8,uint256,address)")
        {
            self.passes.insert(small(arg(3)?)?);
        }
        if is("PassRecorded(uint256,string,string,string,string)") {
            self.passes.insert(small(arg(1)?)?);
        }
        if is("PassStaked(address,uint256,uint256)") || is("PassUnstaked(address,uint256,uint256)")
        {
            self.passes.insert(small(arg(2)?)?);
        }
        if is("AdPublished(uint8,uint256,address,uint256,uint256,string,string,string,string[])") {
            let slot = small(arg(1)?)? as u8;
            let version = small(arg(2)?)?.to_string();
            self.ads.insert((slot, version));
            if let Some(ad) = snapshot.ads.get(&slot) {
                self.ads.insert((slot, ad.version.clone()));
            }
        }
        Ok(())
    }
}
impl Snapshot {
    fn global(&self) -> Value {
        json!({"next_block":self.next_block,"block":self.block,"hash":self.hash,"time":self.time,"started":self.started,"updated":self.updated,"total_weight":self.total_weight,"rpt":self.rpt,"allocated":self.allocated,"minted":self.minted,"claimed":self.claimed,"referral_bonus":self.referral_bonus,"funding":self.funding,"mock_minimum":self.mock_minimum,"ad_price_interval":self.ad_price_interval,"ad_team":self.ad_team,"ad_reserve":self.ad_reserve,"ad_reinvested":self.ad_reinvested,"recipient_count":self.recipient_count,"recipients":[],"wallets":{},"passes":{},"ads":{},"history":[]})
    }
}
async fn load_model(
    store: &pg::Store,
    tracker: &Tracker,
    full: bool,
    wallet: Option<&str>,
) -> Result<(Snapshot, usize, usize, usize), ApiError> {
    let mut client = store.read.get().await.map_err(|_| pg::error())?;
    let tx = client
        .build_transaction()
        .isolation_level(tokio_postgres::IsolationLevel::RepeatableRead)
        .read_only(true)
        .start()
        .await
        .map_err(|_| pg::error())?;
    let row = tx
        .query_opt(
            "SELECT data FROM chain_state WHERE market=$1",
            &[&tracker.market],
        )
        .await
        .map_err(|_| pg::error())?;
    let mut model = match row {
        Some(r) => serde_json::from_value::<Snapshot>(r.get(0)).map_err(|_| invalid())?,
        None => Snapshot::new(tracker.start),
    };
    let wallets = if full {
        tx.query(
            "SELECT wallet,data FROM chain_wallets WHERE market=$1",
            &[&tracker.market],
        )
        .await
    } else {
        tx.query(
            "SELECT wallet,data FROM chain_wallets WHERE market=$1 AND wallet=$2",
            &[&tracker.market, &wallet.unwrap_or(ZERO)],
        )
        .await
    }
    .map_err(|_| pg::error())?;
    for row in wallets {
        model.wallets.insert(
            row.get(0),
            serde_json::from_value(row.get(1)).map_err(|_| invalid())?,
        );
    }
    let rows=if full {tx.query("SELECT token_id,tier,owner,staker,metadata_hash FROM chain_nfts WHERE market=$1 ORDER BY token_id",&[&tracker.market]).await}else if let Some(wallet)=wallet {tx.query("(SELECT token_id,tier,owner,staker,metadata_hash FROM chain_nfts WHERE market=$1 AND owner=$2 ORDER BY token_id LIMIT 50) UNION (SELECT token_id,tier,owner,staker,metadata_hash FROM chain_nfts WHERE market=$1 AND staker=$2 ORDER BY token_id LIMIT 50)",&[&tracker.market,&wallet]).await}else {Ok(Vec::new())}.map_err(|_|pg::error())?;
    let hashes = rows
        .iter()
        .filter_map(|r| r.get::<_, Option<String>>(4))
        .collect::<Vec<_>>();
    let cached = if full {
        vec![None; hashes.len()]
    } else {
        store.metadata(&hashes).await
    };
    let mut records: BTreeMap<String, Value> = hashes
        .iter()
        .cloned()
        .zip(cached)
        .filter_map(|(hash, value)| value.map(|v| (hash, v)))
        .collect();
    let missing = hashes
        .iter()
        .filter(|h| !records.contains_key(*h))
        .cloned()
        .collect::<Vec<_>>();
    if !missing.is_empty() {
        for row in tx.query("SELECT metadata_hash,record,image FROM chain_nfts WHERE market=$1 AND metadata_hash=ANY($2)",&[&tracker.market,&missing]).await.map_err(|_|pg::error())? {let hash:String=row.get(0);let record=json!({"record":row.get::<_,Value>(1),"image":row.get::<_,Option<String>>(2)});if !full {store.cache_metadata(&hash,&record).await;}records.insert(hash,record);}
    }
    for row in rows {
        let id = row.get::<_, i64>(0) as u64;
        let metadata = row
            .get::<_, Option<String>>(4)
            .and_then(|h| records.get(&h));
        let record = metadata
            .and_then(|v| v.get("record"))
            .cloned()
            .map(serde_json::from_value)
            .transpose()
            .map_err(|_| invalid())?;
        let image = metadata
            .and_then(|v| v["image"].as_str())
            .map(str::to_string);
        model.passes.insert(
            id,
            Pass {
                id,
                tier: row.get::<_, i16>(1) as u8,
                owner: row.get(2),
                staker: row.get(3),
                record,
                image,
            },
        );
    }
    let (owned, staked) = if let Some(wallet) = wallet {
        let row=tx.query_one("SELECT (SELECT count(*) FROM chain_nfts WHERE market=$1 AND owner=$2),(SELECT count(*) FROM chain_nfts WHERE market=$1 AND staker=$2)",&[&tracker.market,&wallet]).await.map_err(|_|pg::error())?;
        (row.get::<_, i64>(0) as usize, row.get::<_, i64>(1) as usize)
    } else {
        (0, 0)
    };
    let rows=if full {tx.query("SELECT data FROM chain_ads WHERE market=$1 ORDER BY started_at,slot,version",&[&tracker.market]).await}else {tx.query("(SELECT data FROM chain_ads WHERE market=$1 AND ended_at IS NULL) UNION ALL (SELECT data FROM chain_ads WHERE market=$1 AND ended_at IS NOT NULL ORDER BY started_at DESC LIMIT 200)",&[&tracker.market]).await}.map_err(|_|pg::error())?;
    for row in rows {
        let ad: Ad = serde_json::from_value(row.get(0)).map_err(|_| invalid())?;
        if ad.ended_at.is_some() {
            model.history.push(ad);
        } else {
            model.ads.insert(ad.id, ad);
        }
    }
    model.history.sort_by_key(|ad| ad.started_at);
    if full {
        for row in tx
            .query(
                "SELECT wallet FROM chain_payees WHERE market=$1",
                &[&tracker.market],
            )
            .await
            .map_err(|_| pg::error())?
        {
            model.recipients.insert(row.get(0));
        }
    }
    let total = tx
        .query_one(
            "SELECT count(*) FROM chain_ads WHERE market=$1 AND ended_at IS NOT NULL",
            &[&tracker.market],
        )
        .await
        .map_err(|_| pg::error())?
        .get::<_, i64>(0) as usize;
    tx.commit().await.map_err(|_| pg::error())?;
    Ok((model, owned, staked, total))
}
async fn persist_model(
    store: &pg::Store,
    tracker: &Tracker,
    model: &Snapshot,
    dirty: &Dirty,
    logs: &[Value],
    reset: bool,
) -> Result<(), ApiError> {
    let mut client = store.write.lock().await;
    let tx = client.transaction().await.map_err(|_| pg::error())?;
    if reset {
        for table in [
            "chain_wallets",
            "chain_nfts",
            "chain_ads",
            "chain_events",
            "chain_payees",
        ] {
            tx.execute(
                &format!("DELETE FROM {table} WHERE market=$1"),
                &[&tracker.market],
            )
            .await
            .map_err(|_| pg::error())?;
        }
    }
    for account in &dirty.wallets {
        let value = serde_json::to_value(model.wallets.get(account).ok_or_else(invalid)?)
            .map_err(|_| invalid())?;
        tx.execute("INSERT INTO chain_wallets(market,wallet,data) VALUES($1,$2,$3) ON CONFLICT(market,wallet) DO UPDATE SET data=excluded.data",&[&tracker.market,account,&value]).await.map_err(|_|pg::error())?;
    }
    for id in &dirty.passes {
        let pass = model.passes.get(id).ok_or_else(invalid)?;
        let record = pass
            .record
            .as_ref()
            .map(serde_json::to_value)
            .transpose()
            .map_err(|_| invalid())?;
        let hash = record.as_ref().map(|r| {
            crypto::hex(&crypto::keccak(
                json!({"record":r,"image":pass.image}).to_string(),
            ))
        });
        tx.execute("INSERT INTO chain_nfts(market,token_id,tier,owner,staker,metadata_hash,record,image) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(market,token_id) DO UPDATE SET tier=excluded.tier,owner=excluded.owner,staker=excluded.staker,metadata_hash=excluded.metadata_hash,record=excluded.record,image=excluded.image",&[&tracker.market,&(*id as i64),&(pass.tier as i16),&pass.owner,&pass.staker,&hash,&record,&pass.image]).await.map_err(|_|pg::error())?;
    }
    for (slot, version) in &dirty.ads {
        let ad = model
            .ads
            .get(slot)
            .filter(|a| &a.version == version)
            .or_else(|| {
                model
                    .history
                    .iter()
                    .rev()
                    .find(|a| a.id == *slot && &a.version == version)
            })
            .ok_or_else(invalid)?;
        let data = serde_json::to_value(ad).map_err(|_| invalid())?;
        tx.execute("INSERT INTO chain_ads(market,slot,version,bid,started_at,ended_at,data) VALUES($1,$2,$3,$4::text::numeric,$5,$6,$7) ON CONFLICT(market,slot,version) DO UPDATE SET ended_at=excluded.ended_at,data=excluded.data",&[&tracker.market,&(*slot as i16),&(version.parse::<i64>().map_err(|_|invalid())?),&ad.bid,&(ad.started_at as i64),&ad.ended_at.map(|v|v as i64),&data]).await.map_err(|_|pg::error())?;
    }
    for account in &dirty.payees {
        tx.execute(
            "INSERT INTO chain_payees(market,wallet) VALUES($1,$2) ON CONFLICT DO NOTHING",
            &[&tracker.market, account],
        )
        .await
        .map_err(|_| pg::error())?;
    }
    for log in logs {
        let hash = log["transactionHash"].as_str().ok_or_else(invalid)?;
        tx.execute("INSERT INTO chain_events(market,tx_hash,log_index,block_number,data) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING",&[&tracker.market,&hash,&(quantity(&log["logIndex"])? as i64),&(quantity(&log["blockNumber"])? as i64),log]).await.map_err(|_|pg::error())?;
    }
    tx.execute("INSERT INTO chain_state(market,data) VALUES($1,$2) ON CONFLICT(market) DO UPDATE SET data=excluded.data",&[&tracker.market,&model.global()]).await.map_err(|_|pg::error())?;
    tx.commit().await.map_err(|_| pg::error())
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReadRequest {
    market: Option<String>,
    wallet: Option<String>,
}
pub async fn transaction_status(State(state):State<AppState>,Path(hash):Path<String>) -> Result<impl axum::response::IntoResponse,ApiError> {
    if !hash.starts_with("0x") || crypto::bytes(&hash,32).is_err() { return Err(ApiError(StatusCode::BAD_REQUEST,"invalid_transaction")); }
    let tracker=state.mining.as_ref().ok_or(ApiError(StatusCode::SERVICE_UNAVAILABLE,"chain_not_configured"))?;
    let confirmed=health(&state)?["confirmed_block"].as_u64().unwrap_or(0);
    // Confirmed market events survive RPC nodes returning null for old receipts.
    let topics:Vec<String>=["PassStaked(address,uint256,uint256)","PassUnstaked(address,uint256,uint256)","RewardPaid(address,uint256)","ReferralPaid(address,uint256)"].iter().map(|signature|crypto::hex(&crypto::keccak(signature))).collect();
    let store=state.pg.as_ref().ok_or_else(pg::error)?;
    let client=store.read.get().await.map_err(|_|pg::error())?;
    let indexed=client.query_opt("SELECT block_number,data->'topics'->>1 FROM chain_events WHERE market=$1 AND tx_hash=$2 AND block_number<=$3 AND data->'topics'->>0=ANY($4) ORDER BY log_index LIMIT 1",&[&tracker.market,&hash.to_lowercase(),&(confirmed as i64),&topics]).await.map_err(|_|pg::error())?;
    drop(client);
    if let Some(row)=indexed {
        let actor:String=row.get(1);
        let from=crypto::address(&format!("0x{}",actor.get(26..).ok_or_else(invalid)?)).map_err(|_|invalid())?;
        return Ok(([(header::CACHE_CONTROL,"no-store")],Json(json!({"hash":hash,"chainId":97,"market":tracker.market,"status":"confirmed","blockNumber":row.get::<_,i64>(0),"confirmedBlock":confirmed,"from":from}))));
    }
    let receipt=tokio::time::timeout(std::time::Duration::from_secs(5),rpc(&state,"eth_getTransactionReceipt",json!([hash]))).await.map_err(|_|ApiError(StatusCode::SERVICE_UNAVAILABLE,"transaction_status_unavailable"))??;
    let mut value=json!({"hash":hash,"chainId":97,"market":tracker.market,"status":"pending"});
    if !receipt.is_null() {
        if receipt["transactionHash"].as_str().map(str::to_lowercase)!=Some(hash.to_lowercase()) || receipt["to"].as_str().map(str::to_lowercase)!=Some(tracker.market.clone()) { return Err(ApiError(StatusCode::BAD_REQUEST,"invalid_transaction")); }
        let block=quantity(&receipt["blockNumber"])?;
        let confirmed=health(&state)?["confirmed_block"].as_u64().unwrap_or(0);
        let status=match receipt["status"].as_str() { Some("0x0")=>"failed",Some("0x1") if confirmed>=block=>"confirmed",Some("0x1")=>"confirming",_=>return Err(invalid()) };
        value["status"]=json!(status);value["blockNumber"]=json!(block);value["confirmedBlock"]=json!(confirmed);value["from"]=receipt["from"].clone();
    }
    Ok(([(header::CACHE_CONTROL,"no-store")],Json(value)))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AdsQuery { page: Option<u32> }
pub async fn ads(State(state): State<AppState>, Query(query): Query<AdsQuery>) -> Result<impl axum::response::IntoResponse, ApiError> {
    let requested=query.page.unwrap_or(1);
    if requested==0 { return Err(ApiError(StatusCode::BAD_REQUEST,"invalid_page")); }
    let Some(tracker)=state.mining.as_ref() else { return Ok(([(header::CACHE_CONTROL,"no-store")],Json(json!({"configured":false,"items":[]})))); };
    let snapshot=crate::analytics::read(&state).await?.0;
    let counts=json!(snapshot.campaigns.iter().filter(|((market,_,_),_)|market==&tracker.market).map(|((_,slot,version),counts)|json!({"slot":slot,"version":version,"clicks":counts.clicks,"uv":counts.uv})).collect::<Vec<_>>());
    let store=state.pg.as_ref().ok_or_else(pg::error)?;
    let mut client=store.read.get().await.map_err(|_|pg::error())?;
    let tx=client.build_transaction().isolation_level(tokio_postgres::IsolationLevel::RepeatableRead).read_only(true).start().await.map_err(|_|pg::error())?;
    let total:i64=tx.query_one("SELECT count(*) FROM chain_ads WHERE market=$1",&[&tracker.market]).await.map_err(|_|pg::error())?.get(0);
    let pages=((total+9)/10).max(1);let page=(requested as i64).min(pages);let offset=(page-1)*10;
    let signature=crypto::hex(&crypto::keccak("AdPublished(uint8,uint256,address,uint256,uint256,string,string,string,string[])"));
    // Resolve legacy projections from indexed events; new ads persist their publication hash directly.
    let rows=tx.query("WITH counts AS (SELECT * FROM jsonb_to_recordset($2) AS c(slot smallint,version bigint,clicks bigint,uv bigint)) SELECT a.data,COALESCE(c.clicks,0),COALESCE(c.uv,0),COALESCE(a.data->>'txHash',(SELECT e.tx_hash FROM chain_events e WHERE e.market=a.market AND e.data->'topics'->>0=$4 AND e.data->'topics'->>1='0x'||lpad(to_hex(a.slot::int),64,'0') AND e.data->'topics'->>2='0x'||lpad(to_hex(a.version),64,'0') ORDER BY e.block_number DESC,e.log_index DESC LIMIT 1)) FROM chain_ads a LEFT JOIN counts c ON c.slot=a.slot AND c.version=a.version WHERE a.market=$1 ORDER BY COALESCE(c.clicks,0) DESC,a.started_at DESC,a.slot,a.version DESC LIMIT 10 OFFSET $3",&[&tracker.market,&counts,&offset,&signature]).await.map_err(|_|pg::error())?;
    let items=rows.into_iter().map(|row|{let mut ad:Value=row.get(0);ad["clicks"]=json!(row.get::<_,i64>(1));ad["uv"]=json!(row.get::<_,i64>(2));ad["txHash"]=json!(row.get::<_,Option<String>>(3));ad}).collect::<Vec<_>>();
    tx.commit().await.map_err(|_|pg::error())?;
    Ok(([(header::CACHE_CONTROL,"no-store")],Json(json!({"configured":true,"market":tracker.market,"page":page,"pages":pages,"pageSize":10,"total":total,"updatedAt":snapshot.stats.updated_at,"items":items}))))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct GalleryRequest {
    market: Option<String>,
    wallet: Option<String>,
    position: Option<String>,
    tier: Option<String>,
    page: Option<u32>,
    page_size: Option<u32>,
}
pub async fn gallery(
    State(state): State<AppState>,
    Query(query): Query<GalleryRequest>,
) -> Result<impl axum::response::IntoResponse, ApiError> {
    let tier: i16 = match query.tier.as_deref().unwrap_or("all") {
        "all" => -1,
        "free" => 0,
        "pro" => 1,
        "max" => 2,
        _ => return Err(ApiError(StatusCode::BAD_REQUEST, "invalid_tier")),
    };
    let wallet=query.wallet.as_deref().map(crypto::address).transpose().map_err(|_|ApiError(StatusCode::BAD_REQUEST,"invalid_wallet"))?;
    let position=query.position.as_deref().unwrap_or("");
    if wallet.is_some()!=query.position.is_some() || !matches!(position,""|"owned"|"staked") {return Err(ApiError(StatusCode::BAD_REQUEST,"invalid_position"));}
    let requested = query.page.unwrap_or(1);
    let size = query.page_size.unwrap_or(12);
    if requested == 0 || size == 0 || size > 24 {
        return Err(ApiError(StatusCode::BAD_REQUEST, "invalid_page"));
    }
    let Some(tracker) = state.mining.as_ref() else {
        return Ok((
            [(header::CACHE_CONTROL, "no-store")],
            Json(json!({"configured":false,"available":false,"items":[]})),
        ));
    };
    if query
        .market
        .as_deref()
        .is_some_and(|v| crypto::address(v).ok().as_deref() != Some(tracker.market.as_str()))
    {
        return Err(ApiError(StatusCode::BAD_REQUEST, "market_mismatch"));
    }
    let store = state.pg.as_ref().ok_or_else(pg::error)?;
    let mut client = store.read.get().await.map_err(|_| pg::error())?;
    let tx = client
        .build_transaction()
        .isolation_level(tokio_postgres::IsolationLevel::RepeatableRead)
        .read_only(true)
        .start()
        .await
        .map_err(|_| pg::error())?;
    let total: i64 = tx
        .query_one(
            "SELECT count(*) FROM chain_nfts WHERE market=$1 AND ($2::smallint=-1 OR tier=$2) AND ($3::text IS NULL OR ($4::text='staked' AND staker=$3) OR ($4::text='owned' AND owner=$3 AND staker IS NULL))",
            &[&tracker.market, &tier, &wallet, &position],
        )
        .await
        .map_err(|_| pg::error())?
        .get(0);
    let pages = ((total + size as i64 - 1) / size as i64).max(1);
    let page = (requested as i64).min(pages);
    let offset = (page - 1) * size as i64;
    let rows=tx.query("SELECT token_id,tier,record,image,owner,staker FROM chain_nfts WHERE market=$1 AND ($2::smallint=-1 OR tier=$2) AND ($3::text IS NULL OR ($4::text='staked' AND staker=$3) OR ($4::text='owned' AND owner=$3 AND staker IS NULL)) ORDER BY token_id DESC LIMIT $5 OFFSET $6",&[&tracker.market,&tier,&wallet,&position,&(size as i64),&offset]).await.map_err(|_|pg::error())?;
    let items=rows.into_iter().map(|row|json!({"id":row.get::<_,i64>(0).to_string(),"tier":row.get::<_,i16>(1),"record":row.get::<_,Option<Value>>(2),"image":row.get::<_,Option<String>>(3),"owner":row.get::<_,String>(4),"staked":row.get::<_,Option<String>>(5).is_some(),"staker":row.get::<_,Option<String>>(5)})).collect::<Vec<_>>();
    let cursor = tx
        .query_opt(
            "SELECT data FROM chain_state WHERE market=$1",
            &[&tracker.market],
        )
        .await
        .map_err(|_| pg::error())?
        .map(|r| r.get::<_, Value>(0));
    tx.commit().await.map_err(|_| pg::error())?;
    let cache = tracker.cache.lock().map_err(|_| crate::internal())?;
    Ok((
        [(header::CACHE_CONTROL, "no-store")],
        Json(
            json!({"configured":true,"available":cursor.as_ref().and_then(|v|v["block"].as_u64()).is_some_and(|block|block>=tracker.start),"stale":!cache.connected||cache.syncing||now().saturating_sub(cache.seen)>=60||now().saturating_sub(cursor.as_ref().and_then(|v|v["time"].as_u64()).unwrap_or(0))>=60,"connected":cache.connected,"syncing":cache.syncing,"storage":"postgresql","market":tracker.market,"wallet":wallet,"position":query.position,"tier":query.tier.unwrap_or_else(||"all".into()),"page":page,"page_size":size,"total":total,"pages":pages,"confirmed_block":cursor.as_ref().and_then(|v|v["block"].as_u64()),"items":items}),
        ),
    ))
}
pub async fn snapshot(
    State(state): State<AppState>,
    Query(query): Query<ReadRequest>,
) -> Result<impl axum::response::IntoResponse, ApiError> {
    let Some(tracker) = state.mining.clone() else {
        return Ok((
            [(header::CACHE_CONTROL, "no-store")],
            Json(json!({"configured":false,"available":false})),
        ));
    };
    if query
        .market
        .as_deref()
        .is_some_and(|v| crypto::address(v).ok().as_deref() != Some(tracker.market.as_str()))
    {
        return Err(ApiError(StatusCode::BAD_REQUEST, "market_mismatch"));
    }
    let wallet = query
        .wallet
        .map(|v| {
            crypto::address(&v).map_err(|_| ApiError(StatusCode::BAD_REQUEST, "invalid_wallet"))
        })
        .transpose()?;
    let store = state.pg.as_ref().ok_or_else(pg::error)?;
    let (connected, syncing, seen) = {
        let cache = tracker.cache.lock().map_err(|_| crate::internal())?;
        (cache.connected, cache.syncing, cache.seen)
    };
    let (data, owned, staked, history_total) =
        load_model(store, &tracker, false, wallet.as_deref()).await?;
    let available = data.block >= tracker.start;
    let stale = !connected || syncing || now().saturating_sub(seen) >= 60 || now().saturating_sub(data.time) >= 60;
    let mut ads=(0..6).map(|id|data.ads.get(&id).map(|ad|serde_json::to_value(ad).map_err(|_|invalid())).unwrap_or_else(||Ok(json!({"id":id,"empty":true,"bid":"0","startedAt":0,"version":"0","url":"https://example.com/","description":"","avatar":"","tags":[]})))).collect::<Result<Vec<_>,_>>()?;
    if let Some(minimum) = &data.mock_minimum {
        let minimum = units(minimum)?.to_string();
        for ad in &mut ads {
            ad["minimumBid"] = json!(minimum);
        }
    }
    let mut history = data
        .history
        .iter()
        .rev()
        .take(200)
        .map(|ad| serde_json::to_value(ad).map_err(|_| invalid()))
        .collect::<Result<Vec<_>, _>>()?;
    for ad in ads.iter_mut().chain(history.iter_mut()) {
        ad["priceIntervalSeconds"] = json!(data.ad_price_interval.unwrap_or(86400));
    }
    let telemetry = crate::analytics::read(&state).await?.0;
    crate::analytics::apply_campaigns(&telemetry, &tracker.market, &mut ads);
    crate::analytics::apply_campaigns(&telemetry, &tracker.market, &mut history);
    let mut mining = data.mining(wallet.as_deref())?;
    mining["network"] = cached_network(&state).await.and_then(|v| v.get("latest").cloned()).unwrap_or(Value::Null);
    mining["ownedCount"] = json!(owned);
    mining["stakedCount"] = json!(staked);
    let burned = burned_total(&state).await?;
    let client = store.read.get().await.map_err(|_| pg::error())?;
    let claim_rows = client.query(
        "SELECT data FROM chain_events WHERE market=$1 AND block_number<=$2 AND data->'topics'->>0 IN ($3,$4) ORDER BY block_number DESC,log_index DESC LIMIT 8",
        &[&tracker.market,&(data.block as i64),&crypto::hex(&crypto::keccak("RewardPaid(address,uint256)")),&crypto::hex(&crypto::keccak("ReferralPaid(address,uint256)"))],
    ).await.map_err(|_| pg::error())?;
    let claims = claim_rows.into_iter().map(|row| {
        let log:Value=row.get(0);
        let raw=log["data"].as_str().and_then(|s|s.strip_prefix("0x")).ok_or_else(invalid)?;
        let recipient=log["topics"][1].as_str().and_then(|s|s.strip_prefix("0x")).ok_or_else(invalid)?;
        Ok(json!({"amount":amount(uint(word(raw,0)?)?)?,"recipient":address(recipient,0)?,"txHash":log["transactionHash"],"block":quantity(&log["blockNumber"])?}))
    }).collect::<Result<Vec<Value>,ApiError>>()?;
    Ok((
        [(header::CACHE_CONTROL, "no-store")],
        Json(
            json!({"configured":true,"available":available,"stale":stale,"connected":connected,"syncing":syncing,"last_error":tracker.cache.lock().map_err(|_|crate::internal())?.last_error,"chain_id":97,"protocol":"nft-staking-v4","mock":data.mock_minimum.is_some(),"market":tracker.market,"storage":"postgresql","metadata_cache":store.redis.is_some(),"confirmed_block":data.block,"block_hash":data.hash,"as_of":data.time,"mining":mining,"ads":ads,"history":history,"historyTotal":history_total,"financial":{"claims":claims,"recipients":data.recipient_count,"claimed":amount(uint(&data.claimed)?)?,"burned":burned,"marketAddress":tracker.market}}),
        ),
    ))
}

pub async fn backfill(state: &AppState, tracker: &Tracker, head: u64) -> Result<bool, ApiError> {
    let mut reset = tracker.cache.lock().map_err(|_| crate::internal())?.replay;
    let latest = head.saturating_sub(3);
    let mut model = tracker
        .cache
        .lock()
        .map_err(|_| crate::internal())?
        .snapshot
        .clone();
    if model.block > 0 {
        let old = rpc(
            state,
            "eth_getBlockByNumber",
            json!([format!("0x{:x}", model.block), false]),
        )
        .await?;
        if old["hash"] != model.hash {
            model = Snapshot::new(tracker.start);
            reset = true;
            tracker.cache.lock().map_err(|_| crate::internal())?.syncing = true;
        }
    }
    if model.next_block > latest {
        return Ok(false);
    }
    let to = (model.next_block + 999).min(latest);
    let header = rpc(
        state,
        "eth_getBlockByNumber",
        json!([format!("0x{to:x}"), false]),
    )
    .await?;
    let logs=rpc(state,"eth_getLogs",json!([{"address":tracker.market,"fromBlock":format!("0x{:x}",model.next_block),"toBlock":format!("0x{to:x}")}])).await?;
    if rpc(
        state,
        "eth_getBlockByNumber",
        json!([format!("0x{to:x}"), false]),
    )
    .await?["hash"]
        != header["hash"]
    {
        return Err(invalid());
    }
    apply_logs(
        state,
        tracker,
        model,
        header,
        logs.as_array().ok_or_else(invalid)?.clone(),
        reset,
    )
    .await?;
    Ok(to < latest)
}
async fn apply_logs(
    state: &AppState,
    tracker: &Tracker,
    mut model: Snapshot,
    header: Value,
    logs: Vec<Value>,
    reset: bool,
) -> Result<(), ApiError> {
    let store = state.pg.as_ref().ok_or_else(pg::error)?;
    let to = quantity(&header["number"])?;
    let mut logs = logs;
    logs.sort_by_key(|v| {
        (
            quantity(&v["blockNumber"]).unwrap_or(u64::MAX),
            quantity(&v["logIndex"]).unwrap_or(u64::MAX),
        )
    });
    let mut dirty = Dirty::default();
    for log in &logs {
        if log["address"].as_str().map(str::to_lowercase) != Some(tracker.market.clone()) {
            return Err(invalid());
        }
        dirty.collect(&model, log)?;
        model.apply(log)?;
    }
    for id in &dirty.passes {
        let pass = model.passes.get_mut(id).ok_or_else(invalid)?;
        if pass.record.is_some() && pass.image.is_none() {
            let data = format!(
                "{}{:064x}",
                crypto::hex(&crypto::keccak("tokenURI(uint256)")[..4]),
                id
            );
            let result = rpc(
                state,
                "eth_call",
                // Pass metadata is immutable; reading it never needs an archival state node.
                json!([{"to":tracker.market,"data":data},"latest"]),
            )
            .await?;
            pass.image = Some(crate::artwork::image_from_result(&result)?);
        }
    }
    model.block = to;
    model.next_block = to + 1;
    model.hash = header["hash"]
        .as_str()
        .filter(|v| crypto::bytes(v, 32).is_ok())
        .ok_or_else(invalid)?
        .into();
    model.time = quantity(&header["timestamp"])?;
    persist_model(store, tracker, &model, &dirty, &logs, reset).await?;
    let mut cache = tracker.cache.lock().map_err(|_| crate::internal())?;
    cache.snapshot = model;
    cache.replay = false;
    Ok(())
}
pub async fn load(state: &AppState) -> Result<(), ApiError> {
    if let Some(tracker) = &state.mining {
        let store = state.pg.as_ref().ok_or_else(pg::error)?;
        let model = load_model(store, tracker, true, None).await?.0;
        tracker
            .cache
            .lock()
            .map_err(|_| crate::internal())?
            .snapshot = model;
    }
    Ok(())
}
fn validate_deployment(logs: &Value, market: &str, start: u64, header: &Value) -> Result<(), ApiError> {
    let logs = logs.as_array().ok_or_else(invalid)?;
    let mismatch = || ApiError(StatusCode::BAD_GATEWAY, "deployment_block_mismatch");
    if logs.len() != 1 { return Err(mismatch()); }
    let log = &logs[0];
    let topics = log["topics"].as_array().ok_or_else(invalid)?;
    if topics.len() != 3
        || topics[0] != crypto::hex(&crypto::keccak("OwnershipTransferred(address,address)"))
        || topics[1] != format!("0x{}", zero())
        || log["address"].as_str().map(str::to_ascii_lowercase).as_deref() != Some(market)
        || quantity(&log["blockNumber"])? != start
        || log["removed"] != false
        || log["blockHash"] != header["hash"]
        || crypto::bytes(header["hash"].as_str().unwrap_or(""), 32).is_err()
        || quantity(&header["number"])? != start
        || log["data"] != "0x"
    { return Err(mismatch()); }
    let owner = topics[2].as_str().and_then(|v| v.strip_prefix("0x")).ok_or_else(invalid)?;
    if owner.len() != 64 || address(owner, 0)? == ZERO { return Err(mismatch()); }
    Ok(())
}
pub async fn check(state: &AppState) -> Result<(), ApiError> {
    if let Some(tracker) = &state.mining {
        let result=rpc(state,"eth_call",json!([{"to":tracker.market,"data":crypto::hex(&crypto::keccak("PROTOCOL_ID()")[..4])},"latest"])).await?;
        if result != crypto::hex(&crypto::keccak("onhold.nft-staking.v4")) {
            return Err(ApiError(StatusCode::BAD_GATEWAY, "protocol_mismatch"));
        }
        // Constructor logs survive state pruning and bind the configured deployment block.
        let mut logs = rpc(
            state,
            "eth_getLogs",
            json!([{"address":tracker.market,"fromBlock":format!("0x{:x}",tracker.start),"toBlock":format!("0x{:x}",tracker.start),"topics":[crypto::hex(&crypto::keccak("OwnershipTransferred(address,address)")),format!("0x{}",zero())]}]),
        )
        .await?;
        let header = rpc(state, "eth_getBlockByNumber", json!([format!("0x{:x}",tracker.start),false])).await?;
        if logs.as_array().is_some_and(Vec::is_empty) {
            // Reuse the indexed constructor event, still binding it to a fresh canonical header.
            let store=state.pg.as_ref().ok_or_else(pg::error)?;
            let client=store.read.get().await.map_err(|_|pg::error())?;
            let rows=client.query("SELECT data FROM chain_events WHERE market=$1 AND block_number=$2 AND data->'topics'->>0=$3 AND data->'topics'->>1=$4 ORDER BY log_index",&[&tracker.market,&(tracker.start as i64),&crypto::hex(&crypto::keccak("OwnershipTransferred(address,address)")),&format!("0x{}",zero())]).await.map_err(|_|pg::error())?;
            logs=json!(rows.iter().map(|row|row.get::<_,Value>(0)).collect::<Vec<_>>());
        }
        validate_deployment(&logs, &tracker.market, tracker.start, &header)?;
    }
    Ok(())
}
pub fn health(state: &AppState) -> Result<Value, ApiError> {
    let Some(tracker) = &state.mining else { return Ok(json!({"configured":false,"available":true})); };
    let cache = tracker.cache.lock().map_err(|_| crate::internal())?;
    Ok(json!({"configured":true,"available":cache.connected&&!cache.syncing&&now().saturating_sub(cache.seen)<60&&now().saturating_sub(cache.snapshot.time)<60,"connected":cache.connected,"syncing":cache.syncing,"confirmed_block":cache.snapshot.block,"last_error":cache.last_error}))
}
pub fn status(state: &AppState, connected: bool, syncing: bool, error: Option<&'static str>) {
    if let Some(tracker) = &state.mining {
        if let Ok(mut cache) = tracker.cache.lock() {
            cache.connected = connected;
            cache.syncing = syncing;
            cache.last_error = error;
            cache.seen = now();
        }
    }
}
pub fn replay(state: &AppState) {
    if let Some(tracker) = &state.mining {
        if let Ok(mut cache) = tracker.cache.lock() {
            cache.snapshot = Snapshot::new(tracker.start);
            cache.replay = true;
            cache.syncing = true;
        }
    }
}
pub async fn apply_stream(
    state: &AppState,
    header: &Value,
    logs: &[Value],
) -> Result<(), ApiError> {
    let Some(tracker) = &state.mining else {
        return Ok(());
    };
    let model = tracker
        .cache
        .lock()
        .map_err(|_| crate::internal())?
        .snapshot
        .clone();
    if quantity(&header["number"])? < model.next_block {
        return Ok(());
    }
    let logs = logs
        .iter()
        .filter(|log| {
            log["address"].as_str() == Some(&tracker.market)
                && quantity(&log["blockNumber"]).is_ok_and(|n| n >= model.next_block)
        })
        .cloned()
        .collect();
    apply_logs(state, tracker, model, header.clone(), logs, false).await
}

const NETWORK_PERIODS: [(&str, u64, u64); 6] = [
    ("1h", 3600, 900), ("4h", 14400, 900), ("1d", 86400, 900),
    ("7d", 604800, 3600), ("30d", 2592000, 14400), ("90d", 7776000, 43200),
];
async fn burned_total(state: &AppState) -> Result<Value, ApiError> {
    let Some(burn) = &state.burn else { return Ok(Value::Null); };
    let store = state.pg.as_ref().ok_or_else(pg::error)?;
    let client = store.read.get().await.map_err(|_| pg::error())?;
    Ok(client.query_opt("SELECT data->'totals'->'burned' FROM buyback_state WHERE vault=$1 AND (data->>'confirmed_block')::bigint > 0 AND data->'totals'->'burned' IS NOT NULL", &[&burn.vault]).await.map_err(|_| pg::error())?.map(|row|row.get::<_,Value>(0)).unwrap_or(Value::Null))
}
fn network_sample(model: &Snapshot, at: u64) -> Result<Value, ApiError> {
    let daily = model.daily_emission()?;
    Ok(json!({"sampledAt":at,"asOf":model.time,"block":model.block,"totalWeight":model.total_weight,
        "financial":{"claimed":amount(uint(&model.claimed)?)?,"burned":null},
        "daily":amount(U256::from_u128(daily))?,
        "perWeightDaily":amount(U256::from_u128(if model.total_weight==0 {0} else {daily/model.total_weight as u128}))?}))
}
async fn cached_network(state: &AppState) -> Option<Value> {
    let tracker = state.mining.as_ref()?;
    let memory = tracker.cache.lock().ok()?.network.clone();
    if let Some(value) = &memory {
        if now().saturating_sub(value["latest"]["sampledAt"].as_u64().unwrap_or(0)) < 900 {
            return memory;
        }
    }
    if let Some(mut redis) = state.pg.as_ref().and_then(|s| s.redis.clone()) {
        if let Ok(Some(raw)) = redis::cmd("GET").arg(format!("onhold:mining-stats:v1:{}", tracker.market))
            .query_async::<Option<String>>(&mut redis).await {
            if let Ok(value) = serde_json::from_str::<Value>(&raw) {
                if value["market"] == tracker.market && value["latest"].is_object() { return Some(value); }
            }
        }
    }
    if memory.is_some() { return memory; }
    let store=state.pg.as_ref()?;
    let client=store.read.get().await.ok()?;
    let row=client.query_opt("SELECT data FROM mining_samples WHERE market=$1 ORDER BY sampled_at DESC LIMIT 1",&[&tracker.market]).await.ok()??;
    drop(client);
    let value=network_history(store,&tracker.market,row.get(0)).await.ok()?;
    cache_network(state,&value).await;
    Some(value)
}
async fn cache_network(state:&AppState,value:&Value) {
    let Some(tracker)=&state.mining else { return; };
    if let Some(mut redis)=state.pg.as_ref().and_then(|s|s.redis.clone()) {
        let result:Result<(),_>=redis::cmd("SET").arg(format!("onhold:mining-stats:v1:{}",tracker.market)).arg(value.to_string()).arg("EX").arg(1800).query_async(&mut redis).await;
        if result.is_err() { eprintln!("Mining statistics Redis write failed; retaining memory snapshot"); }
    }
    if let Ok(mut cache)=tracker.cache.lock() { cache.network=Some(value.clone()); }
}
async fn network_history(store:&pg::Store,market:&str,latest:Value)->Result<Value,ApiError> {
    let at=latest["sampledAt"].as_u64().ok_or_else(invalid)?;
    let client=store.read.get().await.map_err(|_|pg::error())?;
    let mut history=serde_json::Map::new();
    for (period,seconds,bucket) in NETWORK_PERIODS {
        let rows=client.query("SELECT DISTINCT ON (sampled_at / $3) data FROM mining_samples WHERE market=$1 AND sampled_at >= $2 AND sampled_at <= $4 ORDER BY sampled_at / $3,sampled_at DESC",
            &[&market,&(at.saturating_sub(seconds) as i64),&(bucket as i64),&(at as i64)]).await.map_err(|_|pg::error())?;
        history.insert(period.into(),json!(rows.iter().map(|r|r.get::<_,Value>(0)).collect::<Vec<_>>()));
    }
    Ok(json!({"market":market,"latest":latest,"history":history}))
}
async fn refresh_network(state: &AppState) -> Result<(), ApiError> {
    let Some(tracker) = &state.mining else { return Ok(()); };
    let at = now();
    if let Some(value) = cached_network(state).await {
        let fresh = value["latest"]["financial"].is_object() && at.saturating_sub(value["latest"]["sampledAt"].as_u64().unwrap_or(0)) < 900;
        tracker.cache.lock().map_err(|_| invalid())?.network = Some(value);
        if fresh { return Ok(()); }
    }
    let model = {
        let cache = tracker.cache.lock().map_err(|_| invalid())?;
        if !cache.connected || cache.syncing || at.saturating_sub(cache.snapshot.time) > 60 { return Ok(()); }
        cache.snapshot.clone()
    };
    let mut latest = network_sample(&model, at)?;
    latest["financial"]["burned"] = burned_total(state).await?;
    let store = state.pg.as_ref().ok_or_else(pg::error)?;
    store.write.lock().await.execute("INSERT INTO mining_samples(market,sampled_at,data) VALUES($1,$2,$3) ON CONFLICT(market,sampled_at) DO UPDATE SET data=excluded.data",
        &[&tracker.market,&(at as i64),&latest]).await.map_err(|_| pg::error())?;
    let value=network_history(store,&tracker.market,latest).await?;
    cache_network(state,&value).await;
    Ok(())
}
pub async fn run_stats(state: AppState) {
    if state.mining.is_none() { return; }
    let mut timer=tokio::time::interval(std::time::Duration::from_secs(15));
    timer.set_missed_tick_behavior(tokio::time::MissedTickBehavior::Skip);
    loop {
        timer.tick().await;
        if refresh_network(&state).await.is_err() { eprintln!("Mining statistics refresh failed; retaining previous snapshot"); }
    }
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct NetworkQuery { period: Option<String> }
pub async fn network_stats(State(state): State<AppState>, Query(query): Query<NetworkQuery>) -> Result<impl axum::response::IntoResponse, ApiError> {
    let period=query.period.as_deref().unwrap_or("1d");
    if !NETWORK_PERIODS.iter().any(|p|p.0==period) { return Err(ApiError(StatusCode::BAD_REQUEST,"invalid_period")); }
    let value=cached_network(&state).await;
    let latest=value.as_ref().map(|v|v["latest"].clone()).unwrap_or(Value::Null);
    let stale=now().saturating_sub(latest["sampledAt"].as_u64().unwrap_or(0)) >= 1800;
    let history=value.as_ref().and_then(|v|v["history"][period].as_array()).cloned().unwrap_or_default();
    Ok(([(header::CACHE_CONTROL,"no-store")],Json(json!({"configured":state.mining.is_some(),"available":!latest.is_null(),"stale":stale,"period":period,"refreshSeconds":900,"latest":latest,"history":history}))))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn deployment_requires_the_constructor_event_at_the_exact_market_and_block() {
        let market = "0x1111111111111111111111111111111111111111";
        let header = json!({"number":"0x64","hash":format!("0x{}","a".repeat(64))});
        let event = json!({"blockHash":header["hash"],"address":market,"blockNumber":"0x64","removed":false,"data":"0x","topics":[crypto::hex(&crypto::keccak("OwnershipTransferred(address,address)")),format!("0x{}",zero()),format!("0x{}{}","0".repeat(24),"2".repeat(40))]});
        assert!(validate_deployment(&json!([event]),market,100,&header).is_ok());
        for logs in [json!([]),json!([event,event]),json!([{"blockNumber":"0x64","topics":[]}])] {
            assert!(validate_deployment(&logs,market,100,&header).is_err());
        }
        for (key,value) in [("address",json!(ZERO)),("blockNumber",json!("0x65")),("removed",json!(true)),("data",json!("0x01")),("blockHash",json!(format!("0x{}","b".repeat(64)))),("removed",Value::Null)] {
            let mut bad=event.clone();bad[key]=value;
            assert!(validate_deployment(&json!([bad]),market,100,&header).is_err());
        }
        for index in 0..3 {
            let mut bad=event.clone();bad["topics"][index]=json!(format!("0x{}",zero()));
            if index==1 {bad["topics"][index]=event["topics"][2].clone();}
            assert!(validate_deployment(&json!([bad]),market,100,&header).is_err());
        }
    }
    fn log(signature: &str, topics: Vec<String>, words: Vec<U256>) -> Value {
        let mut all = vec![crypto::hex(&crypto::keccak(signature))];
        all.extend(topics);
        json!({"topics":all,"data":format!("0x{}",words.into_iter().map(hex).collect::<String>())})
    }
    fn topic(account: &str) -> String {
        format!("0x{}{}", "0".repeat(24), account.trim_start_matches("0x"))
    }
    #[test]
    fn network_stats_use_the_same_release_and_weight_as_wallet_rewards() {
        let mut s=Snapshot::new(1);
        s.started=100;s.updated=100;s.time=86500;s.total_weight=4;s.block=42;
        let account=format!("0x{}", "11".repeat(20));
        let mut wallet=Wallet::default();wallet.weight=1;s.wallets.insert(account.clone(),wallet);
        let sample=network_sample(&s,90000).unwrap();
        assert_eq!(sample["financial"]["claimed"],"0.000000000000000000");
        assert!(sample["financial"]["burned"].is_null());
        s.claimed=hex(U256::from_u128(42_000_000_000_000_000_000));
        assert_eq!(network_sample(&s,90000).unwrap()["financial"]["claimed"],"42.000000000000000000");
        assert_eq!(sample["totalWeight"],4);
        assert_eq!(sample["daily"],s.mining(Some(&account)).unwrap()["daily"]);
        assert_eq!(sample["perWeightDaily"],amount(U256::from_u128(s.daily_emission().unwrap()/4)).unwrap());
        assert_eq!(s.mining(Some(&account)).unwrap()["shareBps"],2500);
        s.time=100+MINING_DURATION;
        assert_eq!(network_sample(&s,90000).unwrap()["perWeightDaily"],"0.000000000000000000");
        s.total_weight=0;
        assert_eq!(network_sample(&s,90000).unwrap()["daily"],"0.000000000000000000");
        assert_eq!(s.mining(None).unwrap()["shareBps"],0);
        assert_eq!(NETWORK_PERIODS.iter().map(|p|p.0).collect::<Vec<_>>(),vec!["1h","4h","1d","7d","30d","90d"]);
    }
    #[test]
    fn mock_configuration_survives_pg_global_projection() {
        let mut s = Snapshot::new(1);
        assert!(s.mock_minimum.is_none());
        s.apply(&log(
            "MockConfiguration(uint256,address)",
            vec![],
            vec![U256::from_u64(100000000000000), U256::from_u64(1)],
        ))
        .unwrap();
        assert!(s.ad_price_interval.is_none());
        s.apply(&log("AdPriceIntervalConfigured(uint256)", vec![], vec![U256::from_u64(60)])).unwrap();
        assert!(s.apply(&log("AdPriceIntervalConfigured(uint256)", vec![], vec![U256::ZERO])).is_err());
        let loaded: Snapshot = serde_json::from_value(s.global()).unwrap();
        assert_eq!(loaded.ad_price_interval, Some(60));
        assert_eq!(
            uint(loaded.mock_minimum.as_ref().unwrap()).unwrap(),
            U256::from_u64(100000000000000)
        );
    }
    #[test]
    fn event_checkpoint_matches_weighted_rewards_and_actual_referral_payment() {
        let invitee = format!("0x{}", "11".repeat(20));
        let inviter = format!("0x{}", "22".repeat(20));
        let mut s = Snapshot::new(10);
        s.started = 100;
        s.updated = 100;
        s.time = 100 + 86400;
        s.total_weight = 4;
        let user = s.wallets.entry(invitee.clone()).or_default();
        user.weight = 1;
        let expected = (BASE * 86400 / MINING_DURATION as u128) / 4;
        assert_eq!(
            s.mining(Some(&invitee)).unwrap()["earned"],
            amount(U256::from_u128(expected)).unwrap()
        );
        let checkpoint = vec![
            U256::from_u128(10_000 * 10u128.pow(24)),
            U256::from_u64(s.time),
            U256::ZERO,
            U256::from_u64(1),
            U256::from_u128(10_000 * 10u128.pow(24)),
            U256::from_u128(10_000 * 10u128.pow(18)),
        ];
        s.apply(&log(
            "RewardsCheckpoint(address,uint256,uint256,uint256,uint256,uint256,uint256)",
            vec![topic(&invitee)],
            checkpoint,
        ))
        .unwrap();
        s.apply(&log(
            "ReferralAccrued(address,address,uint256,uint256)",
            vec![topic(&invitee), topic(&inviter)],
            vec![
                U256::from_u128(10_000 * 10u128.pow(18)),
                U256::from_u128(1500 * 10u128.pow(18)),
            ],
        ))
        .unwrap();
        s.apply(&log(
            "RewardPaid(address,uint256)",
            vec![topic(&invitee)],
            vec![U256::from_u128(10_000 * 10u128.pow(18))],
        ))
        .unwrap();
        assert_eq!(
            s.mining(Some(&inviter)).unwrap()["referralRewards"],
            "1500.000000000000000000"
        );
        s.apply(&log(
            "ReferralPaid(address,uint256)",
            vec![topic(&inviter)],
            vec![U256::from_u128(1500 * 10u128.pow(18))],
        ))
        .unwrap();
        assert_eq!(
            amount(uint(&s.claimed).unwrap()).unwrap(),
            "11500.000000000000000000"
        );
        assert_eq!(
            s.mining(Some(&inviter)).unwrap()["referralRewards"],
            "0.000000000000000000"
        );
        let stored = serde_json::to_string(&s).unwrap();
        assert_eq!(
            serde_json::from_str::<Snapshot>(&stored)
                .unwrap()
                .passes
                .len(),
            0
        );
    }
    #[test]
    fn linear_snapshot_matches_end_time_daily_rate_and_stops_new_accrual() {
        let mut s = Snapshot::new(1);
        assert_eq!(s.mining(None).unwrap()["endsAt"], 0);
        assert_eq!(s.mining(None).unwrap()["daily"], "0.000000000000000000");
        s.started = 100;
        s.updated = 100;
        s.total_weight = 1;
        let account = format!("0x{}", "11".repeat(20));
        s.wallets.entry(account.clone()).or_default().weight = 1;
        for elapsed in [
            1,
            86400,
            7 * 86400,
            28 * 86400,
            MINING_DURATION - 1,
            MINING_DURATION,
            MINING_DURATION + 86400,
        ] {
            s.time = s.started + elapsed;
            let data = s.mining(Some(&account)).unwrap();
            assert_eq!(data["durationDays"], 365);
            assert_eq!(data["endsAt"], 100 + MINING_DURATION);
            let daily = if elapsed < MINING_DURATION {
                BASE / 365
            } else {
                0
            };
            assert_eq!(data["daily"], amount(U256::from_u128(daily)).unwrap());
            assert_eq!(
                data["earned"],
                amount(U256::from_u128(released(100, s.time))).unwrap()
            );
        }
        s.time = 100 + 86400;
        s.total_weight = 0;
        assert_eq!(s.mining(None).unwrap()["daily"], "0.000000000000000000");
    }
    #[test]
    fn added_funding_preserves_past_rewards_and_releases_over_the_original_remaining_window() {
        let mut s = Snapshot::new(1);
        s.started = 100;
        s.updated = 100 + 86400;
        s.total_weight = 1;
        let prior = released(100, s.updated);
        let added = 1150 * 10u128.pow(18);
        let base = BASE + 1000 * 10u128.pow(18);
        s.apply(&log(
            "MiningRewardsAdded(uint256,uint256,uint256,uint256,uint256,uint256)",
            vec![],
            vec![
                U256::from_u128(added),
                U256::from_u128(base),
                U256::from_u128(POOL - BASE + added - (base - BASE)),
                U256::from_u64(s.updated),
                U256::from_u128(prior),
                U256::from_u128(base - prior),
            ],
        ))
        .unwrap();
        assert_eq!(s.released(s.updated).unwrap(), prior);
        s.time = s.updated + 86400;
        assert_eq!(
            s.released(s.time).unwrap(),
            prior + (base - prior) * 86400 / (MINING_DURATION - 86400) as u128
        );
        let data = s.mining(None).unwrap();
        assert_eq!(data["endsAt"], 100 + MINING_DURATION);
        assert_eq!(
            data["poolBudget"],
            amount(U256::from_u128(POOL + added)).unwrap()
        );
        assert_eq!(
            data["daily"],
            amount(U256::from_u128(
                (base - prior) * 86400 / (MINING_DURATION - 86400) as u128
            ))
            .unwrap()
        );
        assert_eq!(s.released(100 + MINING_DURATION).unwrap(), base);
        assert!(s.released(s.updated - 1).is_err());
        s.apply(&log(
            "AdRevenueSplit(uint256,uint256)",
            vec![],
            vec![U256::from_u64(50), U256::from_u64(51)],
        ))
        .unwrap();
        s.apply(&log(
            "AdRewardsReinvested(uint256,uint256)",
            vec![],
            vec![U256::from_u64(40), U256::from_u128(added)],
        ))
        .unwrap();
        assert_eq!(units(&s.ad_team).unwrap(), 50);
        assert_eq!(units(&s.ad_reserve).unwrap(), 11);
        assert_eq!(units(&s.ad_reinvested).unwrap(), added);
        let restored: Snapshot = serde_json::from_value(s.global()).unwrap();
        assert_eq!(restored.mining(None).unwrap(), s.mining(None).unwrap());
    }
    #[test]
    fn capped_linear_release_and_malformed_abi_are_checked() {
        assert_eq!(released(100, 100), 0);
        assert_eq!(released(0, 100), 0);
        assert_eq!(released(100, 99), 0);
        for elapsed in [
            1,
            86400,
            7 * 86400,
            28 * 86400,
            MINING_DURATION - 1,
            MINING_DURATION,
            MINING_DURATION + 1,
            u64::MAX - 100,
        ] {
            assert_eq!(
                released(100, 100 + elapsed),
                BASE * elapsed.min(MINING_DURATION) as u128 / MINING_DURATION as u128
            );
        }
        assert_eq!(BASE + (POOL - BASE), POOL);
        assert!(word("00", 0).is_err());
        assert!(text("", 0, 10).is_err());
        assert!(text_at(&"0".repeat(64), 1, 10).is_err());
        assert!(uint("oops").is_err());
        assert!(Snapshot::new(1).apply(&json!({"removed":true})).is_err());
    }
}
