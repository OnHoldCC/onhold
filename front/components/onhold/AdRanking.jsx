import React,{useEffect,useState} from 'react';
import {OnHoldEmptyState as EmptyState} from '@onhold/ui/ui';
import {OnHoldBadge as SingleSparkBadge,OnHoldList as SingleSparkList,OnHoldListItem as SingleSparkListItem,OnHoldAccordion as SingleSparkAccordion,OnHoldPagination as SingleSparkPagination,OnHoldKeyValueList as SingleSparkKeyValueList} from '@onhold/ui/primitives';
import {OnHoldMoney as SingleSparkMoney} from '@onhold/ui/core';
import {loadAdRanking} from '../../src/ad-ranking.mjs';
import {formatEth,safeUrl} from '../../src/market.mjs';
import {TokenUnit} from './Feedback';
import {chain} from '../../src/chain.mjs';

export function AdRanking({t,lang}){
  const [page,setPage]=useState(1),[data,setData]=useState(null),[loading,setLoading]=useState(true),[now,setNow]=useState(Date.now);
  useEffect(()=>{
    let active=true;const controller=new AbortController();setLoading(true);setData(null);
    async function refresh(){try{const next=await loadAdRanking(page,controller.signal);if(active){setData(next);if(next.configured&&next.page!==page)setPage(next.page);}}catch{}finally{if(active)setLoading(false);}}
    void refresh();const timer=setInterval(refresh,15000);return()=>{active=false;controller.abort();clearInterval(timer);};
  },[page]);
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
  const duration=ad=>{const seconds=Math.max(0,Math.floor(((ad.endedAt||now)-ad.startedAt)/1000));return `${Math.floor(seconds/86400)}d ${String(Math.floor(seconds/3600)%24).padStart(2,'0')}:${String(Math.floor(seconds/60)%60).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;};
  return <section className="data-card ad-ranking"><div className="section-top"><h2>{t('promotedSites')}</h2>{data?.configured&&<SingleSparkBadge>{data.total} {t('totalCampaigns')}</SingleSparkBadge>}</div>
    <SingleSparkList className="promoted-site-list" aria-label={t('promotedSites')} loading={loading}>
      {data?.items.length?data.items.map((ad,index)=><SingleSparkListItem key={`${ad.id}-${ad.version}`} className="promoted-site-item" description={null}
        leading={<span className="promoted-site-leading"><span className="promoted-site-rank">{String((page-1)*10+index+1).padStart(2,'0')}</span><span className="ranked-site-avatar">{safeUrl(ad.avatar)&&<img src={ad.avatar} alt="" loading="lazy" referrerPolicy="no-referrer"/>}</span></span>}
        title={<a className="ranked-site-name" href={ad.url} target="_blank" rel="noopener noreferrer">{new URL(ad.url).hostname}<span className="site-external-arrow" aria-hidden="true">↗</span></a>}
        trailing={<span className="promoted-site-stats"><span><small>{t('totalClicks')}</small><span>{new Intl.NumberFormat(lang).format(ad.clicks)}</span></span><span><small>{t('paidPrice')}</small><span className="token-amount"><SingleSparkMoney value={formatEth(ad.bid)}/><TokenUnit unit="BNB"/></span></span><span><small>{t('displayDuration')}</small><span>{duration(ad)}</span></span><span><small>{t('status')}</small><SingleSparkBadge className="promoted-site-status" data-status={ad.endedAt?'ended':'showing'}>{t(ad.endedAt?'ended':'showing')}</SingleSparkBadge></span></span>}>
        <SingleSparkAccordion label={t('onchainDetails')} className="promoted-site-details"><p>{ad.description}</p><div className="ranked-site-tags">{ad.tags.map(tag=><span className="feature-tag" key={tag}>{tag}</span>)}</div><SingleSparkKeyValueList entries={[[t('url'),<a href={ad.url} target="_blank" rel="noopener noreferrer">{ad.url}</a>],['Owner',<a href={`${chain.explorer}/address/${ad.advertiser}`} target="_blank" rel="noopener noreferrer">{ad.advertiser}</a>],[t('transactionHash'),ad.txHash?<a href={`${chain.explorer}/tx/${ad.txHash}`} target="_blank" rel="noopener noreferrer">{ad.txHash}</a>:t('notAvailable')]]}/></SingleSparkAccordion>
      </SingleSparkListItem>):<li><EmptyState compact title={t('notAvailable')}/></li>}
    </SingleSparkList>
    {data?.pages>1&&<SingleSparkPagination page={page} totalPages={data.pages} onPageChange={setPage}/>}
  </section>;
}
