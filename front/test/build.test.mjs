import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile,readdir} from 'node:fs/promises';
import {brotliDecompressSync} from 'node:zlib';

test('initial module graph excludes wallet providers and deployment bytecode; hashed chunks preload and compress correctly',async()=>{
 execFileSync(process.execPath,['front/scripts/build.mjs'],{stdio:'pipe'});
 const metrics=JSON.parse(await readFile('/tmp/onhold-front-performance.json','utf8'));
 assert.ok(metrics.initialJsBytes<800000,`Initial JS grew to ${metrics.initialJsBytes}`);
 for(const path of metrics.eager)for(const input of Object.keys(metrics.outputs[path].inputs))assert.doesNotMatch(input,/ethers\/.*\/providers\/|contracts\/artifacts\/|nft-artwork\.mjs|\/Docs\.jsx$/);
 assert.deepEqual((await readdir('front/dist')).filter(name=>name.endsWith('.html')),['index.html']);
 const html=await readFile('front/dist/index.html','utf8');assert.match(html,/rel="modulepreload"/);
 for(const [,path]of html.matchAll(/(?:src|href)="([^" /]+\.(?:js|css))"/g)){
  const file=await readFile('front/dist/'+path);assert.deepEqual(brotliDecompressSync(await readFile('front/dist/'+path+'.br')),file);
 }
});
