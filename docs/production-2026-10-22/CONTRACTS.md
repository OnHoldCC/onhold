# Mainnet contract deployment

User-selected roles on BNB Smart Chain, chain ID 56:

| Role | Address | Gas |
| --- | --- | --- |
| Deployer, owner and advertising keeper | `0xD614169363e1381D8A2FD092C1E16FA80aE3eC96` | BNB |
| NFT proof verifier | `0x1f6C08E2CB3192a9bfB37864f2950Fe97004299d` | None for message signing |

The verifier is separate from the administrator. Running the advertising keeper automatically still requires the administrator wallet's private key. Keep the advertising keeper stopped while this wallet deploys or performs initialization transactions.

The existing private key file is under ignored `backend/data/mainnet/keys.json`, mode 600. Never commit it or the signed deployment journal. Production API configuration remains in preparation mode; no signing key has been activated in the production API by this contract preparation.

Compile with `npm run contracts:build`. Run `node contracts/scripts/deploy-mainnet-nft.mjs` for a read-only balance and gas estimate. Append `--send` to deploy the fixed NFT once funded. The script requires chain 56, checks the two-wallet role layout, caps the NFT transaction budget at 0.005 BNB by default, journals the signed transaction before broadcast and verifies owner, verifier, protocol and renderer after three confirmations. It resumes that same deployment instead of creating another NFT. Do not delete a journal to recover from an interrupted transaction.

The 2026-10-22 preflight found an unfunded deployment wallet, nonce 0, and estimated 4,223,628 gas. At the observed 0.05 gwei, the gas-limit budget including 25% headroom was 0.00026397675 BNB. This is an estimate, not a fixed fee. Suggested initial gas funding is 0.005 BNB; it does not include a Flap token purchase.

No mainnet NFT deployment is recorded yet. This step does not launch a token, initialize a gameplay proxy, fund the mining pool or enable the website. A Flap initial buy and the original 10% mining allocation require a separate purchase budget before those transactions. Native Flap tax burn/LP does not use the legacy burn keeper.

`node --test contracts/test/deploy-mainnet-nft.test.mjs` verifies deployment and resume on a local chain-56 Anvil instance, separate verifier ownership, changed-argument rejection and key-chain protection. This is deployment tooling validation, not an independent contract audit.
