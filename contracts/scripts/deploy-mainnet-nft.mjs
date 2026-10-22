import {Contract,ContractFactory,FetchRequest,JsonRpcProvider,Transaction,Wallet,formatEther,getCreateAddress,id,keccak256,parseEther} from 'ethers';
import {closeSync,existsSync,fsyncSync,mkdirSync,openSync,readFileSync,renameSync,statSync,unlinkSync,writeSync} from 'node:fs';
import {join,resolve} from 'node:path';

const root=resolve(import.meta.dirname,'../..');
const directory=resolve(process.env.ONHOLD_MAINNET_DATA_DIR||join(root,'backend/data/mainnet'));
const rpc=process.env.ONHOLD_MAINNET_RPC_URL||'https://bsc-dataseed.bnbchain.org';
const url=new URL(rpc);
if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['127.0.0.1','localhost'].includes(url.hostname)))throw Error('HTTPS RPC required');
mkdirSync(directory,{recursive:true,mode:0o700});
const keyPath=join(directory,'keys.json');
if(statSync(keyPath).mode&0o077)throw Error('Mainnet keys must be mode 600');
const keys=JSON.parse(readFileSync(keyPath));
if(keys.chainId!==56)throw Error('Mainnet key chain mismatch');
const connection=new FetchRequest(rpc);connection.timeout=15000;
const provider=new JsonRpcProvider(connection,undefined,{cacheTimeout:-1});provider.pollingInterval=1000;
const deployer=new Wallet(keys.deployerPrivateKey,provider),verifier=new Wallet(keys.verifierPrivateKey);
if(deployer.address!==keys.deployerAddress||keys.ownerAddress!==deployer.address||keys.keeperAddress!==deployer.address||new Wallet(keys.keeperPrivateKey).address!==deployer.address||verifier.address!==keys.verifierAddress||verifier.address===deployer.address)throw Error('Expected owner/deployer/keeper plus separate verifier');
const send=process.argv.includes('--send');
if(process.argv.slice(2).some(arg=>arg!=='--send'))throw Error('Only --send is supported');
const budget=parseEther(process.env.ONHOLD_MAINNET_NFT_BUDGET_BNB||'0.005');
if(budget<=0n||budget>parseEther('0.02'))throw Error('NFT budget must be positive and at most 0.02 BNB');
const journalPath=join(directory,'nft-deployment.json'),lockPath=journalPath+'.lock';
let lock;
function save(path,value){const tmp=path+'.tmp',fd=openSync(tmp,'w',0o600);try{writeSync(fd,JSON.stringify(value,null,2)+'\n');fsyncSync(fd);}finally{closeSync(fd);}renameSync(tmp,path);}

