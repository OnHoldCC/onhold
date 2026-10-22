import chainConfig from '../../src/chain-config.json';
import {GitHubLink} from './GitHubLink';
import {ContractAssets} from './ContractAssets';
import {BurnPolicy} from './BurnPolicy';
import {createInteractionTiming} from '../../src/interaction-timing.mjs';
import {InteractionTimings} from './InteractionTimings';
import {pageFromPath as routeFromPath,pagePath} from '../../src/routes.mjs';
import {avatarThumbnail} from '../../src/avatar-thumbnails.mjs';
import claudeSpark from '../../src/assets/claude-spark.svg';
import {TagsField} from './TagsField';
import {SummaryMetric,useSummaryMetric} from './SummaryMetric';
import {VerificationDetails} from './VerificationDetails';
import {AdRanking} from './AdRanking';
import {InviteLink} from './InviteLink';
import guideOpen from '../../src/assets/guide/open-claude.webp';
import guideNetwork from '../../src/assets/guide/network-curl.webp';
import guidePaste from '../../src/assets/guide/paste-curl.png';
import guideNft from '../../src/assets/guide/nft-preview.png';
import React, { createContext, useContext, useEffect, useState, useSyncExternalStore, useRef, lazy, Suspense } from 'react';
import {Button,Input,Textarea,Select,Dialog as SharedDialog,TokenCardLayout,SegProgressBar,SegmentedTabs,LaunchWizard,BottomNavigation,EmptyState} from '@singlespark/component-atlas/ui';
import {SingleSparkPanel,SingleSparkField,SingleSparkKeyValueList} from '@singlespark/component-atlas/primitives';
import {SingleSparkTokenIcon} from '@singlespark/component-atlas/assets';
import {SingleSparkIcon} from '@singlespark/component-atlas/icons';
import {FeaturePreviewGrid,SingleSparkMoney,SingleSparkSidebar,SingleSparkWalletButton,SingleSparkWalletList,SingleSparkWalletStatus,AnalyticsCharts} from '@singlespark/component-atlas/singlespark';
import '@singlespark/component-atlas/theme.css';
import '@singlespark/component-atlas/singlespark.css';
import '@singlespark/component-atlas/ui.css';
import {SingleSparkSkeleton,SingleSparkLoading} from '@singlespark/component-atlas/feedback';
import {DataValue,TokenUnit,Notice,PageLoadBoundary,RouteNavigationProgress} from './Feedback';
const Docs=lazy(()=>import('./Docs').then(module=>({default:module.Docs})));
import {WelcomeLetter} from './WelcomeLetter';
import {NftMintProgress} from './NftMintProgress';
import {pendingMint} from '../../src/mint-receipt.mjs';
import {BanPassCard} from './BanPassCard';
import {BurnHistory,BurnExecution} from './BurnHistory';
const NftMining=lazy(()=>import('./NftMining').then(module=>({default:module.NftMining})));
import {MiningNetworkHistory} from './MiningNetworkHistory';
import {TokenMediaUpload} from './TokenMediaUpload';
import {uploadAvatar} from '../../src/uploads.mjs';
import {formatBanTime,compactCount} from '../../src/format.mjs';
import {publicStatus,watchPublicStatus,verifyRestriction,extractSession} from '../../src/claims-api.mjs';
import { translate, translateError, categoryLabels, initialLocale, supportedLocales, loadLocale } from '../../src/i18n.mjs';
import { steps, instructionsFor, nextStep } from '../../src/steps.mjs';
import { stepsEn } from '../../src/steps-en.mjs';
import {storedMarket,storedNft,readMarket,placeChainBid,mintVerified,recoverMint,chain,gameplayAvailable} from '../../src/chain.mjs';
import {createWalletSession} from '../../src/wallet.mjs';
import {bindWalletReferral} from '../../src/referrals.mjs';
import {WalletIcon,walletIconSrc} from '../singlespark/WalletIcon.jsx';
import { trackEvent, readStats } from '../../src/telemetry.mjs';
import { safeUrl, categories, auctionCurve, currentPrice, requiredBid, parseEth, formatEth, placeBid } from '../../src/market.mjs';

export const Locale = createContext();
const useLocale = () => useContext(Locale);
const storage = {getItem:key=>{try{return localStorage.getItem(key);}catch{return null;}},setItem:(key,value)=>localStorage.setItem(key,value)};
const pageFromPath=()=>routeFromPath(location.pathname);
const iconNames={home:'Home',claim:'pickaxe',sun:'settings',docs:'Docs',analytics:'Analytics'};
export function Icon({name,...props}) { return name==='pause'||name==='play'?<span aria-hidden="true" {...props}>{name==='pause'?'Ⅱ':'▷'}</span>:<SingleSparkIcon name={iconNames[name]||name} {...props}/>; }
const shortAddress = address => address ? `${address.slice(0,6)}…${address.slice(-4)}` : '';
const number = (value,lang) => value==null||!Number.isFinite(Number(value))?'':new Intl.NumberFormat(lang==='zh'?'zh-CN':lang).format(value);
const price = ad => formatEth(currentPrice(ad));

