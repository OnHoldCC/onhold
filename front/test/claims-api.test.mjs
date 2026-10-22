import test from 'node:test';
import assert from 'node:assert/strict';
import {claimRequest,verifyRestriction,publicStatus,createInvite,extractSession,createNft} from '../src/claims-api.mjs';
const valid={artwork_ready:false,record:{account:'Example Organization',uuid:'11111111-1111-4111-8111-111111111111',bannedAt:'2026-09-01T12:41:20.292985Z',plan:'claude_pro'},verification_token:'a'.repeat(64),plan:'Pro',tier:1,standing:'restricted',minted:false,reserved:false,protocol:'nft-staking-v4',weight:1,banned_at:'2026-10-19',organization_suffix:'…1234',organization_name:'Sample Organization',ban_category:'other',expires_at:1800000000};
test('verification rejects inconsistent plan, protocol and NFT weight data',async t=>{
  t.after(()=>t.mock.restoreAll());
  let payload=valid;const calls=[];
  t.mock.method(globalThis,'fetch',async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify(payload),{status:200});});
  assert.deepEqual(await verifyRestriction(' sk-ant-sid'+'a'.repeat(40)+' '),valid);
  payload={...valid,plan:'Free',tier:0,weight:0,record:{...valid.record,plan:'free'}};assert.equal((await verifyRestriction('sk-ant-sid'+'a'.repeat(40))).weight,0);payload=valid;
  assert.equal(calls[0].url,'/api/verify');assert.deepEqual(JSON.parse(calls[0].options.body),{session_key:'sk-ant-sid'+'a'.repeat(40)});
  assert.equal(calls[0].options.credentials,'omit');assert.equal(calls[0].options.redirect,'error');
  for(const corrupt of [{image:'https://untrusted.example/x.png'},{artwork_ready:true},{tier:2},{weight:3},{protocol:'legacy-claims'},{protocol:'nft-staking-v3'},{minted:'false'},{reserved:null},{organization_name:123},{ban_category:[]} ,{plan:'Free'},{standing:'good'}]){payload={...valid,...corrupt};await assert.rejects(verifyRestriction('sk-ant-sid'+'a'.repeat(40)),/invalid_provider_response/);}
});
test('server errors remain explicit and missing status is not treated as configured',async t=>{
  t.after(()=>t.mock.restoreAll());
  t.mock.method(globalThis,'fetch',async()=>new Response(JSON.stringify({error:'session_expired'}),{status:401}));
  await assert.rejects(claimRequest('/api/verify',{}),error=>error.code==='session_expired');
  assert.equal(await publicStatus(),null);
});

test('invitations use a validated short code rather than a wallet URL',async t=>{
  t.after(()=>t.mock.restoreAll());let payload={code:'a7c29d4e8f31'};
  t.mock.method(globalThis,'fetch',async(url,options)=>{assert.equal(url,'/api/invites');assert.deepEqual(JSON.parse(options.body),{wallet:'0x'+'22'.repeat(20)});return new Response(JSON.stringify(payload),{status:200});});
  assert.equal(await createInvite('0x'+'22'.repeat(20)),'a7c29d4e8f31');
  payload={code:'0x'+'22'.repeat(20)};await assert.rejects(createInvite('0x'+'22'.repeat(20)),/invalid_provider_response/);
});

test('copied curl and cookie text are never executed or sent as a whole',()=>{
 const key='sk-ant-sid'+'a'.repeat(40);
 assert.equal(extractSession(`curl https://claude.ai/api/account/standing -b 'other=secret; sessionKey=${key}; extra=private'`),key);
 assert.equal(extractSession(`sessionKey=${key}`),key);
 assert.equal(extractSession(key),key);
 for(const bad of ['curl https://example.com','sk-ant-sidshort',`sessionKey=${key}; sessionKey=sk-ant-sid${'b'.repeat(40)}`,'x'.repeat(65537)])assert.throws(()=>extractSession(bad),/invalid_session/);
});

