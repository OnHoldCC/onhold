import React,{useId,useState} from 'react';
import {Button} from '@singlespark/component-atlas/ui';

const steps=[[50,9.85],[85.63,29.55],[85.63,68.94],[50,88.64],[14.38,68.94],[14.38,29.55]];
const arrows=['M508 65 Q603 82 650 135','M700 255 Q742 325 700 395','M650 515 Q603 568 508 585','M292 585 Q197 568 150 515','M100 395 Q58 325 100 255','M150 135 Q197 82 292 65'];

export function Flywheel({t}){
  const [paused,setPaused]=useState(false),arrow=useId();
  return <figure className="flywheel" data-paused={paused}>
    <p className="flywheel-intro">{t('flywheelIntro')}</p>
    <div className="flywheel-map">
      <svg className="flywheel-circuit" viewBox="0 0 800 660" aria-hidden="true">
        <defs><marker id={arrow} viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto"><path d="M1 1 L10 6 L1 11"/></marker></defs>
        <g className="flywheel-links">{arrows.map(d=><path key={d} d={d} markerEnd={`url(#${arrow})`}/>)}</g>
        <g className="flywheel-rotor">
          <path className="flywheel-track" d="M400 169 C487 166 557 238 556 325 C558 413 486 481 400 481 C310 483 243 412 244 325 C242 238 312 167 400 169Z"/>
          <circle cx="400" cy="325" r="144" className="flywheel-inner"/>
          {[0,120,240].map(angle=><path key={angle} transform={`rotate(${angle} 400 325)`} d="M477 190 A156 156 0 0 1 552 290 M542 280 L552 290 L558 277" className="flywheel-motion"/>)}
        </g>
      </svg>
      <div className="flywheel-center"><img src="assets/claude-token.png" alt="" width="56" height="56"/><strong>OnHold</strong><span>{t('flywheelCenter')}</span></div>
      <ol className="flywheel-steps">{steps.map(([x,y],i)=><li key={i} style={{'--step-x':`${x}%`,'--step-y':`${y}%`}} className={i===3?'flywheel-reinvest':''}>
        <svg className="flywheel-box" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true"><path d="M13 3 Q100 0 187 4 Q198 5 197 17 L198 84 Q198 97 186 96 L14 98 Q3 98 4 84 L2 17 Q2 3 13 3Z"/><path d="M15 5 Q103 3 186 3 Q196 4 198 18 L196 83 Q198 95 185 98 L15 96 Q1 98 3 83 L4 18 Q2 5 15 5Z"/></svg>
        <span className="flywheel-step-index">{String(i+1).padStart(2,'0')}</span><strong>{t(`flywheelStep${i+1}`)}</strong><span>{t(`flywheelDetail${i+1}`)}</span>
      </li>)}</ol>
    </div>
    <div className="flywheel-burn"><span className="flywheel-burn-dot"/>{t('flywheelBurn')}</div>
    <figcaption><p>{t('flywheelNote')}</p><Button aria-pressed={paused} onClick={()=>setPaused(value=>!value)}>{t(paused?'flywheelResume':'flywheelPause')}</Button></figcaption>
  </figure>;
}