const walletSession=createWalletSession((provider,address,source,current,allowSign,timing)=>bindWalletReferral(provider,address,source,storedNft(),current,allowSign,timing));
function useWallet(notify,page) {
  const state=useSyncExternalStore(walletSession.subscribe,walletSession.getSnapshot,walletSession.getSnapshot);
  useEffect(()=>{walletSession.start();return()=>walletSession.stop();},[]);
  useEffect(()=>{if(state.error)notify(state.error);},[state.error]);
  useEffect(()=>{if(state.address){notify(state.chainId===chain.id?'walletBNB':'walletOther');void trackEvent('wallet_connect',page);}},[state.address,state.chainId]);
  return {...state,...walletSession,disconnect:()=>{walletSession.disconnect();notify('walletDisconnected');},switchNetwork:()=>walletSession.switchNetwork(chain)};
}
function WalletControls({wallet}) {
  const {t}=useLocale();
  const details=Boolean(wallet.address||wallet.busy||wallet.error);
  const walletIcon=wallet.kind?<WalletIcon kind={wallet.kind} icon={wallet.options.find(option=>option.kind===wallet.kind)?.icon}/>:undefined;
  return <>
    <SingleSparkWalletButton className={`wallet-button ${wallet.address?'wallet-button--connected':''}`} aria-label={wallet.address?`${t('connected')}: ${wallet.address}`:t('connect')} aria-haspopup="dialog" aria-expanded={wallet.open} onClick={wallet.connect} disabled={wallet.busy} connecting={wallet.busy} address={wallet.address} walletIcon={wallet.address?walletIcon:undefined}><span className="wallet-button__label">{wallet.busy?t('connecting'):wallet.address?shortAddress(wallet.address):t('connect')}</span></SingleSparkWalletButton>
    <Dialog open={wallet.open&&!details} onClose={wallet.close} title={t('connect')}>
      {wallet.options.length?<SingleSparkWalletList wallets={wallet.options.map(option=>({name:option.kind==='Browser Wallet'?t('browserWallet'):option.kind,image:walletIconSrc(option.kind,option.icon)||walletIconSrc('Browser Wallet')}))} searchable={wallet.options.length>4} onSelect={option=>wallet.authorize(option.name===t('browserWallet')?'Browser Wallet':option.name)}/>:<EmptyState compact icon={<Icon name="wallet"/>} title={t('noWalletDetected')} description={t('walletBrowserHint')}/>}
    </Dialog>
    <Dialog open={wallet.open&&details} onClose={wallet.close} title={t(wallet.address?'connected':'connect')}>
      <SingleSparkWalletStatus status={wallet.busy?'connecting':wallet.address?'connected':'error'} wallet={wallet.kind||t('browserWallet')} address={wallet.address} walletIcon={walletIcon} message={wallet.error?t(wallet.error):wallet.binding?t('bindingReferral'):wallet.pending?t('walletPending'):wallet.address&&wallet.chainId!==chain.id?t('walletOther'):undefined} onDisconnect={wallet.disconnect} onRetry={wallet.retry}/>
      <InteractionTimings timing={wallet.timing} t={t}/>
      {wallet.address&&wallet.referralBound&&<SingleSparkKeyValueList className="wallet-referral-source" entries={[[t('inviter'),wallet.referralCode?`${location.origin}/claim?ref=${wallet.referralCode}`:t('noInviter')]]}/>}
      {wallet.address&&wallet.chainId!==chain.id&&<Button onClick={wallet.switchNetwork} disabled={wallet.busy}>{t('switchWalletNetwork')}</Button>}
    </Dialog>
  </>;
}
function Globe(){return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>;}
function ThemeIcon({dark}){return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{dark?<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></>:<path d="M20.4 14.2A9 9 0 0 1 9.8 3.6 9 9 0 1 0 20.4 14.2Z"/>}</svg>;}
function XLink(){return <a className="sidebar-social-link" href="https://x.com/onholdcc" target="_blank" rel="noopener noreferrer" aria-label="OnHold on X" title="@onholdcc"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26L22.827 21.75H16.17l-5.214-6.817-5.964 6.817H1.682l7.738-8.835L.827 2.25H7.65l4.713 6.231zm-1.161 17.52h1.833L6.654 4.126H4.687z"/></svg></a>}
function Shell({children,wallet,lang,setLang,dark,setDark,page,navigate,onChain,market,onClaimed}) {
  const {t}=useLocale();const [collapsed,setCollapsed]=useState(false);const navItems=['home','claim','burn','analytics','docs'].map(id=>({id,label:t(id),href:pagePath(id),icon:<Icon name={id==='home'?'home':id==='claim'?'claim':id}/>,active:page===id,onClick:event=>{event.preventDefault();navigate(id);}}));
  return <><RouteNavigationProgress page={page} label={t('loadingData')}/><SingleSparkSidebar className={`onhold-sidebar ${collapsed?'onhold-sidebar--collapsed':''}`} brand={<span className="brand"><span className="brand-name"><img className="brand-spark" src={claudeSpark} alt="" width="17" height="17"/><span className="brand-word">OnHold</span><span className="brand-prompt" aria-hidden="true">&gt;_</span></span></span>} brandHref="/" brandLabel="OnHold" localLinks collapsed={collapsed} onCollapsedChange={setCollapsed} navigation={navItems.map(item=>({label:item.label,path:item.href,component:item.id,iconContent:item.icon}))} active={t(page)} onNavigate={id=>navigate(['home','claim','burn','analytics','docs'].includes(id)?id:'home')} footer={<div className="sidebar-footer"><XLink/><GitHubLink/></div>}/><div className={`app-body ${collapsed?'app-body--sidebar-collapsed':''}`}><header className="topbar">{wallet.address&&<div className="global-mining-claim"><Suspense fallback={<SingleSparkSkeleton variant="input" width="16ch" height="37px" label={t('loadingData')}/>}><NftMining view="claim-button" wallet={wallet} market={market} t={t} lang={lang} onClaimed={onClaimed}/></Suspense></div>}<div className="header-controls">{chain.id===56&&<Button className="swap-onhold" size="sm" variant="primary" onClick={()=>window.open("https://flap.sh/bnb/0x2dcde86543a9cc2c9a3dd914be3fd3afef6e7777?lang=zh","_blank","noopener,noreferrer")}>Swap $OnHold <SingleSparkIcon name="arrow"/></Button>}<Select className="language-select" ariaLabel={t('language')} value={lang} onChange={setLang} options={supportedLocales.map(value=>({value,label:value.toUpperCase(),icon:<Globe/>}))} compact/><button type="button" className="theme-toggle" aria-label={t(dark?'lightMode':'darkMode')} aria-pressed={dark} onClick={()=>setDark(!dark)}><ThemeIcon dark={dark}/></button><WalletControls wallet={wallet}/><SingleSparkLoading className="nav-route-spinner" size={12} decorative/></div></header><main id="content"><PageLoadBoundary key={page} t={t}><Suspense fallback={<SingleSparkSkeleton variant="card" height={420} label={t('loadingData')}/>}>{children}</Suspense></PageLoadBoundary></main><footer className="footer"><ContractAssets wallet={wallet} t={t}/><span>© OnHold</span><span className="mobile-social-link"><XLink/><GitHubLink/></span></footer></div><BottomNavigation label={t('navigation')} items={navItems} className="mobile-navigation"/></>;
}
function Dialog({open,onClose,title,children,wide=false}) {
  const {t}=useLocale();
  return <SharedDialog open={open} onClose={onClose} ariaLabel={title} className={wide?'dialog wide':'dialog'}><div className="dialog-header"><h2>{title}</h2><Button variant="ghost" className="icon-button" onClick={onClose} aria-label={t('close')}><Icon name="close"/></Button></div>{open&&children}</SharedDialog>;
}
export function SummaryCards({financial,loading,t,lang}) {
  const claims=financial?.claims||[];
  const analytics=useSummaryMetric({metric:'claimed',label:'claimedAmount',value:financial?.claimed,loading,t,lang});
  const payments=claims.length?claims.map(row=>({amount:`${number(row.amount,lang)} $OnHold`,recipient:shortAddress(row.recipient),status:t('claimedAmount'),tokenImage:claudeSpark,recipientIcon:<Icon name="wallet"/>,badges:false})):[{amount:null,recipient:<SingleSparkSkeleton variant="input" width="8ch" height="1em" label={t('noClaimRecords')}/>,status:'',tokenImage:claudeSpark,recipientIcon:<Icon name="wallet"/>,badges:false}];
  return <div className="home-summaries" style={{'--claims-empty-label':JSON.stringify(claims.length?'':t(loading&&!financial?'loadingData':'noClaimRecords'))}}>
    <span className="singlespark-sr-only">{claims.length?claims.map(row=>`${row.recipient}: ${number(row.amount,lang)} $OnHold`).join('; '):t(loading&&!financial?'loadingData':'noClaimRecords')}</span>
    <FeaturePreviewGrid tokens={[]} tokenCards={[]} payments={payments} paymentsSummary={<SummaryMetric unit={financial?.burnedSymbol||'$OnHold'} metric="burned" label="totalBurned" value={financial?.burned} loading={loading} t={t} lang={lang}/>} analytics={analytics} launch={false} docs={false} navigation={{Payments:{path:'/claim',label:t('claimWidget')},Burns:{path:'/burn',label:t('burnWidget')},Analytics:{path:'/analytics',label:t('analyticsWidget')}}}/>
  </div>;
}

function SiteAvatar({ad}) {
  const [failed,setFailed]=useState(false);
  const src=avatarThumbnail((safeUrl(ad.avatar||'')?ad.avatar:'')||new URL('/favicon.ico',ad.url).href);
  useEffect(()=>setFailed(false),[src]);
  return <span className="site-avatar">{!failed&&!ad.empty?<img src={src} alt="" referrerPolicy="no-referrer" onError={()=>setFailed(true)}/>:<span aria-hidden="true">{ad.title.slice(0,1)}</span>}</span>;
}
function AuctionCurve({ad,now,available=true}) {
  const {t}=useLocale();
  if(!available||ad.empty)return <section className="auction-curve" aria-label={t('auctionCurve')}>
    <div className="curve-heading"><span>{t('auctionCurve')}</span><span>{t('nextHalving')} <strong><DataValue loading t={t}/></strong></span></div>
    <svg viewBox="0 0 600 120" aria-label={t('loadingData')}><foreignObject width="600" height="120"><SingleSparkSkeleton variant="input" width="100%" height="100%" label={t('loadingData')}/></foreignObject></svg>
    <div className="curve-axis">{[0,1,2,3,4].map(i=><SingleSparkSkeleton key={i} variant="input" width="4ch" height="1em" label={t('loadingData')}/>)}</div>
    <SingleSparkSkeleton variant="input" width="100%" height={16} className="curve-period" label={t('loadingData')}/>
    <div className="curve-footnote"><span>{t(ad.priceIntervalSeconds===60?'fastAdRules':'halvingRule')}</span><span className="next-price">{t('nextPrice')} <DataValue loading t={t}/> <SingleSparkTokenIcon symbol="BNB" size={13}/></span></div>
  </section>;
  const curve=auctionCurve(ad,now);
  const y=value=>105-Number(value)*85/Number(curve.levels[0]||1n);
  const points=curve.levels.flatMap((level,i)=>i?[`${i*150},${y(curve.levels[i-1])}`,`${i*150},${y(level)}`]:[`0,${y(level)}`]).join(' ');
  const remaining=Math.max(0,Math.ceil((curve.nextAt-now)/1000));
  const countdown=[Math.floor(remaining/3600),Math.floor(remaining%3600/60),remaining%60].map(value=>String(value).padStart(2,'0')).join(':');
  return <section className="auction-curve" aria-label={t('auctionCurve')}><div className="curve-heading"><span>{t('auctionCurve')}</span><span>{t('nextHalving')} <strong>{countdown}</strong></span></div><svg viewBox="0 0 600 120" role="img" aria-label={`${t(ad.priceIntervalSeconds===60?'fastAdRules':'rulesText')} ${t('currentBid')}: ${formatEth(curve.price)} BNB`}><path d="M0 20H600M0 62H600M0 105H600" className="grid-lines"/><polygon points={`0,120 ${points} 600,120`} fill="currentColor" opacity=".05"/><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2"/><circle cx={curve.position*600} cy={y(curve.price)} r="5" className="curve-now"/></svg><div className="curve-axis">{curve.levels.map((_,i)=><span key={i}>{(curve.startDay+i)*(curve.intervalSeconds===60?1:24)}{curve.intervalSeconds===60?'min':'h'}</span>)}</div><SegProgressBar value={curve.progress*100} cells={24} height={16} reveal={false} className="curve-period" ariaLabel={t('nextHalving')}/><div className="curve-footnote"><span>{t(ad.priceIntervalSeconds===60?'fastAdRules':'halvingRule')}</span><span className="next-price">{t('nextPrice')} {formatEth(curve.nextPrice)} <SingleSparkTokenIcon symbol="BNB" size={13}/></span></div></section>;
}
export function Home({state,onVisit,onBid,liveStats,financial,loading,statsLoading,biddingEnabled=true}) {
  const {t,lang}=useLocale();const ad=state.ads[0];const [now,setNow]=useState(Date.now);
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
  const available=Boolean(financial&&!ad.empty&&!ad.unavailable&&safeUrl(ad.url));
  const clicks=available?ad.clicks:null,uv=available?ad.uv:null;
  const official=['onhold.cc','www.onhold.cc'].includes(new URL(ad.url).hostname);const tags=ad.tags||[];
  const description=official?t('onholdDescription'):ad.description;
  return <><div className="single-placement"><a className="advertisement-link" href={available?ad.url:'#'} target={available?'_blank':undefined} rel="noopener noreferrer" onClick={event=>{if(!financial||!biddingEnabled){event.preventDefault();return;}if(!available){event.preventDefault();onBid(ad.id);}else onVisit(ad.id);}} aria-label={t('visitLabel')}><TokenCardLayout avatar={available?<SiteAvatar ad={ad}/>:<span className="site-avatar"><SingleSparkSkeleton variant="input" width="100%" height="100%" label={t('loadingData')}/></span>} identity={<h2>{available?new URL(ad.url).hostname:<SingleSparkSkeleton variant="input" width="12ch" height="1em" label={t('loadingData')}/>}</h2>} change={<Icon name="external"/>} networks={<>{available?tags.map(tag=><span className="feature-tag" key={tag}>{tag}</span>):<SingleSparkSkeleton variant="input" width="12ch" height="1.5em" label={t('loadingData')}/>}</>} facts={<p className="advertisement-description">{available?description:<SingleSparkSkeleton variant="input" width="80%" height="1.7em" label={t('loadingData')}/>}</p>} metrics={<div className="spotlight-metrics"><div><span>{t('currentBid')}</span><strong>{available?<SingleSparkMoney value={formatEth(currentPrice(ad,now))}/>:<DataValue loading t={t}/>} <SingleSparkTokenIcon symbol="BNB" size={21}/></strong></div><div><span>{t('siteClicks')}</span><div className="clicks-values"><strong data-testid="website-clicks" title={number(clicks,lang)}>{clicks==null?<DataValue loading t={t}/>:<SingleSparkMoney value={compactCount(clicks,lang)} aria-label={number(clicks,lang)}/>}</strong><div className="ad-uv" title={`${t('uvHint')} · ${number(uv,lang)}`}>UV <span data-testid="website-uv">{uv==null?<DataValue loading t={t}/>:<SingleSparkMoney value={compactCount(uv,lang)} aria-label={number(uv,lang)}/>}</span></div></div></div></div>} progress={<AuctionCurve ad={ad} now={now} available={available}/>}/></a><div className="ad-bid-action"><Button variant="primary" disabled={!financial||!biddingEnabled} onClick={()=>onBid(ad.id)}>{t('participateBid')}<Icon name="arrow"/></Button></div></div><div className="directory-note"><span>{liveStats&&<span className="telemetry-state">{t('liveTelemetry')}</span>}</span><details><summary>{t('rules')}</summary><p>{t(ad.priceIntervalSeconds===60?'fastAdRules':'rulesText')}</p><p>{t('adRevenueRule')}</p></details></div><SummaryCards financial={financial} loading={loading} t={t} lang={lang}/></>;
}

function BidDialog({slot,state,onClose,onPlace,onChain}) {
  const {t,lang}=useLocale();const [timing,setTiming]=useState(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [uploading,setUploading]=useState(false);const [form,setForm]=useState({url:'',avatar:'',description:'',tags:[],amount:'0.01'});
  useEffect(()=>{if(slot!==null){setError('');setForm(current=>({...current,amount:formatEth(requiredBid(state.ads[slot]))}));}},[slot]);
  const minimum=requiredBid(state.ads[slot??0]);
  let validAmount=false;try{validAmount=parseEth(form.amount)>=minimum;}catch{}
  function field(name){return {name,value:form[name],onChange:event=>setForm({...form,[name]:event.target.value})};}
  async function submit(event){event.preventDefault();if(uploading||busy||!validAmount)return;setError('');setBusy(true);const trace=createInteractionTiming(setTiming);try{await onPlace(slot,{...form,title:safeUrl(form.url)?new URL(form.url).hostname:'',category:categories[0]},trace);onClose();}catch(error){setError(translateError(error,lang));}finally{trace.finish();setBusy(false);}}
  return <Dialog open={slot!==null} onClose={onClose} title={t('bidTitle')} wide><SingleSparkPanel className="advertise-form"><form noValidate onSubmit={submit}><div className="avatar-field"><TokenMediaUpload value={form.avatar} authenticated onAuthenticate={()=>{}} onChange={avatar=>setForm(current=>({...current,avatar}))} onBusyChange={setUploading} uploadMedia={uploadAvatar} t={t} imagesOnly compact/><div><h3>{t('avatar')}</h3><p className="muted">{t('uploadHint')}</p></div></div><SingleSparkField label={t('url')} {...field('url')} type="url" maxLength={300} placeholder={t('urlPlaceholder')}/><label>{t('siteDescription')}<Textarea {...field('description')} placeholder={t('descriptionPlaceholder')}/><span className="field-count">{Array.from(form.description).length}/80</span></label><TagsField t={t} value={form.tags} onChange={tags=>setForm({...form,tags})}/><SingleSparkField label={t('amount')} {...field('amount')} inputMode="decimal" placeholder={formatEth(minimum)} autoComplete="off" aria-invalid={!validAmount} hint={<span className="token-amount">{t('requiredBidLabel')}: {formatEth(minimum)}<TokenUnit unit="BNB"/></span>}/><div className="price-note"><span>{t('requiredBidLabel')}</span><strong className="token-amount">{formatEth(minimum)}<TokenUnit unit="BNB"/></strong></div><p className="fine-print">{t('adRevenueRule')}</p><InteractionTimings timing={timing} t={t}/><Notice error>{error}</Notice><Button className="full" variant="primary" type="submit" loading={busy} disabled={busy||uploading||!validAmount||!onChain}>{t(busy?'pending':'onchainBid')}</Button>{chain.id===97&&<p className="fine-print">{t('testTokenWarning')}</p>}</form></SingleSparkPanel></Dialog>;
}
export function GuideRequestMarkers({step=1}){
  if(step===2)return <svg className="guide-request-markers" viewBox="0 0 410 575" aria-hidden="true">{[[1,320,181,76,46],[2,212,495,184,52]].map(([n,x,y,w,h])=><g key={n}><rect x={x} y={y} width={w} height={h} rx="5"/><text x={x-8} y={y+h/2} textAnchor="end" dominantBaseline="central">{n}</text></g>)}</svg>;
  const areas=[[2,354,262,94,35],[4,285,335,280,35],[5,285,526,340,33],[6,628,460,262,35],[7,891,430,287,34]];
  return <svg className="guide-request-markers" viewBox="0 0 1762 892" aria-hidden="true"><text className="guide-key-label" x="700" y="100">1  F12</text><text className="guide-key-label" x="1040" y="100">3  F5</text>{areas.map(([n,x,y,w,h],i)=><g key={i}><rect x={x} y={y} width={w} height={h} rx="5"/><text x={x-16} y={y+h/2} textAnchor="end" dominantBaseline="central">{n}</text></g>)}</svg>;
}
function Claim({wallet,onClaimed}) {
  const {t,lang}=useLocale();const [step,setStep]=useState(0);const [zoom,setZoom]=useState(false);
  const [tab,setTab]=useState('mint');const [wizardStep,setWizardStep]=useState(0);const [session,setSession]=useState('');const [parsed,setParsed]=useState(null);const [verified,setVerified]=useState(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [service,setService]=useState(null);const [result,setResult]=useState(null);
  const [progress,setProgress]=useState(()=>{const pending=pendingMint();return pending?{stage:4,pending,started:Date.now(),error:t('claimSyncPending')}:null;});const [progressOpen,setProgressOpen]=useState(!!progress);
  const [serviceLoading,setServiceLoading]=useState(true);
  useEffect(()=>watchPublicStatus(value=>{if(value)setService(value);setServiceLoading(false);}),[]);
  const guide=lang==='zh'?steps:stepsEn;const item=guide[step];const image={'guide/open-claude.png':guideOpen,'guide/network-curl.png':guideNetwork,'guide/paste-curl.png':guidePaste,'guide/nft-preview.png':guideNft}[item.image];
  const apiError=cause=>{const code=cause.code||cause.message;const key=`api.${code}`;return t(key)===key?t('genericError'):t(key);};
  async function paste(){try{const text=await navigator.clipboard.readText();extractSession(text);setSession(text);setError('');}catch(cause){setError(cause.message==='invalid_session'?t('api.invalid_session'):t('pasteManually'));}}
  useEffect(()=>()=>{if(verified?.localImage)URL.revokeObjectURL(verified.localImage);},[verified?.localImage]);
  async function prepareArtwork(value){
    if(value.expires_at*1000<=Date.now())throw Error('verification_expired');
    const {renderBanPassPng}=await import('../../src/nft-artwork.mjs');
    const png=await renderBanPassPng(value),localImage=URL.createObjectURL(png);
    setVerified({...value,png,image:localImage,localImage,artwork_ready:false});
  }
  async function verify(){
    if((!session.trim()&&!verified)||busy)return;
    setBusy(true);setError('');if(session.trim()){setVerified(null);setParsed(null);}
    try{let value=verified;if(session.trim()){value=await verifyRestriction(session);setVerified(value);setParsed(value.details||null);}setSession('');await prepareArtwork(value);setWizardStep(1);}
    catch(cause){if(cause.details)setParsed(cause.details);setError(apiError(cause));}finally{setSession('');setBusy(false);}
  }
  async function refreshMint(){if(!progress?.pending||busy)return;setBusy(true);const trace=createInteractionTiming(timing=>setProgress(current=>({...current,timing})));try{const receipt=await recoverMint(progress.pending,trace);setResult(receipt);setProgress(current=>({...current,done:true,error:null,pending:receipt.recorded?null:current.pending}));setVerified(current=>current?{...current,minted:true}:current);await trace.measure('dataSync',()=>Promise.resolve(onClaimed?.()).catch(()=>{}));}catch(cause){const message=apiError(cause);setError(message);setProgress(current=>({...current,error:message,...(cause.message==='mint_transaction_failed'?{pending:null}:{})}));}finally{trace.finish();setBusy(false);}}
  async function mint(){
    if(progress?.pending){setProgressOpen(true);return;}
    if(!verified?.png||!service?.nft_configured||!wallet.address||!wallet.referralBound||busy)return;
    if(verified.expires_at*1000<=Date.now()){setError(t('api.verification_expired'));return;}
    setBusy(true);setError('');setProgress({stage:0,started:Date.now()});setProgressOpen(true);
    const trace=createInteractionTiming(timing=>setProgress(current=>({...current,timing})));
    try{const receipt=await mintVerified(verified.verification_token,verified.png,wallet.referralCode,service.nft||service.market,wallet.address,update=>setProgress(current=>({...current,...update})),trace);setResult(receipt);setVerified(current=>({...current,minted:true}));setProgress(current=>({...current,done:true,error:null,pending:receipt.recorded?null:current.pending}));await trace.measure('dataSync',()=>Promise.resolve(onClaimed?.()).catch(()=>{}));}
    catch(cause){const message=apiError(cause);setError(message);setProgress(current=>({...current,error:message,pending:cause.pending||null}));}
    finally{trace.finish();setBusy(false);}
  }

  const verifyContent=<><Button onClick={()=>window.open('https://claude.ai/restricted','_blank','noopener,noreferrer')} disabled={busy}><Icon name="arrow"/>{t('openClaude')}</Button><label>{t('curlInput')}<div className="paste-field"><Textarea autoComplete="off" spellCheck={false} rows={7} value={session} onChange={event=>setSession(event.target.value)} placeholder={t('curlPlaceholder')} disabled={busy}/><Button onClick={paste} disabled={busy}>{t('paste')}</Button></div></label><p className="fine-print">{t('sessionUse')}</p><VerificationDetails details={parsed} t={t}/><Notice error>{error}</Notice></>;
  const claimContent=<>{verified&&<SingleSparkPanel className="verification-result"><h3>{t(verified.minted?'alreadyClaimed':'verificationComplete')}</h3><SingleSparkKeyValueList entries={[[t('standing'),t('restricted')],[t('previousPlan'),verified.plan],[t('bannedAt'),`${formatBanTime(verified.banned_at)} UTC`],[t('accountUuid'),verified.record.uuid],...(verified.organization_name?[[t('organizationName'),verified.organization_name]]:[]),...(verified.ban_category?[[t('banCategory'),verified.ban_category]]:[]),[t('nftWeight'),String(verified.weight)]]}/><p className="fine-print">{t('rewardFixed')}</p></SingleSparkPanel>}<Notice error>{error}</Notice>{progress?.pending&&<Button onClick={()=>setProgressOpen(true)}>{t('viewTransaction')}</Button>}<div className="wallet-label">{t('wallet')}</div><div className="wallet-address">{wallet.address?shortAddress(wallet.address):t('notConnected')}</div><Button onClick={wallet.connect} disabled={wallet.busy}><Icon name="wallet"/>{t(wallet.address?'connected':'connect')}</Button><SingleSparkKeyValueList className="wallet-referral-source" entries={[[t('inviter'),wallet.referralBound?(wallet.referralCode?`${location.origin}/claim?ref=${wallet.referralCode}`:t('noInviter')):t('referralNotBound')]]}/><p className="fine-print">{t('inviteRule')}</p><p className="fine-print">{t('bindingNotice')}</p>{serviceLoading?<SingleSparkSkeleton variant="text" rows={1} label={t('loadingData')}/>:!service?.nft_configured&&<Notice error={!service}>{t(service?'claimsNotConfigured':'miningUnavailable')}</Notice>}</>;
  const guidePanel=<section className="guide-card"><div className="guide-heading"><div><h2>{t('guide')}</h2><p>{t('guideIntro')}</p></div><span className="small-badge">{t('desktop')}</span></div><SegmentedTabs className="guide-step-nav" panelId="claim-guide-panel" value={String(step)} options={guide.map((entry,index)=>({value:String(index),label:String(index+1).padStart(2,'0'),ariaLabel:`${t('step')} ${index+1}: ${entry.title}`}))} onChange={value=>setStep(Number(value))} ariaLabel={t('guide')}/><div id="claim-guide-panel" role="tabpanel" aria-labelledby={`claim-guide-panel-tab-${step}`}><div className="step-head"><span>{t('step')} {String(step+1).padStart(2,'0')} / 04</span></div><h3>{item.title}</h3><p className="step-intro">{item.intro}</p><Button className={`guide-image ${step>=2?'guide-image--portrait':''}`} onClick={()=>setZoom(true)} aria-label={t('zoom')}><img src={image} alt={item.alt} width="1000" height="560"/>{(step===1||step===2)&&<GuideRequestMarkers step={step}/>}<span>{t('zoom')} ↗</span></Button><ol className="guide-instructions">{instructionsFor(item).map(text=><li key={text}>{text}</li>)}</ol>{step===0&&<a className="button open-claude" href="https://claude.ai/restricted" target="_blank" rel="noopener noreferrer">{t('openClaude')}<Icon name="arrow"/></a>}{item.tip&&<p className="guide-tip">{item.tip}</p>}<div className="guide-bottom"><Button className="text-button" onClick={()=>setStep(nextStep(step,-1))} disabled={step===0}>← {t('previous')}</Button><Button className="button primary" onClick={()=>setStep(step===3?0:nextStep(step,1))}>{t(step===3?'review':'next')} →</Button></div></div></section>;
  return <>
    {progressOpen&&<NftMintProgress progress={progress} t={t} busy={busy} explorer={chain.explorer} onClose={()=>setProgressOpen(false)} onRefresh={refreshMint}/>}
    <SegmentedTabs className="claim-mode-tabs" panelId="claim-mode-panel" value={tab} onChange={setTab} options={[{value:'mint',label:t('mintTab')},{value:'mining',label:t('miningTab')},{value:'nfts',label:t('myNftsTab')},{value:'invite',label:t('inviteTab')},{value:'faq',label:t('faqTab')}]} ariaLabel={t('claim')}/>
    <div id="claim-mode-panel" role="tabpanel" aria-labelledby={`claim-mode-panel-tab-${tab}`}>
      {tab==='mint'&&<><LaunchWizard step={wizardStep} onStepChange={setWizardStep} disabled={busy} onContinue={()=>{void verify();return false;}} title={t('claimTitle')} description={t('claimIntro')} steps={[{label:t('verifyStep'),title:t('verifyTitle'),content:verifyContent},{label:t('walletStep'),title:t('walletTitle'),content:claimContent}]} preview={currentStep=>currentStep===0?guidePanel:<section className="nft-live-preview" aria-live="polite" aria-busy={busy}><h2>{t('nftPreview')}</h2>{busy&&!verified?.png?<SingleSparkSkeleton variant="card" height={360} label={t('loadingData')}/>:<BanPassCard tier={verified?.tier} record={verified?.record} image={verified?.image} t={t}/>} <p className="fine-print">{t(verified?.png?'previewReady':verified?'previewUploading':'previewWaiting')}</p></section>} nextLabel={t(busy?'verifying':'next')} backLabel={t('previous')} submitLabel={t(verified?.minted?'alreadyClaimed':busy?'pending':'bindAndClaim')} nextDisabled={(!session.trim()&&!verified)||busy} submitLoading={busy} submitDisabled={!wallet.address||!wallet.referralBound||!service?.nft_configured||!verified?.png||verified.minted||busy} onSubmit={mint}/>{result&&<Notice>{t(result.recorded?'claimConfirmed':'claimSyncPending')} <a href={`${chain.explorer}/tx/${result.hash}`} target="_blank" rel="noopener noreferrer">{t('viewTransaction')} ↗</a></Notice>}</>}
      {tab==='nfts'&&<Suspense fallback={<SingleSparkSkeleton variant="card" height={330} label={t('loadingData')}/>}><NftMining view="owned" serviceLoading={serviceLoading} serviceError={!service} wallet={wallet} market={service?.market||null} t={t} lang={lang} onClaimed={onClaimed}/></Suspense>}
      {tab==='mining'&&<Suspense fallback={<SingleSparkSkeleton variant="card" height={330} label={t('loadingData')}/>}><NftMining serviceLoading={serviceLoading} serviceError={!service} wallet={wallet} market={service?.market||null} t={t} lang={lang} onClaimed={onClaimed}/></Suspense>}
      {tab==='invite'&&<><InviteLink wallet={wallet} t={t}/><Suspense fallback={<SingleSparkSkeleton variant="card" height={180} label={t('loadingData')}/>}><NftMining view="referral" serviceLoading={serviceLoading} serviceError={!service} wallet={wallet} market={service?.market||null} t={t} lang={lang} onClaimed={onClaimed}/></Suspense></>}
      {tab==='faq'&&<section className="faq"><h2>{t('faq')}</h2>{[1,2,3].map(n=><details key={n}><summary>{t(`faqQ${n}`)}</summary><p>{t(`faqA${n}`)}</p></details>)}</section>}
    </div>
    <Dialog open={zoom} onClose={()=>setZoom(false)} title={item.title} wide><div className="guide-zoom-scroll"><div className={`guide-zoom-figure ${step>=2?'guide-zoom-figure--portrait':''}`}><img className="large-guide" src={image} alt={item.alt}/>{(step===1||step===2)&&<GuideRequestMarkers step={step}/>}</div></div></Dialog>
  </>;
}
function Analytics({liveStats,financial,loading,statsLoading}) {
  const {t,lang}=useLocale();const [tab,setTab]=useState('spotlight');
  return <>
    <SegmentedTabs className="analytics-tabs" panelId="analytics-panel" value={tab} onChange={setTab} options={[{value:'spotlight',label:t('spotlightTab')},{value:'pool',label:t('poolTab')}]} ariaLabel={t('analytics')}/>
    <div id="analytics-panel" role="tabpanel" aria-labelledby={`analytics-panel-tab-${tab}`}>
      <div className="analytics-metrics">{(tab==='spotlight'?[['liveViews',liveStats?.page_views,t('countUnit'),statsLoading],['uniqueVisitors',liveStats?.page_uv,t('people'),statsLoading],['totalClicks',liveStats?.ad_clicks,t('countUnit'),statsLoading]]:[['claimedPeople',financial?.recipients,t('people'),loading],['claimedAmount',financial?.claimed,'$OnHold',loading],['totalBurned',financial?.burned,financial?.burnedSymbol||'$OnHold',loading]]).map(([key,value,unit,pending])=><div key={key}><span>{t(key)}</span><div className="metric-value"><DataValue value={value} loading={pending} t={t} lang={lang} compact={key==='totalBurned'} unit={unit==='$OnHold'?<span>$OnHold</span>:unit}/></div></div>)}</div>
      {tab==='pool'?<MiningNetworkHistory t={t} lang={lang}/>:<AdRanking t={t} lang={lang}/>}
    </div>
  </>;
}

function Burn() {
  const {t,lang}=useLocale();const [tab,setTab]=useState('overview');const [data,setData]=useState(null);const [error,setError]=useState(false);const [loading,setLoading]=useState(true);
  useEffect(()=>{let active=true;async function refresh(){try{const response=await fetch('/api/burn',{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error();const value=await response.json();if(value.chain_id!==chain.id||typeof value.configured!=='boolean'||!Array.isArray(value.events))throw Error();if(active){setData(value);setError(value.available===false);}}catch{if(active)setError(true);}finally{if(active)setLoading(false);}}void refresh();const interval=setInterval(refresh,30000);return()=>{active=false;clearInterval(interval);};},[]);
  const tokenSymbol=data?.token_symbol||'$OnHold',official=data?.source==='flap';
  const totals=data?.totals;const executionStatus=error?'burnUnavailable':!data?.configured?'burnNotConfigured':!data?.available?'burnUnavailable':({accumulating:'buybackAccumulating',cooldown:'buybackCooldown',eligible:'buybackEligible',listening:'flapBurnListening'}[data.status]||'burnUnavailable');const amount=(value,unit,full=false)=><DataValue value={value} loading={loading} t={t} lang={lang} digits={8} compact={unit!=='BNB'&&!full} unit={unit}/>;
  return <><section className="page-intro"><div><h1>{t('burnTitle')}</h1><p>{t(official?'flapBurnIntro':'burnIntro').replaceAll('$OnHold',tokenSymbol)}</p></div><span className="platform-token-title">{tokenSymbol}</span></section><BurnPolicy official={official} policy={data?.policy} t={t}/><SegmentedTabs value={tab} onChange={setTab} options={['overview','buybackBurnHistory'].map(value=>({value,label:t(value)}))} ariaLabel={t('burnTitle')}/>{error&&<Notice error>{t('burnUnavailable')}</Notice>}{tab==='overview'?<><div className="burn-metrics">{(official?[['totalBurned',amount(totals?.burned,tokenSymbol)]]:[['creatorFees',amount(totals?.received,'BNB')],['buybackSpent',amount(totals?.spent,'BNB')],['totalBurned',amount(totals?.burned,tokenSymbol)],['pendingFees',amount(totals?.pending,'BNB')]]).map(([label,value])=><SingleSparkPanel key={label}><span>{t(label)}</span><strong>{value}</strong></SingleSparkPanel>)}</div><BurnExecution data={data} official={official} status={executionStatus} loading={loading} amount={amount} t={t} tokenSymbol={tokenSymbol}/></>:<section className="burn-history">{loading?<SingleSparkSkeleton variant="list" rows={3} label={t('loadingData')}/>:!data||!data.available?<Notice error={error}>{t(data?.configured===false?'burnNotConfigured':'burnUnavailable')}</Notice>:<BurnHistory official={official} tokenSymbol={tokenSymbol} events={data?.events||[]} amount={amount} t={t} explorer={chain.explorer} status={executionStatus} balance={totals?.eligible_balance} minimum={data?.policy?.minimum_bnb}/>}</section>}</>;
}
export function App() {
  const [page,setPage]=useState(pageFromPath);
  const [letterOpen,setLetterOpen]=useState(()=>{if(chainConfig.mode==='prepare')return false;try{return pageFromPath()==='home'&&sessionStorage.getItem('onhold.welcome.v1')!=='read';}catch{return pageFromPath()==='home';}});
  function closeLetter(){setLetterOpen(false);try{sessionStorage.setItem('onhold.welcome.v1','read');}catch{}}
  function navigate(next){history.pushState(null,'',pagePath(next));setPage(next);window.scrollTo({top:0});document.querySelector('.app-body')?.scrollTo({top:0});}
  useEffect(()=>{const change=()=>setPage(pageFromPath());window.addEventListener('popstate',change);return()=>window.removeEventListener('popstate',change);},[]);
  const [lang,setLang]=useState(()=>initialLocale(storage.getItem('onhold.locale'),typeof navigator==='undefined'?[]:navigator.languages?.length?navigator.languages:[navigator.language]));
  const requestedLanguage=useRef(lang);
  async function chooseLanguage(value){requestedLanguage.current=value;try{await loadLocale(value);if(requestedLanguage.current!==value)return;setLang(value);try{storage.setItem('onhold.locale',value);}catch{}}catch{setNotice('genericError');}}
  const [dark,setDark]=useState(()=>storage.getItem('onhold.theme')==='dark');
  const [liveStats,setLiveStats]=useState(null);const [statsLoading,setStatsLoading]=useState(true);const [statsError,setStatsError]=useState(false);
  const [marketLoading,setMarketLoading]=useState(true);const [marketError,setMarketError]=useState(false);
  const [marketAddress,setMarketAddress]=useState(storedMarket);const [financial,setFinancial]=useState(null);
  const [state,setState]=useState({ads:[{id:0,url:'https://onhold.cc/',title:'',description:'',avatar:'',tags:[],bid:'0',startedAt:0,clicks:0,empty:true,unavailable:true}],history:[]});const [slot,setSlot]=useState(null);const [notice,setNotice]=useState('');
  const t=key=>translate(lang,key);const wallet=useWallet(setNotice,page);
  useEffect(()=>{document.documentElement.lang=lang==='zh'?'zh-CN':lang;document.title=`OnHold >_ · ${t(page)}`;},[lang,page]);
  useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light';document.documentElement.dataset.ssTheme=dark?'dark':'light';try{storage.setItem('onhold.theme',dark?'dark':'light');}catch{}},[dark]);
  async function refreshStats(){const data=await readStats();if(data)setLiveStats(data);setStatsError(!data);setStatsLoading(false);}
  useEffect(()=>{void trackEvent('page_view',page);},[page]);
  useEffect(()=>{if(['home','analytics'].includes(page))void refreshStats();},[page]);
  useEffect(()=>{const timer=setInterval(()=>{if(!document.hidden&&['home','analytics'].includes(page))void refreshStats();},statsError?30000:15000);return()=>clearInterval(timer);},[page,statsError]);
  useEffect(()=>{const refresh=()=>{if(marketAddress)void connectMarket(marketAddress).catch(marketFailed);};window.addEventListener('storage',refresh);if(location.hash)requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView());return()=>window.removeEventListener('storage',refresh);},[marketAddress]);
  useEffect(()=>{if(!notice)return;const timeout=setTimeout(()=>setNotice(''),6000);return()=>clearTimeout(timeout);},[notice]);
  async function connectMarket(address,fresh=false){const chainState=await readMarket(address,fresh);setState({history:chainState.history,ads:chainState.ads.map(ad=>({...ad,unavailable:!safeUrl(ad.url),url:safeUrl(ad.url)?ad.url:'https://onhold.cc/'}))});setFinancial(chainState.financial);setMarketAddress(chainState.market);setMarketError(false);setMarketLoading(false);}
  function marketFailed(){setMarketError(true);setMarketLoading(false);}
  useEffect(()=>{const refresh=()=>{if(!document.hidden&&['home','analytics'].includes(page)){void refreshStats();if(marketAddress)void connectMarket(marketAddress).catch(marketFailed);}};window.addEventListener('onhold:home-data',refresh);return()=>window.removeEventListener('onhold:home-data',refresh);},[marketAddress,page]);
  useEffect(()=>{if(!['home','analytics'].includes(page))return;if(marketAddress)void connectMarket(marketAddress).catch(marketFailed);else void publicStatus().then(service=>{if(service?.chain_index_configured&&service.market)return connectMarket(service.market);setMarketLoading(false);setMarketError(!service);}).catch(marketFailed);},[marketAddress,page]);
  useEffect(()=>{if(!marketAddress||!['home','analytics'].includes(page))return;const timer=setInterval(()=>{if(!document.hidden)void connectMarket(marketAddress).catch(marketFailed);},30000);return()=>clearInterval(timer);},[marketAddress,page]);
  function visit(id){void trackEvent('ad_click',page,id,marketAddress?{market:marketAddress,version:state.ads[id].version}:undefined);}
  async function bid(id,form,timing){
    if(marketAddress){
      if(!financial)throw new Error('Contract unavailable');
      placeBid(state,id,form);
      try{await placeChainBid(marketAddress,id,state.ads[id].version,form,timing);}catch(error){if(error.message.startsWith('当前广告合约尚未升级'))throw error;throw new Error(t('chainFailure'));}
      await timing.measure('dataSync',()=>connectMarket(marketAddress,true));setNotice('chainBidSuccess');return;
    }
    throw new Error(t('chainReadError'));
  }
  return <Locale.Provider value={{lang,t}}><a className="skip-link" href="#content">{t('home')}</a><Shell market={marketAddress} onClaimed={()=>marketAddress&&connectMarket(marketAddress,true)} onChain={Boolean(financial)} page={page} navigate={navigate} wallet={wallet} lang={lang} setLang={chooseLanguage} dark={dark} setDark={setDark}>{chainConfig.mode==='prepare'&&<Notice><strong>{lang==='zh'?'主网部署准备中':'Mainnet launch preparation'}</strong> — {lang==='zh'?'暂未开放核验、铸造、质押及交易。':'Verification, minting, staking and transactions are not open yet.'} <a href="https://test.onhold.cc">{lang==='zh'?'前往测试站':'Open test site'} ↗</a></Notice>}{marketError&&!notice&&['home','analytics'].includes(page)&&<Notice error className="global-notice" onClose={()=>setMarketError(false)} closeLabel={t('close')}>{t('chainReadError')} <Button size="sm" onClick={()=>{setMarketLoading(true);void (marketAddress?connectMarket(marketAddress):publicStatus().then(service=>{if(!service?.market)throw Error();return connectMarket(service.market);})).catch(marketFailed);}}>{t('retry')}</Button></Notice>}{statsError&&page==='home'&&<Notice error>{t('miningUnavailable')}</Notice>}{page==='docs'?<Docs t={t}/>:page==='home'?<Home state={state} onVisit={visit} onBid={setSlot} liveStats={liveStats} financial={financial} loading={marketLoading} statsLoading={statsLoading} biddingEnabled={gameplayAvailable}/>:page==='burn'?<Burn/>:page==='claim'?<Claim wallet={wallet} onClaimed={()=>marketAddress&&connectMarket(marketAddress,true)}/>:<Analytics state={state} liveStats={liveStats} financial={financial} loading={marketLoading} statsLoading={statsLoading}/>}</Shell><WelcomeLetter lang={lang} onLanguageChange={chooseLanguage} open={letterOpen&&page==='home'} onClose={closeLetter} onStart={()=>{closeLetter();navigate('claim');}} t={t}/><BidDialog slot={slot} state={state} onClose={()=>setSlot(null)} onPlace={bid} onChain={Boolean(marketAddress)}/>{notice&&<Notice className="global-notice" error={['walletMissing','walletOther','walletCancelled','walletError','chainReadError'].includes(notice)} onClose={()=>setNotice('')} closeLabel={t('close')}>{t(notice)}</Notice>}</Locale.Provider>;
}
