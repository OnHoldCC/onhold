export async function loadReferralHistory(market,wallet,page=1,eventsPage=1,signal){
 const address=value=>typeof value==='string'&&/^0x[0-9a-fA-F]{40}$/.test(value);
 if(!address(market)||!address(wallet)||![page,eventsPage].every(n=>Number.isSafeInteger(n)&&n>0))throw Error('invalid_referral_request');
 const query=new URLSearchParams({market:market.toLowerCase(),wallet:wallet.toLowerCase(),page:String(page),events_page:String(eventsPage)});
 const response=await fetch(`/api/referrals?${query}`,{credentials:'omit',cache:'no-store',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(5000)]):AbortSignal.timeout(5000)});
 if(!response.ok)throw Error('referral_history_unavailable');const value=await response.json();
 if(value.configured===false&&value.available===false&&Array.isArray(value.items)&&Array.isArray(value.events))return value;
 const count=n=>Number.isSafeInteger(n)&&n>=0,amount=n=>typeof n==='string'&&/^\d+\.\d{18}$/.test(n);
 if(value.configured!==true||typeof value.available!=='boolean'||typeof value.stale!=='boolean'||value.chain_id!==97||value.storage!=='postgresql'||!address(value.market)||!address(value.wallet)||value.market.toLowerCase()!==market.toLowerCase()||value.wallet.toLowerCase()!==wallet.toLowerCase()||!['page','pages','eventsPage','eventsPages'].every(key=>count(value[key])&&value[key]>0)||!['total','eventsTotal','confirmed_block'].every(key=>count(value[key]))||!value.summary||!count(value.summary.invited)||!count(value.summary.active)||!amount(value.summary.pending)||!amount(value.summary.earned)||!Array.isArray(value.items)||value.items.length>8||!Array.isArray(value.events)||value.events.length>8)throw Error('invalid_referral_history');
 for(const item of value.items)if(!address(item.wallet)||!count(item.weight)||!count(item.stakedCount)||!amount(item.baseRewards)||!amount(item.contribution))throw Error('invalid_referral_history');
 for(const event of value.events)if(!['bound','accrued','paid'].includes(event.kind)||!address(event.wallet)||!/^0x[0-9a-fA-F]{64}$/.test(event.txHash)||!count(event.block)||event.block>value.confirmed_block||!count(event.logIndex)||(event.kind==='bound'?event.amount!==null:!amount(event.amount))||(event.kind==='accrued'?!amount(event.baseReward):event.baseReward!==null))throw Error('invalid_referral_history');
 return value;
}
