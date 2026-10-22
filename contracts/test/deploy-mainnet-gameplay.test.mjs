import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createServer} from 'node:net';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {Contract,ContractFactory,JsonRpcProvider,Wallet,parseEther} from 'ethers';
import solc from 'solc';

const artifact=async name=>JSON.parse(await readFile('contracts/artifacts/'+name+'.json'));
async function run(env,args=[]){
 const child=spawn(process.execPath,['contracts/scripts/deploy-mainnet-gameplay.mjs',...args],{env,stdio:['ignore','pipe','pipe']});
 let output='';child.stdout.on('data',x=>output+=x);child.stderr.on('data',x=>output+=x);
 const [code]=await once(child,'exit');return {code,output};
}
test('mainnet gameplay initializes atomically, resumes without duplicate transactions and never funds rewards',{timeout:65000},async()=>{
 const reservation=createServer();reservation.listen(0,'127.0.0.1');await once(reservation,'listening');const port=reservation.address().port;await new Promise(r=>reservation.close(r));
 const directory=await mkdtemp(join(tmpdir(),'onhold-mainnet-gameplay-'));
 const node=spawn('anvil',['--host','127.0.0.1','--port',String(port),'--chain-id','56','--gas-price','50000000','--base-fee','0','--block-time','1','--silent'],{stdio:'ignore'});
 const rpc=`http://127.0.0.1:${port}`,provider=new JsonRpcProvider(rpc,undefined,{cacheTimeout:-1});provider.pollingInterval=100;
 try{
  for(let i=0;i<50;i++){try{await provider.getBlockNumber();break}catch{await delay(100)}}
  const owner=await provider.getSigner(0),address=await owner.getAddress(),keeper=Wallet.createRandom(),verifier=Wallet.createRandom();
  const a=await artifact('OnholdNFT'),nft=await new ContractFactory(a.abi,a.bytecode,owner).deploy(address,verifier.address);const nftReceipt=await nft.deploymentTransaction().wait();
  const source='pragma solidity ^0.8.24; import "@openzeppelin/contracts/token/ERC20/ERC20.sol"; contract PoolToken is ERC20 {constructor(address recipient) ERC20("OnHold","OnHold"){_mint(recipient,1000000000 ether);}}';
  const compiled=JSON.parse(solc.compile(JSON.stringify({language:'Solidity',sources:{'Token.sol':{content:source}},settings:{evmVersion:'paris',outputSelection:{'*':{'*':['abi','evm.bytecode.object']}}}}),{import:path=>({contents:readFileSync('node_modules/'+path,'utf8')})}));
  const t=compiled.contracts['Token.sol'].PoolToken,token=await new ContractFactory(t.abi,'0x'+t.evm.bytecode.object,owner).deploy(address);await token.waitForDeployment();
  const keyPath=join(directory,'keys.json'),nftPath=join(directory,'nft.json'),tokenPath=join(directory,'token.json');
  const keys={chainId:56,deployerPrivateKey:'0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',deployerAddress:address,ownerAddress:address};
  await writeFile(keyPath,JSON.stringify(keys),{mode:0o600});await writeFile(nftPath,JSON.stringify({chainId:56,nftAddress:await nft.getAddress(),nftFromBlock:nftReceipt.blockNumber}));await writeFile(tokenPath,JSON.stringify({chainId:56,tokenAddress:await token.getAddress()}));
  const env={...process.env,ONHOLD_MAINNET_RPC_URL:rpc,ONHOLD_MAINNET_DATA_DIR:directory,ONHOLD_MAINNET_NFT_MANIFEST:nftPath,ONHOLD_MAINNET_TOKEN_MANIFEST:tokenPath,ONHOLD_MAINNET_AD_KEEPER:keeper.address,ONHOLD_MAINNET_GAMEPLAY_BUDGET_BNB:'0.02'};
  const before=await provider.getTransactionCount(address);let result=await run(env);assert.equal(result.code,0,result.output);assert.match(result.output,/"rewardTokensToTransfer":"0"/);assert.equal(await provider.getTransactionCount(address),before);
  result=await run(env,['--send']);assert.equal(result.code,0,result.output);
  const deployed=JSON.parse(await readFile(join(directory,'gameplay-addresses.json'))),vault=new Contract(deployed.marketAddress,(await artifact('OnholdGameplayVault')).abi,owner);
  assert.equal(await vault.owner(),address);assert.equal(await vault.adKeeper(),keeper.address);assert.equal(await vault.nft(),await nft.getAddress());assert.equal(await vault.rewardsToken(),await token.getAddress());assert.equal(await token.balanceOf(deployed.marketAddress),0n);assert.equal(await token.balanceOf(address),parseEther('1000000000'));assert.equal(await vault.miningStartedAt(),0n);
  const nonce=await provider.getTransactionCount(address);assert.equal(nonce,before+3);
  result=await run(env,['--send']);assert.equal(result.code,0,result.output);assert.equal(await provider.getTransactionCount(address),nonce);
  for(const [next,args] of [[{...env,ONHOLD_MAINNET_AD_KEEPER:Wallet.createRandom().address},['--send']],[env,['--fund']]]){result=await run(next,args);assert.notEqual(result.code,0);assert.equal(await provider.getTransactionCount(address),nonce);}
  await writeFile(keyPath,JSON.stringify({...keys,chainId:97}));result=await run(env,['--send']);assert.notEqual(result.code,0);assert.equal(await provider.getTransactionCount(address),nonce);
 }finally{provider.destroy();node.kill('SIGTERM');await once(node,'exit');await rm(directory,{recursive:true,force:true});}
});
