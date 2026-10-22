import React,{useState} from 'react';
import {Button,Dialog,Input} from '@singlespark/component-atlas/ui';
import {SingleSparkField} from '@singlespark/component-atlas/primitives';
import {Notice} from './Feedback';
import {assets,nftAddress,addWalletAsset} from '../../src/wallet-assets.mjs';
import {chain} from '../../src/network.mjs';
import './contract-assets.css';
export function ContractAssets({wallet,t}){
 const [open,setOpen]=useState(false),[id,setId]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(false);
 async function add(type){
  if(!wallet.address){wallet.connect();return;}
  setBusy(true);setMessage('');setError(false);
  try{const added=await addWalletAsset(type,wallet.address,id);setMessage(added?'assetAdded':'assetCancelled');}
  catch(cause){setError(true);setMessage(['assetInvalidId','assetNotOwned','walletChanged'].includes(cause.message)?cause.message:cause.code===4001?'assetCancelled':'assetFailed');}
  finally{setBusy(false);}
 }
 return <section className="contract-assets" aria-label={t('assetContracts')}>
  <div className="contract-assets__heading"><span>{chain.label}</span><div className="contract-assets__actions"><Button size="sm" disabled={busy} loading={busy&&!open} onClick={()=>void add('ERC20')}>{t('assetAddToken')}</Button><Button size="sm" disabled={busy} onClick={()=>{setMessage('');setOpen(true);}}>{t('assetAddNft')}</Button></div></div>
  <details><summary>{t('assetContracts')}</summary><dl className="contract-assets__list">{assets.contracts.map(([key,address])=><div key={key}><dt>{t('asset.'+key)}</dt><dd><a href={`${chain.explorer}/address/${address}`} target="_blank" rel="noreferrer"><code>{address}</code> ↗</a></dd></div>)}</dl></details>
  {!open&&message&&<Notice error={error}>{t(message)}</Notice>}
  <Dialog open={open} onClose={()=>setOpen(false)} ariaLabel={t('assetAddNft')}><h2>{t('assetAddNft')}</h2><p>{t('assetNftHelp')}</p><p className="contract-assets__address"><strong>{chain.label}</strong><br/><code>{nftAddress}</code></p><p>{t('assetNftStaked')}</p><form onSubmit={event=>{event.preventDefault();void add('ERC721');}}><SingleSparkField label="NFT Token ID"><Input value={id} onChange={event=>setId(event.target.value)} inputMode="numeric" autoComplete="off" placeholder="2" required maxLength={78}/></SingleSparkField><Notice error={error}>{message&&t(message)}</Notice><div className="contract-assets__actions">{wallet.address?<Button type="submit" loading={busy} disabled={busy}>{t('assetAddNft')}</Button>:<Button type="button" onClick={wallet.connect}>{t('connect')}</Button>}<Button type="button" variant="ghost" onClick={()=>setOpen(false)}>{t('close')}</Button></div></form></Dialog>
 </section>;
}
