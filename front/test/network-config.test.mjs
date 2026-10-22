import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,writeFile,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {loadChainConfig} from '../scripts/chain-config.mjs';
test('production build rejects test networks, missing assets and Mock; prepare has no assets',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'onhold-network-'));t.after(()=>rm(dir,{recursive:true,force:true}));const path=join(dir,'chain.json');
 const write=async v=>{await writeFile(path,JSON.stringify({protocol:'nft-staking-v4',chainId:56,mock:false,...v}));return loadChainConfig(path)};
 const prepare=await write({mode:'prepare',marketAddress:null,nftAddress:null});assert.equal(prepare.chainId,56);
 for(const v of [{chainId:1},{mock:true,mode:'prepare'},{mode:'active'},{mode:'prepare',marketAddress:'0x'+'11'.repeat(20)},{mode:'prepare',chainId:97}])await assert.rejects(write(v));
 assert.equal((await write({mode:'active',marketAddress:'0x'+'11'.repeat(20),nftAddress:'0x'+'22'.repeat(20)})).mock,false);
});
