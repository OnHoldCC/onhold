# SingleSpark wallet runtime

Vendored from SingleSparkFront/front/chains/evm/{injected,walletSelection}.ts and front/utils/walletMetadata.ts, revision 55ae5885d8e4d51b9b0c27cba311a61e18488ea8 (2026-10-20 working tree).

Reuses EIP-6963 discovery, wallet-specific provider selection, safe icon filtering, per-provider connection deduplication, busy-wallet recovery, selected-wallet persistence and event subscriptions. No dependency on the neighboring checkout at build/runtime.

Host adaptations: onhold storage namespace; legacy unbranded browser-wallet option; validate account/chain responses; keep chain configuration, balances and business authentication in onhold. SingleSpark's ARC/Solana/backend login configuration is intentionally excluded.

WalletIcon.jsx reuses SingleSparkFront's EIP-6963-first brand icon binding with self-contained SVG snapshots of its existing @web3icons/react vectors. WalletButton and WalletStatus distribution entries/types add an optional walletIcon slot; no icon argument preserves the upstream behavior.

The host also discovers dedicated OKX (`window.okxwallet`) and Binance (`window.BinanceChain` / `window.binancew3w.ethereum`) providers alongside EIP-6963 and `window.ethereum`, deduplicating by provider identity. No account request is sent until the user chooses a wallet.
