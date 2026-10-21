import React from 'react';
import {BurnCard} from '@singlespark/component-atlas/singlespark';
import {SingleSparkKeyValueList} from '@singlespark/component-atlas/primitives';
import {SingleSparkTokenIcon} from '@singlespark/component-atlas/assets';
import {SingleSparkIcon} from '@singlespark/component-atlas/icons';

export function BurnHistory({events=[],amount,t,explorer}) {
  return <div className="u-business"><div className="ub-stack">
    {events.length?events.map(event=><BurnCard key={`${event.tx_hash}-${event.log_index}`} content={{
      amount:amount(event.spent,'BNB'),
      description:<><span>{t('boughtAndBurned')}</span><strong>{amount(event.burned,'$Claude')}</strong></>,
      route:<><span><SingleSparkTokenIcon symbol="BNB" size={32}/></span><SingleSparkIcon name="arrow"/><span><span className="platform-token-unit">$Claude</span></span><SingleSparkIcon name="arrow"/><span className="ub-burn-icon"><SingleSparkIcon name="burn" size={20}/></span></>,
      status:t('buybackConfirmed'),time:'',detailsLabel:t('buybackDetails'),
      details:<SingleSparkKeyValueList entries={[
        [t('buybackSpent'),amount(event.spent,'BNB')],
        [t('totalBurned'),amount(event.burned,'$Claude')],
        [t('keeperGasRefunded'),amount(event.gas_refunded,'BNB')],
        [t('confirmedBlock'),String(event.block)],
        [t('transactionHash'),<a href={`${explorer}/tx/${event.tx_hash}`} target="_blank" rel="noopener noreferrer">{event.tx_hash.slice(0,10)}…{event.tx_hash.slice(-8)} ↗</a>]
      ]}/>
    }}/>):<p>{t('noBurnEvents')}</p>}
  </div></div>;
}
