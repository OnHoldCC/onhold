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
    <div className="section-top"><div><h2>{t('miningCompetition')}</h2></div><div className="table-scroll"><SegmentedTabs value={period} onChange={setPeriod} options={miningPeriods.map(value=>({value,label:value.toUpperCase()}))} ariaLabel={t('timeRange')}/></div></div>
    <SegmentedTabs value={metric} onChange={setMetric} options={[{value:'totalWeight',label:t('networkWeight')},{value:'perWeightDaily',label:t('perWeightDaily')}]} ariaLabel={t('miningCompetition')}/>
    {error?<Notice error>{t('miningUnavailable')}</Notice>:!data?<SingleSparkSkeleton variant="chart" label={t('loadingData')}/>:<>
      <AnalyticsCharts className="mining-network-bars" charts={[{
        description:'',title:label,values:rows.map(row=>Number(row[metric])),
        total:data.latest?number(data.latest[metric]):t('notAvailable'),
        labels:rows.map(row=>new Date(row.sampledAt*1000).toLocaleString(lang,{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})),
        valueLabels:rows.map(row=>number(row[metric])),
        emptyText:t('miningHistoryPending')
      }]}/>
      {rows.length>0&&<details className="chart-table"><summary>{t('chartData')}</summary><table><thead><tr><th>{t('date')}</th><th>{label}</th></tr></thead><tbody>{rows.map(row=><tr key={row.sampledAt}><td>{new Date(row.sampledAt*1000).toLocaleString(lang)}</td><td>{number(row[metric])}{metric==='perWeightDaily'&&<TokenUnit unit="$Claude"/>}</td></tr>)}</tbody></table></details>}
      {rows.length>0&&<p className="fine-print">{new Date(rows[0].sampledAt*1000).toLocaleString(lang)} — {new Date(rows.at(-1).sampledAt*1000).toLocaleString(lang)}</p>}
    </>}
  </section>;
}
