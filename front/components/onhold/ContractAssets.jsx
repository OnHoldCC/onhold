import React,{useState} from 'react';
import {OnHoldButton as Button,OnHoldContractAddressList as ContractAddressList} from '@onhold/ui/ui';
import {Notice} from './Feedback';
import {assets,addWalletToken} from '../../src/wallet-assets.mjs';
import {chain} from '../../src/network.mjs';
import './contract-assets.css';
export function ContractAssets({wallet,t}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(false);
 async function add(){
  if(!wallet.address){wallet.connect();return;}
  setBusy(true);setMessage('');setError(false);
  try{const added=await addWalletToken(wallet.address);setMessage(added?'assetAdded':'assetCancelled');}
  catch(cause){setError(true);setMessage(cause.message==='walletChanged'?'walletChanged':cause.code===4001?'assetCancelled':'assetFailed');}
  finally{setBusy(false);}
 }
 return <ContractAddressList network={chain.label} label={t('assetContracts')}
  entries={assets.contracts.map(([key,address])=>({label:t('asset.'+key),address,href:`${chain.explorer}/address/${address}`}))}
  actions={<Button size="sm" disabled={busy} loading={busy} onClick={()=>void add()}>{t('assetAddToken')}</Button>}>
  <Notice error={error}>{message&&t(message)}</Notice>
 </ContractAddressList>;
}
