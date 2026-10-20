import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {welcomeCopy} from '../src/welcome-copy.mjs';
import {translate} from '../src/i18n.mjs';

test('welcome instructions explain the account-to-staking flow in all eight locales',()=>{
  assert.equal(Object.keys(welcomeCopy).length,8);
  const keys=Object.keys(welcomeCopy.en).sort();
  for(const [lang,copy] of Object.entries(welcomeCopy)){
    assert.deepEqual(Object.keys(copy).sort(),keys);
    for(const [key,value] of Object.entries(copy)){assert.ok(value?.trim(),`${lang}.${key}`);assert.equal(translate(lang,key),value);}
    assert.match(copy.letterNftBody,/NFT/);assert.match(copy.letterClaimBody,/\$Claude/);
    assert.match(copy.letterWeights,/Pro.*1.*Max.*3/);
    assert.match(copy.letterPublic,/UUID/);
  }
});

test('welcome uses the shared accessible dialog and a keyboard-accessible next action',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'onhold-welcome-'));
  try{
    const outfile=join(directory,'render.mjs');
    await build({stdin:{resolveDir:fileURLToPath(new URL('../',import.meta.url)),contents:`
      import React from 'react';import {renderToStaticMarkup as render} from 'react-dom/server';
      import {WelcomeLetter} from './components/onhold/WelcomeLetter.jsx';
      import {translate} from './src/i18n.mjs';
      const props={onClose:()=>{},onStart:()=>{},t:key=>translate('en',key)};
      console.log(JSON.stringify({open:render(React.createElement(WelcomeLetter,{...props,open:true})),closed:render(React.createElement(WelcomeLetter,{...props,open:false}))}));
    `},outfile,bundle:true,jsx:'automatic',platform:'node',format:'esm',logLevel:'silent',loader:{'.png':'file','.css':'empty'},banner:{js:"import {createRequire} from 'node:module';const require=createRequire(import.meta.url);"}});
    const html=JSON.parse(execFileSync(process.execPath,[outfile],{encoding:'utf8',maxBuffer:8*1024*1024}));
    assert.match(html.open,/app-modal-dialog welcome-letter/);
    assert.match(html.open,/role="dialog"/);assert.match(html.open,/aria-modal="true"/);
    assert.match(html.open,/aria-labelledby="welcome-letter-title"/);
    assert.match(html.open,/Account banned\./);assert.match(html.open,/aria-label="Next"/);assert.doesNotMatch(html.open,/Take the letter|welcome-letter__open/);assert.match(html.open,/welcome-letter__take/);
    assert.match(html.open,/aria-label="Close"/);assert.equal(html.closed,'');
  }finally{await rm(directory,{recursive:true,force:true});}
});
