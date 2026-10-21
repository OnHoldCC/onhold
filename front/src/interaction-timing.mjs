// Keep only durations and fixed stage names in memory, never signatures or wallet payloads.
export function createInteractionTiming(onChange){
 const state={started:performance.now(),ended:null,rows:[]};
 const publish=()=>{try{onChange?.({...state,rows:state.rows.map(row=>({...row}))});}catch{/* Timing feedback must never interrupt a transaction. */}};
 return {
  async measure(key,task){
   if(state.ended!==null)return task();
   const row={id:`${key}-${state.rows.length}`,key,started:performance.now(),duration:null,status:'active'};
   state.rows.push(row);publish();
   try{const value=await task();if(state.ended===null)row.status='complete';return value;}
   catch(error){if(state.ended===null)row.status='error';throw error;}
   finally{if(state.ended===null){row.duration=Math.max(0,performance.now()-row.started);publish();}}
  },
  finish(){if(state.ended!==null)return;state.ended=performance.now();for(const row of state.rows)if(row.status==='active'){row.status='error';row.duration=Math.max(0,state.ended-row.started);}publish();}
 };
}
export const timingKinds={connect:'wallet',walletPrepare:'local',walletCheck:'local',referralCheck:'backend',referralSave:'backend',signature:'wallet',upload:'backend',authorize:'backend',contractRead:'rpc',estimateGas:'rpc',sendTransaction:'wallet',chainConfirm:'chain',receiptSync:'backend',dataSync:'backend',bindTransaction:'wallet',bindConfirm:'chain',approveTransaction:'wallet',approveConfirm:'chain'};
export const formatDuration=ms=>ms<1000?`${Math.round(Math.max(0,ms))} ms`:`${(ms/1000).toFixed(1)} s`;
export function timingSteps(timing,t,now){
 return timing.rows.map(row=>({id:row.id,label:t(`timing.${row.key}`),description:t(`timing.wait.${timingKinds[row.key]||'local'}`),status:row.status,elapsed:formatDuration(row.duration??Math.max(0,(timing.ended??now)-row.started))}));
}
export function compactTimingSteps(timing,t,now){
 const groups=new Map(),groupFor={walletPrepare:'prepare',walletCheck:'prepare',contractRead:'prepare',bindTransaction:'bind',bindConfirm:'bind',approveTransaction:'approve',approveConfirm:'approve',receiptSync:'dataSync'};
 for(const row of timing.rows){
  const key=groupFor[row.key]||row.key;
  if(!groups.has(key))groups.set(key,{id:key,label:t(`timing.${key}`),status:'complete',duration:0});
  const group=groups.get(key);
  group.duration+=row.duration??Math.max(0,(timing.ended??now)-row.started);
  if(row.status==='active'){group.status='active';group.description=t(`timing.wait.${timingKinds[row.key]||'local'}`);}
  else if(row.status==='error'&&group.status!=='active')group.status='error';
 }
 return [...groups.values()].map(({duration,...group})=>({...group,elapsed:formatDuration(duration)}));
}
