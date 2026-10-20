# Flap interfaces

VaultBase, VaultBaseV2, VaultBaseV3 and IVaultSchemasV1 copied unchanged from [FlapVaultExample](https://github.com/flap-sh/FlapVaultExample/tree/5949cc7eb99bcb5ac5f679cc710ae456e627f12a/src/flap), commit `5949cc7eb99bcb5ac5f679cc710ae456e627f12a`. Copyright The Flap Team; MIT as declared in each source header.

`FlapBuyback.sol` uses the exact ABI subset `IPortalTradeV2.ExactInputParams` / `swapExactInput` and the normalized `LaunchValidationDataV1` fields from that same commit. Its factory implements the supported v2.2 interface; computed dividend tokens are not used. The same source supports BNB mainnet (56), testnet (97), and local tests (31337); live Flap integration has not yet been verified.

The factory selects the BNB mainnet or testnet VaultPortal by chain ID (local tests use the testnet identity). Addresses were checked against [Flap's deployed contract addresses](https://docs.flap.sh/flap/developers/deployed-contract-addresses) on 2026-10-20. The pinned upstream Portal and Guardian selectors are unchanged.

Keeper and settlement ABIs use `IFlapTaxTokenV3.taxProcessor()` and `ITaxProcessor.{taxToken,marketAddress,getQuoteToken,weth,feeConfig,marketQuoteBalance,dispatch}` from the same pinned official commit. `dispatch()` transfers the marketing/vault bucket directly to its configured beneficiary; it is not a dividend claim or a transfer through the keeper.
