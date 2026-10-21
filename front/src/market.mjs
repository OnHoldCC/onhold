import {validTags} from './tags.mjs';
export const categories = ['开发工具','社区','创作者'];
export const MIN_BID = 1000000000000000n;
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
  if (BigInt(ad.bid) === 0n) return 0n;
  const periods = Math.max(0, Math.floor((now - ad.startedAt) / ((ad.priceIntervalSeconds ?? 86400) * 1000)));
  const price = BigInt(ad.bid) >> BigInt(Math.min(periods,256));
  return price > 0n ? price : 1n;
}
export function requiredBid(ad,now=Date.now()) {
  const price=currentPrice(ad,now),replacement=price+(price+9n)/10n;
  const minimum=typeof ad.minimumBid==='string'&&/^\d{1,24}$/.test(ad.minimumBid)&&BigInt(ad.minimumBid)>0n?BigInt(ad.minimumBid):MIN_BID;
  return replacement<minimum?minimum:replacement;
}
export function seedMarket(now = Date.now()) {
  const rows = [
    ['LOOP','多模型统一接口','开发工具','0.08',32,4268,'Build. Ship. Repeat.','loop'],
    ['Mint API','面向开发者的轻量 API 中转服务。','创作者','0.064',13,3512,'Make something yours.','mint'],
    ['Bridge API','你的模型调用，从这里连接。','社区','0.048',52,2864,'每一个开始，都算数。','chapter'],
    ['OpenLink','一个入口，连接多种模型服务。','开发工具','0.024',3,2106,'Less setup. More building.','openkit'],
    ['CloudRoute','为你的 AI 工作流提供中转入口。','社区','0.036',29,1948,'A place for your next idea.','pixel'],
    ['Nova Relay','从这里找到下一条模型调用路径。','创作者','0.018',6,2144,'Small things. Big feelings.','made'],
  ];
  return {ads:rows.map(([title,description,category,bid,hours,clicks,tagline,cover],id) => ({id,title,description,technology:'Rust · Axum',avatar:'',category,bid:parseEth(bid).toString(),startedAt:now-hours*3600000,clicks,tagline,cover,url:'https://example.com/'})),history:[],localClicks:0};
}
export function auctionCurve(ad, now = Date.now()) {
  const interval = (ad.priceIntervalSeconds ?? 86400) * 1000;
  const elapsed = Math.max(0, now - ad.startedAt), period = Math.floor(elapsed / interval);
  const startDay = Math.max(0, period - 1);
  return {price:currentPrice(ad,now),nextPrice:currentPrice(ad,ad.startedAt+(period+1)*interval),nextAt:ad.startedAt+(period+1)*interval,progress:(elapsed%interval)/interval,startDay,intervalSeconds:interval/1000,position:(elapsed/interval-startDay)/4,levels:Array.from({length:5},(_,i)=>currentPrice(ad,ad.startedAt+(startDay+i)*interval))};
}
function validAd(ad,index) {
  return ad && (ad.priceIntervalSeconds===undefined||[60,86400].includes(ad.priceIntervalSeconds)) && ad.id === index && typeof ad.title === 'string' && ad.title.length > 0 && ad.title.length <= 253 && typeof ad.description === 'string' && Array.from(ad.description).length <= 80 && categories.includes(ad.category) && typeof ad.bid === 'string' && /^\d{1,24}$/.test(ad.bid) && BigInt(ad.bid) > 0n && Number.isSafeInteger(ad.startedAt) && ad.startedAt > 0 && Number.isSafeInteger(ad.clicks) && ad.clicks >= 0 && ad.clicks < 1e9 && safeUrl(ad.url) && (ad.tags === undefined || validTags(ad.tags)) && (ad.avatar === undefined || ad.avatar === '' || safeUrl(ad.avatar)) && (ad.technology === undefined || (typeof ad.technology === 'string' && Array.from(ad.technology).length <= 24)) && typeof ad.tagline === 'string' && ad.tagline.length <= 80 && ['loop','mint','chapter','openkit','pixel','made'].includes(ad.cover);
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
  const description=form.description.trim(),url=form.url.trim();
  if (!safeUrl(url)) throw new Error('请填写不含用户名或密码的完整 HTTPS 主页地址。');
  const title=new URL(url).hostname;
  if (!description || Array.from(description).length>80) throw new Error('项目介绍须为 1–80 个字符。');
  const tags=form.tags??[];
  if (!validTags(tags)) throw new Error('最多 10 个标签，每个标签最多 10 个字。');
  const technology=(form.technology||'').trim(),avatar=(form.avatar||'').trim();
  if (Array.from(technology).length>24) throw new Error('后端技术须为 1–24 个字符。');
  if (avatar && !safeUrl(avatar)) throw new Error('头像须为不含用户名或密码的 HTTPS 图片地址。');
  if (!safeUrl(url)) throw new Error('请填写不含用户名或密码的完整 HTTPS 主页地址。');
  if (!categories.includes(form.category)) throw new Error('请选择项目分类。');
  const old=state.ads.find(ad=>ad.id===slot);
  if (!old) throw new Error('广告位不存在，请刷新重试。');
  const bid=parseEth(form.amount);
  const floor=requiredBid({...old,bid:"0"},now);
  if(bid<floor)throw new Error(`最低出价为 ${formatEth(floor)} BNB。`);
  if (bid<requiredBid(old,now)) throw new Error('出价必须至少高于当前广告位价格 10%。');
  return {...state,history:[...state.history,{...old,endedAt:now}],ads:state.ads.map(ad=>ad.id===slot?{...ad,title,description,url,tags,technology,avatar,category:form.category,version:(BigInt(ad.version||0)+1n).toString(),bid:bid.toString(),startedAt:now,clicks:0,tagline:'Your next chapter starts here.'}:ad)};
}