try{
 if((await provider.getNetwork()).chainId!==56n)throw Error('BNB mainnet chain 56 required');
 if(send){lock=openSync(lockPath,'wx',0o600);writeSync(lock,String(process.pid));fsyncSync(lock);}
 if(existsSync(journalPath)&&(statSync(journalPath).mode&0o077))throw Error('Mainnet journal must be mode 600');
 const journal=existsSync(journalPath)?JSON.parse(readFileSync(journalPath)):{chainId:56,deployer:deployer.address};
 if(journal.chainId!==56||journal.deployer!==deployer.address)throw Error('Deployment journal mismatch');
 const artifact=JSON.parse(readFileSync(join(root,'contracts/artifacts/OnholdNFT.json')));
 const request=await new ContractFactory(artifact.abi,artifact.bytecode,deployer).getDeployTransaction(keys.ownerAddress,verifier.address);
 const binding=keccak256(request.data);
 let step=journal.nft;
 if(step){
  const tx=Transaction.from(step.raw);
  if(step.binding!==binding||tx.data!==request.data||tx.chainId!==56n||tx.from!==deployer.address||tx.to!==null||tx.value!==0n||tx.hash!==step.hash||getCreateAddress({from:deployer.address,nonce:tx.nonce})!==step.address||tx.gasPrice===null||tx.gasLimit*tx.gasPrice>budget)throw Error('Saved deployment does not match current NFT and budget');
 }
 const [balance,nonce,pendingNonce,fees,estimate]=await Promise.all([provider.getBalance(deployer.address),provider.getTransactionCount(deployer.address,'latest'),provider.getTransactionCount(deployer.address,'pending'),provider.getFeeData(),provider.estimateGas({...request,from:deployer.address,gasPrice:0})]);
 if(!fees.gasPrice||fees.gasPrice>1_000_000_000n)throw Error('Gas price unavailable or above 1 gwei');
 const gasLimit=estimate*125n/100n,gasBudget=gasLimit*fees.gasPrice;
 if(gasBudget>budget)throw Error('NFT deployment exceeds the configured budget');
 console.log(JSON.stringify({status:step?'journal_exists':balance<gasBudget?'needs_gas':'ready',chainId:56,deployer:deployer.address,owner:keys.ownerAddress,verifier:verifier.address,adKeeper:keys.keeperAddress,balanceBNB:formatEther(balance),estimatedGas:estimate.toString(),gasBudgetBNB:formatEther(gasBudget),nonce,pendingNonce,nftAddress:step?.address||getCreateAddress({from:deployer.address,nonce})}));
 if(send){
  if(!step){
   if(nonce!==pendingNonce)throw Error('Pending wallet transactions must finish before deployment');
   if(balance<gasBudget)throw Error('Fund the mainnet deployment wallet first');
   const raw=await deployer.signTransaction({...request,nonce,gasLimit,gasPrice:fees.gasPrice,type:0,chainId:56,value:0});
   step=journal.nft={binding,raw,hash:keccak256(raw),address:getCreateAddress({from:deployer.address,nonce})};save(journalPath,journal);
  }
  let receipt=await provider.getTransactionReceipt(step.hash);
  if(!receipt){
   if(!await provider.getTransaction(step.hash)){
    if(await provider.getTransactionCount(deployer.address,'latest')>Transaction.from(step.raw).nonce)throw Error('Saved transaction nonce was consumed by a different transaction');
    await provider.broadcastTransaction(step.raw);
   }
   console.log(JSON.stringify({status:'waiting_confirmations',hash:step.hash}));
   receipt=await provider.waitForTransaction(step.hash,3,180000);
  }
  if(receipt&&await receipt.confirmations()<3)receipt=await provider.waitForTransaction(step.hash,3,180000);
  if(!receipt||receipt.status!==1||receipt.contractAddress!==step.address)throw Error('NFT deployment did not confirm successfully');
  const nft=new Contract(step.address,artifact.abi,provider);
  if(await provider.getCode(step.address)==='0x'||await nft.owner()!==keys.ownerAddress||await nft.verifier()!==verifier.address||await nft.PROTOCOL_ID()!==id('onhold.nft.v1')||await provider.getCode(await nft.renderer())==='0x')throw Error('Deployed NFT verification failed');
  step.block=receipt.blockNumber;save(journalPath,journal);
  const result={chainId:56,architecture:'fixed-assets-upgradeable-gameplay-v1',nftAddress:step.address,nftFromBlock:receipt.blockNumber,rendererAddress:await nft.renderer(),owner:keys.ownerAddress,deployer:deployer.address,verifier:verifier.address,adKeeper:keys.keeperAddress,mock:false,transactions:{nft:step.hash},verifiedAt:new Date().toISOString()};
  save(join(directory,'nft-addresses.json'),result);
  console.log(JSON.stringify({status:'deployed',...result}));
 }
}catch(error){console.error('Mainnet NFT deployment stopped:',error.shortMessage||error.message);process.exitCode=1;}
finally{if(lock!==undefined){closeSync(lock);unlinkSync(lockPath);}provider.destroy();}
