import { mkdir, copyFile, readFile, writeFile, rm, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join,relative } from 'node:path';
import {brotliCompressSync,gzipSync,constants} from 'node:zlib';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
import {messages} from '../src/locale-catalog.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
await rm(join(root,'dist'),{recursive:true,force:true});
await mkdir(join(root,'dist/assets'),{recursive:true});
const localePlugin={name:'locale-chunks',setup(plugin){
  plugin.onLoad({filter:/[/\\]locale-catalog\.mjs$/},()=>({contents:`export const messages={en:${JSON.stringify(messages.en)}};export const localeLoaders={${Object.keys(messages).filter(lang=>lang!=='en').map(lang=>`${lang}:()=>import('onhold-locale:${lang}')`).join(',')}};`,loader:'js'}));
  plugin.onResolve({filter:/^onhold-locale:/},args=>({path:args.path.slice(14),namespace:'locale'}));
  plugin.onLoad({filter:/.*/,namespace:'locale'},args=>({contents:`export default ${JSON.stringify(messages[args.path])};`,loader:'js'}));
}};
const result=await build({plugins:[localePlugin],entryPoints:{app:join(root,'src/main.jsx')},outdir:join(root,'dist'),entryNames:'[name]-[hash]',chunkNames:'[name]-[hash]',splitting:true,metafile:true,bundle:true,minify:true,jsx:'automatic',format:'esm',target:['es2022'],loader:{'.woff2':'file','.ttf':'file','.svg':'file','.png':'file','.webp':'file','.jpg':'file'},assetNames:'assets/singlespark/[name]-[hash]',define:{'process.env.NODE_ENV':'"production"'}});
const outputs=result.metafile.outputs;
const [entry,entryInfo]=Object.entries(outputs).find(([,value])=>value.entryPoint?.endsWith('src/main.jsx'));
const assetPath=path=>relative(join(root,'dist'),path);
// shortcut: listing CSS reserves two/three tag rows; revisit reserves if longer listings wrap further.
const style=await readFile(join(root,'src/style.css'));
const version=createHash('sha256').update(style).digest('hex').slice(0,12);
const stylePath=`style-${version}.css`;
await writeFile(join(root,'dist',stylePath),style);
const eager=new Set();
function collect(path){if(eager.has(path))return;eager.add(path);for(const item of outputs[path]?.imports||[])if(item.kind==='import-statement'&&outputs[item.path])collect(item.path);}
collect(entry);
const preload=[...eager].filter(path=>path!==entry).map(path=>`<link rel="modulepreload" href="${assetPath(path)}">`).join('');
const portraits=['claude-code-girl','teacher','student','sister'].map(name=>[640,1024].map(width=>assetPath(Object.keys(outputs).find(path=>path.endsWith('.webp')&&Object.keys(outputs[path].inputs).some(input=>input.endsWith(`/welcome/${name}-${width}.webp`))))));
const portraitPreload=`<script>(()=>{try{if(location.pathname!=='/'||sessionStorage.getItem('onhold.welcome.v1')==='read')return;}catch{}const images=${JSON.stringify(portraits)};const index=Math.floor(Math.random()*images.length);document.documentElement.dataset.welcomePortrait=String(index);images[index].forEach((href,i)=>{const link=document.createElement('link');link.rel='preload';link.as='image';link.href=href;link.media=i?'(min-width: 641px)':'(max-width: 640px)';link.fetchPriority='high';document.head.append(link);});})();</script>`;
const html=(await readFile(join(root,'src/index.html'),'utf8')).replace('app.js',assetPath(entry)).replace('app.css',assetPath(entryInfo.cssBundle)).replace('style.css',stylePath).replace('</head>',portraitPreload+preload+'</head>');
for(const [path,info]of Object.entries(outputs))if(/\.(js|css)$/.test(path)){
 const data=await readFile(path);
 await writeFile(path+'.br',brotliCompressSync(data,{params:{[constants.BROTLI_PARAM_QUALITY]:6}}));
 await writeFile(path+'.gz',gzipSync(data));
}
await writeFile(join(root,'dist',stylePath+'.br'),brotliCompressSync(style));
await writeFile(join(root,'dist',stylePath+'.gz'),gzipSync(style));
const initialJsBytes=[...eager].reduce((sum,path)=>sum+outputs[path].bytes,0);
await writeFile('/tmp/onhold-front-performance.json',JSON.stringify({initialJsBytes,eager:[...eager],outputs},null,2));
console.log(`Initial JS: ${initialJsBytes} bytes; wallet and secondary pages load on demand.`);
await writeFile(join(root,'dist/index.html'),html);
await copyFile(join(root,'src/assets/onhold-favicon-transparent.png'),join(root,'dist/assets/onhold-favicon-transparent.png'));
await mkdir(join(root,'dist/assets/promotions'),{recursive:true});
await copyFile(join(root,'src/assets/promotions/jingai.png'),join(root,'dist/assets/promotions/jingai.png'));
await mkdir(join(root,'dist/fonts'),{recursive:true});
for(const name of ['nunito-variable.ttf','OFL.txt']) await copyFile(join(root,'src/fonts',name),join(root,'dist/fonts',name));
for(const name of ['backers','singlespark','web3','fonts']) await cp(join(root,'components/singlespark/assets',name),join(root,'dist/assets',name),{recursive:true});
await mkdir(join(root,'dist/assets/guide'),{recursive:true});
await copyFile(join(root,'src/assets/guide/SOURCE.md'),join(root,'dist/assets/guide/SOURCE.md'));
console.log('Built React SPA: one entry, 5 routes, 8 languages, $OnHold components.');
