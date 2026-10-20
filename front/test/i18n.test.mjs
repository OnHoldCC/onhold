import test from 'node:test';
import assert from 'node:assert/strict';
import {messages,translate,translateError} from '../src/i18n.mjs';
import {stepsEn} from '../src/steps-en.mjs';
import {steps} from '../src/steps.mjs';
import {makeEvent} from '../src/telemetry.mjs';
test('English and Chinese contain the same translation keys',()=>{
  assert.deepEqual(Object.keys(messages.en).sort(),Object.keys(messages.zh).sort());
  for(const value of Object.values(messages.en)) assert.doesNotMatch(value,/[\u4e00-\u9fff]/);
  assert.equal(translate('en','claim'),'Claim');
  assert.match(translateError(new Error('出价必须高于当前广告位价格。'),'en'),/higher/);
});
test('English tutorial uses the same real screenshots with English instructions',()=>{
  assert.equal(stepsEn.length,4);
  assert.deepEqual(stepsEn.map(step=>step.image),steps.map(step=>step.image));
  for(const step of stepsEn){assert.equal(step.instructions.length,3);assert.doesNotMatch([step.title,step.intro,step.alt,...step.instructions,step.tip].join(' '),/[\u4e00-\u9fff]/);}
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
  for(const lang of Object.keys(messages)){assert.match(translate(lang,'homeIntro'),/NFT/);assert.match(translate(lang,'homeIntro'),/\$Claude/);}
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
