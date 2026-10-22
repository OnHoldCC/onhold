import React,{useEffect,useState} from 'react';
import {SegmentedTabs} from '@singlespark/component-atlas/ui';
import {SingleSparkHomeAnalyticsVisual} from '@singlespark/component-atlas/singlespark';
import {loadMiningStats,summaryHistory} from '../../src/mining-stats.mjs';
import {compactAmount} from '../../src/format.mjs';

export function useSummaryMetric({metric,label,value,loading,t,lang,unit='$OnHold'}){
  const [period,setPeriod]=useState('30d'),[data,setData]=useState({}),[automatic,setAutomatic]=useState(true);
  useEffect(()=>{
    if(!automatic)return;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    const timer=setInterval(()=>{if(!document.hidden&&!reduced.matches)setPeriod(current=>{const periods=['1h','4h','7d','30d'];return periods[(periods.indexOf(current)+1)%periods.length];});},5000);
    return()=>clearInterval(timer);
  },[automatic]);
  useEffect(()=>{
    let active=true;const controller=new AbortController();
    async function refresh(){try{const next=await loadMiningStats(period,controller.signal);if(active)setData(cached=>({...cached,[period]:{...next,receivedAt:Date.now()}}));}catch{}}
    const updated=()=>{if(period==='30d'&&!document.hidden)void refresh();};
    window.addEventListener('onhold:home-data',updated);
    if(!data[period]||Date.now()-data[period].receivedAt>=60000)void refresh();const timer=setInterval(()=>{if(!document.hidden)void refresh();},900000);
    return()=>{active=false;controller.abort();clearInterval(timer);window.removeEventListener('onhold:home-data',updated);};
  },[period]);
  const recorded=value==null?[]:summaryHistory(data[period]?.history||[],metric,value);
  const history=recorded.length>1?recorded:[Number(value??0),Number(value??0)];
  const amount=`${Number(value??0)===0?'0':compactAmount(value,lang)} ${unit}`;
  const valueTitle=`${new Intl.NumberFormat(lang==='zh'?'zh-CN':lang,{maximumFractionDigits:18}).format(value??0)} ${unit}`;
  return {metric:{label:t(label),value:amount,valueTitle,format:'count',period,history},controls:<div className="summary-period-controls"><SegmentedTabs value={period} onChange={next=>{setAutomatic(false);setPeriod(next);}} options={['1h','4h','7d','30d'].map(value=>({value,label:value.toUpperCase()}))} ariaLabel={t('timeRange')}/></div>};
}
export function SummaryMetric(props){return <SingleSparkHomeAnalyticsVisual {...useSummaryMetric(props)}/>;}
