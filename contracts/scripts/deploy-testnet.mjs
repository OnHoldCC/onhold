import {Contract,ContractFactory,FetchRequest,JsonRpcProvider,Wallet,Transaction,getCreateAddress,keccak256,formatEther,parseEther,id} from 'ethers';
import {mkdirSync,readFileSync,writeFileSync,existsSync,renameSync,statSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve(import.meta.dirname,'../..');
const directory=resolve(process.env.ONHOLD_TESTNET_DATA_DIR||join(root,'backend/data/testnet'));
const rpc=process.env.ONHOLD_TESTNET_RPC_URL||'https://bsc-testnet-dataseed.bnbchain.org';
const url=new URL(rpc);if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['127.0.0.1','localhost'].includes(url.hostname)))throw Error('HTTPS RPC required');
mkdirSync(directory,{recursive:true,mode:0o700});
const keysPath=join(directory,'keys.json');
if(!existsSync(keysPath))writeFileSync(keysPath,JSON.stringify({chainId:97,deployerPrivateKey:Wallet.createRandom().privateKey,verifierPrivateKey:Wallet.createRandom().privateKey}),{mode:0o600,flag:'wx'});
if(statSync(keysPath).mode&0o077)throw Error('Testnet key file must be mode 600');
const keys=JSON.parse(readFileSync(keysPath));if(keys.chainId!==97)throw Error('Testnet key chain mismatch');
const connection=new FetchRequest(rpc);connection.timeout=15000;
const provider=new JsonRpcProvider(connection,undefined,{cacheTimeout:-1});provider.pollingInterval=1000;
const deployer=new Wallet(keys.deployerPrivateKey,provider),verifier=new Wallet(keys.verifierPrivateKey);
const journalPath=join(directory,'deployment.json');
let journal=existsSync(journalPath)?JSON.parse(readFileSync(journalPath)):{chainId:97,deployer:deployer.address,steps:{}};
if(journal.chainId!==97||journal.deployer!==deployer.address)throw Error('Deployment journal mismatch');
function save(){const temporary=journalPath+'.tmp';writeFileSync(temporary,JSON.stringify(journal,null,2),{mode:0o600});renameSync(temporary,journalPath);}
const artifact=name=>JSON.parse(readFileSync(join(root,'contracts/artifacts',name+'.json')));
const upgradeBuyback=process.argv.includes('--upgrade-buyback');
const mock=process.argv.includes('--mock');
const repeatUuid=process.argv.includes('--repeat-uuid');
if(repeatUuid&&!mock)throw Error('Repeat UUID is restricted to explicit Mock testnet deployments');
if(mock&&!keys.adKeeperPrivateKey){keys.adKeeperPrivateKey=Wallet.createRandom().privateKey;writeFileSync(keysPath,JSON.stringify(keys),{mode:0o600});}
const adKeeper=mock?new Wallet(keys.adKeeperPrivateKey):deployer;
async function send(name,request){
 let step=journal.steps[name];const binding=keccak256(request.data);
 if(step&&(step.binding!==binding||Transaction.from(step.raw).to!==(request.to||null)||Transaction.from(step.raw).value!==(request.value||0n)))throw Error(`Artifact or arguments changed for ${name}; preserve this deployment and use a new test data directory`);
 if(!step){const nonce=await provider.getTransactionCount(deployer.address,'pending');const estimate=await provider.estimateGas({...request,from:deployer.address});const fees=await provider.getFeeData();const gasPrice=fees.gasPrice;
  if(!gasPrice||gasPrice>5_000_000_000n)throw Error('Testnet gas price exceeds 5 gwei');
  const gasLimit=estimate*125n/100n;
  if(gasLimit*gasPrice>parseEther('0.1')||await provider.getBalance(deployer.address)<gasLimit*gasPrice+(request.value||0n))throw Error('More test BNB required');
  const raw=await deployer.signTransaction({...request,nonce,gasLimit,gasPrice,type:0,chainId:97,value:request.value||0n});
  step=journal.steps[name]={binding,hash:keccak256(raw),raw,address:request.to||getCreateAddress({from:deployer.address,nonce})};save();
 }
 if(Transaction.from(step.raw).chainId!==97n)throw Error('Journal transaction chain mismatch');
 let receipt=await provider.getTransactionReceipt(step.hash);
 if(!receipt){console.log(`Broadcast ${name}: ${step.hash}`);await provider.broadcastTransaction(step.raw);receipt=await provider.waitForTransaction(step.hash,3,180000);}
 if(!receipt||receipt.status!==1)throw Error(`${name} did not confirm successfully`);
 step.block=receipt.blockNumber;save();return step;
}
try{
 if((await provider.getNetwork()).chainId!==97n)throw Error('BNB testnet chain 97 required; refusing to sign');
 const balance=await provider.getBalance(deployer.address),fees=await provider.getFeeData();
 console.log(JSON.stringify({chainId:97,deployer:deployer.address,verifier:verifier.address,balance:formatEther(balance),gasPriceGwei:fees.gasPrice?Number(fees.gasPrice)/1e9:null}));
 const coreArtifact=artifact(repeatUuid?'RepeatUuidMockTestDeployment':mock?'MockTestDeployment':'TestDeployment'),factoryArtifact=artifact('FlapBuybackFactory'),vaultArtifact=artifact('FlapBuyback');
 const coreRequest=await new ContractFactory(coreArtifact.abi,coreArtifact.bytecode,deployer).getDeployTransaction();
 if(process.argv.includes('--status')||balance===0n){
  // eth_estimateGas may reject an unfunded sender; use zero gas price for the read-only estimate.
  const gas=await provider.estimateGas({...coreRequest,from:deployer.address,gasPrice:0});
  console.log(JSON.stringify({status:balance===0n?'needs_test_bnb':'ready',coreGas:gas.toString(),coreGasBudgetBNB:formatEther(gas*125n/100n*(fees.gasPrice||1_000_000_000n)),recommendedTestBNB:'0.1',deployedSteps:Object.keys(journal.steps)}));
 }else{
  const coreStep=upgradeBuyback?journal.steps.core:await send('core',coreRequest);
  if(!coreStep?.block)throw Error('A confirmed core deployment is required before replacing the test vault');
  const core=new Contract(coreStep.address,coreArtifact.abi,provider);
  const marketAddress=await core.market(),tokenAddress=await core.token();const market=new Contract(marketAddress,artifact('OnholdMarket').abi,provider),token=new Contract(tokenAddress,artifact('ClaudeTestToken').abi,provider);
  if(await market.PROTOCOL_ID()!==id('onhold.nft-staking.v4')||await market.rewardsDuration()!==31536000n||await market.owner()!==deployer.address||(mock?await token.totalSupply()<parseEther('100000000'):await token.totalSupply()!==parseEther('100000000'))||await token.balanceOf(marketAddress)+await market.totalClaimed()<parseEther('100000000'))throw Error('Core deployment verification failed');
  if(!upgradeBuyback){const setVerifier=await market.setVerifier.populateTransaction(verifier.address);await send('verifier',setVerifier);}
  if(await market.verifier()!==verifier.address)throw Error('Verifier binding failed');
  if(mock){await send('adKeeper',await market.setAdKeeper.populateTransaction(adKeeper.address));await send('keeperGas',{to:adKeeper.address,data:'0x',value:parseEther('0.00015')});if(await market.adKeeper()!==adKeeper.address)throw Error('Ad keeper binding failed');}
  const previous=upgradeBuyback?JSON.parse(readFileSync(join(directory,'addresses.json'))):null;
  if(previous&&(previous.chainId!==97||previous.marketAddress!==marketAddress||previous.tokenAddress!==tokenAddress||await provider.getBalance(previous.buybackVaultAddress)!==0n||await token.balanceOf(previous.buybackVaultAddress)!==0n))throw Error('Only an empty test vault can be replaced; preserve and inspect the previous deployment');
  const factoryStep=await send(upgradeBuyback?'buybackFactoryGasV2':'buybackFactory',await new ContractFactory(factoryArtifact.abi,factoryArtifact.bytecode,deployer).getDeployTransaction(deployer.address));
  const vaultStep=await send(upgradeBuyback?'standaloneBuybackGasV2':'standaloneBuyback',await new ContractFactory(vaultArtifact.abi,vaultArtifact.bytecode,deployer).getDeployTransaction(tokenAddress,deployer.address));
  const vault=new Contract(vaultStep.address,vaultArtifact.abi,provider);
  if(await vault.MIN_BUYBACK_BALANCE()!==parseEther('0.001')||await vault.MAX_KEEPER_GAS_REFUND()!==parseEther('0.0001'))throw Error('Buyback policy verification failed');
  if(repeatUuid&&!await new Contract(marketAddress,['function UUID_UNIQUENESS_DISABLED() view returns(bool)'],provider).UUID_UNIQUENESS_DISABLED())throw Error('Repeat UUID marker missing');
  const rendererAddress=await market.renderer();for(const address of [marketAddress,tokenAddress,rendererAddress,factoryStep.address,vaultStep.address])if(await provider.getCode(address)==='0x')throw Error('Missing deployed bytecode');
  const result={chainId:97,protocol:'nft-staking-v4',mock,repeatUuid,adPriceIntervalSeconds:Number(await market.adPriceInterval()),adMinimumBidBNB:formatEther(await market.minimumAdBid()),adKeeperMinimumBNB:formatEther(await market.MIN_AD_BUYBACK()),adKeeper:adKeeper.address,mockPortalAddress:mock?await core.portal():null,deployer:deployer.address,verifier:verifier.address,keeper:deployer.address,marketAddress,tokenAddress,rendererAddress,buybackFactoryAddress:factoryStep.address,buybackVaultAddress:vaultStep.address,marketFromBlock:coreStep.block,buybackFromBlock:vaultStep.block,buybackMode:'standalone-test-token',flapLive:false,transactions:Object.fromEntries(Object.entries(journal.steps).map(([name,step])=>[name,step.hash]))};
  result.buybackMinimumBNB='0.001';result.maxKeeperGasRefundBNB='0.0001';
  result.previousBuybackVaults=previous?.previousBuybackVaults||[];
  if(previous&&previous.buybackVaultAddress!==vaultStep.address)result.previousBuybackVaults.push({vault:previous.buybackVaultAddress,factory:previous.buybackFactoryAddress,fromBlock:previous.buybackFromBlock});
  writeFileSync(join(directory,'addresses.json'),JSON.stringify(result,null,2));
  if(directory===join(root,'backend/data/testnet')||process.argv.includes('--activate')){
   const publicPath=join(root,'contracts/deployments/bnb-testnet.json');mkdirSync(join(root,'contracts/deployments'),{recursive:true});
   if(existsSync(publicPath)){const old=JSON.parse(readFileSync(publicPath));if(old.marketAddress!==marketAddress){const archive=join(root,`contracts/deployments/bnb-testnet-${old.marketAddress}.json`);if(!existsSync(archive))writeFileSync(archive,JSON.stringify(old,null,2));}}
   writeFileSync(publicPath,JSON.stringify(result,null,2));
   writeFileSync(join(root,'front/src/chain-config.json'),JSON.stringify({chainId:97,protocol:'nft-staking-v4',marketAddress,mock})+'\n');
   writeFileSync(join(root,'backend/data/testnet/active.json'),JSON.stringify({directory})+'\n',{mode:0o600});
   const manifestPath=join(root,'rainbond.app.json'),manifest=JSON.parse(readFileSync(manifestPath));const api=manifest.components.find(c=>c.name==='api');if(api)Object.assign(api.env,{ONHOLD_MARKET_ADDRESS:marketAddress,ONHOLD_MARKET_FROM_BLOCK:String(coreStep.block),ONHOLD_BUYBACK_VAULT:vaultStep.address,ONHOLD_BUYBACK_FROM_BLOCK:String(vaultStep.block),ONHOLD_BUYBACK_FLAP_LIVE:'false'});writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
  }
  console.log(JSON.stringify({status:'deployed',...result}));
 }
}catch(error){console.error('Testnet deployment stopped:',error.shortMessage||error.message);process.exitCode=1;}finally{provider.destroy();}
