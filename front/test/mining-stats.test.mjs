import test from 'node:test';
import assert from 'node:assert/strict';
import {loadMiningStats,miningPeriods,summaryHistory} from '../src/mining-stats.mjs';
test('summary curves use only recorded financial totals, including true zeroes',()=>{
  assert.deepEqual(summaryHistory([{sampledAt:1},{financial:{claimed:null}}],'claimed'),[]);
  const rows=[{financial:{claimed:'0.000000000000000000',burned:null}},{financial:{claimed:'12.500000000000000000',burned:'2.000000000000000000'}},{financial:{claimed:'NaN',burned:'-1'}}];
  assert.deepEqual(summaryHistory(rows,'claimed'),[0,12.5]);
  assert.deepEqual(summaryHistory(rows,'burned'),[2]);
  assert.deepEqual(summaryHistory(rows,'claimed','13.000000000000000000'),[0,12.5,13]);
  assert.deepEqual(summaryHistory(rows,'claimed',12.5),[0,12.5]);
  for(const current of [null,undefined,'',NaN,-1])assert.deepEqual(summaryHistory(rows,'claimed',current),[0,12.5]);
});
test('mining chart periods accept real cached snapshots and reject broken data without inventing history',async()=>{
  const original=globalThis.fetch;
  try{
    let calls=0;
    globalThis.fetch=async url=>{calls++;return {ok:true,json:async()=>({period:new URL(url,'https://example.com').searchParams.get('period'),available:false,latest:null,history:[]})};};
    await assert.rejects(loadMiningStats('2d'));assert.equal(calls,0);
    for(const period of miningPeriods)assert.deepEqual((await loadMiningStats(period)).history,[]);
    globalThis.fetch=async()=>({ok:true,json:async()=>({period:'1h',available:false,latest:null,history:[{sampledAt:100,totalWeight:4,perWeightDaily:'10.000000000000000000'}]})});
    assert.equal((await loadMiningStats('1h')).history[0].totalWeight,4);
    globalThis.fetch=async()=>({ok:true,json:async()=>({period:'1h',available:false,latest:null,history:[{sampledAt:100,totalWeight:-1,perWeightDaily:'NaN'}]})});
    await assert.rejects(loadMiningStats('1h'));
  }finally{globalThis.fetch=original;}
});
