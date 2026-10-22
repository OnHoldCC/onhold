import test from 'node:test';
import assert from 'node:assert/strict';
import {messages,translate,translateError,initialLocale,supportedLocales} from '../src/i18n.mjs';
import {stepsEn} from '../src/steps-en.mjs';
import {steps} from '../src/steps.mjs';
import {makeEvent} from '../src/telemetry.mjs';
test('browser language selects a supported locale unless the user saved a preference',()=>{
  for(const lang of supportedLocales)assert.equal(initialLocale(null,[`${lang}-XX`]),lang);
  assert.equal(initialLocale(null,['zh-Hant-TW','en-US']),'zh');
  assert.equal(initialLocale(null,['ru-RU','pt-BR']),'pt');
  assert.equal(initialLocale('ja',['zh-CN']),'ja');
  assert.equal(initialLocale('invalid',['FR-ca']),'fr');
  assert.equal(initialLocale(null,['ru-RU']),'en');
  assert.equal(initialLocale(null,[]),'en');
});
test('English and Chinese contain the same translation keys',()=>{
  assert.deepEqual(Object.keys(messages.en).sort(),Object.keys(messages.zh).sort());
  for(const value of Object.values(messages.en)) assert.doesNotMatch(value,/[\u4e00-\u9fff]/);
  assert.equal(translate('en','claim'),'Claim');
  assert.match(translateError(new Error('出价必须高于当前广告位价格。'),'en'),/higher/);
});
test('English tutorial uses the same real screenshots with English instructions',()=>{
  assert.equal(stepsEn.length,4);
  assert.deepEqual(stepsEn.map(step=>step.image),steps.map(step=>step.image));
  for(const step of stepsEn){assert.ok(step.instructions.length>=3);assert.doesNotMatch([step.title,step.intro,step.alt,...step.instructions,step.tip].join(' '),/[\u4e00-\u9fff]/);}
});
test('telemetry payload only contains the documented non-sensitive fields',()=>{
  assert.deepEqual(makeEvent('ad_click','home',2,'event-00000000000001'),{event_id:'event-00000000000001',kind:'ad_click',page:'home',site_id:2});
  assert.throws(()=>makeEvent('claim','claim',undefined,'a'));
  assert.throws(()=>makeEvent('ad_click','claim',2,'a'));
  assert.throws(()=>makeEvent('ad_click','home',6,'a'));
  assert.throws(()=>makeEvent('wallet_connect','home',2,'a'));
});

test('homepage copy describes restriction NFTs and staking in all eight locales',()=>{
  assert.equal(Object.keys(messages).length,8);
  for(const lang of Object.keys(messages)){assert.match(translate(lang,'homeIntro'),/NFT/);assert.match(translate(lang,'homeIntro'),/\$OnHold/);}
  assert.doesNotMatch(translate('en','homeTitle'),/spotlight|project/i);
  assert.doesNotMatch(translate('zh','homeTitle'),/看见|项目/);
});

test('all locales describe 365-day linear mining and claiming without unstaking',()=>{
  for(const lang of Object.keys(messages)){
    assert.match(translate(lang,'emissionRule'),/365/);
    assert.match(translate(lang,'adRevenueRule'),/50%/);
    for(const key of ['adReserve','adReinvested'])assert.notEqual(translate(lang,key),key);
    assert.equal(translate(lang,'claimHalving'),translate(lang,'emissionRule'));
    for(const key of ['miningEnds','miningEnded'])assert.notEqual(translate(lang,key),key);
  }
  assert.match(translate('en','holdingRule'),/Claim anytime without unstaking/);
  assert.match(translate('zh','holdingRule'),/随时领取，无需解押/);
  assert.match(translate('en','miningInvite'),/15%/);
});

test('mining competition and fast-auction rules are named in every locale',()=>{
 for(const lang of Object.keys(messages))for(const key of ['networkMining','networkWeight','perWeightDaily','myWeightShare','networkStatsNote','miningCompetition','miningHistoryPending','fastAdRules'])assert.notEqual(translate(lang,key),key);
});

test('navigation labels are translated in every non-English locale',()=>{
 const expected={zh:['首页','领取','销毁'],ja:['ホーム','受け取る','バーン'],ko:['홈','보상 받기','소각'],es:['Inicio','Reclamar','Quema'],fr:['Accueil','Réclamer','Destruction'],de:['Startseite','Abholen','Verbrennen'],pt:['Início','Resgatar','Queima']};
 for(const [lang,labels]of Object.entries(expected))assert.deepEqual(['home','claim','burn'].map(key=>translate(lang,key)),labels);
});

test('cURL guide names every required action in order',()=>{
 for(const guide of [steps,stepsEn]){
  assert.equal(guide[1].instructions.length,7);const flow=guide[1].instructions.join(' ');let last=-1;
  for(const action of ['F12','Network','F5','standing','Copy','Copy as cURL']){const index=flow.indexOf(action,last+1);assert.ok(index>last,action);last=index;}
  assert.equal(guide[1].image,'guide/network-curl.png');assert.equal(guide[2].image,'guide/paste-curl.png');
 }
});

test("NFT power labels use the requested terminology",()=>{assert.equal(translate("zh","nftWeight"),"挖矿算力");assert.equal(translate("en","nftWeight"),"Mining power");});

test('claim tabs and mining tip are localized in every language',()=>{
  for(const lang of supportedLocales)for(const key of ['mintTab','miningTab','inviteTab','faqTab','miningRules','myNfts','myNftsTab'])assert.notEqual(translate(lang,key),key);
  assert.deepEqual(['mintTab','miningTab','myNftsTab','inviteTab','faqTab'].map(key=>translate('zh',key)),['铸造','质押','我的','邀请','答疑']);
});

test('wallet guidance and official site description are localized',()=>{
 for(const lang of supportedLocales)for(const key of ['noWalletDetected','walletBrowserHint','onholdDescription'])assert.notEqual(translate(lang,key),key);
 assert.match(translate('en','onholdDescription'),/OnHold/);assert.match(translate('zh','onholdDescription'),/NFT/);
});

 test('account verification copy names no storage provider in any locale',()=>{
   for(const lang of ['en','zh','ja','ko','es','fr','de','pt']){
     assert.doesNotMatch(translate(lang,'sessionUse'),/Pons|IPFS|SingleSpark/i);
     assert.doesNotMatch(translate(lang,'api.artwork_unavailable'),/Pons|IPFS|SingleSpark/i);
   }
 });

test("fast auction copy keeps the actual interval without a test-only prefix",()=>{
 for(const lang of supportedLocales){assert.match(translate(lang,"fastAdRules"),/60/);assert.doesNotMatch(translate(lang,"fastAdRules"),/TEST|测试|テスト|테스트|PRUEBAS|TESTE/);}
});
