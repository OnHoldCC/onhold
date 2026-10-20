import test from 'node:test';
import assert from 'node:assert/strict';
import {loadMiningStats,miningPeriods} from '../src/mining-stats.mjs';
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
