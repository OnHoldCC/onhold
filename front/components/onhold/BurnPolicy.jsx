import React from 'react';

export function BurnPolicy({policy,official=false,t}) {
  const percent=value=>value==null?t('notAvailable'):`${Number(value)/100}%`;
  const entries=official?[
    ['buyTax',percent(policy?.buy_tax_bps)],
    ['sellTax',percent(policy?.sell_tax_bps)],
    ['burnAllocation',percent(policy?.deflation_bps)],
    ['lpAllocation',percent(policy?.lp_bps)],
    ['cycle',t('flapAutomatic')]
  ]:[['buyTax','3%'],['sellTax','3%'],['netBuybackAllocation','100%'],['cycle',t('threeMinutes')]];
  return <div className="burn-policy">{entries.map(([key,value])=><span key={key}>{t(key)} <b>{value}</b></span>)}</div>;
}
