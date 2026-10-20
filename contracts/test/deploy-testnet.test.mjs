import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {once} from 'node:events';import {createServer} from 'node:net';import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {setTimeout as delay} from 'node:timers/promises';import {JsonRpcProvider,Contract,Wallet} from 'ethers';
async function run(env,args=[]){const process=spawn('node',['contracts/scripts/deploy-testnet.mjs',...args],{env,stdio:['ignore','pipe','pipe']});let output='';process.stdout.on('data',data=>output+=data);process.stderr.on('data',data=>output+=data);const [code]=await once(process,'exit');assert.equal(code,0,output);return output;}
test('testnet deploy script journals transactions, checks funding and resumes without redeploying',{timeout:110000},async()=>{
 const reservation=createServer();reservation.listen(0,'127.0.0.1');await once(reservation,'listening');const port=reservation.address().port;await new Promise(r=>reservation.close(r));
 const directory=await mkdtemp(join(tmpdir(),'onhold-deploy-test-'));const anvil=spawn('anvil',['--host','127.0.0.1','--port',String(port),'--chain-id','97','--block-time','1','--silent'],{stdio:'ignore'});const provider=new JsonRpcProvider(`http://127.0.0.1:${port}`,97,{cacheTimeout:-1});
 try{for(let i=0;i<60;i++){try{await provider.getBlockNumber();break;}catch{await delay(100);}}
  const key='0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';await writeFile(join(directory,'keys.json'),JSON.stringify({chainId:97,deployerPrivateKey:key,verifierPrivateKey:Wallet.createRandom().privateKey}),{mode:0o600});
  const env={...process.env,ONHOLD_TESTNET_RPC_URL:`http://127.0.0.1:${port}`,ONHOLD_TESTNET_DATA_DIR:directory};
  const dry=await run(env,['--status']);assert.match(dry,/"status":"ready"/);assert.equal(await provider.getTransactionCount(new Wallet(key).address),0);
  await run(env);const result=JSON.parse(await readFile(join(directory,'addresses.json')));assert.equal(result.chainId,97);assert.equal(result.flapLive,false);assert.equal(Object.keys(result.transactions).length,4);
  const artifact=JSON.parse(await readFile('contracts/artifacts/OnholdMarket.json'));const market=new Contract(result.marketAddress,artifact.abi,provider);assert.equal(await market.verifier(),result.verifier);
  for(const field of ['marketAddress','tokenAddress','rendererAddress','buybackFactoryAddress','buybackVaultAddress'])assert.notEqual(await provider.getCode(result[field]),'0x');
  const nonce=await provider.getTransactionCount(result.deployer);await run(env);assert.equal(await provider.getTransactionCount(result.deployer),nonce);
  await run(env,['--upgrade-buyback']);const upgraded=JSON.parse(await readFile(join(directory,'addresses.json')));assert.equal(upgraded.marketAddress,result.marketAddress);assert.notEqual(upgraded.buybackVaultAddress,result.buybackVaultAddress);assert.equal(upgraded.previousBuybackVaults.length,1);
  const upgradedNonce=await provider.getTransactionCount(result.deployer);await run(env,['--upgrade-buyback']);assert.equal(await provider.getTransactionCount(result.deployer),upgradedNonce);assert.equal(JSON.parse(await readFile(join(directory,'addresses.json'))).previousBuybackVaults.length,1);
  const mockDirectory=await mkdtemp(join(directory,'mock-'));
  await writeFile(join(mockDirectory,'keys.json'),await readFile(join(directory,'keys.json')),{mode:0o600});
  const mockEnv={...env,ONHOLD_TESTNET_DATA_DIR:mockDirectory};await run(mockEnv,['--mock']);
  const mocked=JSON.parse(await readFile(join(mockDirectory,'addresses.json')));
  assert.equal(mocked.mock,true);assert.equal(mocked.protocol,'nft-staking-v4');assert.equal(Object.keys(mocked.transactions).length,6);
  const mockMarket=new Contract(mocked.marketAddress,artifact.abi,provider);
  assert.equal(await mockMarket.adKeeper(),mocked.adKeeper);assert.equal(await mockMarket.minimumAdBid(),100000000000000n);
  assert.equal(await mockMarket.adBuybackPortal(),mocked.mockPortalAddress);
  const portalArtifact=JSON.parse(await readFile('contracts/artifacts/MockSwapPortal.json'));
  const mockPortal=new Contract(mocked.mockPortalAddress,portalArtifact.abi,provider);
  assert.equal(await mockPortal.MOCK_ONLY(),true);assert.equal(await mockPortal.token(),mocked.tokenAddress);
  const mockNonce=await provider.getTransactionCount(result.deployer);await run(mockEnv,['--mock']);assert.equal(await provider.getTransactionCount(result.deployer),mockNonce);

 }finally{provider.destroy();anvil.kill('SIGTERM');await once(anvil,'exit');await rm(directory,{recursive:true,force:true});}
});
