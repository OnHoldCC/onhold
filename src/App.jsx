import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { messages, translate, translateError, categoryLabels } from './i18n.mjs';
import { steps, instructionsFor, nextStep } from './steps.mjs';
import { stepsEn } from './steps-en.mjs';
import {storedMarket,storeMarket,readMarket,placeChainBid,deployTestContracts,chain} from './chain.mjs';
import { trackEvent, readStats } from './telemetry.mjs';
import { safeUrl, categories, currentPrice, formatEth, loadMarket, saveMarket, placeBid } from './market.mjs';

const Locale = createContext();
const useLocale = () => useContext(Locale);
const storage = {getItem:key=>{try{return localStorage.getItem(key);}catch{return null;}},setItem:(key,value)=>localStorage.setItem(key,value)};
const page = location.pathname.endsWith('claim.html') ? 'claim' : location.pathname.endsWith('analytics.html') ? 'analytics' : 'home';
const paths = {
  home:<><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  claim:<><circle cx="16" cy="5" r="3"/><path d="M2 14h3v8H2zm3 1 4-4h5a2 2 0 0 1 0 4h-3m-6 5h10l6-6a2 2 0 0 0-3-2l-4 3"/></>,
  chart:<><path d="M3 3v18h18M6 15l5-5 4 3 6-7"/></>,
  burn:<path d="M12 2c1 5 7 6 7 12a7 7 0 0 1-14 0c0-3 2-5 4-7 0 3 2 4 3 5 2-3 2-6 0-10Z"/>,
  wallet:<path d="M20 8V5H5a2 2 0 0 0 0 4h16v11H5a2 2 0 0 1-2-2V7m18 6h-5v3h5"/>,
  sun:<><circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></>,
  arrow:<path d="M6 18 18 6M6 6h12v12"/>,
  link:<><path d="m10 13 4-4m-6 6-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m4 2 2-2a4 4 0 1 0-6-6l-2 2" transform="translate(2 3) scale(.9)"/></>,
  close:<path d="m6 6 12 12M6 18 18 6"/>,
  pause:<path d="M9 5v14M15 5v14"/>,
  play:<path d="m8 4 12 8-12 8Z"/>,
};
export function Icon({name,...props}) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>; }
const shortAddress = address => address ? `${address.slice(0,6)}…${address.slice(-4)}` : '';
const number = (value,lang) => new Intl.NumberFormat(lang==='zh'?'zh-CN':'en-US').format(value);
const price = ad => formatEth(currentPrice(ad));
const sampleTitles=new Set(['LOOP','Mint Studio','序章','OpenKit','像素公园','MADE BY YOU','Mint API','Bridge API','OpenLink','CloudRoute','Nova Relay']);

