import React,{useEffect,useState} from 'react';
import {Button,CopyLinkField} from '@singlespark/component-atlas/ui';
import {SingleSparkPanel} from '@singlespark/component-atlas/primitives';
import {SingleSparkSkeleton} from '@singlespark/component-atlas/feedback';
import {createInvite} from '../../src/claims-api.mjs';
import {Notice} from './Feedback';

export function InviteLink({wallet,t}){
  const [invite,setInvite]=useState(null),[error,setError]=useState(false),[retry,setRetry]=useState(0);
  const url=invite?.wallet===wallet.address?invite.url:'';
  useEffect(()=>{
    let active=true;setInvite(null);setError(false);
    if(wallet.address)void createInvite(wallet.address).then(code=>{if(active){const url=new URL('/claim',location.origin);url.searchParams.set('ref',code);setInvite({wallet:wallet.address,url:url.href});}}).catch(()=>{if(active)setError(true);});
    return()=>{active=false;};
  },[wallet.address,retry]);

  return <SingleSparkPanel className="invite-panel"><h2>{t('inviteLink')}</h2><p>{t('inviteShareRule')}</p>
    {!wallet.address?<Button onClick={wallet.connect} disabled={wallet.busy}>{t('connect')}</Button>:url?<CopyLinkField value={url} label={t('inviteLink')} copyLabel={t('copyInvite')} copiedLabel={t('copied')} onError={()=>setError(true)}/>:!error?<SingleSparkSkeleton variant="input" height={44} label={t('loadingData')}/>:null}
    {error&&<Notice error>{t('miningUnavailable')} <Button size="sm" onClick={()=>setRetry(n=>n+1)}>{t('retry')}</Button></Notice>}
  </SingleSparkPanel>;
}
