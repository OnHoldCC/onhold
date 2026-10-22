import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createServer} from 'node:net';
import {readFileSync,writeFileSync} from 'node:fs';
import {setTimeout as delay} from 'node:timers/promises';
import {Contract,FetchRequest,JsonRpcProvider,ZeroAddress,formatEther,parseEther} from 'ethers';

const deployment=JSON.parse(readFileSync(new URL('../deployments/flap-native-testnet-20261022.json',import.meta.url)));
assert.equal(deployment.chainId,97);assert.equal(deployment.testOnly,true);
const forkBlock=138191965,rpc='https://bsc-testnet-rpc.publicnode.com',actor='0x38fBfdAfF05536b7d80b16688dA6041Bd6338160';
const reservation=createServer();reservation.listen(0,'127.0.0.1');await once(reservation,'listening');
const port=reservation.address().port;await new Promise(resolve=>reservation.close(resolve));
const node=spawn('anvil',['--host','127.0.0.1','--port',String(port),'--chain-id','97','--fork-url',rpc,'--fork-block-number',String(forkBlock),'--silent'],{stdio:['ignore','ignore','pipe']});
let startupError,logs='';node.on('error',error=>{startupError=error;});node.stderr.on('data',data=>{logs=(logs+data).slice(-2000);});
const endpoint=`http://127.0.0.1:${port}`,connection=new FetchRequest(endpoint);connection.timeout=120000;
const provider=new JsonRpcProvider(connection,97,{staticNetwork:true,cacheTimeout:-1});provider.pollingInterval=50;
const transactions=[];
async function confirmed(label,transaction){const receipt=await(await transaction).wait();assert.equal(receipt.status,1,label);transactions.push({label,receipt});console.log(JSON.stringify({simulationOnly:true,stage:label,tx:receipt.hash}));return receipt;}
try{
 for(let attempt=0;;attempt++){
  if(startupError)throw startupError;if(node.exitCode!==null)throw Error(`Anvil failed: ${logs}`);
  try{await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_chainId',params:[]}),signal:AbortSignal.timeout(1000)});break;}
  catch(error){if(attempt>=299)throw Error(`Anvil did not start: ${logs}`,{cause:error});await delay(200);}
 }
 assert.equal(await provider.send('eth_chainId',[]),'0x61');assert.match(await provider.send('web3_clientVersion',[]),/anvil/i);
 assert.equal(await provider.getBlockNumber(),forkBlock);
 const forkHash=(await provider.getBlock(forkBlock)).hash;
 await provider.send('anvil_impersonateAccount',[actor]);await provider.send('anvil_setBalance',[actor,'0x'+parseEther('100').toString(16)]);
 const signer=await provider.getSigner(actor);
 const portal=new Contract(deployment.portalAddress,[
  'function getTokenV8(address) view returns((uint8 status,uint256 reserve,uint256 circulatingSupply,uint256 price,uint8 tokenVersion,uint256 r,uint256 h,uint256 k,uint256 dexSupplyThresh,address quoteTokenAddress,bool nativeToQuoteSwapEnabled,bytes32 extensionID,uint256 buyTaxRate,uint256 sellTaxRate,address pool,uint256 progress,uint8 lpFeeProfile,uint8 dexId))',
  'function quoteExactInput((address inputToken,address outputToken,uint256 inputAmount)) returns(uint256)',
  'function swapExactInput((address inputToken,address outputToken,uint256 inputAmount,uint256 minOutputAmount,bytes permitData)) payable returns(uint256)',
 ],signer);
 const token=new Contract(deployment.tokenAddress,['function taxProcessor() view returns(address)','function balanceOf(address) view returns(uint256)','function approve(address,uint256) returns(bool)','event Transfer(address indexed from,address indexed to,uint256 value)'],signer);
 const processor=new Contract(deployment.taxProcessorAddress,['function taxToken() view returns(address)','function dispatch()','function flapBlackHole() view returns(address)','function feeConfig() view returns(uint16,uint16,uint16,uint16,uint16,bool)','function totalQuoteAddedToLiquidity() view returns(uint256)','function totalTokenAddedToLiquidity() view returns(uint256)'],signer);
 assert.equal(await token.taxProcessor(),deployment.taxProcessorAddress);assert.equal(await processor.taxToken(),deployment.tokenAddress);
 assert.deepEqual(Array.from(await processor.feeConfig()).slice(0,4),[0n,5000n,5000n,0n]);
 const initial=await portal.getTokenV8(deployment.tokenAddress);assert.equal(initial.status,1n);assert.equal(initial.buyTaxRate,300n);assert.equal(initial.sellTaxRate,300n);
 const sink=await processor.flapBlackHole(),burnBefore=await token.balanceOf(sink);
 const input=parseEther('17'),quote=await portal.quoteExactInput.staticCall({inputToken:ZeroAddress,outputToken:deployment.tokenAddress,inputAmount:input});assert.ok(quote>0n);
 await confirmed('buy-through-migration',portal.swapExactInput({inputToken:ZeroAddress,outputToken:deployment.tokenAddress,inputAmount:input,minOutputAmount:quote*99n/100n,permitData:'0x'},{value:input,gasLimit:12000000}));
 const migrated=await portal.getTokenV8(deployment.tokenAddress);assert.equal(migrated.status,4n);assert.notEqual(migrated.pool,ZeroAddress);
 await confirmed('official-dispatch-after-migration',processor.dispatch({gasLimit:12000000}));
 const pair=new Contract(migrated.pool,['function totalSupply() view returns(uint256)','event Mint(address indexed sender,uint256 amount0,uint256 amount1)'],provider),lpSupplyBefore=await pair.totalSupply();
 const quoteBefore=await processor.totalQuoteAddedToLiquidity(),tokenBefore=await processor.totalTokenAddedToLiquidity(),sellAmount=parseEther('20000000');
 await confirmed('approve-exact-test-sells',token.approve(deployment.portalAddress,sellAmount*2n));
 for(let index=0;index<2;index++){
  const quote=await portal.quoteExactInput.staticCall({inputToken:deployment.tokenAddress,outputToken:ZeroAddress,inputAmount:sellAmount});assert.ok(quote>0n);
  await confirmed(`dex-sell-${index+1}`,portal.swapExactInput({inputToken:deployment.tokenAddress,outputToken:ZeroAddress,inputAmount:sellAmount,minOutputAmount:quote*95n/100n,permitData:'0x'},{gasLimit:12000000}));
 }
 await confirmed('official-dispatch-after-dex-trades',processor.dispatch({gasLimit:12000000}));
 const quoteAdded=await processor.totalQuoteAddedToLiquidity()-quoteBefore,tokensAdded=await processor.totalTokenAddedToLiquidity()-tokenBefore,lpMinted=await pair.totalSupply()-lpSupplyBefore,burned=await token.balanceOf(sink)-burnBefore;
 assert.ok(burned>0n);assert.ok(quoteAdded>0n);assert.ok(tokensAdded>0n);assert.ok(lpMinted>0n);
 const burnTransfers=[],lpMints=[];
 for(const{label,receipt}of transactions)for(const log of receipt.logs){
  if(log.address.toLowerCase()===deployment.tokenAddress.toLowerCase()){
   let event;try{event=token.interface.parseLog(log);}catch{continue;}
   if(event?.name==='Transfer'&&event.args.to.toLowerCase()===sink.toLowerCase()&&[deployment.taxProcessorAddress,deployment.tokenAddress].some(address=>address.toLowerCase()===event.args.from.toLowerCase()))burnTransfers.push({tx:receipt.hash,logIndex:log.index,amount:formatEther(event.args.value),from:event.args.from,to:event.args.to});
  }else if(label.startsWith('dex-sell-')&&log.address.toLowerCase()===migrated.pool.toLowerCase()){
   let event;try{event=pair.interface.parseLog(log);}catch{continue;}
   if(event?.name==='Mint'&&event.args.amount0>0n&&event.args.amount1>0n)lpMints.push({tx:receipt.hash,logIndex:log.index,amount0:event.args.amount0.toString(),amount1:event.args.amount1.toString()});
  }
 }
 assert.equal(burnTransfers.reduce((sum,event)=>sum+parseEther(event.amount),0n),burned);assert.ok(lpMints.length>0);
 const report={simulationOnly:true,publicTransactionsSent:0,publicTestBNBSpent:'0',verifiedAt:new Date().toISOString(),chainId:97,forkBlock,forkHash,token:deployment.tokenAddress,processor:deployment.taxProcessorAddress,pool:migrated.pool,localWalletBalanceSetBNB:'100',buyInputBNB:'17',dexSellTokenAmounts:['20000000','20000000'],burnedTokens:formatEther(burned),lpQuoteAddedBNB:formatEther(quoteAdded),lpTokensAdded:formatEther(tokensAdded),lpMintedRaw:lpMinted.toString(),burnTransfers,lpMints,transactions:transactions.map(({label,receipt})=>({label,localTx:receipt.hash,localBlock:receipt.blockNumber,gasUsed:receipt.gasUsed.toString()})),limits:['Local fork evidence only; these transactions do not exist on the public testnet','Official bot automation and mainnet execution are not verified']};
 writeFileSync(new URL('../deployments/flap-native-fork-test-20261022.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({simulationOnly:true,result:'passed',burnedTokens:report.burnedTokens,lpQuoteAddedBNB:report.lpQuoteAddedBNB,lpTokensAdded:report.lpTokensAdded,publicTestBNBSpent:'0'}));
}finally{
 provider.destroy();if(!startupError&&node.exitCode===null&&!node.killed){const ended=once(node,'exit');node.kill('SIGTERM');await ended;}
}
