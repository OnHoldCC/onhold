# StakingRewards source and adaptation

The legacy combined NFT/mining contract inherits `contracts/staking/StakingRewards.sol`, a Solidity 0.8 port of the actual Synthetix StakingRewards source. There is one reward ledger. The previous `OnholdPassMining` custom `rewardPerWeight/rewardPaid/accrued/_settle` ledger has been removed.

## Pinned upstream

- Official package: `synthetix@2.27.2`, fetched from https://registry.npmjs.org/synthetix/-/synthetix-2.27.2.tgz
- Package gitHead: `c24313b4824edd42a1ba37187f4cd839b286a4c7`
- Tarball integrity (verified before extraction): `sha512-JXTbIGGy6ItcrYfBTxRCrT+EA+ovcebiPFyZWDKqtodjpdLg/mieIBIxgW/FVoZNrqBMUw3PMPHJC4qeEBqLMQ==`
- Original contract: `package/contracts/StakingRewards.sol`, preserved byte-for-byte in `upstream/StakingRewards.sol`.
- Original contract SHA-256: `9ee4170a863a159ca57fbb99b350a017babbf4db2e6b5cb6fa2e75d7230f0243`.
- License: MIT, Copyright (c) 2019 Synthetix. Original `package/LICENSE` is preserved in `upstream/LICENSE`.
- Uniswap's related implementation identifies Synthetix v2.27.2 as its source: https://github.com/Uniswap/liquidity-staker

## Necessary changes

1. Port Solidity 0.5.16 to 0.8.24 and use the installed OpenZeppelin 5.4 SafeERC20 and ReentrancyGuard. Checked native arithmetic replaces SafeMath.
2. Keep the upstream `rewardPerTokenStored`, `userRewardPerTokenPaid`, `rewards`, `_balances`, `_totalSupply`, `rewardPerToken`, `earned`, `updateReward` and `getReward` flow. Pull-payment logic is unchanged except a referral/statistics hook before transfer. Checkpoint events expose the exact accumulator state for the read-only indexer.
3. NFT adapter owns custody and calls the upstream stake/withdraw balance updates internally. Weight getters are named `stakingWeightOf` / `totalStakingWeight`, so ERC721 `balanceOf` and `totalSupply` still mean NFT counts. There is no public deposit-by-amount function that could create unfunded weight.
4. Replace externally notified, constant-rate funding with a 100,000,000-token initial combined budget: `BASE_MINING_POOL=floor(MINING_POOL*100/115)`, with the remainder reserved for inviter rewards. The first funded stake starts the clock. The base budget releases uniformly over exactly 365 days (31,536,000 seconds), then stops. The cumulative release is capped at the base budget. Claiming does not unstake NFTs or reset this fixed window. `scheduledRelease(to)-scheduledRelease(from)` replaces the elapsed-time constant-rate term without a keeper or epoch loop. `rewardRate` is rounded down; accounting uses the exact cumulative integral. Ad-funded additions checkpoint the old accumulator, split actual purchased tokens into base/referral budgets, and append a linear emission segment over the original remaining window. Historical queries select the matching segment; latest rewards use the latest one. Funding never changes the end date or retroactively changes accrued rewards.
5. Keep 1e24 accumulator precision. Pro weight is 1 and Max 3, with no referral weight multiplier. On an invitee's actual base payout, the NFT adapter credits the inviter an additional 15% from the reserved budget. The inviter uses a separate guarded pull payment. Fractions carry across claims; no recursive referrals or additional base issuance exist.
6. Remove upstream owner/distributor functions to arbitrarily replace emission rates, change duration, pause and recover ERC20s. Only actual ad buybacks can add funded rewards over the remaining fixed duration. The NFT contract's existing owner role controls the verifier, ad keeper and withdrawals restricted to the 50% team share. Reward tokens cannot be withdrawn by the owner.
7. `getReward` retains upstream's zero-reward no-op behavior. Statistics/referral hooks track only actual accrual/payment. NFTs can be unstaked at any time; prior rewards remain payable. No-stake intervals are excluded from allocation, and rounding/skipped funds stay in the pool.

Protocol marker is `onhold.nft-staking.v4`; the frontend and backend reject older contracts, including v3 weekly-halving deployments. Existing deployed code and balances are not migrated. A fresh deployment is required. The fork has local integration tests; an upstream audit does not cover these adaptations.

## Separate gameplay Vault

`VaultRewards.sol` ports the same ledger to initializer-safe storage and OpenZeppelin 5.4 upgradeable reentrancy protection. It initializes the combined budgets explicitly, rejects non-18-decimal reward tokens, and is used only by `OnholdGameplayVault`. The legacy ledger remains unchanged for existing deployments. The standalone `OnholdNFT` has no reward-token or gameplay dependency. Gameplay upgrades must preserve storage, accrued rewards, NFT custody, and both asset bindings. UUPS upgrade authority is trusted: owner-only authorization cannot prevent a malicious owner from installing malicious logic. Use a reviewed multi-signature timelock owner before production.
