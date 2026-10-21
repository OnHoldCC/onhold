import {readJson} from './read-json.mjs';
import {createInteractionTiming} from './interaction-timing.mjs';
const actions=new Set(['stake','unstake','getReward','claimReferralRewards']);
const address=value=>/^0x[0-9a-f]{40}$/i.test(value||'');
const hash=value=>/^0x[0-9a-f]{64}$/i.test(value||'');
const key=(market,wallet)=>`onhold.miningpending.v1:97:${market.toLowerCase()}:${wallet.toLowerCase()}`;
export function pendingMining(market,wallet){
  if(!address(market)||!address(wallet))return null;
  try{const value=JSON.parse(localStorage.getItem(key(market,wallet)));return value?.chainId===97&&value.market.toLowerCase()===market.toLowerCase()&&value.wallet.toLowerCase()===wallet.toLowerCase()&&hash(value.hash)&&actions.has(value.action)&&Number.isSafeInteger(value.started)?value:null;}catch{return null;}
}
export function rememberMining(pending){
  try{localStorage.setItem(key(pending.market,pending.wallet),JSON.stringify(pending));}catch{}
}
export function clearMining(pending){
  if(pendingMining(pending.market,pending.wallet)?.hash!==pending.hash)return;
  try{localStorage.removeItem(key(pending.market,pending.wallet));}catch{}
}
export async function miningReceipt(pending){
  if(!hash(pending.hash)||!address(pending.market)||!address(pending.wallet))throw Error('invalid_transaction');
  const value=await readJson(`/api/transactions/${pending.hash}`,8000);
  if(value.chainId!==97||value.hash?.toLowerCase()!==pending.hash.toLowerCase()||value.market?.toLowerCase()!==pending.market.toLowerCase()||!['pending','confirming','confirmed','failed'].includes(value.status)||value.status!=='pending'&&(value.from?.toLowerCase()!==pending.wallet.toLowerCase()||!Number.isSafeInteger(value.blockNumber)||value.blockNumber<1)||value.status==='confirmed'&&(!Number.isSafeInteger(value.confirmedBlock)||value.confirmedBlock<value.blockNumber))throw Error('invalid_transaction_receipt');
  if(value.status==='failed'){clearMining(pending);throw Error('mining_transaction_failed');}
  return value;
}
export async function confirmMining(pending,onProgress=()=>{},wait=true,timing=createInteractionTiming()){
 return timing.measure('chainConfirm',async()=>{
  const deadline=Date.now()+90000;
  onProgress({stage:2,pending,hash:pending.hash});
  while(true){
    try{
      const receipt=await miningReceipt(pending);
      if(receipt.status==='confirmed'){onProgress({stage:3,pending,hash:pending.hash});return {hash:pending.hash,blockNumber:receipt.blockNumber,pending};}
    }catch(cause){if(['mining_transaction_failed','invalid_transaction_receipt'].includes(cause.message))throw cause;}
    if(!wait||Date.now()>=deadline){const cause=Error('mining_confirmation_pending');cause.pending=pending;throw cause;}
    await new Promise(resolve=>setTimeout(resolve,2000));
  }
 });
}
