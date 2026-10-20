import test from 'node:test';
import assert from 'node:assert/strict';
import {readJson} from '../src/read-json.mjs';

test('concurrent GETs share one request, different wallets stay isolated, completed reads refresh',async t=>{
 const waiting=[];let calls=0;
 t.mock.method(globalThis,'fetch',(path,options)=>{calls++;assert.equal(options.cache,'no-store');return new Promise(resolve=>waiting.push(()=>resolve(Response.json({path}))));});
 const a=readJson('/api/chain?wallet=a'),b=readJson('/api/chain?wallet=a'),c=readJson('/api/chain?wallet=b');
 assert.equal(a,b);assert.equal(calls,2);waiting.splice(0).forEach(done=>done());await Promise.all([a,b,c]);
 const d=readJson('/api/chain?wallet=a');assert.equal(calls,3);waiting.shift()();await d;
});
test('a failed request is evicted and can be retried',async t=>{
 let fail=true;
 t.mock.method(globalThis,'fetch',async()=>fail?new Response('',{status:503}):Response.json({ok:true}));
 await assert.rejects(readJson('/api/status'),/read_unavailable/);fail=false;assert.deepEqual(await readJson('/api/status'),{ok:true});
});
