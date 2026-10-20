import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createServer} from 'node:net';
import {readFileSync} from 'node:fs';
import {setTimeout as delay} from 'node:timers/promises';
import {JsonRpcProvider,Contract,ContractFactory,ZeroAddress,getCreateAddress} from 'ethers';

const artifact=name=>JSON.parse(readFileSync(new URL(`../artifacts/${name}.json`,import.meta.url)));
const policies=JSON.parse(readFileSync(new URL('../buyback-policy.json',import.meta.url)));
const mainnetPortal='0x90497450f2a706f1951b5bdda52B4E5d16f34C06';
const testnetPortal='0x027e3704fC5C16522e9393d04C60A3ac5c0d775f';

for(const chainId of [56,97,31337,1])test(`buyback deployment and factory permissions on chain ${chainId}`,async()=>{
  const reservation=createServer();reservation.listen(0,'127.0.0.1');await once(reservation,'listening');
  const port=reservation.address().port;await new Promise(resolve=>reservation.close(resolve));
  const node=spawn(process.env.ANVIL_BIN||'anvil',['--host','127.0.0.1','--port',String(port),'--chain-id',String(chainId),'--silent'],{stdio:'ignore'});
  let provider,startError;
  node.on('error',error=>{startError=error;});
  try {
    const url=`http://127.0.0.1:${port}`;
    for(let attempt=0;attempt<50;attempt++){
      if(startError)throw startError;
      try{await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_chainId',params:[]})});break;}
      catch{if(attempt===49)throw Error('Anvil is required for contract tests');await delay(100);}
    }
    provider=new JsonRpcProvider(url,chainId,{cacheTimeout:-1});provider.pollingInterval=50;
    const owner=await provider.getSigner(0),address=await owner.getAddress();
    const deploy=(name,...args)=>{const a=artifact(name);return new ContractFactory(a.abi,a.bytecode,owner).deploy(...args);};
    if(chainId===1){
      await assert.rejects(deploy('FlapBuyback',address,address),/Unsupported chain/);
      await assert.rejects(deploy('FlapBuybackFactory',address),/Unsupported chain/);
      return;
    }
    const factory=await deploy('FlapBuybackFactory',address);await factory.waitForDeployment();
    const expectedPortal=chainId===56?mainnetPortal:testnetPortal;
    assert.equal(await factory.vaultPortal(),expectedPortal);
    await assert.rejects(factory.newVault(address,ZeroAddress,address,'0x'),/VaultPortal required/);
    const otherPortal=chainId===56?testnetPortal:mainnetPortal;
    const call={to:await factory.getAddress(),data:factory.interface.encodeFunctionData('newVault',[address,ZeroAddress,address,'0x'])};
    await assert.rejects(provider.call({...call,from:otherPortal}),/VaultPortal required/);
    await provider.send('anvil_impersonateAccount',[expectedPortal]);
    await provider.send('anvil_setBalance',[expectedPortal,'0xde0b6b3a7640000']);
    const hash=await provider.send('eth_sendTransaction',[{...call,from:expectedPortal,gas:'0x7a1200'}]);
    assert.equal((await provider.waitForTransaction(hash)).status,1);
    const vault=new Contract(getCreateAddress({from:await factory.getAddress(),nonce:1}),artifact('FlapBuyback').abi,owner);
    assert.notEqual(await provider.getCode(await vault.getAddress()),'0x');
    assert.equal(await vault.taxToken(),address);assert.equal(await vault.keeper(),address);
    const policy=policies[chainId===56?'56':'97'];
    assert.equal(await vault.MIN_BUYBACK_BALANCE(),BigInt(policy.minimum_wei));
    assert.equal(await vault.MAX_KEEPER_GAS_REFUND(),BigInt(policy.max_gas_refund_wei));
    if(chainId!==31337){
      assert.equal(await vault.portal(),chainId===56?'0xe2cE6ab80874Fa9Fa2aAE65D277Dd6B8e65C9De0':'0x5bEacaF7ABCbB3aB280e80D007FD31fcE26510e9');
      const guardian=chainId===56?'0x9e27098dcD8844bcc6287a557E0b4D09C86B8a4b':'0x76Fa8C526f8Bc27ba6958B76DeEf92a0dbE46950';
      const data=vault.interface.encodeFunctionData('execute',[1,1,1]);
      await assert.rejects(provider.call({to:await vault.getAddress(),from:guardian,data}),/Too early/);
    }
    if(chainId===56){
      await assert.rejects(deploy('ClaudeTestToken',address),/Testnet only/);
      await assert.rejects(deploy('TestDeployment'),/Testnet only/);
    }
  } finally {provider?.destroy();node.kill('SIGTERM');}
});
