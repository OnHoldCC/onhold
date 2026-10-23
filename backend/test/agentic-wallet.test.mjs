import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createServer} from 'node:net';
import {mkdtempSync,readFileSync,writeFileSync,existsSync,unlinkSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {Contract,ContractFactory,JsonRpcProvider,ZeroAddress,id,AbiCoder,keccak256,toUtf8Bytes,parseEther} from 'ethers';
import solc from 'solc';
import {runAgenticWallet} from '../../scripts/agentic-wallet.mjs';
import {planMining,miningContracts,miningReceipt} from '../scripts/agentic-mining.mjs';

test('Agentic adapter confirms bind, token approval, stake, claim and unstake; blocks replay, tampering and uncertain sends',{timeout:90000},async()=>{
 const reservation=createServer();reservation.listen(0,'127.0.0.1');await once(reservation,'listening');const port=reservation.address().port;await new Promise(r=>reservation.close(r));
 const node=spawn('anvil',['--host','127.0.0.1','--port',String(port),'--chain-id','56','--silent'],{stdio:'ignore'});
 const provider=new JsonRpcProvider(`http://127.0.0.1:${port}`,undefined,{cacheTimeout:-1});provider.pollingInterval=30;
 const directory=mkdtempSync(join(tmpdir(),'onhold-agentic-'));
 try{
  for(let i=0;i<60;i++){try{await provider.getBlockNumber();break;}catch{await delay(100);}}
  const owner=await provider.getSigner(0),agent=await provider.getSigner(1),stranger=await provider.getSigner(2),address=await owner.getAddress(),wallet=await agent.getAddress();
  const artifact=name=>JSON.parse(readFileSync(`contracts/artifacts/${name}.json`));
  const deploy=async(name,...args)=>{const a=artifact(name),c=await new ContractFactory(a.abi,a.bytecode,owner).deploy(...args);await c.waitForDeployment();return c;};
  const source='pragma solidity ^0.8.24; import "@openzeppelin/contracts/token/ERC20/ERC20.sol"; contract AgenticTestToken is ERC20 {constructor() ERC20("OnHold","OnHold"){_mint(msg.sender,100000000 ether);}}';
  const compiled=JSON.parse(solc.compile(JSON.stringify({language:'Solidity',sources:{'Token.sol':{content:source}},settings:{evmVersion:'paris',outputSelection:{'*':{'*':['abi','evm.bytecode.object']}}}}),{import:p=>({contents:readFileSync('node_modules/'+p,'utf8')})}));
  const a=compiled.contracts['Token.sol'].AgenticTestToken,token=await new ContractFactory(a.abi,'0x'+a.evm.bytecode.object,owner).deploy();await token.waitForDeployment();
  const nft=await deploy('OnholdNFT',address,address),implementation=await deploy('OnholdGameplayVault');
  const proxy=await deploy('ERC1967Proxy',await implementation.getAddress(),implementation.interface.encodeFunctionData('initialize',[address,await nft.getAddress(),await token.getAddress()]));
  const vault=new Contract(await proxy.getAddress(),artifact('OnholdGameplayVault').abi,owner);
  await (await token.transfer(await vault.getAddress(),parseEther('100000000'))).wait();
  const assets={nft:await nft.getAddress(),vault:await vault.getAddress(),token:await token.getAddress()};
  for(const tier of [2,0]){
   const record={account:'Local integration fixture',uuid:crypto.randomUUID(),bannedAt:'2026-10-22T00:00:00Z',plan:tier===2?'claude_max':'free'};
   const nullifier=id('ONHOLD:restricted-consumer-org:v1:'+record.uuid),deadline=Math.floor(Date.now()/1000)+86400;
   const recordHash=keccak256(AbiCoder.defaultAbiCoder().encode(['bytes32','bytes32','bytes32','bytes32'],Object.values(record).map(v=>keccak256(toUtf8Bytes(v)))));
   const value={recipient:address,nullifier,tier,referrer:ZeroAddress,deadline,recordHash};
   const types={MintPass:[{name:'recipient',type:'address'},{name:'nullifier',type:'bytes32'},{name:'tier',type:'uint8'},{name:'referrer',type:'address'},{name:'deadline',type:'uint256'},{name:'recordHash',type:'bytes32'}]};
   const signature=await owner.signTypedData({name:'ONHOLD',version:'5',chainId:56,verifyingContract:assets.nft},types,value);
   await (await nft.mintPass(address,nullifier,tier,ZeroAddress,deadline,record,signature)).wait();
  }
  for(const tokenId of [1,2])await (await nft.transferFrom(address,wallet,tokenId)).wait();
  let enabled=true,connected=true,mode='normal',executions=0,lastHash;
  const previews=new Map();
  // Only the Binance service is simulated; every contract call executes on the local EVM.
  const call=async args=>{
   const command=args.slice(0,2).join(' '),value=key=>args[args.indexOf(key)+1];
   if(command==='wallet status')return {status:connected?'CONNECTED':'UNCONNECTED'};
   if(command==='wallet address')return {addresses:[{binanceChainId:'56',address:wallet}]};
   if(command==='wallet settings')return {devMode:{enabled,expiresAt:Math.floor(Date.now()/1000)+3600},sessionExpireTime:new Date(Date.now()+3600000).toISOString()};
   if(command==='contract-call preview'){
    assert.equal(value('--binanceChainId'),'56');assert.equal(value('--value'),'0');assert.ok([assets.nft,assets.vault].includes(value('--to')));
    const requestId=crypto.randomUUID();previews.set(requestId,{from:value('--from'),to:value('--to'),data:value('--inputData'),value:0n});
    return {requestId,expiresAt:Date.now()+300000,parsedTx:{to:value('--to')},risks:{riskDetails:[]}};
   }
   if(command==='contract-call execute'){
    executions++;const tx=await agent.sendTransaction({...previews.get(value('--requestId')),gasLimit:1200000n});lastHash=tx.hash;await tx.wait();
    if(mode==='lost-response')throw Error('simulated_response_lost_after_broadcast');
    return {status:mode==='app'?'PENDING_CONFIRMATION':'BROADCASTED',orderId:crypto.randomUUID(),txHash:mode==='app'?null:tx.hash};
   }
   throw Error('unexpected_binance_command');
  };
  const deps={call,provider,assets,directory},run=(...args)=>runAgenticWallet(args,deps);
  const confirm=async preview=>{await provider.send('evm_mine',[]);await provider.send('evm_mine',[]);const r=await run('receipt',preview.requestId,'--hash',lastHash);assert.equal(r.status,'confirmed');return r;};
  assert.equal((await run('status')).connected,true);
  connected=false;await assert.rejects(run('positions'),/not_connected/);connected=true;
  enabled=false;await assert.rejects(run('preview','claim'),/enable_developer_mode/);enabled=true;
  await assert.rejects(miningContracts({send:async()=> '0x61'},assets),/wrong_chain/);
  await assert.rejects(miningContracts(provider,{...assets,token:assets.nft}),/deployment_mismatch/);
  await assert.rejects(planMining(provider,assets,await stranger.getAddress(),{action:'stake',tokenId:'1',referrer:ZeroAddress}),/not_nft_owner/);
  await assert.rejects(run('preview','stake','--token-id','2','--referrer',ZeroAddress),/no_mining_weight/);
  await assert.rejects(run('preview','stake','--token-id','1'),/explicit_referrer_required/);
  await assert.rejects(run('preview','stake','--token-id','1','--referrer',wallet),/self_referral/);
  await assert.rejects(run('preview','stake','--token-id','0'),/invalid_token_id/);
  await assert.rejects(run('preview','transfer','--token-id','1'),/unsupported_action/);
  await assert.rejects(run('preview','claim'),/no_claimable_rewards/);
  let preview=await run('preview','stake','--token-id','1','--referrer',ZeroAddress);assert.equal(preview.plan.step,'bind');assert.equal(preview.plan.details.permanentReferralBinding,true);
  await assert.rejects(run('execute',preview.requestId),/explicit_confirmation_required/);
  const lock=join(directory,'execute.lock');writeFileSync(lock,'another process');await assert.rejects(run('execute',preview.requestId,'--confirm'),/EEXIST/);assert.ok(existsSync(lock));unlinkSync(lock);
  await run('execute',preview.requestId,'--confirm');await assert.rejects(run('preview','stake','--token-id','1'),/previous_transaction_unresolved/);await confirm(preview);
  await assert.rejects(run('execute',preview.requestId,'--confirm'),/already_submitted/);
  preview=await run('preview','stake','--token-id','1');assert.equal(preview.plan.step,'approve');
  const file=join(directory,preview.requestId+'.json'),saved=JSON.parse(readFileSync(file));
  writeFileSync(file,JSON.stringify({...saved,expiresAt:0}));await assert.rejects(run('execute',preview.requestId,'--confirm'),/preview_expired/);writeFileSync(file,JSON.stringify(saved));
  writeFileSync(file,JSON.stringify({...saved,plan:{...saved.plan,to:await stranger.getAddress()}}));await assert.rejects(run('execute',preview.requestId,'--confirm'),/state_changed/);writeFileSync(file,JSON.stringify(saved));
  mode='app';const result=await run('execute',preview.requestId,'--confirm');assert.equal(result.status,'PENDING_CONFIRMATION');await assert.rejects(run('receipt',preview.requestId),/await_binance_app/);await confirm(preview);mode='normal';
  assert.equal(await nft.getApproved(1),assets.vault);assert.equal(await nft.isApprovedForAll(wallet,assets.vault),false);
  preview=await run('preview','stake','--token-id','1');assert.equal(preview.plan.step,'stake');await run('execute',preview.requestId,'--confirm');await confirm(preview);
  assert.equal(await nft.ownerOf(1),assets.vault);assert.equal(await vault.stakerOf(1),wallet);assert.equal(await vault.stakedWeight(wallet),3n);
  await provider.send('evm_increaseTime',[3600]);await provider.send('evm_mine',[]);
  preview=await run('preview','claim');assert.equal(preview.plan.step,'claim');mode='lost-response';
  await assert.rejects(run('execute',preview.requestId,'--confirm'),/response_lost/);const count=executions;
  await assert.rejects(run('execute',preview.requestId,'--confirm'),/already_submitted/);assert.equal(executions,count);await confirm(preview);mode='normal';
  assert.ok(await token.balanceOf(wallet)>0n);
  preview=await run('preview','unstake','--token-id','1');await run('execute',preview.requestId,'--confirm');await confirm(preview);
  await assert.rejects(miningReceipt(provider,assets,{...preview.plan,preparedBlock:await provider.getBlockNumber()},lastHash),/transaction_predates_preview/);
  assert.equal(await nft.ownerOf(1),wallet);assert.equal(await vault.stakerOf(1),ZeroAddress);assert.equal(await vault.stakedWeight(wallet),0n);
  const position=await run('positions');assert.equal(position.stakedCount,'0');assert.ok(BigInt(position.tokenBalanceWei)>0n);
  await assert.rejects(miningReceipt(provider,assets,preview.plan,await owner.sendTransaction({to:wallet,value:1n}).then(t=>t.hash)),/transaction_mismatch/);
 }finally{provider.destroy();node.kill('SIGTERM');await once(node,'exit');rmSync(directory,{recursive:true,force:true});}
});
