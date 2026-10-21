import test from 'node:test';
import assert from 'node:assert/strict';
import {rememberReferral,referralMessage,bindWalletReferral} from '../src/referrals.mjs';
const wallet='0x2222222222222222222222222222222222222222',market='0x1111111111111111111111111111111111111111',referrer='0x3333333333333333333333333333333333333333',nonce='a'.repeat(32),origin='https://onhold.cc';
globalThis.location={origin};
const response=value=>({ok:true,json:async()=>value});
test('address-bar invitation survives navigation; invalid input cannot silently become no inviter',()=>{
 const data=new Map();const store={setItem:(k,v)=>data.set(k,v),getItem:k=>data.get(k)};
 assert.equal(rememberReferral('?ref=ABCDEF123456',store),'abcdef123456');assert.equal(rememberReferral('',store),'abcdef123456');
 assert.throws(()=>rememberReferral('?ref=changed',store),/invalid_referral_code/);assert.equal(rememberReferral('',store),'abcdef123456');
 assert.equal(rememberReferral('?ref=abcdef123456',{setItem(){throw Error();}}),'abcdef123456');
});
test('existing backend binding overrides new URL source without another signature',async()=>{
 const requests=[];globalThis.fetch=async(path,options)=>{requests.push({path,body:JSON.parse(options.body)});return response({bound:true,referrer,code:'abcdef123456'});};
 const provider={request:async()=>{throw Error('No wallet prompt permitted');}};
 assert.deepEqual(await bindWalletReferral(provider,wallet,'bbbbbb123456',market,()=>true),{referralBound:true,referralCode:'abcdef123456',referrer});assert.equal(requests.length,1);
});
test('first connection signs only the exact scoped binding, then submits nonce and signature',async()=>{
 const expires=Math.floor(Date.now()/1000)+600,requests=[],rpc=[];
 const quote={bound:false,referrer,nonce,expires_at:expires,message:referralMessage({origin,market,wallet,referrer,nonce,expiresAt:expires})};
 globalThis.fetch=async(path,options)=>{const body=JSON.parse(options.body);requests.push(body);return response(body.signature?{bound:true,referrer,code:'abcdef123456'}:quote);};
 const provider={request:async({method,params})=>{rpc.push(method);if(method==='eth_accounts')return[wallet];if(method==='eth_chainId')return '0x61';if(method==='personal_sign'){assert.equal(Buffer.from(params[0].slice(2),'hex').toString(),quote.message);assert.equal(params[1],wallet);return '0x'+'11'.repeat(65);}throw Error('Unexpected method '+method);}};
 assert.equal((await bindWalletReferral(provider,wallet,'abcdef123456',market,()=>true)).referralBound,true);
 assert.equal(rpc.filter(m=>m==='personal_sign').length,1);assert.ok(!rpc.includes('eth_sendTransaction'));assert.deepEqual(requests[1],{wallet,nonce,signature:'0x'+'11'.repeat(65)});
});
test('opening your own invite continues with a signed no-inviter binding',async()=>{
 const zero='0x0000000000000000000000000000000000000000',expires=Math.floor(Date.now()/1000)+600,requests=[];
 const quote={bound:false,referrer:zero,nonce,expires_at:expires,message:referralMessage({origin,market,wallet,referrer:zero,nonce,expiresAt:expires})};
 globalThis.fetch=async(path,options)=>{
  const body=JSON.parse(options.body);requests.push(body);
  if(body.referral_code)return {ok:false,json:async()=>({error:'self_referral'})};
  return response(body.signature?{bound:true,referrer:zero,code:null}:quote);
 };
 const provider={request:async({method,params})=>{
  if(method==='eth_accounts')return [wallet];if(method==='eth_chainId')return '0x61';
  if(method==='personal_sign'){assert.equal(Buffer.from(params[0].slice(2),'hex').toString(),quote.message);return '0x'+'11'.repeat(65);}
  throw Error('Unexpected method '+method);
 }};
 assert.deepEqual(await bindWalletReferral(provider,wallet,'abcdef123456',market,()=>true),{referralBound:true,referralCode:'',referrer:zero});
 assert.deepEqual(requests,[{wallet,referral_code:'abcdef123456'},{wallet,referral_code:null},{wallet,nonce,signature:'0x'+'11'.repeat(65)}]);
});
test('invalid invites and service errors never silently become no inviter',async()=>{
 const provider={request:async()=>{throw Error('No wallet prompt permitted');}};
 for(const code of ['invalid_referral_code','service_unavailable']){
  let calls=0;globalThis.fetch=async()=>{calls++;return {ok:false,json:async()=>({error:code})};};
  await assert.rejects(bindWalletReferral(provider,wallet,'abcdef123456',market,()=>true),cause=>cause.code===code);
  assert.equal(calls,1);
 }
});
test('automatic restoration never signs an unbound wallet; tampered, expired or cancelled challenges cannot sign',async()=>{
 let signed=0;const provider={request:async()=>{signed++;throw Error('should not sign');}};
 const expires=Math.floor(Date.now()/1000)+600;const quote={bound:false,referrer,nonce,expires_at:expires,message:referralMessage({origin,market,wallet,referrer,nonce,expiresAt:expires})};
 globalThis.fetch=async()=>response(quote);assert.equal(await bindWalletReferral(provider,wallet,'',market,()=>true,false),null);assert.equal(signed,0);
 globalThis.fetch=async()=>response({...quote,message:quote.message+' modified'});await assert.rejects(bindWalletReferral(provider,wallet,'',market,()=>true),/invalid_provider_response/);
 globalThis.fetch=async()=>response({...quote,expires_at:1});await assert.rejects(bindWalletReferral(provider,wallet,'',market,()=>true),/invalid_provider_response/);
 globalThis.fetch=async()=>response(quote);await assert.rejects(bindWalletReferral(provider,wallet,'',market,()=>false),/wallet_changed/);assert.equal(signed,0);
});
