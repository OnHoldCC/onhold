import {readFileSync,writeFileSync,mkdirSync,existsSync,renameSync,openSync,closeSync,unlinkSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import {Wallet,JsonRpcProvider,Contract,ZeroAddress,id,AbiCoder,keccak256,toUtf8Bytes,parseEther,formatEther} from 'ethers';
import {miningContracts,planMining,miningReceipt,miningPosition} from '../backend/scripts/agentic-mining.mjs';

// This is an ordinary testnet signer. It does not simulate a successful Binance login.
const root=fileURLToPath(new URL('../',import.meta.url)),directory=join(root,'backend/data/agentic-testnet');
const manifest=JSON.parse(readFileSync(join(root,'config/public-contracts.json')))['97'],map=Object.fromEntries(manifest.contracts);
const assets={chainId:97,nft:map.nft,vault:map.gameplay,token:manifest.tokenAddress};
const rpc=JSON.parse(readFileSync(join(root,'config/networks.json')))['97'].rpc;
const provider=new JsonRpcProvider(rpc,undefined,{cacheTimeout:-1});provider.pollingInterval=1000;
const send=process.argv.length===3&&process.argv[2]==='--send';
let state,lock;
function save(){const temp=join(directory,'run.tmp');writeFileSync(temp,JSON.stringify(state,null,2)+'\n',{mode:0o600});renameSync(temp,join(directory,'run.json'));}
function publicResult(){return {chainId:97,assets,wallet:state.wallet,tokenId:state.tokenId,transactions:state.transactions,completedAt:state.completedAt,claimedTokens:state.claimedTokens,finalPosition:state.finalPosition,binanceWalletSigned:false,signerType:'dedicated-testnet-EOA'};}
async function transaction(label,signer,request){
 if(!send)throw Error('Use --send to submit testnet transactions');
 let entry=state.transactions[label];
 if(!entry){
  const fee=await provider.getFeeData(),gasPrice=fee.gasPrice;
  if(gasPrice===null||gasPrice>parseEther('0.000000003'))throw Error('Test gas price exceeds 3 gwei cap');
  const gasLimit=(await provider.estimateGas({...request,from:signer.address}))*125n/100n;
  const cost=gasLimit*gasPrice+BigInt(request.value||0);
  if(BigInt(state.maximumCostWei)+cost>parseEther('0.003'))throw Error('Test run exceeds 0.003 tBNB budget');
  // Record an unresolved send before invoking the RPC; never silently retry after a timeout.
  state.transactions[label]={status:'submitting'};save();
  const tx=await signer.sendTransaction({...request,gasLimit,gasPrice});
  state.maximumCostWei=String(BigInt(state.maximumCostWei)+cost);
  entry=state.transactions[label]={hash:tx.hash,status:'submitted'};save();
  console.log(JSON.stringify({step:label,hash:tx.hash}));
 }
 if(!entry.hash)throw Error('Unresolved testnet send: '+label+'; inspect the wallet before any retry');
 const receipt=await provider.waitForTransaction(entry.hash,3,90000);
 if(!receipt||receipt.status!==1)throw Error('Testnet transaction unconfirmed or failed: '+label);
 Object.assign(entry,{status:'confirmed',blockNumber:receipt.blockNumber});save();return receipt;
}
try{
 if(process.argv.length>3||process.argv[2]&&process.argv[2]!=='--send')throw Error('Usage: node scripts/test-agentic-testnet.mjs [--send]');
 await miningContracts(provider,assets);
 const keys=JSON.parse(readFileSync(join(root,'backend/data/testnet/keys.json')));if(keys.chainId!==97)throw Error('Testnet keys required');
 const funder=new Wallet(keys.deployerPrivateKey,provider),verifier=new Wallet(keys.verifierPrivateKey);
 const nftAbi=JSON.parse(readFileSync(join(root,'contracts/artifacts/OnholdNFT.json'))).abi;
 const nft=new Contract(assets.nft,nftAbi,provider);
 if((await nft.verifier()).toLowerCase()!==verifier.address.toLowerCase())throw Error('Test verifier mismatch');
 mkdirSync(directory,{recursive:true,mode:0o700});const keyPath=join(directory,'keys.json');
 if(!existsSync(keyPath))writeFileSync(keyPath,JSON.stringify({chainId:97,privateKey:Wallet.createRandom().privateKey}),{mode:0o600,flag:'wx'});
 const fixtureKey=JSON.parse(readFileSync(keyPath));if(fixtureKey.chainId!==97)throw Error('Fixture key must be testnet-only');
 const fixture=new Wallet(fixtureKey.privateKey,provider);
 state=existsSync(join(directory,'run.json'))?JSON.parse(readFileSync(join(directory,'run.json'))):{chainId:97,wallet:fixture.address,assets,maximumCostWei:'0',record:{account:'TESTNET Agentic integration fixture (synthetic)',uuid:randomUUID(),bannedAt:new Date().toISOString(),plan:'claude_max'},transactions:{},plans:{}};
 if(state.chainId!==97||state.wallet!==fixture.address||JSON.stringify(state.assets)!==JSON.stringify(assets))throw Error('Test journal deployment mismatch');
  if(send){const lockPath=join(directory,'run.lock'),fd=openSync(lockPath,'wx',0o600);closeSync(fd);lock=lockPath;}
 const position=await miningPosition(provider,assets,fixture.address);
 if(!send){console.log(JSON.stringify({mode:'read-only',assets,wallet:fixture.address,position,funderTbnb:formatEther(await provider.getBalance(funder.address)),maximumBudgetTbnb:'0.003',binanceWalletSigned:false}));}
 else if(state.completedAt)console.log(JSON.stringify(publicResult()));
 else{
  state.initialTokenBalanceWei??=position.tokenBalanceWei;save();
  if(!state.transactions.fund&&BigInt(position.bnbWei)>=parseEther('0.001'))state.fundingNotRequired=true;
  if(!state.fundingNotRequired)await transaction('fund',funder,{to:fixture.address,value:parseEther('0.001')});
  if(!state.transactions.mint){
   const record=state.record,nullifier=id('ONHOLD:restricted-consumer-org:v1:'+record.uuid),deadline=Math.floor(Date.now()/1000)+3600;
   const recordHash=keccak256(AbiCoder.defaultAbiCoder().encode(['bytes32','bytes32','bytes32','bytes32'],Object.values(record).map(v=>keccak256(toUtf8Bytes(v)))));
   const types={MintPass:[{name:'recipient',type:'address'},{name:'nullifier',type:'bytes32'},{name:'tier',type:'uint8'},{name:'referrer',type:'address'},{name:'deadline',type:'uint256'},{name:'recordHash',type:'bytes32'}]};
   const signature=await verifier.signTypedData({name:'ONHOLD',version:'5',chainId:97,verifyingContract:assets.nft},types,{recipient:fixture.address,nullifier,tier:2,referrer:ZeroAddress,deadline,recordHash});
   state.mintCall=await nft.mintPass.populateTransaction(fixture.address,nullifier,2,ZeroAddress,deadline,record,signature);save();
  }
  const mint=await transaction('mint',fixture,state.mintCall);
  const minted=mint.logs.filter(l=>l.address.toLowerCase()===assets.nft.toLowerCase()).map(l=>{try{return nft.interface.parseLog(l);}catch{return null;}}).find(e=>e?.name==='PassMinted'&&e.args.recipient.toLowerCase()===fixture.address.toLowerCase());
  if(!minted)throw Error('Fixture mint event missing');state.tokenId=String(minted.args.tokenId);save();
  async function executePlan(plan){
   const label=plan.step;state.plans[label]??=plan;save();plan=state.plans[label];
   const receipt=await transaction(label,fixture,{to:plan.to,data:plan.data,value:0n});
   const checked=await miningReceipt(provider,assets,plan,receipt.hash);if(checked.status!=='confirmed')throw Error('Test mining receipt not confirmed');state.transactions[label].verified=true;save();
  }
  if(state.plans.stake)await executePlan(state.plans.stake);
  else for(let i=0;i<3;i++){const plan=await planMining(provider,assets,fixture.address,{action:'stake',tokenId:state.tokenId,referrer:ZeroAddress});await executePlan(plan);if(plan.step==='stake')break;}
  if(!state.transactions.stake?.verified)throw Error('Fixture was not staked');
  if(!state.plans.claim){
   for(let i=0;i<20;i++){if(BigInt((await miningPosition(provider,assets,fixture.address)).earnedWei)>0n)break;await delay(1000);}
   state.plans.claim=await planMining(provider,assets,fixture.address,{action:'claim'});save();
  }
  await executePlan(state.plans.claim);
  state.plans.unstake??=await planMining(provider,assets,fixture.address,{action:'unstake',tokenId:state.tokenId});save();await executePlan(state.plans.unstake);
  const final=await miningPosition(provider,assets,fixture.address);
  if((await nft.ownerOf(state.tokenId)).toLowerCase()!==fixture.address.toLowerCase()||final.stakedCount!=='0'||BigInt(final.tokenBalanceWei)<=BigInt(state.initialTokenBalanceWei))throw Error('Final testnet custody or reward assertion failed');
  Object.assign(state,{completedAt:new Date().toISOString(),finalPosition:final,claimedTokens:formatEther(BigInt(final.tokenBalanceWei)-BigInt(state.initialTokenBalanceWei)),binanceWalletSigned:false,signerType:'dedicated-testnet-EOA'});save();console.log(JSON.stringify(publicResult()));
 }
}catch(e){console.error(JSON.stringify({error:e.shortMessage||e.reason||(e.code?'RPC error '+e.code:e.message)}));process.exitCode=1;}
finally{provider.destroy();if(lock){try{unlinkSync(lock);}catch{}}}
