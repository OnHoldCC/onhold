import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../src/chain-config.json' with {type:'json'};
const chain=`/api/chain?market=${config.marketAddress.toLowerCase()}`;
const snapshot=(capturedAt,n)=>({version:1,capturedAt,paths:{'/api/stats':{n},[chain]:{n,available:true,configured:true,stale:false},'/api/mining-stats?period=30d':{n,available:true,configured:true,stale:false}}});
function environment(t,inline){
 const previous={document:globalThis.document,window:globalThis.window,sessionStorage:globalThis.sessionStorage};const saved=new Map();
 t.after(()=>Object.assign(globalThis,previous));
 globalThis.document={getElementById:()=>({textContent:JSON.stringify(inline)})};globalThis.window=new EventTarget();globalThis.sessionStorage={getItem:key=>saved.get(key),setItem:(key,value)=>saved.set(key,value),removeItem:key=>saved.delete(key)};return saved;
}
test('fresh public HTML seed serves all three home reads without fetching and excludes wallet paths',async t=>{
 const at=Date.now();environment(t,snapshot(at,1));t.mock.method(globalThis,'fetch',()=>{throw Error('unexpected network');});
 const {readHome}=await import('../src/home-data.mjs?fresh');
 for(const path of ['/api/stats',chain,'/api/mining-stats?period=30d'])assert.equal((await readHome(path)).n,1);
 assert.equal(readHome(chain+'&wallet=0x123'),null);assert.equal(readHome('/api/nft/quote'),null);assert.equal(readHome('/api/chain?market=other'),null);
 const data=await readHome('/api/stats');data.n=99;assert.equal((await readHome('/api/stats')).n,1);
});
test('stale browser snapshot shows immediately, refreshes once for a burst and notifies consumers',async t=>{
 let now=Date.now();const saved=environment(t,snapshot(now-6000,1));t.mock.method(Date,'now',()=>now);
 let calls=0,complete;t.mock.method(globalThis,'fetch',async(path,options)=>{calls++;assert.equal(path,'/api/home');assert.equal(options.credentials,'omit');return new Promise(resolve=>complete=()=>resolve(Response.json(snapshot(now,2))));});
 const {readHome}=await import('../src/home-data.mjs?stale');
 for(let i=0;i<20;i++)assert.equal((await readHome('/api/stats')).n,1);assert.equal(calls,1);
 const notified=new Promise(resolve=>window.addEventListener('onhold:home-data',resolve,{once:true}));complete();await notified;
 assert.equal((await readHome('/api/stats')).n,2);assert.equal(JSON.parse(saved.values().next().value).paths[chain].n,2);
});
test('expired and unavailable snapshots are rejected; invalidation discards late refresh',async t=>{
 const now=Date.now();environment(t,snapshot(now-16000,1));let complete;t.mock.method(globalThis,'fetch',()=>new Promise(resolve=>complete=()=>resolve(Response.json(snapshot(now,2)))));
 const {readHome,invalidateHome}=await import('../src/home-data.mjs?expired');assert.equal(readHome('/api/stats'),null);const request=readHome(chain);invalidateHome();complete();await assert.rejects(request,/home_changed/);
 let calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;return Response.json({...snapshot(now,3),paths:{}});});
 await assert.rejects(readHome(chain),/invalid_home/);assert.equal(calls,1);
});

test('cold statistics bypass an in-flight aggregate instead of waiting for unrelated chain reads',async t=>{
 environment(t,null);let complete,calls=0;
 t.mock.method(globalThis,'fetch',()=>{calls++;return new Promise(resolve=>complete=()=>resolve(Response.json(snapshot(Date.now(),2))));});
 const {readHome}=await import('../src/home-data.mjs?independent-stats');
 assert.equal(readHome('/api/stats'),null);assert.equal(calls,0);
 const chainRead=readHome(chain);assert.equal(calls,1);
 assert.equal(readHome('/api/stats'),null);assert.equal(calls,1);
 complete();await chainRead;assert.equal((await readHome('/api/stats')).n,2);
});

test('confirmed chain snapshot keeps its source stale flag in browser cache',async t=>{
 const value=snapshot(Date.now(),1);value.paths[chain].stale=true;environment(t,value);
 t.mock.method(globalThis,'fetch',()=>{throw Error('unexpected network');});
 const {readHome}=await import('../src/home-data.mjs?source-stale');
 assert.equal((await readHome(chain)).stale,true);
});
