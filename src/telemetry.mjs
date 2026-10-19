const kinds = new Set(['page_view','ad_click','wallet_connect']);
const pages = new Set(['home','claim','analytics']);
export function makeEvent(kind,page,siteId,eventId) {
  if(!kinds.has(kind)||!pages.has(page)) throw new Error('Invalid telemetry event');
  if(kind==='ad_click' && (page!=='home'||!Number.isInteger(siteId)||siteId<0||siteId>5)) throw new Error('Invalid site');
  if(kind!=='ad_click' && siteId!==undefined) throw new Error('Unexpected site');
  return {event_id:eventId,kind,page,site_id:siteId??null};
}
export async function trackEvent(kind,page,siteId) {
  try {
    const event=makeEvent(kind,page,siteId,crypto.randomUUID());
    const response=await fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(event),credentials:'omit',referrerPolicy:'no-referrer',keepalive:true,signal:AbortSignal.timeout(3000)});
    return response.ok;
  } catch { return false; }
}
export async function readStats() {
  try {
    const response=await fetch('/api/stats',{credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(3000)});
    if(!response.ok) return null;
    const data=await response.json();
    if(!Number.isSafeInteger(data.page_views)||!Number.isSafeInteger(data.ad_clicks)||!Array.isArray(data.clicks_by_site)||data.clicks_by_site.length!==6||!data.clicks_by_site.every(value=>Number.isSafeInteger(value)&&value>=0)) return null;
    if(!Array.isArray(data.daily_clicks)||data.daily_clicks.length!==30||!data.daily_clicks.every(row=>/^\d{4}-\d{2}-\d{2}$/.test(row.date)&&Number.isSafeInteger(row.clicks)&&row.clicks>=0)) return null;
    return data;
  } catch { return null; }
}
