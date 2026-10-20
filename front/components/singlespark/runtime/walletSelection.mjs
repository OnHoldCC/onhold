// Adapted from SingleSparkFront EVM wallet runtime; see README.md.
import { SUPPORTED_WALLETS } from "./walletMetadata.mjs";
const WALLET_SELECTION_KEY = "onhold.wallet.provider.v1";
function walletStorage(kind) {
  try {
    return typeof window === "undefined" ? null : window[kind];
  } catch {
    return null;
  }
}
function isWalletKind(value) {
  return typeof value === "string" && SUPPORTED_WALLETS.includes(value);
}
function readStoredWalletSelection() {
  try {
    const parsed = JSON.parse(walletStorage("localStorage")?.getItem(WALLET_SELECTION_KEY) ?? walletStorage("sessionStorage")?.getItem(WALLET_SELECTION_KEY) ?? "null");
    if (!parsed || !isWalletKind(parsed.kind)) return null;
    return {
      kind: parsed.kind,
      rdns: typeof parsed.rdns === "string" ? parsed.rdns.trim().toLowerCase() || void 0 : void 0
    };
  } catch {
    return null;
  }
}
export {
  WALLET_SELECTION_KEY,
  readStoredWalletSelection,
  walletStorage
};
