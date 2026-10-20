export function extractSession(input){
  if(typeof input!=='string'||input.length>65536)throw Error('invalid_session');
  const text=input.trim();
  if(/^sk-ant-sid[A-Za-z0-9_-]{22,502}$/.test(text)&&text.length<=512)return text;
  const keys=[...text.matchAll(/(?:^|[;\s'"])sessionKey=(sk-ant-sid[A-Za-z0-9_-]+)(?=$|[;\s'"])/g)].map(match=>match[1]);
  const unique=[...new Set(keys)];
  if(unique.length!==1||unique[0].length<32||unique[0].length>512)throw Error('invalid_session');
  return unique[0];
}
export async function claimRequest(path,body){
  const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(path==='/api/verify'?60000:25000)});
  const value=await response.json().catch(()=>({error:'service_unavailable'}));
  if(!response.ok){const error=new Error(value.error||'service_unavailable');error.code=value.error;throw error;}return value;
}
export async function publicStatus(){try{const response=await fetch('/api/status',{credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(3000)});if(!response.ok)return null;const value=await response.json();return value.chain_id===97&&value.protocol==='nft-staking-v4'?value:null;}catch{return null;}}
export async function verifyRestriction(session){
  const value=await claimRequest('/api/verify',{session_key:extractSession(session)});
  if(value.image!==undefined||value.artwork_ready!==false||value.protocol!=='nft-staking-v4'||typeof value.verification_token!=='string'||!/^([a-f0-9]{64})$/.test(value.verification_token)||!['Pro','Max'].includes(value.plan)||value.tier!==(value.plan==='Pro'?1:2)||value.weight!==(value.tier===1?1:3)||value.standing!=='restricted'||typeof value.minted!=='boolean'||typeof value.reserved!=='boolean'||typeof value.banned_at!=='string'||typeof value.organization_suffix!=='string'||!(value.organization_name===null||typeof value.organization_name==='string')||!(value.ban_category===null||typeof value.ban_category==='string')||!value.record||typeof value.record.account!=='string'||typeof value.record.uuid!=='string'||typeof value.record.bannedAt!=='string'||typeof value.record.plan!=='string'||!Number.isSafeInteger(value.expires_at))throw Error('invalid_provider_response');
  return value;
}


export async function createInvite(wallet){
  const value=await claimRequest('/api/invites',{wallet});
  if(typeof value.code!=='string'||!/^([a-f0-9]{12})$/.test(value.code))throw Error('invalid_provider_response');
  return value.code;
}

export async function createNft(verificationToken,png,wallet,referralCode){
  if(!/^[a-f0-9]{64}$/.test(verificationToken)||!(png instanceof Blob)||png.type!=='image/png'||!png.size||png.size>5*1024*1024)throw Error('invalid_nft_image');
  if(!/^0x[0-9a-fA-F]{40}$/.test(wallet))throw Error('invalid_wallet');
  if(referralCode&&!/^[a-f0-9]{12}$/.test(referralCode))throw Error('invalid_referral_code');
  const form=new FormData();form.append('verification_token',verificationToken);form.append('wallet',wallet);if(referralCode)form.append('referral_code',referralCode);form.append('file',png,'ban-pass.png');
  const response=await fetch('/api/nft/create',{method:'POST',body:form,credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(45000)});
  const value=await response.json().catch(()=>({error:'service_unavailable'}));
  if(!response.ok)throw Object.assign(Error(value.error||'upload_failed'),{code:value.error||'upload_failed'});
  if(typeof value.message!=='string'||value.message.length>5000||!value.message||value.artwork_ready!==true||!/^https:\/\/gateway\.pinata\.cloud\/ipfs\/(?:Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{20,120})$/.test(value.image||''))throw Error('invalid_provider_response');
  return value;
}
