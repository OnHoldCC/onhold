# singleSpark Web3 icon sources

Checked 2026-10-07. `sources.json` records the exact download URLs, archive entries and SHA-256 for all 17 SVGs. SVGs are rendered as external images; their internal styles/gradient IDs do not leak into the document.

## Official artwork (copied without changing paths or colors)

- Solana network / SOL: [Solana brand assets](https://solana.com/branding), official gradient logomark.
- Ethereum network: [Ethereum assets](https://ethereum.org/assets/), gray/black diamond displayed on a neutral light surface for both themes.
- ETH currency: the official purple diamond from the same brand kit, with the original PNG embedded byte for byte in a square SVG wrapper (verified 2026-10-11).
- Base network: [Base brand](https://brand.base.org/core-identifiers), current blue Square.
- OP Mainnet network: [Optimism brand](https://optimism.io/brand), **OP Mainnet** symbol, not the OP token logo.
- BNB Smart Chain network: [BNB Chain guidelines](https://www.bnbchain.org/en/brand-guidelines), yellow network symbol.
- USDC: [Circle pressroom](https://www.circle.com/pressroom), USDC Token Logo.
- USDT: [Tether media](https://tether.to/en/media/), official circular mark.

Official brand assets remain subject to their owners' brand terms; they are not covered by the community libraries' licenses. Their use identifies networks/assets and does not imply endorsement of singleSpark.

## Community artwork

- Bitcoin network / BTC and BNB token: [Cryptocurrency Icons](https://github.com/spothq/cryptocurrency-icons), `svg/color/btc.svg` / `svg/color/bnb.svg` (diamond token mark, separate from the BNB network cube). Its license is in `cryptocurrency-icons-LICENSE.md`.
- Avalanche / Sui network and token marks, Arbitrum One network: [Web3 Icons](https://github.com/0xa3k5/web3icons), `@web3icons/core` 4.0.58. `LICENSE` applies to these community SVGs only. The three networks use branded variants; the two tokens use background variants.

Chain identifiers and token symbols use independent registries and import paths. Shared artwork for a chain and its native asset is intentional (e.g. Solana / SOL); network and asset are different entities, not necessarily different brand drawings. Base, Arbitrum One and OP Mainnet use ETH as their native currency. Unknown token symbols fall back to initials; hosts should provide a trusted contract/mint-specific `src` for custom assets.
