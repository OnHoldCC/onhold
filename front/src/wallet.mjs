import {rememberReferral} from './referrals.mjs';
import {subscribeInjectedWallets,listInjectedWallets,getInjectedForKind,findStoredInjectedWallet,readStoredWalletSelection,setActiveInjectedWallet,clearActiveInjectedWallet,getActiveInjectedWallet,getInjected,connectInjected,subscribeWalletEvents} from '../components/singlespark/runtime/injected.mjs';

const validAddress=value=>typeof value==='string'&&/^0x[0-9a-fA-F]{40}$/.test(value);
const parseChain=value=>typeof value==='string'&&/^0x[0-9a-f]+$/i.test(value)&&Number.isSafeInteger(Number(value))&&Number(value)>0?Number(value):null;
const saveDisconnected=value=>{try{localStorage.setItem('onhold.wallet.disconnected',value?'1':'0');}catch{}};
const wasDisconnected=()=>{try{return localStorage.getItem('onhold.wallet.disconnected')==='1';}catch{return false;}};
export {getInjected as getWalletProvider};

export async function ensureWalletChain(provider,chain){
  if(!provider?.request)throw Error('walletMissing');
  if(parseChain(await provider.request({method:'eth_chainId'}))===chain.id)return;
  try{await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:chain.hexId}]});}
  catch(error){
    if(error.code!==4902)throw error;
    await provider.request({method:'wallet_addEthereumChain',params:[{chainId:chain.hexId,chainName:chain.name,nativeCurrency:{name:'Test BNB',symbol:'tBNB',decimals:18},rpcUrls:[chain.rpc],blockExplorerUrls:[chain.explorer]}]});
    await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:chain.hexId}]});
  }
  if(parseChain(await provider.request({method:'eth_chainId'}))!==chain.id)throw Error('walletOther');
}

export function createWalletSession(bindReferral){
  if(typeof bindReferral!=='function')throw Error('Referral binding is required');
  let state={address:'',chainId:null,kind:'',busy:false,open:false,error:'',pending:false,binding:false,referralBound:false,referralCode:'',referrer:'',options:[],revision:0};
  const listeners=new Set();
  let referralSource='';
  let generation=0,offWallet=()=>{},offDiscovery=()=>{},started=false,restoring=false;
  const update=patch=>{state={...state,...patch};listeners.forEach(listener=>listener());};
  function disconnect(){
    generation++;offWallet();offWallet=()=>{};clearActiveInjectedWallet();saveDisconnected(true);
    update({address:'',chainId:null,kind:'',busy:false,open:false,error:'',pending:false,binding:false,referralBound:false,referralCode:'',referrer:'',revision:state.revision+1});
  }
  function attach(selected,address,chainId,referral){
    offWallet();setActiveInjectedWallet(selected);saveDisconnected(false);
    const current=()=>getActiveInjectedWallet()?.provider===selected.provider;
    const off=subscribeWalletEvents(selected.provider,{
      onAccountsChanged:accounts=>{
        if(!current())return;
        if(!Array.isArray(accounts)||!validAddress(accounts[0])){disconnect();return;}
        if(accounts[0].toLowerCase()!==state.address.toLowerCase()){disconnect();update({open:true,error:'walletChanged'});}
      },
      onChainChanged:value=>{if(current())update({chainId:parseChain(value),revision:state.revision+1});}
    });
    const disconnected=()=>{if(current())disconnect();};
    selected.provider.on?.('disconnect',disconnected);
    offWallet=()=>{off();selected.provider.removeListener?.('disconnect',disconnected);};
    update({address,chainId,kind:selected.kind,error:'',...referral});
  }
  async function restore(){
    if(restoring||state.address||state.busy||wasDisconnected())return;
    const selected=findStoredInjectedWallet(readStoredWalletSelection());
    if(!selected)return;
    restoring=true;const attempt=generation;
    try{
      const accounts=await selected.provider.request({method:'eth_accounts'});
      const chainId=parseChain(await selected.provider.request({method:'eth_chainId'}));
      if(started&&attempt===generation&&!wasDisconnected()&&Array.isArray(accounts)&&validAddress(accounts[0])&&chainId){
        const referral=await bindReferral(selected.provider,accounts[0],'',()=>started&&attempt===generation,false);
        if(referral&&started&&attempt===generation&&!wasDisconnected())attach(selected,accounts[0],chainId,referral);
      }
    }catch{}finally{restoring=false;}
  }
  function discover(){update({options:listInjectedWallets().map(({kind,icon})=>({kind,icon}))});void restore();}
  async function authorize(kind){
    if(state.busy)return;
    generation++;const attempt=generation;
    const selected=getInjectedForKind(kind);
    if(!selected){update({error:'walletMissing'});return;}
    update({busy:true,error:'',pending:false,kind:selected.kind});
    try{
      const result=await connectInjected(selected.provider,{onPending:()=>{if(attempt===generation)update({pending:true});}});
      if(attempt!==generation)return;
      const source=rememberReferral(globalThis.location?.search||'',localStorage)||referralSource;
      update({binding:true});
      const referral=await bindReferral(selected.provider,result.address,source,()=>attempt===generation);
      if(attempt!==generation)return;
      const currentAccounts=await selected.provider.request({method:'eth_accounts'});
      const currentChain=parseChain(await selected.provider.request({method:'eth_chainId'}));
      if(attempt!==generation)return;
      if(!Array.isArray(currentAccounts)||currentAccounts[0]?.toLowerCase()!==result.address.toLowerCase()||!currentChain)throw Error('wallet_changed');
      if(!referral?.referralBound)throw Error('referral_binding_required');
      attach(selected,result.address,currentChain,referral);update({open:false});
    }catch(error){if(attempt===generation)update({error:(error.code===4001||error.code==='ACTION_REJECTED')?'walletCancelled':error.code?`api.${error.code}`:['wallet_changed','invalid_referral_code','referral_binding_required'].includes(error.message)?`api.${error.message}`:'walletError'});}
    finally{if(attempt===generation)update({busy:false,pending:false,binding:false});}
  }
  function close(){generation++;update({open:false,busy:false,pending:false,binding:false});}
  return {
    getSnapshot:()=>state,
    subscribe:listener=>{listeners.add(listener);return()=>listeners.delete(listener);},
    start(){if(started)return;started=true;const selected=getActiveInjectedWallet();if(selected&&state.address)attach(selected,state.address,state.chainId,{referralBound:state.referralBound,referralCode:state.referralCode,referrer:state.referrer});try{referralSource=rememberReferral(globalThis.location?.search||'',localStorage);}catch{}offDiscovery=subscribeInjectedWallets(discover);window.addEventListener('ethereum#initialized',discover);discover();},
    stop(){started=false;generation++;offDiscovery();offWallet();offWallet=()=>{};window.removeEventListener('ethereum#initialized',discover);},
    connect(){update({open:true,error:''});discover();},close,authorize,disconnect,
    retry(){update({error:''});discover();},
    async switchNetwork(chain){
      if(state.busy)return;const attempt=++generation;const provider=getInjected();update({busy:true,error:''});
      try{await ensureWalletChain(provider,chain);if(attempt===generation)update({chainId:chain.id});}
      catch(error){if(attempt===generation)update({error:(error.code===4001||error.code==='ACTION_REJECTED')?'walletCancelled':'walletOther'});}
      finally{if(attempt===generation)update({busy:false});}
    }
  };
}
