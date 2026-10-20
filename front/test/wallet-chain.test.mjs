import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

test('ethers bid and staking transactions use the selected SingleSpark provider, and logout blocks further sends',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'onhold-wallet-chain-'));
 try{
  const out=join(dir,'chain.mjs');
  await build({stdin:{contents:"export {placeChainBid,miningAction} from './front/src/chain.mjs';export {createWalletSession} from './front/src/wallet.mjs';",resolveDir:resolve('.')},outfile:out,bundle:true,platform:'browser',format:'esm',logLevel:'silent'});
  const {createWalletSession,placeChainBid,miningAction}=await import(pathToFileURL(out));
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
  okx.request=async(args)=>args.method==='eth_call'?'0x'+'00'.repeat(32):selectedRequest(args);
  await assert.rejects(miningAction(market,selectedAddress,'stake',1,'0x4444444444444444444444444444444444444444'),/referral_mint_required/);assert.equal(transactions.length,2);okx.request=selectedRequest;
  session.disconnect();const count=calls.length;
  await assert.rejects(miningAction(market,selectedAddress,'getReward'),/No connected wallet/);assert.equal(calls.length,count);
  await session.authorize('OKX Wallet');const base=okx.request;
  okx.request=async(args)=>{const result=await base(args);if(args.method==='eth_estimateGas')session.disconnect();return result;};
  await assert.rejects(miningAction(market,selectedAddress,'stake',1,'0x0000000000000000000000000000000000000000'),/wallet_changed/);assert.equal(transactions.length,2);session.stop();
 }finally{await rm(dir,{recursive:true,force:true});}
});
