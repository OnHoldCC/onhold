import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

test('ethers bid and staking transactions use the selected SingleSpark provider, and logout blocks further sends',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'onhold-wallet-chain-'));
 try{
  const out=join(dir,'chain.mjs');
  await build({stdin:{contents:"export {placeChainBid,miningAction} from './front/src/chain.mjs';export {createWalletSession} from './front/src/wallet.mjs';export {abi} from './front/src/market-abi.mjs';",resolveDir:resolve('.')},outfile:out,bundle:true,platform:'browser',format:'esm',logLevel:'silent'});
  const {createWalletSession,placeChainBid,miningAction,abi}=await import(pathToFileURL(out));
  const selectedAddress='0x2222222222222222222222222222222222222222',market='0x3333333333333333333333333333333333333333';
  const calls=[],transactions=[],store=new Map();
  const storage={getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)};
  const okx={isOkxWallet:true,request:async({method,params})=>{
   calls.push(method);
   if(method==='eth_requestAccounts'||method==='eth_accounts')return[selectedAddress];
   if(method==='eth_chainId')return '0x61';
   if(method==='eth_blockNumber')return '0x1';
   if(method==='eth_estimateGas')return '0x30d40';
   if(method==='eth_sendTransaction'){transactions.push(params[0]);throw Error('TEST_STOP_BEFORE_BROADCAST');}
   throw Error('Unexpected RPC: '+method);
  }};
  let defaultCalls=0;const meta={isMetaMask:true,request:async()=>{defaultCalls++;throw Error('WRONG_WALLET');}};
  globalThis.window=Object.assign(new EventTarget(),{ethereum:{...meta,providers:[meta,okx]},localStorage:storage,sessionStorage:storage});globalThis.localStorage=storage;
  const session=createWalletSession(async()=>({referralBound:true,referralCode:'',referrer:'0x0000000000000000000000000000000000000000'}));session.start();await session.authorize('OKX Wallet');
  await assert.rejects(placeChainBid(market,0,1,{url:'https://onhold.cc',description:'onhold',avatar:'https://onhold.cc/assets/claude-token.png',tags:[],amount:'0.001'}),/TEST_STOP_BEFORE_BROADCAST/);
  await assert.rejects(miningAction(market,selectedAddress,'stake',1,'0x0000000000000000000000000000000000000000'),/TEST_STOP_BEFORE_BROADCAST/);
  assert.equal(defaultCalls,0);assert.equal(transactions.length,2);
  for(const tx of transactions){assert.equal(tx.from,selectedAddress);assert.equal(tx.to,market);assert.match(tx.data,/^0x[0-9a-f]+$/);}
  assert.equal(transactions[0].value,'0x38d7ea4c68000');assert.ok(calls.includes('eth_estimateGas'));
  const selectedRequest=okx.request;
  const bid={url:'https://onhold.cc',description:'onhold',avatar:'',tags:['Claude','Gemini'],amount:'0.001'};
  await assert.rejects(placeChainBid(market,0,1,bid),/当前广告合约尚未升级/);assert.equal(transactions.length,2);
  okx.request=async(args)=>args.method==='eth_call'?'0x'+(10n).toString(16).padStart(64,'0'):selectedRequest(args);
  await assert.rejects(placeChainBid(market,0,1,bid),/TEST_STOP_BEFORE_BROADCAST/);assert.equal(transactions.length,3);transactions.pop();
  okx.request=selectedRequest;
  okx.request=async(args)=>args.method==='eth_call'?'0x'+'00'.repeat(32):selectedRequest(args);
  await assert.rejects(miningAction(market,selectedAddress,'stake',1,'0x4444444444444444444444444444444444444444'),/referral_mint_required/);assert.equal(transactions.length,2);okx.request=selectedRequest;
  await assert.rejects(miningAction(market,selectedAddress,'unstake','61'),/TEST_STOP_BEFORE_BROADCAST/);
  const unstake=transactions.pop();const {Interface}=await import('ethers');const decoded=new Interface(abi).parseTransaction({data:unstake.data});assert.equal(decoded.name,'unstake');assert.equal(decoded.args[0],61n);assert.equal(unstake.from,selectedAddress);assert.equal(transactions.length,2);
  session.disconnect();const count=calls.length;
  await assert.rejects(miningAction(market,selectedAddress,'getReward'),/No connected wallet/);assert.equal(calls.length,count);
  await session.authorize('OKX Wallet');const base=okx.request;
  okx.request=async(args)=>{const result=await base(args);if(args.method==='eth_estimateGas')session.disconnect();return result;};
  await assert.rejects(miningAction(market,selectedAddress,'stake',1,'0x0000000000000000000000000000000000000000'),/wallet_changed/);assert.equal(transactions.length,2);
  okx.request=selectedRequest;await session.authorize('OKX Wallet');
  const txHash='0x'+'a'.repeat(64),beforeCalls=calls.length,stages=[];
  okx.request=async(args)=>{if(args.method==='eth_sendTransaction'){transactions.push(args.params[0]);return txHash;}return selectedRequest(args);};
  t.mock.method(globalThis,'fetch',async(path)=>{assert.equal(path,'/api/transactions/'+txHash);assert.ok([...store.values()].some(v=>v.includes(txHash)),'save hash before checking receipt');return Response.json({hash:txHash,chainId:97,market,from:selectedAddress,blockNumber:42,confirmedBlock:42,status:'confirmed'});});
  const completed=await miningAction(market,selectedAddress,'unstake',61,undefined,v=>stages.push(v.stage));
  assert.equal(completed.hash,txHash);assert.deepEqual(stages,[0,1,2,3]);assert.equal(transactions.at(-1).gas,'0x3d090');
  assert.ok(!calls.slice(beforeCalls).includes('eth_getTransactionReceipt'));assert.ok(!calls.slice(beforeCalls).includes('eth_getTransactionByHash'));
  session.stop();
 }finally{await rm(dir,{recursive:true,force:true});}
});