test('NFT creation submits PNG, wallet, short code and verification without client account facts',async t=>{
 t.after(()=>t.mock.restoreAll());const token='a'.repeat(64),image='https://gateway.pinata.cloud/ipfs/bafkreiein35d7u5u3ko4dd3zb5ckfdgkxqvoaeflpqncrpkcfxoeutg64e';let response={image,artwork_ready:true,message:'Verified mint authorization'};
 t.mock.method(globalThis,'fetch',async(path,options)=>{assert.equal(path,'/api/nft/create');assert.equal(options.credentials,'omit');assert.equal(options.headers,undefined);assert.deepEqual([...options.body.keys()],['verification_token','wallet','referral_code','file']);assert.equal(options.body.get('verification_token'),token);assert.equal(options.body.get('wallet'),'0x'+'22'.repeat(20));assert.equal(options.body.get('referral_code'),'a7c29d4e8f31');assert.equal(options.body.get('file').type,'image/png');return new Response(JSON.stringify(response));});
 assert.deepEqual(await createNft(token,new Blob(['png'],{type:'image/png'}),'0x'+'22'.repeat(20),'a7c29d4e8f31'),response);
 response={image:'https://untrusted.example/image',artwork_ready:true};await assert.rejects(createNft(token,new Blob(['png'],{type:'image/png'}),'0x'+'22'.repeat(20),'a7c29d4e8f31'),/invalid_provider_response/);
 await assert.rejects(createNft(token,new Blob(['svg'],{type:'image/svg+xml'})),/invalid_nft_image/);
});


test('ineligible accounts expose only the validated parsed details and never advance to minting',async t=>{
 const details={standing:'bad_standing',previous_plan:'free',banned_at:'2026-09-01T00:00:00Z',ban_category:null,organizations:[{name:'Example account',uuid:'f40c6c60-10ea-4c0b-8a79-c98e4cd102e9'}]};
 let payload={error:'unsupported_plan',eligible:false,details};
 t.mock.method(globalThis,'fetch',async()=>Response.json(payload,{status:422}));
 await assert.rejects(verifyRestriction('sk-ant-sid'+'a'.repeat(40)),cause=>cause.code==='unsupported_plan'&&cause.details.previous_plan==='free'&&!cause.details.verification_token);
 payload={...payload,details:{...details,organizations:[{name:'x'.repeat(161),uuid:null}]}};
 await assert.rejects(verifyRestriction('sk-ant-sid'+'a'.repeat(40)),cause=>cause.code==='unsupported_plan'&&cause.details===undefined);
});

test('claim service status recovers after a failed first request and stops on unmount',async t=>{
 const {watchPublicStatus}=await import('../src/claims-api.mjs');
 const previous=globalThis.document;globalThis.document=new EventTarget();let stop=()=>{};
 t.after(()=>{stop();if(previous===undefined)delete globalThis.document;else globalThis.document=previous;});
 t.mock.timers.enable({apis:['setInterval']});
 let healthy=false,calls=0;const values=[],status={chain_id:97,protocol:'nft-staking-v4',market:'0x'+'11'.repeat(20)};
 t.mock.method(globalThis,'fetch',async path=>{assert.equal(path,'/api/status');calls++;return healthy?Response.json(status):new Response('',{status:503});});
 stop=watchPublicStatus(value=>values.push(value));
 await new Promise(setImmediate);assert.deepEqual(values,[null]);healthy=true;
 t.mock.timers.tick(15000);await new Promise(setImmediate);assert.deepEqual(values,[null,status]);
 document.dispatchEvent(new Event('visibilitychange'));await new Promise(setImmediate);assert.equal(calls,3);
 stop();t.mock.timers.tick(15000);document.dispatchEvent(new Event('visibilitychange'));await new Promise(setImmediate);assert.equal(calls,3);
});

test('status refreshes do not overlap or update an unmounted page',async t=>{
 const {watchPublicStatus}=await import('../src/claims-api.mjs');
 const previous=globalThis.document;globalThis.document=new EventTarget();let stop=()=>{};
 t.after(()=>{stop();if(previous===undefined)delete globalThis.document;else globalThis.document=previous;});
 t.mock.timers.enable({apis:['setInterval']});let finish,calls=0;const values=[];
 t.mock.method(globalThis,'fetch',()=>{calls++;return new Promise(resolve=>finish=resolve);});
 stop=watchPublicStatus(value=>values.push(value));
 t.mock.timers.tick(30000);document.dispatchEvent(new Event('visibilitychange'));assert.equal(calls,1);stop();
 finish(Response.json({chain_id:97,protocol:'nft-staking-v4'}));await new Promise(setImmediate);assert.deepEqual(values,[]);
});
