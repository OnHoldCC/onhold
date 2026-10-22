use k256::ecdsa::{RecoveryId, Signature, SigningKey, VerifyingKey};
use sha3::{Digest, Keccak256};

pub fn keccak(value: impl AsRef<[u8]>) -> [u8; 32] {
    Keccak256::digest(value.as_ref()).into()
}
pub fn hex(value: &[u8]) -> String {
    let mut s = String::with_capacity(value.len() * 2 + 2);
    s.push_str("0x");
    for b in value {
        s.push_str(&format!("{b:02x}"));
    }
    s
}
pub fn bytes(value: &str, size: usize) -> Result<Vec<u8>, &'static str> {
    let text = value.strip_prefix("0x").ok_or("invalid_hex")?;
    if text.len() != size * 2 || !text.bytes().all(|b| b.is_ascii_hexdigit()) {
        return Err("invalid_hex");
    }
    (0..size)
        .map(|i| u8::from_str_radix(&text[i * 2..i * 2 + 2], 16).map_err(|_| "invalid_hex"))
        .collect()
}
pub fn address(value: &str) -> Result<String, &'static str> {
    let decoded = bytes(value, 20)?;
    if decoded.iter().all(|b| *b == 0) {
        return Err("zero_address");
    }
    Ok(hex(&decoded))
}
pub fn wallet(key: &VerifyingKey) -> String {
    let public = key.to_encoded_point(false);
    hex(&keccak(&public.as_bytes()[1..])[12..])
}
fn word(number: u128) -> [u8; 32] {
    let mut value = [0u8; 32];
    value[16..].copy_from_slice(&number.to_be_bytes());
    value
}
fn address_word(address: &str) -> Result<[u8; 32], &'static str> {
    let mut value = [0u8; 32];
    value[12..].copy_from_slice(&bytes(address, 20)?);
    Ok(value)
}
#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountRecord {
    pub account: String,
    pub uuid: String,
    pub banned_at: String,
    pub plan: String,
}
impl AccountRecord {
    pub fn hash(&self) -> [u8; 32] {
        let mut data = Vec::new();
        for field in [&self.account, &self.uuid, &self.banned_at, &self.plan] {
            data.extend(keccak(field));
        }
        keccak(data)
    }
}
pub struct MintData<'a> {
    pub market: &'a str,
    pub recipient: &'a str,
    pub nullifier: &'a str,
    pub tier: u8,
    pub referrer: &'a str,
    pub deadline: u64,
    pub record: &'a AccountRecord,
}
pub fn mint_digest(claim: &MintData, chain_id: u64) -> Result<[u8; 32], &'static str> {
    let mut domain = Vec::new();
    domain.extend(keccak(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)",
    ));
    domain.extend(keccak("ONHOLD"));
    domain.extend(keccak("5"));
    domain.extend(word(chain_id as u128));
    domain.extend(address_word(claim.market)?);
    let mut message = Vec::new();
    message.extend(keccak("MintPass(address recipient,bytes32 nullifier,uint8 tier,address referrer,uint256 deadline,bytes32 recordHash)"));
    message.extend(address_word(claim.recipient)?);
    message.extend(bytes(claim.nullifier, 32)?);
    message.extend(word(claim.tier as u128));
    message.extend(address_word(claim.referrer)?);
    message.extend(word(claim.deadline as u128));
    message.extend(claim.record.hash());
    let mut payload = Vec::from([0x19, 0x01]);
    payload.extend(keccak(domain));
    payload.extend(keccak(message));
    Ok(keccak(payload))
}
pub fn sign(key: &SigningKey, digest: &[u8; 32]) -> Result<String, &'static str> {
    let (signature, id) = key
        .sign_prehash_recoverable(digest)
        .map_err(|_| "signing_failed")?;
    let mut bytes = signature.to_bytes().to_vec();
    bytes.push(id.to_byte() + 27);
    Ok(hex(&bytes))
}
pub fn personal_wallet(message: &str, signature: &str) -> Result<String, &'static str> {
    let raw = bytes(signature, 65)?;
    let recovery = match raw[64] {
        27 | 28 => raw[64] - 27,
        0 | 1 => raw[64],
        _ => return Err("invalid_signature"),
    };
    let sig = Signature::from_slice(&raw[..64]).map_err(|_| "invalid_signature")?;
    if sig.normalize_s().is_some() {
        return Err("invalid_signature");
    }
    let mut encoded = format!("\x19Ethereum Signed Message:\n{}", message.len()).into_bytes();
    encoded.extend(message.as_bytes());
    let recovered = VerifyingKey::recover_from_prehash(
        &keccak(encoded),
        &sig,
        RecoveryId::from_byte(recovery).ok_or("invalid_signature")?,
    )
    .map_err(|_| "invalid_signature")?;
    Ok(wallet(&recovered))
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn addresses_and_personal_signatures_are_checked() {
        assert!(address("0x0000000000000000000000000000000000000000").is_err());
        assert!(address("http://example.com").is_err());
        let key = SigningKey::from_slice(&[7; 32]).unwrap();
        let message = "ONHOLD wallet binding";
        let mut encoded = format!("\x19Ethereum Signed Message:\n{}", message.len()).into_bytes();
        encoded.extend(message.as_bytes());
        let signature = sign(&key, &keccak(encoded)).unwrap();
        assert_eq!(
            personal_wallet(message, &signature).unwrap(),
            wallet(key.verifying_key())
        );
        assert_ne!(
            personal_wallet("tampered", &signature).unwrap(),
            wallet(key.verifying_key())
        );
    }
    #[test]
    fn typed_mint_matches_ethers_version_five() {
        let claim = MintData {
            market: &format!("0x{}", "11".repeat(20)),
            recipient: &format!("0x{}", "22".repeat(20)),
            nullifier: &format!("0x{}", "33".repeat(32)),
            tier: 1,
            referrer: &format!("0x{}", "44".repeat(20)),
            deadline: 1800000000,
            record: &AccountRecord {
                account: "Example Organization".into(),
                uuid: "11111111-1111-4111-8111-111111111111".into(),
                banned_at: "2026-09-01T12:41:20.292985Z".into(),
                plan: "claude_pro".into(),
            },
        };
        assert_ne!(mint_digest(&claim,56).unwrap(),mint_digest(&claim,97).unwrap());
        assert_eq!(
            hex(&mint_digest(&claim,97).unwrap()),
            "0xfa82b82ea16dddb784b1d78d16368e705b47b778260227e15ebecf0c4cf3ec5d"
        );
    }
}
