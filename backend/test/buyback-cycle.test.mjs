import test from 'node:test';
import assert from 'node:assert/strict';
import {parseEther} from 'ethers';
import {buybackPolicies,nextBuyback,nextAdReinvestment} from '../scripts/buyback-cycle.mjs';

const token='0x0000000000000000000000000000000000000001',address='0x0000000000000000000000000000000000000002',weth='0x0000000000000000000000000000000000000003';
function setup(){
  const state={balance:0n,pending:0n,time:180,last:0n,recipient:address,quoted:0};
  const processor={taxToken:async()=>token,marketAddress:async()=>state.recipient,getQuoteToken:async()=>weth,weth:async()=>weth,feeConfig:async()=>({isWeth:true,marketBps:10000n,deflationBps:0n,lpBps:0n,dividendBps:0n}),marketQuoteBalance:async()=>state.pending};
  const method=name=>({populateTransaction:async(...args)=>({name,args})});
  const vault={getAddress:async()=>address,lastExecution:async()=>state.last,execute:method('execute'),settleAndExecute:method('settleAndExecute')};
  const provider={getBlock:async()=>({timestamp:state.time}),getBalance:async()=>state.balance};
  const swap={quoteExactInput:{staticCall:async([,,amount])=>{state.quoted++;return amount*1000n;}}};
  const input={provider,vault,processor,swap,token,minimum:BigInt(buybackPolicies['97'].minimum_wei),maxRefund:BigInt(buybackPolicies['97'].max_gas_refund_wei),slippage:100};
  return {state,input};
}
test('network thresholds are exact; below minimum and cooldown skip without a swap quote',async()=>{
  assert.equal(parseEther(buybackPolicies['56'].minimum_bnb),10000000000000000n);
  assert.equal(parseEther(buybackPolicies['97'].minimum_bnb),1000000000000000n);
  const {state,input}=setup();state.balance=input.minimum-1n;
  assert.equal(await nextBuyback(input),null);assert.equal(state.quoted,0);
  state.balance++;state.time=179;assert.equal(await nextBuyback(input),null);assert.equal(state.quoted,0);
  state.time=180;const action=await nextBuyback(input);assert.equal(action.transaction.name,'execute');
  assert.equal(action.transaction.args[0],parseEther('0.0009'));
});
test('pending fees trigger atomic settlement and buyback; beneficiary mismatches fail closed',async()=>{
  const {state,input}=setup();state.pending=input.minimum;
  const action=await nextBuyback(input);assert.equal(action.transaction.name,'settleAndExecute');
  assert.deepEqual(action.transaction.args,[parseEther('0.0009'),parseEther('0.891'),270]);
  state.recipient=token;await assert.rejects(nextBuyback(input),/directly to this vault/);
});

test('ad automation quotes only its reserved half and waits for active mining, threshold and cooldown',async()=>{
  const state={started:0n,end:31536100n,time:86400,last:0n,reserve:parseEther('0.005'),quoted:0};
  const vault={miningStartedAt:async()=>state.started,periodFinish:async()=>state.end,lastAdBuyback:async()=>state.last,adBuybackReserve:async()=>state.reserve,reinvestAdRevenue:{populateTransaction:async(...args)=>({args})}};
  const provider={getBlock:async()=>({timestamp:state.time})};
  const swap={quoteExactInput:{staticCall:async([,,amount])=>{state.quoted++;return amount*1000n;}}};
  const input={provider,vault,swap,token,minimum:parseEther('0.001'),slippage:100};
  assert.equal(await nextAdReinvestment(input),null);state.started=100n;
  state.reserve=input.minimum-1n;assert.equal(await nextAdReinvestment(input),null);
  state.reserve=parseEther('0.005');state.last=BigInt(state.time-179);assert.equal(await nextAdReinvestment(input),null);
  assert.equal(state.quoted,0);state.last=0n;
  const action=await nextAdReinvestment(input);assert.equal(action.kind,'ad-reinvestment');
  assert.deepEqual(action.transaction.args,[parseEther('0.005'),parseEther('4.95'),86490]);
  state.time=Number(state.end);assert.equal(await nextAdReinvestment(input),null);
  state.time--;swap.quoteExactInput.staticCall=async()=>0n;await assert.rejects(nextAdReinvestment(input),/Positive reinvestment quote/);
});
