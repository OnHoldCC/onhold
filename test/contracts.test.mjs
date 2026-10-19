import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createServer} from 'node:net';
import {readFileSync} from 'node:fs';
import {setTimeout as delay} from 'node:timers/promises';
import {JsonRpcProvider,Contract,ContractFactory,parseEther,ZeroAddress,id} from 'ethers';
const artifact=name=>JSON.parse(readFileSync(new URL(`../artifacts/${name}.json`,import.meta.url)));
let node,provider,owner,user,other;
before(async()=>{
  const reservation=createServer();reservation.listen(0,'127.0.0.1');await once(reservation,'listening');const port=reservation.address().port;await new Promise(resolve=>reservation.close(resolve));
  node=spawn(process.env.ANVIL_BIN||'anvil',['--host','127.0.0.1','--port',String(port),'--chain-id','31337','--silent'],{stdio:'ignore'});
  node.on('error',()=>{});
  const url=`http://127.0.0.1:${port}`;
  for(let attempt=0;attempt<50;attempt++){try{await fetch(url,{method:'POST',body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_chainId',params:[]}),headers:{'content-type':'application/json'}});break;}catch{if(attempt===49)throw new Error('Anvil is required for contract tests');await delay(100);}}
  provider=new JsonRpcProvider(url,31337,{cacheTimeout:-1});provider.pollingInterval=50;
  owner=await provider.getSigner(0);user=await provider.getSigner(1);other=await provider.getSigner(2);
});
after(async()=>{provider?.destroy();node?.kill('SIGTERM');});
async function fixture(){
  const factory=new ContractFactory(artifact('TestDeployment').abi,artifact('TestDeployment').bytecode,owner);
  const deployment=await factory.deploy();await deployment.waitForDeployment();
  const market=new Contract(await deployment.market(),artifact('OnholdMarket').abi,owner);
  const token=new Contract(await deployment.token(),artifact('ClaudeTestToken').abi,owner);
  return {market,token};
}
const listing=['Relay test','https://example.com/','A test relay'];
test('contract price preserves the first 24h then halves at exact boundaries',async()=>{
  const {market}=await fixture();await (await market.bid(0,0,...listing,{value:parseEther('0.08')})).wait();
  const start=Number((await market.ads(0)).startedAt);
  await provider.send('evm_setNextBlockTimestamp',[start+86399]);await provider.send('evm_mine',[]);assert.equal(await market.currentPrice(0),parseEther('0.08'));
  await provider.send('evm_setNextBlockTimestamp',[start+86400]);await provider.send('evm_mine',[]);assert.equal(await market.currentPrice(0),parseEther('0.04'));
  await provider.send('evm_setNextBlockTimestamp',[start+172800]);await provider.send('evm_mine',[]);assert.equal(await market.currentPrice(0),parseEther('0.02'));
});
test('strict bids, stale listing protection and metadata validation are enforced on-chain',async()=>{
  const {market}=await fixture();await (await market.bid(0,0,...listing,{value:parseEther('0.08')})).wait();
  await assert.rejects(market.connect(user).bid(0,1,...listing,{value:parseEther('0.08')}),/Bid too low/);
  await (await market.connect(user).bid(0,1,...listing,{value:parseEther('0.09')})).wait();
  assert.equal((await market.ads(0)).advertiser,await user.getAddress());
  assert.equal((await market.ads(0)).version,2n);
  await assert.rejects(market.connect(other).bid(0,1,...listing,{value:parseEther('1')}),/Listing changed/);
  await assert.rejects(market.bid(1,0,'Bad','javascript:alert(1)','Test',{value:1n}),/HTTPS required/);
  assert.equal(await market.totalAdRevenue(),parseEther('0.17'));
});
test('native fee withdrawals require owner authority',async()=>{
  const {market}=await fixture();await (await market.bid(0,0,...listing,{value:123n})).wait();
  await assert.rejects(market.connect(user).withdrawRevenue(await user.getAddress(),123n));
  await (await market.withdrawRevenue(await owner.getAddress(),123n)).wait();
  assert.equal(await provider.getBalance(await market.getAddress()),0n);
});
async function proof(market,recipient,nullifier,amount,deadline,domainAddress){
  return owner.signTypedData({name:'ONHOLD',version:'1',chainId:31337,verifyingContract:domainAddress||await market.getAddress()},{Claim:[{name:'recipient',type:'address'},{name:'nullifier',type:'bytes32'},{name:'amount',type:'uint256'},{name:'deadline',type:'uint256'}]},{recipient,nullifier,amount,deadline});
}
async function timestamp(){return Number.parseInt((await provider.send('eth_getBlockByNumber',['latest',false])).timestamp,16);}
test('signed claims are bound to wallet, token pool and nullifier, with accurate unique recipient counts',async()=>{
  const {market,token}=await fixture();const recipient=await user.getAddress(),deadline=await timestamp()+3600,amount=parseEther('500'),nullifier=id('unique-restricted-org');
  const signature=await proof(market,recipient,nullifier,amount,deadline);
  await assert.rejects(market.connect(other).claim(recipient,nullifier,amount,deadline,signature),/Wrong recipient/);
  await (await market.connect(user).claim(recipient,nullifier,amount,deadline,signature)).wait();
  assert.equal(await token.balanceOf(recipient),amount);assert.equal(await market.totalRecipients(),1n);
  await assert.rejects(market.connect(user).claim(recipient,nullifier,amount,deadline,signature),/Already claimed/);
  const second=id('second-org-same-wallet');await (await market.connect(user).claim(recipient,second,amount,deadline,await proof(market,recipient,second,amount,deadline))).wait();
  assert.equal(await market.totalClaims(),2n);assert.equal(await market.totalRecipients(),1n);assert.equal(await market.totalClaimed(),amount*2n);
  await (await token.connect(user).burn(parseEther('100'))).wait();assert.equal(await token.totalSupply(),parseEther('999900'));assert.equal(await token.totalBurned(),parseEther('100'));
});
test('expired, tampered and cross-contract proofs cannot spend the test pool',async()=>{
  const {market}=await fixture();const recipient=await user.getAddress(),nullifier=id('another-org'),amount=parseEther('500');
  const expired=await timestamp()-1;await assert.rejects(market.connect(user).claim(recipient,nullifier,amount,expired,await proof(market,recipient,nullifier,amount,expired)),/Invalid claim/);
  const deadline=await timestamp()+3600;const signature=await proof(market,recipient,nullifier,amount,deadline);
  await assert.rejects(market.connect(user).claim(recipient,nullifier,amount+1n,deadline,signature),/Invalid proof/);
  const wrong=await proof(market,recipient,nullifier,amount,deadline,await other.getAddress());
  await assert.rejects(market.connect(user).claim(recipient,nullifier,amount,deadline,wrong),/Invalid proof/);
});
