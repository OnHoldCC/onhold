import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile,readdir} from 'node:fs/promises';
import {brotliDecompressSync} from 'node:zlib';
import {pathToFileURL} from 'node:url';
import {runInNewContext} from 'node:vm';
import {messages} from '../src/i18n.mjs';

test('initial module graph excludes wallet providers and deployment bytecode; hashed chunks preload and compress correctly',async()=>{
 execFileSync(process.execPath,['front/scripts/build.mjs'],{stdio:'pipe'});
 const metrics=JSON.parse(await readFile('/tmp/onhold-front-performance.json','utf8'));
 assert.ok(metrics.initialJsBytes<600000,`Initial JS grew to ${metrics.initialJsBytes}`);
 for(const path of metrics.eager)for(const input of Object.keys(metrics.outputs[path].inputs))assert.doesNotMatch(input,/ethers\/.*\/providers\/|contracts\/artifacts\/|nft-artwork\.mjs|\/Docs\.jsx$/);
 assert.deepEqual((await readdir('front/dist')).filter(name=>name.endsWith('.html')),['index.html']);
 const html=await readFile('front/dist/index.html','utf8');assert.match(html,/rel="modulepreload"/);assert.doesNotMatch(html,/✳ OnHold/);assert.match(html,/rel="icon" type="image\/png" href="assets\/onhold-favicon-transparent\.png"/);
 const locales=Object.entries(metrics.outputs).filter(([,info])=>info.entryPoint?.startsWith('locale:'));
 assert.equal(locales.length,7);
 for(const [path,info]of locales){assert.ok(!metrics.eager.includes(path));assert.deepEqual((await import(pathToFileURL(path))).default,messages[info.entryPoint.slice(7)]);}
 const preload=html.match(/<script>(.*?)<\/script>/)[1];
 for(const [pathname,read,setup,expected]of [['/',null,'',2],['/','read','',0],['/claim',null,'',0],['/',null,'?setup=1',0]]){
  const links=[],dataset={};
  runInNewContext(preload,{location:{pathname,search:setup},URLSearchParams,sessionStorage:{getItem:()=>read},document:{documentElement:{dataset},head:{append:link=>links.push(link)},createElement:()=>({})}});
  assert.equal(links.length,expected);
  if(expected){assert.match(dataset.welcomePortrait,/^[0-3]$/);assert.equal(links[0].media,'(max-width: 640px)');assert.equal(links[1].media,'(min-width: 641px)');for(const link of links)assert.ok((await readFile('front/dist/'+link.href)).length<200000);}
 }
 for(const [,path]of html.matchAll(/(?:src|href)="([^" /]+\.(?:js|css))"/g)){
  const file=await readFile('front/dist/'+path);assert.deepEqual(brotliDecompressSync(await readFile('front/dist/'+path+'.br')),file);
 }
});
