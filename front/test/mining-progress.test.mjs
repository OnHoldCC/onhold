import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';

test('restored and timed-out transactions stop animating without being marked failed on-chain',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'onhold-mining-progress-'));
 try{
  const outfile=join(dir,'render.cjs');
  await build({stdin:{resolveDir:resolve('front'),contents:`
   import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';
   import {MiningProgress} from './components/onhold/MiningProgress.jsx';
   import {lastDialog} from '@singlespark/component-atlas/ui';
   const pending={hash:'0x'+'a'.repeat(64)},base={action:'unstake',stage:2,started:Date.now(),pending};
   function render(progress,busy){renderToStaticMarkup(React.createElement(MiningProgress,{progress,busy,t:k=>k,explorer:'https://testnet.bscscan.com'}));return {steps:lastDialog.steps,labels:lastDialog.labels,status:lastDialog.status};}
   console.log(JSON.stringify({restored:render(base,false),timeout:render({...base,error:'mining_confirmation_pending'},false),running:render(base,true),failed:render({...base,pending:null,error:'mining_transaction_failed'},false),done:render({...base,pending:null,done:true,stage:3},false)}));
  `},outfile,bundle:true,platform:'node',format:'cjs',logLevel:'silent',plugins:[{name:'capture-dialog',setup(build){build.onResolve({filter:/^@singlespark\/component-atlas\/ui$/},()=>({path:'ui',namespace:'test'}));build.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export let lastDialog;export function TransactionProgressDialog(props){lastDialog=props;return null;}export function TransactionRecovery(){return null;}'}));}}]});
  const result=JSON.parse(execFileSync(process.execPath,[outfile],{encoding:'utf8'}));
  for(const key of ['restored','timeout']){assert.ok(result[key].steps.every(step=>step.status!=='active'));assert.equal(result[key].labels.error,'miningAwaitingStatus');}
  assert.equal(result.restored.status,'miningAwaitingStatus');assert.equal(result.timeout.status,'mining_confirmation_pending');
  assert.equal(result.running.steps[2].status,'active');assert.equal(result.failed.steps[2].status,'error');assert.equal(result.failed.labels.error,'txStatus.error');assert.ok(result.done.steps.every(step=>step.status==='complete'));
 }finally{await rm(dir,{recursive:true,force:true});}
});
