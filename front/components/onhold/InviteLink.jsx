import React,{useEffect,useState} from 'react';
import {Button,Input} from '@singlespark/component-atlas/ui';
import {SingleSparkIcon} from '@singlespark/component-atlas/icons';
import {SingleSparkPanel} from '@singlespark/component-atlas/primitives';
import {SingleSparkSkeleton} from '@singlespark/component-atlas/feedback';
import {createInvite} from '../../src/claims-api.mjs';
import {Notice} from './Feedback';

export function InviteLink({wallet,t}){
  const [invite,setInvite]=useState(null),[error,setError]=useState(false),[copied,setCopied]=useState(false),[retry,setRetry]=useState(0);
  const url=invite?.wallet===wallet.address?invite.url:'';
  useEffect(()=>{
    let active=true;setInvite(null);setError(false);setCopied(false);
    if(wallet.address)void createInvite(wallet.address).then(code=>{if(active){const url=new URL('/claim',location.origin);url.searchParams.set('ref',code);setInvite({wallet:wallet.address,url:url.href});}}).catch(()=>{if(active)setError(true);});
    return()=>{active=false;};
  },[wallet.address,retry]);
  async function copy(){try{await navigator.clipboard.writeText(url);setCopied(true);}catch{setError(true);}}
  return <SingleSparkPanel className="invite-panel"><h2>{t('inviteLink')}</h2><p>{t('inviteShareRule')}</p>
    {!wallet.address?<Button onClick={wallet.connect} disabled={wallet.busy}>{t('connect')}</Button>:url?<div className="invite-link-field"><Input readOnly value={url} aria-label={t('inviteLink')}/><Button variant="ghost" className="invite-copy" onClick={copy} aria-label={t(copied?'copied':'copyInvite')} title={t(copied?'copied':'copyInvite')}><SingleSparkIcon name={copied?'check':'copy'}/></Button></div>:!error?<SingleSparkSkeleton variant="input" height={44} label={t('loadingData')}/>:null}
    {error&&<Notice error>{t('miningUnavailable')} <Button size="sm" onClick={()=>setRetry(n=>n+1)}>{t('retry')}</Button></Notice>}
  </SingleSparkPanel>;
}
