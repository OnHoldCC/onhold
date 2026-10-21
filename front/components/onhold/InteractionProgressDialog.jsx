import React from 'react';
import {createPortal} from 'react-dom';
import {Dialog,Button} from '@singlespark/component-atlas/ui';
import {SingleSparkIcon} from '@singlespark/component-atlas/icons';
import {TimingSteps} from './InteractionTimings';

export function InteractionProgressDialog({title,status,steps,elapsed,onClose,children,t,labels,done=false}){
 return createPortal(<Dialog open onClose={onClose} ariaLabel={title} className="interaction-progress-dialog">
  <header className="interaction-progress-dialog__header"><h2>{title}</h2><button type="button" className="interaction-progress-dialog__close" aria-label={t('close')} onClick={onClose}><SingleSparkIcon name="close" size={22}/></button></header>
  <div className="interaction-progress-dialog__body"><div className="interaction-progress-dialog__summary"><p role="status" aria-live="polite">{done&&<span className="interaction-progress-dialog__success" aria-hidden="true"><SingleSparkIcon name="check" size={18}/></span>}{status}</p><span className="interaction-progress-dialog__total"><small>{t('txStatus.elapsed')}</small><strong>{elapsed}</strong></span></div><TimingSteps steps={steps} t={t} labels={labels}/>{children}</div>
  <footer className="interaction-progress-dialog__footer"><Button onClick={onClose}>{t('close')}</Button></footer>
 </Dialog>,document.body);
}
