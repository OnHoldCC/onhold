use crate::{claims, crypto, database, mining, uploads, ApiError, AppState};
use axum::{
    extract::{Multipart, State},
    http::{HeaderMap, StatusCode},
    Json,
};
use base64::{engine::general_purpose::STANDARD, Engine};
use rusqlite::{Connection, OptionalExtension};
use serde_json::{json, Value};
fn error() -> ApiError {
    ApiError(StatusCode::BAD_GATEWAY, "artwork_unavailable")
}
pub fn image_from_result(value: &Value) -> Result<String, ApiError> {
    let raw = value
        .as_str()
        .and_then(|s| s.strip_prefix("0x"))
        .ok_or_else(error)?;
    let uri = mining::text(raw, 0, 262144)?;
    let json = STANDARD
        .decode(
            uri.strip_prefix("data:application/json;base64,")
                .ok_or_else(error)?,
        )
        .map_err(|_| error())?;
    let metadata: Value = serde_json::from_slice(&json).map_err(|_| error())?;
    let image = metadata["image"]
        .as_str()
        .filter(|s| s.starts_with("data:image/svg+xml;base64,") && s.len() <= 131072)
        .ok_or_else(error)?;
    Ok(image.into())
}

static PNG_SLOTS: tokio::sync::Semaphore = tokio::sync::Semaphore::const_new(2);
fn invalid_png() -> ApiError {
    ApiError(StatusCode::UNSUPPORTED_MEDIA_TYPE, "invalid_nft_image")
}
fn validate_png(bytes: &[u8]) -> Result<(), ApiError> {
    if bytes.len() < 33
        || bytes.len() > uploads::MAX_IMAGE_BYTES
        || !bytes.starts_with(b"\x89PNG\r\n\x1a\n")
        || &bytes[12..16] != b"IHDR"
        || bytes[16..20] != 840u32.to_be_bytes()
        || bytes[20..24] != 924u32.to_be_bytes()
    {
        return Err(invalid_png());
    }
    let mut decoder = png::Decoder::new(std::io::Cursor::new(bytes));
    decoder.set_limits(png::Limits {
        bytes: 8 * 1024 * 1024,
    });
    let mut reader = decoder.read_info().map_err(|_| invalid_png())?;
    if reader.info().bit_depth != png::BitDepth::Eight
        || reader.info().animation_control.is_some()
        || reader.output_buffer_size() > 840 * 924 * 4
    {
        return Err(invalid_png());
    }
    let mut output = vec![0; reader.output_buffer_size()];
    reader.next_frame(&mut output).map_err(|_| invalid_png())?;
    Ok(())
}
fn saved_image(db: &Connection, token_hash: &str) -> rusqlite::Result<Option<Option<String>>> {
    db.query_row("SELECT r.image FROM verified_nft_records r JOIN verification_sessions s ON s.token_hash=r.token_hash WHERE r.token_hash=?1 AND s.expires_at>=unixepoch()", [token_hash], |r| r.get(0)).optional()
}
fn save_image(
    db: &Connection,
    token_hash: &str,
    image: &str,
) -> rusqlite::Result<Option<Option<String>>> {
    db.execute("UPDATE verified_nft_records SET image=coalesce(image,?1) WHERE token_hash=?2 AND EXISTS(SELECT 1 FROM verification_sessions s WHERE s.token_hash=?2 AND s.expires_at>=unixepoch())", [image,token_hash])?;
    saved_image(db, token_hash)
}
fn expired() -> ApiError {
    ApiError(StatusCode::UNAUTHORIZED, "verification_expired")
}
pub async fn upload(
    State(state): State<AppState>,
    headers: HeaderMap,
    mut multipart: Multipart,
) -> Result<Json<Value>, ApiError> {
    uploads::origin(&state, &headers)?;
    let (mut token, mut image, mut wallet, mut referral) = (None, None, None, None);
    while let Some(field) = multipart.next_field().await.map_err(|_| invalid_png())? {
        match field.name() {
            Some("verification_token") if token.is_none() => {
                let bytes = field.bytes().await.map_err(|_| expired())?;
                if bytes.len() != 64 || !bytes.iter().all(u8::is_ascii_hexdigit) {
                    return Err(expired());
                }
                token = Some(String::from_utf8(bytes.to_vec()).map_err(|_| expired())?);
            }
            Some("wallet") if wallet.is_none() => {
                let value = field.text().await.map_err(|_| expired())?;
                wallet = Some(
                    crypto::address(&value)
                        .map_err(|_| ApiError(StatusCode::BAD_REQUEST, "invalid_wallet"))?,
                );
            }
            Some("referral_code") if referral.is_none() => {
                let value = field.text().await.map_err(|_| expired())?;
                if value.len() != 12 || !value.bytes().all(|b| b.is_ascii_hexdigit()) {
                    return Err(ApiError(StatusCode::BAD_REQUEST, "invalid_referral_code"));
                }
                referral = Some(value);
            }
            Some("file") if image.is_none() => {
                let bytes = field.bytes().await.map_err(|_| invalid_png())?;
                if bytes.is_empty() || bytes.len() > uploads::MAX_IMAGE_BYTES {
                    return Err(invalid_png());
                }
                image = Some(bytes.to_vec());
            }
            _ => return Err(ApiError(StatusCode::BAD_REQUEST, "invalid_upload")),
        }
    }
    let token = token.ok_or_else(expired)?;
    let image = image.ok_or_else(invalid_png)?;
    let wallet = wallet.ok_or(ApiError(StatusCode::BAD_REQUEST, "invalid_wallet"))?;
    let hash = crypto::hex(&crypto::keccak(&token));
    let key = hash.clone();
    if let Some(image) = database(state.clone(), move |db| saved_image(db, &key))
        .await?
        .ok_or_else(expired)?
    {
        return mint_form(state, headers, token, wallet, referral, image).await;
    }
    uploads::quota(state.clone(), "nft_artwork", 100).await?;
    let slot = PNG_SLOTS
        .try_acquire()
        .map_err(|_| ApiError(StatusCode::TOO_MANY_REQUESTS, "rate_limited"))?;
    let image = tokio::task::spawn_blocking(move || {
        let _slot = slot;
        validate_png(&image)?;
        Ok::<_, ApiError>(image)
    })
    .await
    .map_err(|_| invalid_png())??;
    let pinned = uploads::pin_image(&state.http, image, "image/png").await?;
    let url = pinned["url"].as_str().ok_or_else(error)?.to_string();
    // Browser pixels are a display copy, scoped to this verification; mint facts come from the stored record.
    let saved = database(state.clone(), move |db| save_image(db, &hash, &url))
        .await?
        .flatten()
        .ok_or_else(expired)?;
    mint_form(state, headers, token, wallet, referral, saved).await
}
async fn mint_form(
    state: AppState,
    headers: HeaderMap,
    token: String,
    wallet: String,
    referral: Option<String>,
    image: String,
) -> Result<Json<Value>, ApiError> {
    let request = serde_json::from_value(
        json!({"verification_token":token,"wallet":wallet,"referral_code":referral}),
    )
    .map_err(|_| ApiError(StatusCode::BAD_REQUEST, "invalid_upload"))?;
    let Json(mut quote) = claims::quote(State(state), headers, Json(request)).await?;
    quote["image"] = json!(image);
    quote["artwork_ready"] = json!(true);
    Ok(Json(quote))
}
#[cfg(test)]
mod tests {
    use super::*;
    fn image(width: u32, height: u32) -> Vec<u8> {
        let mut bytes = Vec::new();
        {
            let mut encoder = png::Encoder::new(&mut bytes, width, height);
            encoder.set_color(png::ColorType::Rgba);
            encoder.set_depth(png::BitDepth::Eight);
            let mut writer = encoder.write_header().unwrap();
            writer
                .write_image_data(&vec![255; (width * height * 4) as usize])
                .unwrap();
        }
        bytes
    }
    #[test]
    fn uploaded_png_has_fixed_dimensions_and_valid_pixels() {
        let valid = image(840, 924);
        validate_png(&valid).unwrap();
        assert!(validate_png(&image(1, 1)).is_err());
        assert!(validate_png(&valid[..33]).is_err());
        let mut bomb = valid.clone();
        bomb[16..20].copy_from_slice(&u32::MAX.to_be_bytes());
        assert!(validate_png(&bomb).is_err());
        assert!(validate_png(b"<svg onload='alert(1)'/>").is_err());
    }
    #[test]
    fn artwork_is_bound_to_a_live_verification_and_cannot_overwrite_another_session() {
        let db = Connection::open_in_memory().unwrap();
        crate::init_db(&db).unwrap();
        db.execute(
            "INSERT INTO verification_sessions VALUES('a','uuid',unixepoch()+600)",
            [],
        )
        .unwrap();
        db.execute(
            "INSERT INTO verified_nft_records(token_hash,record) VALUES('a','{}')",
            [],
        )
        .unwrap();
        assert_eq!(saved_image(&db, "a").unwrap(), Some(None));
        assert!(save_image(&db, "missing", "bad").unwrap().is_none());
        assert_eq!(
            save_image(&db, "a", "first").unwrap(),
            Some(Some("first".into()))
        );
        assert_eq!(
            save_image(&db, "a", "replacement").unwrap(),
            Some(Some("first".into()))
        );
        db.execute("UPDATE verification_sessions SET expires_at=0", [])
            .unwrap();
        assert!(save_image(&db, "a", "expired").unwrap().is_none());
    }
    #[test]
    fn indexer_retains_the_canonical_onchain_svg() {
        let metadata =
            json!({"image":format!("data:image/svg+xml;base64,{}",STANDARD.encode(b"<svg/>"))});
        let uri = format!(
            "data:application/json;base64,{}",
            STANDARD.encode(metadata.to_string())
        );
        let mut encoded = vec![0u8; 64];
        encoded[31] = 32;
        encoded[56..64].copy_from_slice(&(uri.len() as u64).to_be_bytes());
        encoded.extend(uri.as_bytes());
        encoded.resize(encoded.len().div_ceil(32) * 32, 0);
        assert_eq!(
            image_from_result(&json!(crypto::hex(&encoded))).unwrap(),
            metadata["image"]
        );
    }
}
