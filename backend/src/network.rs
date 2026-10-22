use rusqlite::OptionalExtension;
use serde_json::Value;
#[derive(Clone, Copy)]
pub struct Network { pub id: u64, pub prepare: bool }
impl Default for Network { fn default()->Self {Self{id:97,prepare:false}} }
impl Network {
    pub fn from_env()->Result<Self,Box<dyn std::error::Error>> {
        let id=std::env::var("ONHOLD_CHAIN_ID").unwrap_or_else(|_|"97".into()).parse()?;
        if ![56,97].contains(&id) {return Err("Unsupported ONHOLD_CHAIN_ID".into())}
        let prepare=match std::env::var("ONHOLD_MODE").as_deref(){Ok("prepare")=>true,Ok("active")|Err(_)=>false,_=>return Err("Invalid ONHOLD_MODE".into())};
        let production=std::env::var("ONHOLD_ENV").as_deref()==Ok("production");
        if production && id!=56 {return Err("Production requires chain 56".into())}
        if id==56 {
            for key in ["ONHOLD_E2E_STANDING_URL","ONHOLD_E2E_REPEAT_UUID","ONHOLD_PREVIOUS_MARKET_ADDRESS"] {
                if std::env::var(key).is_ok() {return Err("Test configuration is forbidden on mainnet".into())}
            }
            for key in ["DATABASE_URL","REDIS_URL","ONHOLD_DATA_DIR","ONHOLD_ORIGIN"] {
                if std::env::var(key).unwrap_or_default().is_empty(){return Err(format!("Mainnet requires {key}").into())}
            }
            if !std::env::var("ONHOLD_ORIGIN")?.starts_with("https://") {return Err("Mainnet requires HTTPS origin".into())}
        }
        let contracts=["ONHOLD_NFT_ADDRESS","ONHOLD_MARKET_ADDRESS","ONHOLD_VERIFIER_PRIVATE_KEY","ONHOLD_BUYBACK_VAULT","ONHOLD_FLAP_BURN_TOKEN","ONHOLD_MARKET_FROM_BLOCK","ONHOLD_BUYBACK_FROM_BLOCK"];
        if prepare && contracts.iter().any(|key|std::env::var(key).is_ok()){return Err("Prepare mode forbids signing and contract configuration".into())}
        if id==56 && !prepare {
            for key in ["ONHOLD_NFT_ADDRESS","ONHOLD_MARKET_ADDRESS","ONHOLD_VERIFIER_PRIVATE_KEY","ONHOLD_MARKET_FROM_BLOCK","ONHOLD_CHAIN_RPC_URL","ONHOLD_CHAIN_WS_URL"] {
                if std::env::var(key).unwrap_or_default().is_empty(){return Err(format!("Active mainnet requires {key}").into())}
            }
        }
        Ok(Self{id,prepare})
    }
    pub fn bind_sqlite(&self,db:&rusqlite::Connection)->Result<(),Box<dyn std::error::Error>> {
        db.execute_batch("CREATE TABLE IF NOT EXISTS runtime_network(id INTEGER PRIMARY KEY CHECK(id=1),chain_id INTEGER NOT NULL)")?;
        let existing:Option<u64>=db.query_row("SELECT chain_id FROM runtime_network WHERE id=1",[],|r|r.get(0)).optional()?;
        if existing.is_some_and(|id|id!=self.id){return Err("SQLite belongs to another network".into())}
        if existing.is_none() && self.id==56 {
            let used:bool=db.query_row("SELECT EXISTS(SELECT 1 FROM nft_mints) OR EXISTS(SELECT 1 FROM events) OR EXISTS(SELECT 1 FROM verified_accounts) OR EXISTS(SELECT 1 FROM invites)",[],|r|r.get(0))?;
            if used{return Err("Mainnet requires an empty dedicated SQLite database".into())}
        }
        db.execute("INSERT OR IGNORE INTO runtime_network VALUES(1,?1)",[self.id])?;
        let recorded:u64=db.query_row("SELECT chain_id FROM runtime_network WHERE id=1",[],|r|r.get(0))?;
        if recorded!=self.id{return Err("SQLite network binding changed during startup".into())}
        Ok(())
    }
    fn config(&self)->Value {serde_json::from_str::<Value>(include_str!("../../config/networks.json")).expect("network catalog")[self.id.to_string()].clone()}
    pub fn hex(&self)->String {format!("0x{:x}",self.id)}
    pub fn label(&self)->String {self.config()["label"].as_str().unwrap().into()}
    pub fn rpc(&self)->String {self.config()["rpc"].as_str().unwrap().into()}
}
#[cfg(test)] mod tests {
    use super::*;
    #[test]fn network_binding_rejects_cross_chain_data_without_removing_it(){
        let db=rusqlite::Connection::open_in_memory().unwrap();crate::init_db(&db).unwrap();let test=Network::default();let prod=Network{id:56,prepare:true};test.bind_sqlite(&db).unwrap();
        db.execute("INSERT INTO invites VALUES('abcdef123456','wallet')",[]).unwrap();assert!(prod.bind_sqlite(&db).is_err());assert_eq!(db.query_row("SELECT count(*) FROM invites",[],|r|r.get::<_,u64>(0)).unwrap(),1);
        let fresh=rusqlite::Connection::open_in_memory().unwrap();crate::init_db(&fresh).unwrap();prod.bind_sqlite(&fresh).unwrap();assert!(test.bind_sqlite(&fresh).is_err());
    }
    #[test]fn supported_networks_have_distinct_domains(){let test=Network::default();let prod=Network{id:56,prepare:true};assert_eq!(prod.hex(),"0x38");assert_eq!(prod.label(),"BNB Mainnet (56)");assert_ne!(prod.rpc(),test.rpc());}
}
