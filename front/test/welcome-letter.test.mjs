import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {welcomeCopy} from '../src/welcome-copy.mjs';
import {translate} from '../src/i18n.mjs';
import {portraitClipPath,portraitClipPaths} from '../src/portrait-shape.mjs';

test('portrait uses compact WebP variants with alpha and an inline silhouette',async()=>{
  for(const name of ['claude-code-girl','teacher','student','sister']){
    for(const [size,height,limit] of [[640,800,100000],[1024,1280,200000]]){
      const file=await readFile(new URL(`../src/assets/welcome/${name}-${size}.webp`,import.meta.url));
      assert.equal(file.toString('ascii',0,4),'RIFF');assert.equal(file.toString('ascii',8,16),'WEBPVP8X');
      assert.ok(file[20]&0x10,'Transparent alpha is retained');
      assert.equal(file.readUIntLE(24,3)+1,size);assert.equal(file.readUIntLE(27,3)+1,height);
      assert.ok(file.length<limit,`${name} ${size}px portrait exceeds its transfer budget`);
    }
  }
  const paths=[portraitClipPath,...Object.values(portraitClipPaths)];
  assert.equal(new Set(paths).size,4,'Each character needs its own silhouette');
  for(const path of paths){
    assert.match(path,/^polygon\(/);
    const coordinates=[...path.matchAll(/([\d.]+)%/g)].map(match=>Number(match[1]));
    assert.ok(coordinates.length>50&&coordinates.every(value=>value>=0&&value<=100));
  }
});

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
      import {welcomePortraits} from './src/welcome-portraits.mjs';
      import {translate} from './src/i18n.mjs';
      const props={onClose:()=>{},onStart:()=>{},lang:'en',onLanguageChange:()=>{},t:key=>translate('en',key)};
      const variants=welcomePortraits.map((portrait,index)=>{
        Math.random=()=>(index+.5)/welcomePortraits.length;
        return {...portrait,html:render(React.createElement(WelcomeLetter,{...props,open:true}))};
      });
      console.log(JSON.stringify({variants,open:variants[0].html,closed:render(React.createElement(WelcomeLetter,{...props,open:false}))}));
    `},outfile,bundle:true,jsx:'automatic',platform:'node',format:'esm',logLevel:'silent',loader:{'.png':'file','.webp':'file','.css':'empty'},banner:{js:"import {createRequire} from 'node:module';const require=createRequire(import.meta.url);"}});
    const html=JSON.parse(execFileSync(process.execPath,[outfile],{encoding:'utf8',maxBuffer:8*1024*1024}));
    assert.match(html.open,/app-modal-dialog welcome-letter/);
    assert.match(html.open,/role="dialog"/);assert.match(html.open,/aria-modal="true"/);
    assert.match(html.open,/aria-labelledby="welcome-letter-title"/);
    assert.match(html.open,/Account banned\./);assert.match(html.open,/aria-label="Next"/);assert.doesNotMatch(html.open,/Take the letter|welcome-letter__open/);assert.match(html.open,/welcome-letter__take/);
    assert.match(html.open,/aria-label="Close"/);assert.equal(html.closed,'');
    assert.match(html.open,/<source media="\(max-width: 640px\)" srcSet="[^"]*640[^\"]*\.webp"/);
    assert.match(html.open,/src="[^\"]*1024[^\"]*\.webp"/);
    assert.doesNotMatch(html.open,/claude-code-girl-spark.*\.png/);
    assert.match(html.open,/welcome-letter__skeleton/);assert.match(html.open,/clip-path:polygon/);
    assert.match(html.open,/aria-busy="true"/);assert.match(html.open,/decoding="async"/);
    assert.deepEqual(html.variants.map(portrait=>portrait.id),['original','teacher','student','sister']);
    for(const portrait of html.variants){
      assert.ok(portrait.html.includes(`src="${portrait.src}"`),`${portrait.id} is reachable by random selection`);
      assert.ok(portrait.html.includes(`srcSet="${portrait.small}"`));
      assert.ok(portrait.html.includes(`clip-path:${portrait.clipPath}`),`${portrait.id} uses its matching skeleton`);
    }
  }finally{await rm(directory,{recursive:true,force:true});}
});
