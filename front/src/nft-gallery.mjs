export async function loadNftPage(tier,page,signal,account){
 if(!['all','free','pro','max'].includes(tier)||!Number.isSafeInteger(page)||page<1)throw Error('invalid_page');
 const params=new URLSearchParams({tier,page:String(page),page_size:'12'});
 if(account){if(!/^0x[0-9a-fA-F]{40}$/.test(account.wallet)||!/^0x[0-9a-fA-F]{40}$/.test(account.market)||!['owned','staked'].includes(account.position))throw Error('invalid_position');for(const key of ['wallet','market','position'])params.set(key,account[key].toLowerCase());}
 const response=await fetch(`/api/nfts?${params}`,{credentials:'omit',cache:'no-store',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(5000)]):AbortSignal.timeout(5000)});
 if(!response.ok)throw Error('gallery_unavailable');const value=await response.json();
 if(value.configured===false&&value.available===false&&Array.isArray(value.items))return value;
 if(value.configured!==true||value.storage!=='postgresql'||value.tier!==tier||!Number.isSafeInteger(value.page)||value.page<1||!Number.isSafeInteger(value.total)||value.total<0||!Number.isSafeInteger(value.pages)||value.pages<1||!Array.isArray(value.items)||value.items.length>12||value.items.some(item=>!/^\d+$/.test(item.id)||![0,1,2].includes(item.tier)||(tier!=='all'&&item.tier!==(tier==='pro'?1:tier==='max'?2:0))))throw Error('invalid_gallery_response');
 if(account&&(value.wallet?.toLowerCase()!==account.wallet.toLowerCase()||value.market?.toLowerCase()!==account.market.toLowerCase()||value.position!==account.position||value.items.some(pass=>account.position==='staked'?pass.staked!==true||pass.staker?.toLowerCase()!==account.wallet.toLowerCase():pass.staked!==false||pass.owner?.toLowerCase()!==account.wallet.toLowerCase())))throw Error('invalid_gallery_response');
 return value;
}
