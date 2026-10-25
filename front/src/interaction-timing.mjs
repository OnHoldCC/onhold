export {createInteractionTiming,formatDuration} from '@singlespark/component-atlas/ui';
import {timingSteps as sharedTimingSteps,compactTimingSteps as sharedCompactTimingSteps} from '@singlespark/component-atlas/ui';
export const timingKinds={connect:'wallet',walletPrepare:'local',walletCheck:'local',referralCheck:'backend',referralSave:'backend',signature:'wallet',upload:'backend',authorize:'backend',contractRead:'rpc',estimateGas:'rpc',sendTransaction:'wallet',chainConfirm:'chain',receiptSync:'backend',dataSync:'backend',bindTransaction:'wallet',bindConfirm:'chain',approveTransaction:'wallet',approveConfirm:'chain'};
export const interactionTimingOptions=t=>({label:key=>t(`timing.${key}`),description:key=>t(`timing.wait.${timingKinds[key]||'local'}`),groups:{walletPrepare:'prepare',walletCheck:'prepare',contractRead:'prepare',bindTransaction:'bind',bindConfirm:'bind',approveTransaction:'approve',approveConfirm:'approve',receiptSync:'dataSync'}});
export const timingSteps=(timing,t,now)=>sharedTimingSteps(timing,interactionTimingOptions(t),now);
export const compactTimingSteps=(timing,t,now)=>sharedCompactTimingSteps(timing,interactionTimingOptions(t),now);
