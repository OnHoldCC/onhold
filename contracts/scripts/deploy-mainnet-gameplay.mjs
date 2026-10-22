import {Contract,ContractFactory,FetchRequest,JsonRpcProvider,Transaction,Wallet,formatEther,getAddress,getCreateAddress,id,keccak256,parseEther} from 'ethers';
import {closeSync,existsSync,fsyncSync,mkdirSync,openSync,readFileSync,renameSync,statSync,unlinkSync,writeSync} from 'node:fs';
import {join,resolve} from 'node:path';

const root=resolve(import.meta.dirname,'../..'),directory=resolve(process.env.ONHOLD_MAINNET_DATA_DIR||join(root,'backend/data/mainnet'));
const rpc=process.env.ONHOLD_MAINNET_RPC_URL||'https://bsc-dataseed.bnbchain.org',url=new URL(rpc);
if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['127.0.0.1','localhost'].includes(url.hostname)))throw Error('HTTPS RPC required');
mkdirSync(directory,{recursive:true,mode:0o700});
const keyPath=join(directory,'keys.json');if(statSync(keyPath).mode&0o077)throw Error('Mainnet keys must be mode 600');
const keys=JSON.parse(readFileSync(keyPath));if(keys.chainId!==56)throw Error('Mainnet key chain mismatch');
const nftManifest=JSON.parse(readFileSync(process.env.ONHOLD_MAINNET_NFT_MANIFEST||join(root,'contracts/deployments/bnb-mainnet-nft-20261022.json')));
const tokenManifest=JSON.parse(readFileSync(process.env.ONHOLD_MAINNET_TOKEN_MANIFEST||join(root,'contracts/deployments/bnb-mainnet-token-20261022.json')));
if(nftManifest.chainId!==56||tokenManifest.chainId!==56)throw Error('Mainnet assets required');
const nft=getAddress(nftManifest.nftAddress),token=getAddress(tokenManifest.tokenAddress),keeper=getAddress(process.env.ONHOLD_MAINNET_AD_KEEPER);
const connection=new FetchRequest(rpc);connection.timeout=15000;
const provider=new JsonRpcProvider(connection,undefined,{cacheTimeout:-1,batchMaxCount:1});provider.pollingInterval=1000;
const owner=new Wallet(keys.deployerPrivateKey,provider);
if(owner.address!==keys.deployerAddress||owner.address!==keys.ownerAddress||keeper===owner.address)throw Error('Owner and dedicated ad keeper required');
const sending=process.argv.includes('--send');if(process.argv.slice(2).some(arg=>arg!=='--send'))throw Error('Only --send is supported; this script never funds the reward pool');
const budget=parseEther(process.env.ONHOLD_MAINNET_GAMEPLAY_BUDGET_BNB||'0.005');if(budget<=0n||budget>parseEther('0.02'))throw Error('Invalid deployment budget');
const journalPath=join(directory,'gameplay-deployment.json'),lockPath=journalPath+'.lock';let lock;
const artifact=name=>JSON.parse(readFileSync(join(root,'contracts/artifacts',name+'.json')));
function save(path,value){const tmp=path+'.tmp',fd=openSync(tmp,'w',0o600);try{writeSync(fd,JSON.stringify(value,null,2)+'\n');fsyncSync(fd);}finally{closeSync(fd);}renameSync(tmp,path);}
try{
 if((await provider.getNetwork()).chainId!==56n)throw Error('BNB mainnet chain 56 required');
 const identity=new Contract(nft,artifact('OnholdNFT').abi,provider),coin=new Contract(token,['function decimals() view returns(uint8)'],provider);
 if(await identity.PROTOCOL_ID()!==id('onhold.nft.v1')||await identity.owner()!==owner.address||await coin.decimals()!==18n||await provider.getCode(token)==='0x')throw Error('Mainnet asset validation failed');
 if(sending){lock=openSync(lockPath,'wx',0o600);writeSync(lock,String(process.pid));fsyncSync(lock);}
 if(existsSync(journalPath)&&(statSync(journalPath).mode&0o077))throw Error('Mainnet journal must be mode 600');
 const journal=existsSync(journalPath)?JSON.parse(readFileSync(journalPath)):{chainId:56,owner:owner.address,nft,token,keeper,steps:{}};
 if(journal.chainId!==56||journal.owner!==owner.address||journal.nft!==nft||journal.token!==token||journal.keeper!==keeper)throw Error('Deployment journal asset/role mismatch');
 const implementation=artifact('OnholdGameplayVault'),proxy=artifact('ERC1967Proxy');
 async function send(name,request){
  let step=journal.steps[name];const binding=keccak256(request.data||'0x');
  if(step){const tx=Transaction.from(step.raw);if(step.binding!==binding||tx.data!==(request.data||'0x')||tx.to!==(request.to||null)||tx.value!==(request.value||0n)||tx.chainId!==56n||tx.from!==owner.address||tx.hash!==step.hash||tx.gasPrice===null||tx.gasPrice>1000000000n||tx.gasLimit*tx.gasPrice+tx.value>budget)throw Error('Saved transaction does not match '+name);}
  if(!step){
   const [nonce,pending,fees,estimate]=await Promise.all([provider.getTransactionCount(owner.address,'latest'),provider.getTransactionCount(owner.address,'pending'),provider.getFeeData(),provider.estimateGas({...request,from:owner.address,gasPrice:0})]);
   if(nonce!==pending)throw Error('Pending owner transactions must finish before deployment');
   if(!fees.gasPrice||fees.gasPrice>1000000000n)throw Error('Gas price unavailable or above 1 gwei');
   const gasLimit=estimate*125n/100n;
   const reserved=Object.values(journal.steps).reduce((sum,s)=>{const tx=Transaction.from(s.raw);return sum+tx.gasLimit*tx.gasPrice+tx.value;},0n);
   if(reserved+gasLimit*fees.gasPrice+(request.value||0n)>budget)throw Error('Deployment budget exceeded');
   if(await provider.getBalance(owner.address)<gasLimit*fees.gasPrice+(request.value||0n))throw Error('Insufficient deployment gas');
   const raw=await owner.signTransaction({...request,nonce,gasLimit,gasPrice:fees.gasPrice,type:0,chainId:56,value:request.value||0n});
   step=journal.steps[name]={binding,raw,hash:keccak256(raw),address:request.to||getCreateAddress({from:owner.address,nonce})};save(journalPath,journal);
  }
  let receipt=await provider.getTransactionReceipt(step.hash);
  if(!receipt){
   if(!await provider.getTransaction(step.hash)){if(await provider.getTransactionCount(owner.address,'latest')>Transaction.from(step.raw).nonce)throw Error('Saved transaction nonce was consumed');await provider.broadcastTransaction(step.raw);}
   console.log(JSON.stringify({status:'waiting_confirmations',step:name,hash:step.hash}));receipt=await provider.waitForTransaction(step.hash,3,180000);
  }
  if(receipt&&await receipt.confirmations()<3)receipt=await provider.waitForTransaction(step.hash,3,180000);
  if(!receipt||receipt.status!==1||(!request.to&&receipt.contractAddress!==step.address))throw Error(name+' did not confirm successfully');
  step.block=receipt.blockNumber;save(journalPath,journal);return step;
 }
 const request=await new ContractFactory(implementation.abi,implementation.bytecode,owner).getDeployTransaction();
 if(!sending){
  const [balance,fees,gas]=await Promise.all([provider.getBalance(owner.address),provider.getFeeData(),provider.estimateGas({...request,from:owner.address,gasPrice:0})]);
  console.log(JSON.stringify({status:'prepared',chainId:56,owner:owner.address,keeper,nft,token,balanceBNB:formatEther(balance),implementationGas:gas.toString(),budgetBNB:formatEther(budget),rewardTokensToTransfer:'0',completed:Object.keys(journal.steps)}));
 }else{
  const impl=await send('implementation',request);
  const factory=new ContractFactory(proxy.abi,proxy.bytecode,owner),iface=new Contract(impl.address,implementation.abi,owner);
  const data=iface.interface.encodeFunctionData('initialize',[owner.address,nft,token]);
  const deployed=await send('proxy',await factory.getDeployTransaction(impl.address,data));
  const vault=new Contract(deployed.address,implementation.abi,owner);
  await send('adKeeper',await vault.setAdKeeper.populateTransaction(keeper));
  if(await vault.owner()!==owner.address||await vault.nft()!==nft||await vault.rewardsToken()!==token||await vault.adKeeper()!==keeper||await vault.PROTOCOL_ID()!==id('onhold.gameplay.v1'))throw Error('Gameplay verification failed');
  const result={chainId:56,marketAddress:deployed.address,marketFromBlock:nftManifest.nftFromBlock,gameplayFromBlock:deployed.block,nftAddress:nft,tokenAddress:token,implementationAddress:impl.address,owner:owner.address,adKeeper:keeper,mock:false,rewardTokensTransferred:'0',transactions:Object.fromEntries(Object.entries(journal.steps).map(([k,s])=>[k,s.hash])),verifiedAt:new Date().toISOString()};
  save(join(directory,'gameplay-addresses.json'),result);console.log(JSON.stringify({status:'deployed_unfunded',...result}));
 }
}catch(error){console.error('Mainnet gameplay deployment stopped:',error.shortMessage||error.message);process.exitCode=1;}
finally{if(lock!==undefined){closeSync(lock);unlinkSync(lockPath);}provider.destroy();}
