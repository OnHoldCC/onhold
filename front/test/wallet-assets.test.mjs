import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {assetCopy} from '../src/asset-copy.mjs';
import {execFileSync} from 'node:child_process';

test('token import uses the build network, validates the wallet and never requests a transaction',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'onhold-wallet-assets-'));
 try{for(const chainId of [56,97]){
  const out=join(directory,`assets-${chainId}.mjs`);
  await build({stdin:{contents:"export * from './front/src/wallet-assets.mjs';export {setActiveInjectedWallet} from './front/components/singlespark/runtime/injected.mjs';",resolveDir:resolve('.')},outfile:out,bundle:true,platform:'browser',format:'esm',plugins:[{name:'fixture',setup(p){p.onLoad({filter:/[/\\]src[/\\]chain-config\.json$/},()=>({contents:JSON.stringify({chainId,mock:chainId===97,nftAddress:chainId===56?'0x930aebB5F91cdB219fE8C5178906e2e21a105E87':'0xe6FCaf7da63c581afc22B27D0aCf27eB26645A1f'}),loader:'json'}));}}]});
  const {addWalletToken,assets,setActiveInjectedWallet}=await import(pathToFileURL(out));
  const address='0x'+'1'.repeat(40),owner='0x'+'2'.repeat(40),calls=[];let current=chainId===56?'0x61':'0x38',added=true;
  const provider={request:async request=>{calls.push(request);switch(request.method){case 'eth_chainId':return current;case 'wallet_switchEthereumChain':current=request.params[0].chainId;return null;case 'eth_accounts':return [address];case 'wallet_watchAsset':return added;default:throw Error('Unexpected method '+request.method);}}};
  setActiveInjectedWallet({provider,kind:'MetaMask'});
  assert.equal(await addWalletToken(address),true);
  assert.equal(Number(current),chainId);assert.equal(calls[0].method,'eth_chainId');
  assert.deepEqual(calls.at(-1),{method:'wallet_watchAsset',params:{type:'ERC20',options:{address:assets.tokenAddress,symbol:'OnHold',decimals:18}}});
  await assert.rejects(addWalletToken('bad'),/walletMissing/);
  added=false;assert.equal(await addWalletToken(address),false);
  const request=provider.request;provider.request=async args=>{if(args.method==='eth_accounts')return [owner];return request(args);};
  await assert.rejects(addWalletToken(address),/walletChanged/);
  assert.ok(calls.every(c=>!c.method.includes('sendTransaction')&&!c.method.includes('sign')));
 }}finally{await rm(directory,{recursive:true,force:true});}
});

test('published contracts match deployment records and asset copy covers all eight languages',async()=>{
 const catalog=JSON.parse(await readFile('config/public-contracts.json'));
 for(const [chainId,file] of [[56,'bnb-mainnet-gameplay-20261022.json'],[97,'bnb-testnet-split.json']]){
  const manifest=JSON.parse(await readFile('contracts/deployments/'+file));const entries=Object.fromEntries(catalog[chainId].contracts);
  for(const [label,key]of [['token','tokenAddress'],['nft','nftAddress'],['gameplay','marketAddress'],['implementation','implementationAddress']])assert.equal(entries[label],manifest[key]);
  for(const [label,address]of catalog[chainId].contracts){assert.match(address,/^0x[0-9a-fA-F]{40}$/);for(const copy of Object.values(assetCopy))assert.ok(copy['asset.'+label]);}
 }
 assert.equal(Object.keys(assetCopy).length,8);for(const copy of Object.values(assetCopy))for(const key of Object.keys(assetCopy.en))assert.ok(copy[key]);
});

test('contract footer retains NFT addresses without an NFT import button or dialog',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'onhold-contract-footer-'));
 try{
 const outfile=join(directory,'render.mjs');
 await build({stdin:{resolveDir:resolve('front'),contents:`
  import React from 'react';import{renderToStaticMarkup}from'react-dom/server';import{ContractAssets}from'./components/onhold/ContractAssets.jsx';
  import{translate}from'./src/i18n.mjs';
  console.log(JSON.stringify(['en','zh'].map(lang=>renderToStaticMarkup(React.createElement(ContractAssets,{wallet:{address:'',connect:()=>{}},t:key=>translate(lang,key)})))));
 `},outfile,bundle:true,platform:'node',format:'esm',logLevel:'silent',loader:{'.css':'empty','.svg':'dataurl','.png':'dataurl','.webp':'dataurl'},banner:{js:"import{createRequire}from'node:module';const require=createRequire(import.meta.url);"}});
 const html=JSON.parse(execFileSync(process.execPath,[outfile],{encoding:'utf8'}));
 for(const markup of html){assert.equal((markup.match(/<button\b/g)||[]).length,1);assert.match(markup,/ERC-721/);assert.doesNotMatch(markup,/Add NFT to wallet|添加 NFT 到钱包|role="dialog"|NFT Token ID/);}
 }finally{await rm(directory,{recursive:true,force:true});}
});
