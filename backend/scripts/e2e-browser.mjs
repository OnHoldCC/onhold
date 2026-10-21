import {createServer,request as proxyRequest} from 'node:http';
import {readFileSync,writeFileSync,appendFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {Contract,FetchRequest,JsonRpcProvider,Wallet,getAddress,getBytes,parseEther} from 'ethers';

export function validateTestTransaction(tx,{market,account,role,iface,spent=0n}){
 if(!tx||getAddress(tx.from)!==account||getAddress(tx.to)!==market||tx.chainId&&BigInt(tx.chainId)!==97n)throw Error('Test wallet target or chain rejected');
 const call=iface.parseTransaction({data:tx.data,value:tx.value||0});
 const allowed=role==='inviter'?['claimReferralRewards']:['mintPass','stake','unstake','getReward','claimReferralRewards','bid'];
 if(!call||!allowed.includes(call.name))throw Error('Test wallet method rejected');
 const value=BigInt(tx.value||0);if(value<0n||value>parseEther('0.0025')||spent+value>parseEther('0.004')||call.name!=='bid'&&value!==0n)throw Error('Test wallet spending limit');
 return {call,value};
}
if(process.argv[1]&&resolve(process.argv[1])===import.meta.filename){
 const root=resolve(import.meta.dirname,'../..'),dir=resolve(process.env.ONHOLD_TESTNET_DATA_DIR||join(root,'backend/data/testnet-v4-mock'));
 const realStanding=process.env.ONHOLD_E2E_REAL_STANDING==='true';
 const bridgePort=Number(process.env.ONHOLD_E2E_PORT||4198),apiAddress=process.env.ONHOLD_ADDR||'127.0.0.1:4190';
 if(!Number.isInteger(bridgePort)||bridgePort<1024||bridgePort>65535||!/^127\.0\.0\.1:\d{4,5}$/.test(apiAddress))throw Error('Loopback test ports required');
 const deployment=JSON.parse(readFileSync(join(dir,'addresses.json'))),keys=JSON.parse(readFileSync(join(dir,'keys.json')));
 if(deployment.chainId!==97||deployment.mock!==true||keys.chainId!==97)throw Error('Explicit Mock testnet deployment required');
 const connection=new FetchRequest(process.env.ONHOLD_CHAIN_RPC_URL||'https://bsc-testnet-rpc.publicnode.com');connection.timeout=15000;
 const provider=new JsonRpcProvider(connection,97,{cacheTimeout:-1});provider.pollingInterval=1000;
 if(await provider.send('eth_chainId',[])!=='0x61')throw Error('Testnet only');
 const marketAddress=getAddress(deployment.marketAddress),abi=JSON.parse(readFileSync(join(root,'contracts/artifacts/OnholdMarket.json'))).abi;
 const market=new Contract(marketAddress,[...abi,'function MOCK_ONLY() view returns(bool)'],provider);
 if(!await market.MOCK_ONLY())throw Error('Mock market required');
 const wallets={user:new Wallet(keys.deployerPrivateKey,provider),inviter:new Wallet(keys.adKeeperPrivateKey,provider)};
 const script=readFileSync(join(root,'backend/scripts/e2e-browser-wallet.js'));
 const origin=`http://127.0.0.1:${bridgePort}`,report=join(dir,'browser-transactions.jsonl');let busy=false,spent=0n;
 const readonly=new Set(['eth_chainId','eth_blockNumber','eth_getBalance','eth_getCode','eth_call','eth_estimateGas','eth_gasPrice','eth_maxPriorityFeePerGas','eth_feeHistory','eth_getBlockByNumber','eth_getTransactionByHash','eth_getTransactionReceipt','eth_getTransactionCount']);
 const send=(res,status,body,headers={})=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store',...headers});res.end(typeof body==='string'?body:JSON.stringify(body));};
 const server=createServer(async(req,res)=>{
  try{
   if(req.headers.host!==`127.0.0.1:${bridgePort}`)return send(res,403,{error:'host_rejected'});
   if(req.url==='/mock-standing'){
    if(realStanding)return send(res,404,{error:'real_claude_verification_enabled'});
    if(req.headers.cookie!=='sessionKey=sk-ant-sid-onhold-mock-browser-pro-20261020')return send(res,401,{error:'fixture_only'});
    return send(res,200,{standing:'bad_standing',has_active_org:false,org_type:'consumer',prev_plan_tier:'claude_pro',banned_at:'2026-10-20T01:00:00Z',ban_category:'MOCK E2E fixture',banned_orgs:[{uuid:'cb58162b-ecb0-4ddc-bc04-70c79d452ff1',name:'MOCK E2E Pro Account'}]});
   }
   if(req.url==='/__e2e/wallet.js')return send(res,200,script.toString(),{'Content-Type':'application/javascript'});
   if(req.url==='/__e2e/wallet'){
    if(req.method!=='POST'||req.headers.origin!==origin)return send(res,403,{error:{message:'Origin rejected',code:4100}});
    let body='';for await(const chunk of req){body+=chunk;if(body.length>60000)throw Error('Request too large');}
    const {method,params=[],role}=JSON.parse(body);if(!['user','inviter'].includes(role)||!Array.isArray(params))throw Error('Invalid wallet request');
    const wallet=wallets[role];let result;
    if(method==='eth_accounts'||method==='eth_requestAccounts')result=[wallet.address];
    else if(method==='wallet_switchEthereumChain'||method==='wallet_addEthereumChain'){if(params[0]?.chainId!=='0x61')throw Error('Testnet only');result=null;}
    else if(method==='personal_sign'){
     if(getAddress(params[1])!==wallet.address)throw Error('Signer mismatch');const message=getBytes(params[0]),text=new TextDecoder().decode(message);
     if(message.length>5000||!text.includes('ONHOLD')||!text.toLowerCase().includes(marketAddress.toLowerCase()))throw Error('Only ONHOLD mint consent allowed');
     result=await wallet.signMessage(message);
    }else if(method==='eth_sendTransaction'){
     if(busy)throw Error('Another test transaction is pending');const {call,value}=validateTestTransaction(params[0],{market:marketAddress,account:wallet.address,role,iface:market.interface,spent});
     busy=true;try{
      const tx=params[0],gasPrice=(await provider.getFeeData()).gasPrice;if(!gasPrice||gasPrice>1_000_000_000n)throw Error('Test gas ceiling');
      const request={to:marketAddress,data:tx.data,value,chainId:97,type:0,gasPrice,nonce:await wallet.getNonce('pending')};
      const gas=await provider.estimateGas({...request,from:wallet.address});if(gas*gasPrice>parseEther('0.0005'))throw Error('Test gas budget');
      const sent=await wallet.sendTransaction({...request,gasLimit:gas*120n/100n});spent+=value;result=sent.hash;
      appendFileSync(report,JSON.stringify({at:new Date().toISOString(),source:'browser',role,action:call.name,value:value.toString(),hash:sent.hash})+'\n',{mode:0o600});
     }finally{busy=false;}
    }else if(readonly.has(method))result=await provider.send(method,params);else throw Error('Wallet method rejected');
    return send(res,200,{result});
   }
   if(req.method==='POST'&&req.headers.origin!==origin)return send(res,403,{error:'origin_rejected'});
   const upstream=proxyRequest({hostname:'127.0.0.1',port:Number(apiAddress.split(':')[1]),path:req.url,method:req.method,headers:{...req.headers,host:apiAddress}},response=>{
    const isHtml=response.headers['content-type']?.includes('text/html');
    if(isHtml){const chunks=[];response.on('data',chunk=>chunks.push(chunk));response.on('end',()=>{const html=Buffer.concat(chunks).toString().replace('<head>',`<head><script src="/__e2e/wallet.js" data-market="${marketAddress}" data-real-standing="${realStanding}" data-repeat-uuid="${deployment.repeatUuid===true}"></script>`);res.writeHead(response.statusCode,{'Content-Type':'text/html','Cache-Control':'no-store'});res.end(html);});}
    else{res.writeHead(response.statusCode,response.headers);response.pipe(res);}
   });upstream.on('error',()=>send(res,502,{error:'api_not_ready'}));req.pipe(upstream);
  }catch(error){send(res,400,{error:{code:-32603,message:error.shortMessage||error.message}});}
 });
 server.listen(bridgePort,'127.0.0.1',()=>console.log(JSON.stringify({browserE2E:origin+'/claim',realStanding,repeatUuid:deployment.repeatUuid===true,market:marketAddress})));
 for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{server.close();provider.destroy();});
}
