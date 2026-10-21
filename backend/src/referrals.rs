use crate::{claims, crypto, database, mining, pg, uploads, ApiError, AppState};
use axum::{
    extract::{Query, State},
    http::{header, HeaderMap, StatusCode},
    Json,
};
use rusqlite::{params, OptionalExtension};
use serde::Deserialize;
use serde_json::{json, Value};
use std::time::{SystemTime, UNIX_EPOCH};
const ZERO: &str = "0x0000000000000000000000000000000000000000";
fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct BindRequest {
    wallet: String,
    referral_code: Option<String>,
    nonce: Option<String>,
    signature: Option<String>,
}

pub fn bound(
    db: &rusqlite::Connection,
    market: &str,
    wallet: &str,
) -> rusqlite::Result<Option<String>> {
    let saved = db
        .query_row(
            "SELECT referrer FROM wallet_referrals WHERE market=?1 AND wallet=?2",
            params![market, wallet],
            |r| r.get(0),
        )
        .optional()?;
    if saved.is_some() {
        return Ok(saved);
    }
    db.query_row(
        "SELECT referrer FROM nft_mints WHERE wallet=?1 AND market=?2 ORDER BY rowid LIMIT 1",
        params![wallet, market],
        |r| r.get(0),
    )
    .optional()
}
fn result(db: &rusqlite::Connection, referrer: &str) -> rusqlite::Result<Value> {
    let code: Option<String> = db
        .query_row(
            "SELECT code FROM invites WHERE wallet=?1",
            [referrer],
            |r| r.get(0),
        )
        .optional()?;
    Ok(json!({"bound":true,"referrer":referrer,"code":code}))
}
async fn chain_bound(
    state: &AppState,
    market: &str,
    wallet: &str,
) -> Result<Option<String>, ApiError> {
    if claims::rpc(state, "eth_chainId", json!([])).await? != "0x61" {
        return Err(ApiError(StatusCode::BAD_GATEWAY, "wrong_chain"));
    }
    let mut args = vec![0u8; 12];
    args.extend(
        crypto::bytes(wallet, 20)
            .map_err(|_| ApiError(StatusCode::BAD_REQUEST, "invalid_wallet"))?,
    );
    let bound = claims::contract_call(state, market, "referralBound(address)", &args).await?;
    if bound.as_str() == Some(&format!("0x{}1", "0".repeat(63))) {
        let value = claims::contract_call(state, market, "referrerOf(address)", &args).await?;
        let raw = value
            .as_str()
            .and_then(|v| v.strip_prefix("0x"))
            .filter(|v| v.len() == 64)
            .ok_or(ApiError(StatusCode::BAD_GATEWAY, "chain_unavailable"))?;
        let address = format!("0x{}", &raw[24..]);
        if address != ZERO {
            crypto::address(&address)
                .map_err(|_| ApiError(StatusCode::BAD_GATEWAY, "chain_unavailable"))?;
        }
        return Ok(Some(address.to_ascii_lowercase()));
    }
    if bound.as_str() != Some(&format!("0x{}", "00".repeat(32))) {
        return Err(ApiError(StatusCode::BAD_GATEWAY, "chain_unavailable"));
    }
    Ok(None)
}
fn message(
    origin: &str,
    market: &str,
    wallet: &str,
    referrer: &str,
    nonce: &str,
    expires: u64,
) -> String {
    format!("ONHOLD referral binding\nSite: {origin}\nChain: BNB Testnet (97)\nContract: {market}\nWallet: {wallet}\nInviter: {referrer}\nThis permanently fixes this wallet's inviter for future NFTs. Zero address means no inviter. This signature does not send a transaction or grant token permissions.\nNonce: {nonce}\nExpires: {expires}")
}
fn commit(
    db: &rusqlite::Connection,
    market: &str,
    wallet: &str,
    referrer: &str,
) -> rusqlite::Result<Value> {
    if let Some(saved) = bound(db, market, wallet)? {
        if saved != referrer {
            return Ok(json!({"conflict":true}));
        }
    }
    db.execute("INSERT OR IGNORE INTO wallet_referrals(market,wallet,referrer,bound_at) VALUES(?1,?2,?3,unixepoch())",params![market,wallet,referrer])?;
    let saved = bound(db, market, wallet)?.ok_or(rusqlite::Error::InvalidQuery)?;
    if saved != referrer {
        return Ok(json!({"conflict":true}));
    }
    result(db, &saved)
}

