import test from 'node:test';
import assert from 'node:assert/strict';
import {readStats} from '../src/telemetry.mjs';

test('cached UV stats validate six slots, nonnegative counts and the aggregation timestamp',async t=>{
  const valid={page_views:3,ad_clicks:2,clicks_by_site:[2,0,0,0,0,0],uv_by_site:[1,0,0,0,0,0],updated_at:1800000000,daily_clicks:Array.from({length:30},()=>({date:'2026-10-20',clicks:0}))};
  let payload=valid;
  t.mock.method(globalThis,'fetch',async()=>Response.json(payload));
  assert.deepEqual(await readStats(),valid);
  for(const bad of [{uv_by_site:[1]},{uv_by_site:[-1,0,0,0,0,0]},{uv_by_site:[NaN,0,0,0,0,0]},{updated_at:'1800000000'},{updated_at:-1}]){
    payload={...valid,...bad};
    assert.equal(await readStats(),null);
  }
});
