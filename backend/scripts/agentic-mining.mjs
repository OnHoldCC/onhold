import {Contract,Interface,ZeroAddress,getAddress,id} from 'ethers';

const nftAbi=[
 'function PROTOCOL_ID() view returns(bytes32)','function ownerOf(uint256) view returns(address)',
 'function passWeight(uint256) view returns(uint256)','function referralBound(address) view returns(bool)',
 'function referrerOf(address) view returns(address)','function getApproved(uint256) view returns(address)',
 'function isApprovedForAll(address,address) view returns(bool)','function bindReferrer(address)',
 'function approve(address,uint256)','event ReferralBound(address indexed account,address indexed referrer)',
 'event Approval(address indexed owner,address indexed approved,uint256 indexed tokenId)',
];
const vaultAbi=[
 'function PROTOCOL_ID() view returns(bytes32)','function nft() view returns(address)',
 'function claude() view returns(address)','function stakerOf(uint256) view returns(address)',
 'function stakedBalanceOf(address) view returns(uint256)','function stakedTokenByIndex(address,uint256) view returns(uint256)',
 'function earned(address) view returns(uint256)','function stake(uint256)','function unstake(uint256)','function getReward()',
 'event PassStaked(address indexed owner,uint256 indexed tokenId,uint256 weight)',
 'event PassUnstaked(address indexed owner,uint256 indexed tokenId,uint256 weight)',
 'event Mined(address indexed recipient,uint256 amount,uint256 bonus)',
];
const same=(a,b)=>getAddress(a)===getAddress(b);
const tokenId=value=>{if(!/^[1-9][0-9]*$/.test(String(value))||BigInt(value)>=(1n<<256n))throw Error('invalid_token_id');return String(value);};

export async function miningContracts(provider,assets){
 const chainId=assets.chainId??56;
 if(![56,97].includes(chainId)||BigInt(await provider.send('eth_chainId',[]))!==BigInt(chainId))throw Error('wrong_chain');
 const nft=new Contract(getAddress(assets.nft),nftAbi,provider),vault=new Contract(getAddress(assets.vault),vaultAbi,provider);
 const [nftProtocol,vaultProtocol,identity,rewardToken]=await Promise.all([nft.PROTOCOL_ID(),vault.PROTOCOL_ID(),vault.nft(),vault.claude()]);
 if(nftProtocol!==id('onhold.nft.v1')||vaultProtocol!==id('onhold.gameplay.v1')||!same(identity,assets.nft)||!same(rewardToken,assets.token))throw Error('deployment_mismatch');
 return {nft,vault,token:new Contract(getAddress(assets.token),['function balanceOf(address) view returns(uint256)'],provider)};
}

export async function miningPosition(provider,assets,wallet){
 wallet=getAddress(wallet);const {nft,vault,token}=await miningContracts(provider,assets);
 const [bound,referrer,earned,stakedCount,balance,bnb]=await Promise.all([nft.referralBound(wallet),nft.referrerOf(wallet),vault.earned(wallet),vault.stakedBalanceOf(wallet),token.balanceOf(wallet),provider.getBalance(wallet)]);
 const staked=[];for(let i=0n;i<stakedCount&&i<20n;i++)staked.push(String(await vault.stakedTokenByIndex(wallet,i)));
 return {chainId:assets.chainId??56,wallet,referralBound:bound,referrer,earnedWei:String(earned),stakedCount:String(stakedCount),stakedTokenIds:staked,tokenBalanceWei:String(balance),bnbWei:String(bnb)};
}

