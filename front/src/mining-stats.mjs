import {readJson} from './read-json.mjs';
export const miningPeriods=['1h','4h','1d','7d','30d','90d'];
export function summaryHistory(rows,metric,current){
  // Old snapshots have no financial totals; never backfill them with invented zeroes.
  const history=rows.flatMap(row=>{
    const value=row.financial?.[metric];
    return typeof value==='string'&&/^\d+\.\d{18}$/.test(value)&&Number.isFinite(Number(value))?[Number(value)]:[];
  });
  if(current!=null&&String(current).trim()!==''&&Number.isFinite(Number(current))&&Number(current)>=0&&history.at(-1)!==Number(current))history.push(Number(current));
  return history;
}
export async function loadMiningStats(period,signal){
  if(!miningPeriods.includes(period))throw Error('invalid_period');
  const value=await readJson(`/api/mining-stats?period=${period}`,5000,signal);
  if(value.period!==period||typeof value.available!=='boolean'||(value.available&&(!Number.isSafeInteger(value.latest?.sampledAt)||!Number.isSafeInteger(value.latest?.totalWeight)))||!Array.isArray(value.history)||value.history.some(row=>!Number.isSafeInteger(row.sampledAt)||!Number.isSafeInteger(row.totalWeight)||row.totalWeight<0||typeof row.perWeightDaily!=='string'||!/^\d+\.\d{18}$/.test(row.perWeightDaily)))throw Error('invalid_mining_stats');
  return value;
}
