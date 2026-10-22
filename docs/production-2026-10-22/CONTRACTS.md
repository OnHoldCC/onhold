# Mainnet contract deployment

User-selected roles on BNB Smart Chain, chain ID 56:

| Role | Address | Gas |
| --- | --- | --- |
| Deployer, owner and advertising keeper | `0xD614169363e1381D8A2FD092C1E16FA80aE3eC96` | BNB |
| NFT proof verifier | `0x1f6C08E2CB3192a9bfB37864f2950Fe97004299d` | None for message signing |

The verifier is separate from the administrator. Running the advertising keeper automatically still requires the administrator wallet's private key. Keep the advertising keeper stopped while this wallet deploys or performs initialization transactions.

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
