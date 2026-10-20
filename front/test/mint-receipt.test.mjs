import test from 'node:test';
import assert from 'node:assert/strict';
import {confirmMint,pendingMint,recordMint} from '../src/mint-receipt.mjs';
const hash='0x'+'11'.repeat(32),nullifier='0x'+'22'.repeat(32),replacement='0x'+'33'.repeat(32);
function setup(t){
 const old=globalThis.localStorage,store=new Map();
 globalThis.localStorage={getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)};
 t.after(()=>{globalThis.localStorage=old;t.mock.restoreAll();});
 return store;
}
test('mint persists its hash before waiting, and clears it only after backend confirmation',async t=>{
 setup(t);const stages=[];
 t.mock.method(globalThis,'fetch',async(path,options)=>{assert.equal(path,'/api/nft/receipt');assert.deepEqual(JSON.parse(options.body),{tx_hash:hash,nullifier});return Response.json({confirmed:true});});
 const result=await confirmMint({hash,wait:async confirmations=>{assert.equal(confirmations,3);assert.deepEqual(pendingMint(),{tx_hash:hash,nullifier});return {hash,status:1};}},nullifier,value=>stages.push(value));
 assert.deepEqual(result,{hash,recorded:true});assert.equal(stages[0].stage,4);assert.equal(pendingMint(),null);
});
test('network failure after broadcast preserves recovery and never re-sends a mint',async t=>{
 setup(t);const failure=Error('network unavailable');
 await assert.rejects(confirmMint({hash,wait:async()=>{throw failure;}},nullifier,()=>{}),cause=>cause.pending.tx_hash===hash);
 assert.equal(pendingMint().tx_hash,hash);
 t.mock.method(globalThis,'fetch',async()=>Response.json({confirmed:true}));
 assert.deepEqual(await recordMint(pendingMint()),{hash,recorded:true});assert.equal(pendingMint(),null);
});
test('receipt sync failure keeps the successful chain transaction recoverable',async t=>{
 setup(t);t.mock.method(globalThis,'fetch',async()=>Response.json({error:'chain_unavailable'},{status:503}));
 assert.deepEqual(await confirmMint({hash,wait:async()=>({hash,status:1})},nullifier,()=>{}),{hash,recorded:false});assert.equal(pendingMint().tx_hash,hash);
});
test('reverted or cancelled transactions release recovery; successful replacements retain the new hash',async t=>{
 setup(t);
 for(const failure of [Object.assign(Error('reverted'),{receipt:{status:0}}),Object.assign(Error('cancelled'),{cancelled:true})]){
  await assert.rejects(confirmMint({hash,wait:async()=>{throw failure;}},nullifier,()=>{}),/mint_transaction_failed/);assert.equal(pendingMint(),null);
 }
 t.mock.method(globalThis,'fetch',async()=>Response.json({confirmed:true}));
 const failure=Object.assign(Error('replaced'),{code:'TRANSACTION_REPLACED',cancelled:false,receipt:{status:1,hash:replacement}});
 assert.deepEqual(await confirmMint({hash,wait:async()=>{throw failure;}},nullifier,()=>{}),{hash:replacement,recorded:true});
});
