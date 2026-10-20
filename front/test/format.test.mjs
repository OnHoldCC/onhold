import test from 'node:test';import assert from 'node:assert/strict';import {formatBanTime,compactCount} from '../src/format.mjs';
test('ban timestamps display UTC seconds while the original record remains intact',()=>{const raw='2026-09-23T12:41:20.292985Z';assert.equal(formatBanTime(raw),'2026-09-23 12:41:20');assert.equal(formatBanTime('2026-09-23T20:41:20+08:00'),'2026-09-23 12:41:20');assert.equal(formatBanTime('invalid'),'—');});

test('large visitor counts stay compact without changing the source count',()=>{
 assert.equal(compactCount(999),'999');assert.equal(compactCount(1234),'1.2K');assert.equal(compactCount(1234567),'1.2M');
 assert.equal(compactCount(12500,'zh'),'1.3万');assert.equal(compactCount(0),'0');
 for(const value of [null,undefined,-1,Infinity,Number.MAX_SAFE_INTEGER+1])assert.equal(compactCount(value),'—');
});