fn finish(
    db: &rusqlite::Connection,
    origin: &str,
    market: &str,
    wallet: &str,
    nonce: &str,
    signature: &str,
) -> Result<Value, ApiError> {
    let tx = db.unchecked_transaction().map_err(|_| crate::internal())?;
    let saved:Option<(String,u64)>=tx.query_row("SELECT referrer,expires_at FROM referral_challenges WHERE nonce=?1 AND market=?2 AND wallet=?3 AND expires_at>=unixepoch()",params![nonce,market,wallet],|r|Ok((r.get(0)?,r.get(1)?))).optional().map_err(|_|crate::internal())?;
    let (referrer, expires) = saved.ok_or(ApiError(
        StatusCode::UNAUTHORIZED,
        "referral_challenge_expired",
    ))?;
    let text = message(origin, market, wallet, &referrer, nonce, expires);
    if crypto::personal_wallet(&text, signature)
        .map_err(|_| ApiError(StatusCode::UNAUTHORIZED, "invalid_signature"))?
        != wallet
    {
        return Err(ApiError(StatusCode::UNAUTHORIZED, "invalid_signature"));
    }
    let value = commit(&tx, market, wallet, &referrer).map_err(|_| crate::internal())?;
    if value["conflict"] == true {
        return Err(ApiError(StatusCode::CONFLICT, "referrer_already_bound"));
    }
    tx.execute("DELETE FROM referral_challenges WHERE nonce=?1", [nonce])
        .map_err(|_| crate::internal())?;
    tx.commit().map_err(|_| crate::internal())?;
    Ok(value)
}

