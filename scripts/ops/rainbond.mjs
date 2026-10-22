import {execFileSync} from 'node:child_process';
const launcher=process.env.RAINSKILLS_TOOLS||'/Users/nat/.rainbond/bin/rainskills-tools.js';
function cli(mode,tool,input,confirm){return JSON.parse(execFileSync(process.execPath,[launcher,mode,tool,'--input','-','--skill-id','rainbond-app-assistant',...(confirm?['--confirm',confirm]:[])],{input:JSON.stringify(input),encoding:'utf8',maxBuffer:64*1024*1024,stdio:['pipe','pipe','inherit']}));}
export function read(tool,input){return cli('read',tool,input)}
export function change(tool,input){const prepared=cli('call',tool,input);return prepared.requires_confirmation?cli('call',tool,input,prepared.confirmation_id):prepared}
export function exec(target,command){const r=change('rainbond_exec',{...target,command,timeout_seconds:60});if(r.exit_code!==0||r.truncated)throw Error(JSON.stringify({message:'Remote command failed or output truncated',exitCode:r.exit_code,truncated:r.truncated,stderr:r.stderr?.slice(0,500),keys:Object.keys(r)}));return r.stdout;}
