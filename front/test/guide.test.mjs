import test from 'node:test';
import assert from 'node:assert/strict';
import { steps, nextStep, instructionsFor } from '../src/steps.mjs';
import {readFileSync} from 'node:fs';

test('every guide step has a real screenshot asset and accessible text', () => {
  assert.equal(steps.length, 4);
  for (const step of steps) {
    const bytes=readFileSync(new URL('../src/assets/'+step.image,import.meta.url));
    assert.ok(bytes.length>10000);
    assert.ok(bytes.subarray(0,3).equals(Buffer.from([0xff,0xd8,0xff])) || bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
    assert.ok(step.alt.length > 20);
    assert.ok(step.instructions.length >= 3);
  }
});
test('navigation stays inside the guide', () => {
  assert.equal(nextStep(0, -1), 0);
  assert.equal(nextStep(3, 1), 3);
  assert.equal(nextStep(1, 1), 2);
  assert.equal(nextStep(2, -1), 1);
});
test('instructions name shortcuts, Network refresh and Copy as cURL', () => {
  assert.match(instructionsFor(steps[1])[0], /F12.*开发者工具/);
  assert.match(instructionsFor(steps[1])[1], /Network/);
  assert.match(instructionsFor(steps[1])[2], /F5/);
  assert.match(instructionsFor(steps[1])[5], /Copy as cURL/);
  assert.ok(!instructionsFor(steps[1]).join('').includes('{shortcut}'));
});
