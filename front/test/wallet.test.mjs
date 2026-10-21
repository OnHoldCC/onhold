import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {createWalletSession,getWalletProvider,ensureWalletChain} from '../src/wallet.mjs';
import {listInjectedWallets,clearActiveInjectedWallet,connectInjected} from '../components/singlespark/runtime/injected.mjs';
import {safeInjectedWalletIcon} from '../components/singlespark/runtime/walletMetadata.mjs';
const A='0x1111111111111111111111111111111111111111',B='0x2222222222222222222222222222222222222222';
const store=new Map();
const storage={getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)};
globalThis.window=Object.assign(new EventTarget(),{localStorage:storage,sessionStorage:storage});globalThis.localStorage=storage;
class Wallet extends EventEmitter{
  constructor(address=A){super();this.address=address;this.chain='0x61';this.calls=[];}
  async request({method,params}){
    this.calls.push(method);
    if(method==='eth_accounts'||method==='eth_requestAccounts')return[this.address];
    if(method==='eth_chainId')return this.chain;
    if(method==='wallet_switchEthereumChain'){this.chain=params[0].chainId;this.emit('chainChanged',this.chain);return null;}
    throw Error('Unexpected wallet method: '+method);
  }
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(...providers){store.clear();clearActiveInjectedWallet();window.ethereum={providers};const session=createWalletSession(async()=>({referralBound:true,referralCode:'',referrer:'0x0000000000000000000000000000000000000000'}));session.start();return session;}

test('explicit selection owns connection, events and signing provider; other wallet never receives RPC',async()=>{
  const meta=Object.assign(new Wallet(A),{isMetaMask:true}),okx=Object.assign(new Wallet(B),{isMetaMask:true,isOkxWallet:true});
  const s=setup(meta,okx);assert.deepEqual(s.getSnapshot().options.map(x=>x.kind),['MetaMask','OKX Wallet']);
  assert.equal(getWalletProvider(),null);s.connect();await s.authorize('OKX Wallet');
  assert.equal(s.getSnapshot().address,B);assert.equal(getWalletProvider(),okx);assert.deepEqual(meta.calls,[]);
  meta.emit('accountsChanged',[A]);assert.equal(s.getSnapshot().address,B);
  okx.emit('chainChanged','0x38');assert.equal(s.getSnapshot().chainId,56);
  okx.emit('accountsChanged',[A]);assert.equal(s.getSnapshot().address,'');assert.equal(s.getSnapshot().error,'walletChanged');
  await s.authorize('OKX Wallet');
  okx.emit('chainChanged','0x38');assert.equal(s.getSnapshot().chainId,56);
  s.disconnect();okx.emit('accountsChanged',[B]);assert.equal(s.getSnapshot().address,'');assert.equal(getWalletProvider(),null);
  s.stop();assert.equal(okx.listenerCount('accountsChanged'),0);assert.equal(okx.listenerCount('disconnect'),0);
});
test('missing wallet cannot fall back to default; no signature or transaction during connection',async()=>{
  const meta=Object.assign(new Wallet(),{isMetaMask:true});const s=setup(meta);s.connect();await s.authorize('OKX Wallet');
  assert.equal(s.getSnapshot().error,'walletMissing');assert.deepEqual(meta.calls,[]);s.retry();await s.authorize('MetaMask');
  assert.deepEqual(meta.calls,['eth_requestAccounts','eth_chainId','eth_accounts','eth_chainId']);s.disconnect();s.stop();
});
test('late connection cannot restore cancelled or disconnected session',async()=>{
  const wallet=Object.assign(new Wallet(),{isMetaMask:true});let release;
  wallet.request=async({method})=>method==='eth_requestAccounts'?await new Promise(resolve=>{release=resolve;}):'0x61';
  const s=setup(wallet);s.connect();const pending=s.authorize('MetaMask');s.close();release([A]);await pending;
  assert.equal(s.getSnapshot().address,'');assert.equal(getWalletProvider(),null);s.stop();
});
test('restore only remembered provider, discard late accounts after logout, and never reconnect on reload',async()=>{
  const meta=Object.assign(new Wallet(A),{isMetaMask:true}),okx=Object.assign(new Wallet(B),{isOkxWallet:true});
  let s=setup(meta,okx);await s.authorize('OKX Wallet');s.stop();
  let release;okx.request=async({method})=>method==='eth_accounts'?await new Promise(resolve=>{release=resolve;}):'0x61';
  clearActiveInjectedWallet(false);s=createWalletSession(async()=>({referralBound:true,referralCode:'',referrer:'0x0000000000000000000000000000000000000000'}));s.start();assert.equal(typeof release,'function');s.disconnect();release([B]);await tick();assert.equal(s.getSnapshot().address,'');s.stop();
  const restored=createWalletSession(async()=>({referralBound:true,referralCode:'',referrer:'0x0000000000000000000000000000000000000000'}));restored.start();await tick();assert.equal(restored.getSnapshot().address,'');restored.stop();assert.deepEqual(meta.calls,[]);
});
test('restoration reads authorized accounts without permission prompts and handles provider disconnect',async()=>{
  const meta=Object.assign(new Wallet(),{isMetaMask:true});let s=setup(meta);await s.authorize('MetaMask');s.stop();clearActiveInjectedWallet(false);meta.calls=[];
  s=createWalletSession(async()=>({referralBound:true,referralCode:'',referrer:'0x0000000000000000000000000000000000000000'}));s.start();await tick();assert.equal(s.getSnapshot().address,A);assert.deepEqual(meta.calls,['eth_accounts','eth_chainId']);
  meta.emit('disconnect');assert.equal(s.getSnapshot().address,'');assert.equal(getWalletProvider(),null);s.stop();
});
test('rejection and malformed provider responses never establish a connection',async()=>{
  const wallet=Object.assign(new Wallet(),{isMetaMask:true});const s=setup(wallet);
  wallet.request=async()=>{throw Object.assign(Error('rejected'),{code:4001});};await s.authorize('MetaMask');assert.equal(s.getSnapshot().error,'walletCancelled');
  wallet.request=async()=>['not-an-address'];s.retry();await s.authorize('MetaMask');assert.equal(s.getSnapshot().error,'walletError');assert.equal(getWalletProvider(),null);
  wallet.request=async({method})=>method==='eth_requestAccounts'?[A]:'0x61trailing';s.retry();await s.authorize('MetaMask');assert.equal(getWalletProvider(),null);s.stop();
});
test('dedicated OKX and Binance extension providers remain selectable beside MetaMask without requesting other wallets',async()=>{
  const meta=Object.assign(new Wallet(A),{isMetaMask:true}),okx=new Wallet(B),binance=new Wallet(A);
  const session=setup(meta);window.okxwallet=okx;window.binancew3w={ethereum:binance};window.BinanceChain=binance;
  try{
    session.connect();assert.deepEqual(session.getSnapshot().options.map(x=>x.kind),['MetaMask','OKX Wallet','Binance Wallet']);
    assert.deepEqual(meta.calls,[]);assert.deepEqual(okx.calls,[]);assert.deepEqual(binance.calls,[]);
    await session.authorize('OKX Wallet');assert.equal(getWalletProvider(),okx);assert.equal(session.getSnapshot().address,B);assert.deepEqual(meta.calls,[]);assert.deepEqual(binance.calls,[]);
    session.disconnect();await session.authorize('Binance Wallet');assert.equal(getWalletProvider(),binance);assert.deepEqual(meta.calls,[]);
    delete window.ethereum;assert.equal(listInjectedWallets().filter(x=>x.kind==='OKX Wallet').length,1);assert.equal(listInjectedWallets().filter(x=>x.kind==='Binance Wallet').length,1);
  }finally{session.disconnect();session.stop();delete window.okxwallet;delete window.binancew3w;delete window.BinanceChain;}
});
test('no injected provider remains unavailable without asking another wallet for accounts',async()=>{
 const session=setup();session.connect();assert.deepEqual(session.getSnapshot().options,[]);assert.equal(session.getSnapshot().open,true);await session.authorize('Browser Wallet');assert.equal(session.getSnapshot().error,'walletMissing');assert.equal(session.getSnapshot().address,'');session.stop();
});
test('EIP-6963 discovery updates after start, deduplicates providers and filters remote/script icons',()=>{
  const s=setup();const wallet=Object.assign(new Wallet(),{isBinance:true});window.ethereum={providers:[wallet]};
  const event=new Event('eip6963:announceProvider');event.detail={provider:wallet,info:{uuid:'wallet-test',rdns:'com.binance.wallet',name:'Binance Wallet',icon:'javascript:alert(1)'}};window.dispatchEvent(event);
  assert.equal(s.getSnapshot().options.filter(x=>x.kind==='Binance Wallet').length,1);assert.equal(listInjectedWallets().find(x=>x.provider===wallet).icon,undefined);
  assert.equal(safeInjectedWalletIcon('https://tracking.example/icon.svg'),undefined);assert.equal(safeInjectedWalletIcon('data:image/png;base64,AAAA'),'data:image/png;base64,AAAA');s.stop();
});
test('duplicate connections share one account prompt',async()=>{
  const wallet=new Wallet();let release;wallet.request=async({method})=>{wallet.calls.push(method);return method==='eth_requestAccounts'?await new Promise(resolve=>{release=resolve;}):'0x61';};
  const first=connectInjected(wallet),second=connectInjected(wallet);assert.equal(first,second);release([A]);await first;assert.deepEqual(wallet.calls,['eth_requestAccounts','eth_chainId']);
});
test('busy wallet uses SingleSpark pending recovery instead of duplicate immediate prompts',async()=>{
  const wallet=new Wallet();let first=true,pending=false;
  wallet.request=async({method})=>{wallet.calls.push(method);if(method==='eth_requestAccounts'&&first){first=false;throw Object.assign(Error('busy'),{code:-32002});}return method==='eth_chainId'?'0x61':[A];};
  const result=await connectInjected(wallet,{onPending:()=>{pending=true;}});assert.equal(pending,true);assert.equal(result.address,A);assert.deepEqual(wallet.calls,['eth_requestAccounts','eth_accounts','eth_chainId']);
});
test('network switch adds only unknown chain 4902, switches again, and verifies resulting chain',async()=>{
  const chain={id:97,hexId:'0x61',name:'BNB Testnet',rpc:'https://bsc-testnet-dataseed.bnbchain.org',explorer:'https://testnet.bscscan.com'};
  const wallet=new Wallet();wallet.chain='0x38';const base=wallet.request.bind(wallet);let unknown=true;
  wallet.request=async(args)=>{if(args.method==='wallet_switchEthereumChain'&&unknown){unknown=false;wallet.calls.push(args.method);throw Object.assign(Error('unknown'),{code:4902});}if(args.method==='wallet_addEthereumChain'){wallet.calls.push(args.method);assert.equal(args.params[0].chainId,'0x61');return null;}return base(args);};
  await ensureWalletChain(wallet,chain);assert.equal(wallet.chain,'0x61');assert.deepEqual(wallet.calls,['eth_chainId','wallet_switchEthereumChain','wallet_addEthereumChain','wallet_switchEthereumChain','eth_chainId']);
  wallet.chain='0x38';wallet.request=async({method})=>{if(method==='eth_chainId')return '0x38';throw Object.assign(Error('rejected'),{code:4001});};await assert.rejects(ensureWalletChain(wallet,chain),{code:4001});
});

test('account changed while the binding signature was pending cannot publish a stale connected account',async()=>{
 const wallet=Object.assign(new Wallet(A),{isMetaMask:true});store.clear();clearActiveInjectedWallet();window.ethereum=wallet;
 const session=createWalletSession(async()=>{wallet.address=B;return {referralBound:true,referralCode:'',referrer:'0x0000000000000000000000000000000000000000'};});session.start();await session.authorize('MetaMask');assert.equal(session.getSnapshot().address,'');assert.equal(session.getSnapshot().error,'api.wallet_changed');assert.equal(getWalletProvider(),null);session.stop();
});


test('wallet fallback assets are standalone SVGs that browsers can decode',async()=>{
 const {readFile}=await import('node:fs/promises');
 for(const name of ['browser','metamask','okx','binance','coinbase']){
  const svg=await readFile(new URL('../components/singlespark/assets/singlespark/wallets/'+name+'.svg',import.meta.url),'utf8');
  assert.match(svg,/<svg[^>]+xmlns="http:\/\/www.w3.org\/2000\/svg"/,name);
 }
});
