import React from 'react';
import flame from '../../src/assets/burn/burn-flame-icon.webp';
import flameStill from '../../src/assets/burn/burn-flame-still.png';
import {BurnCard} from '@singlespark/component-atlas/singlespark';
import {SingleSparkKeyValueList,SingleSparkPanel} from '@singlespark/component-atlas/primitives';
import {SingleSparkTokenIcon} from '@singlespark/component-atlas/assets';
import {SingleSparkIcon} from '@singlespark/component-atlas/icons';
import {SingleSparkSkeleton} from '@singlespark/component-atlas/feedback';
import {formatBanTime} from '../../src/format.mjs';

export function BurnExecution({data,official,status,loading,amount,t,tokenSymbol}) {
  const totals=data?.totals;
  const entries=official?[
    [t('status'),t(status)],
    [t('feeSource'),'Flap'],
    [t('recipient'),data?.burn_address||t('notAvailable')]
  ]:[
    [t('status'),loading?<SingleSparkSkeleton variant="text" rows={1} label={t('loadingData')}/>:t(status)],
    [t('buybackBalance'),amount(totals?.eligible_balance,'BNB')],
    [t('buybackMinimum'),amount(data?.policy?.minimum_bnb,'BNB')],
    [t('unsettledCreatorFees'),amount(totals?.unsettled_creator_fees,'BNB')],
    [t('lastBalanceCheck'),data?.checked_at?`${formatBanTime(new Date(data.checked_at*1000).toISOString())} UTC`:loading?<SingleSparkSkeleton variant="text" rows={1} label={t('loadingData')}/>:t('notAvailable')],
    [t('feeSource'),'Flap'],
    [t('cycle'),t('threeMinutes')],
    [t('recipient'),'0x0000…dEaD']
  ];
  return <SingleSparkPanel className="burn-execution"><h2>{t('executionStatus')}</h2><SingleSparkKeyValueList entries={entries}/><p>{t(official?'flapBurnNote':'burnPolicyNote').replaceAll('$OnHold',tokenSymbol)}</p></SingleSparkPanel>;
}

export function BurnHistory({events=[],amount,t,explorer,status,balance,minimum,tokenSymbol='$OnHold',official=false}) {
  return <>
    {status&&<div className="burn-history-status"><p role="status">{t(status)}</p>{!official&&<div className="burn-history-balances"><span>{t('buybackBalance')} <strong>{amount(balance,'BNB')}</strong></span><span>{t('buybackMinimum')} <strong>{amount(minimum,'BNB')}</strong></span></div>}</div>}
    {events.length?events.map(event=><div className="u-business burn-history-item" key={`${event.tx_hash}-${event.log_index}`}><BurnCard content={{
      amount:event.spent==null?amount(event.burned,tokenSymbol):amount(event.spent,'BNB'),
      description:<><span>{t(event.spent==null?'flapDeflation':'boughtAndBurned')}</span>{event.spent!=null&&<strong>{amount(event.burned,tokenSymbol)}</strong>}</>,
      route:<>{event.spent!=null&&<><SingleSparkTokenIcon symbol="BNB" size={32}/><SingleSparkIcon name="arrow"/></>}<span className="burn-route-token">{tokenSymbol}</span><SingleSparkIcon name="arrow"/><picture className="burn-flame"><source media="(prefers-reduced-motion: reduce)" srcSet={flameStill}/><img src={flame} width="48" height="48" alt=""/></picture></>,
      status:t('buybackConfirmed'),time:'',detailsLabel:t('buybackDetails'),
      details:<SingleSparkKeyValueList entries={[
        ...(event.spent==null?[]:[[t('buybackSpent'),amount(event.spent,'BNB',true)]]),
        [t('totalBurned'),amount(event.burned,tokenSymbol,true)],
        [t('confirmedBlock'),String(event.block)],
        [t('transactionHash'),<a href={`${explorer}/tx/${event.tx_hash}`} target="_blank" rel="noopener noreferrer">{event.tx_hash.slice(0,10)}…{event.tx_hash.slice(-8)} ↗</a>]
      ]}/>
    }}/></div>):<p>{t('noBurnEvents')}</p>}
  </>;
}
