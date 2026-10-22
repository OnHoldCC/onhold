import {getWalletProvider,ensureWalletChain} from './wallet.mjs';
import {readJson} from './read-json.mjs';
import {invalidateHome} from './home-data.mjs';
import {getAddress} from 'ethers/address';
import config from './chain-config.json';
import {confirmMint,recordMint} from './mint-receipt.mjs';
import {parseEth,safeUrl} from './market.mjs';
import {pendingMining,rememberMining,confirmMining} from './mining-receipt.mjs';
import {createInteractionTiming} from './interaction-timing.mjs';
import {chain,mintReceiptKey} from './network.mjs';
export {chain};
export function storedMarket() {
  try {return config.protocol==='nft-staking-v4'&&config.marketAddress?getAddress(config.marketAddress):null;}catch{return null;}
}
export function storedNft(){return config.nftAddress||storedMarket();}
const signerProviders=new WeakMap();
async function signer() {
  const {BrowserProvider}=await import('ethers');
  const selected=getWalletProvider();
  if(!selected?.request)throw new Error('No connected wallet');
  await ensureWalletChain(selected,chain);
  if(getWalletProvider()!==selected)throw Error('wallet_changed');
  const provider=new BrowserProvider(selected);
  const [network,account]=await Promise.all([provider.getNetwork(),provider.getSigner()]);
  if(network.chainId!==BigInt(chain.id))throw new Error('wrong_chain');
  if(getWalletProvider()!==selected)throw Error('wallet_changed');
  signerProviders.set(account,selected);
  return account;
}
async function checkWallet(account,timing=createInteractionTiming()){
  const selected=getWalletProvider();
  if(!selected||selected!==signerProviders.get(account))throw Error('wallet_changed');
  const [accounts,chainId,address]=await timing.measure('walletCheck',()=>Promise.all([selected.request({method:'eth_accounts'}),selected.request({method:'eth_chainId'}),account.getAddress()]));
  if(!Array.isArray(accounts)||!/^0x[0-9a-fA-F]{40}$/.test(accounts[0]||'')||getAddress(accounts[0])!==getAddress(address)||chainId!==chain.hexId||selected!==getWalletProvider())throw Error('wallet_changed');
}
async function chainSnapshot(address,wallet,fresh=false){
  const params=new URLSearchParams({market:getAddress(address)});if(wallet)params.set('wallet',getAddress(wallet));
  const value=await readJson(`/api/chain?${params}`,5000,undefined,fresh);
  if(!value.available||value.chain_id!==chain.id||value.protocol!=='nft-staking-v4'||getAddress(value.market)!==getAddress(address))throw Error('chain_cache_unavailable');
  return value;
}
export async function readMarket(address,fresh=false){
  if(fresh)invalidateHome();
  const value=await chainSnapshot(address,undefined,fresh);
  return {...value,ads:value.ads.map(ad=>({...ad,title:safeUrl(ad.url)?new URL(ad.url).hostname:'',empty:ad.empty||false})),financial:{...value.financial,...(value.financial?.burnedSymbol&&value.financial.burnedSymbol!=='$OnHold'?{burned:null,burnedSymbol:'$OnHold'}:{})}};
}
export async function placeChainBid(address,slot,version,form,timing=createInteractionTiming()) {
  const [{Contract},{abi},account]=await timing.measure('walletPrepare',()=>Promise.all([import('ethers'),import('./market-abi.mjs'),signer()]));const market=new Contract(address,abi,account);
  await checkWallet(account,timing);
  if(Array.from((form.tags||[]).join('')).length>10){
    try{if(await timing.measure('contractRead',()=>market.MAX_TAGS())<BigInt(form.tags.length))throw Error();}catch{throw Error('当前广告合约尚未升级为 10 个标签，请等待合约更新后再提交。');}
    await checkWallet(account,timing);
  }
  const args=[slot,version,form.url.trim(),form.description.trim(),form.avatar.trim(),form.tags||[]],value=parseEth(form.amount);
  const gasLimit=await timing.measure('estimateGas',()=>market.bid.estimateGas(...args,{value}));
  await checkWallet(account,timing);
  const transaction=await timing.measure('sendTransaction',()=>market.bid(...args,{value,gasLimit}));
  await timing.measure('chainConfirm',()=>transaction.wait());return transaction.hash;
}
export async function mintVerified(verificationToken,png,referrer,expectedMarket,expectedWallet,onProgress,timing=createInteractionTiming()){
  const {claimRequest,createNft}=await import('./claims-api.mjs');
  onProgress({stage:0});
  const account=await timing.measure('walletPrepare',signer),wallet=await account.getAddress();
  if(getAddress(wallet)!==getAddress(expectedWallet))throw Error('wallet_changed');
  const body={verification_token:verificationToken,wallet,referral_code:referrer||null};
  const quote=await timing.measure('upload',()=>createNft(verificationToken,png,wallet,referrer));
  onProgress({stage:1});
  if(typeof quote.message!=='string'||quote.message.length>5000)throw Error('invalid_provider_response');
  await checkWallet(account,timing);
  const signature=await timing.measure('signature',()=>account.signMessage(quote.message));
  onProgress({stage:2});
  const proof=await timing.measure('authorize',()=>claimRequest('/api/nft/authorize',{...body,signature}));
  if(proof.protocol!=='nft-staking-v4'||proof.chain_id!==chain.id||getAddress(proof.market)!==getAddress(expectedMarket)||getAddress(proof.recipient)!==getAddress(wallet))throw Error('invalid_mint_proof');
  const [{Contract},{abi}]=await Promise.all([import('ethers'),import('./market-abi.mjs')]);
  const contract=new Contract(proof.market,abi,account);
  onProgress({stage:3});
  const args=[proof.recipient,proof.nullifier,proof.tier,proof.referrer,proof.deadline,proof.record,proof.signature];
  const gasLimit=await timing.measure('estimateGas',()=>contract.mintPass.estimateGas(...args));
  await checkWallet(account,timing);
  const transaction=await timing.measure('sendTransaction',()=>contract.mintPass(...args,{gasLimit}));
  return confirmMint(transaction,proof.nullifier,onProgress,timing);
}
export async function recoverMint(pending,timing=createInteractionTiming()){
  const selected=getWalletProvider();
  if(selected?.request){
    const {BrowserProvider}=await import('ethers');
    const provider=new BrowserProvider(selected);
    if((await provider.getNetwork()).chainId===BigInt(chain.id)){
      const receipt=await timing.measure('chainConfirm',()=>provider.getTransactionReceipt(pending.tx_hash));
      if(receipt?.status===0){try{localStorage.removeItem(mintReceiptKey);}catch{}throw Error('mint_transaction_failed');}
    }
  }
  return timing.measure('receiptSync',()=>recordMint(pending));
}
export async function readMining(address,wallet){
  const value=await chainSnapshot(address,wallet);
  return {...value.mining,confirmedBlock:value.confirmed_block,asOf:value.as_of,stale:value.stale,estimated:true};
}
const activeMiningActions=new Set();
export async function miningAction(address,wallet,action,tokenId,expectedReferrer,onProgress=()=>{},timing=createInteractionTiming()){
  const key=`${address}:${wallet}`.toLowerCase();
  if(activeMiningActions.has(key))throw Error('mining_confirmation_pending');
  activeMiningActions.add(key);
  try{return await runMiningAction(address,wallet,action,tokenId,expectedReferrer,onProgress,timing);}
  finally{activeMiningActions.delete(key);}
}
async function runMiningAction(address,wallet,action,tokenId,expectedReferrer,onProgress,timing){
  if(!['stake','unstake','getReward','claimReferralRewards'].includes(action))throw Error('invalid_transaction');
  const pending=pendingMining(address,wallet);if(pending){const cause=Error('mining_confirmation_pending');cause.pending=pending;throw cause;}
  onProgress({stage:0});
  let stakeAccount;
  // Separate NFT custody requires a token-specific approval before the staking transaction.
  if(action==='stake'&&config.nftAddress&&getAddress(address)===getAddress(config.marketAddress)){
    const [{Contract},{abi},account]=await timing.measure('walletPrepare',()=>Promise.all([import('ethers'),import('./market-abi.mjs'),signer()]));
    stakeAccount=account;
    if(getAddress(await account.getAddress())!==getAddress(wallet))throw Error('wallet_changed');
    const nft=new Contract(config.nftAddress,abi,account);
    const {approveNftStake}=await import('./nft-approval.mjs');
    await approveNftStake(nft,address,wallet,tokenId,expectedReferrer,()=>checkWallet(account,timing),timing);
  }
  let timer;
  const {request,estimated,selected}=await Promise.race([(async()=>{
    const account=stakeAccount||await timing.measure('walletPrepare',signer);
    if(getAddress(await account.getAddress())!==getAddress(wallet))throw Error('wallet_changed');
    const [{Contract},{abi}]=await Promise.all([import('ethers'),import('./market-abi.mjs')]);
    const contract=new Contract(address,abi,account);
    if(action==='stake'){
      if(!/^0x[0-9a-fA-F]{40}$/.test(expectedReferrer||''))throw Error('referral_binding_required');
      // shortcut: pre-mint stakes cannot preserve a nonzero inviter with the current entrypoint.
      if(expectedReferrer!=='0x0000000000000000000000000000000000000000'){
        if(!await timing.measure('contractRead',()=>contract.referralBound(wallet)))throw Error('referral_mint_required');
        if(getAddress(await timing.measure('contractRead',()=>contract.referrerOf(wallet)))!==getAddress(expectedReferrer))throw Error('referrer_already_bound');
      }
    }
    const args=['getReward','claimReferralRewards'].includes(action)?[]:[tokenId];
    const estimated=await timing.measure('estimateGas',()=>contract[action].estimateGas(...args));
    const request=await contract[action].populateTransaction(...args);
    await checkWallet(account,timing);
    return {request,estimated,selected:getWalletProvider()};
  })(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('mining_prepare_timeout')),20000);})]).finally(()=>clearTimeout(timer));
  if(selected!==getWalletProvider())throw Error('wallet_changed');
  onProgress({stage:1});
  // Capture the hash directly; BrowserProvider.sendTransaction also polls the wallet for it.
  const hash=await timing.measure('sendTransaction',()=>selected.request({method:'eth_sendTransaction',params:[{from:wallet,to:address,data:request.data,gas:'0x'+(estimated*125n/100n).toString(16)}]}));
  if(!/^0x[0-9a-f]{64}$/i.test(hash))throw Error('invalid_transaction_receipt');
  const sent={hash,market:address,wallet,action,tokenId,chainId:chain.id,started:Date.now()};
  rememberMining(sent);
  return confirmMining(sent,onProgress,true,timing);
}
