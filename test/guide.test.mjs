import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { steps, nextStep, instructionsFor } from '../src/steps.mjs';
import { illustrations } from '../src/illustrations.mjs';

test('every guide step has an illustration and accessible text', () => {
  assert.equal(steps.length, 4);
  for (const step of steps) {
    assert.ok(illustrations[step.image]);
    assert.ok(step.alt.length > 20);
    assert.equal(step.instructions.length, 3);
  }
});
test('navigation stays inside the guide', () => {
  assert.equal(nextStep(0, -1), 0);
  assert.equal(nextStep(3, 1), 3);
  assert.equal(nextStep(1, 1), 2);
  assert.equal(nextStep(2, -1), 1);
});
test('shortcuts match the selected operating system', () => {
  assert.match(instructionsFor(steps[1], 'mac')[0], /Command/);
  assert.match(instructionsFor(steps[1], 'windows')[0], /Ctrl/);
  assert.ok(!instructionsFor(steps[1], 'mac')[0].includes('{shortcut}'));
});
test('React claim preview cannot accept credentials before verification exists', async () => {
  const jsx = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
  assert.match(jsx, /type="password" disabled autoComplete="off"/);
  assert.doesNotMatch(jsx, /clipboard\.read|sk-ant-sid02-/);
});
