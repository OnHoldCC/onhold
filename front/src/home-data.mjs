import config from './chain-config.json' with {type:'json'};
const market=(config.marketAddress||'').toLowerCase();
const keys=['/api/stats',`/api/chain?market=${market}`,'/api/mining-stats?period=30d'];
const storageKey='onhold.public-home.v1';
let current,loaded=false,pending,generation=0;
const keyFor=path=>keys.find(key=>key===path || (key.startsWith('/api/chain?')&&key===path.toLowerCase()));
function valid(value){
 return value?.version===1&&Number.isSafeInteger(value.capturedAt)&&value.capturedAt<=Date.now()+1000&&Date.now()-value.capturedAt<15000&&value.paths&&Object.keys(value.paths).length===3&&keys.every(key=>value.paths[key]&&typeof value.paths[key]==='object'&&value.paths[key].available!==false&&value.paths[key].configured!==false);
}
function initial(){
 if(loaded)return;loaded=true;
 try{const inline=document.getElementById('onhold-home-data')?.textContent;const value=JSON.parse(inline||sessionStorage.getItem(storageKey)||'null');if(valid(value))current=value;}catch{}
}
function refresh(){
 if(pending)return pending;
 const started=generation;
 const request=(async()=>{
  const response=await fetch('/api/home',{credentials:'omit',cache:'no-store',headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(5000)});
  if(!response.ok)throw Error('home_unavailable');
  const value=await response.json();if(!valid(value))throw Error('invalid_home');
  if(generation!==started)throw Error('home_changed');
  if(generation===started){
   const changed=current?.capturedAt!==value.capturedAt;current=value;
   try{sessionStorage.setItem(storageKey,JSON.stringify(value));}catch{}
   if(changed&&typeof window!=='undefined')window.dispatchEvent(new Event('onhold:home-data'));
  }
  return value;
 })().finally(()=>{if(pending===request)pending=undefined;});
 pending=request;return request;
}
export function readHome(path){
 if(typeof document==='undefined')return null;
 const key=keyFor(path);if(!market||!key)return null;
 initial();
 if(current&&valid(current)){
  if(Date.now()-current.capturedAt>=5000)void refresh().catch(()=>{});
  return Promise.resolve(structuredClone(current.paths[key]));
 }
 return refresh().then(value=>structuredClone(value.paths[key]));
}
export function invalidateHome(){generation++;current=undefined;loaded=true;pending=undefined;try{sessionStorage.removeItem(storageKey);}catch{}}
