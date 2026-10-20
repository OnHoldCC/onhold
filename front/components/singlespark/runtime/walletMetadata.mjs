// Adapted from SingleSparkFront EVM wallet runtime; see README.md.
const SUPPORTED_WALLETS = [
  "MetaMask",
  "OKX Wallet",
  "Binance Wallet",
  "Coinbase Wallet",
  "Browser Wallet"
];
const SAFE_WALLET_ICON_DATA_URI = /^data:image\/(?:avif|bmp|gif|jpeg|png|svg\+xml|webp)(?:;[a-z0-9=.+-]+)*(?:;base64)?,/i;
const MAX_WALLET_ICON_URI_LENGTH = 256 * 1024;
function safeInjectedWalletIcon(value) {
  if (typeof value !== "string") return void 0;
  const icon = value.trim();
  if (!icon || icon.length > MAX_WALLET_ICON_URI_LENGTH || /[\u0000-\u001f\u007f]/.test(icon)) {
    return void 0;
  }
  return SAFE_WALLET_ICON_DATA_URI.test(icon) ? icon : void 0;
}
export {
  SUPPORTED_WALLETS,
  safeInjectedWalletIcon
};
