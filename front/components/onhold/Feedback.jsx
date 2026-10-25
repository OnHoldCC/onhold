import React from 'react';
import {Button,DataValue as SharedDataValue} from '@singlespark/component-atlas/ui';
import {NotificationFrame,SingleSparkMoney} from '@singlespark/component-atlas/singlespark';
import {SingleSparkTokenIcon} from '@singlespark/component-atlas/assets';

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
export function DataValue({t,unit='',...props}){
  return <SharedDataValue {...props} loadingLabel={t('loadingData')} unavailableLabel={t('notAvailable')} unit={unit&&<TokenUnit unit={unit}/>}/>;
}

export class PageLoadBoundary extends React.Component {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<Notice error>{this.props.t('miningUnavailable')} <Button onClick={()=>location.reload()}>{this.props.t('retry')}</Button></Notice>:this.props.children;}
}
