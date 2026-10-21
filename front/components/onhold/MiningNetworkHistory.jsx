import React,{useEffect,useState} from 'react';
import {SegmentedTabs} from '@singlespark/component-atlas/ui';
import {AnalyticsCharts} from '@singlespark/component-atlas/singlespark';
import {SingleSparkSkeleton} from '@singlespark/component-atlas/feedback';
import {TokenUnit,Notice} from './Feedback';
import {loadMiningStats,miningPeriods} from '../../src/mining-stats.mjs';

export function MiningNetworkHistory({t,lang}){
  const [period,setPeriod]=useState('1d'),[metric,setMetric]=useState('totalWeight'),[data,setData]=useState(null),[error,setError]=useState(false);
  useEffect(()=>{
    let active=true;const controller=new AbortController();setData(null);setError(false);
    async function refresh(){try{const next=await loadMiningStats(period,controller.signal);if(active){setData(next);setError(false);}}catch{if(active)setError(true);}}
    void refresh();const timer=setInterval(refresh,900000);
    return()=>{active=false;controller.abort();clearInterval(timer);};
  },[period]);
  const rows=data?.history||[],label=t(metric==='totalWeight'?'networkWeight':'perWeightDaily');
  const number=value=>new Intl.NumberFormat(lang==='zh'?'zh-CN':lang,{maximumFractionDigits:4}).format(Number(value));


  return <section className="data-card">
    <div className="mining-history-controls">
      <SegmentedTabs value={metric} onChange={setMetric} options={[{value:'totalWeight',label:t('networkWeight')},{value:'perWeightDaily',label:t('perWeightDaily')}]} ariaLabel={t('miningCompetition')}/>
      <SegmentedTabs value={period} onChange={setPeriod} options={miningPeriods.map(value=>({value,label:value.toUpperCase()}))} ariaLabel={t('timeRange')}/>
    </div>
    {error?<Notice error>{t('miningUnavailable')}</Notice>:!data?<div className="u-business mining-network-bars" role="status" aria-label={t('loadingData')} aria-busy="true"><div className="ub-analytics-charts"><section className="ub-analytics-chart"><header><h3>{label}</h3><strong><SingleSparkSkeleton variant="input" width="4ch" height={30} decorative/></strong><p/></header><div className="ub-bar-surface"><SingleSparkSkeleton variant="input" height={160} decorative/><div className="ub-axis">{[0,1,2].map(index=><SingleSparkSkeleton key={index} variant="input" width={64} height={15} decorative/>)}</div></div></section></div></div>:<>
      <AnalyticsCharts className="mining-network-bars" charts={[{
        description:'',title:label,values:rows.map(row=>Number(row[metric])),
        total:data.latest?number(data.latest[metric]):t('notAvailable'),
        labels:rows.map(row=>new Date(row.sampledAt*1000).toLocaleString(lang,{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})),
        valueLabels:rows.map(row=>number(row[metric])),
        emptyText:t('miningHistoryPending')
      }]}/>
      <div className="mining-history-footer">{rows.length>0&&<details className="chart-table"><summary>{t('chartData')}</summary><table><thead><tr><th>{t('date')}</th><th>{label}</th></tr></thead><tbody>{rows.map(row=><tr key={row.sampledAt}><td>{new Date(row.sampledAt*1000).toLocaleString(lang)}</td><td>{number(row[metric])}{metric==='perWeightDaily'&&<TokenUnit unit="$Claude"/>}</td></tr>)}</tbody></table></details>}
      {rows.length>0&&<p className="fine-print">{new Date(rows[0].sampledAt*1000).toLocaleString(lang)} — {new Date(rows.at(-1).sampledAt*1000).toLocaleString(lang)}</p>}</div>
    </>}
    {!data&&!error&&<div className="mining-history-footer"><SingleSparkSkeleton variant="text" rows={2} label={t('loadingData')}/></div>}
  </section>;
}
