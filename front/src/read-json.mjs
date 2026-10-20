const pending=new Map();

// Share only concurrent reads; never retain wallet or verification responses.
export function readJson(path,timeout=5000){
  if(pending.has(path))return pending.get(path);
  const request=(async()=>{
    const response=await fetch(path,{credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(timeout)});
    if(!response.ok)throw Error('read_unavailable');
    return response.json();
  })().finally(()=>pending.delete(path));
  pending.set(path,request);
  return request;
}
