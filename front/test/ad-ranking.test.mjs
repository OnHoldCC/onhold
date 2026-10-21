import test from 'node:test';import assert from 'node:assert/strict';import {loadAdRanking} from '../src/ad-ranking.mjs';
test('promoted website pages validate parameters and external URLs without fabricating empty records',async t=>{
 const original=globalThis.fetch;t.after(()=>globalThis.fetch=original);let calls=0;
 const item={id:0,version:'1',advertiser:'0x'+'1'.repeat(40),txHash:'0x'+'a'.repeat(64),url:'https://example.com/',description:'Example',avatar:'',tags:['Claude'],clicks:20,bid:'1000000000000000',startedAt:1000,endedAt:null};
 const page={configured:true,page:2,pages:3,total:21,items:[item]};
 globalThis.fetch=async(url,{signal})=>{calls++;assert.equal(url,'/api/ads?page=2');assert.ok(signal instanceof AbortSignal);signal.throwIfAborted();return {ok:true,json:async()=>page};};
 await assert.rejects(loadAdRanking(0),/invalid_page/);assert.equal(calls,0);
 assert.deepEqual(await loadAdRanking(2),page);
 await assert.rejects(loadAdRanking(2,AbortSignal.abort(Error('cancelled'))),/cancelled/);
 page.items=[{...item,url:'javascript:alert(1)'}];await assert.rejects(loadAdRanking(2),/invalid_ads_response/);
 page.items=[];assert.deepEqual((await loadAdRanking(2)).items,[]);
 page.items=Array(11).fill(item);await assert.rejects(loadAdRanking(2),/invalid_ads_response/);
});
