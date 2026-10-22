import {readFile} from 'node:fs/promises';
export async function loadChainConfig(path){
 const value=JSON.parse(await readFile(path,'utf8'));
 if(![56,97].includes(value.chainId)||value.protocol!=='nft-staking-v4'||typeof value.mock!=='boolean'||value.chainId===56&&value.mock||!['active','prepare',undefined].includes(value.mode))throw Error('Invalid chain configuration');
 for(const key of ['marketAddress','nftAddress'])if(value[key]!=null&&(!/^0x[0-9a-fA-F]{40}$/.test(value[key])||/^0x0{40}$/.test(value[key])))throw Error('Invalid '+key);
 if(value.mode==='prepare'&&(value.chainId!==56||value.marketAddress||value.nftAddress))throw Error('Prepare mode cannot contain contract addresses');
 if(value.chainId===56&&value.mode!=='prepare'&&(!value.marketAddress||!value.nftAddress))throw Error('Active mainnet requires deployed contracts');
 return value;
}
