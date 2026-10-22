import contracts from '../../config/public-contracts.json' with {type:'json'};
import config from './chain-config.json' with {type:'json'};
import {chain} from './network.mjs';
import {getWalletProvider,ensureWalletChain} from './wallet.mjs';
export const assets=contracts[String(chain.id)];
export const nftAddress=config.nftAddress;
export async function addWalletAsset(type,account,tokenId=''){
  if(!['ERC20','ERC721'].includes(type))throw Error('assetFailed');
  if(type==='ERC721'&&(!/^[1-9][0-9]{0,77}$/.test(tokenId)||BigInt(tokenId)>=2n**256n))throw Error('assetInvalidId');
  const provider=getWalletProvider();
  if(!provider?.request||!/^0x[0-9a-fA-F]{40}$/.test(account||''))throw Error('walletMissing');
  await ensureWalletChain(provider,chain);
  async function check(){
    const [accounts,chainId]=await Promise.all([provider.request({method:'eth_accounts'}),provider.request({method:'eth_chainId'})]);
    if(provider!==getWalletProvider()||accounts?.[0]?.toLowerCase()!==account.toLowerCase()||Number(chainId)!==chain.id)throw Error('walletChanged');
  }
  await check();
  if(type==='ERC721'){
    const owner=await provider.request({method:'eth_call',params:[{to:nftAddress,data:'0x6352211e'+BigInt(tokenId).toString(16).padStart(64,'0')},'latest']});
    if(!/^0x0{24}[0-9a-fA-F]{40}$/.test(owner)||owner.slice(-40).toLowerCase()!==account.slice(2).toLowerCase())throw Error('assetNotOwned');
    await check();
  }
  return provider.request({method:'wallet_watchAsset',params:{type,options:type==='ERC20'?{address:assets.tokenAddress,symbol:assets.symbol,decimals:assets.decimals}:{address:nftAddress,tokenId}}});
}
