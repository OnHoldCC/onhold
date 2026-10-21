import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';

test('compact dialog keeps visible SVG and text close controls, with full timing records collapsed',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'onhold-compact-dialog-'));
 try{
  const outfile=join(dir,'render.mjs');
  await build({stdin:{resolveDir:resolve('front'),contents:`
   import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';
   import {InteractionProgressDialog} from './components/onhold/InteractionProgressDialog.jsx';
   import {TimingDetails} from './components/onhold/InteractionTimings.jsx';
   import {compactTimingSteps,timingSteps} from './src/interaction-timing.mjs';
   import {translate} from './src/i18n.mjs';
   globalThis.document={body:{}};const t=key=>translate('zh',key);
   const keys=['walletPrepare','contractRead','contractRead','walletCheck','approveTransaction','approveConfirm','estimateGas','walletCheck','sendTransaction','chainConfirm','receiptSync','dataSync'];
   const timing={started:0,ended:1200,rows:keys.map((key,i)=>({id:String(i),key,started:i*100,duration:100,status:'complete'}))};
   const view={steps:compactTimingSteps(timing,t,1200),details:timingSteps(timing,t,1200),elapsed:'1.2 s'};
   console.log(renderToStaticMarkup(React.createElement(InteractionProgressDialog,{title:'质押 NFT',status:'交易已完成',steps:view.steps,elapsed:view.elapsed,t,done:true,onClose:()=>{}},React.createElement(TimingDetails,{view,t}))));
  `},outfile,bundle:true,platform:'node',format:'esm',logLevel:'silent',loader:{'.css':'empty'},banner:{js:"import {createRequire} from 'node:module';const require=createRequire(import.meta.url);"},plugins:[{name:'inline-test-portal',setup(builder){builder.onResolve({filter:/^react-dom$/},args=>args.importer.endsWith('InteractionProgressDialog.jsx')?{path:'portal',namespace:'test'}:undefined);builder.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export function createPortal(node){return node;}'}));}}]});
  const html=execFileSync(process.execPath,[outfile],{encoding:'utf8'});
  assert.match(html,/aria-label="关闭"[^>]*><svg/);assert.match(html,/interaction-progress-dialog__footer/);assert.match(html,/>关闭</);assert.doesNotMatch(html,/ph ph-x/);
  assert.match(html,/interaction-progress-dialog__success/);assert.match(html,/process-steps/);assert.match(html,/aria-expanded="false"/);assert.match(html,/查看耗时详情/);
  assert.equal((html.split('</ol>')[0].match(/<li /g)||[]).length,6);
  assert.equal((html.match(/<li /g)||[]).length,18,'six summarized stages plus twelve preserved detail records');
 }finally{await rm(dir,{recursive:true,force:true});}
});
