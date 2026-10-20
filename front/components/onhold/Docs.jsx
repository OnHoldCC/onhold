import React,{useRef} from 'react';
import {OutlineCurve} from './OutlineCurve';
import {Flywheel} from './Flywheel';
import './docs.css';
export function Docs({t}){
 const article=useRef(null);
 const sections=[['flywheel',t('flywheelTitle'),[]],['record',t('publicRecord'),[t('mintIntro'),t('mintNotice')]],['staking',t('miningTab'),[t('miningIntro'),t('holdingRule'),t('emissionRule')]],['referrals',t('referralTotal'),[t('miningInvite')]],['advertising',t('advertise'),[t('rulesText'),t('minimumBid'),t('adRevenueRule')]],['analytics',t('analyticsWidget'),[t('campaignHistoryNote')]],['burn',t('burnTitle'),[t('burnIntro'),t('burnPolicyNote')]]];
 return <div className="how-page"><aside className="how-outline"><nav className="how-outline-tree" aria-label={t('contents')}><ol>{sections.map(([id,label])=><li key={id}><a href={`#docs-${id}`}>{label}</a></li>)}</ol></nav><OutlineCurve content={article}/></aside><article ref={article}><h1>{t('docsTitle')}</h1><p className="how-lead">{t('claimIntro')}</p>{sections.map(([id,label,paragraphs])=><section id={`docs-${id}`} key={id}><h2>{label}</h2>{id==='flywheel'?<Flywheel t={t}/>:paragraphs.map((text,i)=><p key={i}>{text}</p>)}</section>)}</article></div>;
}
