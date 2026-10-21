import React,{useEffect,useRef,useState} from 'react';
import {Button,Dialog,Select} from '@singlespark/component-atlas/ui';
import {SingleSparkIcon} from '@singlespark/component-atlas/icons';
import {SingleSparkSkeleton} from '@singlespark/component-atlas/feedback';
import {welcomePortraits} from '../../src/welcome-portraits.mjs';
import './welcome-letter.css';
import {supportedLocales} from '../../src/i18n.mjs';

export function WelcomeLetter({open,onClose,onStart,t,lang,onLanguageChange}){
  const [portrait]=useState(()=>{const selected=typeof document==='undefined'?undefined:document.documentElement.dataset.welcomePortrait;return welcomePortraits[selected]||welcomePortraits[Math.floor(Math.random()*welcomePortraits.length)];});
  const [step,setStep]=useState(0);
  const [target,setTarget]=useState(null);
  const [receipt,setReceipt]=useState(null);
  const [imageState,setImageState]=useState('loading');
  const portraitRef=useRef(null);
  const offeredLetter=useRef(null);
  const dialog=useRef(null);
  const heading=useRef(null);
  const busy=target!==null;
  useEffect(()=>{
    if(!open||step!==0)return;
    const image=portraitRef.current;
    let active=true;
    setImageState('loading');
    const failed=()=>{if(active)setImageState('error');};
    const reveal=async()=>{
      try{await image.decode();if(active)setImageState('loaded');}catch{failed();}
    };
    image.addEventListener('load',reveal);
    image.addEventListener('error',failed);
    if(image.complete){if(image.naturalWidth)void reveal();else failed();}
    return()=>{active=false;image.removeEventListener('load',reveal);image.removeEventListener('error',failed);};
  },[open,step]);
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
  const steps=[['letterAccountTitle','letterAccountBody'],['letterNftTitle','letterNftBody'],['letterStakeTitle','letterStakeBody'],['letterClaimTitle','letterClaimBody']];
  const entry=steps[step-1];
  const stack=steps.map((_,index)=>(step-1+index)%steps.length);
  return <Dialog ref={dialog} open={open} onClose={onClose} closeOnOverlayClick={false} initialFocusRef={heading} ariaLabelledBy="welcome-letter-title" className={`welcome-letter ${step?'welcome-letter--reading':'welcome-letter--cover'} ${busy?'is-turning':''} ${step===1&&receipt?'just-received':''}`} overlayClassName="welcome-letter-overlay">
    <Button variant="ghost" className="welcome-letter__close" onClick={onClose} aria-label={t('close')}><SingleSparkIcon name="close"/></Button>
    {step===0?<div className="welcome-letter__cover"><h2 id="welcome-letter-title" className="welcome-letter__sr" ref={heading} tabIndex={-1}>{t('letterTitle')}</h2><div className={`welcome-letter__figure ${imageState==='loaded'?'is-loaded':''}`} aria-busy={imageState==='loading'}><SingleSparkSkeleton variant="avatar" width="100%" height="100%" decorative animation={imageState==='error'?false:'wave'} className="welcome-letter__skeleton" style={{clipPath:portrait.clipPath}}/>{imageState!=='loaded'&&<span className="welcome-letter__sr" role="status">{t(imageState==='error'?'notAvailable':'loadingData')}</span>}<picture><source media="(max-width: 640px)" srcSet={portrait.small}/><img ref={portraitRef} src={portrait.src} alt="" width="1024" height="1280" decoding="async" fetchPriority="high"/></picture><Button ref={offeredLetter} variant="ghost" className="welcome-letter__take" onClick={receive} disabled={busy} aria-label={t('next')}/></div>{busy&&receipt&&<div className="welcome-letter__handoff" style={receipt} aria-hidden="true"><div className="welcome-letter__envelope-lines"/><svg className="welcome-letter__spark" viewBox="-24 -24 48 48" fill="none" stroke="#e97738" strokeWidth="4" strokeLinecap="round">{Array.from({length:12},(_,index)=><path key={index} d="M0 -6V-20" transform={`rotate(${index*30})`}/>)}</svg></div>}</div>:<div className="welcome-letter__deck">{stack.slice(1).reverse().map((index)=><div key={index} className="welcome-letter__back-sheet" aria-hidden="true" style={{'--depth':stack.indexOf(index)}}><span>OnHold</span><span>{String(index+1).padStart(2,'0')} / 04</span></div>)}<div className="welcome-letter__sheet" key={step}>
      <header className="welcome-letter__header"><span>OnHold</span><div className="welcome-letter__meta"><Select compact ariaLabel={t('language')} value={lang} onChange={onLanguageChange} options={supportedLocales.map(value=>({value,label:value.toUpperCase()}))}/><span>{String(step).padStart(2,'0')} / 04</span></div></header>
      <div className="welcome-letter__content" aria-live="polite"><p className="welcome-letter__greeting">{t('letterGreeting')}</p><h2 id="welcome-letter-title" ref={heading} tabIndex={-1}>{t(entry[0])}</h2><p className="welcome-letter__body">{t(entry[1])}</p>{step===2&&<p className="welcome-letter__note">{t('letterPublic')}</p>}{step===3&&<p className="welcome-letter__weights">{t('letterWeights')}</p>}<p className="welcome-letter__signature">OnHold</p></div>
      <footer className="welcome-letter__footer"><div className="welcome-letter__progress" aria-hidden="true">{steps.map((entry,index)=><span key={entry[0]} className={index<step?'is-read':''}/>)}</div><div className="welcome-letter__actions"><Button variant="ghost" onClick={()=>setTarget(step-1)} disabled={busy}><SingleSparkIcon name="left"/>{t('previous')}</Button><Button variant="primary" onClick={step===4?onStart:()=>setTarget(step+1)} disabled={busy}>{t(step===4?'letterStart':'next')}<SingleSparkIcon name="arrow"/></Button></div><p>{t('independent')}</p></footer>
    </div></div>}
  </Dialog>;
}
