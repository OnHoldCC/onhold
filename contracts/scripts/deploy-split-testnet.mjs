import {Contract,ContractFactory,FetchRequest,JsonRpcProvider,Wallet,Transaction,getCreateAddress,getAddress,keccak256,formatEther,parseEther,id,AbiCoder,toUtf8Bytes,ZeroAddress} from 'ethers';
import {mkdirSync,readFileSync,writeFileSync,existsSync,renameSync,statSync,openSync,writeSync,fsyncSync,closeSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve(import.meta.dirname,'../..');
const directory=resolve(process.env.ONHOLD_TESTNET_DATA_DIR||join(root,'backend/data/split-testnet-20261021'));
const rpc=process.env.ONHOLD_TESTNET_RPC_URL||'https://bsc-testnet-dataseed.bnbchain.org';
const url=new URL(rpc);if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['127.0.0.1','localhost'].includes(url.hostname)))throw Error('HTTPS RPC required');
mkdirSync(directory,{recursive:true,mode:0o700});
const keysPath=resolve(process.env.ONHOLD_TESTNET_KEYS_FILE||join(directory,'keys.json'));
if(!existsSync(keysPath))writeFileSync(keysPath,JSON.stringify({chainId:97,deployerPrivateKey:Wallet.createRandom().privateKey,verifierPrivateKey:Wallet.createRandom().privateKey}),{mode:0o600,flag:'wx'});
if(statSync(keysPath).mode&0o077)throw Error('Testnet key file must be mode 600');
const keys=JSON.parse(readFileSync(keysPath));if(keys.chainId!==97)throw Error('Testnet key chain mismatch');
const connection=new FetchRequest(rpc);connection.timeout=15000;
const provider=new JsonRpcProvider(connection,undefined,{cacheTimeout:-1});provider.pollingInterval=1000;
const deployer=new Wallet(keys.deployerPrivateKey,provider),verifier=new Wallet(keys.verifierPrivateKey);
const journalPath=join(directory,'deployment.json');
let journal=existsSync(journalPath)?JSON.parse(readFileSync(journalPath)):{chainId:97,deployer:deployer.address,steps:{}};
if(journal.chainId!==97||journal.deployer!==deployer.address)throw Error('Deployment journal mismatch');
function save(){const temporary=journalPath+'.tmp',fd=openSync(temporary,'w',0o600);try{writeSync(fd,JSON.stringify(journal,null,2));fsyncSync(fd);}finally{closeSync(fd);}renameSync(temporary,journalPath);}
const artifact=name=>JSON.parse(readFileSync(join(root,'contracts/artifacts',name+'.json')));
const deploymentBudget=parseEther(process.env.ONHOLD_TESTNET_BUDGET_BNB||'0.1');
if(deploymentBudget<=0n||deploymentBudget>parseEther('0.1'))throw Error('Invalid testnet deployment budget');
async function send(name,request){
 let step=journal.steps[name];const binding=keccak256(request.data||'0x');
 if(step&&(step.binding!==binding||Transaction.from(step.raw).to!==(request.to||null)||Transaction.from(step.raw).value!==(request.value||0n)))throw Error(`Artifact or arguments changed for ${name}; preserve this deployment and use a new test data directory`);
 if(!step){const nonce=await provider.getTransactionCount(deployer.address,'pending');const estimate=await provider.estimateGas({...request,from:deployer.address});const fees=await provider.getFeeData();const gasPrice=fees.gasPrice;
  if(!gasPrice||gasPrice>5_000_000_000n)throw Error('Testnet gas price exceeds 5 gwei');
  const gasLimit=estimate*125n/100n;
  const reserved=Object.values(journal.steps).reduce((sum,entry)=>{const tx=Transaction.from(entry.raw);return sum+tx.gasLimit*tx.gasPrice+tx.value;},0n);
  if(reserved+gasLimit*gasPrice+(request.value||0n)>deploymentBudget)throw Error('Testnet deployment budget exceeded');
  if(await provider.getBalance(deployer.address)<gasLimit*gasPrice+(request.value||0n))throw Error('More test BNB required');
  const raw=await deployer.signTransaction({...request,nonce,gasLimit,gasPrice,type:0,chainId:97,value:request.value||0n});
  step=journal.steps[name]={binding,hash:keccak256(raw),raw,address:request.to||getCreateAddress({from:deployer.address,nonce})};save();
 }
 if(Transaction.from(step.raw).chainId!==97n)throw Error('Journal transaction chain mismatch');
 let receipt=await provider.getTransactionReceipt(step.hash);
 if(!receipt){console.log(`Broadcast ${name}: ${step.hash}`);await provider.broadcastTransaction(step.raw);receipt=await provider.waitForTransaction(step.hash,3,180000);}
 if(receipt&&await receipt.confirmations()<3)receipt=await provider.waitForTransaction(step.hash,3,180000);
 if(!receipt||receipt.status!==1)throw Error(`${name} did not confirm successfully`);
 step.block=receipt.blockNumber;save();return step;
}

