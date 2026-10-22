import React,{useEffect,useState} from 'react';
import {DataTable,SegmentedTabs} from '@singlespark/component-atlas/ui';
import {SingleSparkPanel,SingleSparkKeyValueList,SingleSparkPagination} from '@singlespark/component-atlas/primitives';
import {DataValue,Notice} from './Feedback';
import {loadReferralHistory} from '../../src/referral-history.mjs';
import {chain} from '../../src/chain.mjs';
import {referralHistoryCopy} from '../../src/referral-history-copy.mjs';

export function ReferralHistory({wallet,market,t:sharedText,lang}){
 const t=key=>referralHistoryCopy[lang]?.[key]??referralHistoryCopy.en[key]??sharedText(key);
 const [tab,setTab]=useState('people'),[page,setPage]=useState(1),[eventsPage,setEventsPage]=useState(1),[data,setData]=useState(null),[loading,setLoading]=useState(Boolean(wallet&&market)),[error,setError]=useState(false);
 const current=data?.wallet?.toLowerCase()===wallet?.toLowerCase()&&data?.market?.toLowerCase()===market?.toLowerCase()?data:null;
 useEffect(()=>{
  let active=true,running=false;const controller=new AbortController();setData(null);setError(false);setLoading(Boolean(wallet&&market));
  async function refresh(){if(!wallet||!market||running||document.hidden)return;running=true;try{const next=await loadReferralHistory(market,wallet,page,eventsPage,controller.signal);if(active){setData(next);setError(!next.available);if(next.available){if(next.page!==page)setPage(next.page);if(next.eventsPage!==eventsPage)setEventsPage(next.eventsPage);}}}catch{if(active)setError(true);}finally{running=false;if(active)setLoading(false);}}
  void refresh();const timer=setInterval(refresh,15000);window.addEventListener('onhold:mining-updated',refresh);document.addEventListener('visibilitychange',refresh);
  return()=>{active=false;controller.abort();clearInterval(timer);window.removeEventListener('onhold:mining-updated',refresh);document.removeEventListener('visibilitychange',refresh);};
 },[market,wallet,page,eventsPage]);
 const known=current?.available===true;
 const number=value=><DataValue value={value} loading={loading} t={t} lang={lang}/>;
 const money=value=><DataValue value={value} loading={loading} t={t} lang={lang} digits={8} unit="$OnHold"/>;
 const address=value=><a href={`${chain.explorer}/address/${value}`} title={value} target="_blank" rel="noopener noreferrer">{value.slice(0,6)}…{value.slice(-4)}</a>;
 const peopleColumns=[{id:'wallet',header:t('referralWallet'),cell:row=>address(row.wallet)},{id:'stakes',header:t('referralStaked'),cell:row=>number(row.stakedCount)},{id:'weight',header:t('nftWeight'),cell:row=>number(row.weight)},{id:'base',header:t('referralBaseRewards'),cell:row=>money(row.baseRewards)},{id:'contribution',header:t('referralContribution'),cell:row=>money(row.contribution)}];
 const eventColumns=[{id:'kind',header:t('referralEventType'),cell:row=>t({bound:'referralBoundEvent',accrued:'referralAccruedEvent',paid:'referralPaidEvent'}[row.kind])},{id:'wallet',header:t('referralEventWallet'),cell:row=>address(row.wallet)},{id:'base',header:t('referralEventBase'),cell:row=>row.baseReward===null?'—':money(row.baseReward)},{id:'amount',header:t('referralEventAmount'),cell:row=>row.amount===null?'—':money(row.amount)},{id:'block',header:t('confirmedBlock'),cell:row=>number(row.block)},{id:'tx',header:t('transactionHash'),cell:row=><a href={`${chain.explorer}/tx/${row.txHash}`} target="_blank" rel="noopener noreferrer">{row.txHash.slice(0,8)}…{row.txHash.slice(-4)} ↗</a>}];
 const empty=t(!wallet?'notConnected':error?'referralHistoryUnavailable':tab==='people'?'referralNoPeople':'referralNoEvents');
 return <SingleSparkPanel className="mining-position"><h2>{t('referralHistory')}</h2><p className="fine-print">{t('referralHistoryNote')}</p>
  {wallet&&<SingleSparkKeyValueList entries={[[t('referralCount'),number(known?current.summary.invited:null)],[t('referralActive'),number(known?current.summary.active:null)]]}/>}
  <SegmentedTabs value={tab} onChange={setTab} options={[{value:'people',label:t('referralPeople')},{value:'events',label:t('referralEvents')}]} ariaLabel={t('referralHistory')}/>
  {error&&<Notice error>{t('referralHistoryUnavailable')}</Notice>}{known&&current.stale&&<Notice>{t('gallerySyncing')}</Notice>}
  <DataTable ariaLabel={t(tab==='people'?'referralPeople':'referralEvents')} columns={tab==='people'?peopleColumns:eventColumns} rows={known?(tab==='people'?current.items:current.events):[]} rowKey={row=>row.txHash?`${row.txHash}:${row.logIndex}`:row.wallet} loading={loading} loadingLabel={t('loadingData')} loadingRows={3} emptyTitle={empty} gridTemplateColumns={tab==='people'?'1.1fr .7fr .7fr 1.4fr 1.4fr':'1.2fr 1fr 1.3fr 1.3fr .8fr 1fr'} minWidth={tab==='people'?680:850}/>
  {known&&(tab==='people'?current.pages:current.eventsPages)>1&&<SingleSparkPagination page={tab==='people'?current.page:current.eventsPage} totalPages={tab==='people'?current.pages:current.eventsPages} onPageChange={tab==='people'?setPage:setEventsPage}/>}
 </SingleSparkPanel>;
}
