import {getWalletProvider,ensureWalletChain} from './wallet.mjs';
import {readJson} from './read-json.mjs';
import {getAddress} from 'ethers/address';
import config from './chain-config.json';
import {confirmMint,recordMint} from './mint-receipt.mjs';
import {parseEth,safeUrl} from './market.mjs';
import {pendingMining,rememberMining,confirmMining} from './mining-receipt.mjs';
export const chain={id:97,hexId:'0x61',name:'BNB Smart Chain Testnet',rpc:'https://bsc-testnet-dataseed.bnbchain.org',explorer:'https://testnet.bscscan.com'};
export function storedMarket() {
  try {const address=(window.ethereum?.isOnholdTestWallet?window.ethereum.onholdTestMarket:null)||(config.protocol==='nft-staking-v4'?config.marketAddress:null)||JSON.parse(localStorage.getItem('onhold.nftcontract.v4'))?.marketAddress;return address?getAddress(address):null;}catch{return null;}
}
export function storeMarket(address) {const checked=getAddress(address);localStorage.setItem('onhold.nftcontract.v4',JSON.stringify({chainId:97,marketAddress:checked}));return checked;}
const signerProviders=new WeakMap();
async function signer() {
  const {BrowserProvider}=await import('ethers');
  const selected=getWalletProvider();
  if(!selected?.request)throw new Error('No connected wallet');
  await ensureWalletChain(selected,chain);
  if(getWalletProvider()!==selected)throw Error('wallet_changed');
  const provider=new BrowserProvider(selected);
  if((await provider.getNetwork()).chainId!==97n)throw new Error('BNB testnet required');
  const account=await provider.getSigner();
  if(getWalletProvider()!==selected)throw Error('wallet_changed');
  signerProviders.set(account,selected);
  return account;
}
async function checkWallet(account){
  const selected=getWalletProvider();
  if(!selected||selected!==signerProviders.get(account))throw Error('wallet_changed');
  const accounts=await selected.request({method:'eth_accounts'});
  if(!Array.isArray(accounts)||!/^0x[0-9a-fA-F]{40}$/.test(accounts[0]||'')||getAddress(accounts[0])!==getAddress(await account.getAddress())||await selected.request({method:'eth_chainId'})!==chain.hexId||selected!==getWalletProvider())throw Error('wallet_changed');
}
async function chainSnapshot(address,wallet){
  const params=new URLSearchParams({market:getAddress(address)});if(wallet)params.set('wallet',getAddress(wallet));
  const value=await readJson(`/api/chain?${params}`);
  if(!value.available||value.chain_id!==97||value.protocol!=='nft-staking-v4'||getAddress(value.market)!==getAddress(address))throw Error('chain_cache_unavailable');
  return value;
}
export async function readMarket(address){
  const value=await chainSnapshot(address);
  return {...value,ads:value.ads.map(ad=>({...ad,title:safeUrl(ad.url)?new URL(ad.url).hostname:'',empty:ad.empty||false})),financial:value.financial};
}
export async function placeChainBid(address,slot,version,form) {
  const [{Contract},{abi},account]=await Promise.all([import('ethers'),import('./market-abi.mjs'),signer()]);const market=new Contract(address,abi,account);
  await checkWallet(account);
  if(Array.from((form.tags||[]).join('')).length>10){
    try{if(await market.MAX_TAGS()<BigInt(form.tags.length))throw Error();}catch{throw Error('当前广告合约尚未升级为 10 个标签，请等待合约更新后再提交。');}
    await checkWallet(account);
  }
  const transaction=await market.bid(slot,version,form.url.trim(),form.description.trim(),form.avatar.trim(),form.tags||[],{value:parseEth(form.amount)});
  await transaction.wait();return transaction.hash;
}
export async function deployTestContracts() {
  const [{ContractFactory},{default:factoryArtifact},account]=await Promise.all([import('ethers'),import('../../contracts/artifacts/TestDeployment.json'),signer()]);
  const factory=new ContractFactory(factoryArtifact.abi,factoryArtifact.bytecode,account);
  await checkWallet(account);
  const deployment=await factory.deploy();await deployment.waitForDeployment();
  return {marketAddress:await deployment.market(),tokenAddress:await deployment.token(),transactionHash:deployment.deploymentTransaction().hash};
}

