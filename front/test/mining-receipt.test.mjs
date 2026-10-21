import test from 'node:test';
import assert from 'node:assert/strict';
import {pendingMining,rememberMining,clearMining,miningReceipt,confirmMining} from '../src/mining-receipt.mjs';
const market='0x'+'1'.repeat(40),wallet='0x'+'2'.repeat(40),hash='0x'+'a'.repeat(64);
function setup(t){const store=new Map();const previous=globalThis.localStorage;t.after(()=>{if(previous===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous;});globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};const pending={market,wallet,hash,action:'unstake',tokenId:'1',chainId:97,started:Date.now()};rememberMining(pending);return pending;}
const receipt={hash,chainId:97,market,from:wallet,blockNumber:123,confirmedBlock:123,status:'confirmed'};
test('a broadcast is retained per wallet and market until confirmed data is synchronized',async t=>{
 const pending=setup(t);assert.deepEqual(pendingMining(market,wallet),pending);assert.equal(pendingMining(market,'0x'+'3'.repeat(40)),null);assert.equal(pendingMining('0x'+'4'.repeat(40),wallet),null);
 t.mock.method(globalThis,'fetch',async path=>{assert.equal(path,'/api/transactions/'+hash);return Response.json(receipt);});
 const stages=[],result=await confirmMining(pending,v=>stages.push(v.stage));assert.equal(result.hash,hash);assert.equal(result.blockNumber,123);assert.deepEqual(stages,[2,3]);assert.deepEqual(pendingMining(market,wallet),pending,'do not clear before UI synchronizes');clearMining(pending);assert.equal(pendingMining(market,wallet),null);
});
test('pending, network errors and timeout retain the hash for read-only recovery',async t=>{
 const pending=setup(t);let calls=0;
 t.mock.method(globalThis,'fetch',async()=>{calls++;return Response.json({...receipt,status:'pending'});});
 await assert.rejects(confirmMining(pending,()=>{},false),cause=>cause.message==='mining_confirmation_pending'&&cause.pending.hash===hash);assert.equal(calls,1);assert.deepEqual(pendingMining(market,wallet),pending);
 t.mock.method(Date,'now',(()=>{let n=0;return()=>n++?90001:0;})());
 await assert.rejects(confirmMining(pending),/mining_confirmation_pending/);assert.deepEqual(pendingMining(market,wallet),pending);
});
test('reverted transactions clear the pending record and mismatched receipts cannot complete an action',async t=>{
 const pending=setup(t);let value={...receipt,from:'0x'+'5'.repeat(40)};
 t.mock.method(globalThis,'fetch',async()=>Response.json(value));await assert.rejects(miningReceipt(pending),/invalid_transaction_receipt/);assert.deepEqual(pendingMining(market,wallet),pending);
 value={...receipt,status:'failed'};await assert.rejects(miningReceipt(pending),/mining_transaction_failed/);assert.equal(pendingMining(market,wallet),null);
});

test('network failure preserves a broadcast and recovery never submits another transaction',async t=>{
 const pending=setup(t);let calls=0;
 t.mock.method(globalThis,'fetch',async()=>{calls++;throw Error('network offline');});
 await assert.rejects(confirmMining(pending,()=>{},false),/mining_confirmation_pending/);
 assert.deepEqual(pendingMining(market,wallet),pending);assert.equal(calls,1);
 t.mock.method(globalThis,'fetch',async()=>Response.json(receipt));
 const recovered=await confirmMining(pending,()=>{},false);assert.equal(recovered.hash,hash);assert.deepEqual(pendingMining(market,wallet),pending);
 clearMining(recovered.pending);assert.equal(pendingMining(market,wallet),null);
});
