import React,{useEffect,useRef,useState} from 'react';
import {Button,Dialog} from '@singlespark/component-atlas/ui';
import {SingleSparkIcon} from '@singlespark/component-atlas/icons';
import portrait from '../../src/assets/welcome/claude-code-girl-spark.png';
import './welcome-letter.css';

export function WelcomeLetter({open,onClose,onStart,t}){
  const [step,setStep]=useState(0);
  const [target,setTarget]=useState(null);
  const [receipt,setReceipt]=useState(null);
  const offeredLetter=useRef(null);
  const dialog=useRef(null);
  const heading=useRef(null);
  const busy=target!==null;
  useEffect(()=>{if(!open){setStep(0);setTarget(null);setReceipt(null);}},[open]);
  useEffect(()=>{
    if(!open||target===null)return;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer=setTimeout(()=>{setStep(target);setTarget(null);if(step!==0)setReceipt(null);},reduced?0:step===0?900:420);
    return()=>clearTimeout(timer);
  },[open,target,step]);
  useEffect(()=>{if(open)heading.current?.focus({preventScroll:true});},[open,step]);
  function receive(){
    if(busy)return;
    const source=offeredLetter.current.getBoundingClientRect();
    const width=Math.min(580,window.innerWidth-64),height=Math.min(540,window.innerHeight-90);
    setReceipt({'--from-x':`${source.x}px`,'--from-y':`${source.y}px`,'--from-scale-x':source.width/width,'--from-scale-y':source.height/height,'--to-x':`${(window.innerWidth-width)/2}px`,'--to-y':`${(window.innerHeight-height)/2}px`,'--receive-width':`${width}px`,'--receive-height':`${height}px`});
    setTarget(1);
  }
  useEffect(()=>{
    if(!open)return;
    const overlay=dialog.current?.closest('.app-modal-overlay');
    const advance=event=>{
      if(busy||event.target.closest('button,a,input,textarea,select,[role="button"]'))return;
      if(step===0)receive();else if(step<4)setTarget(step+1);else onStart();
    };
    overlay?.addEventListener('click',advance);
    return()=>overlay?.removeEventListener('click',advance);
  },[open,busy,step,onStart]);
  const steps=[['at','letterAccountTitle','letterAccountBody'],['collectible','letterNftTitle','letterNftBody'],['pickaxe','letterStakeTitle','letterStakeBody'],['wallet','letterClaimTitle','letterClaimBody']];
  const entry=steps[step-1];
  const stack=steps.map((_,index)=>(step-1+index)%steps.length);
  return <Dialog ref={dialog} open={open} onClose={onClose} closeOnOverlayClick={false} initialFocusRef={heading} ariaLabelledBy="welcome-letter-title" className={`welcome-letter ${step?'welcome-letter--reading':'welcome-letter--cover'} ${busy?'is-turning':''} ${step===1&&receipt?'just-received':''}`} overlayClassName="welcome-letter-overlay">
    <Button variant="ghost" className="welcome-letter__close" onClick={onClose} aria-label={t('close')}><SingleSparkIcon name="close"/></Button>
    {step===0?<div className="welcome-letter__cover"><h2 id="welcome-letter-title" className="welcome-letter__sr" ref={heading} tabIndex={-1}>{t('letterTitle')}</h2><div className="welcome-letter__figure"><img src={portrait} alt="" width="1024" height="1280"/><Button ref={offeredLetter} variant="ghost" className="welcome-letter__take" onClick={receive} disabled={busy} aria-label={t('next')}/></div>{busy&&receipt&&<div className="welcome-letter__handoff" style={receipt} aria-hidden="true"><div className="welcome-letter__envelope-lines"/><svg className="welcome-letter__spark" viewBox="-24 -24 48 48" fill="none" stroke="#e97738" strokeWidth="4" strokeLinecap="round">{Array.from({length:12},(_,index)=><path key={index} d="M0 -6V-20" transform={`rotate(${index*30})`}/>)}</svg></div>}</div>:<div className="welcome-letter__deck">{stack.slice(1).reverse().map((index)=><div key={index} className="welcome-letter__back-sheet" aria-hidden="true" style={{'--depth':stack.indexOf(index)}}><span>onHold · &gt;_</span><span>{String(index+1).padStart(2,'0')} / 04</span></div>)}<div className="welcome-letter__sheet" key={step}>
      <header className="welcome-letter__header"><span>onHold · &gt;_</span><span>{String(step).padStart(2,'0')} / 04</span></header>
      <div className="welcome-letter__content" aria-live="polite"><span className="welcome-letter__seal" aria-hidden="true"><SingleSparkIcon name={entry[0]}/></span><p className="welcome-letter__subject">{t('letterTitle')}</p><h2 id="welcome-letter-title" ref={heading} tabIndex={-1}>{t(entry[1])}</h2>{step===1&&<p className="welcome-letter__greeting">{t('letterGreeting')}</p>}<p className="welcome-letter__body">{t(entry[2])}</p>{step===2&&<p className="welcome-letter__note">{t('letterPublic')}</p>}{step===3&&<p className="welcome-letter__weights">{t('letterWeights')}</p>}<p className="welcome-letter__signature">onHold</p></div>
      <footer className="welcome-letter__footer"><div className="welcome-letter__progress" aria-hidden="true">{steps.map((entry,index)=><span key={entry[0]} className={index<step?'is-read':''}/>)}</div><div className="welcome-letter__actions"><Button variant="ghost" onClick={()=>setTarget(step-1)} disabled={busy}><SingleSparkIcon name="left"/>{t('previous')}</Button><Button variant="primary" onClick={step===4?onStart:()=>setTarget(step+1)} disabled={busy}>{t(step===4?'letterStart':'next')}<SingleSparkIcon name="arrow"/></Button></div><p>{t('independent')}</p></footer>
    </div></div>}
  </Dialog>;
}
