---
name: onhold-agentic-wallet
description: Use Binance Agentic Wallet to stake an existing OnHold NFT, claim mining rewards, or unstake on BNB Smart Chain. Uses the official baw CLI and never requests private keys.
---

# OnHold with Binance Agentic Wallet

Work from this repository's root. This integration covers existing NFTs on BNB mainnet (56). It does not mint NFTs, transfer NFTs between wallets, trade tokens, or modify contracts. Users must first hold an eligible Pro/Max NFT in their Agentic Wallet; Free NFTs have zero mining weight.

## Setup

Install the official `@binance/agentic-wallet@1.11.0` CLI. The project also detects an installation under `.rainbond/tools/agentic-wallet/node_modules/.bin/baw` made with:

```sh
npm install --prefix .rainbond/tools/agentic-wallet --no-save --ignore-scripts @binance/agentic-wallet@1.11.0
```

Read the [official authentication instructions](https://github.com/binance/binance-skills-hub/blob/main/skills/binance-web3/binance-agentic-wallet/references/authentication.md) before connecting. Use `baw auth signin --json`, display the exact returned pairing code and URL, then keep `baw auth verify --qrCodeId ... --json` running until confirmation or expiry. Never display session tokens or credentials. The user enables Developer Mode in the Binance App; this project cannot change wallet security settings.

## Inspect

```sh
node scripts/agentic-wallet.mjs status
node scripts/agentic-wallet.mjs positions
```

Both commands are read-only. Positions include staked token IDs (first 20), reward balance, mining rewards, referral binding and BNB balance. If necessary, find owned NFT IDs through the site's `/api/nfts` endpoint with the wallet and market query parameters. The chain, not the API, decides ownership at preview time. Values ending in `Wei` are raw 18-decimal quantities; display them with the correct token name, full contract address and decimals.

## Stake an existing NFT

```sh
node scripts/agentic-wallet.mjs preview stake --token-id TOKEN_ID
```

If invitation binding is absent, ask the user to choose their referrer, then supply `--referrer ADDRESS`. A user explicitly choosing no inviter uses `0x0000000000000000000000000000000000000000`. Binding is permanent: never silently choose zero or replace the user's inviter.

The preview prepares exactly one next transaction: invitation binding, token-specific NFT approval, or staking. It never requests `setApprovalForAll`. Show the actual step, NFT ID, addresses, parsed transaction, simulation, risk warnings and any authority changes. After the user confirms that exact preview:

```sh
node scripts/agentic-wallet.mjs execute REQUEST_ID --confirm
node scripts/agentic-wallet.mjs receipt REQUEST_ID
```

Wait for three confirmations and the expected event. Then request a new stake preview to prepare the next prerequisite or the final stake. Never execute the same request again. If Binance returns `PENDING_CONFIRMATION`, the user confirms in the App; obtain the resulting transaction hash from the App/official wallet history and use `receipt REQUEST_ID --hash TX_HASH`.

## Claim and unstake

```sh
node scripts/agentic-wallet.mjs preview claim
node scripts/agentic-wallet.mjs preview unstake --token-id TOKEN_ID
```

Use the same preview → user confirmation → execute → receipt sequence. Rewards and unstaked NFTs return to the connected Agentic Wallet. Do not promise a fixed reward or claim success from a broadcast alone.

## Recovery and limits

Public transaction journals live privately under `.rainbond/agentic-wallet/`; authentication stays with the official CLI on the user's machine. Do not upload either directory to production or commit them. Mainnet contracts are pinned from `config/public-contracts.json`; there is no CLI override for destination, calldata or chain.

An interrupted execute remains unresolved and prevents another send. Verify the App/history and recover with the transaction hash. Do not delete its journal or retry execute to bypass this protection. A stale `execute.lock` after a process crash requires checking that no execute process remains before removing only that lock. If an App request was rejected and has no transaction hash, inspect its final rejection in the official wallet before manually resolving its journal; there is no automatic rejection-to-retry shortcut.

References: [contract calls](https://github.com/binance/binance-skills-hub/blob/main/skills/binance-web3/binance-agentic-wallet/references/external-sign.md), [wallet settings](https://github.com/binance/binance-skills-hub/blob/main/skills/binance-web3/binance-agentic-wallet/references/wallet-setting.md).
