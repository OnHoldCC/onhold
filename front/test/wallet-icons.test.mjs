import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
test('SingleSpark wallet button and connected status display supplied wallet brand instead of the generic icon',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'onhold-wallet-icons-'));
 try{
  const out=join(dir,'render.mjs');
  await build({stdin:{resolveDir:resolve('front'),contents:`import React from 'react';import {renderToStaticMarkup as render} from 'react-dom/server';import {OnHoldWalletButton as SingleSparkWalletButton,OnHoldWalletStatus as SingleSparkWalletStatus} from '@onhold/ui/core';const icon=React.createElement('img',{src:'okx-test.svg',alt:'OKX Wallet'});console.log(JSON.stringify({button:render(React.createElement(SingleSparkWalletButton,{address:'0x2222222222222222222222222222222222222222',walletIcon:icon})),status:render(React.createElement(SingleSparkWalletStatus,{status:'connected',wallet:'OKX Wallet',walletIcon:icon})),fallback:render(React.createElement(SingleSparkWalletButton))}));`},outfile:out,bundle:true,format:'esm',platform:'node',logLevel:'silent',banner:{js:"import {createRequire} from 'node:module';const require=createRequire(import.meta.url);"}});
  const html=JSON.parse(execFileSync(process.execPath,[out],{encoding:'utf8'}));
  for(const name of ['button','status']){assert.match(html[name],/okx-test.svg/);assert.doesNotMatch(html[name],/<svg/);}
  assert.match(html.fallback,/<svg/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
