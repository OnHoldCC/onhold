import React,{useState} from 'react';
import {Button} from '@singlespark/component-atlas/ui';
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
 return <section className="contract-assets" aria-label={t('assetContracts')}>
  <div className="contract-assets__heading"><span>{chain.label}</span><Button size="sm" disabled={busy} loading={busy} onClick={()=>void add()}>{t('assetAddToken')}</Button></div>
  <details><summary>{t('assetContracts')}</summary><dl className="contract-assets__list">{assets.contracts.map(([key,address])=><div key={key}><dt>{t('asset.'+key)}</dt><dd><a href={`${chain.explorer}/address/${address}`} target="_blank" rel="noreferrer"><code>{address}</code> ↗</a></dd></div>)}</dl></details>
  <Notice error={error}>{message&&t(message)}</Notice>
 </section>;
}
