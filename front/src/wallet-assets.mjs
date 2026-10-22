import contracts from '../../config/public-contracts.json' with {type:'json'};
import {chain} from './network.mjs';
import {getWalletProvider,ensureWalletChain} from './wallet.mjs';
export const assets=contracts[String(chain.id)];
export async function addWalletToken(account){
  const provider=getWalletProvider();
  if(!provider?.request||!/^0x[0-9a-fA-F]{40}$/.test(account||''))throw Error('walletMissing');
  await ensureWalletChain(provider,chain);
  const [accounts,chainId]=await Promise.all([provider.request({method:'eth_accounts'}),provider.request({method:'eth_chainId'})]);
  if(provider!==getWalletProvider()||accounts?.[0]?.toLowerCase()!==account.toLowerCase()||Number(chainId)!==chain.id)throw Error('walletChanged');
  return provider.request({method:'wallet_watchAsset',params:{type:'ERC20',options:{address:assets.tokenAddress,symbol:assets.symbol,decimals:assets.decimals}}});
}
