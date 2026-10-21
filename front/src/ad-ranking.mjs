import {safeUrl} from './market.mjs';
export async function loadAdRanking(page,signal){
  if(!Number.isSafeInteger(page)||page<1)throw Error('invalid_page');
  const response=await fetch(`/api/ads?page=${page}`,{cache:'no-store',credentials:'omit',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(5000)]):AbortSignal.timeout(5000)});
  if(!response.ok)throw Error('ads_unavailable');const value=await response.json();
  if(value.configured===false&&Array.isArray(value.items))return value;
  if(value.configured!==true||!Number.isSafeInteger(value.page)||value.page<1||!Number.isSafeInteger(value.pages)||value.pages<value.page||!Number.isSafeInteger(value.total)||value.total<0||!Array.isArray(value.items)||value.items.length>10||value.items.some(ad=>!/^0x[0-9a-fA-F]{40}$/.test(ad.advertiser)||!(ad.txHash==null||/^0x[0-9a-fA-F]{64}$/.test(ad.txHash))||!safeUrl(ad.url)||typeof ad.description!=='string'||!Array.isArray(ad.tags)||ad.tags.some(tag=>typeof tag!=='string')||!Number.isSafeInteger(ad.clicks)||ad.clicks<0||!/^\d{1,78}$/.test(ad.bid)||!Number.isSafeInteger(ad.startedAt)||ad.startedAt<=0||!(ad.endedAt==null||Number.isSafeInteger(ad.endedAt)&&ad.endedAt>=ad.startedAt)))throw Error('invalid_ads_response');
  return value;
}