function useWallet(notify) {
  const [address,setAddress]=useState('');
  const [busy,setBusy]=useState(false);
  useEffect(()=>{
    const provider=window.ethereum;
    if(!provider?.request) return;
    let active=true;
    const update=accounts=>{if(active) setAddress(/^0x[0-9a-fA-F]{40}$/.test(accounts?.[0]||'')?accounts[0]:'');};
    const changed=accounts=>{update(accounts);notify('walletChanged');};
    const networkChanged=()=>notify('walletChanged');
    provider.request({method:'eth_accounts'}).then(update).catch(()=>{});
    provider.on?.('accountsChanged',changed);provider.on?.('chainChanged',networkChanged);
    return ()=>{active=false;provider.removeListener?.('accountsChanged',changed);provider.removeListener?.('chainChanged',networkChanged);};
  },[]);
  async function connect() {
    if(!window.ethereum?.request){notify('walletMissing');return;}
    setBusy(true);
    try {
      const accounts=await window.ethereum.request({method:'eth_requestAccounts'});
      if(!/^0x[0-9a-fA-F]{40}$/.test(accounts?.[0]||'')) throw new Error('Invalid address');
      setAddress(accounts[0]);
      const chain=await window.ethereum.request({method:'eth_chainId'});
      notify(chain==='0x61'?'walletBNB':'walletOther');
      void trackEvent('wallet_connect',page);
    } catch(error){notify(error.code===4001?'walletCancelled':'walletError');}
    finally{setBusy(false);}
  }
  return {address,busy,connect};
}
function Shell({children,wallet,lang,setLang,dark,setDark}) {
  const {t}=useLocale();
  return <><aside className="sidebar"><a href="./" className="brand"><span className="brand-mark" aria-hidden="true">Ⅱ</span>ONHOLD</a><nav aria-label={t('home')}><a href="./" aria-current={page!=='claim'?'page':undefined}><Icon name="home"/>{t('home')}</a><a href="claim.html" aria-current={page==='claim'?'page':undefined}><Icon name="claim"/>{t('claim')}</a></nav><div className="sidebar-footer"><span className="network-dot"/>{t('testnet')}<p>{t('independent')}</p></div></aside><div className="app-body"><header className="topbar"><span className="breadcrumb">{t(page==='home'?'home':page==='claim'?'claim':'analytics')}</span><div className="header-controls"><select aria-label={t('language')} value={lang} onChange={event=>setLang(event.target.value)}><option value="zh">中文</option><option value="en">English</option></select><button className="icon-button" aria-label={t('theme')} onClick={()=>setDark(!dark)}><Icon name="sun"/></button>{page==='claim'&&<button className="button wallet-button" onClick={wallet.connect} disabled={wallet.busy}><Icon name="wallet"/>{wallet.busy?t('connecting'):wallet.address?shortAddress(wallet.address):t('connect')}</button>}</div></header><main id="content">{children}</main><footer className="footer"><span>© ONHOLD</span><span>{t('independent')}</span><span className="demo-tag">{t('demo')}</span></footer></div></>;
}
function Dialog({open,onClose,title,children,wide=false}) {
  const {t}=useLocale();const ref=useRef(null);
  useEffect(()=>{if(open&&!ref.current.open)ref.current.showModal();if(!open&&ref.current.open)ref.current.close();},[open]);
  return <dialog ref={ref} className={wide?'dialog wide':'dialog'} onCancel={onClose} onClose={onClose}><div className="dialog-header"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label={t('close')}><Icon name="close"/></button></div>{open&&children}</dialog>;
}
function Sparkline({kind='claims',large=false}) {
  const values=kind==='burn'?[9,14,25,32,31,23,12,10,14,18,17,25,26,25,29]:[9,10,14,11,15,18,16,21,19,24,28,26,31,28,35];
  const line=values.map((value,i)=>`${i/(values.length-1)*600},${95-value*1.6}`).join(' ');
  return <svg className={`sparkline ${large?'large':''}`} viewBox="0 0 600 110" aria-hidden="true"><path d="M0 30H600M0 60H600M0 90H600" className="grid-lines"/><polygon points={`0,110 ${line} 600,110`} fill="currentColor" opacity=".07"/><polyline points={line} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>;
}
function ClaimActivity({financial}) {
  const {t,lang}=useLocale();
  const [paused,setPaused]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if(financial)return <section className="summary-card activity-card"><div className="card-topline"><span>{t('claimWidget')}</span><span>{t('chainTotals')}</span></div><div className="summary-number">{number(financial.recipients,lang)} <small>{t('people')}</small></div><p className="chain-placeholder">{t('eventsPending')}</p><a className="summary-footer" href="claim.html"><span><Icon name="claim"/>{t('claimWidget')}</span><span>{t('open')} →</span></a></section>;
  return <section className="summary-card activity-card"><div className="card-topline"><span>{t('recentClaims')}</span><button className="mini-button" onClick={()=>setPaused(!paused)} aria-label={t(paused?'resumeRecords':'pauseRecords')} aria-pressed={paused}><Icon name={paused?'play':'pause'}/></button></div><div className={`activity-window ${paused?'paused':''}`}><div className="activity-track">{[0,1].map(group=><div className="activity-group" key={group} aria-hidden={group===1?true:undefined}>{['0x7a3f…b8c1','0x91d2…a4e6','0x4bc8…f092','0x6d11…c3a7'].map((account,index)=><div className="activity-row" key={account}><span className="token-mark" aria-hidden="true">C</span><span><strong>{number(500,lang)} <small>$Claude</small></strong><small>{account}</small></span><span className="activity-status">{t('sample')}<Icon name="claim"/></span></div>)}</div>)}</div></div><a className="summary-footer" href="claim.html"><span><Icon name="claim"/>{t('claimWidget')}</span><span>{t('open')} →</span></a></section>;
}
function SummaryCards({financial}) {
  const {t,lang}=useLocale();
  return <div className="summary-grid"><ClaimActivity financial={financial}/><section className="summary-card burn-card"><div className="card-topline"><span>{t('burned')}</span><span>{financial?t('chainTotals'):`30D · ${t('sample')}`}</span></div><div className="summary-number">{number(financial?.burned??24800,lang)}</div><div className="burn-total"><span>{t('totalBurned')}</span><strong>{number(financial?.burned??1280000,lang)} <small>$Claude</small></strong></div>{financial?<p className="chain-placeholder">{t('trendPending')}</p>:<Sparkline kind="burn"/>}<a className="summary-footer" href="analytics.html#burn"><span><Icon name="burn"/>{t('burnWidget')}</span><span>{t('open')} →</span></a></section><section className="summary-card analytics-card"><div className="card-topline"><span>{t('claimedPeople')}</span><span>{t(financial?'chainTotals':'sample')}</span></div><div className="summary-number">{number(financial?.recipients??256,lang)} <small>{t('people')}</small></div><div className="claimed-total"><span>{t('claimedAmount')}</span><strong>{number(financial?.claimed??128000,lang)} <small>$Claude</small></strong></div>{financial?<p className="chain-placeholder">{t('trendPending')}</p>:<Sparkline/>}<a className="summary-footer" href="analytics.html"><span><Icon name="chart"/>{t('analyticsWidget')}</span><span>{t('open')} →</span></a></section></div>;
}
function Home({state,onVisit,onBid,liveStats,financial}) {
  const {t,lang}=useLocale();
  const ads=[...state.ads].sort((a,b)=>currentPrice(a)===currentPrice(b)?a.id-b.id:currentPrice(a)>currentPrice(b)?-1:1);
  return <><section className="page-intro home-intro"><div><span className="eyebrow">{t('homeLabel')}</span><h1>{t('homeTitle')}</h1><p>{t('homeIntro')}</p></div><button className="button primary" onClick={()=>onBid(ads[0].id)}>{t('advertise')}<Icon name="arrow"/></button></section><div className="relay-grid">{ads.map(ad=><article className="relay-card" key={ad.id}><a className="relay-link" href={ad.empty||ad.unavailable?'#':ad.url} target={ad.empty||ad.unavailable?undefined:'_blank'} rel="noopener noreferrer" onClick={event=>{if(ad.empty||ad.unavailable){event.preventDefault();onBid(ad.id);}else onVisit(ad.id);}} aria-label={`${ad.title} · ${t('visitLabel')}`}><div className="relay-card-top"><span className={`relay-logo tone-${ad.cover}`} aria-hidden="true"><Icon name="link"/></span><span className="relay-out"><Icon name="arrow"/></span></div><h2>{ad.title}</h2><p>{lang==='en'&&ad.url==='https://example.com/'&&sampleTitles.has(ad.title)?t('relayDescription'):ad.description}</p><div className="relay-domain"><span>{new URL(ad.url).hostname}</span><span>{t('official')} ↗</span></div></a><div className="relay-bottom"><a href="analytics.html">{number(liveStats?liveStats.clicks_by_site[ad.id]:ad.clicks,lang)} {t('clicks')}</a><button onClick={()=>onBid(ad.id)} title={`${t('currentBid')}: ${price(ad)} tBNB`}>{t('bid')}<span>{price(ad)} tBNB</span></button></div></article>)}</div><div className="directory-note"><span>{t(financial?'chainConnected':'exampleSites')} {liveStats&&<span className="telemetry-state"> · {t('liveTelemetry')}</span>}</span><details><summary>{t('rules')}</summary><p>{t('rulesText')}</p></details></div><SummaryCards financial={financial}/></>;
}
function BidDialog({slot,state,onClose,onPlace,onChain}) {
  const {t,lang}=useLocale();const [selected,setSelected]=useState(slot??0);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  useEffect(()=>{if(slot!==null){setSelected(slot);setError('');}},[slot]);
  async function submit(event){event.preventDefault();setBusy(true);setError('');try{await onPlace(selected,Object.fromEntries(new FormData(event.target)));onClose();}catch(error){setError(onChain?t('chainFailure'):translateError(error,lang));}finally{setBusy(false);}}
  return <Dialog open={slot!==null} onClose={onClose} title={t('bidTitle')}><p className="muted form-intro">{t(onChain?'onchainIntro':'bidIntro')}</p><form noValidate onSubmit={submit}><label>{t('bidSlot')}<select value={selected} onChange={event=>setSelected(Number(event.target.value))}>{state.ads.map(ad=><option key={ad.id} value={ad.id}>{t('slot')} 0{ad.id+1} · {ad.title}</option>)}</select></label><div className="price-note"><span>{t('currentBid')}</span><strong>{price(state.ads[selected])} tBNB</strong></div><label>{t('name')}<input name="title" maxLength={32} placeholder={t('namePlaceholder')}/></label><label>{t('url')}<input name="url" type="url" maxLength={300} placeholder={t('urlPlaceholder')}/></label><label>{t('description')}<input name="description" maxLength={80} placeholder={t('descriptionPlaceholder')}/></label><div className="form-pair"><label>{t('category')}<select name="category">{categories.map(value=><option value={value} key={value}>{categoryLabels[lang][value]}</option>)}</select></label><label>{t('amount')}<input name="amount" inputMode="decimal" placeholder="0.05"/></label></div><p className="form-error" role="alert">{error}</p><button className="button primary full" type="submit" disabled={busy}>{t(busy?'pending':onChain?'onchainBid':'confirmBid')}<Icon name="arrow"/></button><p className="fine-print">{t(onChain?'testTokenWarning':'bidDisclaimer')}</p></form></Dialog>;
}
function Claim({wallet}) {
  const {t,lang}=useLocale();const [step,setStep]=useState(0);const [os,setOs]=useState(navigator.platform.includes('Mac')?'mac':'windows');const [zoom,setZoom]=useState(false);
  const guide=lang==='en'?stepsEn:steps;const item=guide[step];
  const image=`assets/${item.image}${lang==='en'?'-en':''}.svg`;
  return <><section className="page-intro"><div><span className="eyebrow">$Claude · {t('claim')}</span><h1>{t('claimTitle')}</h1><p>{t('claimIntro')}</p></div><span className="claim-heading-icon"><Icon name="claim"/></span></section><p className="preview-notice">{t('previewNotice')}</p><div className="claim-layout"><section className="claim-form-card"><div className="token-title"><span className="token-mark large-token">C</span><div><span>{t('token')}</span><h2>$Claude</h2></div></div><p className="muted">{t('tokenNote')}</p><div className="wallet-label">{t('wallet')}</div><div className="wallet-address">{wallet.address?shortAddress(wallet.address):t('notConnected')}</div><button className="button full" onClick={wallet.connect} disabled={wallet.busy}><Icon name="wallet"/>{wallet.busy?t('connecting'):wallet.address?t('connected'):t('connect')}</button><label className="session-field">{t('session')}<input type="password" disabled autoComplete="off" placeholder={t('sessionPlaceholder')}/></label><button className="button primary full" disabled><Icon name="claim"/>{t('verifyButton')}</button><p className="fine-print">{t('notReady')} · {t('noPayout')}</p><div className="claim-info"><span>{t('verification')}</span><strong>{t('notReady')}</strong></div><details className="fields-details"><summary>{t('fields')}</summary><ul>{['standing','bannedAt','previousPlan','org'].map(key=><li key={key}>{t(key)}</li>)}</ul><p>{t('fieldsNote')}</p></details></section><section className="guide-card"><div className="guide-heading"><div><h2>{t('guide')}</h2><p>{t('guideIntro')}</p></div><span className="small-badge">{t('desktop')}</span></div><div className="guide-step-nav" aria-label={t('guide')}>{guide.map((entry,index)=><button key={entry.image} aria-current={step===index?'step':undefined} onClick={()=>setStep(index)} aria-label={`${t('step')} ${index+1}: ${entry.title}`}>{index+1}</button>)}</div><div className="step-head"><span>{t('step')} 0{step+1} / 04</span><select aria-label={t('os')} value={os} onChange={event=>setOs(event.target.value)}><option value="mac">macOS</option><option value="windows">Windows / Linux</option></select></div><h3>{item.title}</h3><p className="step-intro">{item.intro}</p><button className="guide-image" onClick={()=>setZoom(true)} aria-label={t('zoom')}><img src={image} alt={item.alt} width="1000" height="560"/><span>{t('zoom')} ↗</span></button><ol className="guide-instructions">{instructionsFor(item,os).map(text=><li key={text}>{text}</li>)}</ol>{step===0&&<a className="button open-claude" href="https://claude.ai/restricted" target="_blank" rel="noopener noreferrer">{t('openClaude')}<Icon name="arrow"/></a>}<p className="guide-tip">{item.tip}</p><div className="guide-bottom"><button className="text-button" onClick={()=>setStep(nextStep(step,-1))} disabled={step===0}>← {t('previous')}</button><button className="button primary" onClick={()=>setStep(step===3?0:nextStep(step,1))}>{t(step===3?'review':'next')} →</button></div></section></div><section className="faq"><h2>{t('faq')}</h2>{[1,2,3].map(n=><details key={n}><summary>{t(`faqQ${n}`)}</summary><p>{t(`faqA${n}`)}</p></details>)}</section><Dialog open={zoom} onClose={()=>setZoom(false)} title={item.title} wide><img className="large-guide" src={image} alt={item.alt}/><p className="fine-print">{t('imageNote')}</p></Dialog></>;
}
function Analytics({state,liveStats,financial}) {
  const {t,lang}=useLocale();const [period,setPeriod]=useState(7);const rows=(liveStats?state.ads.map(ad=>({...ad,clicks:liveStats.clicks_by_site[ad.id]})):[...state.ads,...state.history]).sort((a,b)=>b.clicks-a.clicks||a.id-b.id);const total=liveStats?liveStats.ad_clicks:rows.reduce((sum,ad)=>sum+ad.clicks,0);
  const exampleValues=period===7?[1840,2364,1958,2810,2246,3154,2470]:[1610,1380,1810,1540,2230,1780,2040,1870,2330,2120,1760,2400,2080,1960,2580,2220,2490,2180,2740,2300,2610,2150,2810,1840,2364,1958,2810,2246,3154,2470];
  const values=liveStats?liveStats.daily_clicks.slice(-period).map(row=>row.clicks):exampleValues;
  const max=Math.max(4000,...values);
  const points=values.map((value,i)=>`${40+i/(values.length-1)*860},${200-value/max*170}`).join(' ');
  return <><section className="page-intro"><div><a className="back-link" href="./">← {t('back')}</a><h1>{t('analyticsTitle')}</h1><p>{t('analyticsIntro')}</p></div><span className="small-badge">{t(liveStats?'liveTelemetry':'demo')}</span></section><div className="analytics-metrics">{[[liveStats?'liveViews':'totalClicks',liveStats?liveStats.page_views:total,t('countUnit')],['claimedPeople',financial?.recipients??256,t('people')],['claimedAmount',financial?.claimed??128000,'$Claude'],['totalBurned',financial?.burned??1280000,'$Claude']].map(([key,value,unit])=><div key={key}><span>{t(key)} {(!financial&&['claimedPeople','claimedAmount','totalBurned'].includes(key))&&<small className="metric-sample">· {t('sample')}</small>}</span><strong>{number(value,lang)} <small>{unit}</small></strong></div>)}</div><section className="data-card"><div className="section-top"><div><h2>{t('chart')}</h2><p>{t(liveStats?'liveTrend':'chartNote')}</p></div><div className="segment">{[7,30].map(value=><button key={value} aria-pressed={period===value} onClick={()=>setPeriod(value)}>{value}D</button>)}</div></div><svg className="trend" viewBox="0 0 940 240" role="img" aria-label={`${t('chart')} · ${t('demo')}`}><path d="M40 30H900M40 72H900M40 115H900M40 157H900M40 200H900" className="grid-lines"/><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2"/>{[0,1000,2000,3000,4000].map(value=><text key={value} x="0" y={205-value/max*170}>{value/1000}k</text>)}</svg><details className="chart-table"><summary>{t('chartData')}</summary><table><thead><tr><th>{t(liveStats?'date':'step')}</th><th>{t(liveStats?'liveClicks':'exampleClicks')}</th></tr></thead><tbody>{values.map((value,index)=><tr key={index}><td>{liveStats?liveStats.daily_clicks.slice(-period)[index].date:index+1}</td><td>{number(value,lang)}</td></tr>)}</tbody></table></details></section><section className="data-card"><div className="section-top"><div><h2>{t('ranking')}</h2><p>{t(liveStats?'liveRanking':'rankingNote')}</p></div><span className="small-badge">{rows.length} {t('totalCampaigns')}</span></div><div className="table-scroll"><table className="ranking-table"><thead><tr><th>{t('rank')}</th><th>{t('participant')}</th><th aria-sort="descending">{t('totalClicks')}</th><th>{t('price')}</th><th>{t('status')}</th></tr></thead><tbody>{rows.map((ad,index)=><tr key={`${ad.id}-${ad.startedAt}-${index}`}><td>{String(index+1).padStart(2,'0')}</td><td><span className={`table-logo tone-${ad.cover}`}><Icon name="link"/></span>{ad.title}</td><td>{number(ad.clicks,lang)}</td><td>{ad.endedAt?'—':`${price(ad)} tBNB`}</td><td><span className="small-badge">{t(ad.endedAt?'ended':'showing')}</span></td></tr>)}</tbody></table></div></section><section className="burn-section" id="burn"><div className="section-top"><div><h2>{t('burnWidget')} · $Claude</h2><p>{t(financial?'trendPending':'burnNote')}</p></div></div><SummaryCards financial={financial}/></section><p className="stats-note">{t(liveStats?'liveStatsNote':'statsNote')}</p></>;
}
function Setup({open,onClose,onConnect}) {
  const {t}=useLocale();const [busy,setBusy]=useState(false);const [result,setResult]=useState(null);const [error,setError]=useState('');const [address,setAddress]=useState('');
  async function deploy(){setBusy(true);setError('');try{const value=await deployTestContracts();await onConnect(value.marketAddress);setResult(value);}catch{setError(t('chainFailure'));}finally{setBusy(false);}}
  return <Dialog open={open} onClose={onClose} title={t('setupTitle')}><p className="muted">{t('setupIntro')}</p><p className="fine-print">{t('setupVerifier')}</p><button className="button primary full setup-deploy" disabled={busy} onClick={deploy}>{t(busy?'pending':'setupDeploy')}</button><label className="session-field">{t('setupExisting')}<input value={address} onChange={event=>setAddress(event.target.value)} placeholder="0x…"/></label><button className="button full" disabled={busy||!address} onClick={async()=>{setBusy(true);setError('');try{await onConnect(address);onClose();}catch{setError(t('chainReadError'));}finally{setBusy(false);}}}>{t('setupSave')}</button>{result&&<div className="setup-result"><p>{t('setupResult')}</p><strong>{t('tokenAddress')}</strong><a href={`${chain.explorer}/address/${result.tokenAddress}`} target="_blank" rel="noopener noreferrer">{result.tokenAddress}</a><strong>{t('marketAddress')}</strong><a href={`${chain.explorer}/address/${result.marketAddress}`} target="_blank" rel="noopener noreferrer">{result.marketAddress}</a></div>}<p className="form-error" role="alert">{error}</p></Dialog>;
}
function App() {
  const [lang,setLang]=useState(()=>storage.getItem('onhold.lang')==='en'?'en':'zh');
  const [dark,setDark]=useState(()=>storage.getItem('onhold.theme')==='dark');
  const [liveStats,setLiveStats]=useState(null);
  const [marketAddress,setMarketAddress]=useState(storedMarket);const [financial,setFinancial]=useState(null);const [setup,setSetup]=useState(new URLSearchParams(location.search).get('setup')==='1');
  const [state,setState]=useState(()=>loadMarket(storage));const [slot,setSlot]=useState(null);const [notice,setNotice]=useState('');
  const t=key=>translate(lang,key);const wallet=useWallet(setNotice);
  useEffect(()=>{document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.title=`${t(page==='home'?'home':page==='claim'?'claim':'analytics')} · ONHOLD`;try{storage.setItem('onhold.lang',lang);}catch{}},[lang]);
  useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light';try{storage.setItem('onhold.theme',dark?'dark':'light');}catch{}},[dark]);
  useEffect(()=>{void trackEvent('page_view',page).then(()=>readStats()).then(setLiveStats);},[]);
  useEffect(()=>{try{if(!storage.getItem('onhold.market.v1'))saveMarket(storage,state);}catch{}const refresh=()=>{if(marketAddress)void connectMarket(marketAddress).catch(()=>setNotice('chainReadError'));else setState(loadMarket(storage));};window.addEventListener('storage',refresh);if(location.hash)requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView());return()=>window.removeEventListener('storage',refresh);},[marketAddress]);
  useEffect(()=>{if(!notice)return;const timeout=setTimeout(()=>setNotice(''),6000);return()=>clearTimeout(timeout);},[notice]);
  async function connectMarket(address){const chainState=await readMarket(address);const checked=storeMarket(address);const base=loadMarket(storage);setState({...base,history:[],ads:chainState.ads.map((ad,id)=>({...base.ads[id],...ad,title:ad.empty?t('emptySlot')+' 0'+(id+1):ad.title,description:ad.empty?t('emptyDescription'):ad.description,unavailable:!safeUrl(ad.url),url:safeUrl(ad.url)?ad.url:'https://example.com/'}))});setFinancial(chainState.financial);setMarketAddress(checked);}
  useEffect(()=>{if(marketAddress)void connectMarket(marketAddress).catch(()=>setNotice('chainReadError'));},[marketAddress]);
  function visit(id){void trackEvent('ad_click',page,id).then(()=>readStats()).then(setLiveStats);const next=loadMarket(storage);next.ads[id].clicks++;next.localClicks++;try{saveMarket(storage,next);setState(next);}catch{setNotice('storageError');}}
  async function bid(id,form){
    if(marketAddress){
      if(!financial)throw new Error('Contract unavailable');
      placeBid(state,id,form);
      await placeChainBid(marketAddress,id,state.ads[id].version,form);
      await connectMarket(marketAddress);setNotice('chainBidSuccess');return;
    }
    const next=placeBid(loadMarket(storage),id,form);try{saveMarket(storage,next);}catch{throw new Error(t('storageError'));}setState(next);setNotice('bidSuccess');
  }
  return <Locale.Provider value={{lang,t}}><a className="skip-link" href="#content">{t('home')}</a><Shell wallet={wallet} lang={lang} setLang={setLang} dark={dark} setDark={setDark}>{page==='home'?<Home state={state} onVisit={visit} onBid={setSlot} liveStats={liveStats} financial={financial}/>:page==='claim'?<Claim wallet={wallet}/>:<Analytics state={state} liveStats={liveStats} financial={financial}/>}</Shell><BidDialog slot={slot} state={state} onClose={()=>setSlot(null)} onPlace={bid} onChain={Boolean(marketAddress)}/><Setup open={setup} onClose={()=>setSetup(false)} onConnect={connectMarket}/>{notice&&<div className="toast" role="status">{messages[lang][notice]||notice}</div>}</Locale.Provider>;
}
createRoot(document.getElementById('root')).render(<App/>);