const nftOnly=process.argv.includes('--nft-only');
const deploy=async(name,artifactName,args=[])=>{
 const a=artifact(artifactName);const step=await send(name,await new ContractFactory(a.abi,a.bytecode,deployer).getDeployTransaction(...args));
 return {step,contract:new Contract(step.address,a.abi,deployer)};
};
try {
 if((await provider.getNetwork()).chainId!==97n)throw Error('BNB testnet chain 97 required; refusing to sign');
 const balance=await provider.getBalance(deployer.address);
 if(!process.argv.includes('--send')){
  console.log(JSON.stringify({status:'prepared',chainId:97,deployer:deployer.address,verifier:verifier.address,balance:formatEther(balance),budgetBNB:formatEther(deploymentBudget),nftOnly,completed:Object.keys(journal.steps)}));
 }else{
  const {contract:nft,step:nftStep}=await deploy('nft','OnholdNFT',[deployer.address,verifier.address]);
  const result={chainId:97,architecture:'fixed-assets-upgradeable-gameplay-v1',nftAddress:await nft.getAddress(),nftFromBlock:nftStep.block,marketAddress:await nft.getAddress(),marketFromBlock:nftStep.block,protocol:'nft-staking-v4',mock:false,verifier:verifier.address,deployer:deployer.address};
  if(await nft.verifier()!==verifier.address||await nft.owner()!==deployer.address)throw Error('NFT configuration mismatch');
  if(!nftOnly){
   const {contract:portal}=await deploy('portal','MockSwapPortal');
   const {contract:token}=await deploy('token','MockClaudeToken',[deployer.address,await portal.getAddress()]);
   await send('portalToken',await portal.initialize.populateTransaction(await token.getAddress()));
   const {contract:implementation}=await deploy('implementation','MockGameplayVault',[await portal.getAddress()]);
   const data=implementation.interface.encodeFunctionData('initialize',[deployer.address,await nft.getAddress(),await token.getAddress()]);
   const {step:proxy}=await deploy('proxy','ERC1967Proxy',[await implementation.getAddress(),data]);
   const vault=new Contract(proxy.address,artifact('MockGameplayVault').abi,deployer);
   await send('mockEvents',await vault.configureMockEvents.populateTransaction());
   await send('fundPool',await token.transfer.populateTransaction(proxy.address,parseEther('100000000')));
   const adKeeper=keys.adKeeperPrivateKey?new Wallet(keys.adKeeperPrivateKey):deployer;
   await send('adKeeper',await vault.setAdKeeper.populateTransaction(adKeeper.address));
   const {step:burn}=await deploy('burnVault','FlapBuyback',[await token.getAddress(),deployer.address]);
   if(await vault.nft()!==await nft.getAddress()||await vault.rewardsToken()!==await token.getAddress()||await vault.owner()!==deployer.address||await token.balanceOf(proxy.address)+await vault.totalClaimed()<parseEther('100000000'))throw Error('Vault initialization verification failed');
   Object.assign(result,{marketAddress:proxy.address,marketFromBlock:nftStep.block,vaultFromBlock:proxy.block,implementationAddress:await implementation.getAddress(),tokenAddress:await token.getAddress(),mockPortalAddress:await portal.getAddress(),adKeeper:adKeeper.address,mock:true,protocol:'nft-staking-v4',flapLive:false,buybackVaultAddress:burn.address,buybackFromBlock:burn.block});
  }
  if(process.argv.includes('--exercise')&&!nftOnly){
   const nftContract=new Contract(result.nftAddress,artifact('OnholdNFT').abi,deployer),vault=new Contract(result.marketAddress,artifact('MockGameplayVault').abi,deployer),token=new Contract(result.tokenAddress,artifact('MockClaudeToken').abi,provider);
   if(!journal.exercise){journal.exercise={record:{account:'OnHold split-vault TEST ONLY',uuid:crypto.randomUUID(),bannedAt:'2026-10-21T00:00:00Z',plan:'claude_pro'},deadline:Math.floor(Date.now()/1000)+86400};save();}
   const {record,deadline}=journal.exercise,recipient=deployer.address,nullifier=id('ONHOLD:restricted-consumer-org:v1:'+record.uuid);
   const recordHash=keccak256(AbiCoder.defaultAbiCoder().encode(['bytes32','bytes32','bytes32','bytes32'],Object.values(record).map(value=>keccak256(toUtf8Bytes(value)))));
   const types={MintPass:[{name:'recipient',type:'address'},{name:'nullifier',type:'bytes32'},{name:'tier',type:'uint8'},{name:'referrer',type:'address'},{name:'deadline',type:'uint256'},{name:'recordHash',type:'bytes32'}]};
   const signature=await verifier.signTypedData({name:'ONHOLD',version:'5',chainId:97,verifyingContract:result.nftAddress},types,{recipient,nullifier,tier:1,referrer:ZeroAddress,deadline,recordHash});
   await send('exerciseMint',await nftContract.mintPass.populateTransaction(recipient,nullifier,1,ZeroAddress,deadline,record,signature));
   const uri=await nftContract.tokenURI(1);
   await send('exerciseApprove',await nftContract.approve.populateTransaction(result.marketAddress,1));
   await send('exerciseStake',await vault.stake.populateTransaction(1));
   if(!journal.steps.exerciseUnstake&&(await nftContract.ownerOf(1)!==result.marketAddress||await vault.stakerOf(1)!==recipient))throw Error('Test stake custody failed');
   const {contract:v2}=await deploy('exerciseImplementationV2','GameplayVaultV2Test',[result.mockPortalAddress]);
   await send('exerciseUpgrade',await vault.upgradeToAndCall.populateTransaction(await v2.getAddress(),'0x'));
   if(await vault.nft()!==result.nftAddress||await vault.rewardsToken()!==result.tokenAddress||await nftContract.tokenURI(1)!==uri)throw Error('Upgrade changed identity assets');
   await send('exerciseClaim',await vault.getReward.populateTransaction());
   await send('exerciseUnstake',await vault.unstake.populateTransaction(1));
   if(await nftContract.ownerOf(1)!==recipient||await vault.totalClaimed()<=0n||await token.balanceOf(recipient)<=0n)throw Error('Post-upgrade withdrawal/claim failed');
   Object.assign(result,{implementationAddress:await v2.getAddress(),exercised:true,testNftId:'1',testNftOwner:recipient,claimedTestTokens:formatEther(await vault.totalClaimed())});
  }
  if(process.argv.includes('--rebid-home')&&!nftOnly){
   const vault=new Contract(result.marketAddress,artifact('MockGameplayVault').abi,deployer);
   if(!journal.homeAd){
    const old=JSON.parse(readFileSync(join(root,'contracts/deployments/bnb-testnet.json')));
    if(old.chainId!==97||old.marketAddress===result.marketAddress)throw Error('Explicit previous testnet market required');
    const previous=new Contract(old.marketAddress,artifact('OnholdMarket').abi,provider),ad=await previous.ads(0);
    if(ad.version===0n||!ad.url.startsWith('https://'))throw Error('No previous ad to resubmit');
    journal.homeAd={url:ad.url,description:ad.description,avatar:ad.avatar,tags:Array.from(await previous.adTags(0)),value:parseEther('0.00001').toString()};save();
   }
   const ad=journal.homeAd;
   await send('homeRebid',await vault.bid.populateTransaction(0,0,ad.url,ad.description,ad.avatar,ad.tags,{value:BigInt(ad.value)}));
   result.homeRebid=journal.steps.homeRebid.hash;
  }
  if(!nftOnly){
   const slot=await provider.getStorage(result.marketAddress,'0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc');
   result.implementationAddress=getAddress('0x'+slot.slice(-40));
  }
  result.transactions=Object.fromEntries(Object.entries(journal.steps).map(([name,step])=>[name,step.hash]));
  writeFileSync(join(directory,'addresses.json'),JSON.stringify(result,null,2)+'\n');
  const destination=join(root,'contracts/deployments/bnb-testnet-split.json');writeFileSync(destination,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({status:'deployed',...result}));
 }
}catch(error){console.error('Split testnet deployment stopped:',error.shortMessage||error.message);process.exitCode=1;}finally{provider.destroy();}
