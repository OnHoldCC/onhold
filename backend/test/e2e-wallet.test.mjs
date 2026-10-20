import test from 'node:test';
import assert from 'node:assert/strict';
import {Interface,parseEther} from 'ethers';
import {validateTestTransaction} from '../scripts/e2e-browser.mjs';
const market='0x1111111111111111111111111111111111111111',account='0x2222222222222222222222222222222222222222';
const iface=new Interface(['function getReward()','function bid(uint8,uint256,string,string,string,string[]) payable','function withdrawRevenue(address,uint256)']);
const context={market,account,role:'user',iface};
test('browser test wallet rejects mainnet, unrelated targets, admin calls and overspending',()=>{
 const tx={from:account,to:market,chainId:'0x61',data:iface.encodeFunctionData('getReward')};
 assert.equal(validateTestTransaction(tx,context).call.name,'getReward');
 for(const change of [{chainId:'0x38'},{to:account},{from:market},{value:'0x1'},{data:iface.encodeFunctionData('withdrawRevenue',[account,1])}])assert.throws(()=>validateTestTransaction({...tx,...change},context));
 const bid={...tx,data:iface.encodeFunctionData('bid',[0,0,'https://example.com','Mock','',[]]),value:parseEther('0.002')};
 assert.equal(validateTestTransaction(bid,context).value,parseEther('0.002'));
 assert.throws(()=>validateTestTransaction(bid,{...context,spent:parseEther('0.003')}));
 assert.throws(()=>validateTestTransaction(bid,{...context,role:'inviter'}));
});
