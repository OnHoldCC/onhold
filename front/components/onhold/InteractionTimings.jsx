import React from 'react';
import {useInteractionTimings as useSharedTimings,TimingDetails as SharedTimingDetails,InteractionTimings as SharedTimings} from '@singlespark/component-atlas/ui';
import {interactionTimingOptions} from '../../src/interaction-timing.mjs';
export const timingLabels=t=>({...Object.fromEntries(['pending','active','complete','error','elapsed'].map(key=>[key,t('txStatus.'+key)])),steps:t('timing.title'),details:t('timing.details')});
export const useInteractionTimings=(timing,t)=>useSharedTimings(timing,interactionTimingOptions(t));
export function TimingDetails({view,t}){return view?<SharedTimingDetails {...view} labels={timingLabels(t)}/>:null;}
export function InteractionTimings({timing,t}){return <SharedTimings view={useInteractionTimings(timing,t)} labels={timingLabels(t)}/>;}
