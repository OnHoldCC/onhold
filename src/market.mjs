export const categories = ['开发工具','社区','创作者'];
const key = 'onhold.market.v1';
export function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }
export function safeUrl(value) { try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password && value.length <= 300; } catch { return false; } }
export function parseEth(value) {
  if (!/^(?:0|[1-9]\d{0,5})(?:\.\d{1,18})?$/.test(value)) throw new Error('请输入正数，最多保留 18 位小数。');
  const [whole, decimal = ''] = value.split('.');
  const wei = BigInt(whole) * 10n**18n + BigInt(decimal.padEnd(18,'0'));
  if (wei <= 0n) throw new Error('出价必须大于 0。');
  return wei;
}
export function formatEth(value) {
  const wei = BigInt(value), decimal = (wei % 10n**18n).toString().padStart(18,'0').replace(/0+$/,'');
  return (wei / 10n**18n).toString() + (decimal ? '.' + decimal : '');
}
export function currentPrice(ad, now = Date.now()) {
  const days = Math.max(0, Math.floor((now - ad.startedAt) / 86400000));
  const price = BigInt(ad.bid) >> BigInt(Math.min(days,256));
  return price > 0n ? price : 1n;
}
export function seedMarket(now = Date.now()) {
  const rows = [
    ['LOOP','把想法，变成下一个作品。','开发工具','0.08',32,4268,'Build. Ship. Repeat.','loop'],
    ['Mint Studio','为独立创造者，造一间工作室。','创作者','0.064',13,3512,'Make something yours.','mint'],
    ['序章','一群开发者的下一次出发。','社区','0.048',52,2864,'每一个开始，都算数。','chapter'],
    ['OpenKit','开放的工具，无限的可能。','开发工具','0.024',3,2106,'Less setup. More building.','openkit'],
    ['像素公园','在这里，找到一起创造的人。','社区','0.036',29,1948,'A place for your next idea.','pixel'],
    ['MADE BY YOU','认真做的小东西，也值得被看见。','创作者','0.018',6,2144,'Small things. Big feelings.','made'],
  ];
  return {ads:rows.map(([title,description,category,bid,hours,clicks,tagline,cover],id) => ({id,title,description,category,bid:parseEth(bid).toString(),startedAt:now-hours*3600000,clicks,tagline,cover,url:'https://example.com/'})),history:[],localClicks:0};
}
function validAd(ad,index) {
  return ad && ad.id === index && typeof ad.title === 'string' && ad.title.length > 0 && ad.title.length <= 32 && typeof ad.description === 'string' && ad.description.length <= 80 && categories.includes(ad.category) && typeof ad.bid === 'string' && /^\d{1,24}$/.test(ad.bid) && BigInt(ad.bid) > 0n && Number.isSafeInteger(ad.startedAt) && ad.startedAt > 0 && Number.isSafeInteger(ad.clicks) && ad.clicks >= 0 && ad.clicks < 1e9 && safeUrl(ad.url) && typeof ad.tagline === 'string' && ad.tagline.length <= 80 && ['loop','mint','chapter','openkit','pixel','made'].includes(ad.cover);
}
export function loadMarket(storage) {
  try {
    const state = JSON.parse(storage.getItem(key));
    if (state && Array.isArray(state.ads) && state.ads.length === 6 && state.ads.every(validAd) && Number.isSafeInteger(state.localClicks) && state.localClicks >= 0 && state.localClicks < 1e9) {
      const history = state.history ?? [];
      if (Array.isArray(history) && history.every(ad => Number.isInteger(ad.id) && ad.id >= 0 && ad.id < 6 && validAd(ad,ad.id) && Number.isSafeInteger(ad.endedAt) && ad.endedAt >= ad.startedAt)) return {...state,history};
    }
  } catch {}
  return seedMarket();
}
export function saveMarket(storage,state) { storage.setItem(key,JSON.stringify(state)); }
export function placeBid(state,slot,form,now = Date.now()) {
  const title=form.title.trim(),description=form.description.trim(),url=form.url.trim();
  if (!title || title.length>32) throw new Error('项目名称须为 1–32 个字符。');
  if (!description || description.length>80) throw new Error('项目介绍须为 1–80 个字符。');
  if (!safeUrl(url)) throw new Error('请填写不含用户名或密码的完整 HTTPS 主页地址。');
  if (!categories.includes(form.category)) throw new Error('请选择项目分类。');
  const old=state.ads.find(ad=>ad.id===slot);
  if (!old) throw new Error('广告位不存在，请刷新重试。');
  const bid=parseEth(form.amount);
  if (bid<=currentPrice(old,now)) throw new Error('出价必须高于当前广告位价格。');
  return {...state,history:[...state.history,{...old,endedAt:now}],ads:state.ads.map(ad=>ad.id===slot?{...ad,title,description,url,category:form.category,bid:bid.toString(),startedAt:now,clicks:0,tagline:'Your next chapter starts here.'}:ad)};
}