pub async fn bind(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<BindRequest>,
) -> Result<Json<Value>, ApiError> {
    uploads::origin(&state, &headers)?;
    let wallet = crypto::address(&request.wallet)
        .map_err(|_| ApiError(StatusCode::BAD_REQUEST, "invalid_wallet"))?;
    let market = state
        .claims
        .as_ref()
        .ok_or(ApiError(
            StatusCode::SERVICE_UNAVAILABLE,
            "nft_not_configured",
        ))?
        .market
        .clone();
    let (m, w) = (market.clone(), wallet.clone());
    if let Some(value) = database(state.clone(), move |db| {
        bound(db, &m, &w)?.map(|r| result(db, &r)).transpose()
    })
    .await?
    {
        return Ok(Json(value));
    }
    uploads::quota(state.clone(), "referral", 2000).await?;
    if let Some(referrer) = chain_bound(&state, &market, &wallet).await? {
        let (m, w) = (market.clone(), wallet.clone());
        return database(state, move |db| commit(db, &m, &w, &referrer))
            .await
            .map(Json);
    }
    if let Some(signature) = request.signature {
        let nonce = request
            .nonce
            .filter(|n| n.len() == 32 && n.bytes().all(|b| b.is_ascii_hexdigit()))
            .ok_or(ApiError(
                StatusCode::BAD_REQUEST,
                "invalid_referral_challenge",
            ))?;
        let origin = state.origin.clone();
        return database(state, move |db| {
            Ok(finish(db, &origin, &market, &wallet, &nonce, &signature))
        })
        .await?
        .map(Json);
    }
    let code = request.referral_code;
    let referrer = database(state.clone(), move |db| {
        claims::resolve_invite(db, code.as_deref())
    })
    .await?
    .ok_or(ApiError(StatusCode::BAD_REQUEST, "invalid_referral_code"))?;
    if referrer == wallet {
        return Err(ApiError(StatusCode::BAD_REQUEST, "self_referral"));
    }
    let nonce = uuid::Uuid::new_v4().simple().to_string();
    let expires = now() + 600;
    let text = message(&state.origin, &market, &wallet, &referrer, &nonce, expires);
    let (m, w, n, r) = (market, wallet, nonce.clone(), referrer.clone());
    database(state,move|db|{
        db.execute("DELETE FROM referral_challenges WHERE expires_at<unixepoch()",[])?;
        db.execute("INSERT INTO referral_challenges(nonce,market,wallet,referrer,expires_at) VALUES(?1,?2,?3,?4,?5)",params![n,m,w,r,expires])?;Ok(())
    }).await?;
    Ok(Json(
        json!({"bound":false,"message":text,"nonce":nonce,"expires_at":expires,"referrer":referrer}),
    ))
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct HistoryRequest {
    wallet: String,
    market: Option<String>,
    page: Option<u32>,
    events_page: Option<u32>,
}
fn topic(signature: &str) -> String {
    crypto::hex(&crypto::keccak(signature))
}
fn invalid_history() -> ApiError {
    ApiError(StatusCode::BAD_GATEWAY, "invalid_referral_history")
}
fn decimal_units(raw: &str) -> Result<String, ApiError> {
    let n = raw.parse::<u128>().map_err(|_| invalid_history())?;
    mining::amount(k256::elliptic_curve::bigint::U256::from_u128(n))
}
fn history_event(log: &Value, block: i64, index: i64) -> Result<Value, ApiError> {
    let raw = log["data"]
        .as_str()
        .and_then(|v| v.strip_prefix("0x"))
        .ok_or_else(invalid_history)?;
    let address = |n: usize| {
        mining::address(
            log["topics"][n]
                .as_str()
                .and_then(|v| v.strip_prefix("0x"))
                .ok_or_else(invalid_history)?,
            0,
        )
    };
    let amount = |n| mining::amount(mining::uint(mining::word(raw, n)?)?);
    let (kind, wallet, base, reward) =
        if log["topics"][0] == topic("ReferralBound(address,address)") {
            if !raw.is_empty() {
                return Err(invalid_history());
            }
            ("bound", address(1)?, Value::Null, Value::Null)
        } else if log["topics"][0] == topic("ReferralAccrued(address,address,uint256,uint256)") {
            if raw.len() != 128 {
                return Err(invalid_history());
            }
            ("accrued", address(1)?, json!(amount(0)?), json!(amount(1)?))
        } else if log["topics"][0] == topic("ReferralPaid(address,uint256)") {
            if raw.len() != 64 {
                return Err(invalid_history());
            }
            ("paid", address(1)?, Value::Null, json!(amount(0)?))
        } else {
            return Err(invalid_history());
        };
    crypto::bytes(log["transactionHash"].as_str().unwrap_or(""), 32)
        .map_err(|_| invalid_history())?;
    Ok(
        json!({"kind":kind,"wallet":wallet,"baseReward":base,"amount":reward,"txHash":log["transactionHash"],"block":block,"logIndex":index}),
    )
}

pub async fn history(
    State(state): State<AppState>,
    Query(query): Query<HistoryRequest>,
) -> Result<impl axum::response::IntoResponse, ApiError> {
    let wallet = crypto::address(&query.wallet)
        .map_err(|_| ApiError(StatusCode::BAD_REQUEST, "invalid_wallet"))?;
    let requested = query.page.unwrap_or(1);
    let events_requested = query.events_page.unwrap_or(1);
    if requested == 0 || events_requested == 0 {
        return Err(ApiError(StatusCode::BAD_REQUEST, "invalid_page"));
    }
    let Some(tracker) = &state.mining else {
        return Ok((
            [(header::CACHE_CONTROL, "no-store")],
            Json(json!({"configured":false,"available":false,"items":[],"events":[]})),
        ));
    };
    if query
        .market
        .as_deref()
        .map(crypto::address)
        .transpose()
        .map_err(|_| ApiError(StatusCode::BAD_REQUEST, "invalid_market"))?
        .is_some_and(|v| v != tracker.market)
    {
        return Err(ApiError(StatusCode::BAD_REQUEST, "invalid_market"));
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
    let cursor = tx
        .query_opt(
            "SELECT data FROM chain_state WHERE market=$1",
            &[&tracker.market],
        )
        .await
        .map_err(|_| pg::error())?
        .map(|r| r.get::<_, Value>(0));
    let block = cursor
        .as_ref()
        .and_then(|v| v["block"].as_i64())
        .unwrap_or(0);
    let counts=tx.query_one("SELECT count(*),count(*) FILTER (WHERE (data->>'weight')::bigint>0) FROM chain_wallets WHERE market=$1 AND data->>'referrer'=$2",&[&tracker.market,&wallet]).await.map_err(|_|pg::error())?;
    let total: i64 = counts.get(0);
    let active: i64 = counts.get(1);
    let pages = ((total + 7) / 8).max(1);
    let page = (requested as i64).min(pages);
    let offset = (page - 1) * 8;
    let recipient = format!("0x{}{}", "0".repeat(24), &wallet[2..]);
    let bound = topic("ReferralBound(address,address)");
    let accrued = topic("ReferralAccrued(address,address,uint256,uint256)");
    let paid = topic("ReferralPaid(address,uint256)");
    let rows=tx.query(r#"
        WITH people AS (
          SELECT wallet,(data->>'weight')::bigint AS weight FROM chain_wallets
          WHERE market=$1 AND data->>'referrer'=$2 ORDER BY wallet LIMIT 8 OFFSET $3
        ), rewards AS (
          SELECT e.data->'topics'->>1 AS actor,
                 sum(onhold_uint256(substr(e.data->>'data',3,64))) AS base,
                 sum(onhold_uint256(substr(e.data->>'data',67,64))) AS bonus
          FROM chain_events e JOIN people p ON e.data->'topics'->>1='0x'||repeat('0',24)||substr(p.wallet,3)
          WHERE e.market=$1 AND e.data->'topics'->>0=$4 AND e.data->'topics'->>2=$5 AND e.block_number<=$6
          GROUP BY e.data->'topics'->>1
        )
        SELECT p.wallet,p.weight,(SELECT count(*) FROM chain_nfts n WHERE n.market=$1 AND n.staker=p.wallet),
               coalesce(r.base,0)::text,coalesce(r.bonus,0)::text
        FROM people p LEFT JOIN rewards r ON r.actor='0x'||repeat('0',24)||substr(p.wallet,3) ORDER BY p.wallet
    "#,&[&tracker.market,&wallet,&offset,&accrued,&recipient,&block]).await.map_err(|_|pg::error())?;
    let items=rows.into_iter().map(|r|Ok(json!({"wallet":r.get::<_,String>(0),"weight":r.get::<_,i64>(1),"stakedCount":r.get::<_,i64>(2),"baseRewards":decimal_units(&r.get::<_,String>(3))?,"contribution":decimal_units(&r.get::<_,String>(4))?}))).collect::<Result<Vec<Value>,ApiError>>()?;
    let event_filter="FROM chain_events WHERE market=$1 AND block_number<=$2 AND (((data->'topics'->>0=$3 OR data->'topics'->>0=$4) AND data->'topics'->>2=$6) OR (data->'topics'->>0=$5 AND data->'topics'->>1=$6))";
    let args: &[&(dyn tokio_postgres::types::ToSql + Sync)] =
        &[&tracker.market, &block, &bound, &accrued, &paid, &recipient];
    let events_total: i64 = tx
        .query_one(&format!("SELECT count(*) {event_filter}"), args)
        .await
        .map_err(|_| pg::error())?
        .get(0);
    let events_pages = ((events_total + 7) / 8).max(1);
    let events_page = (events_requested as i64).min(events_pages);
    let event_offset = (events_page - 1) * 8;
    let mut event_args = args.to_vec();
    event_args.push(&event_offset);
    let events=tx.query(&format!("SELECT data,block_number,log_index {event_filter} ORDER BY block_number DESC,log_index DESC LIMIT 8 OFFSET $7"),&event_args).await.map_err(|_|pg::error())?.into_iter().map(|r|history_event(&r.get::<_,Value>(0),r.get(1),r.get(2))).collect::<Result<Vec<_>,_>>()?;
    let balances = tx
        .query_opt(
            "SELECT data FROM chain_wallets WHERE market=$1 AND wallet=$2",
            &[&tracker.market, &wallet],
        )
        .await
        .map_err(|_| pg::error())?
        .map(|r| r.get::<_, Value>(0));
    let zero = "0".repeat(64);
    let balance = |key: &str| {
        mining::amount(mining::uint(
            balances
                .as_ref()
                .and_then(|v| v[key].as_str())
                .unwrap_or(&zero),
        )?)
    };
    let pending = balance("referral_pending")?;
    let earned = balance("referral_earned")?;
    tx.commit().await.map_err(|_| pg::error())?;
    let health = mining::health(&state)?;
    Ok((
        [(header::CACHE_CONTROL, "no-store")],
        Json(
            json!({"configured":true,"available":block>0,"stale":health["available"]!=true||now().saturating_sub(cursor.as_ref().and_then(|v|v["time"].as_u64()).unwrap_or(0))>=60,"chain_id":97,"market":tracker.market,"wallet":wallet,"storage":"postgresql","confirmed_block":block,"summary":{"invited":total,"active":active,"pending":pending,"earned":earned},"page":page,"pages":pages,"total":total,"items":items,"eventsPage":events_page,"eventsPages":events_pages,"eventsTotal":events_total,"events":events}),
        ),
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    use k256::ecdsa::SigningKey;
    #[test]
    fn referral_events_keep_exact_amounts_and_reject_invalid_words() {
        let actor = format!("0x{}{}", "0".repeat(24), "11".repeat(20));
        let hash = format!("0x{}", "aa".repeat(32));
        let log = json!({"topics":[topic("ReferralAccrued(address,address,uint256,uint256)"),actor,actor],"data":format!("0x{:064x}{:064x}",7,1),"transactionHash":hash});
        let row = history_event(&log, 123, 4).unwrap();
        assert_eq!(row["baseReward"], "0.000000000000000007");
        assert_eq!(row["amount"], "0.000000000000000001");
        assert_eq!(row["kind"], "accrued");
        let bound = json!({"topics":[topic("ReferralBound(address,address)"),actor,actor],"data":"0x","transactionHash":hash});
        assert_eq!(
            history_event(&bound, 123, 0).unwrap()["amount"],
            Value::Null
        );
        let mut invalid = log.clone();
        invalid["data"] = json!("0x01");
        assert!(history_event(&invalid, 123, 4).is_err());
        invalid = log.clone();
        invalid["topics"][1] = json!(format!("0x{}", "ff".repeat(32)));
        assert!(history_event(&invalid, 123, 4).is_err());
        assert_eq!(
            decimal_units("1000000000000000001").unwrap(),
            "1.000000000000000001"
        );
        assert!(decimal_units("1.1").is_err());
    }
    fn db() -> rusqlite::Connection {
        let db = rusqlite::Connection::open_in_memory().unwrap();
        crate::init_db(&db).unwrap();
        db
    }
    fn signature(key: &SigningKey, text: &str) -> String {
        let mut data = format!("\x19Ethereum Signed Message:\n{}", text.len()).into_bytes();
        data.extend(text.as_bytes());
        crypto::sign(key, &crypto::keccak(data)).unwrap()
    }
    #[test]
    fn only_wallet_owner_can_bind_and_challenge_is_scoped_and_consumed() {
        let db = db();
        let key = SigningKey::from_slice(&[9; 32]).unwrap();
        let wallet = crypto::wallet(key.verifying_key());
        let market = format!("0x{}", "11".repeat(20));
        let referrer = format!("0x{}", "22".repeat(20));
        let nonce = "a".repeat(32);
        let expires = now() + 600;
        let origin = "https://onhold.cc";
        db.execute(
            "INSERT INTO invites(code,wallet) VALUES('abcdef123456',?1)",
            [&referrer],
        )
        .unwrap();
        db.execute(
            "INSERT INTO referral_challenges VALUES(?1,?2,?3,?4,?5)",
            params![nonce, market, wallet, referrer, expires],
        )
        .unwrap();
        let text = message(origin, &market, &wallet, &referrer, &nonce, expires);
        let signed = signature(&key, &text);
        assert_eq!(
            finish(
                &db,
                "https://other.example",
                &market,
                &wallet,
                &nonce,
                &signed
            )
            .unwrap_err()
            .1,
            "invalid_signature"
        );
        assert_eq!(
            finish(&db, origin, &referrer, &wallet, &nonce, &signed)
                .unwrap_err()
                .1,
            "referral_challenge_expired"
        );
        let wrong = signature(&SigningKey::from_slice(&[8; 32]).unwrap(), &text);
        assert_eq!(
            finish(&db, origin, &market, &wallet, &nonce, &wrong)
                .unwrap_err()
                .1,
            "invalid_signature"
        );
        assert_eq!(bound(&db, &market, &wallet).unwrap(), None);
        let value = finish(&db, origin, &market, &wallet, &nonce, &signed).unwrap();
        assert_eq!(value["bound"], true);
        assert_eq!(value["code"], "abcdef123456");
        assert_eq!(
            bound(&db, &market, &wallet).unwrap(),
            Some(referrer.clone())
        );
        assert_eq!(
            finish(&db, origin, &market, &wallet, &nonce, &signed)
                .unwrap_err()
                .1,
            "referral_challenge_expired"
        );
        let another = format!("0x{}", "33".repeat(20));
        let nonce2 = "b".repeat(32);
        db.execute(
            "INSERT INTO referral_challenges VALUES(?1,?2,?3,?4,?5)",
            params![nonce2, market, wallet, another, expires],
        )
        .unwrap();
        let signed2 = signature(
            &key,
            &message(origin, &market, &wallet, &another, &nonce2, expires),
        );
        assert_eq!(
            finish(&db, origin, &market, &wallet, &nonce2, &signed2)
                .unwrap_err()
                .1,
            "referrer_already_bound"
        );
        assert_eq!(bound(&db, &market, &wallet).unwrap(), Some(referrer));
    }
    #[test]
    fn expired_challenge_cannot_bind_and_none_is_permanent() {
        let db = db();
        let key = SigningKey::from_slice(&[9; 32]).unwrap();
        let wallet = crypto::wallet(key.verifying_key());
        let market = format!("0x{}", "11".repeat(20));
        let nonce = "c".repeat(32);
        db.execute(
            "INSERT INTO referral_challenges VALUES(?1,?2,?3,?4,0)",
            params![nonce, market, wallet, ZERO],
        )
        .unwrap();
        let signed = signature(
            &key,
            &message("https://onhold.cc", &market, &wallet, ZERO, &nonce, 0),
        );
        assert_eq!(
            finish(&db, "https://onhold.cc", &market, &wallet, &nonce, &signed)
                .unwrap_err()
                .1,
            "referral_challenge_expired"
        );
        assert_eq!(
            commit(&db, &market, &wallet, ZERO).unwrap()["code"],
            Value::Null
        );
        assert_eq!(bound(&db, &market, &wallet).unwrap(), Some(ZERO.into()));
        assert_eq!(
            commit(&db, &market, &wallet, &market).unwrap()["conflict"],
            true
        );
    }
    #[test]
    fn existing_mint_relationship_is_preserved_and_initialization_keeps_bindings() {
        let db = db();
        let market = format!("0x{}", "11".repeat(20));
        let wallet = format!("0x{}", "22".repeat(20));
        let referrer = format!("0x{}", "33".repeat(20));
        db.execute("INSERT INTO nft_mints(nullifier,wallet,tier,referrer,deadline,status,market) VALUES('existing',?1,1,?2,0,'confirmed',?3)",params![wallet,referrer,market]).unwrap();
        assert_eq!(
            bound(&db, &market, &wallet).unwrap(),
            Some(referrer.clone())
        );
        crate::init_db(&db).unwrap();
        assert_eq!(bound(&db, &market, &wallet).unwrap(), Some(referrer));
    }
}
