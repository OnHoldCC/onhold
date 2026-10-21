import React,{useEffect,useState} from 'react';
import {TransactionProgressDialog,TransactionRecovery} from '@singlespark/component-atlas/ui';
const stages=['miningPrepare','miningWalletConfirm','miningChainConfirm','miningDataSync'];
export function MiningProgress({progress,t,onClose,onRefresh,busy,explorer}){
  const [now,setNow]=useState(Date.now);
  useEffect(()=>{setNow(Date.now());if(!busy)return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[busy]);
  if(!progress)return null;
  const awaiting=Boolean(progress.pending&&!busy&&!progress.done);
  return <TransactionProgressDialog labels={{...Object.fromEntries(['pending','active','complete','error','steps','elapsed'].map(key=>[key,t('txStatus.'+key)])),...(awaiting?{error:t('miningAwaitingStatus')}:{} )}} open title={t(progress.action==='getReward'?'claimMining':progress.action==='claimReferralRewards'?'claimReferral':progress.action)} closeLabel={t('close')} onClose={onClose}
    status={progress.error||t(progress.done?'miningActionComplete':awaiting?'miningAwaitingStatus':stages[progress.stage])}
    steps={stages.map((key,index)=>({id:key,label:t(key),status:progress.done||index<progress.stage?'complete':index===progress.stage?(progress.error||awaiting?'error':'active'):'pending'}))}
    elapsed={`${Math.floor(Math.max(0,now-progress.started)/1000)}s`}>
    {progress.pending&&<TransactionRecovery busy={busy} onRefresh={onRefresh} transactionHref={`${explorer}/tx/${progress.pending.hash}`} refreshLabel={t('miningRefresh')} viewLabel={t('viewTransaction')}/>}
    {!progress.pending&&progress.hash&&<a href={`${explorer}/tx/${progress.hash}`} target="_blank" rel="noopener noreferrer">{t('viewTransaction')} ↗</a>}
  </TransactionProgressDialog>;
}
