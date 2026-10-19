import {BrowserProvider,Contract,ContractFactory,JsonRpcProvider,getAddress,formatUnits} from 'ethers';
import marketArtifact from '../artifacts/OnholdMarket.json';
import tokenArtifact from '../artifacts/ClaudeTestToken.json';
import factoryArtifact from '../artifacts/TestDeployment.json';
import config from './chain-config.json';
import {parseEth} from './market.mjs';
export const chain={id:97,hexId:'0x61',name:'BNB Smart Chain Testnet',rpc:'https://bsc-testnet-dataseed.bnbchain.org',explorer:'https://testnet.bscscan.com'};
export function storedMarket() {
  try {const address=JSON.parse(localStorage.getItem('onhold.contract'))?.marketAddress||config.marketAddress;return address?getAddress(address):null;}catch{return null;}
}
export function storeMarket(address) {const checked=getAddress(address);localStorage.setItem('onhold.contract',JSON.stringify({chainId:97,marketAddress:checked}));return checked;}
async function signer() {
  if(!window.ethereum?.request)throw new Error('No browser wallet');
  await window.ethereum.request({method:'eth_requestAccounts'});
  if(await window.ethereum.request({method:'eth_chainId'})!==chain.hexId){
    try{await window.ethereum.request({method:'wallet_switchEthereumChain',params:[{chainId:chain.hexId}]});}
    catch(error){if(error.code!==4902)throw error;await window.ethereum.request({method:'wallet_addEthereumChain',params:[{chainId:chain.hexId,chainName:chain.name,nativeCurrency:{name:'Test BNB',symbol:'tBNB',decimals:18},rpcUrls:[chain.rpc],blockExplorerUrls:[chain.explorer]}]});}
  }
  const provider=new BrowserProvider(window.ethereum);
  if((await provider.getNetwork()).chainId!==97n)throw new Error('BNB testnet required');
  return provider.getSigner();
}
export async function readMarket(address) {
  const provider=new JsonRpcProvider(chain.rpc,97,{staticNetwork:true});
  try {
    const market=new Contract(address,marketArtifact.abi,provider);
    const [ads,tokenAddress,recipients,claimed]=await Promise.all([Promise.all(Array.from({length:6},(_,slot)=>market.ads(slot))),market.claude(),market.totalRecipients(),market.totalClaimed()]);
    const token=new Contract(tokenAddress,tokenArtifact.abi,provider);
    const burned=await token.totalBurned();
    return {ads:ads.map((ad,id)=>({id,title:ad.title,url:ad.url,description:ad.description,bid:ad.initialBid.toString(),startedAt:Number(ad.startedAt)*1000,version:ad.version.toString(),empty:ad.advertiser==='0x0000000000000000000000000000000000000000',advertiser:ad.advertiser})),financial:{recipients:Number(recipients),claimed:formatUnits(claimed,18),burned:formatUnits(burned,18),tokenAddress,marketAddress:address}};
  }finally{provider.destroy();}
}
export async function placeChainBid(address,slot,version,form) {
  const account=await signer();const market=new Contract(address,marketArtifact.abi,account);
  const transaction=await market.bid(slot,version,form.title.trim(),form.url.trim(),form.description.trim(),{value:parseEth(form.amount)});
  await transaction.wait();return transaction.hash;
}
export async function deployTestContracts() {
  const account=await signer();
  const factory=new ContractFactory(factoryArtifact.abi,factoryArtifact.bytecode,account);
  const deployment=await factory.deploy();await deployment.waitForDeployment();
  return {marketAddress:await deployment.market(),tokenAddress:await deployment.token(),transactionHash:deployment.deploymentTransaction().hash};
}
