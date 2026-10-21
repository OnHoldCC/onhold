import React,{useEffect,useState} from 'react';
import {SegmentedTabs} from '@singlespark/component-atlas/ui';
import {SingleSparkHomeAnalyticsVisual} from '@singlespark/component-atlas/singlespark';
import {loadMiningStats,summaryHistory} from '../../src/mining-stats.mjs';

export function useSummaryMetric({metric,label,value,loading,t,lang}){
  const [period,setPeriod]=useState('30d'),[data,setData]=useState(null);
  useEffect(()=>{
    let active=true;const controller=new AbortController();setData(null);
    async function refresh(){try{const next=await loadMiningStats(period,controller.signal);if(active)setData(next);}catch{}}
    void refresh();const timer=setInterval(refresh,900000);
    return()=>{active=false;controller.abort();clearInterval(timer);};
  },[period]);
  const history=summaryHistory(data?.period===period?data.history:[],metric,value);
  const amount=value==null&&loading?null:`${new Intl.NumberFormat(lang==='zh'?'zh-CN':lang,{minimumFractionDigits:2,maximumFractionDigits:4}).format(Number(value??0))} $Claude`;
  return {metric:{label:t(label),value:amount,period,history},controls:<div className="summary-period-controls"><SegmentedTabs value={period} onChange={setPeriod} options={['1h','4h','7d','30d'].map(value=>({value,label:value.toUpperCase()}))} ariaLabel={t('timeRange')}/></div>};
}
export function SummaryMetric(props){return <SingleSparkHomeAnalyticsVisual {...useSummaryMetric(props)}/>;}
