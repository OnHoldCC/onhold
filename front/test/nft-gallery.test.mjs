import test from 'node:test';import assert from 'node:assert/strict';import {loadNftPage} from '../src/nft-gallery.mjs';
test('gallery queries PG pages and validates the requested plan category',async t=>{t.after(()=>t.mock.restoreAll());let value={configured:true,available:true,storage:'postgresql',tier:'pro',page:2,total:13,pages:2,items:[{id:'1',tier:1}]};t.mock.method(globalThis,'fetch',async(url,options)=>{assert.equal(url,'/api/nfts?tier=pro&page=2&page_size=12');assert.equal(options.credentials,'omit');assert.equal(options.cache,'no-store');return new Response(JSON.stringify(value));});assert.deepEqual(await loadNftPage('pro',2),value);value={...value,items:[{id:'2',tier:2}]};await assert.rejects(loadNftPage('pro',2),/invalid_gallery_response/);await assert.rejects(loadNftPage('unknown',1),/invalid_page/);});

test('wallet NFT pages isolate owned and staked tokens and include pages beyond fifty',async t=>{
 t.after(()=>t.mock.restoreAll());const wallet='0x'+'a'.repeat(40),market='0x'+'b'.repeat(40);let position='staked',requests=0;
 let value={configured:true,available:true,storage:'postgresql',market,wallet,position,tier:'all',page:6,total:61,pages:6,items:[{id:'61',tier:2,owner:market,staker:wallet,staked:true}]};
 t.mock.method(globalThis,'fetch',async(url,options)=>{requests++;const query=new URL(url,'https://example.com').searchParams;assert.equal(query.get('wallet'),wallet);assert.equal(query.get('market'),market);assert.equal(query.get('position'),position);assert.ok(options.signal instanceof AbortSignal);return new Response(JSON.stringify(value));});
 assert.equal((await loadNftPage('all',6,undefined,{wallet,market,position})).items[0].id,'61');
 value={...value,items:[{...value.items[0],staker:market}]};await assert.rejects(loadNftPage('all',6,undefined,{wallet,market,position}),/invalid_gallery_response/);
 position='owned';value={...value,position,items:[{id:'2',tier:1,owner:wallet,staker:null,staked:false}]};assert.equal((await loadNftPage('all',1,undefined,{wallet,market,position})).items[0].id,'2');
 value={...value,wallet:market};await assert.rejects(loadNftPage('all',1,undefined,{wallet,market,position}),/invalid_gallery_response/);
 const count=requests;for(const account of [{wallet:'bad',market,position},{wallet,market,position:'all'}])await assert.rejects(loadNftPage('all',1,undefined,account),/invalid_position/);assert.equal(requests,count);
});

test('Free pages accept weight-zero tier 0 and reject paid tiers',async t=>{
 let value={configured:true,available:true,storage:'postgresql',tier:'free',page:1,total:1,pages:1,items:[{id:'3',tier:0}]};
 t.mock.method(globalThis,'fetch',async path=>{assert.equal(path,'/api/nfts?tier=free&page=1&page_size=12');return Response.json(value);});
 assert.equal((await loadNftPage('free',1)).items[0].tier,0);value={...value,items:[{id:'3',tier:1}]};await assert.rejects(loadNftPage('free',1),/invalid_gallery_response/);
});
