// Local test harness only; private keys remain in the loopback bridge process.
(()=>{
 const config=document.currentScript.dataset;
 const listeners=new Map();let selected='user';
 const rpc=async(method,params=[])=>{
  const response=await fetch('/__e2e/wallet',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({method,params,role:selected})});
  const body=await response.json();if(body.error)throw Object.assign(new Error(body.error.message),{code:body.error.code});return body.result;
 };
 async function approve(method,params){
  return new Promise((resolve,reject)=>{
   const dialog=document.createElement('dialog');dialog.style.cssText='z-index:2147483647;max-width:650px;padding:24px;border:2px solid #ed844e;border-radius:12px;background:#fff;color:#111';
   const title=document.createElement('h2');title.textContent='Mock test wallet · BNB Testnet 97';
   const details=document.createElement('pre');details.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;max-height:50vh;overflow:auto';
   details.textContent=method==='personal_sign'?new TextDecoder().decode(Uint8Array.from(params[0].slice(2).match(/../g)||[],h=>parseInt(h,16))):JSON.stringify(params,null,2);
   const cancel=document.createElement('button');cancel.textContent='Reject';
   const confirm=document.createElement('button');confirm.textContent=method==='eth_sendTransaction'?'Confirm testnet transaction':method==='personal_sign'?'Sign test consent':'Connect test wallet';confirm.style.marginLeft='20px';
   const close=()=>{dialog.close();dialog.remove();};cancel.onclick=()=>{close();reject(Object.assign(new Error('Rejected'),{code:4001}));};dialog.oncancel=event=>{event.preventDefault();cancel.click();};confirm.onclick=()=>{close();resolve();};
   dialog.append(title,details,cancel,confirm);document.body.append(dialog);dialog.showModal();
  });
 }
 window.ethereum={isOnholdTestWallet:true,onholdTestMarket:config.market,request:async({method,params=[]})=>{
  if(['eth_requestAccounts','personal_sign','eth_sendTransaction'].includes(method))await approve(method,params);
  return rpc(method,params);
 },on:(event,handler)=>{if(!listeners.has(event))listeners.set(event,new Set());listeners.get(event).add(handler);},removeListener:(event,handler)=>listeners.get(event)?.delete(handler)};
 document.addEventListener('DOMContentLoaded',()=>{
  const bar=document.createElement('aside');bar.style.cssText='position:fixed;bottom:0;left:0;right:0;padding:8px;background:#ffdf9e;color:#111;z-index:2147483600;text-align:center;font:13px sans-serif';
  const text=document.createElement('span');text.textContent=`TEST ONLY · ${config.realStanding==='true'?'Real Claude verification':'Synthetic account'} · ${config.repeatUuid==='true'?'Repeat UUID enabled · ':''}Mock swap pricing · Wallet: `;
  const select=document.createElement('select');select.setAttribute('aria-label','Test wallet account');for(const role of ['user','inviter']){const option=document.createElement('option');option.value=role;option.textContent=role;select.append(option);}
  select.onchange=async()=>{selected=select.value;const accounts=await rpc('eth_requestAccounts');for(const fn of listeners.get('accountsChanged')||[])fn(accounts);};
  const fixture=document.createElement('code');fixture.textContent=config.realStanding==='true'?' · Enter your real sessionKey in the form; do not post it in chat.':' · Fixture session: sk-ant-sid-onhold-mock-browser-pro-20261020';
  bar.append(text,select,fixture);document.body.append(bar);
 });
})();
