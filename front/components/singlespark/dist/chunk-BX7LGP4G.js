'use client';

// react/singlespark-assets.shared.tsx
var singleSparkChains = {
  bitcoin: {
    name: "Bitcoin",
    nativeSymbol: "BTC",
    icon: new URL("../assets/web3/networks-bitcoin.svg", import.meta.url).href
  },
  ethereum: {
    name: "Ethereum",
    nativeSymbol: "ETH",
    icon: new URL("../assets/web3/networks-ethereum.svg", import.meta.url).href
  },
  solana: {
    name: "Solana",
    nativeSymbol: "SOL",
    icon: new URL("../assets/web3/networks-solana.svg", import.meta.url).href
  },
  "binance-smart-chain": {
    name: "BNB Smart Chain",
    nativeSymbol: "BNB",
    icon: new URL(
      "../assets/web3/networks-binance-smart-chain.svg",
      import.meta.url
    ).href
  },
  base: {
    name: "Base",
    nativeSymbol: "ETH",
    icon: new URL("../assets/web3/networks-base.svg", import.meta.url).href
  },
  "arbitrum-one": {
    name: "Arbitrum One",
    nativeSymbol: "ETH",
    icon: new URL("../assets/web3/networks-arbitrum-one.svg", import.meta.url).href
  },
  optimism: {
    name: "OP Mainnet",
    nativeSymbol: "ETH",
    icon: new URL("../assets/web3/networks-optimism.svg", import.meta.url).href
  },
  avalanche: {
    name: "Avalanche",
    nativeSymbol: "AVAX",
    icon: new URL("../assets/web3/networks-avalanche.svg", import.meta.url).href
  },
  sui: {
    name: "Sui",
    nativeSymbol: "SUI",
    icon: new URL("../assets/web3/networks-sui.svg", import.meta.url).href
  }
};
var singleSparkTokenIcons = {
  BTC: new URL("../assets/web3/tokens-BTC.svg", import.meta.url).href,
  ETH: new URL("../assets/web3/tokens-ETH.svg", import.meta.url).href,
  SOL: new URL("../assets/web3/tokens-SOL.svg", import.meta.url).href,
  BNB: new URL("../assets/web3/tokens-BNB.svg", import.meta.url).href,
  AVAX: new URL("../assets/web3/tokens-AVAX.svg", import.meta.url).href,
  SUI: new URL("../assets/web3/tokens-SUI.svg", import.meta.url).href,
  USDC: new URL("../assets/web3/tokens-USDC.svg", import.meta.url).href,
  USDT: new URL("../assets/web3/tokens-USDT.svg", import.meta.url).href
};

// react/components/singlespark-assets/AssetImage.tsx
import { useState } from "react";
import { jsx } from "react/jsx-runtime";
function AssetImage({
  src,
  label,
  size
}) {
  const [failed, setFailed] = useState();
  return src && failed !== src ? /* @__PURE__ */ jsx(
    "img",
    {
      src,
      alt: "",
      width: size,
      height: size,
      onError: () => setFailed(src)
    }
  ) : /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "ss-asset-fallback", children: label.slice(0, 2).toUpperCase() || "?" });
}

// react/components/singlespark-assets/SingleSparkChainIcon.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
function SingleSparkChainIcon({
  chain = "solana",
  size = 24,
  className = ""
}) {
  const info = singleSparkChains[chain];
  const label = info?.name || String(chain);
  return /* @__PURE__ */ jsx2(
    "span",
    {
      className: `ss-asset-icon ss-network-icon ${className}`,
      "data-chain": chain,
      style: { width: size, height: size },
      role: "img",
      "aria-label": `${label} network`,
      title: `${label} network`,
      children: /* @__PURE__ */ jsx2(AssetImage, { src: info?.icon, label, size })
    }
  );
}

// react/components/singlespark-assets/SingleSparkTokenIcon.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
function SingleSparkTokenIcon({
  symbol = "SOL",
  src,
  size = 32,
  className = ""
}) {
  const icon = src || singleSparkTokenIcons[symbol.toUpperCase()];
  return /* @__PURE__ */ jsx3(
    "span",
    {
      className: `ss-asset-icon ss-token-icon ${className}`,
      "data-symbol": symbol.toUpperCase(),
      style: { width: size, height: size },
      role: "img",
      "aria-label": `${symbol} token`,
      title: symbol,
      children: /* @__PURE__ */ jsx3(AssetImage, { src: icon, label: symbol, size })
    }
  );
}

