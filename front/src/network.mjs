import networks from '../../config/networks.json' with {type:'json'};
import config from './chain-config.json' with {type:'json'};
export const chain=networks[String(config.chainId)];
if(!chain||chain.id===56&&config.mock!==false)throw Error('invalid_chain_configuration');
// Preserve existing testnet recovery, while mainnet never reads its pending mint.
export const mintReceiptKey=chain.id===97?'onhold.nftreceipt':`onhold.nftreceipt:${chain.id}`;
