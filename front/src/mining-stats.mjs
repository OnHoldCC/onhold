export const miningPeriods=['1h','4h','1d','7d','30d','90d'];
export async function loadMiningStats(period,signal){
  if(!miningPeriods.includes(period))throw Error('invalid_period');
  const response=await fetch(`/api/mining-stats?period=${period}`,{cache:'no-store',credentials:'omit',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(5000)]):AbortSignal.timeout(5000)});
  if(!response.ok)throw Error('mining_stats_unavailable');
  const value=await response.json();
  if(value.period!==period||typeof value.available!=='boolean'||(value.available&&(!Number.isSafeInteger(value.latest?.sampledAt)||!Number.isSafeInteger(value.latest?.totalWeight)))||!Array.isArray(value.history)||value.history.some(row=>!Number.isSafeInteger(row.sampledAt)||!Number.isSafeInteger(row.totalWeight)||row.totalWeight<0||typeof row.perWeightDaily!=='string'||!/^\d+\.\d{18}$/.test(row.perWeightDaily)))throw Error('invalid_mining_stats');
  return value;
}
