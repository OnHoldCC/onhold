import React from 'react';
import {Button} from '@singlespark/component-atlas/ui';
import {NotificationFrame,SingleSparkMoney} from '@singlespark/component-atlas/singlespark';
import {SingleSparkTokenIcon} from '@singlespark/component-atlas/assets';
import {SingleSparkSkeleton} from '@singlespark/component-atlas/feedback';
import {compactAmount} from '../../src/format.mjs';

// Same 520 ms navigation transition used by SingleSparkFront.
export function RouteNavigationProgress({page,label}){
  const previous=React.useRef(page),[visible,setVisible]=React.useState(false);
  React.useEffect(()=>{
    if(previous.current===page)return;
    previous.current=page;setVisible(true);
    const timer=setTimeout(()=>setVisible(false),520);
    return()=>clearTimeout(timer);
  },[page]);
  return visible?<div key={page} className="route-progress" role="status" aria-live="polite" aria-label={label}><span className="route-progress__bar"/></div>:null;
}

export function Notice({children,error=false,onClose,closeLabel,className=''}){
  if(!children)return null;
  return <div className={`u-business onhold-notice ${error?'onhold-notice--error':''} ${className}`} role={error?'alert':'status'}><NotificationFrame variant="toast" onClose={onClose} closeLabel={closeLabel}>{children}</NotificationFrame></div>;
}
export function TokenUnit({unit,size=18}){
  return unit==='BNB'?<SingleSparkTokenIcon symbol={unit} size={size}/>:unit==='$OnHold'?<span className="platform-token-unit">$OnHold</span>:unit;
}
export function DataValue({value,loading=false,t,unit='',digits=4,lang='en',compact=false}){
  if(loading&&value==null)return <SingleSparkSkeleton variant="input" width="7ch" height="1.2em" className="value-skeleton" label={t('loadingData')}/>;
  if(value==null||(typeof value==='string'&&!value.trim())||!Number.isFinite(Number(value)))return <span className="unavailable-value">{t('notAvailable')}</span>;
  const full=String(value),short=compact&&Number(value)>=1000;
  const money=<SingleSparkMoney value={short?compactAmount(value,lang):new Intl.NumberFormat(lang==='zh'?'zh-CN':lang,{maximumFractionDigits:digits}).format(typeof value==='bigint'?value:Number(value))} aria-label={short?full:undefined}/>;
  return <>{short?<span title={full}>{money}</span>:money}{unit&&<> <TokenUnit unit={unit}/></>}</>;
}

export class PageLoadBoundary extends React.Component {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<Notice error>{this.props.t('miningUnavailable')} <Button onClick={()=>location.reload()}>{this.props.t('retry')}</Button></Notice>:this.props.children;}
}
