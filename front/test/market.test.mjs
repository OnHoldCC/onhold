import test from 'node:test';
import assert from 'node:assert/strict';
import { currentPrice,requiredBid, auctionCurve, parseEth, formatEth, seedMarket, loadMarket, saveMarket, placeBid, safeUrl, escapeHtml } from '../src/market.mjs';
const now = 1800000000000;
const form = {title:'My project',description:'多模型统一接口',tags:['Claude API'],avatar:'https://example.com/logo.png',url:'https://example.com/',category:'开发工具',amount:'0.1'};
test('the first 24 hours preserve price, with exact daily halvings and a 1 wei floor',()=>{
  const ad={bid:'800',startedAt:now};
  assert.equal(currentPrice(ad,now-1),800n);
  assert.equal(currentPrice(ad,now+86400000-1),800n);
  assert.equal(currentPrice(ad,now+86400000),400n);
  assert.equal(currentPrice(ad,now+86400000*2),200n);
  assert.equal(currentPrice(ad,now+86400000*400),1n);
});
test('ETH input retains wei precision and rejects invalid values',()=>{
  for(const input of ['0.08','1','0.000000000000000001','123.123456789012345678']) assert.equal(parseEth(formatEth(parseEth(input))),parseEth(input));
  for(const input of ['0','-1','1e3','NaN','0.0000000000000000001','1.1.1','01','Infinity']) assert.throws(()=>parseEth(input));
});
test('a replacement requires a strictly greater bid and preserves historical clicks',()=>{
  const state=seedMarket(now),ad=state.ads[0];
  assert.throws(()=>placeBid(state,0,{...form,amount:formatEth(currentPrice(ad,now))},now),/高于/);
  const result=placeBid(state,0,form,now);
  assert.equal(result.ads[0].title,'example.com');
  assert.equal(result.ads[0].clicks,0);
  assert.equal(result.ads[0].startedAt,now);
  assert.equal(result.history[0].clicks,ad.clicks);
  assert.equal(result.history[0].endedAt,now);
  assert.equal(state.ads[0].title,'LOOP');
  assert.equal(result.ads[1],state.ads[1]);
  assert.equal([...result.ads,...result.history].reduce((sum,row)=>sum+row.clicks,0),state.ads.reduce((sum,row)=>sum+row.clicks,0));
});
test('URL and content validation blocks executable links and HTML injection',()=>{
  for(const url of ['javascript:alert(1)','data:text/html,hello','http://example.com','https://user:pass@example.com']) assert.equal(safeUrl(url),false);
  assert.equal(safeUrl('https://example.com/path?q=value'),true);
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">'),'&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.throws(()=>placeBid(seedMarket(now),0,{...form,url:'javascript:alert(1)'},now),/HTTPS/);
  assert.throws(()=>placeBid(seedMarket(now),0,{...form,category:'invalid'},now),/分类/);
  assert.throws(()=>placeBid(seedMarket(now),6,form,now),/不存在/);
});
test('valid local data persists; malformed and unsafe data falls back to safe examples',()=>{
  let value=null;const storage={getItem:()=>value,setItem:(_,next)=>value=next};
  const state=placeBid(seedMarket(now),0,form,now);saveMarket(storage,state);assert.deepEqual(loadMarket(storage),state);
  value='{broken';assert.equal(loadMarket(storage).ads.length,6);
  value=JSON.stringify({...state,ads:state.ads.map(ad=>({...ad,url:'javascript:alert(1)'}))});assert.equal(loadMarket(storage).ads[0].title,'LOOP');
  value=JSON.stringify({...state,history:[{bad:true}]});assert.equal(loadMarket(storage).history.length,0);
});

test('curve uses exact auction boundaries, handles clock skew and the 1 wei floor',()=>{
  const ad={bid:'800',startedAt:now};
  assert.equal(auctionCurve(ad,now-1).progress,0);
  const before=auctionCurve(ad,now+86400000-1),after=auctionCurve(ad,now+86400000);
  assert.equal(before.price,800n);assert.equal(before.nextPrice,400n);assert.equal(before.nextAt,now+86400000);
  assert.equal(after.price,400n);assert.equal(after.progress,0);assert.deepEqual(after.levels,[800n,400n,200n,100n,50n]);
  const late=auctionCurve(ad,now+86400000*400);assert.equal(late.price,1n);assert.equal(late.nextPrice,1n);assert.ok(late.position>=0&&late.position<=1);
});
test('ten Unicode tag characters in total, minimum bid and safe avatar metadata',()=>{
  const state=seedMarket(now);
  for(const tag of ['一二三四五六七八九十','😀'.repeat(10),'Claude API']) assert.deepEqual(placeBid(state,0,{...form,tags:[tag]},now).ads[0].tags,[tag]);
  for(const tags of [['一二三四五六七八九十多'],['😀'.repeat(11)],['Claude','Claude'],[''],['123456','12345']]) assert.throws(()=>placeBid(state,0,{...form,tags},now),/10/);
  assert.throws(()=>placeBid(state,0,{...form,description:'😀'.repeat(81)},now),/1–80/);
  assert.throws(()=>placeBid(state,0,{...form,avatar:'javascript:alert(1)'},now),/头像/);
  assert.throws(()=>placeBid(state,0,{...form,amount:'0.009'},now),/0.01/);
  const legacy=seedMarket(now);for(const ad of legacy.ads){delete ad.technology;delete ad.avatar;}
  assert.deepEqual(loadMarket({getItem:()=>JSON.stringify(legacy)}),legacy);
  const valid=placeBid(state,0,{...form,description:'😀'.repeat(80)},now);
  assert.deepEqual(loadMarket({getItem:()=>JSON.stringify(valid)}),valid);
  const invalid={...valid,ads:valid.ads.map(ad=>({...ad,tags:['123456','78901']}))};
  assert.equal(loadMarket({getItem:()=>JSON.stringify(invalid)}).ads[0].title,'LOOP');
});

test('replacement bids include ten percent rounded up, then the minimum floor',()=>{
 const ad={bid:'10000000000000001',startedAt:now};assert.equal(requiredBid(ad,now),11000000000000002n);
 const state=seedMarket(now);const required=requiredBid(state.ads[0],now);
 assert.throws(()=>placeBid(state,0,{...form,amount:formatEth(required-1n)},now),/10%/);
 assert.equal(placeBid(state,0,{...form,amount:formatEth(required)},now).ads[0].bid,required.toString());
 assert.equal(requiredBid({bid:'1',startedAt:now},now),10000000000000000n);
});

test('Mock minimum comes from the indexed deployment and does not change the production floor',()=>{
 const ad={bid:'0',startedAt:0};
 assert.equal(requiredBid(ad),10000000000000000n);
 assert.equal(requiredBid({...ad,minimumBid:'100000000000000'}),100000000000000n);
 assert.equal(requiredBid({...ad,minimumBid:'invalid'}),10000000000000000n);
});