// react/components/singlespark-assets/SingleSparkTokenIdentity.tsx
import { jsx as jsx4, jsxs } from "react/jsx-runtime";
function SingleSparkTokenIdentity({
  token,
  size = 36,
  showNetwork = true,
  className = ""
}) {
  return /* @__PURE__ */ jsxs("span", { className: `ss-token-identity ${className}`, children: [
    /* @__PURE__ */ jsx4(
      SingleSparkTokenIcon,
      {
        symbol: token?.symbol || "?",
        src: token?.icon,
        size
      }
    ),
    /* @__PURE__ */ jsxs("span", { children: [
      /* @__PURE__ */ jsx4("strong", { children: token?.symbol || "Select token" }),
      /* @__PURE__ */ jsx4("small", { children: token?.name || "No token selected" })
    ] }),
    token && showNetwork && /* @__PURE__ */ jsxs("span", { className: "ss-token-network", children: [
      /* @__PURE__ */ jsx4(SingleSparkChainIcon, { chain: token.chain, size: 20 }),
      /* @__PURE__ */ jsx4("small", { children: singleSparkChains[token.chain]?.name || token.chain })
    ] })
  ] });
}

// react/components/singlespark-primitives/SingleSparkMoney.tsx
import { jsx as jsx5, jsxs as jsxs2 } from "react/jsx-runtime";
function SingleSparkMoney({
  value = 0,
  className = "",
  title,
  "aria-label": accessibleLabel
}) {
  const text = value == null || String(value).trim() === "" || ["\u2014", "\u2013", "-", "--"].includes(String(value)) || typeof value === "number" && !Number.isFinite(value) ? "0" : String(value);
  return /* @__PURE__ */ jsxs2(
    "span",
    {
      className: `singlespark-money ub-money ${className}`,
      "aria-label": accessibleLabel ?? text,
      title,
      children: [
        /* @__PURE__ */ jsx5("span", { className: "singlespark-sr-only", children: text }),
        [...text].map(
          (char, index) => /\d/.test(char) ? /* @__PURE__ */ jsx5("span", { className: "ub-digit", "aria-hidden": "true", children: /* @__PURE__ */ jsx5(
            "span",
            {
              style: {
                transform: `translateY(-${Number(char) * 10}%)`
              },
              children: Array.from({ length: 10 }, (_, digit) => /* @__PURE__ */ jsx5("span", { "data-char": digit }, digit))
            }
          ) }, text.length - index) : /* @__PURE__ */ jsx5("span", { "aria-hidden": "true", "data-char": char }, text.length - index)
        )
      ]
    }
  );
}

// react/components/singlespark-assets/SingleSparkAssetAmount.tsx
import { jsx as jsx6, jsxs as jsxs3 } from "react/jsx-runtime";
function SingleSparkAssetAmount({ amount, asset, displayAmount, title, iconSize = 14, iconClassName, className, style }) {
  return /* @__PURE__ */ jsxs3(
    "span",
    {
      className,
      style: { display: "inline-flex", alignItems: "center", gap: 5, verticalAlign: "middle", ...style },
      "aria-label": `${amount} ${asset.symbol}`,
      title,
      children: [
        /* @__PURE__ */ jsx6("span", { "aria-hidden": "true", children: displayAmount != null && typeof displayAmount !== "string" && typeof displayAmount !== "number" ? displayAmount : /* @__PURE__ */ jsx6(SingleSparkMoney, { value: displayAmount ?? amount }) }),
        /* @__PURE__ */ jsx6("span", { "aria-hidden": "true", children: /* @__PURE__ */ jsx6(SingleSparkTokenIcon, { symbol: asset.symbol, src: asset.icon, size: iconSize, className: iconClassName }) })
      ]
    }
  );
}

export {
  singleSparkChains,
  singleSparkTokenIcons,
  SingleSparkChainIcon,
  SingleSparkTokenIcon,
  SingleSparkTokenIdentity,
  SingleSparkMoney,
  SingleSparkAssetAmount
};
