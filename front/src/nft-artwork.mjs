import {formatBanTime} from './format.mjs';
export const NFT_WIDTH=840,NFT_HEIGHT=924;

// Layout mirrors BanPassRenderer; the PNG is a browser-rendered display copy.
export function drawBanPass(ctx,{tier,record}){
  if(![0,1,2].includes(tier)||!record||['account','uuid','bannedAt','plan'].some(key=>typeof record[key]!=='string')||Array.from(record.account).length>160||record.uuid.length!==36||record.plan.length>80||record.bannedAt.length>64)throw Error('invalid_provider_response');
  const stampColor='#b64336',color=tier===1?'#c36948':tier===2?'#625785':'#77726a',plan=tier===1?'Pro':tier===2?'Max':'Free';
  const font=(size,weight=600,family='"Launch Rounded", ui-rounded, system-ui, sans-serif')=>{ctx.font=`${weight} ${size}px ${family}`;};
  const text=(value,x,y,size=22,weight=600,fill='#33312e',align='left',family)=>{font(size,weight,family);ctx.fillStyle=fill;ctx.textAlign=align;ctx.fillText(value,x,y);};
  const spaced=(value,x,y,gap)=>{const chars=Array.from(value),width=chars.reduce((sum,c)=>sum+ctx.measureText(c).width,0)+gap*(chars.length-1);let at=x-width/2;ctx.textAlign='left';for(const char of chars){ctx.fillText(char,at,y);at+=ctx.measureText(char).width+gap;}};
  const lines=(value,width,y,size=22,family)=>{const chars=Array.from(value.replace(/[\x00-\x1f]/g,' '));for(let i=0;i<chars.length;i+=width)text(chars.slice(i,i+width).join(''),48,y+i/width*29,size,600,'#33312e','left',family);};
  ctx.clearRect(0,0,NFT_WIDTH,NFT_HEIGHT);
  ctx.fillStyle='#f7f4ed';ctx.strokeStyle='#d4cec4';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(1,1,838,922,38);ctx.fill();ctx.stroke();
  ctx.save();ctx.translate(48,46);ctx.scale(4,4);ctx.fillStyle='#d97757';ctx.fill(new Path2D('M3 1h7v1h2v2h1v3h-2v2h-1v2H9V9H8v2H7V9H6v2H5V9H4v2H3V9H2V7H0V4h1V2h2Z'));ctx.fillStyle='#2d2926';ctx.fill(new Path2D('M3 4h1v2H3zm6 0h1v2H9z'));ctx.restore();
  text('Claude Code',108,77,23,700);text(plan,790,77,23,700,color,'right');
  text('BAN PASS / ACCOUNT RECORD',48,131,17,400,'#77726a');
  ctx.save();ctx.translate(420,213);ctx.rotate(-5*Math.PI/180);ctx.translate(-420,-213);ctx.strokeStyle=stampColor;ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(48,163,744,102,16);ctx.stroke();font(76,800);ctx.fillStyle=stampColor;spaced('BANNED',420,238,9);ctx.restore();
  for(const [label,y] of [['ACCOUNT',325],['PREVIOUS PLAN',521],['BANNED AT (UTC)',653],['UUID',769]])text(label,48,y,15,400,'#77726a','left','monospace');
  lines(record.account,32,360);lines(record.plan,32,556);lines(formatBanTime(record.bannedAt),48,688,20,'monospace');lines(record.uuid,40,805,22,'monospace');
  ctx.beginPath();ctx.moveTo(48,849);ctx.lineTo(792,849);ctx.strokeStyle='#d4cec4';ctx.lineWidth=1;ctx.stroke();
  text('PERMANENT ON-CHAIN RECORD',48,891,16,400,'#77726a');text(`WEIGHT ${tier===1?1:tier===2?3:0}`,792,891,20,700,'#33312e','right');
}
export async function renderBanPassPng(verified){
  await document.fonts.load('600 22px "Launch Rounded"');
  const canvas=document.createElement('canvas');canvas.width=NFT_WIDTH;canvas.height=NFT_HEIGHT;
  const context=canvas.getContext('2d');if(!context)throw Error('artwork_unavailable');
  drawBanPass(context,verified);
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob&&blob.type==='image/png'&&blob.size<=5*1024*1024?resolve(blob):reject(Error('artwork_unavailable')),'image/png'));
}
