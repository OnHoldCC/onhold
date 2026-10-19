import { icon } from './shell.js';
import { categories, escapeHtml as e, currentPrice, formatEth, loadMarket, saveMarket, placeBid } from './market.mjs';
const $ = id => document.getElementById(id);
const storage = (() => { try { return localStorage; } catch { return {getItem:()=>null,setItem:()=>{throw new Error('浏览器阻止了本地存储，请允许本站存储后重试。');}}; } })();
let state=loadMarket(storage);
// shortcut: 演示状态只保存在本机；接入真实竞价后改由链上事件提供共享状态。
try { if (!storage.getItem('onhold.market.v1')) saveMarket(storage,state); } catch {}
const number = value => value.toLocaleString('zh-CN');
const price = ad => { const value=formatEth(currentPrice(ad)); return value.length>10?Number(value).toPrecision(4):value; };
function metrics(id) {
  const total=[...state.ads,...state.history].reduce((sum,ad)=>sum+ad.clicks,0);
  $(id).innerHTML=[['广告浏览点击',number(total),'次',`含本机新增 ${state.localClicks} 次`,'chart'],['累计赔付金额','128,000','OHLD','示例汇总 · 尚未真实发放','claim'],['已赔付用户','256','人','示例人数 · 按组织去重','wallet'],['参与广告位','6','/ 6','每满 24 小时价格减半','home']].map(([label,value,unit,detail,type])=>`<a href="analytics.html" class="metric-card"><div class="metric-label">${label}${icon(type)}</div><div class="metric-value">${value}<small>${unit}</small></div><span class="metric-detail">${detail}</span></a>`).join('');
}
if(document.body.dataset.page==='home') {
  let category='全部',selectedSlot=0;
  function toast(message) { $('toast').textContent=message;$('toast').hidden=false;clearTimeout(toast.timeout);toast.timeout=setTimeout(()=>$('toast').hidden=true,5000); }
  function render() {
    metrics('home-metrics');
    $('filters').innerHTML=['全部',...categories].map(label=>`<button type="button" data-category="${label}" aria-pressed="${label===category}">${label}</button>`).join('');
    const sort=$('ad-sort').value;
    const ads=state.ads.filter(ad=>category==='全部'||ad.category===category).sort((a,b)=>sort==='clicks'?b.clicks-a.clicks:sort==='newest'?b.startedAt-a.startedAt:currentPrice(a)===currentPrice(b)?a.id-b.id:currentPrice(a)>currentPrice(b)?-1:1);
    $('ad-grid').innerHTML=ads.map(ad=>{
      const elapsed=Math.max(0,Date.now()-ad.startedAt),until=Math.ceil((86400000-elapsed%86400000)/3600000);
      return `<article class="ad-card"><div class="ad-cover cover-${ad.cover}"><span class="cover-index">AD / 0${ad.id+1}</span><span class="cover-object" aria-hidden="true"></span><strong>${e(ad.title)}</strong><span class="cover-tagline">${e(ad.tagline)}</span><span class="sample-badge">演示广告</span></div><div class="ad-content"><div class="ad-title-row"><h3>${e(ad.title)}</h3><span class="category-tag">${e(ad.category)}</span></div><p class="ad-description">${e(ad.description)}</p><div class="ad-engagement"><a href="analytics.html">${icon('chart')}${number(ad.clicks)} 次点击</a><a href="${e(ad.url)}" target="_blank" rel="noopener noreferrer" data-visit="${ad.id}" aria-label="访问 ${e(ad.title)} 的主页（新标签页）">访问主页 ↗</a></div><div class="ad-bid-row"><div><span>当前竞价 · test ETH</span><strong>${price(ad)}</strong></div><button class="small-pill" type="button" data-bid="${ad.id}">竞价替换 ↗</button></div><div class="decay-label"><span class="small-dot"></span>${elapsed<86400000?'保价中':'价格已衰减'} · 约 ${until} 小时后减半</div></div></article>`;
    }).join('');
  }
  function refreshBidPrice() {selectedSlot=Number($('bid-slot').value);$('bid-current').textContent=price(state.ads[selectedSlot])+' test ETH';}
  function openBid(slot=0) {
    state=loadMarket(storage);$('bid-form').reset();$('bid-error').textContent='';
    $('bid-slot').innerHTML=state.ads.map(ad=>`<option value="${ad.id}">位置 0${ad.id+1} · ${e(ad.title)}</option>`).join('');
    $('bid-slot').value=String(slot);refreshBidPrice();$('bid-dialog').showModal();
  }
  $('filters').addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(button){category=button.dataset.category;render();}});
  $('ad-sort').addEventListener('change',render);
  $('hero-bid').addEventListener('click',()=>openBid());
  $('ad-grid').addEventListener('click',event=>{
    const bid=event.target.closest('[data-bid]');if(bid){openBid(Number(bid.dataset.bid));return;}
    const visit=event.target.closest('[data-visit]');if(visit){const next=loadMarket(storage);next.ads[Number(visit.dataset.visit)].clicks++;next.localClicks++;try{saveMarket(storage,next);state=next;render();}catch{toast('主页将继续打开，但点击未能保存到本机。');}}
  });
  $('bid-slot').addEventListener('change',refreshBidPrice);
  $('close-bid').addEventListener('click',()=>$('bid-dialog').close());
  $('bid-form').addEventListener('submit',event=>{
    event.preventDefault();
    try{const next=placeBid(loadMarket(storage),selectedSlot,Object.fromEntries(new FormData(event.target)));saveMarket(storage,next);state=next;category='全部';render();$('bid-dialog').close();toast('演示广告已替换。没有扣款或发送钱包交易。');}
    catch(error){$('bid-error').textContent=error.message;}
  });
  window.addEventListener('storage',()=>{state=loadMarket(storage);render();});
  render();
} else {
  function renderRanking() {
    metrics('analytics-metrics');
    const participants=[...state.ads,...state.history];
    const max=Math.max(...participants.map(ad=>ad.clicks),1);
    $('participant-count').textContent=`共 ${participants.length} 次广告投放`;
    $('ranking-rows').innerHTML=participants.sort((a,b)=>b.clicks-a.clicks||a.id-b.id).map((ad,index)=>`<tr><td><span class="rank-position rank-${index+1}">${String(index+1).padStart(2,'0')}</span></td><td><div class="rank-project"><span class="project-avatar cover-${ad.cover}">${e(ad.title.slice(0,1))}</span><span><strong>${e(ad.title)}</strong><small>广告位 0${ad.id+1}${ad.endedAt?' · 已被替换':''}</small></span></div></td><td><strong class="tabular">${number(ad.clicks)}</strong><div class="rank-bar"><span style="width:${Math.max(2,ad.clicks/max*100)}%"></span></div></td><td class="tabular">${ad.endedAt?'已结束':price(ad)+' <small>test ETH</small>'}</td><td><span class="category-tag">${e(ad.category)}</span></td></tr>`).join('');
  }
  const seven=[1840,2364,1958,2810,2246,3154,2470];
  const thirty=[1610,1380,1810,1540,2230,1780,2040,1870,2330,2120,1760,2400,2080,1960,2580,2220,2490,2180,2740,2300,2610,2150,2810,...seven];
  function chart(period) {
    const values=period===7?seven:thirty;
    const points=values.map((value,index)=>`${58+index/(values.length-1)*890},${220-value/4000*180}`).join(' ');
    const dateLabel=index=>{const date=new Date();date.setDate(date.getDate()-(values.length-index-1));return `${String(date.getMonth()+1).padStart(2,'0')}/${String(date.getDate()).padStart(2,'0')}`;};
    $('chart-caption').textContent=`最近 ${period} 天 · 示例数据，不含本机新增点击`;
    $('chart').innerHTML=`<svg viewBox="0 0 980 265" role="img" aria-label="最近 ${period} 天示例点击趋势；详细数值见下方数据表"><defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#aeb4aa" stop-opacity=".25"/><stop offset="100%" stop-color="#aeb4aa" stop-opacity="0"/></linearGradient></defs>${[0,1000,2000,3000,4000].map(value=>`<line x1="58" y1="${220-value/4000*180}" x2="948" y2="${220-value/4000*180}" class="chart-gridline"/><text x="0" y="${225-value/4000*180}" class="chart-label">${value===0?'0':value/1000+'k'}</text>`).join('')}<polygon points="58,220 ${points} 948,220" fill="url(#chart-fill)"/><polyline points="${points}" fill="none" stroke="#737b6d" stroke-width="2.5" stroke-linejoin="round"/>${values.map((value,index)=>`<circle cx="${58+index/(values.length-1)*890}" cy="${220-value/4000*180}" r="3" fill="#737b6d"><title>${dateLabel(index)}：${number(value)} 次示例点击</title></circle>`).join('')}${[0,Math.floor((values.length-1)/2),values.length-1].map(index=>`<text x="${58+index/(values.length-1)*890}" y="252" text-anchor="middle" class="chart-label">${dateLabel(index)}</text>`).join('')}</svg>`;
    $('chart-table').innerHTML=`<table><thead><tr><th scope="col">日期</th><th scope="col">示例点击</th></tr></thead><tbody>${values.map((value,index)=>`<tr><td>${dateLabel(index)}</td><td>${number(value)}</td></tr>`).join('')}</tbody></table>`;
    document.querySelectorAll('[data-period]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.period)===period)));
  }
  document.querySelectorAll('[data-period]').forEach(button=>button.addEventListener('click',()=>chart(Number(button.dataset.period))));
  window.addEventListener('storage',()=>{state=loadMarket(storage);renderRanking();});
  renderRanking();chart(7);
}
