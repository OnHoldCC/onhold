import {spawn,spawnSync} from 'node:child_process';
import {existsSync,readFileSync,mkdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {userInfo} from 'node:os';
import {createServer} from 'node:net';
import {setTimeout as delay} from 'node:timers/promises';
const root=resolve(import.meta.dirname,'../..'),defaultDirectory=join(root,'backend/data/testnet');
const active=join(defaultDirectory,'active.json');
const directory=resolve(process.env.ONHOLD_TESTNET_DATA_DIR||(existsSync(active)?JSON.parse(readFileSync(active)).directory:defaultDirectory));
const e2e=process.argv.includes('--e2e');
// The public deployment manifest is also the frontend's active deployment.
const addresses=JSON.parse(readFileSync(join(root,'contracts/deployments/bnb-testnet.json'))),keys=JSON.parse(readFileSync(join(directory,'keys.json')));
if(addresses.chainId!==97||keys.chainId!==97||e2e&&!addresses.mock)throw Error('BNB testnet configuration required; E2E needs Mock contracts');
const pgDirectory=join(directory,'postgres'),socket=join(directory,'pgsocket'),redisSocket=join(directory,'redis.sock');
mkdirSync(socket,{recursive:true,mode:0o700});
const user=userInfo().username,children=[];
function command(bin,args){const result=spawnSync(bin,args,{encoding:'utf8'});if(result.status!==0)throw Error(`${bin} failed: ${result.stderr||'not installed'}`);return result.stdout.trim();}
function start(bin,args,env=process.env){const child=spawn(bin,args,{cwd:root,env,stdio:'inherit'});child.on('error',()=>console.error(`${bin} could not start`));children.push(child);return child;}
let closing=false;
async function stop(){if(closing)return;closing=true;for(const child of [...children].reverse())if(child.exitCode===null)child.kill('SIGTERM');}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
try{
 // Refuse an overlapping runtime before starting databases or replacing their Unix sockets.
 await new Promise((resolve,reject)=>{const probe=createServer();probe.once('error',()=>reject(Error('Local API port 4190 is already in use; stop the existing runtime first.')));probe.listen(4190,'127.0.0.1',()=>probe.close(resolve));});
 if(!existsSync(join(pgDirectory,'PG_VERSION')))command('initdb',['-D',pgDirectory,'--auth-local=peer','--auth-host=scram-sha-256','-U',user,'--no-instructions']);
 // Private Unix sockets only: these development databases expose no TCP listener.
 const pg=start('postgres',['-D',pgDirectory,'-h','','-k',socket,'-c','unix_socket_permissions=0700']);
 for(let i=0;i<80;i++){if(pg.exitCode!==null)throw Error('PostgreSQL stopped');const ready=spawnSync('pg_isready',['-h',socket,'-d','postgres'],{stdio:'ignore'});if(ready.status===0)break;if(i===79)throw Error('PostgreSQL did not become ready');await delay(100);}
 if(command('psql',['--no-psqlrc','-h',socket,'-d','postgres','-Atc',"SELECT count(*) FROM pg_database WHERE datname='onhold'"])==='0')command('createdb',['-h',socket,'onhold']);
 start('redis-server',['--port','0','--unixsocket',redisSocket,'--unixsocketperm','700','--dir',directory,'--dbfilename','redis.rdb','--save','60','1']);
 for(let i=0;i<80;i++){if(existsSync(redisSocket))break;if(i===79)throw Error('Redis did not become ready');await delay(100);}
 const env={...process.env,ONHOLD_ADDR:'127.0.0.1:4190',ONHOLD_ORIGIN:e2e?'http://127.0.0.1:4198':'http://127.0.0.1:4190',ONHOLD_DATA_DIR:join(directory,'api'),ONHOLD_DIST_DIR:join(root,'front/dist'),ONHOLD_MARKET_ADDRESS:addresses.marketAddress,ONHOLD_VERIFIER_PRIVATE_KEY:keys.verifierPrivateKey,ONHOLD_MARKET_FROM_BLOCK:String(addresses.marketFromBlock),ONHOLD_BUYBACK_VAULT:addresses.buybackVaultAddress,ONHOLD_BUYBACK_FROM_BLOCK:String(addresses.buybackFromBlock),ONHOLD_BUYBACK_FLAP_LIVE:String(addresses.flapLive===true),ONHOLD_CHAIN_RPC_URL:process.env.ONHOLD_CHAIN_RPC_URL||'https://bsc-testnet-rpc.publicnode.com',ONHOLD_CHAIN_WS_URL:process.env.ONHOLD_CHAIN_WS_URL||'wss://bsc-testnet-rpc.publicnode.com',DATABASE_URL:`host=${socket} user=${user} dbname=onhold sslmode=disable`,REDIS_URL:`redis+unix://${redisSocket}`};
 if(e2e){
  env.ONHOLD_E2E_STANDING_URL='http://127.0.0.1:4198/mock-standing';
  start(process.execPath,['backend/scripts/e2e-browser.mjs'],{...env,ONHOLD_TESTNET_DATA_DIR:directory});
 }
 const api=start(join(root,'backend/target/debug/onhold-api'),[],env);
 if(addresses.mock){
  if(!keys.adKeeperPrivateKey)throw Error('Dedicated ad keeper key required');
  const keeper=start(process.execPath,['backend/scripts/buyback-keeper.mjs','--ads','--mock'],{...env,ONHOLD_AD_REINVEST_MARKET:addresses.marketAddress,ONHOLD_KEEPER_PRIVATE_KEY:keys.adKeeperPrivateKey,ONHOLD_KEEPER_MAX_GAS_PRICE_GWEI:'1',ONHOLD_KEEPER_DATA_DIR:join(directory,'keeper')});
  keeper.once('exit',code=>{if(!closing){console.error(`Ad keeper stopped (${code})`);void stop();}});
 }
 console.log('BNB testnet runtime: http://127.0.0.1:4190 (private PG + Redis sockets)');
 await new Promise((resolve,reject)=>{api.once('exit',code=>code===0||closing?resolve():reject(Error('API stopped')));api.once('error',reject);});
}catch(error){console.error(error.message);process.exitCode=1;}finally{await stop();}
