import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {createServer} from 'node:net';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {ContractFactory,Contract,JsonRpcProvider,parseEther} from 'ethers';
import {wsProxy} from './ws-proxy.mjs';
async function port(){const s=createServer();s.listen(0,'127.0.0.1');await once(s,'listening');const n=s.address().port;await new Promise(r=>s.close(r));return n;}
async function until(fn){let last;for(let i=0;i<180;i++){try{const v=await fn();if(v)return v;}catch(e){last=e;}await delay(150);}throw last||Error('WS projection did not synchronize');}
const artifact=async name=>JSON.parse(await readFile(new URL(`../../contracts/artifacts/${name}.json`,import.meta.url)));
for(const flapLive of [false,true,'official'])test(`Burn WS (${flapLive==='official'?'official deflation':flapLive?'Flap processor':'standalone'}) writes PG once, backfills disconnects and replays reorgs`,{timeout:110000},async()=>{
 const official=flapLive==='official';
 const directory=await mkdtemp(join(tmpdir(),'onhold-burn-ws-')),pgPort=await port(),apiPort=await port(),rpcPort=await port(),proxyPort=await port();
 const pgUrl=`postgresql://onhold_test@127.0.0.1:${pgPort}/postgres?sslmode=disable`,api=`http://127.0.0.1:${apiPort}`,rpcUrl=`http://127.0.0.1:${rpcPort}`;
 const sql=q=>execFileSync('psql',['--no-psqlrc',pgUrl,'-Atc',q],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
 let anvil,postgres,backend,provider,proxy,calls=0;
 const stop=async()=>{if(backend&&!backend.killed&&backend.exitCode===null&&backend.signalCode===null){backend.kill('SIGTERM');await once(backend,'exit');}};
 try{
  execFileSync('initdb',['-D',join(directory,'pg'),'-A','trust','-U','onhold_test','--no-instructions'],{stdio:'ignore'});
  postgres=spawn('postgres',['-D',join(directory,'pg'),'-h','127.0.0.1','-p',String(pgPort),'-k',directory],{stdio:'ignore'});
  anvil=spawn(process.env.ANVIL_BIN||'anvil',['--host','127.0.0.1','--port',String(rpcPort),'--chain-id','97','--silent'],{stdio:'ignore'});
  await until(()=>{try{return sql('SELECT 1')==='1';}catch{return false;}});
  await until(async()=>{const r=await fetch(rpcUrl,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_chainId',params:[]})});return r.ok;});
  provider=new JsonRpcProvider(rpcUrl,97,{cacheTimeout:-1});provider.pollingInterval=25;
  const owner=await provider.getSigner(0),address=await owner.getAddress();
  const {default:solc}=await import('solc');const source=`pragma solidity ^0.8.24;
    contract FeeToken{event Transfer(address indexed from,address indexed to,uint value);event TokensBurned(uint amount);function decimals()external pure returns(uint8){return 18;}function buyTaxRate()external pure returns(uint16){return 300;}function sellTaxRate()external pure returns(uint16){return 300;}mapping(address=>uint)public balanceOf;address public taxProcessor;constructor(){balanceOf[msg.sender]=1e26;}function setProcessor(address p)external{taxProcessor=p;}function transfer(address to,uint amount)external returns(bool){balanceOf[msg.sender]-=amount;balanceOf[to]+=amount;emit Transfer(msg.sender,to,amount);if(to==address(0xdead))emit TokensBurned(amount);return true;}}
    contract Processor{function feeConfig()external pure returns(uint16,uint16,uint16,uint16,uint16,bool){return(0,5000,5000,0,1000,true);}function flapBlackHole()external pure returns(address){return address(0xdead);}function burn(uint amount)external{require(Token(taxToken).transfer(address(0xdead),amount));}address public taxToken;address public marketAddress;constructor(address t,address v){taxToken=t;marketAddress=v;}receive()external payable{}function setRecipient(address v)external{marketAddress=v;}function weth()external pure returns(address){return address(3);}function getQuoteToken()external pure returns(address){return address(3);}function marketQuoteBalance()external view returns(uint){return address(this).balance;}function dispatch()external{(bool ok,)=marketAddress.call{value:address(this).balance}("");require(ok);}}
    interface Token{function transfer(address,uint)external returns(bool);}contract Portal{struct Params{address inputToken;address outputToken;uint inputAmount;uint minOutputAmount;bytes permitData;}function swapExactInput(Params calldata p)external payable returns(uint){uint out=msg.value*1000;require(Token(p.outputToken).transfer(msg.sender,out));return out;}}`;
  const output=JSON.parse(solc.compile(JSON.stringify({language:'Solidity',sources:{'Portal.sol':{content:source}},settings:{evmVersion:'paris',outputSelection:{'*':{'*':['abi','evm.bytecode.object','evm.deployedBytecode.object']}}}})));
  const mocks=output.contracts['Portal.sol'];
  const deployMock=async(name,...args)=>{const a=mocks[name];const c=await new ContractFactory(a.abi,'0x'+a.evm.bytecode.object,owner).deploy(...args);await c.waitForDeployment();return c;};
  const tokenArtifact=await artifact('ClaudeTestToken'),vaultArtifact=await artifact('FlapBuyback');
  const token=flapLive?await deployMock('FeeToken'):await new ContractFactory(tokenArtifact.abi,tokenArtifact.bytecode,owner).deploy(address);await token.waitForDeployment();
  const vault=await new ContractFactory(vaultArtifact.abi,vaultArtifact.bytecode,owner).deploy(await token.getAddress(),address);const deployed=await vault.deploymentTransaction().wait();const vaultAddress=await vault.getAddress();
  let processor;
  if(flapLive){processor=await deployMock('Processor',await token.getAddress(),vaultAddress);await (await token.setProcessor(await processor.getAddress())).wait();await (await owner.sendTransaction({to:await processor.getAddress(),value:parseEther('0.0004')})).wait();}
  const portal=await vault.portal();await provider.send('anvil_setCode',[portal,'0x'+mocks.Portal.evm.deployedBytecode.object]);await (await token.transfer(portal,parseEther('1000'))).wait();
  async function mine(){for(let i=0;i<4;i++){await provider.send('evm_mine',[]);await delay(40);}}
  await mine();const rewind=await provider.send('evm_snapshot',[]);
  proxy=await wsProxy(rpcUrl,proxyPort,()=>calls++);
  if(official){await provider.send('anvil_mine',['0x44c']);proxy.pruneBefore=await provider.getBlockNumber()-10;}
  const env={...process.env};for(const key of Object.keys(env))if(key.startsWith('ONHOLD_')||key==='REDIS_URL')delete env[key];Object.assign(env,{ONHOLD_ADDR:`127.0.0.1:${apiPort}`,ONHOLD_DATA_DIR:directory,ONHOLD_DIST_DIR:'/nonexistent',ONHOLD_BUYBACK_VAULT:vaultAddress,ONHOLD_BUYBACK_FROM_BLOCK:String(deployed.blockNumber),ONHOLD_BUYBACK_FLAP_LIVE:String(!!flapLive),ONHOLD_CHAIN_WS_URL:`ws://127.0.0.1:${proxyPort}`,ONHOLD_CHAIN_RPC_URL:`http://127.0.0.1:${proxyPort}`,DATABASE_URL:pgUrl});
  if(official){delete env.ONHOLD_BUYBACK_VAULT;env.ONHOLD_FLAP_BURN_TOKEN=await token.getAddress();}
  const start=()=>{backend=spawn('backend/target/debug/onhold-api',[],{env,stdio:['ignore','ignore','pipe']});backend.stderr.on('data',chunk=>process.stderr.write(chunk));};
  const read=()=>fetch(api+'/api/burn').then(r=>r.json());start();await until(async()=>{const v=await read();return v.available&&v.connected;});if(official){assert.equal(proxy.rejectedHistory,0,'official burn bootstrap must not read pruned historical state');proxy.pruneBefore=0;}if(flapLive&&!official)assert.equal((await read()).totals.unsettled_creator_fees,'0.000400000000000000');
  if(official){
   const initialCalls=calls;
   await (await token.transfer(await processor.getAddress(),parseEther('1000'))).wait();
   const first=await (await processor.burn(parseEther('128'))).wait();
   await (await token.transfer('0x000000000000000000000000000000000000dead',parseEther('999'))).wait();await mine();
   const burned=await until(async()=>{const v=await read();return v.events.length===1?v:null;});
   assert.equal(burned.source,'flap');assert.equal(burned.totals.burned,'128.000000000000000000');assert.equal(burned.totals.spent,null);assert.equal(burned.events[0].tx_hash,first.hash);assert.equal(burned.events[0].gas_refunded,null);assert.equal(burned.policy.deflation_bps,5000);assert.equal(burned.policy.lp_bps,5000);assert.equal(burned.policy.buy_tax_bps,300);
   assert.equal(calls,initialCalls,'live official burn indexing must not poll RPC');
   for(let i=0;i<5;i++)assert.equal((await read()).events.length,1);assert.equal(calls,initialCalls);
   proxy.blocked=true;proxy.disconnect();await until(async()=>(await read()).stale);
   await (await processor.burn(parseEther('72'))).wait();await mine();proxy.blocked=false;
   await until(async()=>{const v=await read();return v.connected&&v.events.length===2&&v.totals.burned==='200.000000000000000000';});
   await stop();await provider.send('anvil_mine',['0x3ed']);start();
   await until(async()=>{const v=await read();return v.connected&&v.events.length===2&&v.totals.burned==='200.000000000000000000';});
   assert.equal(sql('SELECT count(*) FROM buyback_events'),'2');
   assert.equal(await provider.send('evm_revert',[rewind]),true);await mine();
   await until(async()=>{const v=await read();return v.connected&&v.events.length===0&&v.totals.burned==='0.000000000000000000';});
   assert.equal(sql('SELECT count(*) FROM buyback_events'),'0');return;
  }
  const initialCalls=calls;
  assert.equal((await fetch(api+'/api/ready')).status,200);
  await (await owner.sendTransaction({to:vaultAddress,value:parseEther('0.002')})).wait();await mine();
  const funded=await until(async()=>{const v=await read();return v.available&&v.totals.received==='0.002000000000000000'?v:null;});
  assert.equal(funded.totals.pending,'0.002000000000000000');assert.equal(calls,initialCalls,'WS revenue and block confirmations must not poll HTTP RPC');
  await provider.send('evm_increaseTime',[181]);await mine();const latest=await provider.getBlock('latest');
  const execute=await (await vault[flapLive?'settleAndExecute':'execute'](parseEther('0.0018'),parseEther('1'),latest.timestamp+90,{gasLimit:1000000})).wait();await mine();
  const burned=await until(async()=>{const v=await read();return v.available&&v.events.length===1?v:null;});
  assert.equal(sql('SELECT count(*) FROM buyback_events'),'1');assert.equal(burned.events[0].tx_hash,execute.hash);assert.equal(parseEther(burned.totals.spent),await vault.totalSpent());assert.equal(parseEther(burned.totals.burned),await vault.totalBurned());assert.equal(parseEther(burned.totals.gas_refunded),await vault.totalGasRefunded());assert.equal(parseEther(burned.totals.pending),await provider.getBalance(vaultAddress));assert.equal(burned.events[0].gas_refunded,burned.totals.gas_refunded);if(flapLive)assert.equal(burned.totals.unsettled_creator_fees,'0.000000000000000000');else assert.equal(calls,initialCalls,'duplicate WS notifications must not trigger backfill');
  const beforeReads=calls;for(let i=0;i<20;i++)assert.equal((await read()).events.length,1);assert.equal(calls,beforeReads,'page reads must use PG only');
  proxy.blocked=true;proxy.disconnect();
  const offline=await until(async()=>{const v=await read();return !v.connected&&v.stale?v:null;});
  assert.equal(offline.available,true);assert.deepEqual(offline.totals,burned.totals);assert.deepEqual(offline.events,burned.events);
  assert.equal((await fetch(api+'/api/ready')).status,503);
  await (await owner.sendTransaction({to:vaultAddress,value:parseEther('0.0005')})).wait();await mine();proxy.blocked=false;
  const recovered=await until(async()=>{const v=await read();return v.available&&v.totals.received===(flapLive?'0.002900000000000000':'0.002500000000000000')?v:null;});assert.ok(calls>initialCalls);assert.equal(recovered.events.length,1);assert.equal(sql('SELECT count(*) FROM buyback_events'),'1');
  await stop();const beforeRestart=calls;start();await until(async()=>{const v=await read();return v.available&&!v.stale&&calls>beforeRestart;});assert.equal(sql('SELECT count(*) FROM buyback_events'),'1','restart replay must remain idempotent');
  assert.equal(await provider.send('evm_revert',[rewind]),true);await mine();
  await until(async()=>{const v=await read();return v.available&&v.events.length===0&&v.totals.received==='0.000000000000000000';});assert.equal(sql('SELECT count(*) FROM buyback_events'),'0');
  if(flapLive){await stop();await (await processor.setRecipient(address)).wait();await mine();sql('DELETE FROM buyback_state');start();await until(async()=>{const v=await read();return !v.available&&v.status==='unavailable'&&v.last_error;});assert.equal(sql('SELECT count(*) FROM buyback_events'),'0');}
  proxy.failRpc=true;proxy.disconnect();await until(async()=>{const v=await read();return v.stale&&v.last_error;});const failureCalls=calls;await read();assert.equal(calls,failureCalls,'an unavailable API must still avoid RPC');
 }finally{await stop();provider?.destroy();await proxy?.close();if(anvil&&!anvil.killed){anvil.kill('SIGTERM');await once(anvil,'exit');}if(postgres&&!postgres.killed){postgres.kill('SIGTERM');await once(postgres,'exit');}await rm(directory,{recursive:true,force:true});}
});
