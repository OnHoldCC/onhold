import {claimRequest,createInvite} from './claims-api.mjs';
const ZERO='0x0000000000000000000000000000000000000000';
const code=value=>typeof value==='string'&&/^[a-f0-9]{12}$/i.test(value);
const address=value=>typeof value==='string'&&/^0x[0-9a-fA-F]{40}$/.test(value);
const sourceKey='onhold.referral.source';
export function rememberReferral(search,storage){
  const incoming=new URLSearchParams(search).get('ref');
  if(incoming!==null&&!code(incoming)&&!address(incoming))throw Error('invalid_referral_code');
  if(incoming!==null){try{storage.setItem(sourceKey,incoming.toLowerCase());}catch{}return incoming.toLowerCase();}
  let saved='';try{saved=storage.getItem(sourceKey)||'';}catch{}
  return code(saved)||address(saved)?saved.toLowerCase():'';
}
export function referralMessage({origin,market,wallet,referrer,nonce,expiresAt}){
  return `ONHOLD referral binding\nSite: ${origin}\nChain: BNB Testnet (97)\nContract: ${market.toLowerCase()}\nWallet: ${wallet.toLowerCase()}\nInviter: ${referrer}\nThis permanently fixes this wallet's inviter for future NFTs. Zero address means no inviter. This signature does not send a transaction or grant token permissions.\nNonce: ${nonce}\nExpires: ${expiresAt}`;
}
export async function bindWalletReferral(provider,wallet,source,market,isCurrent,allowSign=true){
  if(!address(wallet)||!address(market))throw Error('invalid_wallet');
  let referralCode=source||null;
  if(address(referralCode))referralCode=await createInvite(referralCode);
  if(referralCode&&!code(referralCode))throw Error('invalid_referral_code');
  const body={wallet,referral_code:referralCode};
  let value=await claimRequest('/api/referrals/bind',body);
  if(value.bound!==true){
    if(!allowSign)return null;
    if(value.bound!==false||!address(value.referrer)||typeof value.nonce!=='string'||!/^[a-f0-9]{32}$/.test(value.nonce)||!Number.isSafeInteger(value.expires_at)||value.expires_at*1000<=Date.now()||value.expires_at*1000>Date.now()+660000)throw Error('invalid_provider_response');
    const expected=referralMessage({origin:location.origin,market,wallet,referrer:value.referrer,nonce:value.nonce,expiresAt:value.expires_at});
    if(value.message!==expected)throw Error('invalid_provider_response');
    if(!isCurrent())throw Error('wallet_changed');
    const accounts=await provider.request({method:'eth_accounts'});
    if(!Array.isArray(accounts)||accounts[0]?.toLowerCase()!==wallet.toLowerCase()||!isCurrent())throw Error('wallet_changed');
    const {BrowserProvider}=await import('ethers');
    const signer=await new BrowserProvider(provider).getSigner(wallet);
    if(!isCurrent())throw Error('wallet_changed');
    const signature=await signer.signMessage(value.message);
    if(!isCurrent())throw Error('wallet_changed');
    value=await claimRequest('/api/referrals/bind',{wallet,nonce:value.nonce,signature});
  }
  if(value.bound!==true||!address(value.referrer)||!(value.code===null||code(value.code))||(value.referrer===ZERO&&value.code!==null))throw Error('invalid_provider_response');
  return {referrer:value.referrer,referralCode:value.code||'',referralBound:true};
}
