import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import solc from 'solc';
const root=fileURLToPath(new URL('../../',import.meta.url));
const input={language:'Solidity',sources:{'contracts/test/fixtures/SplitVaultTest.sol':{content:readFileSync(join(root,'contracts/test/fixtures/SplitVaultTest.sol'),'utf8')},'contracts/OnholdNFT.sol':{content:readFileSync(join(root,'contracts/OnholdNFT.sol'),'utf8')},'contracts/OnholdGameplayVault.sol':{content:readFileSync(join(root,'contracts/OnholdGameplayVault.sol'),'utf8')},'contracts/MockTestDeployment.sol':{content:readFileSync(join(root,'contracts/MockTestDeployment.sol'),'utf8')},'contracts/OnholdMarket.sol':{content:readFileSync(join(root,'contracts/OnholdMarket.sol'),'utf8')},'contracts/TestDeployment.sol':{content:readFileSync(join(root,'contracts/TestDeployment.sol'),'utf8')},'contracts/FlapBuyback.sol':{content:readFileSync(join(root,'contracts/FlapBuyback.sol'),'utf8')}},settings:{viaIR:true,optimizer:{enabled:true,runs:200},evmVersion:'paris',outputSelection:{'*':{'*':['abi','storageLayout','evm.bytecode.object','evm.deployedBytecode.object']}}}};
const output=JSON.parse(solc.compile(JSON.stringify(input),{import:path=>{try{return{contents:readFileSync(join(root,path.startsWith('contracts/')?'':'node_modules',path),'utf8')}}catch{return{error:'Import not found: '+path}}}}));
const errors=(output.errors||[]).filter(error=>error.severity==='error');
if(errors.length)throw new Error(errors.map(error=>error.formattedMessage).join('\n'));
mkdirSync(join(root,'contracts/artifacts'),{recursive:true});
for(const [source,contracts] of Object.entries(output.contracts))for(const [name,artifact] of Object.entries(contracts))if(source.startsWith('contracts/')||name==='ERC1967Proxy'){if(artifact.evm.deployedBytecode.object.length/2>24576)throw Error(name+' exceeds the EVM runtime size limit');writeFileSync(join(root,'contracts/artifacts',name+'.json'),JSON.stringify({abi:artifact.abi,storageLayout:artifact.storageLayout,bytecode:'0x'+artifact.evm.bytecode.object},null,2));}
console.log('Compiled BNB-compatible market and test-only $OnHold deployment.');
