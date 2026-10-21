import test from 'node:test';import assert from 'node:assert/strict';
import {approveNftStake} from '../src/nft-approval.mjs';
const wallet='0x'+'1'.repeat(40),vault='0x'+'2'.repeat(40),referrer='0x'+'3'.repeat(40),zero='0x'+'0'.repeat(40);
function fixture(){const calls=[];let bound=false,approved=zero;return {calls,nft:{referralBound:async()=>bound,referrerOf:async()=>referrer,bindReferrer:async value=>{calls.push(['bind',value]);bound=true;return {wait:async()=>calls.push(['bound'])};},getApproved:async()=>approved,isApprovedForAll:async()=>false,approve:async(to,id)=>{calls.push(['approve',to,id]);approved=to;return {wait:async()=>calls.push(['approved'])};}}};}
test('staking binds referral once and approves only the selected NFT; repeat use sends nothing',async()=>{
 const {nft,calls}=fixture();let checks=0;await approveNftStake(nft,vault,wallet,'7',referrer,async()=>{checks++;});
 assert.deepEqual(calls,[['bind',referrer],['bound'],['approve',vault,'7'],['approved']]);assert.equal(checks,3);
 calls.length=0;await approveNftStake(nft,vault,wallet,'7',referrer,async()=>{});assert.deepEqual(calls,[]);
});
test('invalid referral and an account change cannot grant NFT approval',async()=>{
 const {nft,calls}=fixture();await assert.rejects(approveNftStake(nft,vault,wallet,'7','bad',async()=>{}),/referral_binding_required/);assert.deepEqual(calls,[]);
 await assert.rejects(approveNftStake(nft,vault,wallet,'7',referrer,async()=>{throw Error('wallet_changed');}),/wallet_changed/);assert.deepEqual(calls,[]);
 nft.referralBound=async()=>true;nft.referrerOf=async()=>zero;await assert.rejects(approveNftStake(nft,vault,wallet,'7',referrer,async()=>{}),/referrer_already_bound/);assert.deepEqual(calls,[]);
});
