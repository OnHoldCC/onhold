# Mainnet contract deployment

Historical deployment roles on BNB Smart Chain, chain ID 56 (active verifier and ad keeper are superseded below):

| Role | Address | Gas |
| --- | --- | --- |
| Deployer, owner and advertising keeper | `0xD614169363e1381D8A2FD092C1E16FA80aE3eC96` | BNB |
| NFT proof verifier | `0x1f6C08E2CB3192a9bfB37864f2950Fe97004299d` | None for message signing |

The verifier is separate from the administrator. The original preparation used the administrator as advertising keeper. The current gameplay keeper is a separate wallet, listed below, and does not use the administrator private key.

The existing private key file is under ignored `backend/data/mainnet/keys.json`, mode 600. Never commit it or the signed deployment journal. Production API configuration remains in preparation mode; no signing key has been activated in the production API by this contract preparation.

Compile with `npm run contracts:build`. Run `node contracts/scripts/deploy-mainnet-nft.mjs` for a read-only balance and gas estimate. Append `--send` to deploy the fixed NFT once funded. The script requires chain 56, checks the two-wallet role layout, caps the NFT transaction budget at 0.005 BNB by default, journals the signed transaction before broadcast and verifies owner, verifier, protocol and renderer after three confirmations. It resumes that same deployment instead of creating another NFT. Do not delete a journal to recover from an interrupted transaction.

