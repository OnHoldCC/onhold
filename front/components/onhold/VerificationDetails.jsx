import React from 'react';
import {SingleSparkPanel,SingleSparkKeyValueList} from '@singlespark/component-atlas/primitives';
import {formatBanTime} from '../../src/format.mjs';
export function VerificationDetails({details,t}){
  if(!details)return null;
  const missing=t('notAvailable');
  return <SingleSparkPanel className="verification-result parsed-account"><h3>{t('parsedAccountInfo')}</h3>
    <SingleSparkKeyValueList entries={[[t('standing'),details.standing==='bad_standing'?`${t('restricted')} (bad_standing)`:details.standing||missing],[t('previousPlan'),details.previous_plan||missing],[t('bannedAt'),details.banned_at?`${formatBanTime(details.banned_at)} UTC`:missing],...(details.ban_category?[[t('banCategory'),details.ban_category]]:[])]}/>
    {details.organizations.map((org,index)=><SingleSparkKeyValueList key={index} entries={[[t('organizationName'),org.name||missing],[t('accountUuid'),org.uuid||missing]]}/>)}
    <p className="fine-print">{t('parsedPlanNote')}</p>
  </SingleSparkPanel>;
}
