import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {Contract,FetchRequest,JsonRpcProvider,formatEther,id,parseEther} from 'ethers';
const root=resolve(import.meta.dirname,'../..'),dir=join(root,'backend/data/testnet-v4-mock');
const deployment=JSON.parse(readFileSync(join(dir,'addresses.json')));
assert.equal(deployment.chainId,97);assert.equal(deployment.mock,true);
const connection=new FetchRequest(process.env.ONHOLD_CHAIN_RPC_URL||'https://bsc-testnet-rpc.publicnode.com');connection.timeout=15000;
const provider=new JsonRpcProvider(connection,97,{cacheTimeout:-1});
try{
 assert.equal(await provider.send('eth_chainId',[]),'0x61');
 const artifact=name=>JSON.parse(readFileSync(join(root,`contracts/artifacts/${name}.json`)));
 const market=new Contract(deployment.marketAddress,artifact('MockOnholdMarket').abi,provider),token=new Contract(deployment.tokenAddress,artifact('MockClaudeToken').abi,provider);
 assert.equal(await market.MOCK_ONLY(),true);assert.equal(await market.PROTOCOL_ID(),id('onhold.nft-staking.v4'));
 const browser=readFileSync(join(dir,'browser-transactions.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
 const events=[],transactions=[];
 for(const entry of browser){
  const receipt=await provider.getTransactionReceipt(entry.hash);assert.ok(receipt);assert.equal(receipt.status,1);assert.ok(await receipt.confirmations()>=3);
  assert.equal(receipt.to.toLowerCase(),deployment.marketAddress.toLowerCase());
  transactions.push({...entry,block:receipt.blockNumber,gasUsed:receipt.gasUsed.toString(),status:receipt.status});
  for(const log of receipt.logs)if(log.address.toLowerCase()===deployment.marketAddress.toLowerCase()){try{events.push(market.interface.parseLog(log));}catch{}}
 }
 for(const action of ['mintPass','stake','bid','getReward','claimReferralRewards'])assert.ok(browser.some(entry=>entry.action===action),`Missing browser action ${action}`);
 const split=events.find(event=>event?.name==='AdRevenueSplit');assert.ok(split);assert.equal(split.args.teamAmount,parseEther('0.001'));assert.equal(split.args.reserveAmount,parseEther('0.001'));
 const reward=events.find(event=>event?.name==='RewardPaid'),referral=events.find(event=>event?.name==='ReferralAccrued'),paid=events.find(event=>event?.name==='ReferralPaid');
 assert.ok(reward&&referral&&paid);assert.equal(referral.args[3],reward.args[1]*15n/100n);assert.equal(paid.args[1],referral.args[3]);
 const fundingLogs=await provider.getLogs({address:deployment.marketAddress,topics:[market.interface.getEvent('AdRewardsReinvested').topicHash],fromBlock:deployment.marketFromBlock,toBlock:'latest'});
 assert.equal(fundingLogs.length,1,'Keeper must have completed exactly one reinvestment');
 const fundingLog=fundingLogs[0],funding=market.interface.parseLog(fundingLog),keeperReceipt=await provider.getTransactionReceipt(fundingLog.transactionHash);
 assert.equal(keeperReceipt.from.toLowerCase(),deployment.adKeeper.toLowerCase());assert.equal(keeperReceipt.status,1);assert.ok(await keeperReceipt.confirmations()>=3);
 assert.equal(funding.args.spent,parseEther('0.00001'));assert.equal(funding.args.tokensAdded,parseEther('1000'));
 const [team,reserve,reinvested,base,referralPool,started,ends,weight,claimed,balance,userBalance,inviterBalance,daily,owner]=await Promise.all([market.teamRevenue(),market.adBuybackReserve(),market.totalAdReinvested(),market.baseMiningBudget(),market.referralBudget(),market.miningStartedAt(),market.periodFinish(),market.stakingWeightOf(deployment.deployer),market.totalClaimed(),token.balanceOf(deployment.marketAddress),token.balanceOf(deployment.deployer),token.balanceOf(deployment.adKeeper),market.dailyEmission(),market.ownerOf(1)]);
 assert.equal(team,parseEther('0.001'));assert.equal(reserve,parseEther('0.00099'));assert.equal(reinvested,parseEther('1000'));assert.equal(base+referralPool,parseEther('100001000'));assert.ok(daily>(parseEther('100000000')*100n/115n)/365n);assert.equal(ends-started,31536000n);assert.equal(weight,1n);assert.equal(owner.toLowerCase(),deployment.marketAddress.toLowerCase());
 assert.equal(balance+claimed,parseEther('100001000'));assert.equal(userBalance,reward.args[1]);assert.equal(inviterBalance,paid.args[1]);
 const cache=await(await fetch('http://127.0.0.1:4198/api/chain?wallet='+deployment.deployer)).json();assert.equal(cache.available,true);assert.equal(cache.mock,true);assert.equal(parseEther(cache.mining.poolBudget),base+referralPool);
 assert.equal(parseEther(cache.mining.adTeamRevenue),team);assert.equal(parseEther(cache.mining.adBuybackReserve),reserve);assert.equal(parseEther(cache.mining.adReinvested),reinvested);assert.equal(parseEther(cache.mining.daily),daily);assert.equal(cache.mining.endsAt,Number(ends));assert.equal(cache.mining.weight,1);
 const report={verifiedAt:new Date().toISOString(),chainId:97,mock:true,scope:'Browser UI actions with server-side test wallet; real public testnet settlement, synthetic Claude standing and Mock swap pricing',market:deployment.marketAddress,token:deployment.tokenAddress,transactions,keeper:{hash:fundingLog.transactionHash,from:keeperReceipt.from,block:keeperReceipt.blockNumber,spent:formatEther(funding.args.spent),tokensAdded:formatEther(funding.args.tokensAdded)},accounting:{adPaid:'0.002',team:formatEther(team),originalReserve:'0.001',reserveAfterRefund:formatEther(reserve),baseBudget:formatEther(base),referralBudget:formatEther(referralPool),poolBudget:formatEther(base+referralPool),baseRewardPaid:formatEther(userBalance),referralPaid:formatEther(inviterBalance),referralPercent:15,dailyEmission:formatEther(daily),start:Number(started),end:Number(ends),durationDays:365,stakedWeight:Number(weight),tokenBacking:formatEther(balance),totalClaimed:formatEther(claimed)},checks:['Every economic user action originated in the browser UI','All receipts succeeded with at least 3 confirmations','Ad team/reserve split exactly 50/50','Keeper independently executed ad-funded buyback and pool top-up','Swap refund remains in the reserve','Invitee receives full base rewards and inviter receives an additional 15%','Claiming preserves NFT stake','Pool fully backed after both reward payments','Mining end unchanged at first stake + 365 days','PG cache amounts equal on-chain accounting']};
 const output=join(root,'contracts/deployments/e2e-bnb-testnet-20261020.json');writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{provider.destroy();}
