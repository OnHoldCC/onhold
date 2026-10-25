import React,{useMemo} from 'react';
import {banPassDisplayImage} from '../../src/nft-display.mjs';
import mascot from '../../src/assets/claude-code.svg';
import {formatBanTime} from '../../src/format.mjs';
import {OnHoldCollectibleCard as CollectibleCard} from '@onhold/ui/ui';
export function BanPassCard({id,tier,record,image,t}){
 const displayImage=useMemo(()=>banPassDisplayImage(image),[image]);
 const weight=tier===1?'1':tier===2?'3':tier===0?'0':t('notAvailable');
 const details=[{label:t('nftWeight'),value:weight},...(record?[{label:t('organizationName'),value:record.account},{label:t('accountUuid'),value:record.uuid},{label:t('restrictionTime'),value:`${formatBanTime(record.bannedAt)} UTC`},{label:t('previousPlan'),value:record.plan}]:[])];
 return <CollectibleCard title={`${tier===1?'Pro':tier===2?'Max':tier===0?'Free':t('nftPreview')}${id?` #${id}`:''}`} collection="Claude Code Ban Pass" eyebrow="$OnHold" grade={{label:t('nftWeight'),value:weight}} artwork={image?<img src={displayImage} alt="Claude Code Ban Pass" referrerPolicy="no-referrer"/>:<div className="nft-artwork-placeholder"><img className="nft-placeholder-mascot" src={mascot} alt="Claude Code terminal mascot"/><strong>BAN PASS</strong><p>{t('previewWaiting')}</p></div>} details={details} flipLabel={record?t('showRecord'):undefined}/>;
}
