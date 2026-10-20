import {JsonRpcProvider,FetchRequest,Wallet,Contract,parseUnits,getAddress,Transaction,id} from 'ethers';
import {buybackPolicies,feeProcessor,nextBuyback,nextAdReinvestment} from './buyback-cycle.mjs';
import {readFile,mkdir,open,unlink,rename} from 'node:fs/promises';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';

const rpc=process.env.ONHOLD_CHAIN_RPC_URL||'https://bsc-testnet-dataseed.bnbchain.org';
const mock=process.argv.includes('--mock');
const adMode=process.argv.includes('--ads');
const vaultAddress=getAddress(process.env[adMode?'ONHOLD_AD_REINVEST_MARKET':'ONHOLD_BUYBACK_VAULT']||'');
if(!process.env.ONHOLD_KEEPER_PRIVATE_KEY||!process.env.ONHOLD_KEEPER_MAX_GAS_PRICE_GWEI)throw Error('Configure the keeper key and gas-price ceiling locally.');
const slippage=Number(process.env.ONHOLD_KEEPER_SLIPPAGE_BPS||100);
if(!Number.isInteger(slippage)||slippage<1||slippage>500)throw Error('Slippage must be 1–500 basis points.');
const maxGasPrice=parseUnits(process.env.ONHOLD_KEEPER_MAX_GAS_PRICE_GWEI,'gwei');
if(maxGasPrice<=0n)throw Error('Invalid gas-price ceiling.');
const connection=new FetchRequest(rpc);connection.timeout=15000;
const provider=new JsonRpcProvider(connection,97,{staticNetwork:true});
if((await provider.send('eth_chainId',[]))!=='0x61')throw Error('BNB testnet required.');
const wallet=new Wallet(process.env.ONHOLD_KEEPER_PRIVATE_KEY,provider);
const artifact=JSON.parse(await readFile(new URL(`../../contracts/artifacts/${adMode?'OnholdMarket':'FlapBuyback'}.json`,import.meta.url)));
const vault=new Contract(vaultAddress,artifact.abi,wallet);
const [keeper,token,portal,interval]=await Promise.all(adMode?[vault.adKeeper(),vault.claude(),vault.adBuybackPortal(),vault.AD_BUYBACK_INTERVAL()]:[vault.keeper(),vault.taxToken(),vault.portal(),vault.INTERVAL()]);
if(keeper!==wallet.address||interval!==180n)throw Error('Contract configuration does not match the testnet keeper.');
if(mock){
 const guard=new Contract(vaultAddress,['function MOCK_ONLY() view returns(bool)'],provider);
 const route=new Contract(portal,['function MOCK_ONLY() view returns(bool)','function token() view returns(address)'],provider);
 if(!adMode||!await guard.MOCK_ONLY()||!await route.MOCK_ONLY()||await route.token()!==token)throw Error('Explicit testnet Mock route required.');
}else if(portal!=='0x5bEacaF7ABCbB3aB280e80D007FD31fcE26510e9')throw Error('Official testnet Portal required.');
if(!adMode&&(await vault.BURN_SINK()).toLowerCase()!=='0x000000000000000000000000000000000000dead')throw Error('Invalid burn sink.');
if(adMode&&await vault.PROTOCOL_ID()!==id('onhold.nft-staking.v4'))throw Error('365-day reinvestment contract required.');
const swap=new Contract(portal,['function quoteExactInput((address inputToken,address outputToken,uint256 inputAmount)) returns(uint256)'],provider);
const processor=adMode?null:await feeProcessor(token,vaultAddress,wallet);
const minimum=BigInt(buybackPolicies['97'].minimum_wei);
const maxRefund=BigInt(buybackPolicies['97'].max_gas_refund_wei);
if(adMode?await vault.MIN_AD_BUYBACK()!==minimum:await vault.MIN_BUYBACK_BALANCE()!==minimum||await vault.MAX_KEEPER_GAS_REFUND()!==maxRefund)throw Error('Vault minimum or gas compensation does not match policy.');
const directory=process.env.ONHOLD_KEEPER_DATA_DIR||'backend/data/keeper';
await mkdir(directory,{recursive:true,mode:0o700});
const pendingFile=join(directory,`${vaultAddress}.pending.json`),lockFile=join(directory,`${wallet.address}.lock`);
const lock=await open(lockFile,'wx',0o600);
await lock.writeFile(String(process.pid));
console.log(JSON.stringify({worker:adMode?'ads':'burn',chainId:97,mock,market:vaultAddress,wallet:wallet.address}));
let stop=false;
let nextCycle=0;
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{stop=true;});
try {
  while(!stop){
    try {
      let pending;
      try{pending=JSON.parse(await readFile(pendingFile,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
      if(pending){
        if(Transaction.from(pending.raw).to!==vaultAddress||Transaction.from(pending.raw).chainId!==97n)throw Error('Pending journal target mismatch.');
        const receipt=await provider.getTransactionReceipt(pending.hash);
        if(receipt){
          if(await receipt.confirmations()>=3){
            await unlink(pendingFile);
            console.log(`${pending.kind||'buyback'} ${receipt.status===1?'confirmed':'reverted'}: ${pending.hash}`);
            nextCycle=Date.now()+180000;
          }
        }else{
          // Resend the same signed bytes after a restart; never create a second spend.
          try{await provider.broadcastTransaction(pending.raw);}catch(error){if(!/already known|nonce too low/i.test(error.shortMessage||''))throw error;}
        }
      }else if(Date.now()>=nextCycle){
        nextCycle=Date.now()+180000;
        const action=await (adMode?nextAdReinvestment:nextBuyback)({provider,vault,processor,swap,token,minimum,maxRefund,slippage});
        if(action){
          const gasPrice=(await provider.getFeeData()).gasPrice;
          if(!gasPrice||gasPrice>maxGasPrice)throw Error('Gas ceiling prevents execution.');
          const transaction=action.transaction;
          const gas=await provider.estimateGas({...transaction,from:wallet.address,gasPrice});
          const raw=await wallet.signTransaction({...transaction,chainId:97,type:0,nonce:await wallet.getNonce('pending'),gasLimit:gas*120n/100n,gasPrice});
          const record=JSON.stringify({kind:action.kind,hash:Transaction.from(raw).hash,raw});
          const journal=await open(pendingFile+'.tmp','w',0o600);
          try{await journal.writeFile(record);await journal.sync();}finally{await journal.close();}
          await rename(pendingFile+'.tmp',pendingFile);
          await provider.broadcastTransaction(raw);
        }
      }
    }catch(error){console.error('Keeper execution deferred:',error.code||'check vault, quote and funding');}
    if(!stop)await delay(15000);
  }
}finally{await lock.close();await unlink(lockFile);provider.destroy();}
