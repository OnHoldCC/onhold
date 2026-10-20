import test from 'node:test';
import assert from 'node:assert/strict';
import {drawBanPass,NFT_WIDTH,NFT_HEIGHT} from '../src/nft-artwork.mjs';
const record={account:'Example Organization',uuid:'11111111-1111-4111-8111-111111111111',bannedAt:'2026-09-01T12:41:20.292985Z',plan:'claude_max'};
test('Canvas template draws all verified fields, UTC time and correct tier weight',t=>{
 const previous=globalThis.Path2D;globalThis.Path2D=class{constructor(path){this.path=path;}};t.after(()=>{if(previous===undefined)delete globalThis.Path2D;else globalThis.Path2D=previous;});
 const text=[],ctx=new Proxy({fillText:(...args)=>text.push(args),measureText:value=>({width:Array.from(value).length*10})},{get:(target,key)=>key in target?target[key]:()=>{}});
 assert.equal(NFT_WIDTH,840);assert.equal(NFT_HEIGHT,924);
 drawBanPass(ctx,{tier:2,record});
 for(const value of ['Example Organization',record.uuid,record.plan,'2026-09-01 12:41:20','WEIGHT 3','Max'])assert.ok(text.some(row=>row[0]===value),value);
 text.length=0;drawBanPass(ctx,{tier:1,record:{...record,account:'😀'.repeat(33),plan:'claude_pro'}});
 assert.ok(text.some(row=>row[0]==='WEIGHT 1'));assert.ok(text.some(row=>row[0]==='😀'.repeat(32)));assert.ok(text.some(row=>row[0]==='😀'));
 assert.throws(()=>drawBanPass(ctx,{tier:3,record}),/invalid_provider_response/);
});
