import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

test('one backend transaction renders one SingleSpark BurnCard without captured demo data',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'onhold-burn-card-'));
  try{
    const outfile=join(directory,'render.mjs');
    await build({stdin:{resolveDir:fileURLToPath(new URL('../',import.meta.url)),contents:`
      import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';
      import {BurnHistory,BurnExecution} from './components/onhold/BurnHistory.jsx';
      import {DataValue} from './components/onhold/Feedback.jsx';
      import {BurnPolicy} from './components/onhold/BurnPolicy.jsx';
      import {translate} from './src/i18n.mjs';
      const props={amount:(value,unit)=>value+' '+unit,t:key=>key,explorer:'https://testnet.bscscan.com'};
      const event={tx_hash:'0x'+'a'.repeat(64),log_index:0,block:123,spent:'0.0019',burned:'128',gas_refunded:'0.00005'};
      const render=extra=>renderToStaticMarkup(React.createElement(BurnHistory,{...props,...extra}));
      const waiting={t:key=>translate('zh',key),status:'buybackAccumulating',balance:'0',minimum:'0.001'};
      const execution=official=>renderToStaticMarkup(React.createElement(BurnExecution,{...props,t:waiting.t,official,tokenSymbol:'$OHLDTEST',status:official?'flapBurnListening':'buybackAccumulating',data:{totals:{eligible_balance:'0.00008123',gas_refunded:'0.00004523',unsettled_creator_fees:'0'},policy:{minimum_bnb:'0.001',max_gas_refund_bnb:'0.0001'},checked_at:1792598262,burn_address:'0x000000000000000000000000000000000000dEaD'}}));
      const legacyPolicy=renderToStaticMarkup(React.createElement(BurnPolicy,{t:waiting.t}));
      console.log(JSON.stringify({legacyPolicy,execution:execution(false),officialExecution:execution(true),policy:renderToStaticMarkup(React.createElement(BurnPolicy,{official:true,policy:{buy_tax_bps:300,sell_tax_bps:300,deflation_bps:5000,lp_bps:5000},t:key=>translate('zh',key)})),compact:renderToStaticMarkup(React.createElement(DataValue,{value:'167497.970492817354414814',compact:true,lang:'zh',unit:'$OHLDTEST',t:key=>key})),million:renderToStaticMarkup(React.createElement(DataValue,{value:'1234567.89',compact:true,t:key=>key})),small:renderToStaticMarkup(React.createElement(DataValue,{value:'0.00008123',compact:true,digits:8,t:key=>key})),official:render({official:true,events:[{...event,spent:null,gas_refunded:null}],status:'flapBurnListening'}),filled:render({events:[event]}),multiple:render({events:[event,{...event,tx_hash:'0x'+'b'.repeat(64)}]}),flap:render({events:[event],tokenSymbol:'$OHLDTEST'}),empty:render({events:[]}),belowMinimum:render({...waiting,events:[]}),historyBelowMinimum:render({...waiting,balance:'0.00008123',events:[event]}),eligibleEmpty:render({...waiting,status:'buybackEligible',balance:'0.001',events:[]})}));
    `},outfile,bundle:true,platform:'node',format:'esm',loader:{'.webp':'file','.png':'file'},logLevel:'silent',define:{'process.env.NODE_ENV':'"production"'},banner:{js:"import {createRequire} from 'node:module'; const require=createRequire(import.meta.url);"}});
    const html=JSON.parse(execFileSync(process.execPath,[outfile],{encoding:'utf8'}));
    for(const key of ['filled','execution','officialExecution','policy'])assert.doesNotMatch(html[key],/Keeper|Gas 补偿|扣除 Gas|keeperGasRefunded|keeperGasCap|0\.00004523|0\.00005 BNB/);
    assert.match(html.execution,/0.00008123 BNB/);assert.match(html.execution,/旧测试合约/);assert.match(html.execution,/尚未启用/);assert.match(html.officialExecution,/正在监听 Flap/);
    assert.match(html.legacyPolicy,/扣除 Gas 后回购&amp;LP比例/);assert.match(html.legacyPolicy,/<b>100%/);
    assert.match(html.policy,/买入税 <b>3%/);assert.match(html.policy,/卖出税 <b>3%/);assert.match(html.policy,/销毁分配 <b>50%/);assert.match(html.policy,/增加 LP <b>50%/);assert.match(html.policy,/Flap 自动触发/);assert.doesNotMatch(html.policy,/100%|3 分钟|扣除 Gas/);
    assert.match(html.compact,/167.5K/);assert.match(html.compact,/title="167497.970492817354414814"/);assert.match(html.compact,/aria-label="167497.970492817354414814"/);assert.match(html.million,/1.23M/);assert.match(html.small,/0.00008123/);
    assert.match(html.official,/flapDeflation/);assert.match(html.official,/128 \$OnHold/);assert.doesNotMatch(html.official,/BNB|buybackMinimum|buybackBalance|keeperGasRefunded|buybackSpent|boughtAndBurned/);
    assert.equal((html.filled.match(/<article /g)||[]).length,1);
    assert.equal((html.multiple.match(/<article /g)||[]).length,2);
    assert.equal((html.multiple.match(/class="u-business burn-history-item"/g)||[]).length,2);assert.doesNotMatch(html.multiple,/ub-stack/);
    assert.equal((html.multiple.match(/<picture class="burn-flame">/g)||[]).length,2);
    for(const text of ['0.0019 BNB','128 $OnHold','123','https://testnet.bscscan.com/tx/0x'+'a'.repeat(64)])assert.ok(html.filled.includes(text),text);
    assert.doesNotMatch(html.filled,/\$PAID| SOL|captured snapshot|4\.032/);
    assert.match(html.flap,/128 \$OHLDTEST/);assert.doesNotMatch(html.flap,/\$OnHold/);
    assert.match(html.filled,/<picture class="burn-flame">/);assert.match(html.filled,/prefers-reduced-motion: reduce/);assert.doesNotMatch(html.filled,/ub-burn-icon/);
    assert.doesNotMatch(html.empty,/<article /);assert.match(html.empty,/noBurnEvents/);
    for(const text of ['暂无已确认的回购销毁交易','未达到最低回购金额','当前可回购余额','0 BNB','0.001 BNB'])assert.ok(html.belowMinimum.includes(text),text);
    assert.doesNotMatch(html.belowMinimum,/<article |\/tx\//);
    assert.match(html.historyBelowMinimum,/未达到最低回购金额/);assert.match(html.historyBelowMinimum,/0.00008123 BNB/);
    assert.equal((html.historyBelowMinimum.match(/<article /g)||[]).length,1);
    assert.match(html.eligibleEmpty,/已达到回购条件/);assert.doesNotMatch(html.eligibleEmpty,/未达到最低回购金额/);
  }finally{await rm(directory,{recursive:true,force:true});}
});
