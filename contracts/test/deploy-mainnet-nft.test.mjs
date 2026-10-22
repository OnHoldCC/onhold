import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createServer} from 'node:net';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {Contract,JsonRpcProvider,Wallet} from 'ethers';

async function run(env,args=[]){
 const child=spawn(process.execPath,['contracts/scripts/deploy-mainnet-nft.mjs',...args],{env,stdio:['ignore','pipe','pipe']});
 let output='';child.stdout.on('data',x=>output+=x);child.stderr.on('data',x=>output+=x);
 const [code]=await once(child,'exit');return {code,output};
}
test('mainnet NFT deployment checks roles and network, journals once and resumes safely',{timeout:65000},async()=>{
 const reservation=createServer();reservation.listen(0,'127.0.0.1');await once(reservation,'listening');const port=reservation.address().port;await new Promise(r=>reservation.close(r));
 const directory=await mkdtemp(join(tmpdir(),'onhold-mainnet-nft-'));
 const node=spawn('anvil',['--host','127.0.0.1','--port',String(port),'--chain-id','56','--gas-price','50000000','--base-fee','0','--block-time','1','--silent'],{stdio:'ignore'});
 const rpc=`http://127.0.0.1:${port}`,provider=new JsonRpcProvider(rpc,undefined,{cacheTimeout:-1});
 try{
  for(let i=0;i<50;i++){try{await provider.getBlockNumber();break;}catch{await delay(100);}}
  const deployer=new Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'),verifier=Wallet.createRandom();
  const keys={chainId:56,deployerPrivateKey:deployer.privateKey,deployerAddress:deployer.address,ownerAddress:deployer.address,keeperPrivateKey:deployer.privateKey,keeperAddress:deployer.address,verifierPrivateKey:verifier.privateKey,verifierAddress:verifier.address};
  const env={...process.env,ONHOLD_MAINNET_RPC_URL:rpc,ONHOLD_MAINNET_DATA_DIR:directory,ONHOLD_MAINNET_NFT_BUDGET_BNB:'0.02'};
  const keyPath=join(directory,'keys.json');await writeFile(keyPath,JSON.stringify(keys),{mode:0o600});
  let result=await run(env);assert.equal(result.code,0,result.output);assert.match(result.output,/"status":"ready"/);assert.equal(await provider.getTransactionCount(deployer.address),0);
  result=await run(env,['--send']);assert.equal(result.code,0,result.output);
  const addresses=JSON.parse(await readFile(join(directory,'nft-addresses.json')));
  const artifact=JSON.parse(await readFile('contracts/artifacts/OnholdNFT.json'));
  const nft=new Contract(addresses.nftAddress,artifact.abi,provider);
  assert.equal(await nft.owner(),deployer.address);assert.equal(await nft.verifier(),verifier.address);assert.equal(await nft.totalMinted(),0n);
  const nonce=await provider.getTransactionCount(deployer.address);
  result=await run(env,['--send']);assert.equal(result.code,0,result.output);assert.equal(await provider.getTransactionCount(deployer.address),nonce);
  const replacement=Wallet.createRandom();await writeFile(keyPath,JSON.stringify({...keys,verifierAddress:replacement.address,verifierPrivateKey:replacement.privateKey}));
  result=await run(env,['--send']);assert.notEqual(result.code,0);assert.match(result.output,/does not match/);assert.equal(await provider.getTransactionCount(deployer.address),nonce);
  await writeFile(keyPath,JSON.stringify({...keys,chainId:97}));result=await run(env,['--send']);assert.notEqual(result.code,0);assert.match(result.output,/chain mismatch/);
 }finally{provider.destroy();node.kill('SIGTERM');await once(node,'exit');await rm(directory,{recursive:true,force:true});}
});
