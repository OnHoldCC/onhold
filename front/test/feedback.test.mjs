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
      import {SingleSparkList,SingleSparkListItem,SingleSparkAccordion} from '@singlespark/component-atlas/primitives';
      import {SingleSparkHomeGraph} from '@singlespark/component-atlas/singlespark';
      import {NftGallery} from './components/onhold/NftGallery.jsx';
      import {NftMining} from './components/onhold/NftMining.jsx';
      import {NftStaking} from './components/onhold/NftStaking.jsx';
      import {App,SummaryCards,GuideRequestMarkers,Home,Locale} from './components/onhold/App.jsx';
      import {MiningNetworkHistory} from './components/onhold/MiningNetworkHistory.jsx';
      import {VerificationDetails} from './components/onhold/VerificationDetails.jsx';
      import {Docs} from './components/onhold/Docs.jsx';
      import {translate} from './src/i18n.mjs';
      import {seedMarket} from './src/market.mjs';
      import {storedMarket,storedNft} from './src/chain.mjs';
      import config from './src/chain-config.json';
      globalThis.window={};globalThis.localStorage={getItem:()=>null};globalThis.location={pathname:'/',search:'',href:'http://localhost/'};
      const pages=Object.fromEntries(['home','burn','analytics','claim'].map(page=>{location.pathname=page==='home'?'/':'/'+page;return [page,render(React.createElement(App))];}));
      const t=key=>translate('zh',key),value=props=>render(React.createElement(DataValue,{t,...props}));
      const home=(url,ad={},props={})=>render(React.createElement(Locale.Provider,{value:{t,lang:'zh'}},React.createElement(Home,{state:{ads:[{...seedMarket().ads[0],url,description:'TEST price decay every sixty seconds',tags:[],...ad}]},financial:{burned:0,claimed:0,recipients:0,claims:[]},loading:false,statsLoading:false,...props})));
      location.pathname='/';location.search='?setup=1';window.ethereum={isOnholdTestWallet:true,onholdTestMarket:'0x'+'1'.repeat(40)};localStorage.getItem=()=>JSON.stringify({marketAddress:'0x'+'2'.repeat(40)});
      const cleanHome=render(React.createElement(App));
      console.log(JSON.stringify({
        cleanHome,configuredAddresses:{market:storedMarket(),nft:storedNft(),expectedMarket:config.marketAddress,expectedNft:config.nftAddress},
        loopingGraph:render(React.createElement(SingleSparkHomeGraph,{history:[0,10,30],label:'History',loop:true})),flatGraph:render(React.createElement(SingleSparkHomeGraph,{history:[0,0],loop:true})),staticGraph:render(React.createElement(SingleSparkHomeGraph,{history:[0,30]})),invalidGraph:render(React.createElement(SingleSparkHomeGraph,{history:[0,NaN],loop:true})),
        stakingDisabled:render(React.createElement(NftStaking,{enabled:false,wallet:{address:'0x'+'1'.repeat(40),referralBound:true},market:'0x'+'2'.repeat(40),t})),
        listSlot:render(React.createElement(SingleSparkList,null,React.createElement(SingleSparkListItem,{title:React.createElement('a',{href:'https://example.com/'},'example.com'),description:null,leading:null},React.createElement(SingleSparkAccordion,{label:'Tags'},'AI')))),homeOfficial:home('https://onhold.cc/'),homeAdvertiser:home('https://advertiser.example/'),
        homeEmpty:home('https://example.com/',{empty:true,title:'空广告位 01',description:'你的中转站可以出现在这里。',bid:'0',startedAt:0,clicks:0,uv:0}),homeNftOnly:home('https://example.com/',{empty:true},{biddingEnabled:false}),homeMissing:home('https://example.com/',{title:'LOOP'},{financial:null}),homeZero:home('https://advertiser.example/',{clicks:0,uv:0}),
        parsedDetails:render(React.createElement(VerificationDetails,{t,details:{standing:'bad_standing',previous_plan:'free',banned_at:'2026-09-01T00:00:00Z',ban_category:null,organizations:[{name:'Example Account',uuid:'f40c6c60-10ea-4c0b-8a79-c98e4cd102e9'}]}})),
        summaryUnavailable:render(React.createElement(SummaryCards,{financial:{burned:null,claimed:'345',burnedSymbol:'$OnHold',claims:[]},loading:false,t,lang:'zh'})),homeFast:home('https://onhold.cc/',{priceIntervalSeconds:60}),pages,guidePaste:render(React.createElement(GuideRequestMarkers,{step:2})),guideMarkers:render(React.createElement(GuideRequestMarkers)),summaryZero:render(React.createElement(SummaryCards,{financial:{burned:0,claimed:0,recipients:0,claims:[]},loading:false,t,lang:'zh'})),summaryLarge:render(React.createElement(SummaryCards,{financial:{burned:'0.41',claimed:'2793.2141',claims:[]},loading:false,t,lang:'zh'})),summaryValues:render(React.createElement(SummaryCards,{financial:{burned:'12',claimed:'345',recipients:6,claims:[{amount:'7',recipient:'0x1111111111111111111111111111111111111111',txHash:'0x'+'a'.repeat(64)}]},loading:false,t,lang:'zh'})),docs:render(React.createElement(Docs,{t})),loading:value({loading:true}),zero:value({value:'0.000000000000000000',unit:'BNB'}),platform:value({value:0,unit:'$OnHold'}),
        cached:value({value:12,loading:true}),missing:value({}),invalid:value({value:NaN}),blank:value({value:''}),
        error:render(React.createElement(Notice,{error:true},'请求失败')),
        emptyNotice:render(React.createElement(Notice)),
        gallery:render(React.createElement(NftGallery,{t})),
        mining:render(React.createElement(NftMining,{t,lang:'zh',wallet:{address:''},market:'0x123'})),
        owned:render(React.createElement(NftMining,{view:'owned',t,lang:'zh',wallet:{address:''},market:'0x123'})),
        referral:render(React.createElement(NftMining,{view:'referral',t,lang:'zh',wallet:{address:''},market:'0x123'})),
        chart:render(React.createElement(MiningNetworkHistory,{t,lang:'zh'}))
      }));
    `},outfile,bundle:true,jsx:'automatic',platform:'node',format:'esm',logLevel:'silent',loader:{'.svg':'dataurl','.jpg':'dataurl','.png':'file','.webp':'file','.css':'empty'},define:{'process.env.NODE_ENV':'"production"'},banner:{js:"import {createRequire} from 'node:module'; const require=createRequire(import.meta.url);"}});
    const html=JSON.parse(execFileSync(process.execPath,[outfile],{encoding:'utf8'}));
    assert.match(html.homeNftOnly,/<button[^>]*disabled[^>]*>[\s\S]*?参与竞价/);
    assert.doesNotMatch(html.cleanHome,/setup-deploy|setup-result|部署测试代币|Deploy test token/);
    assert.match(html.pages.home,/href="https:\/\/github\.com\/SingleSparkfun\/OnHold-Contracts"/);assert.match(html.pages.home,/aria-label="OnHold contracts on GitHub"/);

    assert.equal(html.configuredAddresses.market.toLowerCase(),html.configuredAddresses.expectedMarket.toLowerCase());assert.equal(html.configuredAddresses.nft.toLowerCase(),html.configuredAddresses.expectedNft.toLowerCase());
    for(const key of ['loopingGraph','flatGraph']){
      assert.match(html[key],/uh-history-loop/);assert.equal((html[key].match(/class="uh-history-tile"/g)||[]).length,3);
      assert.deepEqual([...html[key].matchAll(/class="uh-history-tile" transform="([^"]+)"/g)].map(m=>m[1]),['translate(0 0)','translate(840 0) scale(-1 1)','translate(840 0)']);
      const lines=[...html[key].matchAll(/<path d="([^"]+)" fill="none"/g)].map(m=>m[1]);assert.equal(lines.length,3);assert.ok(lines.every(d=>d===lines[0]),'all tiles replay the same recorded curve');
      assert.equal((html[key].match(/class="uh-history-highlight"/g)||[]).length,3);
    }
    assert.match(html.loopingGraph,/aria-label="History: 0 → 30"/);assert.doesNotMatch(html.staticGraph,/uh-history-loop|uh-history-highlight/);assert.equal((html.staticGraph.match(/uh-history-tile/g)||[]).length,1);assert.doesNotMatch(html.invalidGraph,/<svg/);
    assert.equal((html.guidePaste.match(/<rect/g)||[]).length,2);assert.doesNotMatch(html.guidePaste,/<ellipse|<circle/);assert.equal((html.summaryZero.match(/class="uh-fee-number"/g)||[]).length,2);assert.doesNotMatch(html.summaryZero,/uh-analytics-stats|uh-stream-pan/);assert.match(html.pages.home,/Place a bid/);
    assert.match(html.listSlot,/singlespark-list-content/);assert.match(html.listSlot,/aria-expanded="false"/);assert.doesNotMatch(html.listSlot,/<details|<button[^>]*><a/);assert.doesNotMatch(html.summaryZero,/summary-history-status/);
    assert.match(html.homeOfficial,/Claude 封你，OnHold 赔付你/);assert.doesNotMatch(html.homeOfficial,/TEST price decay|spotlight-footer|>访问官网</);assert.match(html.homeAdvertiser,/TEST price decay every sixty seconds/);assert.doesNotMatch(html.homeAdvertiser,/Claude 封你/);
    for(const key of ['homeEmpty','homeMissing']){
      const card=html[key].split('<div class="directory-note">')[0];
      assert.match(card,/ss-skeleton-layout/);assert.doesNotMatch(card,/example\.com|空广告位|>空<|你的中转站|等待首次竞价|TEST price decay|LOOP|暂无数据/);
      for(const name of ['discover-token-card','token-card-header','token-card-networks','spotlight-metrics','auction-curve','curve-heading','curve-axis','curve-period','curve-footnote','ad-bid-action'])assert.ok(card.includes(name),key+': '+name);
      for(const id of ['website-clicks','website-uv'])assert.match(card,new RegExp('data-testid="'+id+'"[^>]*>.*?ss-skeleton-layout'));
    }
    for(const id of ['website-clicks','website-uv'])assert.match(html.homeZero,new RegExp('data-testid="'+id+'"[^>]*><span[^>]*class="singlespark-money'));
    assert.doesNotMatch(html.homeZero.split('<div class="directory-note">')[0],/ss-skeleton-layout/);
    assert.match(html.parsedDetails,/free/);assert.match(html.parsedDetails,/Example Account/);assert.match(html.parsedDetails,/f40c6c60-10ea-4c0b-8a79-c98e4cd102e9/);assert.match(html.parsedDetails,/历史套餐/);
    assert.match(html.guideMarkers,/F12/);assert.match(html.guideMarkers,/F5/);assert.doesNotMatch(html.guideMarkers,/<ellipse|<circle/);
    assert.match(html.loading,/ss-skeleton-layout/);assert.match(html.loading,/aria-busy="true"/);
    assert.match(html.platform,/>\$OnHold</);assert.doesNotMatch(html.platform,/ss-token-icon|claude-token.png/);assert.match(html.zero,/>0</);assert.match(html.zero,/data-symbol="BNB"/);assert.doesNotMatch(html.zero,/>BNB</);assert.doesNotMatch(html.zero,/skeleton/);
    assert.match(html.cached,/>12</);assert.doesNotMatch(html.cached,/skeleton/);
    for(const key of ['missing','invalid','blank']){assert.match(html[key],/暂无数据/);assert.doesNotMatch(html[key],/skeleton|NaN/);}
    assert.match(html.error,/ub-notification-toast/);assert.match(html.error,/role="alert"/);assert.match(html.error,/请求失败/);assert.equal(html.emptyNotice,'');
    for(const key of ['gallery','mining','chart']){assert.match(html[key],/ss-skeleton-layout/);assert.doesNotMatch(html[key],/>—<|>\s*-\s*</);}
    for(const tab of ['mint','mining','nfts','invite','faq'])assert.match(html.pages.claim,new RegExp('id="claim-mode-panel-tab-'+tab+'"'));
    assert.match(html.stakingDisabled,/<button[^>]*disabled[^>]*>[\s\S]*?添加质押/);
    assert.match(html.pages.claim,/aria-labelledby="claim-mode-panel-tab-mint"/);
    assert.doesNotMatch(html.pages.claim,/class="nft-gallery"/);
    assert.doesNotMatch(html.pages.claim,/class="invite-panel"|class="faq"|class="mining-section"/);
    assert.match(html.owned,/我的 NFT/);assert.doesNotMatch(html.pages.home,/class="brand-mark"/);assert.match(html.pages.home,/brand-spark/);assert.match(html.pages.home,/brand-prompt/);assert.match(html.owned,/mining-passes/);for(const tab of ['all','1','2'])assert.match(html.owned,new RegExp('id="owned-nft-list-tab-'+tab+'"'));assert.match(html.owned,/mining-owned-empty/);assert.doesNotMatch(html.owned,/mining-metrics/);assert.doesNotMatch(html.mining,/mining-passes/);
    assert.match(html.referral,/领取邀请奖励/);assert.doesNotMatch(html.referral,/mining-metrics|mining-passes|networkMining/);
    assert.doesNotMatch(html.mining,/领取邀请奖励/);assert.match(html.mining,/aria-label="挖矿说明"/);
    assert.match(html.mining,/aria-expanded="false"/);assert.match(html.mining,/role="tooltip"[^>]*hidden=""/);
    assert.match(html.mining,/365/);assert.match(html.mining,/已质押 NFT/);assert.doesNotMatch(html.mining,/全网挖矿概况|我的挖矿权重|我的权重占比/);
    assert.doesNotMatch(html.mining,/\[object Object\]/);
    assert.match(html.chart,/ub-analytics-chart/);assert.match(html.chart,/ub-bar-surface/);assert.match(html.chart,/ub-axis/);assert.match(html.chart,/height:160px/);assert.match(html.chart,/全网算力/);assert.doesNotMatch(html.chart,/ss-skeleton-layout-chart/);
    assert.match(html.summaryUnavailable,/aria-label="0 \$OnHold"/);assert.match(html.summaryUnavailable,/class="singlespark-sr-only">0 \$OnHold</);assert.doesNotMatch(html.summaryUnavailable,/OHLDTEST|—|No chart data/);assert.match(html.summaryUnavailable,/history: 0 → 0/);assert.equal((html.summaryUnavailable.match(/class="uh-history-loop"/g)||[]).length,2);assert.equal((html.summaryZero.match(/class="uh-history-loop"/g)||[]).length,2);assert.match(html.homeFast,/60 秒/);assert.doesNotMatch(html.homeFast,/仅限测试|TEST ONLY/);assert.match(html.summaryZero,/uh-feature-grid-summary/);assert.match(html.summaryZero,/uh-feed-frame/);assert.match(html.summaryZero,/uh-card-fade/);assert.match(html.summaryZero,/暂无领取记录/);assert.doesNotMatch(html.summaryZero,/暂无数据/);assert.equal((html.summaryZero.match(/class="uh-payment"/g)||[]).length,18);assert.match(html.summaryZero,/uh-payment-copy.*?ss-skeleton-layout/);assert.match(html.summaryZero,/<b><div[^>]*ss-skeleton-layout/);assert.doesNotMatch(html.summaryZero,/recipient-example\.svg|0x[0-9a-f]{40}/);assert.match(html.summaryZero,/aria-label="0 \$OnHold"/);for(const n of [12,345]){assert.ok(html.summaryValues.includes('aria-label="'+n+' $OnHold"'));assert.ok(html.summaryValues.includes('title="'+n+' $OnHold"'));}assert.match(html.summaryValues,/7 \$OnHold/);assert.match(html.summaryLarge,/title="2,793.2141 \$OnHold"/);assert.match(html.summaryLarge,/aria-label="2,793.2141 \$OnHold"/);assert.match(html.summaryLarge,/2.79K \$OnHold/);assert.match(html.summaryLarge,/0.41 \$OnHold/);assert.match(html.summaryValues,/uh-payment-people/);assert.doesNotMatch(html.summaryValues,/暂无领取记录/);assert.match(html.summaryValues,/href="\/claim"/);
    for(const key of ['chart','mining'])assert.doesNotMatch(html[key],/反映奖励竞争程度|不是 PoW/);assert.match(html.pages.analytics,/id="analytics-panel-tab-spotlight"/);assert.match(html.pages.analytics,/id="analytics-panel-tab-pool"/);assert.match(html.pages.analytics,/aria-labelledby="analytics-panel-tab-spotlight"/);assert.doesNotMatch(html.pages.analytics,/全网算力|累计领取数量/);assert.doesNotMatch(html.pages.analytics,/来自 Rust 埋点|Every visit counts|每一次点击|back-link/);assert.doesNotMatch(html.pages.home,/class="breadcrumb"/);assert.match(html.pages.home,/OnHold/);assert.doesNotMatch(html.pages.home,/宣传栏|PROMOTION BOARD|home-intro|welcome-letter-trigger/);
    assert.doesNotMatch(html.docs,/src="assets\/claude-token\.png"/);assert.match(html.docs,/claude-token-108/);assert.doesNotMatch(html.docs,/>目录</);assert.match(html.docs,/href="#docs-staking"/);assert.match(html.docs,/how-scroll-curve/);
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
