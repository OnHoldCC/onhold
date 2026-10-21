import {abi as legacy} from '../../contracts/artifacts/OnholdMarket.json';
import {abi as nft} from '../../contracts/artifacts/OnholdNFT.json';
import {abi as vault} from '../../contracts/artifacts/OnholdGameplayVault.json';
export const abi=[...legacy,...nft.filter(item=>!legacy.some(prior=>prior.type===item.type&&prior.name===item.name)),...vault.filter(item=>!legacy.some(prior=>prior.type===item.type&&prior.name===item.name)&&!nft.some(prior=>prior.type===item.type&&prior.name===item.name))];
