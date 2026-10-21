import {getAddress} from 'ethers/address';
import {createInteractionTiming} from './interaction-timing.mjs';
export async function approveNftStake(nft,vault,wallet,tokenId,referrer,checkWallet,timing=createInteractionTiming()){
  if(!/^0x[0-9a-fA-F]{40}$/.test(referrer||''))throw Error('referral_binding_required');
  if(!await timing.measure('contractRead',()=>nft.referralBound(wallet))){
    await checkWallet();const tx=await timing.measure('bindTransaction',()=>nft.bindReferrer(referrer));await timing.measure('bindConfirm',()=>tx.wait());
  }
  if(getAddress(await timing.measure('contractRead',()=>nft.referrerOf(wallet)))!==getAddress(referrer))throw Error('referrer_already_bound');
  if(getAddress(await timing.measure('contractRead',()=>nft.getApproved(tokenId)))!==getAddress(vault)&&!await timing.measure('contractRead',()=>nft.isApprovedForAll(wallet,vault))){
    await checkWallet();const tx=await timing.measure('approveTransaction',()=>nft.approve(vault,tokenId));await timing.measure('approveConfirm',()=>tx.wait());
  }
  await checkWallet();
}
