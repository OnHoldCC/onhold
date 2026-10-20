import React,{useEffect,useState} from 'react';
import {SegmentedTabs} from '@singlespark/component-atlas/ui';
import {SingleSparkPagination} from '@singlespark/component-atlas/primitives';
import {BanPassCard} from './BanPassCard';
import {loadNftPage} from '../../src/nft-gallery.mjs';
export function NftGallery({t}){
 const [tier,setTier]=useState('all'),[page,setPage]=useState(1),[data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(false);
 useEffect(()=>{let active=true;const controller=new AbortController();setData(null);setLoading(true);setError(false);async function refresh(){try{const value=await loadNftPage(tier,page,controller.signal);if(active){setData(value);if(value.configured&&value.page!==page)setPage(value.page);setError(false);}}catch{if(active)setError(true);}finally{if(active)setLoading(false);}}void refresh();const timer=setInterval(refresh,30000);return()=>{active=false;controller.abort();clearInterval(timer);};},[tier,page]);
 return <section className="nft-gallery" aria-busy={loading}><div className="nft-gallery-heading"><div><h2>{t('allNfts')}</h2><p>{t('nftGalleryIntro')}{data?.configured?` · ${data.total}`:''}</p></div><SegmentedTabs value={tier} onChange={value=>{setTier(value);setPage(1);}} options={[{value:'all',label:t('allPlans')},{value:'pro',label:'Pro'},{value:'max',label:'Max'}]} ariaLabel={t('filterNfts')}/></div>{loading?<p role="status">{t('loadingNfts')}</p>:error||!data?.configured?<p role="status">{t('galleryUnavailable')}</p>:<>{!data.available&&<p className="fine-print">{t('gallerySyncing')}</p>}<div className="nft-gallery-grid">{data.items.map(pass=><BanPassCard key={pass.id} {...pass} t={t}/>)}</div>{!data.items.length&&<p>{t('noNfts')}</p>}{data.pages>1&&<SingleSparkPagination page={page} totalPages={data.pages} onPageChange={setPage}/>}</>}</section>;
}
