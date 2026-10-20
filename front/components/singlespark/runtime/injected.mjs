// Adapted from SingleSparkFront EVM wallet runtime; see README.md.
import { SUPPORTED_WALLETS, safeInjectedWalletIcon } from "./walletMetadata.mjs";
import { readStoredWalletSelection, walletStorage as storageSafe, WALLET_SELECTION_KEY } from "./walletSelection.mjs";
import { readStoredWalletSelection as readStoredWalletSelection2 } from "./walletSelection.mjs";
const WALLET_RDNS = {
  MetaMask: ["io.metamask", "io.metamask.flask"],
  "OKX Wallet": ["com.okex.wallet", "com.okx.wallet"],
  "Binance Wallet": ["com.binance.wallet", "com.binance"],
  "Coinbase Wallet": ["com.coinbase.wallet"]
};
const announcedProviders = /* @__PURE__ */ new Map();
const discoveryListeners = /* @__PURE__ */ new Set();
let discoveryStarted = false;
let activeWallet = null;
function normalizeRdns(value) {
  const normalized = value?.trim().toLowerCase();
  return normalized || void 0;
}
function kindFromRdns(rdns) {
  const normalized = normalizeRdns(rdns);
  if (!normalized) return null;
  for (const kind of SUPPORTED_WALLETS) {
    if (WALLET_RDNS[kind]?.includes(normalized)) return kind;
  }
  return null;
}
function kindFromFlags(provider) {
  if (provider.isOkxWallet || provider.isOKExWallet) return "OKX Wallet";
  if (provider.isBinance || provider.isBinanceWallet || provider.isBinanceChain) return "Binance Wallet";
  if (provider.isCoinbaseWallet) return "Coinbase Wallet";
  if (provider.isMetaMask) return "MetaMask";
  return "Browser Wallet";
}
function validAnnouncement(detail) {
  return Boolean(
    detail?.provider && typeof detail.provider.request === "function" && detail.info && typeof detail.info.uuid === "string" && typeof detail.info.rdns === "string"
  );
}
function notifyDiscovery() {
  discoveryListeners.forEach((listener) => listener());
}
function onProviderAnnouncement(event) {
  const detail = event.detail;
  if (!validAnnouncement(detail)) return;
  const key = detail.info.uuid || `${detail.info.rdns}:${detail.info.name}`;
  const previous = announcedProviders.get(key);
  if (previous?.provider === detail.provider) return;
  announcedProviders.set(key, detail);
  notifyDiscovery();
}
function requestInjectedWallets() {
  if (typeof window === "undefined") return;
  if (!discoveryStarted) {
    window.addEventListener("eip6963:announceProvider", onProviderAnnouncement);
    discoveryStarted = true;
  }
  window.dispatchEvent(new Event("eip6963:requestProvider"));
  notifyDiscovery();
}
function subscribeInjectedWallets(listener) {
  discoveryListeners.add(listener);
  requestInjectedWallets();
  return () => discoveryListeners.delete(listener);
}
function legacyProviders() {
  if (typeof window === "undefined" || !window.ethereum) return [];
  const providers = Array.isArray(window.ethereum.providers) && window.ethereum.providers.length ? window.ethereum.providers : [window.ethereum];
  return providers.filter((provider) => typeof provider?.request === "function");
}
function listInjectedWallets() {
  if (typeof window === "undefined") return [];
  const result = [];
  const seenProviders = /* @__PURE__ */ new Set();
  for (const detail of announcedProviders.values()) {
    const kind = kindFromRdns(detail.info.rdns) ?? kindFromFlags(detail.provider);
    if (!kind || seenProviders.has(detail.provider)) continue;
    seenProviders.add(detail.provider);
    result.push({
      kind,
      provider: detail.provider,
      rdns: normalizeRdns(detail.info.rdns),
      name: detail.info.name,
      icon: safeInjectedWalletIcon(detail.info.icon)
    });
  }
  for (const provider of legacyProviders()) {
    if (seenProviders.has(provider)) continue;
    const kind = kindFromFlags(provider);
    if (!kind) continue;
    seenProviders.add(provider);
    result.push({ kind, provider });
  }
  return result;
}
function getInjectedForKind(kind) {
  return listInjectedWallets().find((wallet) => wallet.kind === kind) ?? null;
}
function findStoredInjectedWallet(selection = readStoredWalletSelection()) {
  if (!selection) return null;
  return listInjectedWallets().find((wallet) => wallet.kind === selection.kind && (!selection.rdns || wallet.rdns === normalizeRdns(selection.rdns))) ?? null;
}
function setActiveInjectedWallet(wallet, persist = true) {
  activeWallet = wallet;
  if (persist) {
    try {(storageSafe("localStorage") ?? storageSafe("sessionStorage"))?.setItem(WALLET_SELECTION_KEY, JSON.stringify({
      kind: wallet.kind,
      rdns: normalizeRdns(wallet.rdns)
    }));}catch{}
  }
}
function clearActiveInjectedWallet(clearStoredSelection = true) {
  activeWallet = null;
  if (clearStoredSelection) {
    for(const storage of [storageSafe("localStorage"),storageSafe("sessionStorage")])try{storage?.removeItem(WALLET_SELECTION_KEY);}catch{}
  }
}
function getActiveInjectedWallet() {
  return activeWallet;
}
function getInjected() {
  return activeWallet?.provider ?? null;
}
const WALLET_BUSY = -32002;
const BUSY_POLL_MS = 1500;
const BUSY_GIVE_UP_MS = 12e4;
const openConnections = /* @__PURE__ */ new WeakMap();
const isBusy = (error) => error?.code === WALLET_BUSY;
async function whenWalletIsFree(provider, ask, onPending) {
  let busy;
  try {
    return await ask();
  } catch (error) {
    if (!isBusy(error)) throw error;
    busy = error;
  }
  onPending?.();
  for (const started = Date.now(); Date.now() - started < BUSY_GIVE_UP_MS; ) {
    await new Promise((resolve) => setTimeout(resolve, BUSY_POLL_MS));
    const accounts = await provider.request({ method: "eth_accounts" }).catch(() => []);
    if (Array.isArray(accounts) && accounts.length > 0) return accounts;
    try {
      return await ask();
    } catch (error) {
      if (!isBusy(error)) throw error;
      busy = error;
    }
  }
  throw busy;
}
function connectInjected(provider, options = {}) {
  const open = openConnections.get(provider);
  if (open) return open;
  const connection = requestConnection(provider, options).finally(() => openConnections.delete(provider));
  openConnections.set(provider, connection);
  return connection;
}
async function requestConnection(provider, options) {
  if (options.requestAccountPermission) {
    try {
      await whenWalletIsFree(provider, () => provider.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }]
      }), options.onPending);
    } catch (error) {
      const code = error?.code;
      if (code !== -32601 && code !== 4200) throw error;
    }
  }
  const accounts = await whenWalletIsFree(
    provider,
    () => provider.request({ method: "eth_requestAccounts" }),
    options.onPending
  );
  if (!Array.isArray(accounts) || !/^0x[0-9a-fA-F]{40}$/.test(accounts[0] ?? "")) throw new Error("invalid wallet account");
  const address = accounts[0];
  const chainIdHex = await provider.request({ method: "eth_chainId" });
  if (typeof chainIdHex !== "string" || !/^0x[0-9a-f]+$/i.test(chainIdHex)) throw new Error("invalid wallet chain");
  const chainId = Number(chainIdHex);
  if (!Number.isSafeInteger(chainId) || chainId <= 0) throw new Error("wallet returned an invalid chain id");
  return { address, balanceEth: 0, chainId };
}
function subscribeWalletEvents(provider, handlers) {
  const onAccounts = (...args) => handlers.onAccountsChanged(args[0] ?? []);
  const onChain = (...args) => handlers.onChainChanged(args[0]);
  provider.on?.("accountsChanged", onAccounts);
  provider.on?.("chainChanged", onChain);
  return () => {
    provider.removeListener?.("accountsChanged", onAccounts);
    provider.removeListener?.("chainChanged", onChain);
  };
}
export {
  clearActiveInjectedWallet,
  connectInjected,
  findStoredInjectedWallet,
  getActiveInjectedWallet,
  getInjected,
  getInjectedForKind,
  listInjectedWallets,
  readStoredWalletSelection2 as readStoredWalletSelection,
  requestInjectedWallets,
  setActiveInjectedWallet,
  subscribeInjectedWallets,
  subscribeWalletEvents
};
