import React,{useEffect,useState,useRef,useId} from 'react';
import {Button,SegmentedTabs,EmptyState} from '@singlespark/component-atlas/ui';
import {SingleSparkPanel,SingleSparkKeyValueList} from '@singlespark/component-atlas/primitives';
import {SingleSparkIcon} from '@singlespark/component-atlas/icons';
import {SingleSparkSkeleton} from '@singlespark/component-atlas/feedback';
import {DataValue,Notice} from './Feedback';
import {BanPassCard} from './BanPassCard';
import {NftStaking} from './NftStaking';
import {MiningProgress} from './MiningProgress';
import {pendingMining,confirmMining,clearMining} from '../../src/mining-receipt.mjs';
import {chain,readMining,miningAction} from '../../src/chain.mjs';

export function NftMining({wallet,market,t,lang,onClaimed,serviceLoading=false,serviceError=false,view='mining'}){
  const [data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[hash,setHash]=useState(''),[loading,setLoading]=useState(true);
  const [progress,setProgress]=useState(null),[progressOpen,setProgressOpen]=useState(false);
  const activeAction=useRef(false);
  const actionSequence=useRef(0),accountContext=useRef('');accountContext.current=`${market}:${wallet.address}`;
  useEffect(()=>{actionSequence.current++;activeAction.current=false;setBusy(false);const pending=pendingMining(market,wallet.address);setProgress(pending?{stage:2,pending,hash:pending.hash,action:pending.action,tokenId:pending.tokenId,started:pending.started}:null);setProgressOpen(Boolean(pending));return()=>{actionSequence.current++;};},[market,wallet.address]);
  useEffect(()=>{
    let active=true,running=false;setData(null);setError('');setHash('');setLoading(Boolean(market)||serviceLoading);
    async function refresh(){if(!market||running||document.hidden)return;running=true;try{const value=await readMining(market,wallet.address);if(active){setData(value);setError('');}}catch{if(active){setError(t('miningUnavailable'));}}finally{running=false;if(active)setLoading(false);}}
    void refresh();const timer=setInterval(refresh,15000);return()=>{active=false;clearInterval(timer);};
  },[market,wallet.address,wallet.revision,lang,serviceLoading]);
  const amount=(value,digits=4,unit='')=><DataValue value={value} loading={loading} t={t} lang={lang} digits={digits} unit={unit}/>;
  const [tier,setTier]=useState('all');
  const passes=(data?.passes||[]).filter(pass=>tier==='all'||pass.tier===Number(tier));
  const personal=(value,unit='')=>wallet.address?amount(value,4,unit):t('notConnected');
  async function act(action,id,recover=false){
    if(activeAction.current||progress?.pending&&!recover)return false;
    const sequence=++actionSequence.current,context=accountContext.current,current=()=>sequence===actionSequence.current&&context===accountContext.current;
    activeAction.current=true;setBusy(true);setError('');setHash('');setProgressOpen(true);
    let pending=recover?progress?.pending:null,confirmed=false;
    setProgress({action,tokenId:id,stage:recover?2:0,pending,started:pending?.started||Date.now()});
    const update=value=>{pending=value.pending||pending;if(current())setProgress(previous=>({...previous,...value,error:null}));};
    try{
      const result=recover?await confirmMining(pending,update,false):await miningAction(market,wallet.address,action,id,wallet.referrer,update);
      if(!current())return false;
      confirmed=true;
      const next=await readMining(market,wallet.address);
      if(next.confirmedBlock<result.blockNumber)throw Error('mining_sync_pending');
      if(!current())return false;
      setData(next);setHash(result.hash);clearMining(result.pending);setProgress(previous=>({...previous,stage:3,done:true,pending:null,hash:result.hash}));
      await Promise.resolve(onClaimed?.()).catch(()=>{});
      return current();
    }catch(cause){
      if(current()){
        const message=cause.code===4001||cause.code==='ACTION_REJECTED'?t('miningCancelled'):['referral_mint_required','referrer_already_bound','referral_binding_required'].includes(cause.message)?t(`api.${cause.message}`):['mining_confirmation_pending','mining_sync_pending','mining_prepare_timeout','mining_transaction_failed'].includes(cause.message)?t(cause.message):t(pending?(confirmed?'mining_sync_pending':'mining_confirmation_pending'):'miningFailed');
        if(cause.message==='mining_transaction_failed')pending=null;
        pending=cause.pending||pending;setError(message);setProgress(previous=>({...previous,pending,action:pending?.action||action,error:message}));
      }
      return false;
    }finally{if(current()){activeAction.current=false;setBusy(false);}}
  }
  const [tipsOpen,setTipsOpen]=useState(false),tipsRef=useRef(null),tipsId=useId();
  useEffect(()=>{
    if(!tipsOpen)return;
    const outside=event=>{if(!tipsRef.current?.contains(event.target))setTipsOpen(false);};
    const escape=event=>{if(event.key==='Escape')setTipsOpen(false);};
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
  },[tipsOpen]);
  const miningTips=<div className="mining-tip" ref={tipsRef} onPointerEnter={event=>{if(event.pointerType==='mouse')setTipsOpen(true);}} onPointerLeave={event=>{if(event.pointerType==='mouse'&&!tipsRef.current?.querySelector(':focus-visible'))setTipsOpen(false);}} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setTipsOpen(false);}}>
    <Button className="mining-tip-button" variant="ghost" aria-label={t('miningRules')} aria-expanded={tipsOpen} aria-controls={tipsId} aria-describedby={tipsOpen?tipsId:undefined} onFocus={event=>{if(event.currentTarget.matches(':focus-visible'))setTipsOpen(true);}} onClick={event=>setTipsOpen(open=>event.nativeEvent.pointerType==='mouse'?true:!open)}><SingleSparkIcon name="info" size={18}/></Button>
    <div id={tipsId} className="mining-tip-content" role="tooltip" tabIndex={tipsOpen?0:-1} hidden={!tipsOpen}>
      <p>{t('miningIntro')}</p><p>{t('emissionRule')}</p>
      {data&&<><p>{t('adReinvested')}: {amount(data.adReinvested,4,'$Claude')} · {t('adTeamRevenue')}: {amount(data.adTeamRevenue,8,'BNB')} · {t('adReserve')}: {amount(data.adBuybackReserve,8,'BNB')}</p><p>{t(data.startedAt?(data.asOf>=data.endsAt?'miningEnded':'miningStarted'):'miningNotStarted')}{data.startedAt?` · ${new Date(data.startedAt*1000).toLocaleString(lang)} · ${t('miningEnds')} ${new Date(data.endsAt*1000).toLocaleString(lang)}`:''}</p></>}
    </div>
  </div>;
  const locked=Boolean(progress?.pending);
  const feedback=<>{progressOpen&&progress&&<MiningProgress progress={progress} t={t} busy={busy} explorer={chain.explorer} onClose={()=>setProgressOpen(false)} onRefresh={()=>act(progress.action,progress.pending?.tokenId,true)}/>}
    {progress&&!progressOpen&&<Button onClick={()=>setProgressOpen(true)}>{t('miningViewProgress')}</Button>}{!market&&!serviceLoading&&<Notice error={serviceError}>{t(serviceError?'miningUnavailable':'claimsNotConfigured')}</Notice>}<Notice error>{error}</Notice>{hash&&<Notice><a href={`${chain.explorer}/tx/${hash}`} target="_blank" rel="noopener noreferrer">{t('viewTransaction')} ↗</a></Notice>}</>;
  if(view==='owned')return <section className="mining-section mining-owned">
    <div className="nft-gallery-heading"><h1>{t('myNfts')}</h1><SegmentedTabs value={tier} onChange={setTier} panelId="owned-nft-list" options={[{value:'all',label:t('allPlans')},{value:'0',label:'Free'},{value:'1',label:'Pro'},{value:'2',label:'Max'}]} ariaLabel={t('filterNfts')}/></div>
    {feedback}
    <div id="owned-nft-list" className="mining-passes" role="tabpanel" aria-labelledby={`owned-nft-list-tab-${tier}`} aria-busy={Boolean(loading&&wallet.address)}>
      {loading&&wallet.address&&!data?[0,1,2].map(id=><SingleSparkSkeleton key={id} variant="card" height={330} label={t('loadingData')}/>):passes.length?passes.map(pass=><div className="mining-pass" key={pass.id}><BanPassCard {...pass} t={t}/><p>{t(pass.staked?'staked':'notStaked')}</p><Button onClick={()=>act(pass.staked?'unstake':'stake',pass.id)} disabled={busy||locked||!wallet.address} loading={busy&&String(progress?.tokenId)===String(pass.id)}>{t(pass.staked?'unstake':'stake')}</Button></div>):<EmptyState className="mining-owned-empty" icon={<SingleSparkIcon name="collectible" size={28}/>} title={t(!wallet.address?'notConnected':data?'noNfts':'miningUnavailable')} action={!wallet.address?<Button onClick={wallet.connect} loading={wallet.busy}>{t('connect')}</Button>:undefined}/>}
    </div>
    {data&&(data.ownedCount>50||data.stakedCount>50)&&<p>{t('passLimit')}</p>}
  </section>;
  if(view==='referral')return <SingleSparkPanel className="mining-position"><h2>{t('referralTitle')}</h2><p className="fine-print">{t('miningInvite')}</p><p className="fine-print">{t('referralSettlement')}</p><SingleSparkKeyValueList entries={[[t('referralAvailable'),personal(data?.referralRewards,'$Claude')],[t('referralTotal'),personal(data?.referralEarned,'$Claude')],...(data?.referrer&&data.referrer!=='0x0000000000000000000000000000000000000000'?[[t('referrerWallet'),data.referrer]]:[])]}/><Button onClick={wallet.address?()=>act('claimReferralRewards'):wallet.connect} disabled={busy||locked||Boolean(wallet.address&&(!data||Number(data.referralRewards)<=0))} loading={busy&&progress?.action==='claimReferralRewards'}>{t('claimReferral')}</Button>{feedback}</SingleSparkPanel>;
  return <section className="mining-section"><div className="page-intro"><div className="mining-title"><h1>{t('miningTitle')}</h1>{miningTips}</div><span className="platform-token-title">$Claude</span></div><div className="mining-metrics">{[[t('poolSize'),amount(data?.poolBudget,4,<span>$Claude</span>)],[t('dailyEmission'),amount(data?.daily,4,<span>$Claude</span>)],[t('totalWeight'),amount(data?.totalEffective)],[t('mintedPasses'),amount(data?.minted)]].map(([label,value])=><SingleSparkPanel key={label}><span>{label}</span><strong>{value}</strong></SingleSparkPanel>)}</div><NftStaking wallet={wallet} market={market} revision={hash} busy={busy} locked={locked} loadingId={busy&&['stake','unstake'].includes(progress?.action)?String(progress.tokenId):null} onAction={act} t={t}/><SingleSparkPanel className="mining-position"><div className="staking-rewards"><span>{t('earnedRewards')}</span><strong>{personal(data?.earned,'$Claude')}</strong></div><Button variant="primary" loading={busy&&progress?.action==='getReward'} onClick={wallet.address?()=>act('getReward'):wallet.connect} disabled={busy||locked||Boolean(wallet.address&&(!data||Number(data.earned)<=0))}>{t(wallet.address?'claimMining':'connect')}</Button><p className="fine-print">{t('holdingRule')}</p>{data&&<p className="fine-print">{t('estimatedRewards')} · {t('syncedBlock')} {data.confirmedBlock} · {new Date(data.asOf*1000).toLocaleString(lang)}</p>}</SingleSparkPanel>{feedback}</section>;
}
