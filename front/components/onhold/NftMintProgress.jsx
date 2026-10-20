import React,{useEffect,useState} from 'react';
import {TransactionProgressDialog,TransactionRecovery} from '@singlespark/component-atlas/ui';
export const mintStages=['mintUpload','mintSignature','mintAuthorize','mintTransaction','mintConfirm'];
export function NftMintProgress({progress,t,onClose,onRefresh,busy,explorer}){
 const [now,setNow]=useState(Date.now);
 useEffect(()=>{if(!busy)return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[busy]);
 if(!progress)return null;
 const steps=mintStages.map((key,index)=>({id:key,label:t(key),status:progress.done||index<progress.stage?'complete':index===progress.stage?(progress.error?'error':'active'):'pending'}));
 return <TransactionProgressDialog open title={t('bindAndClaim')} closeLabel={t('close')} onClose={onClose} status={progress.error||t(progress.done?(progress.pending?'claimSyncPending':'mintComplete'):mintStages[progress.stage])} steps={steps} elapsed={`${Math.floor((Math.max(now,progress.started)-progress.started)/1000)}s`}>
   {progress.pending&&<TransactionRecovery busy={busy} onRefresh={onRefresh} transactionHref={`${explorer}/tx/${progress.pending.tx_hash}`} refreshLabel={t('mintRefresh')} viewLabel={t('viewTransaction')}/>}
   {!progress.pending&&progress.hash&&<a href={`${explorer}/tx/${progress.hash}`} target="_blank" rel="noopener noreferrer">{t('viewTransaction')} ↗</a>}
 </TransactionProgressDialog>;
}
