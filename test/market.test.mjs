import test from 'node:test';
import assert from 'node:assert/strict';
import { currentPrice, parseEth, formatEth, seedMarket, loadMarket, saveMarket, placeBid, safeUrl, escapeHtml } from '../src/market.mjs';
const now = 1800000000000;
const form = {title:'My project',description:'A useful project',url:'https://example.com/',category:'开发工具',amount:'0.1'};
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
  assert.equal(result.ads[0].title,'My project');
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
