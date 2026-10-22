use crate::{crypto, database, uploads, ApiError, AppState};
use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use k256::ecdsa::SigningKey;
use rusqlite::{params, OptionalExtension};
use serde::Deserialize;
use serde_json::{json, Value};
use std::{
    sync::Arc,
    time::{SystemTime, UNIX_EPOCH},
};
const ZERO: &str = "0x0000000000000000000000000000000000000000";

fn error(status: StatusCode, code: &'static str) -> ApiError {
    ApiError(status, code)
}
fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}
#[derive(Clone)]
pub struct ClaimSigner {
    key: Arc<SigningKey>,
    pub market: String,
}
impl ClaimSigner {
    pub fn from_env() -> Result<Option<Self>, Box<dyn std::error::Error>> {
        match (
            std::env::var("ONHOLD_VERIFIER_PRIVATE_KEY").ok(),
            std::env::var("ONHOLD_NFT_ADDRESS").or_else(|_| std::env::var("ONHOLD_MARKET_ADDRESS")).ok(),
        ) {
            (None, _) => Ok(None),
            (Some(secret), Some(market)) => {
                let raw =
                    crypto::bytes(&secret, 32).map_err(|_| "Invalid verifier key configuration")?;
                let key = SigningKey::from_slice(&raw)
                    .map_err(|_| "Invalid verifier key configuration")?;
                let market =
                    crypto::address(&market).map_err(|_| "Invalid market address configuration")?;
                Ok(Some(Self {
                    key: Arc::new(key),
                    market,
                }))
            }
            _ => Err("Set ONHOLD_VERIFIER_PRIVATE_KEY and ONHOLD_MARKET_ADDRESS together".into()),
        }
    }
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct InviteRequest {
    wallet: String,
}
fn invite_code(db: &rusqlite::Connection, wallet: &str) -> rusqlite::Result<String> {
    for _ in 0..4 {
        let code = uuid::Uuid::new_v4().simple().to_string()[..12].to_string();
        db.execute(
            "INSERT OR IGNORE INTO invites(code,wallet) VALUES(?1,?2)",
            params![code, wallet],
        )?;
        if let Some(saved) = db
            .query_row(
                "SELECT code FROM invites WHERE wallet=?1",
                [wallet],
                |row| row.get(0),
            )
            .optional()?
        {
            return Ok(saved);
        }
    }
    Err(rusqlite::Error::InvalidQuery)
}
pub(super) fn resolve_invite(
    db: &rusqlite::Connection,
    code: Option<&str>,
) -> rusqlite::Result<Option<String>> {
    match code {
        None | Some("") => Ok(Some(ZERO.into())),
        Some(value) if value.len() == 12 && value.bytes().all(|b| b.is_ascii_hexdigit()) => db
            .query_row(
                "SELECT wallet FROM invites WHERE code=?1",
                [value.to_ascii_lowercase()],
                |row| row.get(0),
            )
            .optional(),
        _ => Ok(None),
    }
}
pub async fn invite(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<InviteRequest>,
) -> Result<Json<Value>, ApiError> {
    uploads::origin(&state, &headers)?;
    let wallet = crypto::address(&request.wallet)
        .map_err(|_| error(StatusCode::BAD_REQUEST, "invalid_wallet"))?;
    uploads::quota(state.clone(), "invite", 2000).await?;
    let code = database(state, move |db| invite_code(db, &wallet)).await?;
    Ok(Json(json!({"code":code})))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct VerifyRequest {
    session_key: String,
}
#[derive(Debug)]
struct Standing {
    nullifier: String,
    tier: u8,
    record: crypto::AccountRecord,
    banned_at: String,
    organization_suffix: String,
    organization_name: Option<String>,
    ban_category: Option<String>,
}
fn plan_tier(plan: &str) -> Result<u8, ApiError> {
    let plan = if plan.len() <= 80 {
        plan.to_ascii_lowercase()
    } else {
        String::new()
    };
    match (plan.contains("pro"), plan.contains("max")) {
        (false, false) if plan == "free" || plan == "claude_free" => Ok(0),
        (true, false) => Ok(1),
        (false, true) => Ok(2),
        _ => Err(error(StatusCode::UNPROCESSABLE_ENTITY, "unsupported_plan")),
    }
}
fn parse_standing(value: &Value) -> Result<Standing, ApiError> {
    if value["standing"] != "bad_standing"
        || value["has_active_org"] != false
        || value["org_type"] != "consumer"
    {
        return Err(error(
            StatusCode::UNPROCESSABLE_ENTITY,
            "account_not_eligible",
        ));
    }
    let tier = plan_tier(value["prev_plan_tier"].as_str().unwrap_or(""))?;
    let banned_at = value["banned_at"]
        .as_str()
        .filter(|s| !s.is_empty() && s.len() <= 64)
        .ok_or(error(StatusCode::BAD_GATEWAY, "invalid_provider_response"))?
        .to_string();
    let organizations = value["banned_orgs"]
        .as_array()
        .ok_or(error(StatusCode::BAD_GATEWAY, "invalid_provider_response"))?;
    let mut consumers = organizations.iter().filter(|org| {
        org.get("org_type").is_none() || org["org_type"] == "consumer"
    });
    let organization = consumers.next().ok_or(error(
        StatusCode::UNPROCESSABLE_ENTITY,
        "account_not_eligible",
    ))?;
    if consumers.next().is_some() {
        return Err(error(
            StatusCode::UNPROCESSABLE_ENTITY,
            "ambiguous_identity",
        ));
    }
    let id = organization["uuid"]
        .as_str()
        .and_then(|v| uuid::Uuid::parse_str(v).ok())
        .filter(|v| !v.is_nil())
        .ok_or(error(StatusCode::BAD_GATEWAY, "invalid_provider_response"))?
        .to_string();
    let organization_name = organization["name"]
        .as_str()
        .filter(|v| v.chars().count() <= 160)
        .map(str::to_string);
    let ban_category = value["ban_category"]
        .as_str()
        .filter(|v| v.len() <= 80)
        .map(str::to_string);
    let nullifier = crypto::hex(&crypto::keccak(format!(
        "ONHOLD:restricted-consumer-org:v1:{id}"
    )));
    Ok(Standing {
        nullifier,
        tier,
        record: crypto::AccountRecord {
            account: organization_name.clone().unwrap_or_default(),
            uuid: id.clone(),
            banned_at: banned_at.clone(),
            plan: value["prev_plan_tier"].as_str().unwrap_or("").into(),
        },
        banned_at,
        organization_suffix: id[id.len() - 8..].to_string(),
        organization_name,
        ban_category,
    })
}
fn verification_nullifier(account: &Standing, token: &str, repeat_uuid: bool) -> String {
    if repeat_uuid {
        crypto::hex(&crypto::keccak(format!(
            "ONHOLD:e2e-repeat-uuid:v1:{}:{token}",
            account.record.uuid
        )))
    } else {
        account.nullifier.clone()
    }
}
fn account_details(value: &Value) -> Value {
    let text=|v:&Value,max:usize|v.as_str().filter(|s|s.chars().count()<=max).map(str::to_owned);
    let organizations=value["banned_orgs"].as_array().into_iter().flatten().take(5).map(|org|json!({
        "uuid":org["uuid"].as_str().and_then(|s|uuid::Uuid::parse_str(s).ok()).filter(|v|!v.is_nil()).map(|v|v.to_string()),
        "name":text(&org["name"],160)
    })).collect::<Vec<_>>();
    json!({"standing":text(&value["standing"],80),"previous_plan":text(&value["prev_plan_tier"],80),"banned_at":text(&value["banned_at"],64),"ban_category":text(&value["ban_category"],80),"organizations":organizations})
}
pub async fn verify(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<VerifyRequest>,
) -> Result<Response, ApiError> {
    uploads::origin(&state, &headers)?;
    if !(32..=512).contains(&request.session_key.len())
        || !request
            .session_key
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'_')
        || !request.session_key.starts_with("sk-ant-sid")
    {
        return Err(error(StatusCode::BAD_REQUEST, "invalid_session"));
    }
    uploads::quota(state.clone(), "verify", 100).await?;
    let endpoint = std::env::var("ONHOLD_E2E_STANDING_URL").ok();
    let repeat_uuid = std::env::var("ONHOLD_E2E_REPEAT_UUID").as_deref() == Ok("true");
    if endpoint.is_some() || repeat_uuid {
        // Test overrides require a debug build and a matching deployed chain-97 Mock market.
        if !cfg!(debug_assertions)
            || endpoint
                .as_deref()
                .is_some_and(|value| value != "http://127.0.0.1:4198/mock-standing")
        {
            return Err(error(
                StatusCode::SERVICE_UNAVAILABLE,
                "invalid_mock_configuration",
            ));
        }
        let signer = state
            .claims
            .as_ref()
            .ok_or(error(StatusCode::SERVICE_UNAVAILABLE, "nft_not_configured"))?;
        if rpc(&state, "eth_chainId", json!([])).await? != state.network.hex()
            || contract_call(&state, &signer.market, "MOCK_ONLY()", &[]).await?
                != json!(format!("0x{:064x}", 1))
        {
            return Err(error(
                StatusCode::SERVICE_UNAVAILABLE,
                "invalid_mock_configuration",
            ));
        }
        if repeat_uuid
            && contract_call(&state, &signer.market, "UUID_UNIQUENESS_DISABLED()", &[]).await?
                != json!(format!("0x{:064x}", 1))
        {
            return Err(error(
                StatusCode::SERVICE_UNAVAILABLE,
                "invalid_mock_configuration",
            ));
        }
    }
    let response = state
        .http
        .get(
            endpoint
                .as_deref()
                .unwrap_or("https://claude.ai/api/account/standing"),
        )
        .header("Cookie", format!("sessionKey={}", request.session_key))
        .header("Accept", "application/json")
        .send()
        .await
        .map_err(|_| error(StatusCode::BAD_GATEWAY, "verification_unavailable"))?;
    drop(request);
    if response.status().as_u16() == 401 {
        return Err(error(StatusCode::UNAUTHORIZED, "session_expired"));
    }
    if !response.status().is_success() {
        return Err(error(StatusCode::BAD_GATEWAY, "verification_unavailable"));
    }
    if response.content_length().unwrap_or(0) > 65536 {
        return Err(error(StatusCode::BAD_GATEWAY, "invalid_provider_response"));
    }
    let body = response
        .bytes()
        .await
        .map_err(|_| error(StatusCode::BAD_GATEWAY, "invalid_provider_response"))?;
    if body.len() > 65536 {
        return Err(error(StatusCode::BAD_GATEWAY, "invalid_provider_response"));
    }
    let value: Value = serde_json::from_slice(&body)
        .map_err(|_| error(StatusCode::BAD_GATEWAY, "invalid_provider_response"))?;
    let details=account_details(&value);
    let account = match parse_standing(&value) {
        Ok(account)=>account,
        Err(ApiError(status,code))=>return Ok((status,Json(json!({"error":code,"eligible":false,"details":details}))).into_response()),
    };
    let token = format!(
        "{}{}",
        uuid::Uuid::new_v4().simple(),
        uuid::Uuid::new_v4().simple()
    );
    let token_hash = crypto::hex(&crypto::keccak(&token));
    let expires = now() + 600;
    let nullifier = verification_nullifier(&account, &token, repeat_uuid);
    let tier = account.tier;
    let banned_at = account.banned_at.clone();
    let public_record = account.record.clone();
    let record_json = serde_json::to_string(&public_record)
        .map_err(|_| error(StatusCode::INTERNAL_SERVER_ERROR, "storage_unavailable"))?;
    let checked_market=state.claims.as_ref().map(|signer|signer.market.clone()).unwrap_or_default();
    let (minted,reserved)=database(state.clone(),move|db|{
  db.execute("INSERT INTO verified_accounts(nullifier,tier,base_tokens,banned_at) VALUES(?1,?2,0,?3) ON CONFLICT(nullifier) DO UPDATE SET tier=excluded.tier,banned_at=excluded.banned_at",params![nullifier,tier,banned_at])?;
  db.execute("DELETE FROM verified_nft_records WHERE token_hash IN (SELECT token_hash FROM verification_sessions WHERE expires_at < unixepoch())",[])?;
  db.execute("DELETE FROM verification_sessions WHERE expires_at < unixepoch()",[])?;
  db.execute("INSERT INTO verification_sessions(token_hash,nullifier,expires_at) VALUES(?1,?2,?3)",params![token_hash,nullifier,expires])?;
  db.execute("INSERT INTO verified_nft_records(token_hash,record) VALUES(?1,?2)",params![token_hash,record_json])?;
  let status:Option<String>=db.query_row("SELECT status FROM nft_mints WHERE nullifier=?1 AND market=?2",params![nullifier,checked_market],|row|row.get(0)).optional()?;
  Ok((status.as_deref()==Some("confirmed"),status.is_some()))
 }).await?;
    Ok(Json(
        json!({"protocol":"nft-staking-v4","verification_token":token,"expires_at":expires,"standing":"restricted","plan":if tier==1{"Pro"}else if tier==2{"Max"}else{"Free"},"tier":tier,"weight":if tier==1{1}else if tier==2{3}else{0},"record":public_record,"artwork_ready":false,"banned_at":account.banned_at,"organization_suffix":account.organization_suffix,"organization_name":account.organization_name,"ban_category":account.ban_category,"minted":minted,"reserved":reserved,"details":details}),
    ).into_response())
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MintRequest {
    verification_token: String,
    wallet: String,
    referral_code: Option<String>,
    signature: Option<String>,
}
struct Quote {
    nullifier: String,
    wallet: String,
    referrer: String,
    tier: u8,
    expires: u64,
    message: String,
    record: crypto::AccountRecord,
}
async fn quote_data(state: AppState, request: &MintRequest) -> Result<Quote, ApiError> {
    if request.verification_token.len() != 64
        || !request
            .verification_token
            .bytes()
            .all(|b| b.is_ascii_hexdigit())
    {
        return Err(error(StatusCode::BAD_REQUEST, "invalid_verification"));
    }
    let wallet = crypto::address(&request.wallet)
        .map_err(|_| error(StatusCode::BAD_REQUEST, "invalid_wallet"))?;
    let code = request.referral_code.clone();
    let mut referrer = database(state.clone(), move |db| resolve_invite(db, code.as_deref()))
        .await?
        .ok_or(error(StatusCode::BAD_REQUEST, "invalid_referral_code"))?;
    if wallet == referrer {
        return Err(error(StatusCode::BAD_REQUEST, "self_referral"));
    }
    let signer = state
        .claims
        .clone()
        .ok_or(error(StatusCode::SERVICE_UNAVAILABLE, "nft_not_configured"))?;
    let token_hash = crypto::hex(&crypto::keccak(&request.verification_token));
    let checked_wallet = wallet.clone();
    let checked_market=signer.market.clone();
    let record=database(state.clone(),move|db|{
  let record=db.query_row("SELECT a.nullifier,a.tier,s.expires_at,r.record,r.image FROM verification_sessions s JOIN verified_accounts a ON s.nullifier=a.nullifier JOIN verified_nft_records r ON s.token_hash=r.token_hash WHERE s.token_hash=?1 AND s.expires_at>=unixepoch()",[token_hash],|row|Ok((row.get::<_,String>(0)?,row.get::<_,u8>(1)?,row.get::<_,u64>(2)?,row.get::<_,String>(3)?,row.get::<_,Option<String>>(4)?))).optional()?;
  let existing:Option<(String,String,String)>=db.query_row("SELECT nullifier,wallet,status FROM nft_mints WHERE nullifier=?1 AND market=?2",params![record.as_ref().map(|r|r.0.as_str()),checked_market],|row|Ok((row.get(0)?,row.get(1)?,row.get(2)?))).optional()?;
  let bound=crate::referrals::bound(db,&checked_market,&checked_wallet)?;
  Ok((record,existing,bound))
 }).await?;
    if record.2.is_none(){return Err(error(StatusCode::CONFLICT,"referral_binding_required"));}
    if let Some(bound) = record.2 {
        if request
            .referral_code
            .as_deref()
            .is_some_and(|v| !v.is_empty())
            && referrer != bound
        {
            return Err(error(StatusCode::CONFLICT, "referrer_already_bound"));
        }
        referrer = bound;
    }
    let (nullifier, tier, expires, public_record, image) = record
        .0
        .ok_or(error(StatusCode::UNAUTHORIZED, "verification_expired"))?;
    if let Some((saved_id, saved_wallet, status)) = record.1 {
        if status == "confirmed" {
            return Err(error(StatusCode::CONFLICT, "already_minted"));
        }
        if saved_id != nullifier || saved_wallet != wallet {
            return Err(error(StatusCode::CONFLICT, "mint_already_reserved"));
        }
    }
    if image.is_none() {
        return Err(error(StatusCode::UNPROCESSABLE_ENTITY, "artwork_required"));
    }
    let public_record: crypto::AccountRecord = serde_json::from_str(&public_record)
        .map_err(|_| error(StatusCode::INTERNAL_SERVER_ERROR, "storage_unavailable"))?;
    let snapshot_tier = plan_tier(&public_record.plan)
        .map_err(|_| error(StatusCode::UNAUTHORIZED, "verification_expired"))?;
    if tier != snapshot_tier {
        return Err(error(StatusCode::UNAUTHORIZED, "verification_expired"));
    }
    let publication = serde_json::to_string(&public_record)
        .map_err(|_| error(StatusCode::INTERNAL_SERVER_ERROR, "storage_unavailable"))?;
    let message=format!("ONHOLD NFT mint authorization\nChain: {}\nContract: {}\nRecipient: {wallet}\nReferrer: {referrer}\nPlan tier: {tier}\nPERMANENT PUBLIC ON-CHAIN RECORD (account and raw UUID are public and cannot be erased): {publication}\nVerification: {}\nExpires: {expires}",state.network.label(),signer.market,request.verification_token);
    Ok(Quote {
        nullifier,
        wallet,
        referrer,
        tier,
        expires,
        message,
        record: public_record,
    })
}
pub async fn quote(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<MintRequest>,
) -> Result<Json<Value>, ApiError> {
    uploads::origin(&state, &headers)?;
    let q = quote_data(state, &request).await?;
    Ok(Json(
        json!({"message":q.message,"tier":q.tier,"weight":if q.tier==1{1}else if q.tier==2{3}else{0},"invited":q.referrer!=ZERO,"expires_at":q.expires}),
    ))
}
pub(super) async fn rpc(state: &AppState, method: &str, params: Value) -> Result<Value, ApiError> {
    let response = state
        .http
        .post(std::env::var("ONHOLD_CHAIN_RPC_URL").unwrap_or_else(|_| state.network.rpc()))
        .json(&json!({"jsonrpc":"2.0","id":1,"method":method,"params":params}))
        .send()
        .await
        .map_err(|cause| {
            eprintln!("chain RPC failed: method={method} reason={}", if cause.is_timeout(){"timeout"}else if cause.is_connect(){"connect"}else{"transport"});
            error(StatusCode::BAD_GATEWAY, "chain_unavailable")
        })?;
    if !response.status().is_success() {
        eprintln!("chain RPC failed: method={method} http_status={}", response.status().as_u16());
        return Err(error(StatusCode::BAD_GATEWAY, "chain_unavailable"));
    }
    let value: Value = response
        .json()
        .await
        .map_err(|_| {
            eprintln!("chain RPC failed: method={method} reason=invalid_json");
            error(StatusCode::BAD_GATEWAY, "chain_unavailable")
        })?;
    if value.get("error").is_some() || value.get("result").is_none() {
        let message = value["error"]["message"].as_str().unwrap_or("").to_ascii_lowercase();
        let reason = if message.contains("pruned") || message.contains("missing trie node") { "chain_history_unavailable" } else { "chain_unavailable" };
        eprintln!("chain RPC failed: method={method} upstream_code={:?} reason={reason}", value["error"]["code"].as_i64());
        return Err(error(StatusCode::BAD_GATEWAY, reason));
    }
    Ok(value["result"].clone())
}
pub(super) async fn contract_call(
    state: &AppState,
    market: &str,
    signature: &str,
    args: &[u8],
) -> Result<Value, ApiError> {
    let mut data = crypto::keccak(signature)[..4].to_vec();
    data.extend(args);
    rpc(
        state,
        "eth_call",
        json!([{"to":market,"data":crypto::hex(&data)},"latest"]),
    )
    .await
}
pub async fn authorize(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<MintRequest>,
) -> Result<Json<Value>, ApiError> {
    uploads::origin(&state, &headers)?;
    let q = quote_data(state.clone(), &request).await?;
    let signature = request
        .signature
        .as_deref()
        .ok_or(error(StatusCode::BAD_REQUEST, "signature_required"))?;
    if crypto::personal_wallet(&q.message, signature)
        .map_err(|_| error(StatusCode::UNAUTHORIZED, "invalid_signature"))?
        != q.wallet
    {
        return Err(error(StatusCode::UNAUTHORIZED, "invalid_signature"));
    }
    let signer = state
        .claims
        .clone()
        .ok_or(error(StatusCode::SERVICE_UNAVAILABLE, "nft_not_configured"))?;
    if rpc(&state, "eth_chainId", json!([])).await? != state.network.hex() {
        return Err(error(StatusCode::BAD_GATEWAY, "wrong_chain"));
    }
    if contract_call(&state, &signer.market, "PROTOCOL_ID()", &[]).await?
        != crypto::hex(&crypto::keccak(if std::env::var("ONHOLD_NFT_ADDRESS").is_ok() { "onhold.nft.v1" } else { "onhold.nft-staking.v4" }))
    {
        return Err(error(StatusCode::SERVICE_UNAVAILABLE, "protocol_mismatch"));
    }
    let configured = contract_call(&state, &signer.market, "verifier()", &[]).await?;
    let expected = crypto::wallet(signer.key.verifying_key());
    if configured
        .as_str()
        .and_then(|s| s.get(s.len().saturating_sub(40)..))
        != Some(&expected[2..])
    {
        return Err(error(StatusCode::SERVICE_UNAVAILABLE, "verifier_mismatch"));
    }
    let args = crypto::bytes(&q.nullifier, 32)
        .map_err(|_| error(StatusCode::BAD_REQUEST, "invalid_verification"))?;
    if contract_call(&state, &signer.market, "claimed(bytes32)", &args)
        .await?
        .as_str()
        .is_some_and(|value| value.ends_with('1'))
    {
        return Err(error(StatusCode::CONFLICT, "already_minted"));
    }
    let mut wallet_args = vec![0u8; 12];
    wallet_args.extend(
        crypto::bytes(&q.wallet, 20)
            .map_err(|_| error(StatusCode::BAD_REQUEST, "invalid_wallet"))?,
    );
    let bound = contract_call(
        &state,
        &signer.market,
        "referralBound(address)",
        &wallet_args,
    )
    .await?;
    if bound.as_str().is_some_and(|v| v.ends_with('1')) {
        let saved =
            contract_call(&state, &signer.market, "referrerOf(address)", &wallet_args).await?;
        if saved
            .as_str()
            .and_then(|v| v.get(v.len().saturating_sub(40)..))
            != Some(&q.referrer[2..])
        {
            return Err(error(StatusCode::CONFLICT, "referrer_already_bound"));
        }
    }
    let deadline = now() + 600;
    let q_id = q.nullifier.clone();
    let q_wallet = q.wallet.clone();
    let q_ref = q.referrer.clone();
    let q_tier = q.tier;
    let q_market=signer.market.clone();
    let bound=database(state.clone(),move|db|{
  db.execute("INSERT OR IGNORE INTO nft_mints(nullifier,wallet,tier,referrer,deadline,status,market) VALUES(?1,?2,?3,?4,?5,'authorized',?6)",params![q_id,q_wallet,q_tier,q_ref,deadline,q_market])?;
  let record:Option<(String,String,String)>=db.query_row("SELECT wallet,referrer,status FROM nft_mints WHERE nullifier=?1 AND market=?2",params![q_id,q_market],|row|Ok((row.get(0)?,row.get(1)?,row.get(2)?))).optional()?;
  if record.as_ref().is_some_and(|r|r.0==q_wallet&&r.1==q_ref&&r.2=="authorized"){db.execute("UPDATE nft_mints SET deadline=?1 WHERE nullifier=?2 AND market=?3",params![deadline,q_id,q_market])?;Ok(true)}else{Ok(false)}
 }).await?;
    if !bound {
        return Err(error(StatusCode::CONFLICT, "mint_already_reserved"));
    }
    let claim = crypto::MintData {
        market: &signer.market,
        recipient: &q.wallet,
        nullifier: &q.nullifier,
        tier: q.tier,
        referrer: &q.referrer,
        deadline,
        record: &q.record,
    };
    let proof = crypto::sign(
        &signer.key,
        &crypto::mint_digest(&claim, state.network.id)
            .map_err(|_| error(StatusCode::INTERNAL_SERVER_ERROR, "signing_failed"))?,
    )
    .map_err(|_| error(StatusCode::INTERNAL_SERVER_ERROR, "signing_failed"))?;
    Ok(Json(
        json!({"protocol":"nft-staking-v4","market":signer.market,"chain_id":state.network.id,"recipient":q.wallet,"nullifier":q.nullifier,"tier":q.tier,"referrer":q.referrer,"deadline":deadline,"record":q.record,"signature":proof}),
    ))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReceiptRequest {
    tx_hash: String,
    nullifier: String,
}
pub async fn receipt(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<ReceiptRequest>,
) -> Result<Json<Value>, ApiError> {
    uploads::origin(&state, &headers)?;
    crypto::bytes(&request.tx_hash, 32)
        .map_err(|_| error(StatusCode::BAD_REQUEST, "invalid_transaction"))?;
    crypto::bytes(&request.nullifier, 32)
        .map_err(|_| error(StatusCode::BAD_REQUEST, "invalid_transaction"))?;
    let signer = state
        .claims
        .clone()
        .ok_or(error(StatusCode::SERVICE_UNAVAILABLE, "nft_not_configured"))?;
    let result = rpc(
        &state,
        "eth_getTransactionReceipt",
        json!([request.tx_hash]),
    )
    .await?;
    if result["status"] != "0x1"
        || result["to"].as_str().map(str::to_lowercase) != Some(signer.market.clone())
    {
        return Err(error(
            StatusCode::UNPROCESSABLE_ENTITY,
            "transaction_not_confirmed",
        ));
    }
    let block = result["blockNumber"]
        .as_str()
        .and_then(|s| u64::from_str_radix(s.trim_start_matches("0x"), 16).ok())
        .ok_or(error(StatusCode::BAD_GATEWAY, "invalid_chain_response"))?;
    let latest = rpc(&state, "eth_blockNumber", json!([]))
        .await?
        .as_str()
        .and_then(|s| u64::from_str_radix(s.trim_start_matches("0x"), 16).ok())
        .ok_or(error(StatusCode::BAD_GATEWAY, "invalid_chain_response"))?;
    if latest < block + 2 {
        return Err(error(StatusCode::CONFLICT, "confirmation_pending"));
    }
    let event = crypto::hex(&crypto::keccak(
        "PassMinted(address,bytes32,uint256,uint8,uint256,address)",
    ));
    let log = result["logs"]
        .as_array()
        .and_then(|logs| {
            logs.iter().find(|log| {
                log["address"].as_str().map(str::to_lowercase) == Some(signer.market.clone())
                    && log["topics"][0] == event
                    && log["topics"][2] == request.nullifier
            })
        })
        .ok_or(error(
            StatusCode::UNPROCESSABLE_ENTITY,
            "invalid_mint_receipt",
        ))?;
    let recipient = log["topics"][1]
        .as_str()
        .and_then(|value| value.get(value.len().checked_sub(40)?..))
        .map(|value| format!("0x{value}"))
        .ok_or(error(
            StatusCode::UNPROCESSABLE_ENTITY,
            "invalid_mint_receipt",
        ))?;
    let token_id = log["topics"][3]
        .as_str()
        .filter(|id| crypto::bytes(id, 32).is_ok())
        .ok_or(error(
            StatusCode::UNPROCESSABLE_ENTITY,
            "invalid_mint_receipt",
        ))?
        .to_string();
    let checked_market=signer.market.clone();
    let updated = database(state, move |db| {
        db.execute(
            "UPDATE nft_mints SET status='confirmed',tx_hash=?1,token_id=?4 WHERE nullifier=?2 AND wallet=?3 AND market=?5",
            params![request.tx_hash, request.nullifier, recipient,token_id,checked_market],
        )
    })
    .await?;
    if updated == 0 {
        return Err(error(StatusCode::NOT_FOUND, "mint_record_missing"));
    }
    Ok(Json(json!({"confirmed":true})))
}
#[cfg(test)]
mod tests {
    use super::*;
    fn standing() -> Value {
        json!({"standing":"bad_standing","has_active_org":false,"org_type":"consumer","prev_plan_tier":"claude_pro","banned_at":"2026-10-01T00:00:00Z","banned_orgs":[{"uuid":"f40c6c60-10ea-4c0b-8a79-c98e4cd102e9"}]})
    }
    fn state() -> AppState {
        let db = rusqlite::Connection::open_in_memory().unwrap();
        crate::init_db(&db).unwrap();
        let signer = ClaimSigner {
            key: Arc::new(SigningKey::from_slice(&[7; 32]).unwrap()),
            market: format!("0x{}", "11".repeat(20)),
        };
        AppState {
            network: Default::default(),
            db: Arc::new(std::sync::Mutex::new(db)),
            origin: "http://localhost:4190".into(),
            http: reqwest::Client::new(),
            claims: Some(signer),
            burn: None,
            mining: None,
            pg: None,
            analytics: Default::default(),
            public_cache: Default::default(),
            visitor_salt: "test-secret".into(),
            trusted_proxies: Vec::new(),
        }
    }
    #[test]
    fn repeat_uuid_attempts_preserve_real_records_but_do_not_collide() {
        let account = parse_standing(&standing()).unwrap();
        assert_eq!(
            verification_nullifier(&account, "first", false),
            account.nullifier
        );
        let first = verification_nullifier(&account, "first", true);
        assert_ne!(first, account.nullifier);
        assert_ne!(first, verification_nullifier(&account, "second", true));
        assert_eq!(first, verification_nullifier(&account, "first", true));
        assert_eq!(account.record.uuid, "f40c6c60-10ea-4c0b-8a79-c98e4cd102e9");
    }
    #[test]
    fn invite_codes_are_stable_unique_and_resolve_only_valid_codes() {
        let state = state();
        let db = state.db.lock().unwrap();
        let wallet = format!("0x{}", "22".repeat(20));
        let other = format!("0x{}", "33".repeat(20));
        let code = invite_code(&db, &wallet).unwrap();
        assert_eq!(code.len(), 12);
        assert_eq!(invite_code(&db, &wallet).unwrap(), code);
        assert_ne!(invite_code(&db, &other).unwrap(), code);
        assert_eq!(
            resolve_invite(&db, Some(&code.to_ascii_uppercase())).unwrap(),
            Some(wallet.clone())
        );
        assert_eq!(resolve_invite(&db, None).unwrap(), Some(ZERO.into()));
        for invalid in [wallet.as_str(), "nonexistent", "000000000000"] {
            assert!(resolve_invite(&db, Some(invalid)).unwrap().is_none());
        }
    }
    #[tokio::test]
    async fn new_mint_requires_a_signed_referral_binding(){
        let request=MintRequest{verification_token:"a".repeat(64),wallet:format!("0x{}","22".repeat(20)),referral_code:None,signature:None};
        assert_eq!(quote_data(state(),&request).await.err().unwrap().1,"referral_binding_required");
    }
    #[tokio::test]
    async fn mint_quote_checks_short_code_identity_expiry_and_existing_reservations() {
        let state = state();
        let wallet = format!("0x{}", "22".repeat(20));
        let inviter = format!("0x{}", "33".repeat(20));
        let token = "a".repeat(64);
        let nullifier = format!("0x{}", "44".repeat(32));
        let code = {
            let db = state.db.lock().unwrap();
            db.execute(
                "INSERT INTO verified_accounts VALUES(?1,1,500,'2026-10-20')",
                [&nullifier],
            )
            .unwrap();
            db.execute(
                "INSERT INTO verification_sessions VALUES(?1,?2,?3)",
                params![crypto::hex(&crypto::keccak(&token)), nullifier, now() + 600],
            )
            .unwrap();
            db.execute(
                "INSERT INTO verified_nft_records(token_hash,record) VALUES(?1,?2)",
                params![
                    crypto::hex(&crypto::keccak(&token)),
                    serde_json::to_string(&crypto::AccountRecord {
                        account: "Example Organization".into(),
                        uuid: "11111111-1111-4111-8111-111111111111".into(),
                        banned_at: "2026-09-01T12:41:20.292985Z".into(),
                        plan: "claude_pro".into()
                    })
                    .unwrap()
                ],
            )
            .unwrap();
            db.execute("INSERT INTO wallet_referrals(market,wallet,referrer,bound_at) VALUES(?1,?2,?3,unixepoch())",params![state.claims.as_ref().unwrap().market,wallet,inviter]).unwrap();
            invite_code(&db, &inviter).unwrap()
        };
        let mut request = MintRequest {
            verification_token: token,
            wallet: wallet.clone(),
            referral_code: Some(code),
            signature: None,
        };
        assert_eq!(
            quote_data(state.clone(), &request).await.err().unwrap().1,
            "artwork_required"
        );
        state
            .db
            .lock()
            .unwrap()
            .execute(
                "UPDATE verified_nft_records SET image='https://gateway.pinata.cloud/ipfs/example'",
                [],
            )
            .unwrap();
        use http_body_util::BodyExt;
        use tower::ServiceExt;
        let form = format!("--form\r\nContent-Disposition: form-data; name=\"verification_token\"\r\n\r\n{}\r\n--form\r\nContent-Disposition: form-data; name=\"wallet\"\r\n\r\n{}\r\n--form\r\nContent-Disposition: form-data; name=\"referral_code\"\r\n\r\n{}\r\n--form\r\nContent-Disposition: form-data; name=\"file\"; filename=\"pass.png\"\r\nContent-Type: image/png\r\n\r\npreviously uploaded\r\n--form--\r\n", request.verification_token, wallet, request.referral_code.as_ref().unwrap());
        let response = crate::router(state.clone(), std::path::PathBuf::from("/nonexistent"))
            .oneshot(
                axum::http::Request::post("/api/nft/create")
                    .header("Origin", &state.origin)
                    .header("Content-Type", "multipart/form-data; boundary=form")
                    .body(axum::body::Body::from(form.clone()))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
        let response: Value =
            serde_json::from_slice(&response.into_body().collect().await.unwrap().to_bytes())
                .unwrap();
        assert_eq!(response["artwork_ready"], true);
        assert_eq!(response["tier"], 1);
        assert_eq!(response["weight"], 1);
        assert!(response["message"]
            .as_str()
            .unwrap()
            .contains("Example Organization"));
        assert!(response["message"].as_str().unwrap().contains(&inviter));
        let quote = quote_data(state.clone(), &request).await.unwrap();
        let saved_code=request.referral_code.clone();
        let other_code={let db=state.db.lock().unwrap();invite_code(&db,&format!("0x{}","55".repeat(20))).unwrap()};
        request.referral_code=Some(other_code);
        assert_eq!(quote_data(state.clone(),&request).await.err().unwrap().1,"referrer_already_bound");
        request.referral_code=saved_code;
        assert_eq!(quote.referrer, inviter);
        assert_eq!(quote.tier, 1);
        assert!(quote.message.contains("NFT mint authorization"));
        assert!(!quote.message.contains("Receive:"));
        for (plan, tier, weight) in [("free", 0, 0), ("CLAUDE_FREE", 0, 0), ("claude_max", 2, 3), ("claude_pro", 1, 1)] {
            {
                let db = state.db.lock().unwrap();
                db.execute("UPDATE verified_accounts SET tier=?1", [tier]).unwrap();
                db.execute("UPDATE verified_nft_records SET record=json_set(record,'$.plan',?1)", [plan]).unwrap();
            }
            let response = crate::router(state.clone(), std::path::PathBuf::from("/nonexistent"))
                .oneshot(axum::http::Request::post("/api/nft/create")
                    .header("Origin", &state.origin)
                    .header("Content-Type", "multipart/form-data; boundary=form")
                    .body(axum::body::Body::from(form.clone())).unwrap())
                .await.unwrap();
            assert_eq!(response.status(), StatusCode::OK, "{plan}");
            let response: Value = serde_json::from_slice(&response.into_body().collect().await.unwrap().to_bytes()).unwrap();
            assert_eq!(response["tier"], tier);
            assert_eq!(response["weight"], weight);
            assert!(response["message"].as_str().unwrap().contains(&format!("Plan tier: {tier}")));
        }
        for (plan, tier) in [("free", 1), ("claude_pro", 0), ("claude_max", 1), ("unknown", 0), ("claude_pro_max", 1)] {
            {
                let db = state.db.lock().unwrap();
                db.execute("UPDATE verified_accounts SET tier=?1", [tier]).unwrap();
                db.execute("UPDATE verified_nft_records SET record=json_set(record,'$.plan',?1)", [plan]).unwrap();
            }
            assert_eq!(quote_data(state.clone(), &request).await.err().unwrap().1, "verification_expired", "{plan}");
        }
        {
            let db = state.db.lock().unwrap();
            db.execute("UPDATE verified_accounts SET tier=1", []).unwrap();
            db.execute("UPDATE verified_nft_records SET record=json_set(record,'$.plan','claude_pro')", []).unwrap();
        }
        request.wallet = inviter.clone();
        assert_eq!(
            quote_data(state.clone(), &request).await.err().unwrap().1,
            "self_referral"
        );
        request.wallet = wallet.clone();
        request.referral_code = Some("000000000000".into());
        assert_eq!(
            quote_data(state.clone(), &request).await.err().unwrap().1,
            "invalid_referral_code"
        );
        request.referral_code = None;
        {
            let db = state.db.lock().unwrap();
            db.execute("INSERT INTO nft_mints(nullifier,wallet,tier,referrer,deadline,status,market) VALUES(?1,?2,1,?3,?4,'authorized',?5)",params![nullifier,inviter,ZERO,now()+600,state.claims.as_ref().unwrap().market]).unwrap();
        }
        assert_eq!(
            quote_data(state.clone(), &request).await.err().unwrap().1,
            "mint_already_reserved"
        );
        {
            let db = state.db.lock().unwrap();
            db.execute(
                "UPDATE nft_mints SET wallet=?1,status='confirmed'",
                [&wallet],
            )
            .unwrap();
        }
        assert_eq!(
            quote_data(state.clone(), &request).await.err().unwrap().1,
            "already_minted"
        );
        {
            let db = state.db.lock().unwrap();
            db.execute("UPDATE verification_sessions SET expires_at=0", [])
                .unwrap();
        }
        assert_eq!(
            quote_data(state, &request).await.err().unwrap().1,
            "verification_expired"
        );
    }
    #[test]
    fn supplied_standing_shape_uses_org_uuid_plan_category_and_utc_time() {
        // Same shape as the supplied Max response; identifiers and name are synthetic.
        let mut value = standing();
        value["prev_plan_tier"] = json!("claude_max");
        value["ban_category"] = json!("other");
        value["banned_at"] = json!("2026-09-01T12:41:20.292985Z");
        value["banned_orgs"][0]["name"] = json!("Example Organization");
        value["banned_orgs"][0]["org_type"] = json!("consumer");
        let result = parse_standing(&value).unwrap();
        assert_eq!(result.tier, 2);
        assert_eq!(
            result.organization_name.as_deref(),
            Some("Example Organization")
        );
        assert_eq!(result.ban_category.as_deref(), Some("other"));
        assert_eq!(result.banned_at, "2026-09-01T12:41:20.292985Z");
        let original = result.nullifier;
        value["banned_orgs"][0]["name"] = json!("Renamed Organization");
        assert_eq!(parse_standing(&value).unwrap().nullifier, original);
        value["banned_orgs"][0]["uuid"] = json!("00000000-0000-0000-0000-000000000000");
        assert!(parse_standing(&value).is_err());
    }
    #[test]
    fn rejected_plan_details_are_bounded_and_exclude_credentials() {
        let mut value=standing();
        value["prev_plan_tier"]=json!("free");value["sessionKey"]=json!("private");value["cookie"]=json!("private");
        value["banned_orgs"][0]["name"]=json!("Example Account");
        let details=account_details(&value);
        assert_eq!(details["previous_plan"],"free");assert_eq!(details["organizations"][0]["name"],"Example Account");
        assert!(!details.to_string().contains("private"));assert_eq!(parse_standing(&value).unwrap().tier,0);
        value["prev_plan_tier"]=json!("x".repeat(81));assert!(account_details(&value)["previous_plan"].is_null());
    }
    #[test]
    fn plans_match_pro_or_max_case_insensitively_and_never_both() {
        for (plan, tier) in [
            ("free", 0),
            ("CLAUDE_FREE", 0),
            ("claude_pro", 1),
            ("CLAUDE_PRO", 1),
            ("claude_pro_annual", 1),
            ("pro", 1),
            ("claude_max", 2),
            ("CLAUDE_MAX_5X", 2),
            ("claude_max_20x", 2),
        ] {
            let mut value = standing();
            value["prev_plan_tier"] = json!(plan);
            assert_eq!(parse_standing(&value).unwrap().tier, tier);
        }
        for plan in ["unknown", "", "claude_pro_max"] {
            let mut value = standing();
            value["prev_plan_tier"] = json!(plan);
            assert!(parse_standing(&value).is_err());
        }
        let mut value = standing();
        value["prev_plan_tier"] = json!("CLAUDE_PRO");
        value["standing"] = json!("good_standing");
        assert!(parse_standing(&value).is_err());
        let mut value = standing();
        value["banned_orgs"] = json!([value["banned_orgs"][0].clone(),{"uuid":"invalid"}]);
        assert!(parse_standing(&value).is_err());
    }
    #[test]
    fn free_account_with_an_api_org_uses_only_the_unique_consumer_identity() {
        let mut value = standing();
        value["prev_plan_tier"] = json!("claude_free");
        value["banned_orgs"][0]["org_type"] = json!("consumer");
        let consumer = value["banned_orgs"][0].clone();
        let expected = parse_standing(&value).unwrap().nullifier;
        let api = json!({"uuid":"11111111-1111-4111-8111-111111111111","name":"Example API organization","org_type":"api"});
        for organizations in [json!([consumer.clone(), api.clone()]), json!([api.clone(), consumer.clone()])] {
            value["banned_orgs"] = organizations;
            let account = parse_standing(&value).unwrap();
            assert_eq!(account.nullifier, expected);
            assert_eq!(account.record.uuid, consumer["uuid"].as_str().unwrap());
            assert_eq!(account.tier, 0);
        }
        for organizations in [json!([api]), json!([consumer.clone(), consumer])] {
            value["banned_orgs"] = organizations;
            assert!(parse_standing(&value).is_err());
        }
    }
    #[test]
    fn standing_requires_verified_restriction_and_one_consumer_identity() {
        let value = standing();
        let first = parse_standing(&value).unwrap();
        assert_eq!(first.tier, 1);
        assert_eq!(first.nullifier, parse_standing(&value).unwrap().nullifier);
        for (key, bad) in [
            ("standing", json!("good_standing")),
            ("has_active_org", json!(true)),
            ("prev_plan_tier", json!("unknown")),
            ("banned_at", Value::Null),
            ("banned_orgs", json!([])),
        ] {
            let mut changed = value.clone();
            changed[key] = bad;
            assert!(parse_standing(&changed).is_err());
        }
    }
}
