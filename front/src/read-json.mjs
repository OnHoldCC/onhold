import {readHome} from './home-data.mjs';
const pending=new Map();

// Share only concurrent reads; never retain wallet or verification responses.
export function readJson(path,timeout=5000,signal,fresh=false){
  signal?.throwIfAborted();
  const key=fresh?path+'#fresh':path;
  let request=pending.get(key);
  if(!request){request=(async()=>{
    const home=!fresh&&readHome(path);
    if(home){try{return await home;}catch{}}
    const response=await fetch(path,{credentials:'omit',cache:'no-store',...(fresh?{headers:{'Cache-Control':'no-cache'}}:{}),signal:AbortSignal.timeout(timeout)});
    if(!response.ok)throw Error('read_unavailable');
    return response.json();
  })().finally(()=>pending.delete(key));
  pending.set(key,request);
  }
  if(!signal)return request;
  // A subscriber can cancel its wait without aborting another subscriber's read.
  return new Promise((resolve,reject)=>{
    const abort=()=>reject(signal.reason);
    signal.addEventListener('abort',abort,{once:true});
    request.then(resolve,reject).finally(()=>signal.removeEventListener('abort',abort));
  });
}
