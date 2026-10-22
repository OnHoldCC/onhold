import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

test('wallet and transaction messages use the actual build network in every locale',async()=>{
 for(const chainId of [56,97]){
  const result=await build({stdin:{contents:`import {translate,supportedLocales} from './i18n.mjs';console.log(JSON.stringify(Object.fromEntries(supportedLocales.map(lang=>[lang,Object.fromEntries(['walletBNB','walletOther','switchWalletNetwork','chainConnected','api.wrong_chain'].map(key=>[key,translate(lang,key)]))]))));`,resolveDir:resolve('front/src')},bundle:true,platform:'node',format:'cjs',write:false,plugins:[{name:'network-fixture',setup(p){p.onLoad({filter:/[/\\]src[/\\]chain-config\.json$/},()=>({contents:JSON.stringify({chainId,mock:chainId===97}),loader:'json'}));}}]});
  const messages=JSON.parse(execFileSync(process.execPath,[],{input:result.outputFiles[0].text,encoding:'utf8'}));
  for(const copy of Object.values(messages))for(const text of Object.values(copy)){assert.match(text,new RegExp(chainId===56?'BNB Mainnet \\(56\\)':'BNB Testnet \\(97\\)'));assert.doesNotMatch(text,/\{network\}/);if(chainId===56)assert.doesNotMatch(text,/testnet|测试网|テストネット|테스트넷/i);}
 }
});
