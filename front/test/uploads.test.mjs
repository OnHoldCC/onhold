import test from 'node:test';
import assert from 'node:assert/strict';
import {resizeAvatar,uploadAvatar} from '../src/uploads.mjs';

test('avatar upload validates input before decoding or sending',async()=>{
 await assert.rejects(uploadAvatar(new File(['x'],'a.svg',{type:'image/svg+xml'})),/invalidImage/);
 await assert.rejects(uploadAvatar(new File([],'a.png',{type:'image/png'})),/tooLarge/);
});
test('avatar resizing preserves aspect ratio, bounds dimensions and releases decoded memory',async t=>{
 let closed=false,canvas;
 const previousBitmap=globalThis.createImageBitmap,previousDocument=globalThis.document;
 t.after(()=>{globalThis.createImageBitmap=previousBitmap;globalThis.document=previousDocument;});
 globalThis.createImageBitmap=async()=>({width:1600,height:800,close(){closed=true;}});
 globalThis.document={createElement:()=>canvas={getContext:()=>({drawImage(){}}),toBlob:done=>done(new Blob(['small'],{type:'image/webp'}))}};
 const original=new File(['x'.repeat(1000)],'a.png',{type:'image/png'}),small=await resizeAvatar(original);
 assert.equal(canvas.width,256);assert.equal(canvas.height,128);assert.equal(closed,true);assert.equal(small.type,'image/webp');assert.ok(small.size<original.size);
});
