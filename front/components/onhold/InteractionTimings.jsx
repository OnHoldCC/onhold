import React,{useEffect,useState} from 'react';
import {SingleSparkAccordion} from '@singlespark/component-atlas/primitives';
import {ProcessSteps} from '@singlespark/component-atlas/ui';
import {formatDuration,timingSteps,compactTimingSteps} from '../../src/interaction-timing.mjs';
export const timingLabels=t=>Object.fromEntries(['pending','active','complete','error','steps','elapsed'].map(key=>[key,t('txStatus.'+key)]));
export function useInteractionTimings(timing,t){
 const [now,setNow]=useState(()=>performance.now());
 useEffect(()=>{if(!timing||timing.ended!==null)return;setNow(performance.now());const timer=setInterval(()=>setNow(performance.now()),250);return()=>clearInterval(timer);},[timing?.started,timing?.ended]);
 return timing?{steps:compactTimingSteps(timing,t,now),details:timingSteps(timing,t,now),elapsed:formatDuration(Math.max(0,(timing.ended??Math.max(now,timing.started))-timing.started))}:null;
}
export function TimingSteps({steps,t,labels={}}){
 return <div className="timing-steps"><ProcessSteps steps={steps.map(step=>({...step,description:step.status==='active'?step.description:undefined}))} label={t('timing.title')} statusLabels={{...timingLabels(t),...labels}}/></div>;
}
export function TimingDetails({view,t}){
 if(!view?.details.length||view.details.length<=view.steps.length)return null;
 return <SingleSparkAccordion className="timing-details" label={t('timing.details')}><TimingSteps steps={view.details} t={t}/></SingleSparkAccordion>;
}
export function InteractionTimings({timing,t}){
 const view=useInteractionTimings(timing,t);
 if(!view?.steps.length)return null;
 return <section className="interaction-timings" aria-label={t('timing.title')}><TimingSteps steps={view.steps} t={t}/><p className="fine-print">{t('txStatus.elapsed')}: <span>{view.elapsed}</span></p><TimingDetails view={view} t={t}/></section>;
}
