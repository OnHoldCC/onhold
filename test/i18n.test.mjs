import test from 'node:test';
import assert from 'node:assert/strict';
import {messages,translate,translateError} from '../src/i18n.mjs';
import {stepsEn} from '../src/steps-en.mjs';
import {englishIllustrations} from '../src/illustrations.mjs';
import {makeEvent} from '../src/telemetry.mjs';
test('English and Chinese contain the same translation keys',()=>{
  assert.deepEqual(Object.keys(messages.en).sort(),Object.keys(messages.zh).sort());
  for(const value of Object.values(messages.en)) assert.doesNotMatch(value,/[\u4e00-\u9fff]/);
  assert.equal(translate('en','claim'),'Compensation');
  assert.match(translateError(new Error('出价必须高于当前广告位价格。'),'en'),/higher/);
});
test('English tutorial includes four illustrations without untranslated Chinese text',()=>{
  assert.equal(stepsEn.length,4);
  for(const step of stepsEn){assert.ok(englishIllustrations[step.image+'-en']);assert.equal(step.instructions.length,3);}
  for(const svg of Object.values(englishIllustrations)) assert.doesNotMatch(svg,/[\u4e00-\u9fff]/);
});
test('telemetry payload only contains the documented non-sensitive fields',()=>{
  assert.deepEqual(makeEvent('ad_click','home',2,'event-00000000000001'),{event_id:'event-00000000000001',kind:'ad_click',page:'home',site_id:2});
  assert.throws(()=>makeEvent('claim','claim',undefined,'a'));
  assert.throws(()=>makeEvent('ad_click','claim',2,'a'));
  assert.throws(()=>makeEvent('ad_click','home',6,'a'));
  assert.throws(()=>makeEvent('wallet_connect','home',2,'a'));
});
