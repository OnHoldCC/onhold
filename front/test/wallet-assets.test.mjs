import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {assetCopy} from '../src/asset-copy.mjs';

test('wallet asset import uses the build network, validates NFT ownership and never requests a transaction',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'onhold-wallet-assets-'));
 try{for(const chainId of [56,97]){
  const out=join(directory,`assets-${chainId}.mjs`);
  await build({stdin:{contents:"export * from './front/src/wallet-assets.mjs';export {setActiveInjectedWallet} from './front/components/singlespark/runtime/injected.mjs';",resolveDir:resolve('.')},outfile:out,bundle:true,platform:'browser',format:'esm',plugins:[{name:'fixture',setup(p){p.onLoad({filter:/[/\\]src[/\\]chain-config\.json$/},()=>({contents:JSON.stringify({chainId,mock:chainId===97,nftAddress:chainId===56?'0x930aebB5F91cdB219fE8C5178906e2e21a105E87':'0xe6FCaf7da63c581afc22B27D0aCf27eB26645A1f'}),loader:'json'}));}}]});
  const {addWalletAsset,assets,nftAddress,setActiveInjectedWallet}=await import(pathToFileURL(out));
  const address='0x'+'1'.repeat(40),calls=[];let current=chainId===56?'0x61':'0x38',owner=address,added=true;
  const provider={request:async request=>{calls.push(request);switch(request.method){case 'eth_chainId':return current;case 'wallet_switchEthereumChain':current=request.params[0].chainId;return null;case 'eth_accounts':return [address];case 'eth_call':assert.equal(request.params[0].to,nftAddress);return '0x'+'0'.repeat(24)+owner.slice(2);case 'wallet_watchAsset':return added;default:throw Error('Unexpected method '+request.method);}}};
  setActiveInjectedWallet({provider,kind:'MetaMask'});
  assert.equal(await addWalletAsset('ERC20',address),true);
  assert.equal(Number(current),chainId);assert.equal(calls[0].method,'eth_chainId');
  assert.deepEqual(calls.at(-1),{method:'wallet_watchAsset',params:{type:'ERC20',options:{address:assets.tokenAddress,symbol:'OnHold',decimals:18}}});
  assert.equal(await addWalletAsset('ERC721',address,'2'),true);assert.deepEqual(calls.at(-1).params,{type:'ERC721',options:{address:nftAddress,tokenId:'2'}});
  owner='0x'+'2'.repeat(40);const watches=()=>calls.filter(c=>c.method==='wallet_watchAsset').length,before=watches();
  await assert.rejects(addWalletAsset('ERC721',address,'1'),/assetNotOwned/);assert.equal(watches(),before);
  for(const value of ['', '0','-1','2.5','1e3',(2n**256n).toString()])await assert.rejects(addWalletAsset('ERC721',address,value),/assetInvalidId/);
  added=false;assert.equal(await addWalletAsset('ERC20',address),false);
  const request=provider.request;provider.request=async args=>{if(args.method==='eth_accounts')return [owner];return request(args);};
  await assert.rejects(addWalletAsset('ERC20',address),/walletChanged/);
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
