import React,{useEffect,useState} from 'react';
import {OnHoldTransactionRecovery as TransactionRecovery,OnHoldTransactionProgressDialog as TransactionProgressDialog} from '@onhold/ui/ui';
import {useInteractionTimings,timingLabels} from './InteractionTimings';
const stages=['miningPrepare','miningWalletConfirm','miningChainConfirm','miningDataSync'];
export function MiningProgress({progress,t,onClose,onRefresh,busy,explorer}){
  const timed=useInteractionTimings(progress?.timing,t);
  const [now,setNow]=useState(Date.now);
  useEffect(()=>{setNow(Date.now());if(!busy)return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[busy]);
  if(!progress)return null;
  const awaiting=Boolean(progress.pending&&!busy&&!progress.done);
  return <TransactionProgressDialog details={timed?.details} done={Boolean(progress.done&&!progress.error&&!progress.pending)} labels={{...timingLabels(t),...(awaiting?{error:t('miningAwaitingStatus')}:{} )}} open title={t(progress.action==='getReward'?'claimMining':progress.action==='claimReferralRewards'?'claimReferral':progress.action)} closeLabel={t('close')} onClose={onClose}
    status={progress.error||t(progress.done?'miningActionComplete':awaiting?'miningAwaitingStatus':stages[progress.stage])}
    steps={timed?.steps.length?timed.steps:stages.map((key,index)=>({id:key,label:t(key),status:progress.done||index<progress.stage?'complete':index===progress.stage?(progress.error||awaiting?'error':'active'):'pending'}))}
    elapsed={timed?.elapsed||`${Math.floor(Math.max(0,now-progress.started)/1000)}s`}>
   {progress.pending&&<TransactionRecovery busy={busy} onRefresh={onRefresh} transactionHref={`${explorer}/tx/${progress.pending.hash}`} refreshLabel={t('miningRefresh')} viewLabel={t('viewTransaction')}/>}
    {!progress.pending&&progress.hash&&<a href={`${explorer}/tx/${progress.hash}`} target="_blank" rel="noopener noreferrer">{t('viewTransaction')} ↗</a>}
  </TransactionProgressDialog>;
}
