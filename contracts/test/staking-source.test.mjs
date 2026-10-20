import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('StakingRewards upstream source and license are pinned; the NFT contract uses its fork',()=>{
  const source=read('staking/upstream/StakingRewards.sol');
  assert.equal(createHash('sha256').update(source).digest('hex'),'9ee4170a863a159ca57fbb99b350a017babbf4db2e6b5cb6fa2e75d7230f0243');
  assert.match(read('staking/upstream/LICENSE'),/Copyright \(c\) 2019 Synthetix/);
  const payment=source.slice(source.indexOf('    function getReward()'),source.indexOf('    function exit()'));
  const fork=read('staking/StakingRewards.sol');
  assert.ok(fork.includes(payment.replace('            rewardsToken.safeTransfer(msg.sender, reward);','            _afterRewardPaid(msg.sender, reward);\n            rewardsToken.safeTransfer(msg.sender, reward);')));
  const nft=read('OnholdPassMining.sol');assert.match(nft,/Ownable, StakingRewards, EIP712/);
  assert.doesNotMatch(nft,/rewardPerWeight|rewardPaid|\b_settle\b|mapping\(address => uint256\) private accrued;/);
});