export async function mintVerified(verificationToken,png,referrer,expectedMarket,expectedWallet,onProgress){
  const {claimRequest,createNft}=await import('./claims-api.mjs');
  onProgress({stage:0});
  const account=await signer(),wallet=await account.getAddress();
  if(getAddress(wallet)!==getAddress(expectedWallet))throw Error('wallet_changed');
  const body={verification_token:verificationToken,wallet,referral_code:referrer||null};
  const quote=await createNft(verificationToken,png,wallet,referrer);
  onProgress({stage:1});
  if(typeof quote.message!=='string'||quote.message.length>5000)throw Error('invalid_provider_response');
  await checkWallet(account);
  const signature=await account.signMessage(quote.message);
  onProgress({stage:2});
  const proof=await claimRequest('/api/nft/authorize',{...body,signature});
  if(proof.protocol!=='nft-staking-v4'||proof.chain_id!==97||getAddress(proof.market)!==getAddress(expectedMarket)||getAddress(proof.recipient)!==getAddress(wallet))throw Error('invalid_mint_proof');
  const [{Contract},{abi}]=await Promise.all([import('ethers'),import('./market-abi.mjs')]);
  const contract=new Contract(proof.market,abi,account);
  onProgress({stage:3});
  await checkWallet(account);
  const transaction=await contract.mintPass(proof.recipient,proof.nullifier,proof.tier,proof.referrer,proof.deadline,proof.record,proof.signature);
  return confirmMint(transaction,proof.nullifier,onProgress);
}
export async function recoverMint(pending){
  const selected=getWalletProvider();
  if(selected?.request){
    const {BrowserProvider}=await import('ethers');
    const provider=new BrowserProvider(selected);
    if((await provider.getNetwork()).chainId===97n){
      const receipt=await provider.getTransactionReceipt(pending.tx_hash);
      if(receipt?.status===0){try{localStorage.removeItem('onhold.nftreceipt');}catch{}throw Error('mint_transaction_failed');}
    }
  }
  return recordMint(pending);
}
export async function readMining(address,wallet){
  const value=await chainSnapshot(address,wallet);
  return {...value.mining,confirmedBlock:value.confirmed_block,asOf:value.as_of,stale:value.stale,estimated:true};
}
export async function miningAction(address,wallet,action,tokenId,expectedReferrer,onProgress=()=>{}){
  if(!['stake','unstake','getReward','claimReferralRewards'].includes(action))throw Error('invalid_transaction');
  const pending=pendingMining(address,wallet);if(pending){const cause=Error('mining_confirmation_pending');cause.pending=pending;throw cause;}
  onProgress({stage:0});
  let timer;
  const {request,estimated,selected}=await Promise.race([(async()=>{
    const account=await signer();
    if(getAddress(await account.getAddress())!==getAddress(wallet))throw Error('wallet_changed');
    const [{Contract},{abi}]=await Promise.all([import('ethers'),import('./market-abi.mjs')]);
    const contract=new Contract(address,abi,account);
    if(action==='stake'){
      if(!/^0x[0-9a-fA-F]{40}$/.test(expectedReferrer||''))throw Error('referral_binding_required');
      // shortcut: pre-mint stakes cannot preserve a nonzero inviter with the current entrypoint.
      if(expectedReferrer!=='0x0000000000000000000000000000000000000000'){
        if(!await contract.referralBound(wallet))throw Error('referral_mint_required');
        if(getAddress(await contract.referrerOf(wallet))!==getAddress(expectedReferrer))throw Error('referrer_already_bound');
      }
    }
    const args=['getReward','claimReferralRewards'].includes(action)?[]:[tokenId];
    const estimated=await contract[action].estimateGas(...args);
    const request=await contract[action].populateTransaction(...args);
    await checkWallet(account);
    return {request,estimated,selected:getWalletProvider()};
  })(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('mining_prepare_timeout')),20000);})]).finally(()=>clearTimeout(timer));
  if(selected!==getWalletProvider())throw Error('wallet_changed');
  onProgress({stage:1});
  // Capture the hash directly; BrowserProvider.sendTransaction also polls the wallet for it.
  const hash=await selected.request({method:'eth_sendTransaction',params:[{from:wallet,to:address,data:request.data,gas:'0x'+(estimated*125n/100n).toString(16)}]});
  if(!/^0x[0-9a-f]{64}$/i.test(hash))throw Error('invalid_transaction_receipt');
  const sent={hash,market:address,wallet,action,tokenId,chainId:97,started:Date.now()};
  rememberMining(sent);
  return confirmMining(sent,onProgress);
}
