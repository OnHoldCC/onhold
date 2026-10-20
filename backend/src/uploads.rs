use crate::{database, ApiError, AppState};
use axum::{
    extract::{Multipart, State},
    http::{header, HeaderMap, StatusCode},
    Json,
};
use serde_json::{json, Value};
use std::time::Duration;

pub const MAX_IMAGE_BYTES: usize = 5 * 1024 * 1024;
// Same fixed image-pinning protocol as SingleSpark's infrastructure/image_pinning.rs.
// shortcut: Pons pin retention is unverified; retain originals for repinning.
const UPLOAD_URL: &str = "https://ponsfamily.com/api/ipfs/image";
static SLOTS: tokio::sync::Semaphore = tokio::sync::Semaphore::const_new(2);
fn published_image(value: &Value) -> Result<Value, ApiError> {
    let cid = value["cid"]
        .as_str()
        .ok_or(ApiError(StatusCode::BAD_GATEWAY, "upload_failed"))?;
    let valid = (cid.len() == 46
        && cid.starts_with("Qm")
        && cid
            .bytes()
            .all(|c| b"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz".contains(&c)))
        || ((21..=121).contains(&cid.len())
            && cid.starts_with('b')
            && cid
                .bytes()
                .all(|c| c.is_ascii_lowercase() || (b'2'..=b'7').contains(&c)));
    if !valid || value["uri"].as_str() != Some(format!("ipfs://{cid}").as_str()) {
        return Err(ApiError(StatusCode::BAD_GATEWAY, "upload_failed"));
    }
    Ok(
        json!({"cid":cid,"uri":value["uri"],"url":format!("https://gateway.pinata.cloud/ipfs/{cid}")}),
    )
}
pub async fn pin_image(
    http: &reqwest::Client,
    bytes: Vec<u8>,
    mime: &'static str,
) -> Result<Value, ApiError> {
    pin_to(http, bytes, mime, UPLOAD_URL).await
}
async fn pin_to(
    http: &reqwest::Client,
    bytes: Vec<u8>,
    mime: &'static str,
    endpoint: &str,
) -> Result<Value, ApiError> {
    if bytes.is_empty() || bytes.len() > MAX_IMAGE_BYTES {
        return Err(ApiError(StatusCode::PAYLOAD_TOO_LARGE, "image_too_large"));
    }
    if image_type(&bytes) != Some(mime) {
        return Err(ApiError(
            StatusCode::UNSUPPORTED_MEDIA_TYPE,
            "invalid_image",
        ));
    }
    let _slot = SLOTS
        .try_acquire()
        .map_err(|_| ApiError(StatusCode::TOO_MANY_REQUESTS, "rate_limited"))?;
    let extension = match mime {
        "image/png" => "png",
        "image/jpeg" => "jpg",
        _ => "webp",
    };
    let file = reqwest::multipart::Part::bytes(bytes)
        .file_name(format!("token.{extension}"))
        .mime_str(mime)
        .map_err(|_| ApiError(StatusCode::BAD_REQUEST, "invalid_image"))?;
    let mut response = http
        .post(endpoint)
        .header("Origin", "https://ponsfamily.com")
        .header("Referer", "https://ponsfamily.com/launchpad/create")
        .timeout(Duration::from_secs(20))
        .multipart(reqwest::multipart::Form::new().part("image", file))
        .send()
        .await
        .map_err(|_| ApiError(StatusCode::BAD_GATEWAY, "upload_failed"))?;
    if !response.status().is_success() {
        return Err(ApiError(
            if response.status() == StatusCode::TOO_MANY_REQUESTS {
                StatusCode::TOO_MANY_REQUESTS
            } else {
                StatusCode::BAD_GATEWAY
            },
            "upload_failed",
        ));
    }
    let mut body = Vec::new();
    while let Some(chunk) = response
        .chunk()
        .await
        .map_err(|_| ApiError(StatusCode::BAD_GATEWAY, "upload_failed"))?
    {
        if body.len() + chunk.len() > 2048 {
            return Err(ApiError(StatusCode::BAD_GATEWAY, "upload_failed"));
        }
        body.extend_from_slice(&chunk);
    }
    let value: Value = serde_json::from_slice(&body)
        .map_err(|_| ApiError(StatusCode::BAD_GATEWAY, "upload_failed"))?;
    published_image(&value)
}
pub fn origin(state: &AppState, headers: &HeaderMap) -> Result<(), ApiError> {
    if headers
        .get(header::ORIGIN)
        .and_then(|value| value.to_str().ok())
        != Some(&state.origin)
    {
        return Err(ApiError(StatusCode::FORBIDDEN, "origin_not_allowed"));
    }
    Ok(())
}
pub async fn quota(state: AppState, kind: &'static str, limit: u64) -> Result<(), ApiError> {
    let allowed = database(state, move |db| {
        let count: u64 = db.query_row(
            "SELECT COUNT(*) FROM request_limits WHERE kind=?1 AND created_at > unixepoch()-3600",
            [kind],
            |row| row.get(0),
        )?;
        if count >= limit {
            return Ok(false);
        }
        db.execute(
            "DELETE FROM request_limits WHERE created_at < unixepoch()-86400",
            [],
        )?;
        db.execute("INSERT INTO request_limits(kind) VALUES(?1)", [kind])?;
        Ok(true)
    })
    .await?;
    if !allowed {
        return Err(ApiError(StatusCode::TOO_MANY_REQUESTS, "rate_limited"));
    }
    Ok(())
}
fn image_type(bytes: &[u8]) -> Option<&'static str> {
    if bytes.starts_with(b"\x89PNG\r\n\x1a\n") {
        Some("image/png")
    } else if bytes.starts_with(&[0xff, 0xd8, 0xff]) {
        Some("image/jpeg")
    } else if bytes.len() >= 12 && &bytes[..4] == b"RIFF" && &bytes[8..12] == b"WEBP" {
        Some("image/webp")
    } else {
        None
    }
}
pub async fn upload_avatar(
    State(state): State<AppState>,
    headers: HeaderMap,
    mut multipart: Multipart,
) -> Result<Json<Value>, ApiError> {
    origin(&state, &headers)?;
    let field = multipart
        .next_field()
        .await
        .map_err(|_| ApiError(StatusCode::BAD_REQUEST, "invalid_upload"))?
        .ok_or(ApiError(StatusCode::BAD_REQUEST, "missing_image"))?;
    if field.name() != Some("file") {
        return Err(ApiError(StatusCode::BAD_REQUEST, "invalid_upload"));
    }
    let bytes = field
        .bytes()
        .await
        .map_err(|_| ApiError(StatusCode::PAYLOAD_TOO_LARGE, "image_too_large"))?;
    if bytes.is_empty() || bytes.len() > MAX_IMAGE_BYTES {
        return Err(ApiError(StatusCode::PAYLOAD_TOO_LARGE, "image_too_large"));
    }
    let mime = image_type(&bytes).ok_or(ApiError(
        StatusCode::UNSUPPORTED_MEDIA_TYPE,
        "invalid_image",
    ))?;
    if multipart
        .next_field()
        .await
        .map_err(|_| ApiError(StatusCode::BAD_REQUEST, "invalid_upload"))?
        .is_some()
    {
        return Err(ApiError(StatusCode::BAD_REQUEST, "invalid_upload"));
    }
    // shortcut: one persistent site-wide quota; use wallet-bound upload tickets before a public high-traffic launch.
    quota(state.clone(), "upload", 20).await?;
    Ok(Json(pin_image(&state.http, bytes.to_vec(), mime).await?))
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn only_supported_image_signatures_are_accepted() {
        assert_eq!(image_type(b"\x89PNG\r\n\x1a\n"), Some("image/png"));
        assert_eq!(image_type(&[255, 216, 255, 0]), Some("image/jpeg"));
        assert_eq!(image_type(b"RIFF1234WEBP"), Some("image/webp"));
        assert_eq!(image_type(b"<svg onload='alert(1)'>"), None);
        assert_eq!(image_type(b"not an image"), None);
    }
    #[test]
    fn pons_cid_and_uri_must_match() {
        let cid = "bafkreiein35d7u5u3ko4dd3zb5ckfdgkxqvoaeflpqncrpkcfxoeutg64e";
        assert_eq!(
            published_image(&json!({"cid":cid,"uri":format!("ipfs://{cid}")})).unwrap()["url"],
            format!("https://gateway.pinata.cloud/ipfs/{cid}")
        );
        for cid in ["", "bafkrei/../bad", "bafkreiaaaaaaaaaaaaaaaaa0"] {
            assert!(published_image(&json!({"cid":cid,"uri":format!("ipfs://{cid}")})).is_err());
        }
        assert!(published_image(&json!({"cid":cid,"uri":"ipfs://different"})).is_err());
    }
    #[tokio::test]
    async fn pons_upload_reuses_the_fixed_protocol_and_rejects_bad_responses() {
        use axum::{body::to_bytes, extract::Request, response::IntoResponse};
        let cid = "bafkreiein35d7u5u3ko4dd3zb5ckfdgkxqvoaeflpqncrpkcfxoeutg64e";
        let app = axum::Router::new().fallback(move |request: Request| async move {
            assert_eq!(request.method(), "POST");
            assert_eq!(request.headers()["Origin"], "https://ponsfamily.com");
            assert_eq!(
                request.headers()["Referer"],
                "https://ponsfamily.com/launchpad/create"
            );
            assert!(request.headers().get("Cookie").is_none());
            assert!(request.headers().get("Authorization").is_none());
            let path = request.uri().path().to_string();
            let body = to_bytes(request.into_body(), MAX_IMAGE_BYTES + 65536)
                .await
                .unwrap();
            assert!(body.windows(12).any(|w| w == b"name=\"image\""));
            match path.as_str() {
                "/redirect" => {
                    (StatusCode::TEMPORARY_REDIRECT, [("Location", "/ok")]).into_response()
                }
                "/limited" => StatusCode::TOO_MANY_REQUESTS.into_response(),
                "/oversized" => "x".repeat(2049).into_response(),
                "/invalid" => Json(json!({"cid":cid,"uri":"ipfs://different"})).into_response(),
                _ => Json(json!({"cid":cid,"uri":format!("ipfs://{cid}")})).into_response(),
            }
        });
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let base = format!("http://{}", listener.local_addr().unwrap());
        let server = tokio::spawn(async move { axum::serve(listener, app).await.unwrap() });
        let http = reqwest::Client::builder()
            .redirect(reqwest::redirect::Policy::none())
            .build()
            .unwrap();
        let bytes = b"\x89PNG\r\n\x1a\n".to_vec();
        assert_eq!(
            pin_to(&http, bytes.clone(), "image/png", &format!("{base}/ok"))
                .await
                .unwrap()["uri"],
            format!("ipfs://{cid}")
        );
        for path in ["redirect", "limited", "oversized", "invalid"] {
            assert!(
                pin_to(&http, bytes.clone(), "image/png", &format!("{base}/{path}"))
                    .await
                    .is_err()
            );
        }
        assert!(pin_to(&http, b"<svg/>".to_vec(), "image/png", &base)
            .await
            .is_err());
        server.abort();
    }
}
