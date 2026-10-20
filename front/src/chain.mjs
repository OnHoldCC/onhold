import {BrowserProvider,Contract,ContractFactory,getAddress,formatUnits,id} from 'ethers';
import marketArtifact from '../../contracts/artifacts/OnholdMarket.json';
import tokenArtifact from '../../contracts/artifacts/ClaudeTestToken.json';
import factoryArtifact from '../../contracts/artifacts/TestDeployment.json';
import config from './chain-config.json';
import {confirmMint,recordMint} from './mint-receipt.mjs';
import {parseEth,safeUrl} from './market.mjs';
export const chain={id:97,hexId:'0x61',name:'BNB Smart Chain Testnet',rpc:'https://bsc-testnet-dataseed.bnbchain.org',explorer:'https://testnet.bscscan.com'};
export function storedMarket() {
  try {const address=(config.protocol==='nft-staking-v4'?config.marketAddress:null)||JSON.parse(localStorage.getItem('onhold.nftcontract.v4'))?.marketAddress;return address?getAddress(address):null;}catch{return null;}
}
export function storeMarket(address) {const checked=getAddress(address);localStorage.setItem('onhold.nftcontract.v4',JSON.stringify({chainId:97,marketAddress:checked}));return checked;}
async function signer() {
  if(!window.ethereum?.request)throw new Error('No browser wallet');
  await window.ethereum.request({method:'eth_requestAccounts'});
  if(await window.ethereum.request({method:'eth_chainId'})!==chain.hexId){
    try{await window.ethereum.request({method:'wallet_switchEthereumChain',params:[{chainId:chain.hexId}]});}
    catch(error){if(error.code!==4902)throw error;await window.ethereum.request({method:'wallet_addEthereumChain',params:[{chainId:chain.hexId,chainName:chain.name,nativeCurrency:{name:'Test BNB',symbol:'tBNB',decimals:18},rpcUrls:[chain.rpc],blockExplorerUrls:[chain.explorer]}]});}
  }
  const provider=new BrowserProvider(window.ethereum);
  if((await provider.getNetwork()).chainId!==97n)throw new Error('BNB testnet required');
  return provider.getSigner();
}
async function chainSnapshot(address,wallet){
  const params=new URLSearchParams({market:getAddress(address)});if(wallet)params.set('wallet',getAddress(wallet));
  const response=await fetch(`/api/chain?${params}`,{credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(5000)});
  if(!response.ok)throw Error('chain_cache_unavailable');const value=await response.json();
  if(!value.available||value.chain_id!==97||value.protocol!=='nft-staking-v4'||getAddress(value.market)!==getAddress(address))throw Error('chain_cache_unavailable');
  return value;
}
export async function readMarket(address){
  const value=await chainSnapshot(address);
  return {...value,ads:value.ads.map(ad=>({...ad,title:safeUrl(ad.url)?new URL(ad.url).hostname:'',empty:ad.empty||false})),financial:value.financial};
}
export async function placeChainBid(address,slot,version,form) {
  const account=await signer();const market=new Contract(address,marketArtifact.abi,account);
  const transaction=await market.bid(slot,version,form.url.trim(),form.description.trim(),form.avatar.trim(),form.tags||[],{value:parseEth(form.amount)});
  await transaction.wait();return transaction.hash;
}
export async function deployTestContracts() {
  const account=await signer();
  const factory=new ContractFactory(factoryArtifact.abi,factoryArtifact.bytecode,account);
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
  const signature=await account.signMessage(quote.message);
  onProgress({stage:2});
  const proof=await claimRequest('/api/nft/authorize',{...body,signature});
  if(proof.protocol!=='nft-staking-v4'||proof.chain_id!==97||getAddress(proof.market)!==getAddress(expectedMarket)||getAddress(proof.recipient)!==getAddress(wallet))throw Error('invalid_mint_proof');
  const contract=new Contract(proof.market,marketArtifact.abi,account);
  onProgress({stage:3});
  const transaction=await contract.mintPass(proof.recipient,proof.nullifier,proof.tier,proof.referrer,proof.deadline,proof.record,proof.signature);
  return confirmMint(transaction,proof.nullifier,onProgress);
}
export async function recoverMint(pending){
  if(window.ethereum?.request){
    const provider=new BrowserProvider(window.ethereum);
    if((await provider.getNetwork()).chainId===97n){
      const receipt=await provider.getTransactionReceipt(pending.tx_hash);
      if(receipt?.status===0){try{localStorage.removeItem('onhold.nftreceipt');}catch{}throw Error('mint_transaction_failed');}
    }
  }
  return recordMint(pending);
}
export async function readMining(address,wallet){
  const value=await chainSnapshot(address,wallet);
  return {...value.mining,confirmedBlock:value.confirmed_block,asOf:value.as_of,estimated:true};
}
export async function miningAction(address,wallet,action,tokenId){
  if(!['stake','unstake','getReward','claimReferralRewards'].includes(action))throw Error('invalid_transaction');
  const account=await signer();
  if(getAddress(await account.getAddress())!==getAddress(wallet))throw Error('wallet_changed');
  const contract=new Contract(address,marketArtifact.abi,account);
  const args=['getReward','claimReferralRewards'].includes(action)?[]:[tokenId];
  const estimated=await contract[action].estimateGas(...args);
  const tx=await contract[action](...args,{gasLimit:estimated*125n/100n});
  await tx.wait(3);return tx.hash;
}
