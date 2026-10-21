import test from 'node:test';
import assert from 'node:assert/strict';
import {createInteractionTiming,timingSteps,compactTimingSteps,formatDuration} from '../src/interaction-timing.mjs';
import {messages,supportedLocales} from '../src/i18n.mjs';

test('stage timing preserves results and errors, freezes on finish, and stores no wallet payloads',async t=>{
 let now=100,latest; t.mock.method(performance,'now',()=>now);
 const trace=createInteractionTiming(value=>latest=value);
 const secret={signature:'private test value'};
 assert.equal(await trace.measure('signature',async()=>{now=600;return secret;}),secret);
 assert.equal(latest.rows[0].duration,500);assert.equal(latest.rows[0].status,'complete');
 const failure=Error('rejected');await assert.rejects(trace.measure('estimateGas',async()=>{now=800;throw failure;}),error=>error===failure);
 assert.equal(latest.rows[1].status,'error');trace.finish();
 assert.equal(timingSteps(latest,k=>k,10000)[0].elapsed,'500 ms');assert.equal(latest.ended,800);
 assert.ok(!JSON.stringify(latest).includes('private test value'));
 for(const lang of supportedLocales)for(const step of timingSteps(latest,k=>messages[lang][k],1000)){assert.ok(step.label,lang);assert.ok(step.description,lang);}
});
test('timeouts and closing a dialog freeze a running phase even if its RPC resolves later',async t=>{
 let now=0,latest,resolve;t.mock.method(performance,'now',()=>now);
 const trace=createInteractionTiming(value=>latest=value);
 const pending=trace.measure('estimateGas',()=>new Promise(done=>resolve=done));
 now=20000;trace.finish();const stopped=JSON.stringify(latest);now=30000;resolve(42);assert.equal(await pending,42);assert.equal(JSON.stringify(latest),stopped);
 assert.equal(latest.rows[0].duration,20000);assert.equal(latest.rows[0].status,'error');
});
test('feedback failure cannot prevent an interaction; formatting is bounded',async()=>{
 const trace=createInteractionTiming(()=>{throw Error('unmounted UI');});assert.equal(await trace.measure('connect',async()=>true),true);trace.finish();
 assert.equal(formatDuration(-1),'0 ms');assert.equal(formatDuration(1234),'1.2 s');
});
test('compact stages merge repeated reads and approval waits without losing time or changing raw records',()=>{
 const rows=['walletPrepare','contractRead','contractRead','walletCheck','approveTransaction','approveConfirm','estimateGas','walletCheck','sendTransaction','chainConfirm','receiptSync','dataSync'].map((key,index)=>({id:String(index),key,started:index*100,duration:100,status:'complete'}));
 const timing={started:0,ended:1200,rows},original=JSON.stringify(timing),steps=compactTimingSteps(timing,key=>key,1200);
 assert.deepEqual(steps.map(step=>step.id),['prepare','approve','estimateGas','sendTransaction','chainConfirm','dataSync']);
 assert.deepEqual(steps.map(step=>step.elapsed),['500 ms','200 ms','100 ms','100 ms','100 ms','200 ms']);assert.equal(JSON.stringify(timing),original);
 assert.equal(timingSteps(timing,key=>key,1200).length,12);assert.ok(steps.every(step=>!step.description));
 for(const lang of supportedLocales)for(const step of compactTimingSteps(timing,key=>messages[lang][key],1200))assert.ok(step.label,lang);
});
test('compact stages retain an active wait hint and a failed read, without marking it successful',()=>{
 const timing={started:0,ended:null,rows:[{id:'a',key:'contractRead',started:0,duration:200,status:'error'},{id:'b',key:'estimateGas',started:200,duration:null,status:'active'}]};
 const steps=compactTimingSteps(timing,key=>key,500);assert.equal(steps[0].status,'error');assert.equal(steps[1].status,'active');assert.equal(steps[1].elapsed,'300 ms');assert.equal(steps[1].description,'timing.wait.rpc');
});
