use crate::{claims, crypto, database, uploads, ApiError, AppState};
use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
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
        "SELECT referrer FROM nft_mints WHERE wallet=?1 ORDER BY rowid LIMIT 1",
        [wallet],
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

#[cfg(test)]
mod tests {
    use super::*;
    use k256::ecdsa::SigningKey;
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
        db.execute("INSERT INTO nft_mints(nullifier,wallet,tier,referrer,deadline,status) VALUES('existing',?1,1,?2,0,'confirmed')",params![wallet,referrer]).unwrap();
        assert_eq!(
            bound(&db, &market, &wallet).unwrap(),
            Some(referrer.clone())
        );
        crate::init_db(&db).unwrap();
        assert_eq!(bound(&db, &market, &wallet).unwrap(), Some(referrer));
    }
}
