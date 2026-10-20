import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

test('loading, zero, cached values and failures remain distinct with SingleSpark feedback',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'onhold-feedback-'));
  try{
    const outfile=join(directory,'render.mjs');
    await build({stdin:{resolveDir:fileURLToPath(new URL('../',import.meta.url)),contents:`
      import React from 'react';import {renderToStaticMarkup as render} from 'react-dom/server';
      import {DataValue,Notice} from './components/onhold/Feedback.jsx';
      import {NftGallery} from './components/onhold/NftGallery.jsx';
      import {NftMining} from './components/onhold/NftMining.jsx';
      import {App,SummaryCards} from './components/onhold/App.jsx';
      import {MiningNetworkHistory} from './components/onhold/MiningNetworkHistory.jsx';
      import {Docs} from './components/onhold/Docs.jsx';
      import {translate} from './src/i18n.mjs';
      globalThis.window={};globalThis.localStorage={getItem:()=>null};globalThis.location={pathname:'/',search:'',href:'http://localhost/'};
      const pages=Object.fromEntries(['home','burn','analytics','claim'].map(page=>{location.pathname=page==='home'?'/':'/'+page+'.html';return [page,render(React.createElement(App))];}));
      const t=key=>translate('zh',key),value=props=>render(React.createElement(DataValue,{t,...props}));
      console.log(JSON.stringify({
        pages,summaryZero:render(React.createElement(SummaryCards,{financial:{burned:0,claimed:0,recipients:0,claims:[]},loading:false,t,lang:'zh'})),summaryValues:render(React.createElement(SummaryCards,{financial:{burned:'12',claimed:'345',recipients:6,claims:[{amount:'7',recipient:'0x1111111111111111111111111111111111111111',txHash:'0x'+'a'.repeat(64)}]},loading:false,t,lang:'zh'})),docs:render(React.createElement(Docs,{t})),loading:value({loading:true}),zero:value({value:'0.000000000000000000',unit:'BNB'}),
        cached:value({value:12,loading:true}),missing:value({}),invalid:value({value:NaN}),blank:value({value:''}),
        error:render(React.createElement(Notice,{error:true},'请求失败')),
        emptyNotice:render(React.createElement(Notice)),
        gallery:render(React.createElement(NftGallery,{t})),
        mining:render(React.createElement(NftMining,{t,lang:'zh',wallet:{address:''},market:'0x123'})),
        chart:render(React.createElement(MiningNetworkHistory,{t,lang:'zh'}))
      }));
    `},outfile,bundle:true,jsx:'automatic',platform:'node',format:'esm',logLevel:'silent',loader:{'.svg':'dataurl','.jpg':'dataurl','.png':'file','.css':'empty'},define:{'process.env.NODE_ENV':'"production"'},banner:{js:"import {createRequire} from 'node:module'; const require=createRequire(import.meta.url);"}});
    const html=JSON.parse(execFileSync(process.execPath,[outfile],{encoding:'utf8'}));
    assert.match(html.loading,/ss-skeleton-layout/);assert.match(html.loading,/aria-busy="true"/);
    assert.match(html.zero,/>0</);assert.match(html.zero,/data-symbol="BNB"/);assert.doesNotMatch(html.zero,/>BNB</);assert.doesNotMatch(html.zero,/skeleton/);
    assert.match(html.cached,/>12</);assert.doesNotMatch(html.cached,/skeleton/);
    for(const key of ['missing','invalid','blank']){assert.match(html[key],/暂无数据/);assert.doesNotMatch(html[key],/skeleton|NaN/);}
    assert.match(html.error,/ub-notification-toast/);assert.match(html.error,/role="alert"/);assert.match(html.error,/请求失败/);assert.equal(html.emptyNotice,'');
    for(const key of ['gallery','mining','chart']){assert.match(html[key],/ss-skeleton-layout/);assert.doesNotMatch(html[key],/>—<|>\s*-\s*</);}
    assert.doesNotMatch(html.mining,/\[object Object\]/);
    assert.match(html.summaryZero,/暂无领取记录/);assert.doesNotMatch(html.summaryZero,/暂无数据/);assert.match(html.summaryZero,/>0</);for(const n of [12,345,6,7])assert.match(html.summaryValues,new RegExp('>'+n+'<'));assert.doesNotMatch(html.summaryValues,/暂无领取记录/);assert.match(html.summaryValues,/https:\/\/testnet.bscscan.com\/tx\/0xaaaa/);
    for(const key of ['chart','mining'])assert.doesNotMatch(html[key],/反映奖励竞争程度|不是 PoW/);assert.doesNotMatch(html.pages.analytics,/来自 Rust 埋点/);assert.doesNotMatch(html.pages.home,/宣传栏|PROMOTION BOARD/);
    assert.doesNotMatch(html.docs,/>目录</);assert.match(html.docs,/href="#docs-staking"/);assert.match(html.docs,/how-scroll-curve/);
    for(const page of ['home','burn','analytics','claim']){assert.match(html.pages[page],/ss-skeleton-layout/,page);assert.doesNotMatch(html.pages[page],/>—<|>\s*-\s*<|1,280,000|128,000/,page);}
  }finally{await rm(directory,{recursive:true,force:true});}
});

test('gallery and history requests keep cancellation and a timeout so skeletons cannot hang',async t=>{
  const {loadNftPage}=await import('../src/nft-gallery.mjs');
  const {loadMiningStats}=await import('../src/mining-stats.mjs');
  t.after(()=>t.mock.restoreAll());
  t.mock.method(globalThis,'fetch',async(url,{signal})=>{assert.ok(signal instanceof AbortSignal);signal.throwIfAborted();throw Error('unexpected request');});
  const cancelled=AbortSignal.abort(Error('cancelled'));
  for(const request of [signal=>loadNftPage('all',1,signal),signal=>loadMiningStats('1d',signal)])await assert.rejects(request(cancelled),/cancelled/);
  t.mock.method(AbortSignal,'timeout',ms=>{assert.equal(ms,5000);return AbortSignal.abort(Error('timed out'));});
  for(const request of [()=>loadNftPage('all',1),()=>loadMiningStats('1d')])await assert.rejects(request(),/timed out/);
});
