import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {createServer as netServer} from 'node:net';
import {wsProxy} from './ws-proxy.mjs';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {JsonRpcProvider,Contract,ContractFactory,AbiCoder,keccak256,toUtf8Bytes,id,parseEther} from 'ethers';
async function port(){const s=netServer();s.listen(0,'127.0.0.1');await once(s,'listening');const p=s.address().port;await new Promise(resolve=>s.close(resolve));return p;}
async function until(fn){let last;for(let i=0;i<140;i++){try{const value=await fn();if(value)return value;}catch(cause){last=cause;}await delay(250);}throw last||Error('Cache did not synchronize');}
const artifact=async name=>JSON.parse(await readFile(new URL(`../../contracts/artifacts/${name}.json`,import.meta.url)));
test('WS → PostgreSQL replay matches chain rewards, survives restarts, falls back from Redis and adds no RPC per API read', {timeout:110000},async()=>{
 const rpcPort=await port(),apiPort=await port(),proxyPort=await port(),pgPort=await port(),redisPort=await port();const directory=await mkdtemp(join(tmpdir(),'onhold-ws-test-'));
 const anvil=spawn(process.env.ANVIL_BIN||'anvil',['--host','127.0.0.1','--port',String(rpcPort),'--chain-id','97','--silent'],{stdio:'ignore'});let backend,provider,postgres,redis;let rpcCalls=0;const pgUrl=`postgresql://onhold_test@127.0.0.1:${pgPort}/postgres?sslmode=disable`;const sql=query=>execFileSync('psql',['--no-psqlrc',pgUrl,'-Atc',query],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
 const rpcUrl=`http://127.0.0.1:${rpcPort}`,api=`http://127.0.0.1:${apiPort}`;
 const proxy=await wsProxy(rpcUrl,proxyPort,()=>rpcCalls++);
 proxy.pruneHistory=true;
 try {
  execFileSync('initdb',['-D',join(directory,'pg'),'-A','trust','-U','onhold_test','--no-instructions'],{stdio:'ignore'});
  postgres=spawn('postgres',['-D',join(directory,'pg'),'-h','127.0.0.1','-p',String(pgPort),'-k',directory],{stdio:'ignore'});
  redis=spawn('redis-server',['--bind','127.0.0.1','--port',String(redisPort),'--save','','--appendonly','no','--dir',directory],{stdio:'ignore'});
  await until(()=>{try{return sql('SELECT 1')==='1'&&execFileSync('redis-cli',['-p',String(redisPort),'ping'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim()==='PONG';}catch{return false;}});
  await until(async()=>{const r=await fetch(rpcUrl,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:1,jsonrpc:'2.0',method:'eth_chainId',params:[]})});return r.ok;});
  provider=new JsonRpcProvider(rpcUrl,97,{cacheTimeout:-1});provider.pollingInterval=50;const owner=await provider.getSigner(0),user=await provider.getSigner(1);const address=await user.getAddress(),referrer=await owner.getAddress();
  const deployArtifact=await artifact('TestDeployment');const deploy=await new ContractFactory(deployArtifact.abi,deployArtifact.bytecode,owner).deploy();const receipt=await deploy.deploymentTransaction().wait();
  async function mine(){for(let i=0;i<4;i++){await provider.send('evm_mine',[]);await delay(40);}}
  const vaultArtifact=await artifact('FlapBuyback');const vault=await new ContractFactory(vaultArtifact.abi,vaultArtifact.bytecode,owner).deploy(await deploy.token(),referrer);const vaultReceipt=await vault.deploymentTransaction().wait();const vaultAddress=await vault.getAddress();
  const rewind=await provider.send('evm_snapshot',[]);
  const marketAddress=await deploy.market(),market=new Contract(marketAddress,(await artifact('OnholdMarket')).abi,owner);
  const env={...process.env};for(const key of Object.keys(env))if(key.startsWith('ONHOLD_'))delete env[key];Object.assign(env,{ONHOLD_ADDR:`127.0.0.1:${apiPort}`,ONHOLD_DATA_DIR:directory,ONHOLD_DIST_DIR:'/nonexistent',ONHOLD_MARKET_ADDRESS:marketAddress,ONHOLD_MARKET_FROM_BLOCK:String(receipt.blockNumber),ONHOLD_BUYBACK_VAULT:vaultAddress,ONHOLD_BUYBACK_FROM_BLOCK:String(vaultReceipt.blockNumber),ONHOLD_BUYBACK_FLAP_LIVE:'false',ONHOLD_CHAIN_WS_URL:`ws://127.0.0.1:${proxyPort}`,ONHOLD_CHAIN_RPC_URL:`http://127.0.0.1:${proxyPort}`,DATABASE_URL:pgUrl,REDIS_URL:`redis://127.0.0.1:${redisPort}`});
  const start=()=>{const child=spawn('backend/target/debug/onhold-api',[],{cwd:new URL('../..',import.meta.url),env,stdio:['ignore','ignore','pipe']});child.stderr.on('data',chunk=>process.stderr.write(chunk));return child;};
  backend=start();await until(async()=> (await fetch(api+'/api/health')).ok);
  const types={MintPass:[{name:'recipient',type:'address'},{name:'nullifier',type:'bytes32'},{name:'tier',type:'uint8'},{name:'referrer',type:'address'},{name:'deadline',type:'uint256'},{name:'recordHash',type:'bytes32'}]};
  async function mint(tier){const record={account:'Example Organization',uuid:crypto.randomUUID(),bannedAt:'2026-09-01T12:41:20.292985Z',plan:tier===1?'claude_pro':'claude_max'},nullifier=id(`ONHOLD:restricted-consumer-org:v1:${record.uuid}`),deadline=Number((await provider.getBlock('latest')).timestamp)+3600;
   const recordHash=keccak256(AbiCoder.defaultAbiCoder().encode(Array(4).fill('bytes32'),Object.values(record).map(v=>keccak256(toUtf8Bytes(v)))));const value={recipient:address,nullifier,tier,referrer,deadline,recordHash};const signature=await owner.signTypedData({name:'ONHOLD',version:'5',chainId:97,verifyingContract:marketAddress},types,value);
   await (await market.connect(user).mintPass(address,nullifier,tier,referrer,deadline,record,signature)).wait();return record;}
  await mint(1);await mint(2);await (await market.connect(user).stake(1,{gasLimit:1000000})).wait();await (await market.connect(user).stake(2,{gasLimit:1000000})).wait();
  await (await market.bid(0,0,'https://one.example/','First campaign','',['API'],{value:parseEther('0.01'),gasLimit:1000000})).wait();
  await (await market.bid(0,1,'https://two.example/','Second campaign','',['Fast'],{value:parseEther('0.011'),gasLimit:1000000})).wait();
  await provider.send('evm_increaseTime',[86400]);await mine();
  const read=async wallet=>(await fetch(`${api}/api/chain?market=${marketAddress}&wallet=${wallet}`)).json();
  const cached=await until(async()=>{const v=await read(address);return v.available&&v.mining?.weight===4&&v.history?.length===1&&Number(v.mining.earned)>0?v:null;});
  assert.equal(proxy.rejectedHistory,0,'startup must not require archival contract state');
  assert.equal((await fetch(api+'/api/ready')).status,200);
  assert.equal((await fetch(api+'/api/health').then(r=>r.json())).chain.available,true);
  assert.equal(cached.storage,'postgresql');assert.equal(cached.metadata_cache,true);assert.equal(sql('SELECT count(*) FROM chain_nfts'),'2');assert.equal(sql("SELECT count(*) FROM chain_wallets WHERE (data->>'weight')::bigint=4"),'1');assert.equal(cached.mining.passes.length,2);assert.equal(cached.mining.passes[0].record.account,'Example Organization');assert.match(cached.mining.passes[0].image,/^data:image\/svg\+xml;base64,/);assert.equal(sql('SELECT count(*) FROM chain_nfts WHERE image IS NOT NULL'),'2');assert.equal(cached.mining.weight,4);assert.equal(cached.ads[0].bid,parseEther('0.011').toString());assert.equal(cached.history[0].bid,parseEther('0.01').toString());
  assert.equal(parseEther(cached.mining.earned),await market.earned(address,{blockTag:cached.confirmed_block}));
  const network=await until(async()=>{const v=await fetch(api+'/api/mining-stats?period=1h').then(r=>r.json());return v.available&&v.latest.totalWeight===4?v:null;});
  assert.equal(network.refreshSeconds,900);assert.equal(network.stale,false);
  assert.equal(parseEther(network.latest.perWeightDaily),parseEther(cached.mining.daily)/4n);
  const cachedNetwork=JSON.parse(execFileSync('redis-cli',['-p',String(redisPort),'GET',`onhold:mining-stats:v1:${marketAddress.toLowerCase()}`],{encoding:'utf8'}));
  assert.deepEqual(cachedNetwork.latest,network.latest);assert.equal(sql('SELECT count(*) FROM mining_samples'),'1');
  const networkKey=`onhold:mining-stats:v1:${marketAddress.toLowerCase()}`;
  execFileSync('redis-cli',['-p',String(redisPort),'SET',networkKey,JSON.stringify({...cachedNetwork,latest:{...cachedNetwork.latest,totalWeight:999}})],{stdio:'ignore'});
  assert.deepEqual((await fetch(api+'/api/mining-stats?period=1h').then(r=>r.json())).latest,network.latest,'fresh process snapshot avoids Redis on each request');
  execFileSync('redis-cli',['-p',String(redisPort),'SET',networkKey,JSON.stringify(cachedNetwork)],{stdio:'ignore'});
  const readsBefore=rpcCalls;
  for(const period of ['1h','4h','1d','7d','30d','90d']){
   const v=await fetch(api+'/api/mining-stats?period='+period).then(r=>r.json());assert.equal(v.period,period);assert.deepEqual(v.latest,network.latest);assert.equal(v.history.length,1);
  }
  assert.equal(rpcCalls,readsBefore,'mining history reads must not call the chain');
  assert.equal((await fetch(api+'/api/mining-stats?period=invalid')).status,400);
  assert.equal((await read(address)).mining.shareBps,10000);
  const liveCalls=rpcCalls;await (await market.connect(user).unstake(1,{gasLimit:1000000})).wait();await mine();
  await until(async()=>{const v=await read(address);return v.available&&v.mining.weight===3;});
  await (await market.connect(user).stake(1,{gasLimit:1000000})).wait();await mine();
  await until(async()=>{const v=await read(address);return v.available&&v.mining.weight===4;});
  await (await owner.sendTransaction({to:vaultAddress,value:parseEther('0.0005')})).wait();await mine();
  await until(async()=>{const v=await fetch(api+'/api/burn').then(r=>r.json());return v.available&&v.totals.received==='0.000500000000000000';});
  assert.equal(proxy.active(),1,'market and burn must share one active WS connection');
  assert.equal(rpcCalls,liveCalls,'live staking events and confirmations must use WS without RPC polling');
  const beforeDisconnect=await read(address);
  proxy.blocked=true;proxy.disconnect();
  const offline=await until(async()=>{const v=await read(address);return !v.connected&&v.stale?v:null;});
  assert.equal(offline.available,true,'confirmed DB data survives WS disconnection');
  assert.equal(offline.confirmed_block,beforeDisconnect.confirmed_block);assert.deepEqual(offline.ads,beforeDisconnect.ads);assert.deepEqual(offline.mining,beforeDisconnect.mining);
  const offlineGallery=await fetch(api+'/api/nfts').then(r=>r.json());assert.equal(offlineGallery.available,true);assert.equal(offlineGallery.stale,true);assert.equal(offlineGallery.total,2);
  const offlineBurn=await fetch(api+'/api/burn').then(r=>r.json());assert.equal(offlineBurn.available,true);assert.equal(offlineBurn.stale,true);assert.equal(offlineBurn.totals.received,'0.000500000000000000');
  assert.equal(offline.financial.burned,beforeDisconnect.financial.burned);
  assert.equal((await fetch(api+'/api/ready')).status,503);
  const degraded=await fetch(api+'/api/health');assert.equal(degraded.status,200);assert.equal((await degraded.json()).status,'degraded');
  await (await market.connect(user).unstake(1,{gasLimit:1000000})).wait();await mine();proxy.blocked=false;
  await until(async()=>{const v=await read(address);return v.available&&!v.stale&&v.mining.weight===3;});assert.ok(rpcCalls>liveCalls,'disconnect must backfill missed market events');
  assert.equal((await fetch(api+'/api/ready')).status,200);
  assert.equal(proxy.rejectedHistory,0,'reconnect must not query pruned historical state');
  await (await market.connect(user).stake(1,{gasLimit:1000000})).wait();await mine();await until(async()=>{const v=await read(address);return v.available&&v.mining.weight===4;});

  assert.equal(cached.protocol,'nft-staking-v4');assert.equal(cached.mining.durationDays,365);assert.equal(cached.mining.endsAt,cached.mining.startedAt+365*86400);assert.equal(parseEther(cached.mining.daily),await market.dailyEmission({blockTag:cached.confirmed_block}));
  // Exercise a real local-chain ad buyback and replay its new funding schedule through PG.
  await (await market.connect(user).getReward()).wait();
  const token=new Contract(await deploy.token(),(await artifact('ClaudeTestToken')).abi,user);
  const {default:solc}=await import('solc');
  const source=`pragma solidity ^0.8.24; interface Token {function transfer(address,uint) external returns(bool);} contract AdPortal {struct Params {address inputToken;address outputToken;uint inputAmount;uint minOutputAmount;bytes permitData;} function swapExactInput(Params calldata p) external payable returns(uint){uint out=msg.value*1000;require(Token(p.outputToken).transfer(msg.sender,out));return out;}}`;
  const compiled=JSON.parse(solc.compile(JSON.stringify({language:'Solidity',sources:{'Ad.sol':{content:source}},settings:{evmVersion:'paris',outputSelection:{'*':{'*':['evm.deployedBytecode.object']}}}})));
  const portal=await market.adBuybackPortal();await provider.send('anvil_setCode',[portal,'0x'+compiled.contracts['Ad.sol'].AdPortal.evm.deployedBytecode.object]);
  await (await token.transfer(portal,parseEther('1000'))).wait();
  const reserve=await market.adBuybackReserve(),added=reserve*1000n,latest=await provider.getBlock('latest');
  await (await market.reinvestAdRevenue(reserve,added,latest.timestamp+90,{gasLimit:1000000})).wait();
  await provider.send('evm_increaseTime',[86400]);await mine();
  const funded=await until(async()=>{const v=await read(address);return v.available&&parseEther(v.mining?.adReinvested||'0')===added?v:null;});
  assert.equal(parseEther(funded.mining.poolBudget),parseEther('100000000')+added);
  assert.equal(funded.mining.endsAt,funded.mining.startedAt+365*86400);
  assert.equal(parseEther(funded.mining.daily),await market.dailyEmission({blockTag:funded.confirmed_block}));
  assert.equal(parseEther(funded.mining.earned),await market.earned(address,{blockTag:funded.confirmed_block}));
  assert.equal(parseEther(funded.mining.adBuybackReserve),0n);assert.equal(parseEther(funded.mining.adTeamRevenue),reserve);
  assert.equal((await fetch(api+'/api/status').then(r=>r.json())).nft_configured,false);
  assert.ok(Number(execFileSync('redis-cli',['-p',String(redisPort),'dbsize'],{encoding:'utf8'}).trim())>=2);
  const keys=execFileSync('redis-cli',['-p',String(redisPort),'--scan'],{encoding:'utf8'}).trim().split('\n');
  for(const key of keys)execFileSync('redis-cli',['-p',String(redisPort),'SET',key,'{"account":"invalid cache entry"}'],{stdio:'ignore'});
  assert.equal((await read(address)).mining.passes[0].record.account,'Example Organization');assert.equal((await read(address)).mining.passes[0].image,cached.mining.passes[0].image);

  const nftPage=async(tier,page=1)=>(await fetch(`${api}/api/nfts?tier=${tier}&page=${page}&page_size=1`)).json();
  const all=await nftPage('all');assert.equal(all.total,2);assert.equal(all.pages,2);assert.equal(all.items[0].id,'2');assert.equal(all.storage,'postgresql');
  const pro=await nftPage('pro'),max=await nftPage('max');assert.equal(pro.total,1);assert.equal(pro.items[0].tier,1);assert.equal(max.items[0].tier,2);assert.equal((await nftPage('all',2)).items[0].id,'1');assert.equal((await nftPage('max',999)).page,1);
  for(const q of ['tier=free','page=0','page_size=25','tier=max&unexpected=x'])assert.equal((await fetch(`${api}/api/nfts?${q}`)).status,400);
  const before=rpcCalls;await Promise.all(Array.from({length:30},()=>nftPage('pro')));assert.equal(rpcCalls,before);await Promise.all(Array.from({length:30},()=>read(address)));assert.equal(rpcCalls,before,'frontend reads must not trigger RPC');
  await fetch(api+'/api/events',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event_id:crypto.randomUUID(),kind:'ad_click',page:'home',site_id:0,market:marketAddress,campaign_version:1})});
  const counted=await read(address);assert.equal(counted.history[0].clicks,0);assert.equal(counted.history[0].uv,0);assert.equal(counted.ads[0].clicks,0);assert.equal(sql("SELECT count(DISTINCT visitor_id) FROM analytics_events"),"1");assert.equal((await fetch(api+'/api/stats').then(r=>r.json())).ad_clicks,0);
  backend.kill('SIGTERM');await once(backend,'exit');
  await (await market.connect(user).unstake(1,{gasLimit:1000000})).wait();await (await market.connect(user).unstake(2,{gasLimit:1000000})).wait();await (await market.connect(user).getReward()).wait();await (await market.claimReferralRewards()).wait();await mine();
  backend=start();const restored=await until(async()=>{const v=await read(address);return v.available&&v.mining?.weight===0&&Number(v.mining.claimed)>0?v:null;});
  assert.equal(proxy.rejectedHistory,0,'restart must not query pruned historical state');
  assert.ok(restored.financial.claims.length>0);assert.ok(restored.financial.claims.every(row=>Number(row.amount)>0&&row.block<=restored.confirmed_block));assert.equal(restored.financial.claims[0].recipient,referrer.toLowerCase());
  assert.equal(restored.mining.passes.filter(p=>!p.staked).length,2);assert.equal(parseEther(restored.mining.claimed),await market.totalClaimed({blockTag:restored.confirmed_block}));assert.equal(restored.history[0].clicks,1);assert.equal(restored.history[0].uv,1);
  const inviter=await read(referrer);assert.equal(inviter.mining.referralRewards,'0.000000000000000000');assert.ok(Number(inviter.mining.referralEarned)>0);
  redis.kill('SIGTERM');await once(redis,'exit');const cachedWithoutRedis=await fetch(api+'/api/mining-stats?period=1h').then(r=>r.json());assert.deepEqual(cachedWithoutRedis.latest,network.latest);const withoutRedis=await read(address);assert.equal(withoutRedis.available,true);assert.equal(withoutRedis.mining.passes[0].record.account,'Example Organization');
  assert.equal((await fetch(api+'/api/stats').then(r=>r.json())).ad_clicks,1);assert.equal(sql('SELECT count(*) FROM analytics_events'), '1');
  assert.equal(await provider.send('evm_revert',[rewind]),true);await mine();
  await until(async()=>{const v=await read(address);return v.available&&v.mining.minted===0&&v.mining.passes.length===0;});
  assert.equal(sql('SELECT count(*) FROM chain_nfts'),'0');
  const replacement=await mint(1);await mine();
  const rebuilt=await until(async()=>{const v=await read(address);return v.available&&v.mining.passes[0]?.record?.uuid===replacement.uuid?v:null;});
  assert.equal(rebuilt.mining.passes[0].id,'1');assert.equal(sql('SELECT count(*) FROM chain_nfts'),'1');
 } finally {if(backend&&!backend.killed){backend.kill('SIGTERM');await once(backend,'exit');}provider?.destroy();anvil.kill('SIGTERM');if(postgres&&!postgres.killed){postgres.kill('SIGTERM');await once(postgres,'exit');}if(redis&&!redis.killed){redis.kill('SIGTERM');await once(redis,'exit');}await proxy.close();await rm(directory,{recursive:true,force:true});}
});

