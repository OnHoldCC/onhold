import test from 'node:test';import assert from 'node:assert/strict';import {pageFromPath,pagePath} from '../src/routes.mjs';
test('React routes use extensionless paths without legacy HTML routing',()=>{
 for(const page of ['home','claim','analytics','burn','docs']){
  assert.equal(pageFromPath(pagePath(page)),page);assert.doesNotMatch(pagePath(page),/\.html/);
  if(page!=='home'){assert.equal(pageFromPath('/'+page+'.html'),'home');}
 }
 assert.equal(pageFromPath('/'),'home');
});
