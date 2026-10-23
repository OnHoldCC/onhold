import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFileSync,writeFileSync,renameSync,mkdirSync,existsSync,readdirSync,openSync,closeSync,unlinkSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {join,resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {JsonRpcProvider,getAddress} from 'ethers';
import {miningPosition,planMining,miningReceipt} from '../backend/scripts/agentic-mining.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const manifest=JSON.parse(readFileSync(join(root,'config/public-contracts.json')))['56'];
const addresses=Object.fromEntries(manifest.contracts);
const productionAssets={nft:addresses.nft,vault:addresses.gameplay,token:manifest.tokenAddress};
const rpc=JSON.parse(readFileSync(join(root,'config/networks.json')))['56'].rpc;
const local=join(root,'.rainbond/tools/agentic-wallet/node_modules/.bin/baw');
const baw=existsSync(local)?local:'baw';
const run=promisify(execFile);
async function binance(args){
 let stdout;
 try{({stdout}=await run(baw,[...args,'--json'],{encoding:'utf8',timeout:90000,maxBuffer:2*1024*1024}));}
 catch(e){if(e.stdout)stdout=e.stdout;else throw Error(e.code==='ENOENT'?'binance_cli_not_installed':'binance_cli_failed_check_wallet_before_retry');}
 let result;try{result=JSON.parse(stdout);}catch{throw Error('invalid_binance_response');}
 if(result.success!==true)throw Error(JSON.stringify(result.error||{message:'binance_request_failed'}));
 return result.data;
}
async function wallet(developer,call){
 const status=await call(['wallet','status']);if(status.status!=='CONNECTED')throw Error('agentic_wallet_not_connected');
 const [data,settings]=await Promise.all([call(['wallet','address']),call(['wallet','settings'])]);
 const address=data.addresses?.find(x=>String(x.binanceChainId)==='56')?.address;if(!address)throw Error('bsc_wallet_unavailable');
 if(developer&&(settings.devMode?.enabled!==true||!Number.isFinite(Number(settings.devMode.expiresAt))||Number(settings.devMode.expiresAt)*1000<=Date.now()))throw Error('enable_developer_mode_in_binance_app');
 return {address:getAddress(address),developerMode:settings.devMode?.enabled===true,sessionExpiresAt:settings.sessionExpireTime};
}
export async function runAgenticWallet(argv,{call=binance,provider:suppliedProvider,assets=productionAssets,directory=join(root,'.rainbond/agentic-wallet')}={}){
 function path(requestId){if(!/^[a-z0-9_-]{1,160}$/i.test(requestId||''))throw Error('invalid_request_id');return join(directory,requestId+'.json');}
 function save(record){mkdirSync(directory,{recursive:true,mode:0o700});const destination=path(record.requestId),temporary=destination+'.'+randomUUID();writeFileSync(temporary,JSON.stringify(record,null,2)+'\n',{mode:0o600});renameSync(temporary,destination);}
 function pending(address,except){
 if(!existsSync(directory))return;
 for(const name of readdirSync(directory).filter(x=>/^[a-z0-9_-]+\.json$/i.test(x))){const r=JSON.parse(readFileSync(join(directory,name)));if(r.requestId!==except&&r.plan?.from===address&&!['PREVIEW','confirmed','failed'].includes(r.status))throw Error('previous_transaction_unresolved:'+r.requestId);}
}
const canonical=plan=>JSON.stringify([plan.chainId,plan.step,plan.from,plan.to,plan.data,plan.value]);
const [command,...raw]=argv,options={};
let provider=suppliedProvider,lock;
try{
 if(!['status','positions','preview','execute','receipt'].includes(command))throw Error('Usage: status | positions | preview stake|claim|unstake [--token-id ID] [--referrer ADDRESS] | execute REQUEST_ID --confirm | receipt REQUEST_ID [--hash TX_HASH]');
 const subject=['preview','execute','receipt'].includes(command)?raw.shift():undefined;
 for(let i=0;i<raw.length;i++){
  const key=raw[i];if(!['--token-id','--referrer','--hash','--confirm'].includes(key)||Object.hasOwn(options,key))throw Error('invalid_option');
  options[key]=key==='--confirm'?true:raw[++i];if(options[key]===undefined)throw Error('missing_option_value');
 }
 const allowed=command==='preview'?['--token-id','--referrer']:command==='execute'?['--confirm']:command==='receipt'?['--hash']:[];
 if(Object.keys(options).some(key=>!allowed.includes(key)))throw Error('unexpected_option');
 const connected=await wallet(['preview','execute'].includes(command),call);
 if(command==='status')return {connected:true,chainId:56,...connected};
 else{
  provider??=new JsonRpcProvider(rpc,undefined,{cacheTimeout:-1});
  if(command==='positions')return await miningPosition(provider,assets,connected.address);
  else if(command==='preview'){
   pending(connected.address);
   const intent={action:subject,...(options['--token-id']!==undefined?{tokenId:options['--token-id']}:{}),...(options['--referrer']!==undefined?{referrer:options['--referrer']}:{})};
   const plan=await planMining(provider,assets,connected.address,intent);
   const preview=await call(['contract-call','preview','--binanceChainId','56','--from',plan.from,'--to',plan.to,'--value','0','--inputData',plan.data]);
   if(!preview.requestId||!Number.isFinite(Number(preview.expiresAt))||Number(preview.expiresAt)<=Date.now())throw Error('invalid_or_expired_preview');
   const record={requestId:preview.requestId,status:'PREVIEW',createdAt:new Date().toISOString(),expiresAt:Number(preview.expiresAt),plan};save(record);
   return {...record,assets,parsedTx:preview.parsedTx,simulationResult:preview.simulationResult,risks:preview.risks,requireConfirmation:preview.requireConfirmation,next:'Review this exact transaction, then execute '+record.requestId+' --confirm'};
  }else{
   let record=JSON.parse(readFileSync(path(subject),'utf8'));if(record.requestId!==subject||record.plan?.from!==connected.address)throw Error('wallet_or_request_changed');
   if(command==='execute'){
    if(options['--confirm']!==true)throw Error('explicit_confirmation_required');
    if(record.status!=='PREVIEW')throw Error('already_submitted_use_receipt');
    if(record.expiresAt<=Date.now())throw Error('preview_expired_create_a_new_preview');
    mkdirSync(directory,{recursive:true,mode:0o700});const lockPath=join(directory,'execute.lock'),fd=openSync(lockPath,'wx',0o600);closeSync(fd);lock=lockPath;
    record=JSON.parse(readFileSync(path(subject),'utf8'));
    if(record.requestId!==subject||record.plan?.from!==connected.address)throw Error('wallet_or_request_changed');
    if(record.status!=='PREVIEW')throw Error('already_submitted_use_receipt');
    if(record.expiresAt<=Date.now())throw Error('preview_expired_create_a_new_preview');
    pending(connected.address,record.requestId);
    const fresh=await planMining(provider,assets,connected.address,record.plan.intent);
    if(canonical(fresh)!==canonical(record.plan))throw Error('state_changed_create_a_new_preview');
    // A crash or network timeout after execute must never cause an automatic resubmission.
    record.status='EXECUTION_UNKNOWN';save(record);
    const result=await call(['contract-call','execute','--requestId',record.requestId]);
    record.result={orderId:result.orderId,status:result.status,txHash:result.txHash,message:result.message};record.status=result.status||'EXECUTION_UNKNOWN';save(record);
    return {requestId:record.requestId,...record.result,next:'Confirm in Binance App if requested; use receipt with the transaction hash. Do not execute this request again.'};
   }else{
    const hash=options['--hash']||record.result?.txHash;if(!hash)throw Error('await_binance_app_confirmation_then_supply_transaction_hash');
    if(record.result?.txHash&&record.result.txHash.toLowerCase()!==hash.toLowerCase())throw Error('transaction_hash_changed');
    const receipt=await miningReceipt(provider,assets,record.plan,hash);record.result={...record.result,txHash:hash};record.status=receipt.status;save(record);return {...receipt,requestId:record.requestId};
   }
  }
 }
}finally{if(!suppliedProvider)provider?.destroy();if(lock){try{unlinkSync(lock);}catch{}}}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{console.log(JSON.stringify(await runAgenticWallet(process.argv.slice(2))));}
 catch(e){console.error(JSON.stringify({error:e.shortMessage||e.message}));process.exitCode=1;}
}