// One preview covers one transaction; bind/approve prerequisites are confirmed separately.
export async function planMining(provider,assets,wallet,intent){
 const {action}=intent;if(!['stake','claim','unstake'].includes(action))throw Error('unsupported_action');
 if(action!=='stake'&&intent.referrer!==undefined)throw Error('unexpected_referrer');
 wallet=getAddress(wallet);const {nft,vault}=await miningContracts(provider,assets);
 let step=action,to=assets.vault,data,details={};
 if(action==='claim'){
  if(intent.tokenId!==undefined)throw Error('unexpected_token_id');
  const earned=await vault.earned(wallet);if(earned===0n)throw Error('no_claimable_rewards');
  data=vault.interface.encodeFunctionData('getReward');details={estimatedRewardWei:String(earned)};
 }else{
  const token=tokenId(intent.tokenId);const [owner,staker,weight]=await Promise.all([nft.ownerOf(token),vault.stakerOf(token),nft.passWeight(token)]);
  details={tokenId:token,weight:String(weight)};
  if(action==='unstake'){
   if(!same(staker,wallet)||!same(owner,assets.vault))throw Error('not_nft_staker');
   data=vault.interface.encodeFunctionData('unstake',[token]);
  }else{
   if(!same(owner,wallet)||!same(staker,ZeroAddress))throw Error('not_nft_owner');
   if(weight===0n)throw Error('nft_has_no_mining_weight');
   const bound=await nft.referralBound(wallet),existing=await nft.referrerOf(wallet);
   const referrer=intent.referrer===undefined?undefined:getAddress(intent.referrer);
   if(referrer&&same(referrer,wallet))throw Error('self_referral');
   if(!bound){
    if(referrer===undefined)throw Error('explicit_referrer_required');
    step='bind';to=assets.nft;data=nft.interface.encodeFunctionData('bindReferrer',[referrer]);details={...details,referrer,permanentReferralBinding:true};
   }else{
    if(referrer!==undefined&&!same(existing,referrer))throw Error('referrer_already_bound');
    const [approved,all]=await Promise.all([nft.getApproved(token),nft.isApprovedForAll(wallet,assets.vault)]);
    if(!same(approved,assets.vault)&&!all){step='approve';to=assets.nft;data=nft.interface.encodeFunctionData('approve',[assets.vault,token]);}
    else data=vault.interface.encodeFunctionData('stake',[token]);
   }
  }
 }
 const call={from:wallet,to:getAddress(to),data,value:'0'};
 const estimatedGas=await provider.estimateGas(call);
 return {chainId:assets.chainId??56,intent,step,...call,details,estimatedGas:String(estimatedGas),preparedBlock:await provider.getBlockNumber()};
}

export async function miningReceipt(provider,assets,plan,hash){
 if(!/^0x[0-9a-f]{64}$/i.test(hash))throw Error('invalid_transaction_hash');
 await miningContracts(provider,assets);
 const [tx,receipt]=await Promise.all([provider.getTransaction(hash),provider.getTransactionReceipt(hash)]);
 if(!tx)return {status:'pending',hash};
 if(plan.chainId!==(assets.chainId??56)||tx.chainId!==BigInt(plan.chainId)||!same(tx.from,plan.from)||!same(tx.to,plan.to)||tx.data!==plan.data||tx.value!==0n)throw Error('transaction_mismatch');
 if(!receipt)return {status:'pending',hash};
 if(receipt.blockNumber<=plan.preparedBlock)throw Error('transaction_predates_preview');
 if(receipt.status!==1)return {status:'failed',hash,blockNumber:receipt.blockNumber};
 const confirmations=Number(await provider.getBlockNumber())-receipt.blockNumber+1;
 if(confirmations<3)return {status:'confirming',hash,confirmations};
 const iface=new Interface(plan.step==='bind'||plan.step==='approve'?nftAbi:vaultAbi);
 const name={bind:'ReferralBound',approve:'Approval',stake:'PassStaked',claim:'Mined',unstake:'PassUnstaked'}[plan.step];
 const event=receipt.logs.filter(log=>same(log.address,plan.to)).map(log=>{try{return iface.parseLog(log);}catch{return null;}}).find(e=>e?.name===name&&same(e.args[0],plan.from)&&(plan.step==='claim'||(plan.step==='bind'?same(e.args[1],plan.details.referrer):plan.step==='approve'?same(e.args[1],assets.vault)&&String(e.args[2])===plan.details.tokenId:String(e.args[1])===plan.details.tokenId)));
 if(!event)throw Error('expected_mining_event_missing');
 return {status:'confirmed',hash,blockNumber:receipt.blockNumber,confirmations,step:plan.step};
}
