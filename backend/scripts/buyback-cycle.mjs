import {Contract,ZeroAddress,getAddress} from 'ethers';
import {readFileSync} from 'node:fs';

export const buybackPolicies=JSON.parse(readFileSync(new URL('../../contracts/buyback-policy.json',import.meta.url)));
// Exact ABI subset of FlapVaultExample 5949cc7e/src/flap/{IFlapTaxTokenV3,ITaxProcessor}.sol.
const tokenAbi=['function taxProcessor() view returns(address)'];
const processorAbi=[
  'function taxToken() view returns(address)',
  'function marketAddress() view returns(address)',
  'function getQuoteToken() view returns(address)',
  'function weth() view returns(address)',
  'function feeConfig() view returns(uint16 marketBps,uint16 deflationBps,uint16 lpBps,uint16 dividendBps,uint16 feeRate,bool isWeth)',
  'function marketQuoteBalance() view returns(uint256)',
  'function dispatch()'
];

export async function feeProcessor(token,vault,runner){
  const address=await new Contract(token,tokenAbi,runner).taxProcessor();
  if(address===ZeroAddress)throw Error('Flap tax processor required.');
  const processor=new Contract(address,processorAbi,runner);
  await checkProcessor(processor,token,vault);
  return processor;
}
async function checkProcessor(processor,token,vault){
  const [boundToken,recipient,quote,weth,fees]=await Promise.all([
    processor.taxToken(),processor.marketAddress(),processor.getQuoteToken(),processor.weth(),processor.feeConfig()
  ]);
  if(boundToken!==getAddress(token)||recipient!==getAddress(vault)||weth===ZeroAddress||quote!==weth||!fees.isWeth||fees.marketBps!==10000n||fees.deflationBps!==0n||fees.lpBps!==0n||fees.dividendBps!==0n){
    throw Error('Processor must distribute 100% native creator revenue directly to this vault.');
  }
}

export async function nextBuyback({provider,vault,processor,swap,token,minimum,maxRefund,slippage}){
  const address=await vault.getAddress();
  // Revalidate the beneficiary before every settlement, including after restarts.
  await checkProcessor(processor,token,address);
  const block=await provider.getBlock('latest');
  const [last,balance,pending]=await Promise.all([vault.lastExecution(),provider.getBalance(address),processor.marketQuoteBalance()]);
  if(BigInt(block.timestamp)<last+180n)return null;
  // Settlement and buyback share one transaction, so measured gas covers both steps.
  if(balance+pending<minimum)return null;
  const amount=balance+pending-maxRefund;
  const quoted=await swap.quoteExactInput.staticCall([ZeroAddress,token,amount]);
  const minOutput=quoted*BigInt(10000-slippage)/10000n;
  if(minOutput<=0n)throw Error('Positive buyback quote required.');
  const method=pending>0n?'settleAndExecute':'execute';
  return {kind:'buyback',transaction:await vault[method].populateTransaction(amount,minOutput,block.timestamp+90)};
}

export async function nextAdReinvestment({provider,vault,swap,token,minimum,slippage}){
  const block=await provider.getBlock('latest');
  const [started,end,last,reserve]=await Promise.all([vault.miningStartedAt(),vault.periodFinish(),vault.lastAdBuyback(),vault.adBuybackReserve()]);
  if(started===0n||BigInt(block.timestamp)>=end||BigInt(block.timestamp)<last+180n||reserve<minimum)return null;
  const quoted=await swap.quoteExactInput.staticCall([ZeroAddress,token,reserve]);
  const minOutput=quoted*BigInt(10000-slippage)/10000n;
  if(minOutput<=0n)throw Error('Positive reinvestment quote required.');
  return {kind:'ad-reinvestment',transaction:await vault.reinvestAdRevenue.populateTransaction(reserve,minOutput,block.timestamp+90)};
}
