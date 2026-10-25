import {cp,readFile,writeFile,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,join} from 'node:path';

const source=resolve(process.argv[2]||fileURLToPath(new URL('../../../SingleSparkUiUx',import.meta.url)));
const target=fileURLToPath(new URL('../components/singlespark',import.meta.url));
if(source===resolve(target))throw Error('The source must be the UIUX repository, not the generated vendor copy');
const manifest=JSON.parse(await readFile(join(source,'package.json'),'utf8'));
if(manifest.name!=='@onhold/ui')throw Error('Expected the OnHold UI component library');
await readFile(join(source,'dist/components/ui/TransactionProgressDialog.d.ts'));
// Replace only generated package output; runtime wallet adapters remain owned by OnHold.
await rm(join(target,'dist'),{recursive:true,force:true});
await cp(join(source,'dist'),join(target,'dist'),{recursive:true});
for(const name of ['github','lucide'])await cp(join(source,'assets',name),join(target,'assets',name),{recursive:true});
for(const name of ['README.md','docs/component-audit/source-index.json','docs/component-audit/web3-integration.md','docs/component-audit/onhold-controls.md'])await cp(join(source,name),join(target,name),{recursive:true});
const {scripts,devDependencies,...published}=manifest;
await writeFile(join(target,'package.json'),JSON.stringify(published,null,2)+'\n');
console.log(`Synced ${manifest.name}@${manifest.version}; wallet runtime adapters preserved.`);
