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
      import {BurnHistory} from './components/onhold/BurnHistory.jsx';
      import {translate} from './src/i18n.mjs';
      const props={amount:(value,unit)=>value+' '+unit,t:key=>key,explorer:'https://testnet.bscscan.com'};
      const event={tx_hash:'0x'+'a'.repeat(64),log_index:0,block:123,spent:'0.0019',burned:'128',gas_refunded:'0.00005'};
      const render=extra=>renderToStaticMarkup(React.createElement(BurnHistory,{...props,...extra}));
      const waiting={t:key=>translate('zh',key),status:'buybackAccumulating',balance:'0',minimum:'0.001'};
      console.log(JSON.stringify({filled:render({events:[event]}),empty:render({events:[]}),belowMinimum:render({...waiting,events:[]}),historyBelowMinimum:render({...waiting,balance:'0.00008123',events:[event]}),eligibleEmpty:render({...waiting,status:'buybackEligible',balance:'0.001',events:[]})}));
    `},outfile,bundle:true,platform:'node',format:'esm',logLevel:'silent',define:{'process.env.NODE_ENV':'"production"'},banner:{js:"import {createRequire} from 'node:module'; const require=createRequire(import.meta.url);"}});
    const html=JSON.parse(execFileSync(process.execPath,[outfile],{encoding:'utf8'}));
    assert.equal((html.filled.match(/<article /g)||[]).length,1);
    for(const text of ['0.0019 BNB','128 $Claude','0.00005 BNB','123','https://testnet.bscscan.com/tx/0x'+'a'.repeat(64)])assert.ok(html.filled.includes(text),text);
    assert.doesNotMatch(html.filled,/\$PAID| SOL|captured snapshot|4\.032/);
    assert.doesNotMatch(html.empty,/<article /);assert.match(html.empty,/noBurnEvents/);
    for(const text of ['暂无已确认的回购销毁交易','未达到最低回购金额','当前可回购余额','0 BNB','0.001 BNB'])assert.ok(html.belowMinimum.includes(text),text);
    assert.doesNotMatch(html.belowMinimum,/<article |\/tx\//);
    assert.match(html.historyBelowMinimum,/未达到最低回购金额/);assert.match(html.historyBelowMinimum,/0.00008123 BNB/);
    assert.equal((html.historyBelowMinimum.match(/<article /g)||[]).length,1);
    assert.match(html.eligibleEmpty,/已符合 Keeper 执行条件/);assert.doesNotMatch(html.eligibleEmpty,/未达到最低回购金额/);
  }finally{await rm(directory,{recursive:true,force:true});}
});
