import {claimRequest} from './claims-api.mjs';
import {createInteractionTiming} from './interaction-timing.mjs';
export function pendingMint(){
  try{const value=JSON.parse(localStorage.getItem('onhold.nftreceipt'));return /^0x[0-9a-f]{64}$/i.test(value?.tx_hash)&&/^0x[0-9a-f]{64}$/i.test(value?.nullifier)?value:null;}catch{return null;}
}
export async function recordMint(pending){
  await claimRequest('/api/nft/receipt',pending);
  try{localStorage.removeItem('onhold.nftreceipt');}catch{}
  return {hash:pending.tx_hash,recorded:true};
}
export async function confirmMint(transaction,nullifier,onProgress,timing=createInteractionTiming()){
  let pending={tx_hash:transaction.hash,nullifier};
  const save=()=>{try{localStorage.setItem('onhold.nftreceipt',JSON.stringify(pending));}catch{}onProgress({stage:4,pending,hash:pending.tx_hash});};
  save();
  try{
    let receipt;
    try{receipt=await timing.measure('chainConfirm',()=>transaction.wait(3));}catch(cause){
      if(cause.code==='TRANSACTION_REPLACED'&&!cause.cancelled&&cause.receipt?.status===1){receipt=cause.receipt;pending={...pending,tx_hash:receipt.hash};save();}
      else {if(cause.receipt?.status===0||cause.cancelled){try{localStorage.removeItem('onhold.nftreceipt');}catch{}throw Error('mint_transaction_failed');}throw cause;}
    }
    if(receipt?.status!==1){try{localStorage.removeItem('onhold.nftreceipt');}catch{}throw Error('mint_transaction_failed');}
  }catch(cause){if(cause.message!=='mint_transaction_failed')cause.pending=pending;throw cause;}
  try{return await timing.measure('receiptSync',()=>recordMint(pending));}catch{return {hash:pending.tx_hash,recorded:false};}
}
