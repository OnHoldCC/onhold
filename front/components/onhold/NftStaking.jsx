import React,{useEffect,useState} from 'react';
import {Button,Dialog,EmptyState} from '@singlespark/component-atlas/ui';
import {SingleSparkPanel,SingleSparkPagination} from '@singlespark/component-atlas/primitives';
import {SingleSparkIcon} from '@singlespark/component-atlas/icons';
import {SingleSparkSkeleton} from '@singlespark/component-atlas/feedback';
import {loadNftPage} from '../../src/nft-gallery.mjs';
import {BanPassCard} from './BanPassCard';
import {Notice} from './Feedback';

function StakingList({wallet,market,position,revision,busy,locked,loadingId,onAction,t}){
  const [page,setPage]=useState(1),[data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(false);
  useEffect(()=>{
    let active=true;const controller=new AbortController();setData(null);setLoading(Boolean(wallet.address&&market));setError(false);
    async function refresh(){if(!wallet.address||!market)return;try{const next=await loadNftPage('all',page,controller.signal,{wallet:wallet.address,market,position});if(active){setData(next);setError(false);if(next.page&&next.page!==page)setPage(next.page);}}catch{if(active)setError(true);}finally{if(active)setLoading(false);}}
    void refresh();const timer=setInterval(refresh,15000);return()=>{active=false;controller.abort();clearInterval(timer);};
  },[wallet.address,market,position,page,revision]);
  if(!wallet.address)return <EmptyState title={t('notConnected')} action={<Button onClick={wallet.connect} loading={wallet.busy}>{t('connect')}</Button>}/>;
  return <>{(error||data?.configured===false||!market)&&<Notice error>{t('miningUnavailable')}</Notice>}{data?.stale&&<Notice>{t('gallerySyncing')}</Notice>}
    <div className="mining-passes staking-nft-list" aria-busy={loading}>
      {loading&&!data?[0,1,2].map(id=><SingleSparkSkeleton key={id} variant="card" height={330} label={t('loadingData')}/>):data?.items.length?data.items.map(pass=><div className="mining-pass" key={pass.id}><BanPassCard {...pass} t={t}/><Button onClick={()=>onAction(position==='staked'?'unstake':'stake',pass.id)} disabled={busy||locked||error||!data.available||data.stale||(position==='owned'&&!wallet.referralBound)} loading={busy&&loadingId===String(pass.id)}>{t(position==='staked'?'unstake':'stake')} #{pass.id}</Button></div>):!error&&data?.available?<EmptyState className="staking-empty" icon={<SingleSparkIcon name="collectible" size={28}/>} title={t(position==='staked'?'noStakedNfts':'noAvailableNfts')}/>:null}
    </div>
    {data?.pages>1&&<SingleSparkPagination page={page} totalPages={data.pages} onPageChange={setPage}/>}
  </>;
}
export function NftStaking({wallet,market,revision,busy,locked,loadingId,onAction,t}){
  const [open,setOpen]=useState(false);
  useEffect(()=>setOpen(false),[wallet.address,market]);
  return <SingleSparkPanel className="mining-position nft-staking"><div className="section-top"><h2>{t('stakedNfts')}</h2>{wallet.address&&<Button onClick={()=>setOpen(true)} disabled={busy||locked||!market||!wallet.referralBound}><SingleSparkIcon name="plus"/>{t('addStake')}</Button>}</div>
    <StakingList key={`${market}:${wallet.address}`} wallet={wallet} market={market} position="staked" revision={revision} busy={busy} locked={locked} loadingId={loadingId} onAction={onAction} t={t}/>
    <Dialog open={open} onClose={()=>setOpen(false)} ariaLabel={t('addStake')} className="dialog wide staking-picker"><div className="dialog-header"><h2>{t('addStake')}</h2><Button variant="ghost" onClick={()=>setOpen(false)} aria-label={t('close')}><SingleSparkIcon name="close"/></Button></div>{open&&<StakingList key={`${market}:${wallet.address}`} wallet={wallet} market={market} position="owned" revision={revision} busy={busy} locked={locked} loadingId={loadingId} onAction={async(action,id)=>{if(await onAction(action,id))setOpen(false);}} t={t}/>}</Dialog>
  </SingleSparkPanel>;
}
