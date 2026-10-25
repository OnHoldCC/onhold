import test from 'node:test';
import assert from 'node:assert/strict';
import {readStats} from '../src/telemetry.mjs';
const valid={page_views:3,page_uv:2,ad_clicks:2,clicks_by_site:[2,0,0,0,0,0],uv_by_site:[1,0,0,0,0,0],updated_at:1800000000,daily_clicks:Array.from({length:30},()=>({date:'2026-10-20',clicks:0}))};

test('cached UV stats validate six slots, nonnegative counts and the aggregation timestamp',async t=>{
  let payload=valid;
  t.mock.method(globalThis,'fetch',async()=>Response.json(payload));
  assert.deepEqual(await readStats(),valid);
  for(const bad of [{page_uv:-1},{page_uv:null},{uv_by_site:[1]},{uv_by_site:[-1,0,0,0,0,0]},{uv_by_site:[NaN,0,0,0,0,0]},{updated_at:'1800000000'},{updated_at:-1}]){
    payload={...valid,...bad};
    assert.equal(await readStats(),null);
  }
});

test('statistics use the public-read timeout and recover after a failed request',async t=>{
  let failed=true;const timeouts=[];
  t.mock.method(AbortSignal,'timeout',ms=>{timeouts.push(ms);return new AbortController().signal;});
  t.mock.method(globalThis,'fetch',async(path,options)=>{assert.equal(path,'/api/stats');assert.equal(options.cache,'no-store');if(failed)throw new DOMException('Timed out','TimeoutError');return Response.json(valid);});
  assert.equal(await readStats(),null);failed=false;
  assert.deepEqual(await readStats(),valid);assert.deepEqual(timeouts,[5000,5000]);
});
