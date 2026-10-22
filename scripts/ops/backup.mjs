import {readFile,mkdir,writeFile,chmod} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {randomBytes,randomUUID,createCipheriv,createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {read,exec} from './rainbond.mjs';
const profile=JSON.parse(await readFile(process.argv[2]||'.rainbond/local.json','utf8'));
const name=profile.preferences?.default_environment||'preview',stamp=new Date().toISOString().replace(/[:.]/g,'-');
const directory=resolve(process.argv[3]||`.rainbond/backups/${name}/${stamp}`),keyPath=resolve(`.rainbond/backup-keys/${name}.key`);
await mkdir(directory,{recursive:true,mode:0o700});await mkdir('.rainbond/backup-keys',{recursive:true,mode:0o700});
let key;try{key=await readFile(keyPath)}catch(e){if(e.code!=='ENOENT')throw e;key=randomBytes(32);await writeFile(keyPath,key,{mode:0o600,flag:'wx'})}assert.equal(key.length,32);await chmod(keyPath,0o600);
const {team_name,region_name,app_id}=profile.binding,context={team_name,region_name,app_id},manifest={createdAt:new Date().toISOString(),environment:name,appId:app_id,files:[],skipped:[]};
const quote=s=>"'"+s.replaceAll("'","'\\''")+"'";
async function save(name,bytes){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv),payload=Buffer.concat([cipher.update(bytes),cipher.final()]);const encrypted=Buffer.concat([Buffer.from('OHB1'),iv,cipher.getAuthTag(),payload]);await writeFile(join(directory,name+'.enc'),encrypted,{mode:0o600,flag:'wx'});manifest.files.push({name:name+'.enc',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),encryptedSha256:createHash('sha256').update(encrypted).digest('hex')});}
async function download(target,path){const size=Number(exec(target,['sh','-c',`wc -c < ${quote(path)}`]).trim());assert.ok(Number.isSafeInteger(size)&&size>0&&size<100*1024*1024);const chunks=[];for(let offset=0;offset<size;offset+=16384){const output=exec(target,['sh','-c',`dd if=${quote(path)} bs=1 skip=${offset} count=${Math.min(16384,size-offset)} 2>/dev/null | base64`]);const part=Buffer.from(output.replace(/\s/g,''),'base64');assert.equal(part.length,Math.min(16384,size-offset));chunks.push(part)}return Buffer.concat(chunks)}
for(const role of ['postgres','api','keeper','burn-keeper']){
 const component=profile.runtime_components[role];if(!component){assert.ok(!['postgres','api'].includes(role),role+' is required for a complete backup');manifest.skipped.push(role+': absent');continue}
 const pods=read('rainbond_get_component_pods',{...context,service_id:component.service_id}).items||[];
 const pod=pods.find(p=>p.pod_status==='RUNNING');if(!pod){assert.ok(!['postgres','api'].includes(role),role+' must be running for a complete backup');manifest.skipped.push(role+': not running');continue}
 const target={...context,service_id:component.service_id,pod_name:pod.pod_name};const temp='/tmp/onhold-backup-'+randomUUID();
 if(role==='postgres')exec(target,['sh','-c',`set -e; umask 077; pg_dump -Fc --no-owner --no-privileges -U "$POSTGRES_USER" "$POSTGRES_DB" > ${quote(temp)}`]);
 else if(role==='api'){
  const helper=gzipSync(await readFile('.rainbond/production/sqlite-backup')).toString('base64');
  exec(target,['sh','-c',`umask 077; : > ${quote(temp+'.b64')}`]);
  for(let offset=0;offset<helper.length;offset+=60000)exec(target,['sh','-c',`printf %s ${quote(helper.slice(offset,offset+60000))} >> ${quote(temp+'.b64')}`]);
  exec(target,['sh','-c',`set -e; base64 -d ${quote(temp+'.b64')} | gzip -d > ${quote(temp+'.tool')}; chmod 700 ${quote(temp+'.tool')}; ${quote(temp+'.tool')} "$ONHOLD_DATA_DIR/events.sqlite3" ${quote(temp+'.sqlite')}; gzip -c ${quote(temp+'.sqlite')} > ${quote(temp)}; rm ${quote(temp+'.tool')} ${quote(temp+'.sqlite')} ${quote(temp+'.b64')}`]);
 }else exec(target,['sh','-c',`set -e; umask 077; tar -czf ${quote(temp)} -C /data keeper`]);
 const bytes=await download(target,temp);await save(role+(role==='postgres'?'.dump':role==='api'?'.sqlite.gz':'.tar.gz'),bytes);exec(target,['rm',temp]);
}
await save('profile.json',Buffer.from(JSON.stringify(profile)));
try{await save('secrets.json',await readFile(`.rainbond/secrets.${name}.json`))}catch(e){if(e.code!=='ENOENT')throw e;manifest.skipped.push('local secrets file absent')}
await writeFile(join(directory,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{mode:0o600});
console.log(JSON.stringify({directory,keyFile:keyPath,files:manifest.files.map(f=>({name:f.name,bytes:f.bytes})),skipped:manifest.skipped}));
