import test from 'node:test';
import assert from 'node:assert/strict';
import {loadReferralHistory} from '../src/referral-history.mjs';
import {referralHistoryCopy} from '../src/referral-history-copy.mjs';
import {translate,supportedLocales} from '../src/i18n.mjs';
const wallet='0x'+'1'.repeat(40),market='0x'+'2'.repeat(40),invitee='0x'+'3'.repeat(40),tx='0x'+'a'.repeat(64),zero='0.000000000000000000',bonus='0.827211964793858778',base='5.514746431959058522';
const snapshot=()=>({configured:true,available:true,stale:false,chain_id:97,storage:'postgresql',market,wallet,confirmed_block:123,summary:{invited:1,active:1,pending:bonus,earned:bonus},page:1,pages:1,total:1,items:[{wallet:invitee,weight:1,stakedCount:1,baseRewards:base,contribution:bonus}],eventsPage:1,eventsPages:1,eventsTotal:2,events:[{kind:'accrued',wallet:invitee,txHash:tx,block:123,logIndex:2,baseReward:base,amount:bonus},{kind:'bound',wallet:invitee,txHash:tx,block:120,logIndex:0,baseReward:null,amount:null}]});
test('referral pages preserve exact per-wallet contribution and aggregate claim records',async t=>{
 let value=snapshot();t.mock.method(globalThis,'fetch',async(path,options)=>{const query=new URL(path,'https://example.com').searchParams;assert.equal(query.get('wallet'),wallet);assert.equal(query.get('market'),market);assert.equal(query.get('page'),'2');assert.equal(query.get('events_page'),'3');assert.equal(options.credentials,'omit');assert.equal(options.cache,'no-store');assert.ok(options.signal instanceof AbortSignal);return Response.json(value);});
 assert.deepEqual(await loadReferralHistory(market,wallet,2,3),value);
 value={...value,summary:{...value.summary,pending:zero},events:[{kind:'paid',wallet,baseReward:null,amount:bonus,txHash:tx,block:123,logIndex:3}]};
 const paid=await loadReferralHistory(market,wallet,2,3);assert.equal(paid.summary.pending,zero);assert.equal(paid.items[0].contribution,bonus);
});
test('referral responses cannot cross wallets or turn malformed data into empty records',async t=>{
 let value=snapshot(),calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;return Response.json(value);});
 for(const change of [{wallet:invitee},{market:invitee},{chain_id:56},{items:[{...snapshot().items[0],contribution:0.8}]},{events:[{...snapshot().events[0],block:124}]},{events:[{...snapshot().events[0],kind:'unknown'}]}]){value={...snapshot(),...change};await assert.rejects(loadReferralHistory(market,wallet),/invalid_referral_history/);}
 const before=calls;await assert.rejects(loadReferralHistory('bad',wallet),/invalid_referral_request/);await assert.rejects(loadReferralHistory(market,wallet,0),/invalid_referral_request/);assert.equal(calls,before);
 value={...snapshot(),summary:{invited:0,active:0,pending:zero,earned:zero},total:0,items:[],eventsTotal:0,events:[]};assert.equal((await loadReferralHistory(market,wallet)).total,0);
});
test('all locales explain cumulative contributions and the two separate claim actions',()=>{
 for(const lang of supportedLocales)for(const key of Object.keys(referralHistoryCopy.en)){assert.equal(typeof referralHistoryCopy[lang][key],'string');assert.ok(referralHistoryCopy[lang][key].length>0);}
 assert.match(translate('zh','referralSettlement'),/顶部挖矿按钮仅领取自己的挖矿收益/);assert.match(referralHistoryCopy.zh.referralHistoryNote,/领取后不清零/);
});