The 2026-10-22 deployment preflight confirmed 0.02 BNB, nonce 0 and no pending transactions. The NFT and its constructor-created renderer were deployed in transaction [`0x97661acf00103c2e89cd5d3f1a2f2a462814cad63877314cfdfe41ac43f9d44a`](https://bscscan.com/tx/0x97661acf00103c2e89cd5d3f1a2f2a462814cad63877314cfdfe41ac43f9d44a), block 129093703, after local contract/deployment checks passed (31 tests). Actual gas used was 4,189,213 at 0.05 gwei: **0.00020946065 BNB**. The wallet retained 0.01979053935 BNB immediately afterward.

| Mainnet contract | Address |
| --- | --- |
| Fixed NFT: Claude Code Ban Pass (CCBP) | [`0x930aebB5F91cdB219fE8C5178906e2e21a105E87`](https://bscscan.com/address/0x930aebB5F91cdB219fE8C5178906e2e21a105E87) |
| NFT renderer | [`0x7FFE16B57fbaC080b16A1b68e0c93dad850e46D9`](https://bscscan.com/address/0x7FFE16B57fbaC080b16A1b68e0c93dad850e46D9) |

The creation transaction matches the freshly compiled NFT plus its exact constructor arguments. Both runtime bytecodes match the compiled artifacts with immutable locations accounted for. Owner, verifier, renderer, protocol and the chain-56 EIP-712 domain were checked on-chain after at least three confirmations. No NFT was minted during deployment. Public addresses, bytecode hashes and source verification results are recorded in `contracts/deployments/bnb-mainnet-nft-20261022.json`; private keys and signed transaction journals remain ignored.

Both [NFT](https://repo.sourcify.dev/56/0x930aebB5F91cdB219fE8C5178906e2e21a105E87) and [renderer](https://repo.sourcify.dev/56/0x7FFE16B57fbaC080b16A1b68e0c93dad850e46D9) passed Sourcify exact creation/runtime matching. An independent PublicNode RPC also confirmed both runtime hashes and NFT permissions. Sourcify could not mirror verification to BscScan because its Etherscan submission allowance was exhausted for the day; BscScan source verification is not claimed.

The contract deployment did not itself launch a token, initialize a gameplay proxy, fund the mining pool or enable the website. The website was subsequently activated in NFT-only mode; see `REPORT.md`. A Flap initial buy and the original 10% mining allocation require a separate purchase budget before those transactions. Native Flap tax burn/LP does not use the legacy burn keeper.

`node --test contracts/test/deploy-mainnet-nft.test.mjs` verifies deployment and resume on a local chain-56 Anvil instance, separate verifier ownership, changed-argument rejection and key-chain protection. This is deployment tooling validation, not an independent contract audit.

## Verifier rotation during website activation

The original verifier was retired after an unredacted platform event payload included its private key in diagnostic output. No private key belongs in a public deployment record. Raw event bodies and environment values are now excluded from the local release diagnostic output. The NFT owner changed the verifier to `0xF9fDEad7F2442e9176d72Df56e62354CD70a42eA` in transaction `0x99f46c969aadfdb4a5c194083a11f37f5360818ae1f8127a9af449dcd319d957`, block 129100752, for 0.0000015146 BNB. The NFT address, renderer, owner and artwork remain unchanged. The old verifier can no longer authorize mints.

The active signing key is stored in ignored `.rainbond/secrets.prod.json`; the private recovery journal is `backend/data/mainnet/verifier-rotation.json`. The original deployment key file and transaction journal are historical constructor inputs, not the active signing configuration. Do not rerun the NFT deployment to change a verifier.

## Flap token and gameplay activation

The user launched OnHold on Flap in transaction `0xd430b9d466e2db2e6a6e073d6a98697773c86cfd9d84a2d25a14d5a276d67721`, block 129115315. Token `0x2dcde86543a9cc2c9a3dd914be3fd3afef6e7777` has 1 billion supply, 18 decimals and 3% buy/sell tax, with native deflation/liquidity each 50% of distributable tax revenue. This uses native Flap processing, with no legacy burn keeper. Public token inspection is recorded in `contracts/deployments/bnb-mainnet-token-20261022.json`.

Gameplay proxy [`0x69aF74A7d86E0466fCC533a6eadAb3C25008FDdF`](https://bscscan.com/address/0x69aF74A7d86E0466fCC533a6eadAb3C25008FDdF) was deployed at block 129129192 with atomic owner/NFT/token initialization. Implementation [`0x52Ae9177B1e86914bb99E111790380D4098D36fe`](https://bscscan.com/address/0x52Ae9177B1e86914bb99E111790380D4098D36fe) and proxy both passed Sourcify exact creation/runtime matching. The owner remains `0xD614169363e1381D8A2FD092C1E16FA80aE3eC96`; ad keeper is `0xb4d2C58C19B78803A7CFD05998f070b2ae569045`, funded with 0.001 BNB for gas only. Deployment gas: 0.0002217185 BNB. Public deployment transactions, bytecode hashes and source verification links are in `contracts/deployments/bnb-mainnet-gameplay-20261022.json`.

The pool remains unfunded and mining has not started. This deployment script refuses funding; it never transfers reward tokens. The existing implementation has no administrator ERC20 withdrawal; user NFT unstaking, base reward claims and referral claims remain available under their normal rules. A first positive-weight stake requires at least 100 million OnHold actually held by the Vault and starts the 365-day clock. The UUPS owner can authorize gameplay upgrades; NFT and reward-token asset addresses remain separate.

`node --test contracts/test/deploy-mainnet-gameplay.test.mjs` verifies dry run, atomic initialization, roles, unfunded balances, recovery/resume and changed-input rejection. Thirty contract integration tests pass. This is not an independent security audit.

## Initial mining funding

On explicit user authorization, transaction [`0x7a3f3d3946231ba5cabd7ce72c51a3a8fe048cbc568d72ba65a7cbe9fc4942da`](https://bscscan.com/tx/0x7a3f3d3946231ba5cabd7ce72c51a3a8fe048cbc568d72ba65a7cbe9fc4942da) transferred exactly 100,000,000 OnHold from the existing owner wallet to the gameplay proxy at block 129134776. Receipt status, exact Transfer event and both token balance deltas were checked after three confirmations. Actual fee: 0.00000618075 BNB. See `contracts/deployments/bnb-mainnet-mining-funding-20261022.json`. The pool is funded; mining still requires the first positive-weight NFT stake. No NFT transaction was sent. The earlier unfunded deployment description is historical.
