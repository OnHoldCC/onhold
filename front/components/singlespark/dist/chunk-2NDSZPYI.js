'use client';
import {
  NavigationIndicator
} from "./chunk-JAX6RWZ6.js";
import {
  SingleSparkBondingProgress,
  SingleSparkPriceChange,
  SingleSparkSparkline,
  SingleSparkStatCard,
  SingleSparkStatGrid,
  SingleSparkTradesTable
} from "./chunk-TBO6LKPX.js";
import {
  SingleSparkAccordion,
  SingleSparkButton,
  SingleSparkCopyButton,
  SingleSparkField,
  SingleSparkIconButton,
  SingleSparkKeyValueList,
  SingleSparkListRow,
  SingleSparkNotice,
  SingleSparkPagination,
  SingleSparkPanel,
  SingleSparkSearchInput,
  SingleSparkTabs
} from "./chunk-K6TMLM72.js";
import {
  SingleSparkLoading,
  SingleSparkSkeleton
} from "./chunk-V7OTFJLA.js";
import {
  singleSparkAssetUrls
} from "./chunk-C5AITWP6.js";
import {
  SingleSparkIcon
} from "./chunk-DRA3EEEB.js";
import {
  SingleSparkChainIcon,
  SingleSparkMoney,
  SingleSparkTokenIcon,
  SingleSparkTokenIdentity,
  singleSparkChains
} from "./chunk-BX7LGP4G.js";

// react/components/singlespark-modal/SingleSparkModal.tsx
import { useEffect, useId, useRef } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function SingleSparkModal({
  open = false,
  onOpenChange,
  title = "Dialog",
  children,
  footer,
  width = 480,
  closeOnBackdrop = true,
  className = ""
}) {
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    else if (!open && node.open) node.close();
    return () => {
      if (node.open) node.close();
    };
  }, [open]);
  const requestClose = () => onOpenChange?.(false);
  return /* @__PURE__ */ jsxs(
    "dialog",
    {
      ref: dialog,
      className: `singlespark-modal ${className}`,
      style: { "--ss-modal-width": `${width}px` },
      "aria-labelledby": titleId,
      onCancel: (event) => {
        event.preventDefault();
        requestClose();
      },
      onClick: (event) => {
        if (!closeOnBackdrop || event.target !== event.currentTarget) return;
        const box = event.currentTarget.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)
          requestClose();
      },
      children: [
        /* @__PURE__ */ jsxs("header", { className: "singlespark-modal-header", children: [
          /* @__PURE__ */ jsx("h2", { id: titleId, children: title }),
          /* @__PURE__ */ jsx(SingleSparkIconButton, { "aria-label": "Close dialog", onClick: requestClose, children: /* @__PURE__ */ jsx(SingleSparkIcon, { name: "close" }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "singlespark-modal-body", children }),
        footer && /* @__PURE__ */ jsx("footer", { className: "singlespark-modal-footer", children: footer })
      ]
    }
  );
}

// react/singlespark-wallet.shared.tsx
var walletImages = {
  "walletconnect.svg": new URL(
    "../assets/singlespark/home/walletconnect.svg",
    import.meta.url
  ).href,
  "metamask.svg": new URL(
    "../assets/singlespark/home/metamask.svg",
    import.meta.url
  ).href,
  "phantom.svg": new URL(
    "../assets/singlespark/home/phantom.svg",
    import.meta.url
  ).href,
  "jupiter-icon.ico": new URL(
    "../assets/singlespark/home/jupiter-icon.ico",
    import.meta.url
  ).href,
  "solflare.svg": new URL(
    "../assets/singlespark/home/solflare.svg",
    import.meta.url
  ).href,
  "backpack-icon.ico": new URL(
    "../assets/singlespark/home/backpack-icon.ico",
    import.meta.url
  ).href,
  "solana.svg": singleSparkChains.solana.icon,
  "ethereum.svg": singleSparkChains.ethereum.icon
};
var image = (src) => walletImages[src] || src;
var defaultWalletOptions = [
  { name: "WalletConnect", image: "walletconnect.svg", qrCode: true },
  {
    name: "MetaMask",
    image: "metamask.svg",
    networks: ["solana.svg", "ethereum.svg"]
  },
  { name: "Phantom", image: "phantom.svg" },
  { name: "Jupiter", image: "jupiter-icon.ico" },
  { name: "Solflare", image: "solflare.svg" },
  { name: "Backpack", image: "backpack-icon.ico" }
];

// react/components/singlespark-wallet/SingleSparkWalletButton.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function SingleSparkWalletButton({
  address,
  connecting = false,
  walletIcon,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs2(SingleSparkButton, { variant: "secondary", loading: connecting, ...props, children: [
    walletIcon || /* @__PURE__ */ jsx2(SingleSparkIcon, { name: "wallet" }),
    children || (address ? `${address.slice(0, 4)}\u2026${address.slice(-4)}` : "Connect wallet")
  ] });
}

// react/components/singlespark-wallet/SingleSparkWalletOption.tsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function SingleSparkWalletOption({
  wallet = defaultWalletOptions[2],
  selected = false,
  disabled = false,
  onSelect,
  className = ""
}) {
  return /* @__PURE__ */ jsxs3(
    "button",
    {
      type: "button",
      className: `singlespark-wallet-option ${className}`,
      onClick: () => onSelect?.(wallet),
      disabled,
      "aria-pressed": selected,
      children: [
        /* @__PURE__ */ jsx3("img", { src: image(wallet.image), alt: "", width: 32, height: 32 }),
        /* @__PURE__ */ jsxs3("span", { className: "singlespark-wallet-name", children: [
          wallet.name,
          wallet.networks && /* @__PURE__ */ jsx3("small", { children: wallet.networks.map((network) => /* @__PURE__ */ jsx3(
            "img",
            {
              src: image(network),
              alt: network.replace(/\.svg$/, ""),
              width: 12,
              height: 12
            },
            network
          )) })
        ] }),
        wallet.qrCode && /* @__PURE__ */ jsx3("span", { className: "singlespark-wallet-qr", children: "QR CODE" }),
        selected ? /* @__PURE__ */ jsx3(SingleSparkIcon, { name: "check" }) : /* @__PURE__ */ jsx3(SingleSparkIcon, { name: "right" })
      ]
    }
  );
}

// react/components/singlespark-wallet/SingleSparkWalletList.tsx
import { useState } from "react";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function SingleSparkWalletList({
  loading = false,
  wallets = defaultWalletOptions,
  selected,
  searchable = false,
  onSelect,
  className = ""
}) {
  const [query, setQuery] = useState("");
  const filtered = wallets.filter(
    (wallet) => wallet.name.toLowerCase().includes(query.trim().toLowerCase())
  );
  if (loading)
    return /* @__PURE__ */ jsx4(
      SingleSparkSkeleton,
      {
        variant: "wallet",
        label: "Loading wallets\u2026",
        className
      }
    );
  return /* @__PURE__ */ jsxs4("div", { className: `singlespark-wallet-list ${className}`, children: [
    searchable && /* @__PURE__ */ jsx4(
      SingleSparkSearchInput,
      {
        "aria-label": "Search wallet",
        placeholder: "Search wallet",
        value: query,
        onChange: (event) => setQuery(event.target.value)
      }
    ),
    /* @__PURE__ */ jsx4("ul", { children: filtered.map((wallet) => /* @__PURE__ */ jsx4("li", { children: /* @__PURE__ */ jsx4(
      SingleSparkWalletOption,
      {
        wallet,
        selected: selected === wallet.name,
        onSelect
      }
    ) }, wallet.name)) }),
    !filtered.length && /* @__PURE__ */ jsx4("p", { className: "singlespark-wallet-empty", role: "status", children: "No wallets found" })
  ] });
}

// react/components/singlespark-wallet/SingleSparkWalletStatus.tsx
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function SingleSparkWalletStatus({
  status = "disconnected",
  wallet = "Phantom",
  address,
  message,
  walletIcon,
  onDisconnect,
  onRetry,
  className = ""
}) {
  const labels = {
    disconnected: "Wallet not connected",
    connecting: `Connecting to ${wallet}\u2026`,
    connected: `${wallet} connected`,
    error: "Connection failed"
  };
  return /* @__PURE__ */ jsxs5(
    "div",
    {
      className: `singlespark-wallet-status ${className}`,
      "data-status": status,
      children: [
        /* @__PURE__ */ jsxs5("div", { role: "status", "aria-live": "polite", children: [
          /* @__PURE__ */ jsx5("span", { className: "singlespark-wallet-status-mark", children: walletIcon && status === "connected" ? walletIcon : status === "connecting" ? /* @__PURE__ */ jsx5(SingleSparkLoading, { size: 22, decorative: true }) : /* @__PURE__ */ jsx5(
            SingleSparkIcon,
            {
              name: status === "connected" ? "check" : status === "error" ? "close" : "wallet",
              size: 22
            }
          ) }),
          /* @__PURE__ */ jsx5("strong", { children: labels[status] }),
          address && /* @__PURE__ */ jsx5("code", { children: address }),
          message && /* @__PURE__ */ jsx5("p", { children: message })
        ] }),
        status === "connected" && onDisconnect && /* @__PURE__ */ jsx5(SingleSparkButton, { variant: "secondary", onClick: onDisconnect, children: "Disconnect" }),
        status === "error" && onRetry && /* @__PURE__ */ jsx5(SingleSparkButton, { variant: "primary", onClick: onRetry, children: "Try again" })
      ]
    }
  );
}

// react/components/singlespark-wallet/SingleSparkWalletDialog.tsx
import { useId as useId2, useState as useState2 } from "react";
import { Fragment, jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
function SingleSparkWalletDialog({
  className = "",
  open,
  wallets = defaultWalletOptions,
  presentation = "inline",
  onClose,
  onConnectWallet,
  onSearchWallet,
  onAction
} = {}) {
  const [internalOpen, setInternalOpen] = useState2(true);
  const [searching, setSearching] = useState2(false);
  const titleId = useId2();
  const visible = open ?? internalOpen;
  const close = () => {
    setInternalOpen(false);
    onClose?.();
  };
  const content = /* @__PURE__ */ jsxs6(Fragment, { children: [
    /* @__PURE__ */ jsx6(
      SingleSparkWalletList,
      {
        wallets,
        searchable: searching,
        onSelect: (wallet) => {
          if (onConnectWallet) onConnectWallet(wallet.name);
          else onAction?.("connect-wallet:" + wallet.name);
        }
      }
    ),
    !searching && /* @__PURE__ */ jsxs6(
      "button",
      {
        type: "button",
        className: "singlespark-wallet-search",
        onClick: () => {
          setSearching(true);
          onSearchWallet?.();
        },
        children: [
          /* @__PURE__ */ jsx6(SingleSparkIcon, { name: "search", size: 22 }),
          /* @__PURE__ */ jsx6("span", { children: "Search Wallet" }),
          /* @__PURE__ */ jsx6("small", { children: wallets.length }),
          /* @__PURE__ */ jsx6(SingleSparkIcon, { name: "right" })
        ]
      }
    )
  ] });
  if (presentation === "modal")
    return /* @__PURE__ */ jsx6(
      SingleSparkModal,
      {
        open: visible,
        onOpenChange: (next) => {
          if (!next) close();
        },
        title: "Connect Wallet",
        width: 368,
        className: `singlespark-wallet-dialog ${className}`,
        children: content
      }
    );
  if (!visible) return null;
  return /* @__PURE__ */ jsxs6(
    "section",
    {
      role: "dialog",
      "aria-labelledby": titleId,
      className: `singlespark-wallet-inline singlespark-wallet-dialog ${className}`,
      children: [
        /* @__PURE__ */ jsxs6("header", { className: "singlespark-modal-header", children: [
          /* @__PURE__ */ jsx6("h2", { id: titleId, children: "Connect Wallet" }),
          /* @__PURE__ */ jsx6(SingleSparkIconButton, { "aria-label": "Close wallet picker", onClick: close, children: /* @__PURE__ */ jsx6(SingleSparkIcon, { name: "close" }) })
        ] }),
        content
      ]
    }
  );
}

// react/singlespark-wallet.tsx
var singleSparkWalletComponents = {
  SingleSparkModal,
  SingleSparkWalletButton,
  SingleSparkWalletOption,
  SingleSparkWalletList,
  SingleSparkWalletStatus
};

// react/singlespark-home.shared.tsx
var assets = {
  "alon.jpg": new URL("../assets/singlespark/home/alon.jpg", import.meta.url).href,
  "apecat.jpg": new URL(
    "../assets/singlespark/home/apecat.jpg",
    import.meta.url
  ).href,
  "backpack-icon.ico": new URL(
    "../assets/singlespark/home/backpack-icon.ico",
    import.meta.url
  ).href,
  "blknoiz06.jpg": new URL(
    "../assets/singlespark/home/blknoiz06.jpg",
    import.meta.url
  ).href,
  "discord.svg": new URL(
    "../assets/singlespark/home/discord.svg",
    import.meta.url
  ).href,
  "ethereum.svg": new URL(
    "../assets/singlespark/home/ethereum.svg",
    import.meta.url
  ).href,
  "garrytan.jpg": new URL(
    "../assets/singlespark/home/garrytan.jpg",
    import.meta.url
  ).href,
  "jupiter-icon.ico": new URL(
    "../assets/singlespark/home/jupiter-icon.ico",
    import.meta.url
  ).href,
  "meadgod.jpg": new URL(
    "../assets/singlespark/home/meadgod.jpg",
    import.meta.url
  ).href,
  "metamask.svg": new URL(
    "../assets/singlespark/home/metamask.svg",
    import.meta.url
  ).href,
  "naval.jpg": new URL("../assets/singlespark/home/naval.jpg", import.meta.url).href,
  "nip.jpg": new URL("../assets/singlespark/home/nip.jpg", import.meta.url).href,
  "paperbag.jpg": new URL(
    "../assets/singlespark/home/paperbag.jpg",
    import.meta.url
  ).href,
  "phantom.svg": new URL(
    "../assets/singlespark/home/phantom.svg",
    import.meta.url
  ).href,
  "pump-logo.svg": new URL(
    "../assets/singlespark/home/pump-logo.svg",
    import.meta.url
  ).href,
  "pumplife.jpg": new URL(
    "../assets/singlespark/home/pumplife.jpg",
    import.meta.url
  ).href,
  "recipient-example.svg": new URL(
    "../assets/singlespark/home/recipient-example.svg",
    import.meta.url
  ).href,
  "reown.svg": new URL("../assets/singlespark/home/reown.svg", import.meta.url).href,
  "sama.jpg": new URL("../assets/singlespark/home/sama.jpg", import.meta.url).href,
  "solana.svg": new URL(
    "../assets/singlespark/home/solana.svg",
    import.meta.url
  ).href,
  "solflare.svg": new URL(
    "../assets/singlespark/home/solflare.svg",
    import.meta.url
  ).href,
  "stonkcat.jpg": new URL(
    "../assets/singlespark/home/stonkcat.jpg",
    import.meta.url
  ).href,
  "telegram.svg": new URL(
    "../assets/singlespark/home/telegram.svg",
    import.meta.url
  ).href,
  "underdog.jpg": new URL(
    "../assets/singlespark/home/underdog.jpg",
    import.meta.url
  ).href,
  "singlespark-logo.svg": new URL(
    "../assets/singlespark/home/singlespark-logo.svg",
    import.meta.url
  ).href,
  "vladforbes.jpg": new URL(
    "../assets/singlespark/home/vladforbes.jpg",
    import.meta.url
  ).href,
  "vladtenev.jpg": new URL(
    "../assets/singlespark/home/vladtenev.jpg",
    import.meta.url
  ).href,
  "walletconnect.svg": new URL(
    "../assets/singlespark/home/walletconnect.svg",
    import.meta.url
  ).href
};
var singleSparkNavigation = [
  { label: "Home", path: "/", component: "SingleSparkHero" },
  { label: "Explore", path: "/explore", component: "TokenCatalog" },
  { label: "Payments", path: "/payments", component: "PaymentSummary" },
  { label: "Claim Fees", path: "/claim", component: "ClaimSignIn" },
  { label: "Analytics", path: "/analytics", component: "AnalyticsCharts" },
  { label: "Launch", path: "/launch", component: "SingleSparkLaunchModes" },
  {
    label: "Capital Flow",
    path: "/capital-flow",
    component: "CapitalFlowSections"
  },
  { label: "Docs", path: "/docs", component: "DocsPreview" }
];
var defaultPreviewTokens = [
  {
    image: "vladforbes.jpg",
    avatar: "vladtenev.jpg",
    recipient: "Vlad Tenev",
    age: "18m",
    name: "Money Futurist",
    ticker: "FUTURIST",
    marketCap: "$412K",
    sent: "$5,055"
  },
  {
    image: "stonkcat.jpg",
    avatar: "blknoiz06.jpg",
    recipient: "Ansem",
    age: "11m",
    name: "STONKCAT",
    ticker: "STONKCAT",
    marketCap: "$100K",
    sent: "$1,470"
  },
  {
    image: "pumplife.jpg",
    avatar: "sama.jpg",
    recipient: "Sam Altman",
    age: "2d",
    name: "Pump Life",
    ticker: "PUMPLIFE",
    marketCap: "$3K",
    sent: "$2,265"
  },
  {
    image: "paperbag.jpg",
    avatar: "naval.jpg",
    recipient: "Naval",
    age: "48m",
    name: "Paperbag",
    ticker: "Paperbag",
    marketCap: "$174K",
    sent: "$2,025"
  },
  {
    image: "underdog.jpg",
    avatar: "alon.jpg",
    recipient: "Alon",
    age: "12m",
    name: "the underdog",
    ticker: "underdog",
    marketCap: "$3.6K",
    sent: "$180"
  },
  {
    image: "apecat.jpg",
    avatar: "garrytan.jpg",
    recipient: "Garry Tan",
    age: "3d",
    name: "apecat",
    ticker: "apecat",
    marketCap: "$3K",
    sent: "$3,720"
  },
  {
    image: "nip.jpg",
    avatar: "meadgod.jpg",
    recipient: "Ozzy Mead",
    age: "31m",
    name: "nip",
    ticker: "nip",
    marketCap: "$98K",
    sent: "$1,065"
  }
];
var defaultPayment = {
  amount: "Fees",
  recipient: "Recipient",
  status: "Not submitted",
  tokenImage: "recipient-example.svg",
  recipientImage: "recipient-example.svg"
};
var analyticsCurve = "M 0.00 41.42 Q 2.50 41.43 3.75 42.53 Q 5.00 43.63 6.25 45.50 Q 7.50 47.37 8.75 49.48 Q 10.00 51.60 11.25 53.38 Q 12.50 55.17 13.75 56.20 Q 15.00 57.23 16.25 57.37 Q 17.50 57.52 18.75 56.95 Q 20.00 56.39 21.25 55.53 Q 22.50 54.68 23.75 54.03 Q 25.00 53.38 26.25 53.33 Q 27.50 53.28 28.75 54.00 Q 30.00 54.71 31.25 56.10 Q 32.50 57.49 33.75 59.27 Q 35.00 61.05 36.25 62.89 Q 37.50 64.73 38.75 66.33 Q 40.00 67.92 41.25 69.10 Q 42.50 70.28 43.75 70.98 Q 45.00 71.68 46.25 71.89 Q 47.50 72.10 48.75 71.80 Q 50.00 71.51 51.25 70.65 Q 52.50 69.79 53.75 68.30 Q 55.00 66.81 56.25 64.68 Q 57.50 62.56 58.75 59.94 Q 60.00 57.32 61.25 54.51 Q 62.50 51.71 63.75 49.14 Q 65.00 46.58 66.25 44.71 Q 67.50 42.84 68.75 41.95 Q 70.00 41.07 71.25 41.23 Q 72.50 41.38 73.75 42.36 Q 75.00 43.33 76.25 44.68 Q 77.50 46.03 78.75 47.29 Q 80.00 48.55 81.25 49.37 Q 82.50 50.19 83.75 50.46 Q 85.00 50.74 86.25 50.62 Q 87.50 50.50 88.75 50.31 Q 90.00 50.12 91.25 50.16 Q 92.50 50.21 93.75 50.67 Q 95.00 51.12 96.25 51.94 Q 97.50 52.75 98.75 53.68 Q 100.00 54.61 101.25 55.35 Q 102.50 56.09 103.75 56.41 Q 105.00 56.73 106.25 56.59 Q 107.50 56.45 108.75 56.01 Q 110.00 55.57 111.25 55.10 Q 112.50 54.63 113.75 54.40 Q 115.00 54.16 116.25 54.27 Q 117.50 54.37 118.75 54.73 Q 120.00 55.10 121.25 55.50 Q 122.50 55.89 123.75 56.09 Q 125.00 56.28 126.25 56.15 Q 127.50 56.01 128.75 55.59 Q 130.00 55.18 131.25 54.70 Q 132.50 54.21 133.75 53.91 Q 135.00 53.61 136.25 53.63 Q 137.50 53.65 138.75 53.94 Q 140.00 54.24 141.25 54.55 Q 142.50 54.87 143.75 54.89 Q 145.00 54.91 146.25 54.41 Q 147.50 53.91 148.75 52.89 Q 150.00 51.86 151.25 50.59 Q 152.50 49.32 153.75 48.26 Q 155.00 47.19 156.25 46.76 Q 157.50 46.32 158.75 46.72 Q 160.00 47.12 161.25 48.21 Q 162.50 49.31 163.75 50.64 Q 165.00 51.96 166.25 52.92 Q 167.50 53.88 168.75 53.97 Q 170.00 54.05 171.25 53.06 Q 172.50 52.07 173.75 50.19 Q 175.00 48.32 176.25 46.05 Q 177.50 43.79 178.75 41.73 Q 180.00 39.67 181.25 38.27 Q 182.50 36.88 183.75 36.32 Q 185.00 35.76 186.25 35.93 Q 187.50 36.09 188.75 36.70 Q 190.00 37.31 191.25 38.13 Q 192.50 38.94 193.75 39.92 Q 195.00 40.90 196.25 42.24 Q 197.50 43.58 198.75 45.58 Q 200.00 47.58 201.25 50.43 Q 202.50 53.29 203.75 56.92 Q 205.00 60.55 206.25 64.51 Q 207.50 68.46 208.75 72.02 Q 210.00 75.58 211.25 78.01 Q 212.50 80.45 213.75 81.29 Q 215.00 82.14 216.25 81.39 Q 217.50 80.64 218.75 78.78 Q 220.00 76.92 221.25 74.74 Q 222.50 72.55 223.75 70.84 Q 225.00 69.12 226.25 68.38 Q 227.50 67.63 228.75 67.90 Q 230.00 68.16 231.25 69.04 Q 232.50 69.91 233.75 70.76 Q 235.00 71.61 236.25 71.83 Q 237.50 72.05 238.75 71.33 Q 240.00 70.60 241.25 68.98 Q 242.50 67.37 243.75 65.22 Q 245.00 63.08 246.25 60.89 Q 247.50 58.71 248.75 56.90 Q 250.00 55.09 251.25 53.86 Q 252.50 52.63 253.75 52.00 Q 255.00 51.36 256.25 51.20 Q 257.50 51.04 258.75 51.28 Q 260.00 51.53 261.25 52.19 Q 262.50 52.86 263.75 54.06 Q 265.00 55.27 266.25 57.11 Q 267.50 58.96 268.75 61.39 Q 270.00 63.82 271.25 66.56 Q 272.50 69.30 273.75 71.87 Q 275.00 74.45 276.25 76.33 Q 277.50 78.22 278.75 79.03 Q 280.00 79.84 281.25 79.50 Q 282.50 79.16 283.75 77.94 Q 285.00 76.72 286.25 75.11 Q 287.50 73.51 288.75 72.07 Q 290.00 70.63 291.25 69.74 Q 292.50 68.84 293.75 68.56 Q 295.00 68.28 296.25 68.39 Q 297.50 68.50 298.75 68.61 Q 300.00 68.73 301.25 68.51 Q 302.50 68.29 303.75 67.59 Q 305.00 66.89 306.25 65.84 Q 307.50 64.78 308.75 63.67 Q 310.00 62.57 311.25 61.75 Q 312.50 60.93 313.75 60.60 Q 315.00 60.27 316.25 60.40 Q 317.50 60.53 318.75 60.89 Q 320.00 61.25 321.25 61.54 Q 322.50 61.84 323.75 61.83 Q 325.00 61.82 326.25 61.48 Q 327.50 61.13 328.75 60.59 Q 330.00 60.06 331.25 59.58 Q 332.50 59.10 333.75 58.90 Q 335.00 58.70 336.25 58.83 Q 337.50 58.96 338.75 59.30 Q 340.00 59.64 341.25 59.94 Q 342.50 60.25 343.75 60.30 Q 345.00 60.35 346.25 60.07 Q 347.50 59.80 348.75 59.33 Q 350.00 58.85 351.25 58.47 Q 352.50 58.08 353.75 58.06 Q 355.00 58.05 356.25 58.57 Q 357.50 59.08 358.75 60.04 Q 360.00 61.00 361.25 62.08 Q 362.50 63.16 363.75 63.95 Q 365.00 64.73 366.25 64.88 Q 367.50 65.03 368.75 64.44 Q 370.00 63.85 371.25 62.70 Q 372.50 61.55 373.75 60.27 Q 375.00 59.00 376.25 58.10 Q 377.50 57.20 378.75 57.07 Q 380.00 56.94 381.25 57.72 Q 382.50 58.50 383.75 60.02 Q 385.00 61.55 386.25 63.46 Q 387.50 65.36 388.75 67.19 Q 390.00 69.02 391.25 70.40 Q 392.50 71.79 393.75 72.52 Q 395.00 73.24 396.25 73.28 Q 397.50 73.31 398.75 72.73 Q 400.00 72.14 401.25 71.03 Q 402.50 69.91 403.75 68.33 Q 405.00 66.74 406.25 64.72 Q 407.50 62.70 408.75 60.30 Q 410.00 57.91 411.25 55.30 Q 412.50 52.70 413.75 50.19 Q 415.00 47.68 416.25 45.67 Q 417.50 43.66 418.75 42.54 Q 420.00 41.42 421.25 41.43 Q 422.50 41.43 423.75 42.53 Q 425.00 43.63 426.25 45.50 Q 427.50 47.37 428.75 49.48 Q 430.00 51.60 431.25 53.38 Q 432.50 55.17 433.75 56.20 Q 435.00 57.23 436.25 57.37 Q 437.50 57.52 438.75 56.95 Q 440.00 56.39 441.25 55.53 Q 442.50 54.68 443.75 54.03 Q 445.00 53.38 446.25 53.33 Q 447.50 53.28 448.75 54.00 Q 450.00 54.71 451.25 56.10 Q 452.50 57.49 453.75 59.27 Q 455.00 61.05 456.25 62.89 Q 457.50 64.73 458.75 66.33 Q 460.00 67.92 461.25 69.10 Q 462.50 70.28 463.75 70.98 Q 465.00 71.68 466.25 71.89 Q 467.50 72.10 468.75 71.80 Q 470.00 71.51 471.25 70.65 Q 472.50 69.79 473.75 68.30 Q 475.00 66.81 476.25 64.68 Q 477.50 62.56 478.75 59.94 Q 480.00 57.32 481.25 54.51 Q 482.50 51.71 483.75 49.14 Q 485.00 46.58 486.25 44.71 Q 487.50 42.84 488.75 41.95 Q 490.00 41.07 491.25 41.23 Q 492.50 41.38 493.75 42.36 Q 495.00 43.33 496.25 44.68 Q 497.50 46.03 498.75 47.29 Q 500.00 48.55 501.25 49.37 Q 502.50 50.19 503.75 50.46 Q 505.00 50.74 506.25 50.62 Q 507.50 50.50 508.75 50.31 Q 510.00 50.12 511.25 50.16 Q 512.50 50.21 513.75 50.67 Q 515.00 51.12 516.25 51.94 Q 517.50 52.75 518.75 53.68 Q 520.00 54.61 521.25 55.35 Q 522.50 56.09 523.75 56.41 Q 525.00 56.73 526.25 56.59 Q 527.50 56.45 528.75 56.01 Q 530.00 55.57 531.25 55.10 Q 532.50 54.63 533.75 54.40 Q 535.00 54.16 536.25 54.27 Q 537.50 54.37 538.75 54.73 Q 540.00 55.10 541.25 55.50 Q 542.50 55.89 543.75 56.09 Q 545.00 56.28 546.25 56.15 Q 547.50 56.01 548.75 55.59 Q 550.00 55.18 551.25 54.70 Q 552.50 54.21 553.75 53.91 Q 555.00 53.61 556.25 53.63 Q 557.50 53.65 558.75 53.94 Q 560.00 54.24 561.25 54.55 Q 562.50 54.87 563.75 54.89 Q 565.00 54.91 566.25 54.41 Q 567.50 53.91 568.75 52.89 Q 570.00 51.86 571.25 50.59 Q 572.50 49.32 573.75 48.26 Q 575.00 47.19 576.25 46.76 Q 577.50 46.32 578.75 46.72 Q 580.00 47.12 581.25 48.21 Q 582.50 49.31 583.75 50.64 Q 585.00 51.96 586.25 52.92 Q 587.50 53.88 588.75 53.97 Q 590.00 54.05 591.25 53.06 Q 592.50 52.07 593.75 50.19 Q 595.00 48.32 596.25 46.05 Q 597.50 43.79 598.75 41.73 Q 600.00 39.67 601.25 38.27 Q 602.50 36.88 603.75 36.32 Q 605.00 35.76 606.25 35.93 Q 607.50 36.09 608.75 36.70 Q 610.00 37.31 611.25 38.13 Q 612.50 38.94 613.75 39.92 Q 615.00 40.90 616.25 42.24 Q 617.50 43.58 618.75 45.58 Q 620.00 47.58 621.25 50.43 Q 622.50 53.29 623.75 56.92 Q 625.00 60.55 626.25 64.51 Q 627.50 68.46 628.75 72.02 Q 630.00 75.58 631.25 78.01 Q 632.50 80.45 633.75 81.29 Q 635.00 82.14 636.25 81.39 Q 637.50 80.64 638.75 78.78 Q 640.00 76.92 641.25 74.74 Q 642.50 72.55 643.75 70.84 Q 645.00 69.12 646.25 68.38 Q 647.50 67.63 648.75 67.90 Q 650.00 68.16 651.25 69.04 Q 652.50 69.91 653.75 70.76 Q 655.00 71.61 656.25 71.83 Q 657.50 72.05 658.75 71.33 Q 660.00 70.60 661.25 68.98 Q 662.50 67.37 663.75 65.22 Q 665.00 63.08 666.25 60.89 Q 667.50 58.71 668.75 56.90 Q 670.00 55.09 671.25 53.86 Q 672.50 52.63 673.75 52.00 Q 675.00 51.36 676.25 51.20 Q 677.50 51.04 678.75 51.28 Q 680.00 51.53 681.25 52.19 Q 682.50 52.86 683.75 54.06 Q 685.00 55.27 686.25 57.11 Q 687.50 58.96 688.75 61.39 Q 690.00 63.82 691.25 66.56 Q 692.50 69.30 693.75 71.87 Q 695.00 74.45 696.25 76.33 Q 697.50 78.22 698.75 79.03 Q 700.00 79.84 701.25 79.50 Q 702.50 79.16 703.75 77.94 Q 705.00 76.72 706.25 75.11 Q 707.50 73.51 708.75 72.07 Q 710.00 70.63 711.25 69.74 Q 712.50 68.84 713.75 68.56 Q 715.00 68.28 716.25 68.39 Q 717.50 68.50 718.75 68.61 Q 720.00 68.73 721.25 68.51 Q 722.50 68.29 723.75 67.59 Q 725.00 66.89 726.25 65.84 Q 727.50 64.78 728.75 63.67 Q 730.00 62.57 731.25 61.75 Q 732.50 60.93 733.75 60.60 Q 735.00 60.27 736.25 60.40 Q 737.50 60.53 738.75 60.89 Q 740.00 61.25 741.25 61.54 Q 742.50 61.84 743.75 61.83 Q 745.00 61.82 746.25 61.48 Q 747.50 61.13 748.75 60.59 Q 750.00 60.06 751.25 59.58 Q 752.50 59.10 753.75 58.90 Q 755.00 58.70 756.25 58.83 Q 757.50 58.96 758.75 59.30 Q 760.00 59.64 761.25 59.94 Q 762.50 60.25 763.75 60.30 Q 765.00 60.35 766.25 60.07 Q 767.50 59.80 768.75 59.33 Q 770.00 58.85 771.25 58.47 Q 772.50 58.08 773.75 58.06 Q 775.00 58.05 776.25 58.57 Q 777.50 59.08 778.75 60.04 Q 780.00 61.00 781.25 62.08 Q 782.50 63.16 783.75 63.95 Q 785.00 64.73 786.25 64.88 Q 787.50 65.03 788.75 64.44 Q 790.00 63.85 791.25 62.70 Q 792.50 61.55 793.75 60.27 Q 795.00 59.00 796.25 58.10 Q 797.50 57.20 798.75 57.07 Q 800.00 56.94 801.25 57.72 Q 802.50 58.50 803.75 60.02 Q 805.00 61.55 806.25 63.46 Q 807.50 65.36 808.75 67.19 Q 810.00 69.02 811.25 70.40 Q 812.50 71.79 813.75 72.52 Q 815.00 73.24 816.25 73.28 Q 817.50 73.31 818.75 72.73 Q 820.00 72.14 821.25 71.03 Q 822.50 69.91 823.75 68.33 Q 825.00 66.74 826.25 64.72 Q 827.50 62.70 828.75 60.30 Q 830.00 57.91 831.25 55.30 Q 832.50 52.70 833.75 50.19 Q 835.00 47.68 836.25 45.67 Q 837.50 43.66 838.75 42.54 Q 840.00 41.42 841.25 41.43 Q 842.50 41.43 843.75 42.53 Q 845.00 43.63 846.25 45.50 Q 847.50 47.37 848.75 49.48 Q 850.00 51.60 851.25 53.38 Q 852.50 55.17 853.75 56.20 Q 855.00 57.23 856.25 57.37 Q 857.50 57.52 858.75 56.95 Q 860.00 56.39 861.25 55.53 Q 862.50 54.68 863.75 54.03 Q 865.00 53.38 866.25 53.33 Q 867.50 53.28 868.75 54.00 Q 870.00 54.71 871.25 56.10 Q 872.50 57.49 873.75 59.27 Q 875.00 61.05 876.25 62.89 Q 877.50 64.73 878.75 66.33 Q 880.00 67.92 881.25 69.10 Q 882.50 70.28 883.75 70.98 Q 885.00 71.68 886.25 71.89 Q 887.50 72.10 888.75 71.80 Q 890.00 71.51 891.25 70.65 Q 892.50 69.79 893.75 68.30 Q 895.00 66.81 896.25 64.68 Q 897.50 62.56 898.75 59.94 Q 900.00 57.32 901.25 54.51 Q 902.50 51.71 903.75 49.14 Q 905.00 46.58 906.25 44.71 Q 907.50 42.84 908.75 41.95 Q 910.00 41.07 911.25 41.23 Q 912.50 41.38 913.75 42.36 Q 915.00 43.33 916.25 44.68 Q 917.50 46.03 918.75 47.29 Q 920.00 48.55 921.25 49.37 Q 922.50 50.19 923.75 50.46 Q 925.00 50.74 926.25 50.62 Q 927.50 50.50 928.75 50.31 Q 930.00 50.12 931.25 50.16 Q 932.50 50.21 933.75 50.67 Q 935.00 51.12 936.25 51.94 Q 937.50 52.75 938.75 53.68 Q 940.00 54.61 941.25 55.35 Q 942.50 56.09 943.75 56.41 Q 945.00 56.73 946.25 56.59 Q 947.50 56.45 948.75 56.01 Q 950.00 55.57 951.25 55.10 Q 952.50 54.63 953.75 54.40 Q 955.00 54.16 956.25 54.27 Q 957.50 54.37 958.75 54.73 Q 960.00 55.10 961.25 55.50 Q 962.50 55.89 963.75 56.09 Q 965.00 56.28 966.25 56.15 Q 967.50 56.01 968.75 55.59 Q 970.00 55.18 971.25 54.70 Q 972.50 54.21 973.75 53.91 Q 975.00 53.61 976.25 53.63 Q 977.50 53.65 978.75 53.94 Q 980.00 54.24 981.25 54.55 Q 982.50 54.87 983.75 54.89 Q 985.00 54.91 986.25 54.41 Q 987.50 53.91 988.75 52.89 Q 990.00 51.86 991.25 50.59 Q 992.50 49.32 993.75 48.26 Q 995.00 47.19 996.25 46.76 Q 997.50 46.32 998.75 46.72 Q 1000.00 47.12 1001.25 48.21 Q 1002.50 49.31 1003.75 50.64 Q 1005.00 51.96 1006.25 52.92 Q 1007.50 53.88 1008.75 53.97 Q 1010.00 54.05 1011.25 53.06 Q 1012.50 52.07 1013.75 50.19 Q 1015.00 48.32 1016.25 46.05 Q 1017.50 43.79 1018.75 41.73 Q 1020.00 39.67 1021.25 38.27 Q 1022.50 36.88 1023.75 36.32 Q 1025.00 35.76 1026.25 35.93 Q 1027.50 36.09 1028.75 36.70 Q 1030.00 37.31 1031.25 38.13 Q 1032.50 38.94 1033.75 39.92 Q 1035.00 40.90 1036.25 42.24 Q 1037.50 43.58 1038.75 45.58 Q 1040.00 47.58 1041.25 50.43 Q 1042.50 53.29 1043.75 56.92 Q 1045.00 60.55 1046.25 64.51 Q 1047.50 68.46 1048.75 72.02 Q 1050.00 75.58 1051.25 78.01 Q 1052.50 80.45 1053.75 81.29 Q 1055.00 82.14 1056.25 81.39 Q 1057.50 80.64 1058.75 78.78 Q 1060.00 76.92 1061.25 74.74 Q 1062.50 72.55 1063.75 70.84 Q 1065.00 69.12 1066.25 68.38 Q 1067.50 67.63 1068.75 67.90 Q 1070.00 68.16 1071.25 69.04 Q 1072.50 69.91 1073.75 70.76 Q 1075.00 71.61 1076.25 71.83 Q 1077.50 72.05 1078.75 71.33 Q 1080.00 70.60 1081.25 68.98 Q 1082.50 67.37 1083.75 65.22 Q 1085.00 63.08 1086.25 60.89 Q 1087.50 58.71 1088.75 56.90 Q 1090.00 55.09 1091.25 53.86 Q 1092.50 52.63 1093.75 52.00 Q 1095.00 51.36 1096.25 51.20 Q 1097.50 51.04 1098.75 51.28 Q 1100.00 51.53 1101.25 52.19 Q 1102.50 52.86 1103.75 54.06 Q 1105.00 55.27 1106.25 57.11 Q 1107.50 58.96 1108.75 61.39 Q 1110.00 63.82 1111.25 66.56 Q 1112.50 69.30 1113.75 71.87 Q 1115.00 74.45 1116.25 76.33 Q 1117.50 78.22 1118.75 79.03 Q 1120.00 79.84 1121.25 79.50 Q 1122.50 79.16 1123.75 77.94 Q 1125.00 76.72 1126.25 75.11 Q 1127.50 73.51 1128.75 72.07 Q 1130.00 70.63 1131.25 69.74 Q 1132.50 68.84 1133.75 68.56 Q 1135.00 68.28 1136.25 68.39 Q 1137.50 68.50 1138.75 68.61 Q 1140.00 68.73 1141.25 68.51 Q 1142.50 68.29 1143.75 67.59 Q 1145.00 66.89 1146.25 65.84 Q 1147.50 64.78 1148.75 63.67 Q 1150.00 62.57 1151.25 61.75 Q 1152.50 60.93 1153.75 60.60 Q 1155.00 60.27 1156.25 60.40 Q 1157.50 60.53 1158.75 60.89 Q 1160.00 61.25 1161.25 61.54 Q 1162.50 61.84 1163.75 61.83 Q 1165.00 61.82 1166.25 61.48 Q 1167.50 61.13 1168.75 60.59 Q 1170.00 60.06 1171.25 59.58 Q 1172.50 59.10 1173.75 58.90 Q 1175.00 58.70 1176.25 58.83 Q 1177.50 58.96 1178.75 59.30 Q 1180.00 59.64 1181.25 59.94 Q 1182.50 60.25 1183.75 60.30 Q 1185.00 60.35 1186.25 60.07 Q 1187.50 59.80 1188.75 59.33 Q 1190.00 58.85 1191.25 58.47 Q 1192.50 58.08 1193.75 58.06 Q 1195.00 58.05 1196.25 58.57 Q 1197.50 59.08 1198.75 60.04 Q 1200.00 61.00 1201.25 62.08 Q 1202.50 63.16 1203.75 63.95 Q 1205.00 64.73 1206.25 64.88 Q 1207.50 65.03 1208.75 64.44 Q 1210.00 63.85 1211.25 62.70 Q 1212.50 61.55 1213.75 60.27 Q 1215.00 59.00 1216.25 58.10 Q 1217.50 57.20 1218.75 57.07 Q 1220.00 56.94 1221.25 57.72 Q 1222.50 58.50 1223.75 60.02 Q 1225.00 61.55 1226.25 63.46 Q 1227.50 65.36 1228.75 67.19 Q 1230.00 69.02 1231.25 70.40 Q 1232.50 71.79 1233.75 72.52 Q 1235.00 73.24 1236.25 73.28 Q 1237.50 73.31 1238.75 72.73 Q 1240.00 72.14 1241.25 71.03 Q 1242.50 69.91 1243.75 68.33 Q 1245.00 66.74 1246.25 64.72 Q 1247.50 62.70 1248.75 60.30 Q 1250.00 57.91 1251.25 55.30 Q 1252.50 52.70 1253.75 50.19 Q 1255.00 47.68 1256.25 45.67 Q 1257.50 43.66 1258.75 42.54 L 1260.00 41.42";
var defaultRecipient = {
  name: "Nova creator",
  handle: "nova",
  avatar: "recipient-example.svg"
};
var defaultFields = [
  ["0", "8", "discriminator"],
  ["11", "32", "token mint"],
  ["43", "32", "admin"],
  ["75", "1", "revoke flag"],
  ["76", "4", "shareholder count"],
  ["80", "N\xD740", "shareholders"]
].map(([offset, length, field]) => ({ offset, length, field }));

// react/components/singlespark-home/SingleSparkHero.tsx
import { Fragment as Fragment2 } from "react";

// react/components/singlespark-home/Root.tsx
import { jsx as jsx7 } from "react/jsx-runtime";
function Root({
  children,
  className = ""
}) {
  return /* @__PURE__ */ jsx7("div", { className: `u-home ${className}`.trim(), children });
}

// react/components/singlespark-home/NavigationLink.tsx
import { jsx as jsx8 } from "react/jsx-runtime";
function NavigationLink({
  path,
  component,
  onNavigate,
  className = "",
  children,
  current,
  label,
  local = false
}) {
  return /* @__PURE__ */ jsx8(
    "a",
    {
      className,
      href: local || path.startsWith("#") || /^https?:/.test(path) ? path : `https://usepaid.app${path}`,
      target: local || path.startsWith("#") ? void 0 : "_blank",
      rel: "noreferrer",
      "aria-current": current ? "page" : void 0,
      "aria-label": label,
      title: label,
      onClick: (event) => {
        if (onNavigate && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) {
          event.preventDefault();
          onNavigate(component, path);
        }
      },
      children
    }
  );
}

// react/components/singlespark-home/SingleSparkHero.tsx
import { jsx as jsx9, jsxs as jsxs7 } from "react/jsx-runtime";
function SingleSparkHero({
  className,
  claimHref = "/claim",
  launchHref = "/launch",
  onNavigate,
  title = "Direct creator fees to X accounts",
  description = "singleSpark routes each coin's creator fees to the X account it's launched for. The fees are held for that X user to claim.",
  claimLabel = "Claim fees",
  launchLabel = "Launch",
  local = false
} = {}) {
  return /* @__PURE__ */ jsx9(Root, { className, children: /* @__PURE__ */ jsxs7("section", { className: "uh-hero", children: [
    /* @__PURE__ */ jsx9("h1", { children: title.split(/\s+/).map((word, index) => /* @__PURE__ */ jsxs7(Fragment2, { children: [
      index > 0 && " ",
      /* @__PURE__ */ jsx9(
        "span",
        {
          style: { animationDelay: `${(index * 0.045).toFixed(3)}s` },
          children: word
        }
      )
    ] }, index)) }),
    description && /* @__PURE__ */ jsx9("p", { children: description }),
    /* @__PURE__ */ jsxs7("div", { className: "uh-hero-actions", children: [
      /* @__PURE__ */ jsx9(
        NavigationLink,
        {
          path: claimHref,
          local,
          component: "ClaimSignIn",
          onNavigate,
          className: "uh-button uh-button-primary",
          children: claimLabel
        }
      ),
      /* @__PURE__ */ jsx9(
        NavigationLink,
        {
          path: launchHref,
          local,
          component: "SingleSparkLaunchModes",
          onNavigate,
          className: "uh-button",
          children: launchLabel
        }
      )
    ] })
  ] }) });
}

// react/components/singlespark-home/Blur.tsx
import { jsx as jsx10 } from "react/jsx-runtime";
function Blur({ edge }) {
  return /* @__PURE__ */ jsx10("div", { className: `uh-blur uh-blur-${edge}`, "aria-hidden": "true", children: [
    [0.5, 0, 40],
    [1, 25, 60],
    [2, 50, 80]
  ].map(([blur, start, solid]) => /* @__PURE__ */ jsx10(
    "div",
    {
      style: {
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        maskImage: `linear-gradient(to ${edge},transparent ${start}%,#000 ${solid}%,#000 100%)`
      }
    },
    blur
  )) });
}

// react/components/singlespark-home/Feature.tsx
import { jsx as jsx11, jsxs as jsxs8 } from "react/jsx-runtime";
function Feature({
  title,
  children,
  wide = false,
  onNavigate,
  navigation,
  interactive = false
}) {
  const item = singleSparkNavigation.find((item2) => item2.label === title) ?? { label: title, path: "/globe", component: "SparkGlobe" };
  if (interactive) return /* @__PURE__ */ jsxs8("section", { className: `uh-feature uh-feature-interactive ${wide ? "uh-feature-wide" : ""}`, "aria-label": navigation?.label ?? title, children: [
    /* @__PURE__ */ jsx11("div", { className: "uh-feature-content", children }),
    /* @__PURE__ */ jsx11("div", { className: "uh-card-shine", "aria-hidden": "true" }),
    /* @__PURE__ */ jsxs8(
      NavigationLink,
      {
        ...item,
        path: navigation?.path ?? item.path,
        label: navigation?.label ?? title,
        local: true,
        onNavigate,
        className: "uh-card-label",
        children: [
          /* @__PURE__ */ jsx11("span", { children: navigation?.label ?? title }),
          /* @__PURE__ */ jsxs8("span", { children: [
            "Open ",
            /* @__PURE__ */ jsx11("b", { "aria-hidden": "true", children: "\u2192" })
          ] })
        ]
      }
    )
  ] });
  return /* @__PURE__ */ jsxs8(
    NavigationLink,
    {
      ...item,
      path: navigation?.path ?? item.path,
      label: navigation?.label ?? title,
      local: !!navigation,
      onNavigate,
      className: `uh-feature ${wide ? "uh-feature-wide" : ""}`,
      children: [
        /* @__PURE__ */ jsx11("div", { className: "uh-feature-scene", "aria-hidden": "true", children }),
        /* @__PURE__ */ jsx11(Blur, { edge: "bottom" }),
        /* @__PURE__ */ jsx11("div", { className: "uh-card-fade" }),
        /* @__PURE__ */ jsx11("div", { className: "uh-card-shine", "aria-hidden": "true" }),
        /* @__PURE__ */ jsxs8("div", { className: "uh-card-label", children: [
          /* @__PURE__ */ jsx11("span", { children: navigation?.label ?? title }),
          /* @__PURE__ */ jsxs8("span", { children: [
            "Open ",
            /* @__PURE__ */ jsx11("b", { "aria-hidden": "true", children: "\u2192" })
          ] })
        ] })
      ]
    }
  );
}

// react/components/singlespark-home/Icon.tsx
import { jsx as jsx12 } from "react/jsx-runtime";
function Icon({ name, className = "" }) {
  return /* @__PURE__ */ jsx12(
    SingleSparkIcon,
    {
      name,
      className: `uh-icon ${className}`
    }
  );
}

// react/components/singlespark-home/Image.tsx
import { jsx as jsx13 } from "react/jsx-runtime";
function Image({
  src,
  className = "",
  alt = ""
}) {
  return /* @__PURE__ */ jsx13(
    "img",
    {
      className,
      src: assets[src] ?? src,
      alt,
      draggable: false
    }
  );
}

// react/components/singlespark-home/TokenTile.tsx
import { Fragment as Fragment3, jsx as jsx14, jsxs as jsxs9 } from "react/jsx-runtime";
function TokenTile({ token }) {
  return /* @__PURE__ */ jsxs9("div", { className: "uh-token-tile", children: [
    /* @__PURE__ */ jsxs9("div", { className: "uh-token-image", children: [
      /* @__PURE__ */ jsx14(Image, { src: token.image }),
      /* @__PURE__ */ jsxs9("span", { className: "uh-token-person", children: [
        /* @__PURE__ */ jsx14(Icon, { name: "Payments" }),
        /* @__PURE__ */ jsx14(Image, { src: token.avatar }),
        /* @__PURE__ */ jsx14("b", { children: token.recipient })
      ] }),
      /* @__PURE__ */ jsx14("span", { className: "uh-token-age", children: token.age })
    ] }),
    /* @__PURE__ */ jsxs9("div", { className: "uh-token-meta", children: [
      /* @__PURE__ */ jsxs9("div", { children: [
        /* @__PURE__ */ jsx14("span", { children: token.name }),
        /* @__PURE__ */ jsx14("small", { children: token.ticker })
      ] }),
      /* @__PURE__ */ jsxs9("div", { children: [
        /* @__PURE__ */ jsx14("b", { children: token.marketCap }),
        /* @__PURE__ */ jsx14("em", { children: "MC" }),
        token.sent && /* @__PURE__ */ jsxs9(Fragment3, { children: [
          /* @__PURE__ */ jsx14("b", { children: token.sent }),
          /* @__PURE__ */ jsx14("em", { children: "Sent" })
        ] })
      ] })
    ] })
  ] });
}

// react/components/singlespark-home/TokenWall.tsx
import { Fragment as Fragment4, jsx as jsx15, jsxs as jsxs10 } from "react/jsx-runtime";
function TokenWall({
  tokens = defaultPreviewTokens,
  cards
}) {
  if (cards) return /* @__PURE__ */ jsxs10(Fragment4, { children: [
    /* @__PURE__ */ jsx15("div", { className: "uh-token-card-field", "aria-hidden": "true", ...{ inert: "" }, children: cards.map((card, index) => /* @__PURE__ */ jsx15("div", { children: card }, index)) }),
    /* @__PURE__ */ jsx15(Blur, { edge: "top" }),
    /* @__PURE__ */ jsx15(Blur, { edge: "left" }),
    /* @__PURE__ */ jsx15(Blur, { edge: "right" }),
    /* @__PURE__ */ jsx15(Blur, { edge: "bottom" })
  ] });
  const columns = [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 0]
  ];
  return /* @__PURE__ */ jsxs10(Fragment4, { children: [
    /* @__PURE__ */ jsx15("div", { className: "uh-token-field", children: tokens.length > 0 && [0, 1, 2, 3, 0, 1, 2, 3].map((column, i) => /* @__PURE__ */ jsx15(
      "div",
      {
        className: "uh-token-column",
        style: { marginTop: column % 2 ? 138 : 0 },
        children: Array.from({ length: 6 }, (_, j) => /* @__PURE__ */ jsx15(
          TokenTile,
          {
            token: tokens[columns[column][j % 2] % tokens.length]
          },
          j
        ))
      },
      i
    )) }),
    /* @__PURE__ */ jsx15(Blur, { edge: "top" }),
    /* @__PURE__ */ jsx15(Blur, { edge: "left" }),
    /* @__PURE__ */ jsx15(Blur, { edge: "right" })
  ] });
}

// react/components/singlespark-home/TokenPreviewWall.tsx
import { jsx as jsx16 } from "react/jsx-runtime";
function TokenPreviewWall({
  className,
  onNavigate,
  tokens
} = {}) {
  return /* @__PURE__ */ jsx16(Root, { className: `uh-single-feature ${className ?? ""}`, children: /* @__PURE__ */ jsx16(Feature, { title: "Explore", onNavigate, children: /* @__PURE__ */ jsx16(TokenWall, { tokens }) }) });
}

// react/components/singlespark-home/PaymentVisual.tsx
import { Fragment as Fragment5, jsx as jsx17, jsxs as jsxs11 } from "react/jsx-runtime";
function PaymentVisual({
  payments = [defaultPayment]
}) {
  return /* @__PURE__ */ jsxs11(Fragment5, { children: [
    /* @__PURE__ */ jsx17("div", { className: "uh-feed-frame", children: /* @__PURE__ */ jsx17("div", { className: "uh-feed", children: payments.length > 0 && Array.from({ length: 18 }, (_, index) => {
      const payment = payments[index % payments.length];
      return /* @__PURE__ */ jsxs11("div", { className: "uh-payment", children: [
        /* @__PURE__ */ jsxs11("div", { className: "uh-payment-copy", children: [
          /* @__PURE__ */ jsx17("span", { children: payment.amount == null ? /* @__PURE__ */ jsx17(SingleSparkSkeleton, { variant: "input", width: 96, height: 24, label: "Loading Claim reward" }) : payment.amount }),
          /* @__PURE__ */ jsx17("b", { children: payment.recipient })
        ] }),
        /* @__PURE__ */ jsxs11("div", { className: "uh-payment-people", children: [
          /* @__PURE__ */ jsxs11("span", { children: [
            /* @__PURE__ */ jsx17(
              Image,
              {
                src: payment.tokenImage ?? "recipient-example.svg"
              }
            ),
            payment.badges !== false && /* @__PURE__ */ jsx17("i", { children: /* @__PURE__ */ jsx17(Image, { src: "pump-logo.svg" }) })
          ] }),
          /* @__PURE__ */ jsx17(Icon, { name: "Chevrons" }),
          /* @__PURE__ */ jsxs11("span", { children: [
            payment.recipientIcon ?? /* @__PURE__ */ jsx17(
              Image,
              {
                src: payment.recipientImage ?? "recipient-example.svg"
              }
            ),
            payment.badges !== false && /* @__PURE__ */ jsx17("i", { className: "uh-x-badge", children: "X" })
          ] })
        ] }),
        /* @__PURE__ */ jsx17("small", { children: payment.status })
      ] }, index);
    }) }) }),
    /* @__PURE__ */ jsx17(Blur, { edge: "top" }),
    /* @__PURE__ */ jsx17(Blur, { edge: "left" }),
    /* @__PURE__ */ jsx17(Blur, { edge: "right" })
  ] });
}

// react/components/singlespark-home/PaymentPreviewStack.tsx
import { jsx as jsx18 } from "react/jsx-runtime";
function PaymentPreviewStack({
  className,
  onNavigate,
  payments
} = {}) {
  return /* @__PURE__ */ jsx18(Root, { className: `uh-single-feature ${className ?? ""}`, children: /* @__PURE__ */ jsx18(Feature, { title: "Payments", onNavigate, children: /* @__PURE__ */ jsx18(PaymentVisual, { payments }) }) });
}

// react/components/singlespark-home/Digit.tsx
import { jsx as jsx19 } from "react/jsx-runtime";
function Digit({ duration }) {
  return /* @__PURE__ */ jsx19("span", { className: "uh-digit", children: /* @__PURE__ */ jsx19("span", { style: { animationDuration: `${duration}s` }, children: Array.from({ length: 20 }, (_, i) => /* @__PURE__ */ jsx19("i", { children: i % 10 }, i)) }) });
}

// react/components/singlespark-home/Graph.tsx
import { useId as useId3 } from "react";
import { jsx as jsx20, jsxs as jsxs12 } from "react/jsx-runtime";
function Graph({ history, label = "Activity history" }) {
  const gradientId = useId3();
  const live = history !== void 0;
  if (live && (history.length < 2 || history.some((value) => !Number.isFinite(value)))) {
    return /* @__PURE__ */ jsx20("span", { className: "ss-empty", children: "No chart data" });
  }
  let curve = analyticsCurve;
  if (history) {
    const low = Math.min(0, ...history), range = Math.max(...history) - low || 1;
    const points = history.map((value, index) => [index / (history.length - 1) * 420, 126 - (value - low) / range * 48]);
    curve = points.map(([x, y], index) => {
      if (!index) return `M ${x} ${y}`;
      const [previousX, previousY] = points[index - 1], middle = (previousX + x) / 2;
      return `C ${middle} ${previousY} ${middle} ${y} ${x} ${y}`;
    }).join(" ");
  }
  const color = live ? "currentColor" : "white";
  return /* @__PURE__ */ jsxs12(
    "svg",
    {
      className: `uh-graph-svg ${live ? "uh-graph-real" : ""}`,
      viewBox: "0 0 420 130",
      preserveAspectRatio: "none",
      role: live ? "img" : void 0,
      "aria-label": live ? `${label}: ${history[0]} \u2192 ${history[history.length - 1]}` : void 0,
      children: [
        /* @__PURE__ */ jsx20("defs", { children: /* @__PURE__ */ jsxs12("linearGradient", { id: gradientId, x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsx20("stop", { offset: "0%", stopColor: color, stopOpacity: ".18" }),
          /* @__PURE__ */ jsx20("stop", { offset: "100%", stopColor: color, stopOpacity: ".01" })
        ] }) }),
        /* @__PURE__ */ jsxs12("g", { className: live ? "uh-history-reveal" : "uh-stream-pan", children: [
          /* @__PURE__ */ jsx20(
            "path",
            {
              className: live ? "uh-history-area" : void 0,
              d: `${curve} L ${live ? 420 : 1260} 130 L 0 130 Z`,
              fill: `url(#${gradientId})`
            }
          ),
          /* @__PURE__ */ jsx20(
            "path",
            {
              d: curve,
              fill: "none",
              stroke: color,
              strokeOpacity: ".5",
              strokeWidth: "1.5",
              vectorEffect: "non-scaling-stroke",
              strokeLinecap: "round"
            }
          )
        ] }, live ? curve : void 0)
      ]
    }
  );
}

// react/components/singlespark-home/AnalyticsVisual.tsx
import { Fragment as Fragment6, jsx as jsx21, jsxs as jsxs13 } from "react/jsx-runtime";
function AnalyticsVisual({
  amountPrefixes = ["106,8", "5,689,1", "5,689,2"],
  currencySymbol = "$",
  metric,
  controls,
  stats,
  animated = false
}) {
  if (metric && !animated) return /* @__PURE__ */ jsxs13(Fragment6, { children: [
    /* @__PURE__ */ jsxs13("div", { className: `uh-analytics-values ${stats ? "uh-analytics-summary" : ""}`, children: [
      /* @__PURE__ */ jsxs13("div", { className: "uh-fees-line", children: [
        /* @__PURE__ */ jsx21("span", { children: metric.label }),
        controls ?? /* @__PURE__ */ jsx21("span", { children: metric.period })
      ] }),
      /* @__PURE__ */ jsx21("div", { className: "uh-fee-number", children: metric.value == null ? /* @__PURE__ */ jsx21(SingleSparkSkeleton, { variant: "input", width: 140, height: 48, label: `Loading ${metric.label}` }) : /* @__PURE__ */ jsx21(SingleSparkMoney, { value: metric.value }) }),
      stats && /* @__PURE__ */ jsx21("dl", { className: "uh-analytics-stats", children: stats.map((stat) => /* @__PURE__ */ jsxs13("div", { children: [
        /* @__PURE__ */ jsx21("dt", { children: stat.label }),
        /* @__PURE__ */ jsxs13("dd", { children: [
          stat.value == null ? /* @__PURE__ */ jsx21(SingleSparkSkeleton, { variant: "input", width: 80, height: 24, label: `Loading ${stat.label}` }) : /* @__PURE__ */ jsx21(SingleSparkMoney, { value: stat.value }),
          /* @__PURE__ */ jsx21("small", { children: stat.detail })
        ] })
      ] }, stat.label)) })
    ] }),
    /* @__PURE__ */ jsxs13("div", { className: `uh-graph uh-graph-live ${stats ? "uh-graph-summary" : ""}`, children: [
      /* @__PURE__ */ jsx21("div", { className: "uh-graph-grid" }),
      /* @__PURE__ */ jsx21(Graph, { history: metric.history, label: `${metric.label} history` }, metric.period),
      /* @__PURE__ */ jsx21("div", { className: "uh-graph-fade uh-graph-left" }),
      /* @__PURE__ */ jsx21("div", { className: "uh-graph-fade uh-graph-right" })
    ] })
  ] });
  return /* @__PURE__ */ jsxs13(Fragment6, { children: [
    /* @__PURE__ */ jsxs13("div", { className: "uh-analytics-values", children: [
      /* @__PURE__ */ jsxs13("div", { className: "uh-fees-line", children: [
        /* @__PURE__ */ jsx21("span", { children: metric?.label ?? "Fees" }),
        metric ? controls ?? /* @__PURE__ */ jsx21("span", { children: metric.period }) : /* @__PURE__ */ jsx21("div", { children: /* @__PURE__ */ jsx21("div", { className: "uh-timeframes", children: ["1D", "30D", "All time", "1D"].map((label, i) => /* @__PURE__ */ jsx21("span", { children: label }, i)) }) })
      ] }),
      /* @__PURE__ */ jsx21("div", { className: "uh-fee-number", children: metric && metric.value == null ? /* @__PURE__ */ jsx21(SingleSparkSkeleton, { variant: "input", width: 140, height: 48, label: `Loading ${metric.label}` }) : metric?.format === "count" ? /* @__PURE__ */ jsx21(SingleSparkMoney, { value: metric.value }) : metric ? /* @__PURE__ */ jsxs13("div", { className: "uh-animated-metric", "aria-label": metric.value, title: metric.value, children: [
        /* @__PURE__ */ jsx21("span", { className: "singlespark-sr-only", children: metric.value }),
        Number(metric.value.replaceAll(",", "")) >= 1 ? /* @__PURE__ */ jsxs13("span", { "aria-hidden": "true", children: [
          metric.value.split(".")[0],
          ".",
          /* @__PURE__ */ jsx21(Digit, { duration: 2.6 }),
          /* @__PURE__ */ jsx21(Digit, { duration: 0.34 })
        ] }) : /* @__PURE__ */ jsx21("span", { "aria-hidden": "true", children: metric.value })
      ] }) : /* @__PURE__ */ jsx21("div", { className: "uh-timeframes", children: [...amountPrefixes, amountPrefixes[0]].map((prefix, i) => /* @__PURE__ */ jsxs13("div", { children: [
        currencySymbol,
        prefix,
        /* @__PURE__ */ jsx21(Digit, { duration: 2.6 }),
        /* @__PURE__ */ jsx21(Digit, { duration: 0.34 })
      ] }, i)) }) }),
      stats && /* @__PURE__ */ jsx21("dl", { className: "uh-analytics-stats", children: stats.map((stat) => /* @__PURE__ */ jsxs13("div", { children: [
        /* @__PURE__ */ jsx21("dt", { children: stat.label }),
        /* @__PURE__ */ jsxs13("dd", { children: [
          stat.value == null ? /* @__PURE__ */ jsx21(SingleSparkSkeleton, { variant: "input", width: 80, height: 24, label: `Loading ${stat.label}` }) : /* @__PURE__ */ jsx21(SingleSparkMoney, { value: stat.value }),
          /* @__PURE__ */ jsx21("small", { children: stat.detail })
        ] })
      ] }, stat.label)) })
    ] }),
    /* @__PURE__ */ jsxs13("div", { className: "uh-graph", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx21("div", { className: "uh-graph-grid" }),
      /* @__PURE__ */ jsx21("div", { className: "uh-chart-scale", children: /* @__PURE__ */ jsx21("div", { children: /* @__PURE__ */ jsx21(Graph, {}) }) }),
      /* @__PURE__ */ jsx21("div", { className: "uh-graph-fade uh-graph-left" }),
      /* @__PURE__ */ jsx21("div", { className: "uh-graph-fade uh-graph-right" })
    ] })
  ] });
}

// react/components/singlespark-home/AnalyticsPreview.tsx
import { jsx as jsx22 } from "react/jsx-runtime";
function AnalyticsPreview({
  className,
  onNavigate,
  ...props
} = {}) {
  return /* @__PURE__ */ jsx22(Root, { className: `uh-single-feature ${className ?? ""}`, children: /* @__PURE__ */ jsx22(Feature, { title: "Analytics", interactive: !!props.controls, onNavigate, children: /* @__PURE__ */ jsx22(AnalyticsVisual, { ...props }) }) });
}

// react/components/singlespark-home/Person.tsx
import { Fragment as Fragment7, jsx as jsx23, jsxs as jsxs14 } from "react/jsx-runtime";
function Person({
  name,
  handle,
  avatar = "recipient-example.svg"
}) {
  return /* @__PURE__ */ jsxs14(Fragment7, { children: [
    /* @__PURE__ */ jsx23(Image, { src: avatar, className: "uh-avatar" }),
    /* @__PURE__ */ jsxs14("span", { className: "uh-person", children: [
      /* @__PURE__ */ jsx23("b", { children: name }),
      /* @__PURE__ */ jsxs14("small", { children: [
        "@",
        handle.replace(/^@/, "")
      ] })
    ] })
  ] });
}

// react/components/singlespark-home/LaunchVisual.tsx
import { Fragment as Fragment8, jsx as jsx24, jsxs as jsxs15 } from "react/jsx-runtime";
function LaunchVisual({
  recipient = defaultRecipient,
  alternatives = [
    { name: "Ellie", handle: "ellie" },
    { name: "Elena", handle: "elena" }
  ],
  configuration
}) {
  if (configuration) {
    const identity = /* @__PURE__ */ jsxs15(Fragment8, { children: [
      /* @__PURE__ */ jsx24(Image, { src: configuration.image, className: "uh-avatar" }),
      /* @__PURE__ */ jsxs15("span", { className: "uh-person", children: [
        /* @__PURE__ */ jsx24("b", { children: configuration.name }),
        /* @__PURE__ */ jsx24("small", { children: configuration.symbol })
      ] })
    ] });
    return /* @__PURE__ */ jsxs15(Fragment8, { children: [
      /* @__PURE__ */ jsxs15("div", { className: "uh-launch-pick", children: [
        /* @__PURE__ */ jsx24("span", { className: "uh-mono-label", children: "Launch preview" }),
        /* @__PURE__ */ jsxs15("div", { className: "uh-fake-search", children: [
          /* @__PURE__ */ jsx24(Icon, { name: "Explore" }),
          /* @__PURE__ */ jsx24("span", { children: configuration.name }),
          /* @__PURE__ */ jsx24("i", { className: "uh-caret" })
        ] }),
        /* @__PURE__ */ jsx24("ul", { children: /* @__PURE__ */ jsx24("li", { className: "uh-pick-match", children: identity }) })
      ] }),
      /* @__PURE__ */ jsxs15("div", { className: "uh-launch-send", children: [
        /* @__PURE__ */ jsx24("span", { className: "uh-mono-label", children: "Revenue plugins" }),
        /* @__PURE__ */ jsx24("div", { className: "uh-person-card", children: identity }),
        configuration.plugins.map((plugin) => /* @__PURE__ */ jsxs15("div", { className: "uh-person-card", children: [
          plugin.icon,
          /* @__PURE__ */ jsxs15("span", { className: "uh-person", children: [
            /* @__PURE__ */ jsx24("b", { children: plugin.name }),
            /* @__PURE__ */ jsx24("small", { children: plugin.description })
          ] })
        ] }, plugin.name))
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs15(Fragment8, { children: [
    /* @__PURE__ */ jsxs15("div", { className: "uh-launch-pick", children: [
      /* @__PURE__ */ jsx24("span", { className: "uh-mono-label", children: "Fees route to" }),
      /* @__PURE__ */ jsxs15("div", { className: "uh-fake-search", children: [
        /* @__PURE__ */ jsx24(Icon, { name: "Explore" }),
        /* @__PURE__ */ jsxs15(
          "span",
          {
            className: "uh-query",
            style: recipient.handle.replace(/^@/, "").length === 4 ? void 0 : {
              animation: "none",
              width: `${recipient.handle.replace(/^@/, "").length + 1}ch`,
              maxWidth: "100%"
            },
            children: [
              "@",
              recipient.handle.replace(/^@/, "")
            ]
          }
        ),
        /* @__PURE__ */ jsx24("i", { className: "uh-caret" })
      ] }),
      /* @__PURE__ */ jsxs15("ul", { children: [
        /* @__PURE__ */ jsx24("li", { className: "uh-pick-match", children: /* @__PURE__ */ jsx24(Person, { ...recipient }) }),
        alternatives.map((person) => /* @__PURE__ */ jsx24("li", { className: "uh-pick-drop", children: /* @__PURE__ */ jsx24(Person, { ...person }) }, person.handle))
      ] })
    ] }),
    /* @__PURE__ */ jsxs15("div", { className: "uh-launch-send", children: [
      /* @__PURE__ */ jsx24("span", { className: "uh-mono-label", children: "Token setup" }),
      /* @__PURE__ */ jsx24("div", { className: "uh-person-card", children: /* @__PURE__ */ jsx24(Person, { ...recipient }) }),
      /* @__PURE__ */ jsxs15("div", { className: "uh-creator-fees", children: [
        /* @__PURE__ */ jsx24(Icon, { name: "Payments" }),
        /* @__PURE__ */ jsx24("span", { children: "Creator fees" })
      ] }),
      /* @__PURE__ */ jsxs15("div", { className: "uh-ready", children: [
        /* @__PURE__ */ jsx24(Icon, { name: "Check" }),
        /* @__PURE__ */ jsx24("span", { children: "Ready to launch" })
      ] })
    ] })
  ] });
}

// react/components/singlespark-home/LaunchPreview.tsx
import { jsx as jsx25 } from "react/jsx-runtime";
function LaunchPreview({
  className,
  onNavigate,
  ...props
} = {}) {
  return /* @__PURE__ */ jsx25(Root, { className: `uh-single-feature ${className ?? ""}`, children: /* @__PURE__ */ jsx25(Feature, { title: "Launch", onNavigate, children: /* @__PURE__ */ jsx25(LaunchVisual, { ...props }) }) });
}

// react/components/singlespark-home/DocCopy.tsx
import { Fragment as Fragment9 } from "react";
import { jsx as jsx26, jsxs as jsxs16 } from "react/jsx-runtime";
function DocCopy({
  fields = defaultFields,
  title = "Attribution is per-mint",
  description = "One 1024-byte config account per token mint. The treasury appears in its shareholders array, so a single wallet gets clean per-token attribution.",
  detection = "onProgramAccountChange over the Pump Fees Program, filtered on the treasury pubkey. Instant, no polling.",
  claiming = "distribute_creator_fees, then claim_social_fee_pda. Skip vaults under 0.01 SOL - the claim costs more than the take.",
  sectionLabel = "Sharing config",
  columns = ["Off", "Len", "Field"],
  detectionLabel = "Detection",
  claimingLabel = "Claiming"
}) {
  return /* @__PURE__ */ jsxs16("div", { className: "uh-doc-copy", children: [
    /* @__PURE__ */ jsxs16("div", { className: "uh-doc-section", children: [
      /* @__PURE__ */ jsx26("span", { className: "uh-mono-label", children: sectionLabel }),
      /* @__PURE__ */ jsx26("b", { children: title }),
      /* @__PURE__ */ jsx26("p", { children: description })
    ] }),
    /* @__PURE__ */ jsxs16("div", { className: "uh-doc-table", children: [
      columns.map((column) => /* @__PURE__ */ jsx26("span", { children: column }, column)),
      fields.map((row) => /* @__PURE__ */ jsxs16(Fragment9, { children: [
        /* @__PURE__ */ jsx26("i", { children: row.offset }),
        /* @__PURE__ */ jsx26("i", { children: row.length }),
        /* @__PURE__ */ jsx26("i", { children: row.field })
      ] }, `${row.offset}-${row.field}`))
    ] }),
    /* @__PURE__ */ jsxs16("div", { className: "uh-doc-section uh-doc-section-extra", children: [
      /* @__PURE__ */ jsx26("span", { className: "uh-mono-label", children: detectionLabel }),
      /* @__PURE__ */ jsx26("p", { children: detection })
    ] }),
    /* @__PURE__ */ jsxs16("div", { className: "uh-doc-section uh-doc-section-extra", children: [
      /* @__PURE__ */ jsx26("span", { className: "uh-mono-label", children: claimingLabel }),
      /* @__PURE__ */ jsx26("p", { children: claiming })
    ] })
  ] });
}

// react/components/singlespark-home/DocsVisual.tsx
import { Fragment as Fragment10, jsx as jsx27, jsxs as jsxs17 } from "react/jsx-runtime";
function DocsVisual(props) {
  return /* @__PURE__ */ jsxs17(Fragment10, { children: [
    /* @__PURE__ */ jsx27("div", { className: "uh-docs-window", children: /* @__PURE__ */ jsxs17("div", { className: "uh-docs-drift", children: [
      /* @__PURE__ */ jsx27(DocCopy, { ...props }),
      /* @__PURE__ */ jsx27(DocCopy, { ...props })
    ] }) }),
    /* @__PURE__ */ jsx27(Blur, { edge: "top" })
  ] });
}

// react/components/singlespark-home/DocsPreview.tsx
import { jsx as jsx28 } from "react/jsx-runtime";
function DocsPreview({
  className,
  onNavigate,
  ...props
} = {}) {
  return /* @__PURE__ */ jsx28(Root, { className: `uh-single-feature ${className ?? ""}`, children: /* @__PURE__ */ jsx28(Feature, { title: "Docs", onNavigate, children: /* @__PURE__ */ jsx28(DocsVisual, { ...props }) }) });
}

// react/components/singlespark-home/FeaturePreviewGrid.tsx
import { useEffect as useEffect2, useRef as useRef2 } from "react";
import { jsx as jsx29, jsxs as jsxs18 } from "react/jsx-runtime";
function FeaturePreviewGrid({
  className,
  onNavigate,
  tokens,
  tokenCards,
  payments,
  paymentsSummary,
  analytics,
  launch,
  docs,
  navigation,
  globe
} = {}) {
  const grid = useRef2(null);
  useEffect2(() => {
    const cards = Array.from(grid.current?.children ?? []);
    const visible = new Map(cards.map((card) => [card, true]));
    const sync = () => {
      for (const card of cards) {
        card.toggleAttribute("data-motion-paused", document.hidden || !visible.get(card));
      }
    };
    const observer = typeof IntersectionObserver === "function" ? new IntersectionObserver((entries) => {
      for (const entry of entries) visible.set(entry.target, entry.isIntersecting);
      sync();
    }, { rootMargin: "64px" }) : null;
    cards.forEach((card) => observer?.observe(card));
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", sync);
      cards.forEach((card) => card.removeAttribute("data-motion-paused"));
    };
  }, [!!globe, !!paymentsSummary, launch === false, docs === false, !!tokenCards, !!analytics?.controls]);
  return /* @__PURE__ */ jsx29(Root, { className, children: /* @__PURE__ */ jsxs18("div", { ref: grid, className: `uh-feature-grid ${globe ? "uh-feature-grid-globe" : ""} ${paymentsSummary ? "uh-feature-grid-summary" : ""} ${launch === false ? "uh-feature-grid-no-launch" : ""} ${docs === false ? "uh-feature-grid-no-docs" : ""}`, children: [
    /* @__PURE__ */ jsx29(Feature, { title: "Explore", wide: true, interactive: !!tokenCards, onNavigate, navigation: navigation?.Explore, children: /* @__PURE__ */ jsx29(TokenWall, { tokens, cards: tokenCards }) }),
    globe && /* @__PURE__ */ jsx29(Feature, { title: "Spark Globe", wide: true, interactive: true, onNavigate, children: globe }),
    /* @__PURE__ */ jsx29(Feature, { title: "Payments", wide: !globe, onNavigate, navigation: navigation?.Payments, children: /* @__PURE__ */ jsx29(PaymentVisual, { payments }) }),
    paymentsSummary && /* @__PURE__ */ jsx29(Feature, { title: "Payments", interactive: true, onNavigate, navigation: navigation?.Burns, children: paymentsSummary }),
    /* @__PURE__ */ jsx29(Feature, { title: "Analytics", interactive: !!analytics?.controls, onNavigate, navigation: navigation?.Analytics, children: /* @__PURE__ */ jsx29(AnalyticsVisual, { ...analytics }) }),
    launch !== false && /* @__PURE__ */ jsx29(Feature, { title: "Launch", onNavigate, navigation: navigation?.Launch, children: /* @__PURE__ */ jsx29(LaunchVisual, { ...launch }) }),
    docs !== false && /* @__PURE__ */ jsx29(Feature, { title: "Docs", onNavigate, navigation: navigation?.Docs, children: /* @__PURE__ */ jsx29(DocsVisual, { ...docs }) })
  ] }) });
}

// react/components/singlespark-home/SearchInput.tsx
import { useState as useState3 } from "react";
import { jsx as jsx30, jsxs as jsxs19 } from "react/jsx-runtime";
function SearchInput({
  value,
  defaultValue = "",
  placeholder = "Search",
  onQueryChange,
  onSearch,
  onAction
}) {
  const [internalValue, setInternalValue] = useState3(defaultValue);
  const query = value ?? internalValue;
  return /* @__PURE__ */ jsxs19("div", { className: "uh-search", children: [
    /* @__PURE__ */ jsx30(Icon, { name: "Search" }),
    /* @__PURE__ */ jsx30(
      "input",
      {
        type: "text",
        placeholder,
        "aria-label": "Search query",
        autoComplete: "off",
        spellCheck: false,
        enterKeyHint: "search",
        value: query,
        onChange: (event) => {
          setInternalValue(event.target.value);
          onQueryChange?.(event.target.value);
        },
        onKeyDown: (event) => {
          if (event.key === "Enter") {
            onSearch?.(query);
            if (!onSearch) onAction?.("search:" + query);
          }
        }
      }
    )
  ] });
}

// react/components/singlespark-home/SingleSparkGlobalSearch.tsx
import { jsx as jsx31 } from "react/jsx-runtime";
function SingleSparkGlobalSearch({
  className,
  ...props
} = {}) {
  return /* @__PURE__ */ jsx31(Root, { className, children: /* @__PURE__ */ jsx31("div", { className: "uh-search-preview", children: /* @__PURE__ */ jsx31(SearchInput, { ...props }) }) });
}

// react/components/singlespark-home/Topbar.tsx
import { useEffect as useEffect3, useId as useId4, useRef as useRef3, useState as useState4 } from "react";
import { Fragment as Fragment11, jsx as jsx32, jsxs as jsxs20 } from "react/jsx-runtime";
function Topbar({
  onNavigate,
  actions,
  brandHref = "/",
  onAction,
  onConnectWallet,
  defaultMenuOpen = false,
  search,
  navigation = singleSparkNavigation,
  active,
  mobile = false
}) {
  const [menuOpen, setMenuOpen] = useState4(defaultMenuOpen);
  const menuId = useId4();
  const menuButton = useRef3(null);
  useEffect3(() => {
    if (!menuOpen) return;
    const close = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);
  return /* @__PURE__ */ jsxs20(Fragment11, { children: [
    /* @__PURE__ */ jsxs20("header", { className: `uh-topbar ${mobile ? "uh-is-mobile" : ""}`, children: [
      /* @__PURE__ */ jsx32(
        NavigationLink,
        {
          path: brandHref,
          component: "SingleSparkHero",
          onNavigate,
          children: /* @__PURE__ */ jsx32(
            Image,
            {
              src: "singlespark-logo.svg",
              className: "uh-mobile-logo",
              alt: "singleSpark"
            }
          )
        }
      ),
      /* @__PURE__ */ jsx32("div", { className: "uh-header-search", children: /* @__PURE__ */ jsx32(SearchInput, { onAction, ...search }) }),
      /* @__PURE__ */ jsxs20("div", { className: "uh-header-actions", children: [
        actions ?? /* @__PURE__ */ jsxs20(Fragment11, { children: [
          /* @__PURE__ */ jsx32(
            NavigationLink,
            {
              path: "/launch",
              component: "SingleSparkLaunchModes",
              onNavigate,
              className: "uh-button uh-button-primary",
              children: "Launch"
            }
          ),
          /* @__PURE__ */ jsx32(
            "button",
            {
              type: "button",
              className: "uh-button uh-connect",
              onClick: () => {
                if (onConnectWallet) onConnectWallet();
                else if (onNavigate) onNavigate("SingleSparkWalletDialog");
                else onAction?.("connect-wallet");
              },
              children: "Connect wallet"
            }
          )
        ] }),
        /* @__PURE__ */ jsx32(
          "button",
          {
            ref: menuButton,
            className: "uh-menu-button",
            type: "button",
            "aria-label": `${menuOpen ? "Close" : "Open"} menu`,
            "aria-expanded": menuOpen,
            "aria-controls": menuId,
            onClick: () => setMenuOpen((open) => !open),
            children: /* @__PURE__ */ jsx32(Icon, { name: menuOpen ? "Close" : "Menu" })
          }
        )
      ] })
    ] }),
    menuOpen && /* @__PURE__ */ jsxs20(
      "nav",
      {
        id: menuId,
        className: "uh-mobile-links",
        "aria-label": "Mobile navigation",
        onClick: (event) => {
          if (event.target.closest("a")) setMenuOpen(false);
        },
        children: [
          /* @__PURE__ */ jsx32("div", { className: "uh-mobile-search", children: /* @__PURE__ */ jsx32(
            SearchInput,
            {
              onAction,
              ...search,
              onSearch: (query) => {
                if (search?.onSearch) search.onSearch(query);
                else onAction?.("search:" + query);
                setMenuOpen(false);
              }
            }
          ) }),
          navigation.map((item) => /* @__PURE__ */ jsx32(
            NavigationLink,
            {
              ...item,
              current: item.label === active,
              onNavigate,
              children: item.label
            },
            item.path
          ))
        ]
      }
    )
  ] });
}

// react/components/singlespark-home/SingleSparkTopbar.tsx
import { jsx as jsx33 } from "react/jsx-runtime";
function SingleSparkTopbar({
  className,
  ...props
} = {}) {
  return /* @__PURE__ */ jsx33(Root, { className, children: /* @__PURE__ */ jsx33(Topbar, { ...props }) });
}

// react/components/singlespark-home/SingleSparkMobileMenu.tsx
import { jsx as jsx34 } from "react/jsx-runtime";
function SingleSparkMobileMenu({
  className,
  ...props
} = {}) {
  return /* @__PURE__ */ jsx34(Root, { className: `uh-mobile-preview ${className ?? ""}`, children: /* @__PURE__ */ jsx34(Topbar, { mobile: true, ...props }) });
}

// react/components/singlespark-home/SingleSparkSidebar.tsx
import { useRef as useRef4, useState as useState5 } from "react";
import { jsx as jsx35, jsxs as jsxs21 } from "react/jsx-runtime";
function SingleSparkSidebar({
  className,
  brandHref = "/",
  brand,
  localLinks = false,
  footer,
  onNavigate,
  active = "Home",
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  navigation = singleSparkNavigation
} = {}) {
  const [internalCollapsed, setInternalCollapsed] = useState5(defaultCollapsed);
  const activeIconRef = useRef4(null);
  const isCollapsed = collapsed ?? internalCollapsed;
  return /* @__PURE__ */ jsxs21(Root, { className, children: [
    /* @__PURE__ */ jsxs21(
      "aside",
      {
        className: `uh-sidebar ${isCollapsed ? "uh-sidebar-collapsed" : ""}`,
        children: [
          /* @__PURE__ */ jsxs21("div", { children: [
            /* @__PURE__ */ jsx35(
              NavigationLink,
              {
                path: brandHref,
                local: localLinks,
                label: "SingleSpark",
                component: "SingleSparkHero",
                onNavigate,
                className: "uh-brand",
                children: brand ?? /* @__PURE__ */ jsx35(
                  Image,
                  {
                    src: "singlespark-logo.svg",
                    className: "uh-sidebar-logo",
                    alt: "singleSpark"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx35("nav", { "aria-label": "Primary", children: navigation.map((item) => /* @__PURE__ */ jsxs21(
              NavigationLink,
              {
                ...item,
                local: localLinks,
                onNavigate,
                current: item.label === active,
                className: `uh-nav-link ${item.label === active ? "uh-active" : ""}`,
                children: [
                  /* @__PURE__ */ jsx35("div", { ref: item.label === active ? activeIconRef : void 0, className: "uh-nav-icon", "aria-hidden": "true", children: item.iconContent ?? /* @__PURE__ */ jsx35(Icon, { name: item.icon || item.label }) }),
                  /* @__PURE__ */ jsx35("span", { children: item.label })
                ]
              },
              item.path
            )) })
          ] }),
          footer !== void 0 ? footer : /* @__PURE__ */ jsxs21(
            "a",
            {
              className: "uh-account",
              href: "https://x.com/UsePaid",
              target: "_blank",
              rel: "noreferrer",
              children: [
                /* @__PURE__ */ jsx35("span", { children: /* @__PURE__ */ jsx35(Image, { src: "singlespark-logo.svg", alt: "singleSpark" }) }),
                /* @__PURE__ */ jsxs21("div", { children: [
                  /* @__PURE__ */ jsx35("b", { children: "singleSpark" }),
                  /* @__PURE__ */ jsx35("small", { children: "@singleSpark" })
                ] }),
                /* @__PURE__ */ jsx35("strong", { children: "\u2026" })
              ]
            }
          ),
          /* @__PURE__ */ jsx35(
            "button",
            {
              className: "uh-sidebar-collapse",
              type: "button",
              "aria-label": `${isCollapsed ? "Expand" : "Collapse"} sidebar`,
              "aria-pressed": isCollapsed,
              onClick: () => {
                setInternalCollapsed(!isCollapsed);
                onCollapsedChange?.(!isCollapsed);
              },
              children: /* @__PURE__ */ jsx35("svg", { viewBox: "0 0 20 20", "aria-hidden": "true", fill: "currentColor", children: /* @__PURE__ */ jsx35(
                "path",
                {
                  fillRule: "evenodd",
                  clipRule: "evenodd",
                  d: "M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                }
              ) })
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx35(NavigationIndicator, { targetRef: activeIconRef, className: "uh-navigation-indicator" })
  ] });
}

// react/components/singlespark-home/SingleSparkFooter.tsx
import { jsx as jsx36, jsxs as jsxs22 } from "react/jsx-runtime";
function SingleSparkFooter({
  className,
  onNavigate,
  year = 2026
} = {}) {
  const columns = [
    {
      label: "Product",
      links: singleSparkNavigation.filter(
        (item) => ["Explore", "Payments", "Analytics", "Launch"].includes(item.label)
      )
    },
    {
      label: "Protocol",
      links: [
        singleSparkNavigation[6],
        { label: "$PAID", path: "/paid", component: "ProtocolArticle" },
        singleSparkNavigation[7],
        {
          label: "Official links",
          path: "/links",
          component: "OfficialLinkHub"
        }
      ]
    },
    {
      label: "Legal",
      links: [
        { label: "Terms", path: "/legal/terms", component: "LegalArticle" },
        { label: "Privacy", path: "/legal/privacy", component: "LegalArticle" },
        {
          label: "Disclosures",
          path: "/legal/disclosures",
          component: "LegalArticle"
        },
        { label: "Opt out", path: "/opt-out", component: "OptOutExplanation" }
      ]
    }
  ];
  return /* @__PURE__ */ jsx36(Root, { className, children: /* @__PURE__ */ jsxs22("footer", { className: "uh-footer", children: [
    /* @__PURE__ */ jsxs22("div", { className: "uh-footer-brand", children: [
      /* @__PURE__ */ jsx36("strong", { children: "singleSpark" }),
      /* @__PURE__ */ jsxs22("small", { children: [
        "\xA9 ",
        year,
        " singleSpark"
      ] }),
      /* @__PURE__ */ jsxs22("div", { children: [
        /* @__PURE__ */ jsx36(
          "a",
          {
            href: "https://x.com/UsePaid",
            target: "_blank",
            rel: "noreferrer",
            "aria-label": "singleSpark on X",
            children: "X"
          }
        ),
        /* @__PURE__ */ jsx36(
          "a",
          {
            href: "https://t.me/usepaidapp",
            target: "_blank",
            rel: "noreferrer",
            "aria-label": "singleSpark on Telegram",
            children: /* @__PURE__ */ jsx36(Image, { src: "telegram.svg" })
          }
        ),
        /* @__PURE__ */ jsx36(
          "a",
          {
            href: "https://discord.gg/usepaidapp",
            target: "_blank",
            rel: "noreferrer",
            "aria-label": "singleSpark on Discord",
            children: /* @__PURE__ */ jsx36(Image, { src: "discord.svg" })
          }
        )
      ] }),
      /* @__PURE__ */ jsx36(
        NavigationLink,
        {
          path: "/legal/disclosures#affiliation",
          component: "LegalArticle",
          onNavigate,
          children: "Not affiliated with X Corp."
        }
      )
    ] }),
    /* @__PURE__ */ jsx36("div", { className: "uh-footer-columns", children: columns.map((column) => /* @__PURE__ */ jsxs22("div", { children: [
      /* @__PURE__ */ jsx36("b", { children: column.label }),
      column.links.map((item) => /* @__PURE__ */ jsx36(
        NavigationLink,
        {
          ...item,
          onNavigate,
          children: item.label
        },
        item.path
      ))
    ] }, column.label)) })
  ] }) });
}

// react/singlespark-home.tsx
var singleSparkHomeComponents = {
  SingleSparkHero,
  FeaturePreviewGrid,
  TokenPreviewWall,
  PaymentPreviewStack,
  AnalyticsPreview,
  LaunchPreview,
  DocsPreview,
  SingleSparkSidebar,
  SingleSparkTopbar,
  SingleSparkMobileMenu,
  SingleSparkFooter,
  SingleSparkGlobalSearch,
  SingleSparkWalletDialog
};

// react/singlespark-business.shared.tsx
import { useState as useState6 } from "react";
var candleUrls = {
  "1m": new URL(
    "../assets/singlespark/business/eacc-1m-candles.json",
    import.meta.url
  ).href,
  "5m": new URL(
    "../assets/singlespark/business/eacc-5m-candles.json",
    import.meta.url
  ).href,
  "15m": new URL(
    "../assets/singlespark/business/eacc-15m-candles.json",
    import.meta.url
  ).href,
  "1h": new URL(
    "../assets/singlespark/business/eacc-1h-candles.json",
    import.meta.url
  ).href,
  "4h": new URL(
    "../assets/singlespark/business/eacc-4h-candles.json",
    import.meta.url
  ).href,
  "1D": new URL(
    "../assets/singlespark/business/eacc-1D-candles.json",
    import.meta.url
  ).href
};
var asset = (name) => singleSparkAssetUrls[name] || name;
var tokenMint = "CbcyNo7m1amFWqEQm2m4PLv1UNvpcL3C1Ujm6AkzpKoU";
var singleSparkMint = "98kfF7rmsg1QDUEoCqNE7g7M1FdrTt92TEp2CLzypump";
var treasury = "FfLpuH4WPn2MR8Lqn1MpwQc1HtAPPqL3qvMWZjnFHGpv";
var emptyDraft = {
  name: "",
  ticker: "",
  recipient: "",
  description: "",
  website: "",
  telegram: "",
  x: "",
  initialBuy: "",
  deployerReward: "",
  deployerHandle: "",
  tax: "",
  agreed: false
};
function useValue(value, initial, onChange) {
  const [local, setLocal] = useState6(initial);
  return [
    value === void 0 ? local : value,
    (next) => {
      setLocal(next);
      onChange?.(next);
    }
  ];
}
var initialExplore = {
  venues: ["Pump", "Pons"],
  query: "",
  sort: "Total X Payments"
};
var demoTransfer = {
  asset: "SOL",
  amount: "71.779305864 SOL",
  transactionUrl: "https://solscan.io/tx/5xqvmFSjg7QMiaAqaxvTwPD7XA63Zxpp3BmZt2rujRNQwwE4oRPbGieCYtk1yDM8RkqgUUjaDa1rLF9V2eJVrtvC"
};
var demoBreakdown = {
  ticker: "parafactual",
  image: "token-2.webp",
  amount: "$8,733.35",
  transfers: [demoTransfer]
};
var defaultSingleSparkPayment = {
  amount: "$8,733.35",
  recipient: "You",
  avatar: "avatar-2.webp",
  age: "3h",
  breakdowns: [demoBreakdown]
};
var rampTx = "2aLSYucwFzMhT67kqPwrVSGU9JRZkKPYjRnX1cFQWbZDFteidZ2cFX5xey6Q369DGwFV55JwkVHtLvVoUnLnaoqK";
var chartFormat = (value) => {
  const n = Math.abs(value);
  return n >= 1e9 ? (value / 1e9).toFixed(2) + "B" : n >= 1e6 ? (value / 1e6).toFixed(2) + "M" : n >= 1e3 ? (value / 1e3).toFixed(1) + "K" : n >= 1 ? value.toFixed(2) : value.toPrecision(3);
};
function useDraft(value, onChange) {
  const [local, setLocal] = useState6(emptyDraft);
  const draft = { ...emptyDraft, ...value === void 0 ? local : value };
  const change = (patch) => {
    const next = { ...draft, ...patch };
    setLocal(next);
    onChange?.(next);
  };
  return [draft, change];
}
var burnTx = "22AXVUsrdACnEtsD4jDj2p9AYPUf4HceyYe3EfzHdSVqaeXAnRdhP77h7QStJW34kkEHfLuPMP4HH9g1XNQJEFiC";
var MarketChartCoreAsset0 = new URL(
  "../assets/singlespark/business/lightweight-charts-4.2.3.js",
  import.meta.url
);

// react/singlespark-business-data.ts
var singleSparkBusinessSnapshot = {
  profiles: [
    {
      name: "Beff (e/acc)",
      handle: "beffjezos",
      banner: "0ae9b9adb161.webp",
      avatar: "cbd0b27be964.webp",
      tokens: "500",
      amount: "250,208.62"
    },
    {
      name: "Elon Musk",
      handle: "elonmusk",
      banner: "0e8b3814060f.webp",
      avatar: "8a673453be31.webp",
      tokens: "805",
      amount: "177,942.53"
    },
    {
      name: "Solana",
      handle: "solana",
      banner: "ebaa55009356.webp",
      avatar: "a893c870f05c.webp",
      tokens: "462",
      amount: "104,773.23"
    },
    {
      name: "You",
      handle: "parafactual",
      banner: "90ea9c3541f5.webp",
      avatar: "b66cdb029107.webp",
      tokens: "36",
      amount: "66,290.85"
    },
    {
      name: "Maye Musk",
      handle: "mayemusk",
      banner: "46b10d3db985.webp",
      avatar: "6ca8892806c9.webp",
      tokens: "137",
      amount: "64,005.60"
    }
  ],
  paid: [
    {
      ticker: "e/acc",
      href: "/token/CbcyNo7m1amFWqEQm2m4PLv1UNvpcL3C1Ujm6AkzpKoU",
      profile: "/profile/beffjezos",
      name: "Beff (e/acc)",
      image: "e4f322780f36.webp",
      platform: "Pump",
      avatar: "51332a02d00d.webp",
      amount: "$152,362.48",
      unsent: "$31,864.09 unsent"
    },
    {
      ticker: "ELON",
      href: "/token/GY9mZfyPpxXxBXBxS2hB2XjhP3kfUsywTvgveozxpump",
      profile: "/profile/elonmusk",
      name: "Elon Musk",
      image: "4cf02f25c5f6.webp",
      platform: "Pump",
      avatar: "a2f34932c6a8.webp",
      amount: "$139,801.01",
      unsent: "$42,106.55 unsent"
    },
    {
      ticker: "SOLCAT",
      href: "/token/9U1f18idDeySFnYrurxqT1f5n5nE4g4Uk5LLzP69bh1",
      profile: "/profile/solana",
      name: "Solana",
      image: "c6a85a27f42c.webp",
      platform: "Pump",
      avatar: "dbde4ea448c5.webp",
      amount: "$80,811.99",
      unsent: "$9,996.11 unsent"
    },
    {
      ticker: "KARDASHEV",
      href: "/token/5wW9mhbwq1HTFh341iimpmrqBB4mfxdXiYhdYBL7hUnp",
      profile: "/profile/beffjezos",
      name: "Beff (e/acc)",
      image: "64fe204fbb44.webp",
      platform: "Pump",
      avatar: "51332a02d00d.webp",
      amount: "$72,932.59",
      unsent: "$19,600.33 unsent"
    },
    {
      ticker: "parafactual",
      href: "/token/CvUX4G2tzq7J3ECmNvWZLayZYV6KpgQp6SJ5K8Uvsu5g",
      profile: "/profile/parafactual",
      name: "You",
      image: "3d4ad1096c7b.webp",
      platform: "Pump",
      avatar: "4cd5f2235f6a.webp",
      amount: "$64,367.06",
      unsent: "$1,276.60 unsent"
    },
    {
      ticker: "VLAD",
      href: "/token/0xebd79ceada7a7798ee75727671581dda5a9e88e4",
      profile: "/profile/vladtenev",
      name: "Vlad Tenev",
      image: "6a37294aba6d.webp",
      platform: "Pons",
      avatar: "c2dbcb26a860.webp",
      amount: "$56,273.02",
      unsent: "$6,589.79 unsent"
    }
  ],
  trending: [
    {
      href: "/token/CbcyNo7m1amFWqEQm2m4PLv1UNvpcL3C1Ujm6AkzpKoU",
      image: "e4f322780f36.webp",
      name: "Effective Accelerationism",
      ticker: "e/acc",
      amount: "152,362.48"
    },
    {
      href: "/token/8k4sBtEeK4pf26noKqApv8NBTnuSJcbdwpKYknk5PbAA",
      image: "0375653a166b.webp",
      name: "CALI",
      ticker: "CALI",
      amount: "56,162.43"
    },
    {
      href: "/token/55Vr2VpSwxsDkB6uGGHAvRv86K6zax2Zb4TT8ivwDEzW",
      image: "525d44a6c884.webp",
      name: "slopcannon",
      ticker: "slopcannon",
      amount: "40,585.81"
    },
    {
      href: "/token/CvUX4G2tzq7J3ECmNvWZLayZYV6KpgQp6SJ5K8Uvsu5g",
      image: "3d4ad1096c7b.webp",
      name: "parafactual",
      ticker: "parafactual",
      amount: "64,367.06"
    },
    {
      href: "/token/GY9mZfyPpxXxBXBxS2hB2XjhP3kfUsywTvgveozxpump",
      image: "4cf02f25c5f6.webp",
      name: "Elon Coin",
      ticker: "ELON",
      amount: "139,801.01"
    },
    {
      href: "/token/EkFRff9a2jKztJHML1LG9FRmEkPJDR6XAYp3uCPdpump",
      image: "5ee28a286a33.webp",
      name: "SLOPCORE",
      ticker: "SLOPCORE",
      amount: "35,082.92"
    },
    {
      href: "/token/9yfiomKJ2fdHiZQ3MK9AJniu8eR2eSjCzfMEo1zXpump",
      image: "1a85b73364b1.webp",
      name: "Justice for frogman",
      ticker: "FROGMAN",
      amount: "0.00"
    },
    {
      href: "/token/Fj886GvHFyxQhunb4pw7WLRPRASNh25LT8Zpv8qqr3Ab",
      image: "255c34d72981.webp",
      name: "Howling Mutant",
      ticker: "MUTANT",
      amount: "7,795.88"
    },
    {
      href: "/token/9U1f18idDeySFnYrurxqT1f5n5nE4g4Uk5LLzP69bh1",
      image: "c6a85a27f42c.webp",
      name: "Solana Cat",
      ticker: "SOLCAT",
      amount: "80,811.99"
    },
    {
      href: "/token/FaL1PFQhNo4JAGaQKSnKurWeNtpexqEAduQjR4H6pump",
      image: "7de9bcbe3217.webp",
      name: "deflock",
      ticker: "DeFlock",
      amount: "0.00"
    }
  ],
  catalog: [
    {
      href: "/token/CbcyNo7m1amFWqEQm2m4PLv1UNvpcL3C1Ujm6AkzpKoU",
      image: "e4f322780f36.webp",
      avatar: "a30d37032508.webp",
      platform: "Pump",
      name: "Effective Accelerationism",
      ticker: "e/acc",
      recipient: "Beff (e/acc)",
      handle: "beffjezos",
      age: "11d",
      mc: "$6.3M",
      amount: "152,362.48",
      address: "CbcyNo7m1amFWqEQm2m4PLv1UNvpcL3C1Ujm6AkzpKoU",
      shortAddress: "CbcyNo\u2026kzpKoU"
    },
    {
      href: "/token/GY9mZfyPpxXxBXBxS2hB2XjhP3kfUsywTvgveozxpump",
      image: "4cf02f25c5f6.webp",
      avatar: "88e4212bd945.webp",
      platform: "Pump",
      name: "Elon Coin",
      ticker: "ELON",
      recipient: "Elon Musk",
      handle: "elonmusk",
      age: "34d",
      mc: "$410.4K",
      amount: "139,801.01",
      address: "GY9mZfyPpxXxBXBxS2hB2XjhP3kfUsywTvgveozxpump",
      shortAddress: "GY9mZf\u2026zxpump"
    },
    {
      href: "/token/9U1f18idDeySFnYrurxqT1f5n5nE4g4Uk5LLzP69bh1",
      image: "c6a85a27f42c.webp",
      avatar: "a99b44ee4d6c.webp",
      platform: "Pump",
      name: "Solana Cat",
      ticker: "SOLCAT",
      recipient: "Solana",
      handle: "solana",
      age: "19d",
      mc: "$105.8K",
      amount: "80,811.99",
      address: "9U1f18idDeySFnYrurxqT1f5n5nE4g4Uk5LLzP69bh1",
      shortAddress: "9U1f18\u2026P69bh1"
    },
    {
      href: "/token/5wW9mhbwq1HTFh341iimpmrqBB4mfxdXiYhdYBL7hUnp",
      image: "64fe204fbb44.webp",
      avatar: "a30d37032508.webp",
      platform: "Pump",
      name: "Kardashev Research",
      ticker: "KARDASHEV",
      recipient: "Beff (e/acc)",
      handle: "beffjezos",
      age: "11d",
      mc: "$88.3K",
      amount: "72,932.59",
      address: "5wW9mhbwq1HTFh341iimpmrqBB4mfxdXiYhdYBL7hUnp",
      shortAddress: "5wW9mh\u2026L7hUnp"
    },
    {
      href: "/token/0xebd79ceada7a7798ee75727671581dda5a9e88e4",
      image: "6a37294aba6d.webp",
      avatar: "49f7a49c15f3.webp",
      platform: "Pons",
      name: "Vlad Coin",
      ticker: "VLAD",
      recipient: "Vlad Tenev",
      handle: "vladtenev",
      age: "18d",
      mc: "$18.6K",
      amount: "56,273.02",
      address: "0xebd79ceada7a7798ee75727671581dda5a9e88e4",
      shortAddress: "0xebd7\u20269e88e4"
    },
    {
      href: "/token/8k4sBtEeK4pf26noKqApv8NBTnuSJcbdwpKYknk5PbAA",
      image: "0375653a166b.webp",
      avatar: "94a387c00c47.webp",
      platform: "Pump",
      name: "CALI",
      ticker: "CALI",
      recipient: "Maye Musk",
      handle: "mayemusk",
      age: "19d",
      mc: "$1.3M",
      amount: "56,162.43",
      address: "8k4sBtEeK4pf26noKqApv8NBTnuSJcbdwpKYknk5PbAA",
      shortAddress: "8k4sBt\u2026k5PbAA"
    },
    {
      href: "/token/CvUX4G2tzq7J3ECmNvWZLayZYV6KpgQp6SJ5K8Uvsu5g",
      image: "3d4ad1096c7b.webp",
      avatar: "b8c20f9d2fff.webp",
      platform: "Pump",
      name: "parafactual",
      ticker: "parafactual",
      recipient: "You",
      handle: "parafactual",
      age: "13d",
      mc: "$494.1K",
      amount: "64,367.06",
      address: "CvUX4G2tzq7J3ECmNvWZLayZYV6KpgQp6SJ5K8Uvsu5g",
      shortAddress: "CvUX4G\u2026Uvsu5g"
    },
    {
      href: "/token/Hk8Uiq8CeNdmZzu1aPaT7MhvujtJifFS9kKhfpXmpaid",
      image: "adfa096082b9.webp",
      avatar: "cf72b90cc449.webp",
      platform: "Pump",
      name: "Nikita Boar",
      ticker: "BOAR",
      recipient: "Nikita Bier",
      handle: "nikitabier",
      age: "21d",
      mc: "$28.3K",
      amount: "45,228.33",
      address: "Hk8Uiq8CeNdmZzu1aPaT7MhvujtJifFS9kKhfpXmpaid",
      shortAddress: "Hk8Uiq\u2026Xmpaid"
    },
    {
      href: "/token/FYM6PhwAS3QwTBwvgLj8JYeMgpNfKsWtW3hGxPM9eFkt",
      image: "ad38813f6e45.webp",
      avatar: "dfd9fcf50f23.webp",
      platform: "Pump",
      name: "DEBT COIN",
      ticker: "DEBT",
      recipient: "\u{1F1FA}\u{1F1F8} ERIC BOLLING",
      handle: "ericbolling",
      age: "10d",
      mc: "$6.2K",
      amount: "44,540.25",
      address: "FYM6PhwAS3QwTBwvgLj8JYeMgpNfKsWtW3hGxPM9eFkt",
      shortAddress: "FYM6Ph\u2026M9eFkt"
    },
    {
      href: "/token/CMuvWQ6qQbSt7NUQdPGcVKCoDgETieuqS68qu6BaeVgR",
      image: "f8a1e87d3fb5.webp",
      avatar: "6fd4fa690686.webp",
      platform: "Pump",
      name: "Cream",
      ticker: "Cream",
      recipient: "Cr\xE9mieux",
      handle: "cremieuxrecueil",
      age: "11d",
      mc: "$12.9K",
      amount: "42,994.72",
      address: "CMuvWQ6qQbSt7NUQdPGcVKCoDgETieuqS68qu6BaeVgR",
      shortAddress: "CMuvWQ\u2026BaeVgR"
    },
    {
      href: "/token/HSnCtWsw5YmfAkJo9S3eetWtGHPMrc2pAxvCu24AnQEa",
      image: "ab546e9db218.webp",
      avatar: "9dd91d0e8bd8.webp",
      platform: "Pump",
      name: "dropping dollars on strangers",
      ticker: "DDOS",
      recipient: "Random Acts",
      handle: "randomactsorg",
      age: "11d",
      mc: "$10.9K",
      amount: "41,366.30",
      address: "HSnCtWsw5YmfAkJo9S3eetWtGHPMrc2pAxvCu24AnQEa",
      shortAddress: "HSnCtW\u20264AnQEa"
    },
    {
      href: "/token/55Vr2VpSwxsDkB6uGGHAvRv86K6zax2Zb4TT8ivwDEzW",
      image: "525d44a6c884.webp",
      avatar: "26e067423af8.webp",
      platform: "Pump",
      name: "slopcannon",
      ticker: "slopcannon",
      recipient: "bone",
      handle: "bonegpt",
      age: "11d",
      mc: "$508.1K",
      amount: "40,585.81",
      address: "55Vr2VpSwxsDkB6uGGHAvRv86K6zax2Zb4TT8ivwDEzW",
      shortAddress: "55Vr2V\u2026vwDEzW"
    },
    {
      href: "/token/CC5D6puFmcsnGaJh7kNXeAcRpL2SZzQfoQezvx45uKjt",
      image: "a7ff5c9adae5.webp",
      avatar: "b9ee4469288c.webp",
      platform: "Pump",
      name: "Save The Boy, Save The World",
      ticker: "WORLD",
      recipient: "Marc Malone",
      handle: "iammarcmalone",
      age: "10d",
      mc: "$64.1K",
      amount: "40,453.19",
      address: "CC5D6puFmcsnGaJh7kNXeAcRpL2SZzQfoQezvx45uKjt",
      shortAddress: "CC5D6p\u202645uKjt"
    },
    {
      href: "/token/HgoScXAo4zFv5kDb6axGrwuz95FaVEcLskyDVZfo297z",
      image: "1e067537c347.webp",
      avatar: "285b180549d1.webp",
      platform: "Pump",
      name: "TheMarsSociety",
      ticker: "MARTIANS",
      recipient: "The Mars Society",
      handle: "themarssociety",
      age: "10d",
      mc: "$66.1K",
      amount: "37,781.80",
      address: "HgoScXAo4zFv5kDb6axGrwuz95FaVEcLskyDVZfo297z",
      shortAddress: "HgoScX\u2026fo297z"
    },
    {
      href: "/token/G5im68AmQ8c6C56Kdapufyu8dZddYkMBGoLbqtb98j7",
      image: "f94786d9b58b.webp",
      avatar: "51ab4bccad56.webp",
      platform: "Pump",
      name: "Jason Coin",
      ticker: "JASON COIN",
      recipient: "@jason",
      handle: "jason",
      age: "21d",
      mc: "$17.5K",
      amount: "35,156.22",
      address: "G5im68AmQ8c6C56Kdapufyu8dZddYkMBGoLbqtb98j7",
      shortAddress: "G5im68\u2026tb98j7"
    },
    {
      href: "/token/EkFRff9a2jKztJHML1LG9FRmEkPJDR6XAYp3uCPdpump",
      image: "5ee28a286a33.webp",
      avatar: "6f3cacc7a8ab.webp",
      platform: "Pump",
      name: "SLOPCORE",
      ticker: "SLOPCORE",
      recipient: "anabology",
      handle: "anabology",
      age: "9d",
      mc: "$311.6K",
      amount: "35,082.92",
      address: "EkFRff9a2jKztJHML1LG9FRmEkPJDR6XAYp3uCPdpump",
      shortAddress: "EkFRff\u2026Pdpump"
    },
    {
      href: "/token/DAemPFNc3RtibBDKkUA4eL2Ns11q9VRdbpptmqm8DGqN",
      image: "92f094c7ecca.webp",
      avatar: "34e038eb3c0c.webp",
      platform: "Pump",
      name: "cake.xmr",
      ticker: "CAKE",
      recipient: "Vik Shar\u0271a - Cake Wallet & Radar Chat",
      handle: "vikrantnyc",
      age: "10d",
      mc: "$73.3K",
      amount: "34,512.87",
      address: "DAemPFNc3RtibBDKkUA4eL2Ns11q9VRdbpptmqm8DGqN",
      shortAddress: "DAemPF\u2026m8DGqN"
    },
    {
      href: "/token/GZik7vJSnDAao9tbbcLrMGKfxLu7VCjoAtkDhsv8A3iE",
      image: "0b763e4b6b54.webp",
      avatar: "a0d799d5cef6.webp",
      platform: "Pump",
      name: "Kevin Startup Fund",
      ticker: "KEVIN",
      recipient: "Kevin Bass",
      handle: "kevinnbass",
      age: "20d",
      mc: "$6.7K",
      amount: "33,982.75",
      address: "GZik7vJSnDAao9tbbcLrMGKfxLu7VCjoAtkDhsv8A3iE",
      shortAddress: "GZik7v\u2026v8A3iE"
    },
    {
      href: "/token/J1yxV53EmVRmt9RUj6PPufMfdAYUbtgwXCuNYTBTsYzJ",
      image: "50ac1d625fd3.webp",
      avatar: "a041f101f074.webp",
      platform: "Pump",
      name: "JACK",
      ticker: "JACK",
      recipient: "Jack Doherty",
      handle: "dohertyjackk",
      age: "10d",
      mc: "$72.3K",
      amount: "30,510.68",
      address: "J1yxV53EmVRmt9RUj6PPufMfdAYUbtgwXCuNYTBTsYzJ",
      shortAddress: "J1yxV5\u2026BTsYzJ"
    },
    {
      href: "/token/A7iQ8N5jKDrg1YUxJ7v8aN5AtkwJaUTNhq1jZ8YLFrAJ",
      image: "125c80fc6cd2.webp",
      avatar: "df751c00c192.webp",
      platform: "Pump",
      name: "Alx",
      ticker: "ALX",
      recipient: "ALX",
      handle: "alx",
      age: "21d",
      mc: "$57.7K",
      amount: "28,433.41",
      address: "A7iQ8N5jKDrg1YUxJ7v8aN5AtkwJaUTNhq1jZ8YLFrAJ",
      shortAddress: "A7iQ8N\u2026YLFrAJ"
    }
  ],
  topTokens: [
    {
      href: "/token/CbcyNo7m1amFWqEQm2m4PLv1UNvpcL3C1Ujm6AkzpKoU",
      image: "e4f322780f36.webp",
      avatar: "a30d37032508.webp",
      platform: "Pump",
      name: "Effective Accelerationism",
      ticker: "e/acc",
      recipient: "Beff (e/acc)",
      handle: "beffjezos",
      age: "11d",
      mc: "$6.5M",
      badge: "individual"
    },
    {
      href: "/token/8k4sBtEeK4pf26noKqApv8NBTnuSJcbdwpKYknk5PbAA",
      image: "0375653a166b.webp",
      avatar: "94a387c00c47.webp",
      platform: "Pump",
      name: "CALI",
      ticker: "CALI",
      recipient: "Maye Musk",
      handle: "mayemusk",
      age: "19d",
      mc: "$1.3M",
      badge: "individual"
    },
    {
      href: "/token/CvUX4G2tzq7J3ECmNvWZLayZYV6KpgQp6SJ5K8Uvsu5g",
      image: "3d4ad1096c7b.webp",
      avatar: "b8c20f9d2fff.webp",
      platform: "Pump",
      name: "parafactual",
      ticker: "parafactual",
      recipient: "You",
      handle: "parafactual",
      age: "13d",
      mc: "$501.8K",
      badge: "individual"
    },
    {
      href: "/token/55Vr2VpSwxsDkB6uGGHAvRv86K6zax2Zb4TT8ivwDEzW",
      image: "525d44a6c884.webp",
      avatar: "26e067423af8.webp",
      platform: "Pump",
      name: "slopcannon",
      ticker: "slopcannon",
      recipient: "bone",
      handle: "bonegpt",
      age: "11d",
      mc: "$468.6K",
      badge: "individual"
    },
    {
      href: "/token/GY9mZfyPpxXxBXBxS2hB2XjhP3kfUsywTvgveozxpump",
      image: "4cf02f25c5f6.webp",
      avatar: "88e4212bd945.webp",
      platform: "Pump",
      name: "Elon Coin",
      ticker: "ELON",
      recipient: "Elon Musk",
      handle: "elonmusk",
      age: "34d",
      mc: "$410.4K",
      badge: "individual"
    },
    {
      href: "/token/EkFRff9a2jKztJHML1LG9FRmEkPJDR6XAYp3uCPdpump",
      image: "5ee28a286a33.webp",
      avatar: "6f3cacc7a8ab.webp",
      platform: "Pump",
      name: "SLOPCORE",
      ticker: "SLOPCORE",
      recipient: "anabology",
      handle: "anabology",
      age: "9d",
      mc: "$286.5K",
      badge: "individual"
    },
    {
      href: "/token/9yfiomKJ2fdHiZQ3MK9AJniu8eR2eSjCzfMEo1zXpump",
      image: "1a85b73364b1.webp",
      avatar: "381a8b806d56.webp",
      platform: "Pump",
      name: "Justice for frogman",
      ticker: "FROGMAN",
      recipient: "Frogman",
      handle: "frogmanhaha",
      age: "1h",
      mc: "$202.9K",
      badge: "individual"
    },
    {
      href: "/token/Fj886GvHFyxQhunb4pw7WLRPRASNh25LT8Zpv8qqr3Ab",
      image: "255c34d72981.webp",
      avatar: "93920d12819c.webp",
      platform: "Pump",
      name: "Howling Mutant",
      ticker: "MUTANT",
      recipient: "HowlingMutant",
      handle: "howlingmutant0",
      age: "11d",
      mc: "$141.6K",
      badge: "individual"
    },
    {
      href: "/token/9U1f18idDeySFnYrurxqT1f5n5nE4g4Uk5LLzP69bh1",
      image: "c6a85a27f42c.webp",
      avatar: "a99b44ee4d6c.webp",
      platform: "Pump",
      name: "Solana Cat",
      ticker: "SOLCAT",
      recipient: "Solana",
      handle: "solana",
      age: "19d",
      mc: "$105.8K",
      badge: "individual"
    },
    {
      href: "/token/FaL1PFQhNo4JAGaQKSnKurWeNtpexqEAduQjR4H6pump",
      image: "7de9bcbe3217.webp",
      avatar: "20650c1e33fc.webp",
      platform: "Pump",
      name: "deflock",
      ticker: "DeFlock",
      recipient: "P",
      handle: "stackppr",
      age: "19d",
      mc: "$105.7K",
      badge: "individual"
    },
    {
      href: "/token/7cXWSNTq71PZREBmGCBvZirkNwoGokWBQz9fWferViiV",
      image: "f31c01eb32f5.webp",
      avatar: "aad51dac7d8f.webp",
      platform: "Pump",
      name: "Asteroid",
      ticker: "ASTEROID",
      recipient: "Rebecca Perrotto",
      handle: "rebeccaperrotto",
      age: "21d",
      mc: "$101.9K",
      badge: "individual"
    },
    {
      href: "/token/5wW9mhbwq1HTFh341iimpmrqBB4mfxdXiYhdYBL7hUnp",
      image: "64fe204fbb44.webp",
      avatar: "a30d37032508.webp",
      platform: "Pump",
      name: "Kardashev Research",
      ticker: "KARDASHEV",
      recipient: "Beff (e/acc)",
      handle: "beffjezos",
      age: "11d",
      mc: "$93.7K",
      badge: "individual"
    },
    {
      href: "/token/D4SeBJ4Cra65HtQPiB4v9RgyqbMXXgXacZsefsb1pump",
      image: "9a2cf743c9f6.webp",
      avatar: "76a0d379e73b.webp",
      platform: "Pump",
      name: "Kardashev Research",
      ticker: "KARDASHEV",
      recipient: "\u2605",
      handle: "tsssssssss0",
      age: "11d",
      mc: "$78.7K",
      badge: "individual"
    },
    {
      href: "/token/DAemPFNc3RtibBDKkUA4eL2Ns11q9VRdbpptmqm8DGqN",
      image: "92f094c7ecca.webp",
      avatar: "34e038eb3c0c.webp",
      platform: "Pump",
      name: "cake.xmr",
      ticker: "CAKE",
      recipient: "Vik Shar\u0271a - Cake Wallet & Radar Chat",
      handle: "vikrantnyc",
      age: "10d",
      mc: "$73.8K",
      badge: "individual"
    },
    {
      href: "/token/J1yxV53EmVRmt9RUj6PPufMfdAYUbtgwXCuNYTBTsYzJ",
      image: "50ac1d625fd3.webp",
      avatar: "a041f101f074.webp",
      platform: "Pump",
      name: "JACK",
      ticker: "JACK",
      recipient: "Jack Doherty",
      handle: "dohertyjackk",
      age: "10d",
      mc: "$72.3K",
      badge: "individual"
    },
    {
      href: "/token/HgoScXAo4zFv5kDb6axGrwuz95FaVEcLskyDVZfo297z",
      image: "1e067537c347.webp",
      avatar: "285b180549d1.webp",
      platform: "Pump",
      name: "TheMarsSociety",
      ticker: "MARTIANS",
      recipient: "The Mars Society",
      handle: "themarssociety",
      age: "10d",
      mc: "$66.1K",
      badge: "individual"
    },
    {
      href: "/token/CC5D6puFmcsnGaJh7kNXeAcRpL2SZzQfoQezvx45uKjt",
      image: "a7ff5c9adae5.webp",
      avatar: "b9ee4469288c.webp",
      platform: "Pump",
      name: "Save The Boy, Save The World",
      ticker: "WORLD",
      recipient: "Marc Malone",
      handle: "iammarcmalone",
      age: "10d",
      mc: "$64.1K",
      badge: "individual"
    },
    {
      href: "/token/A7iQ8N5jKDrg1YUxJ7v8aN5AtkwJaUTNhq1jZ8YLFrAJ",
      image: "125c80fc6cd2.webp",
      avatar: "df751c00c192.webp",
      platform: "Pump",
      name: "Alx",
      ticker: "ALX",
      recipient: "ALX",
      handle: "alx",
      age: "21d",
      mc: "$57.7K",
      badge: "individual"
    },
    {
      href: "/token/EX3vJeVbHhD1tPUnm8zaeMtj9jvFPd3aSGfhShrmpump",
      image: "02128f8dd32c.webp",
      avatar: "",
      platform: "Pump",
      name: "Never Doom",
      ticker: "NEVERDOOM",
      recipient: "",
      handle: "",
      age: "7d",
      mc: "$54.7K",
      badge: ""
    },
    {
      href: "/token/FFPSq1ByV2XdPTj2UkSPRe14NoQydUkarBLeNfXd1gdj",
      image: "e39ace3d074f.webp",
      avatar: "d78d53a154e7.webp",
      platform: "Pump",
      name: "Fleshcoin",
      ticker: "FLESH",
      recipient: "Flesh Simulator",
      handle: "fleshsimulator",
      age: "10d",
      mc: "$54.2K",
      badge: "individual"
    }
  ]
};
var feeBarSnapshot = [
  [
    82700.58,
    116863.89,
    175917224e-2,
    750155.39,
    344286.94,
    144903.38,
    67092.1,
    105027.19,
    92120.48,
    48834.36,
    31980.87,
    26474.23,
    78027.57,
    38483.63
  ],
  [
    27287.67,
    44120.17,
    351980.11,
    147634.23,
    79992.83,
    22738.13,
    36229.43,
    27937.53,
    21480.82,
    10186.75,
    11658.15,
    6579.96,
    19192.79,
    9016.91
  ]
];

// react/components/singlespark-business/Surface.tsx
import { jsx as jsx37 } from "react/jsx-runtime";
function Surface({
  children,
  className = ""
}) {
  return /* @__PURE__ */ jsx37("div", { className: "u-business " + className, children });
}

// react/components/singlespark-business/Icon.tsx
import { jsx as jsx38 } from "react/jsx-runtime";
function Icon2({ name, size = 16 }) {
  return /* @__PURE__ */ jsx38(SingleSparkIcon, { name, size });
}

// react/components/singlespark-business/Badge.tsx
import { jsx as jsx39 } from "react/jsx-runtime";
function Badge() {
  return /* @__PURE__ */ jsx39(
    "svg",
    {
      className: "ub-account-badge",
      viewBox: "0 0 22 22",
      fill: "currentColor",
      "aria-hidden": "true",
      children: /* @__PURE__ */ jsx39("path", { d: "M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" })
    }
  );
}

// react/components/singlespark-business/External.tsx
import { jsx as jsx40 } from "react/jsx-runtime";
function External({
  children,
  href,
  className = ""
}) {
  return /* @__PURE__ */ jsx40("a", { href, className, target: "_blank", rel: "noreferrer", children });
}

// react/components/singlespark-business/TokenCardCore.tsx
import { Fragment as Fragment12, jsx as jsx41, jsxs as jsxs23 } from "react/jsx-runtime";
function TokenCardCore({
  token: p,
  onRecipientClick,
  catalog = false
}) {
  return /* @__PURE__ */ jsxs23("article", { className: "ub-token-card " + (catalog ? "ub-catalog-card" : ""), children: [
    /* @__PURE__ */ jsxs23("div", { className: "ub-token-photo", children: [
      /* @__PURE__ */ jsx41(External, { href: "https://usepaid.app" + p.href, children: /* @__PURE__ */ jsx41("img", { src: asset(p.image), alt: p.name }) }),
      /* @__PURE__ */ jsx41("span", { className: "ub-platform-badge", children: /* @__PURE__ */ jsx41(
        "img",
        {
          src: asset(p.platform.toLowerCase() + "-logo.png"),
          alt: p.platform
        }
      ) }),
      /* @__PURE__ */ jsx41("span", { className: "ub-token-age", children: p.age }),
      p.handle && /* @__PURE__ */ jsxs23(
        SingleSparkButton,
        {
          className: "ub-recipient-chip",
          "aria-label": "Show tokens routed to @" + p.handle,
          onClick: () => onRecipientClick?.(p.handle),
          children: [
            /* @__PURE__ */ jsx41(Icon2, { name: "wallet", size: 14 }),
            p.avatar && /* @__PURE__ */ jsx41("img", { className: "ub-avatar", src: asset(p.avatar), alt: "" }),
            /* @__PURE__ */ jsx41("span", { children: p.recipient }),
            p.badge && /* @__PURE__ */ jsx41(Badge, {})
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs23("div", { className: "ub-token-caption", children: [
      /* @__PURE__ */ jsxs23("div", { children: [
        /* @__PURE__ */ jsx41("span", { children: p.name }),
        /* @__PURE__ */ jsx41("code", { children: p.ticker })
      ] }),
      catalog ? /* @__PURE__ */ jsxs23(Fragment12, { children: [
        /* @__PURE__ */ jsxs23("div", { className: "ub-catalog-values", children: [
          /* @__PURE__ */ jsxs23("span", { children: [
            /* @__PURE__ */ jsx41("strong", { children: p.mc }),
            /* @__PURE__ */ jsx41("small", { children: "MC" })
          ] }),
          /* @__PURE__ */ jsxs23("span", { children: [
            /* @__PURE__ */ jsx41(Icon2, { name: "wallet" }),
            /* @__PURE__ */ jsx41("strong", { children: p.amount }),
            /* @__PURE__ */ jsx41("small", { children: "Sent" })
          ] })
        ] }),
        /* @__PURE__ */ jsx41(SingleSparkCopyButton, { value: p.address || "", className: "ub-contract-button", children: /* @__PURE__ */ jsx41("code", { children: p.shortAddress }) })
      ] }) : /* @__PURE__ */ jsxs23("div", { children: [
        /* @__PURE__ */ jsx41("strong", { children: p.mc }),
        /* @__PURE__ */ jsx41("small", { children: "MC" })
      ] })
    ] })
  ] });
}

// react/components/singlespark-business/SingleSparkTokenCard.tsx
import { jsx as jsx42 } from "react/jsx-runtime";
function SingleSparkTokenCard({
  token = singleSparkBusinessSnapshot.topTokens[0],
  onRecipientClick,
  className,
  onNavigate
}) {
  return /* @__PURE__ */ jsx42(Surface, { className, children: /* @__PURE__ */ jsx42("div", { className: "ub-single-token", children: /* @__PURE__ */ jsx42(
    TokenCardCore,
    {
      token,
      onRecipientClick: onRecipientClick || (() => onNavigate?.("RecipientSummary"))
    }
  ) }) });
}

// react/components/singlespark-business/Launchpads.tsx
import { jsx as jsx43, jsxs as jsxs24 } from "react/jsx-runtime";
function Launchpads({
  value,
  onChange,
  includeAll = true,
  pumpOnly = false
}) {
  const values = pumpOnly ? ["Pump"] : includeAll ? ["Pump", "Pons", "All"] : ["Pump", "Pons"];
  return /* @__PURE__ */ jsx43("div", { className: "ub-launchpads", role: "group", "aria-label": "Launchpad", children: values.map((v) => /* @__PURE__ */ jsxs24(
    SingleSparkButton,
    {
      "aria-pressed": value === v,
      className: value === v ? "ub-selected" : "",
      onClick: () => onChange(v),
      children: [
        v !== "All" && /* @__PURE__ */ jsx43("img", { src: asset(v.toLowerCase() + "-logo.png"), alt: "" }),
        v
      ]
    },
    v
  )) });
}

// react/components/singlespark-business/LaunchpadFilter.tsx
import { jsx as jsx44 } from "react/jsx-runtime";
function LaunchpadFilter({
  value,
  defaultValue = "All",
  onChange,
  includeAll = true,
  className
}) {
  const [v, set] = useValue(value, defaultValue, onChange);
  return /* @__PURE__ */ jsx44(Surface, { className, children: /* @__PURE__ */ jsx44(Launchpads, { value: v, onChange: set, includeAll }) });
}

// react/components/singlespark-business/SectionPagination.tsx
import { jsx as jsx45 } from "react/jsx-runtime";
function SectionPagination({
  page,
  totalPages = 5,
  onPageChange,
  className
}) {
  const [p, set] = useValue(page, 1, onPageChange);
  return /* @__PURE__ */ jsx45(Surface, { className, children: /* @__PURE__ */ jsx45(SingleSparkPagination, { page: p, totalPages, onPageChange: set }) });
}

// react/components/singlespark-business/TopTokenGrid.tsx
import { useState as useState7 } from "react";
import { jsx as jsx46, jsxs as jsxs25 } from "react/jsx-runtime";
function TopTokenGrid({
  tokens = singleSparkBusinessSnapshot.topTokens,
  className
}) {
  const [platform, setPlatform] = useState7("All");
  const [profile, setProfile] = useState7("");
  const [page, setPage] = useState7(1);
  const filtered = tokens.filter(
    (p) => (platform === "All" || p.platform === platform) && (!profile || p.handle === profile)
  );
  return /* @__PURE__ */ jsx46(Surface, { className, children: /* @__PURE__ */ jsxs25("section", { className: "ub-top-token-section", children: [
    /* @__PURE__ */ jsxs25("div", { className: "ub-heading", children: [
      /* @__PURE__ */ jsxs25("div", { children: [
        /* @__PURE__ */ jsx46("h2", { children: "Top Tokens" }),
        /* @__PURE__ */ jsx46(
          Launchpads,
          {
            value: platform,
            onChange: (p) => {
              setPlatform(p);
              setProfile("");
              setPage(1);
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsx46(
        SingleSparkPagination,
        {
          page,
          totalPages: Math.max(1, Math.ceil(filtered.length / 20)),
          onPageChange: setPage
        }
      )
    ] }),
    /* @__PURE__ */ jsx46("div", { className: "ub-token-grid", children: filtered.slice((page - 1) * 20, page * 20).map((p) => /* @__PURE__ */ jsx46(
      TokenCardCore,
      {
        token: p,
        onRecipientClick: (h) => {
          setProfile(h);
          setPage(1);
        }
      },
      p.href
    )) }),
    !filtered.length && /* @__PURE__ */ jsx46("p", { className: "ub-empty", children: "No tokens found." })
  ] }) });
}

// react/components/singlespark-business/TopProfileList.tsx
import { useState as useState8 } from "react";

// react/components/singlespark-business/Heading.tsx
import { jsx as jsx47, jsxs as jsxs26 } from "react/jsx-runtime";
function Heading({
  children,
  right
}) {
  return /* @__PURE__ */ jsxs26("div", { className: "ub-heading", children: [
    /* @__PURE__ */ jsx47("h2", { children }),
    right
  ] });
}

// react/components/singlespark-business/TopProfileList.tsx
import { jsx as jsx48, jsxs as jsxs27 } from "react/jsx-runtime";
function TopProfileList({
  profiles = singleSparkBusinessSnapshot.profiles,
  className
}) {
  const [page, setPage] = useState8(1);
  return /* @__PURE__ */ jsxs27(Surface, { className, children: [
    /* @__PURE__ */ jsx48(
      Heading,
      {
        right: /* @__PURE__ */ jsx48(
          SingleSparkPagination,
          {
            page,
            totalPages: Math.max(1, Math.ceil(profiles.length / 5)),
            onPageChange: setPage
          }
        ),
        children: "Top X Profiles"
      }
    ),
    /* @__PURE__ */ jsx48("div", { className: "ub-profile-cards", children: profiles.slice((page - 1) * 5, page * 5).map((p) => /* @__PURE__ */ jsxs27(
      External,
      {
        className: "ub-profile-card",
        href: "https://usepaid.app/profile/" + p.handle,
        children: [
          /* @__PURE__ */ jsx48("div", { className: "ub-profile-banner", children: /* @__PURE__ */ jsx48("img", { src: asset(p.banner), alt: "" }) }),
          /* @__PURE__ */ jsxs27("div", { className: "ub-profile-card-body", children: [
            /* @__PURE__ */ jsx48(
              "img",
              {
                className: "ub-profile-card-avatar",
                src: asset(p.avatar),
                alt: ""
              }
            ),
            /* @__PURE__ */ jsx48("strong", { children: p.name }),
            /* @__PURE__ */ jsxs27("small", { children: [
              "@",
              p.handle
            ] }),
            /* @__PURE__ */ jsxs27("span", { className: "ub-profile-tag", children: [
              /* @__PURE__ */ jsx48(Icon2, { name: "wallet" }),
              "SingleSpark Profile"
            ] }),
            /* @__PURE__ */ jsxs27("div", { className: "ub-profile-card-stats", children: [
              /* @__PURE__ */ jsxs27("span", { children: [
                /* @__PURE__ */ jsx48("b", { children: p.tokens }),
                " Tokens"
              ] }),
              /* @__PURE__ */ jsxs27("span", { children: [
                /* @__PURE__ */ jsx48(Icon2, { name: "wallet", size: 18 }),
                /* @__PURE__ */ jsx48("b", { children: p.amount }),
                /* @__PURE__ */ jsx48("small", { children: "Recorded transfers" })
              ] })
            ] })
          ] })
        ]
      },
      p.handle
    )) })
  ] });
}

// react/components/singlespark-business/TopSingleSparkTokenList.tsx
import { useState as useState9 } from "react";
import { jsx as jsx49, jsxs as jsxs28 } from "react/jsx-runtime";
function TopSingleSparkTokenList({
  payments = singleSparkBusinessSnapshot.paid,
  className
}) {
  const [page, setPage] = useState9(1);
  return /* @__PURE__ */ jsxs28(Surface, { className, children: [
    /* @__PURE__ */ jsx49(
      Heading,
      {
        right: /* @__PURE__ */ jsx49(
          SingleSparkPagination,
          {
            page,
            totalPages: Math.max(1, Math.ceil(payments.length / 6)),
            onPageChange: setPage
          }
        ),
        children: "Top paid tokens"
      }
    ),
    /* @__PURE__ */ jsx49("div", { className: "ub-stack", children: payments.slice((page - 1) * 6, page * 6).map((p, i) => /* @__PURE__ */ jsxs28(
      "article",
      {
        className: "ub-payment ub-top-paid",
        style: { animationDelay: i * 45 + "ms" },
        children: [
          /* @__PURE__ */ jsxs28("div", { className: "ub-singlespark-avatars", children: [
            /* @__PURE__ */ jsxs28(External, { href: "https://usepaid.app" + p.href, children: [
              /* @__PURE__ */ jsx49("img", { src: asset(p.image), alt: p.ticker }),
              /* @__PURE__ */ jsx49("span", { children: /* @__PURE__ */ jsx49(
                "img",
                {
                  src: asset(p.platform.toLowerCase() + "-logo.png"),
                  alt: p.platform
                }
              ) })
            ] }),
            /* @__PURE__ */ jsx49(Icon2, { name: "wallet", size: 20 }),
            /* @__PURE__ */ jsxs28(External, { href: "https://usepaid.app" + p.profile, children: [
              /* @__PURE__ */ jsx49("img", { src: asset(p.avatar), alt: p.name }),
              /* @__PURE__ */ jsx49("span", { children: "X" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs28("div", { className: "ub-top-singlespark-amount", children: [
            /* @__PURE__ */ jsx49("strong", { children: p.amount }),
            /* @__PURE__ */ jsx49("small", { children: p.unsent })
          ] })
        ]
      },
      p.href
    )) })
  ] });
}

// react/components/singlespark-business/ExploreFiltersCore.tsx
import { jsx as jsx50, jsxs as jsxs29 } from "react/jsx-runtime";
function ExploreFiltersCore({
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxs29("div", { className: "ub-explore-filters", children: [
    /* @__PURE__ */ jsx50("div", { className: "ub-explore-venues", role: "group", "aria-label": "Launchpad", children: ["Pump", "Pons"].map((v) => /* @__PURE__ */ jsxs29(
      "button",
      {
        type: "button",
        role: "checkbox",
        "aria-checked": value.venues.includes(v),
        onClick: () => onChange({
          ...value,
          venues: value.venues.includes(v) ? value.venues.filter((p) => p !== v) : [...value.venues, v]
        }),
        children: [
          /* @__PURE__ */ jsx50("span", { children: /* @__PURE__ */ jsx50("img", { src: asset(v.toLowerCase() + "-logo.png"), alt: "" }) }),
          v
        ]
      },
      v
    )) }),
    /* @__PURE__ */ jsxs29("label", { className: "ub-search", children: [
      /* @__PURE__ */ jsx50(Icon2, { name: "search" }),
      /* @__PURE__ */ jsx50(
        "input",
        {
          placeholder: "Search by contract address",
          "aria-label": "Search launches by contract address, name or ticker",
          value: value.query,
          onChange: (e) => onChange({ ...value, query: e.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ jsx50(
      SingleSparkTabs,
      {
        values: ["Total X Payments", "Market Cap", "Recent"],
        value: value.sort,
        onChange: (sort) => onChange({ ...value, sort })
      }
    )
  ] });
}

// react/components/singlespark-business/ExploreFilters.tsx
import { jsx as jsx51 } from "react/jsx-runtime";
function ExploreFilters({
  value,
  onChange,
  className
}) {
  const [v, set] = useValue(value, initialExplore, onChange);
  return /* @__PURE__ */ jsx51(Surface, { className, children: /* @__PURE__ */ jsx51(ExploreFiltersCore, { value: v, onChange: set }) });
}

// react/components/singlespark-business/TokenCatalog.tsx
import { jsx as jsx52, jsxs as jsxs30 } from "react/jsx-runtime";
function TokenCatalog({
  tokens = singleSparkBusinessSnapshot.catalog,
  filters,
  onFiltersChange,
  className
}) {
  const [v, set] = useValue(filters, initialExplore, onFiltersChange);
  const query = v.query.toLowerCase().trim();
  const records = tokens.filter(
    (p) => v.venues.includes(p.platform) && [p.name, p.ticker, p.address, p.handle].some(
      (s) => s?.toLowerCase().includes(query)
    )
  );
  const cap = (s) => parseFloat(s.replace(/[$,]/g, "")) * (s.endsWith("M") ? 1e6 : s.endsWith("K") ? 1e3 : 1);
  const age = (s) => parseFloat(s) * (s.endsWith("d") ? 1440 : s.endsWith("h") ? 60 : 1);
  records.sort(
    (a, b) => v.sort === "Market Cap" ? cap(b.mc) - cap(a.mc) : v.sort === "Recent" ? age(a.age) - age(b.age) : parseFloat((b.amount || "0").replace(/,/g, "")) - parseFloat((a.amount || "0").replace(/,/g, ""))
  );
  return /* @__PURE__ */ jsx52(Surface, { className, children: /* @__PURE__ */ jsxs30("section", { className: "ub-catalog", children: [
    /* @__PURE__ */ jsx52("h2", { children: "All launches" }),
    /* @__PURE__ */ jsx52(ExploreFiltersCore, { value: v, onChange: set }),
    /* @__PURE__ */ jsx52("div", { className: "ub-catalog-grid", children: records.map((p) => /* @__PURE__ */ jsx52(
      TokenCardCore,
      {
        token: p,
        catalog: true,
        onRecipientClick: (handle) => set({ ...v, query: handle })
      },
      p.href
    )) }),
    !records.length && /* @__PURE__ */ jsx52("p", { className: "ub-empty", children: "No tokens found." })
  ] }) });
}

// react/components/singlespark-business/TrendingStrip.tsx
import { jsx as jsx53, jsxs as jsxs31 } from "react/jsx-runtime";
function TrendingStrip({
  tokens = singleSparkBusinessSnapshot.trending,
  className,
  onNavigate,
  motionPaused = false
}) {
  return /* @__PURE__ */ jsx53(Surface, { className, children: /* @__PURE__ */ jsxs31("section", { className: "ub-trending-section", children: [
    /* @__PURE__ */ jsxs31("div", { children: [
      /* @__PURE__ */ jsx53("h2", { children: "Trending" }),
      /* @__PURE__ */ jsx53(SingleSparkButton, { onClick: () => onNavigate?.("TokenCatalog"), children: "View all" })
    ] }),
    /* @__PURE__ */ jsx53("div", { className: "ub-trending-window", children: /* @__PURE__ */ jsx53(
      "div",
      {
        className: "ub-trending-track",
        style: motionPaused ? { animationPlayState: "paused" } : void 0,
        children: [false, true].map((copy) => /* @__PURE__ */ jsx53(
          "div",
          {
            className: "ub-trending-group",
            "aria-hidden": copy || void 0,
            children: tokens.map((p) => /* @__PURE__ */ jsxs31(
              "a",
              {
                href: "https://usepaid.app" + p.href,
                target: "_blank",
                rel: "noreferrer",
                tabIndex: copy ? -1 : void 0,
                children: [
                  /* @__PURE__ */ jsx53("img", { src: asset(p.image), alt: "" }),
                  /* @__PURE__ */ jsxs31("span", { children: [
                    /* @__PURE__ */ jsx53("strong", { children: p.name }),
                    /* @__PURE__ */ jsx53("code", { children: p.ticker })
                  ] }),
                  /* @__PURE__ */ jsxs31("span", { className: "ub-trending-amount", children: [
                    /* @__PURE__ */ jsx53("small", { children: "Sent" }),
                    /* @__PURE__ */ jsxs31("strong", { children: [
                      /* @__PURE__ */ jsx53(Icon2, { name: "wallet", size: 14 }),
                      p.amount
                    ] })
                  ] })
                ]
              },
              p.href
            ))
          },
          String(copy)
        ))
      }
    ) })
  ] }) });
}

// react/components/singlespark-business/PaymentCore.tsx
import { useId as useId5 } from "react";

// react/components/singlespark-business/AssetTransferCore.tsx
import { jsx as jsx54, jsxs as jsxs32 } from "react/jsx-runtime";
function AssetTransferCore({ transfer }) {
  return /* @__PURE__ */ jsxs32(SingleSparkListRow, { label: /* @__PURE__ */ jsx54("span", { className: "ub-muted", children: transfer.asset }), children: [
    /* @__PURE__ */ jsx54("strong", { children: transfer.amount }),
    /* @__PURE__ */ jsx54(External, { href: transfer.transactionUrl, children: /* @__PURE__ */ jsx54(Icon2, { name: "external", size: 14 }) })
  ] });
}

// react/components/singlespark-business/BreakdownCore.tsx
import { Fragment as Fragment13, jsx as jsx55, jsxs as jsxs33 } from "react/jsx-runtime";
function BreakdownCore({
  data,
  defaultOpen = false
}) {
  return /* @__PURE__ */ jsx55(
    SingleSparkAccordion,
    {
      className: "ub-breakdown",
      defaultOpen,
      label: /* @__PURE__ */ jsxs33(Fragment13, { children: [
        /* @__PURE__ */ jsxs33("span", { className: "ub-breakdown-name", children: [
          /* @__PURE__ */ jsx55("img", { src: asset(data.image), alt: "" }),
          "$",
          data.ticker
        ] }),
        /* @__PURE__ */ jsx55("strong", { className: "ub-push", children: data.amount })
      ] }),
      children: /* @__PURE__ */ jsx55("div", { className: "ub-asset-transfer", children: data.transfers.map((t, i) => /* @__PURE__ */ jsx55(AssetTransferCore, { transfer: t }, i)) })
    }
  );
}

// react/components/singlespark-business/PaymentCore.tsx
import { jsx as jsx56, jsxs as jsxs34 } from "react/jsx-runtime";
function PaymentCore({
  payment,
  recipientLabel = "claimed by",
  avatar,
  children,
  expanded,
  onExpandedChange
}) {
  const p = payment || defaultSingleSparkPayment;
  const [open, setOpen] = useValue(expanded, false, onExpandedChange);
  const id = useId5();
  return /* @__PURE__ */ jsxs34("article", { className: "ub-payment ub-expand " + (open ? "ub-open" : ""), children: [
    /* @__PURE__ */ jsxs34("div", { className: "ub-payment-main", children: [
      /* @__PURE__ */ jsxs34("div", { className: "ub-payment-text", children: [
        /* @__PURE__ */ jsx56("p", { children: p.amount }),
        /* @__PURE__ */ jsxs34("div", { children: [
          /* @__PURE__ */ jsx56("span", { children: recipientLabel }),
          /* @__PURE__ */ jsx56("strong", { children: p.recipient })
        ] })
      ] }),
      /* @__PURE__ */ jsx56("span", { className: "ub-payment-avatar", children: avatar ?? /* @__PURE__ */ jsx56(
        "img",
        {
          className: "ub-avatar",
          src: asset(p.avatar),
          alt: p.recipient
        }
      ) }),
      /* @__PURE__ */ jsx56("span", { className: "ub-time", children: p.age }),
      /* @__PURE__ */ jsx56(
        "button",
        {
          type: "button",
          className: "ub-card-toggle",
          "aria-expanded": open,
          "aria-controls": id,
          "aria-label": `${p.amount} \xB7 ${recipientLabel} ${p.recipient}`,
          onClick: () => setOpen(!open)
        }
      ),
      /* @__PURE__ */ jsx56("span", { className: "ub-card-chevron", children: /* @__PURE__ */ jsx56(Icon2, { name: "chevron" }) })
    ] }),
    /* @__PURE__ */ jsx56("div", { className: "ub-expand-grid", children: /* @__PURE__ */ jsx56("div", { children: /* @__PURE__ */ jsx56(
      "div",
      {
        className: "ub-expand-body",
        id,
        ref: (node) => {
          if (node) node.inert = !open;
        },
        "aria-hidden": !open,
        children: children ?? p.breakdowns.map((b, i) => /* @__PURE__ */ jsx56(BreakdownCore, { data: b }, i))
      }
    ) }) })
  ] });
}

// react/components/singlespark-business/PaymentRow.tsx
import { jsx as jsx57 } from "react/jsx-runtime";
function PaymentRow({ className, ...props }) {
  return /* @__PURE__ */ jsx57(Surface, { className, children: /* @__PURE__ */ jsx57(PaymentCore, { ...props }) });
}

// react/components/singlespark-business/PaymentBreakdown.tsx
import { jsx as jsx58 } from "react/jsx-runtime";
function PaymentBreakdown({
  breakdown = demoBreakdown,
  className
}) {
  return /* @__PURE__ */ jsx58(Surface, { className, children: /* @__PURE__ */ jsx58(SingleSparkPanel, { className: "ub-breakdown-panel", children: /* @__PURE__ */ jsx58(BreakdownCore, { data: breakdown, defaultOpen: true }) }) });
}

// react/components/singlespark-business/AssetTransferRow.tsx
import { jsx as jsx59 } from "react/jsx-runtime";
function AssetTransferRow({
  transfer = demoTransfer,
  className
}) {
  return /* @__PURE__ */ jsx59(Surface, { className, children: /* @__PURE__ */ jsx59(AssetTransferCore, { transfer }) });
}

// react/components/singlespark-business/PaymentSummary.tsx
import { jsx as jsx60, jsxs as jsxs35 } from "react/jsx-runtime";
function PaymentSummary({
  payouts = "$1,918,920.59",
  claims = "$564,531.81",
  payoutsLabel = "X Money payouts",
  claimsLabel = "Manual claims",
  unit,
  className
}) {
  return /* @__PURE__ */ jsx60(Surface, { className, children: /* @__PURE__ */ jsxs35("div", { className: "ub-payment-summary", children: [
    /* @__PURE__ */ jsxs35("div", { className: "ub-intro-grid", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx60("span", {}),
      /* @__PURE__ */ jsx60("span", {})
    ] }),
    /* @__PURE__ */ jsxs35("div", { children: [
      /* @__PURE__ */ jsx60("small", { children: payoutsLabel }),
      /* @__PURE__ */ jsxs35("strong", { children: [
        /* @__PURE__ */ jsx60(SingleSparkMoney, { value: payouts }),
        unit && /* @__PURE__ */ jsx60("span", { className: "ub-summary-unit", children: unit })
      ] })
    ] }),
    /* @__PURE__ */ jsxs35("div", { children: [
      /* @__PURE__ */ jsx60("small", { children: claimsLabel }),
      /* @__PURE__ */ jsxs35("strong", { children: [
        /* @__PURE__ */ jsx60(SingleSparkMoney, { value: claims }),
        unit && /* @__PURE__ */ jsx60("span", { className: "ub-summary-unit", children: unit })
      ] })
    ] })
  ] }) });
}

// react/components/singlespark-business/HistoricalReceiptDetails.tsx
import { jsx as jsx61, jsxs as jsxs36 } from "react/jsx-runtime";
function HistoricalReceiptDetails({ className }) {
  return /* @__PURE__ */ jsxs36(Surface, { className, children: [
    /* @__PURE__ */ jsx61(
      SingleSparkKeyValueList,
      {
        entries: [
          ["Recipient", "Beff (e/acc) @beffjezos"],
          ["Token address", /* @__PURE__ */ jsx61("code", { children: tokenMint })],
          ["Date & time", "Sep 26, 2026, 3:10 PM"],
          ["Amount", "$ 8260.16"],
          ["Transaction ID", "CfSGHkYYK6rb8zDdDkmVH"]
        ]
      }
    ),
    /* @__PURE__ */ jsxs36(
      External,
      {
        href: "https://usepaid.app/api/payout/68e8caf5-9dac-4936-9e12-ec4644aef57c/receipt",
        className: "ub-button ub-primary ub-full",
        children: [
          "View receipt ",
          /* @__PURE__ */ jsx61(Icon2, { name: "external", size: 14 })
        ]
      }
    )
  ] });
}

// react/components/singlespark-business/RampDetailsCore.tsx
import { Fragment as Fragment14, jsx as jsx62, jsxs as jsxs37 } from "react/jsx-runtime";
function RampDetailsCore() {
  return /* @__PURE__ */ jsxs37(Fragment14, { children: [
    /* @__PURE__ */ jsx62(
      SingleSparkKeyValueList,
      {
        entries: [
          ["Amount", "20.308300108 SOL"],
          ["To", /* @__PURE__ */ jsx62("code", { children: "7bnp7SDB63bDvFKaMuALBpNiJRzjzwyHSk7gA1NAUfJW" })],
          ["Transaction", /* @__PURE__ */ jsx62("code", { children: rampTx })],
          ["Sent", "Sep 27, 2026, 7:56 AM"],
          ["Credited at Kraken", "Waiting for Kraken"]
        ]
      }
    ),
    /* @__PURE__ */ jsxs37(
      External,
      {
        href: "https://solscan.io/tx/" + rampTx,
        className: "ub-button ub-primary ub-full",
        children: [
          "View on Solscan ",
          /* @__PURE__ */ jsx62(Icon2, { name: "external", size: 14 })
        ]
      }
    )
  ] });
}

// react/components/singlespark-business/RampEventDetails.tsx
import { jsx as jsx63 } from "react/jsx-runtime";
function RampEventDetails({ className }) {
  return /* @__PURE__ */ jsx63(Surface, { className, children: /* @__PURE__ */ jsx63(SingleSparkPanel, { children: /* @__PURE__ */ jsx63(RampDetailsCore, {}) }) });
}

// react/components/singlespark-business/OffRampList.tsx
import { useState as useState11 } from "react";

// react/components/singlespark-business/RampCard.tsx
import { useState as useState10 } from "react";

// react/components/singlespark-business/Sol.tsx
import { jsx as jsx64 } from "react/jsx-runtime";
function Sol() {
  return /* @__PURE__ */ jsx64(
    "svg",
    {
      width: "22",
      height: "18",
      viewBox: "0 0 397.7 311.7",
      fill: "currentColor",
      "aria-hidden": "true",
      children: /* @__PURE__ */ jsx64("path", { d: "M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7zM64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8zM333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" })
    }
  );
}

// react/components/singlespark-business/Kraken.tsx
import { jsx as jsx65 } from "react/jsx-runtime";
function Kraken() {
  return /* @__PURE__ */ jsx65(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: "20",
      height: "20",
      fill: "#fff",
      "aria-hidden": "true",
      children: /* @__PURE__ */ jsx65("path", { d: "M2 18.8V12a10 10 0 0 1 20 0v6.8a2.2 2.2 0 0 1-4.4 0v-3.1a1.7 1.7 0 0 0-3.4 0v3.1a2.2 2.2 0 0 1-4.4 0v-3.1a1.7 1.7 0 0 0-3.4 0v3.1a2.2 2.2 0 0 1-4.4 0Z" })
    }
  );
}

// react/components/singlespark-business/RampCard.tsx
import { jsx as jsx66, jsxs as jsxs38 } from "react/jsx-runtime";
function RampCard({ type }) {
  const [open, setOpen] = useState10(false);
  const incoming = type === "On-ramp", swap = type === "Swaps", ach = type === "ACH";
  const amount = incoming ? "$1,946.36" : swap || ach ? "$2,511.47" : "20.31 SOL", verb = incoming ? "from" : swap ? "swapped" : ach ? "USD sent to" : "sent to", recipient = incoming || !ach && !swap ? "Kraken" : swap ? "20.52 SOL" : "X Money";
  const details = incoming ? [
    ["Amount", "$1,946.36"],
    ["Method", "ACH deposit"],
    ["From", "Kraken (@krakenfx)"],
    ["Kraken reference", "FTIh3eT-SUmecUAIYqa7pBYDMcge1u"],
    ["X transaction", "CfRJwZNcgjDUHAfS2vKJP"],
    ["Received", "Sep 26, 2026, 3:06 AM"]
  ] : swap ? [
    ["Swapped", "20.515870498 SOL"],
    ["Market", "SOL/USD, market order"],
    ["Average price", "$122.60 per SOL"],
    ["Gross", "$2,515.25"],
    ["Kraken fee", "$3.77 (0.15%)"],
    ["Received", "$2,511.47"],
    ["Order ID", "OVK4DF-A2FZF-W3FKEU"],
    ["Filled", "Sep 27, 2026, 7:51 AM"]
  ] : [
    ["Amount", "$2,511.47"],
    ["Method", "ACH (Plaid Transfer)"],
    ["From", "Kraken USD balance"],
    ["To", "X Money checking"],
    ["Kraken reference", "FTE6glV-TiwbdLlRW6JkShWgqdkeKR"],
    ["Initiated", "Sep 27, 2026, 7:51 AM"]
  ];
  return /* @__PURE__ */ jsxs38("article", { className: "ub-payment ub-expand " + (open ? "ub-open" : ""), children: [
    /* @__PURE__ */ jsxs38("div", { className: "ub-burn-main", children: [
      /* @__PURE__ */ jsxs38("div", { className: "ub-payment-text", children: [
        /* @__PURE__ */ jsx66("p", { children: amount }),
        /* @__PURE__ */ jsxs38("div", { children: [
          /* @__PURE__ */ jsx66("span", { children: verb }),
          /* @__PURE__ */ jsx66("strong", { children: recipient })
        ] })
      ] }),
      /* @__PURE__ */ jsxs38("div", { className: "ub-burn-route", children: [
        /* @__PURE__ */ jsx66("span", { children: incoming || ach ? "$" : /* @__PURE__ */ jsx66(Sol, {}) }),
        /* @__PURE__ */ jsx66(Icon2, { name: "arrow" }),
        /* @__PURE__ */ jsx66("span", { className: ach ? "ub-xmoney-icon" : "ub-kraken-icon", children: ach ? "X" : /* @__PURE__ */ jsx66(Kraken, {}) })
      ] }),
      /* @__PURE__ */ jsxs38(
        "span",
        {
          className: "ub-burn-status " + (!incoming && !swap ? "ub-sent-status" : ""),
          children: [
            incoming ? "Received" : swap ? "Swapped" : "Sent",
            " ",
            /* @__PURE__ */ jsx66("small", { children: incoming ? "11d" : "10d" })
          ]
        }
      ),
      /* @__PURE__ */ jsx66(
        "button",
        {
          type: "button",
          className: "ub-card-toggle",
          "aria-expanded": open,
          "aria-label": "Show " + type + " details",
          onClick: () => setOpen(!open)
        }
      ),
      /* @__PURE__ */ jsx66("span", { className: "ub-card-chevron", children: /* @__PURE__ */ jsx66(Icon2, { name: "chevron" }) })
    ] }),
    /* @__PURE__ */ jsx66("div", { className: "ub-expand-grid", children: /* @__PURE__ */ jsx66("div", { children: /* @__PURE__ */ jsx66(
      "div",
      {
        className: "ub-expand-body",
        "aria-hidden": !open,
        ref: (node) => {
          if (node) node.inert = !open;
        },
        children: type === "Deposits" ? /* @__PURE__ */ jsx66(RampDetailsCore, {}) : /* @__PURE__ */ jsx66(SingleSparkKeyValueList, { entries: details })
      }
    ) }) })
  ] });
}

// react/components/singlespark-business/OffRampList.tsx
import { jsx as jsx67, jsxs as jsxs39 } from "react/jsx-runtime";
function OffRampList({ className }) {
  const [tab, setTab] = useState11("All");
  return /* @__PURE__ */ jsxs39(Surface, { className, children: [
    /* @__PURE__ */ jsx67(Heading, { children: "Off-ramp" }),
    /* @__PURE__ */ jsx67(
      SingleSparkTabs,
      {
        values: ["All", "Deposits", "Swaps", "ACH"],
        value: tab,
        onChange: setTab
      }
    ),
    /* @__PURE__ */ jsx67("div", { className: "ub-stack", children: (tab === "All" ? ["Deposits", "ACH", "Swaps"] : [tab]).map((t) => /* @__PURE__ */ jsx67(RampCard, { type: t }, t)) })
  ] });
}

// react/components/singlespark-business/OnRampList.tsx
import { jsx as jsx68, jsxs as jsxs40 } from "react/jsx-runtime";
function OnRampList({ className }) {
  return /* @__PURE__ */ jsxs40(Surface, { className, children: [
    /* @__PURE__ */ jsx68(Heading, { children: "On-ramp" }),
    /* @__PURE__ */ jsx68(RampCard, { type: "On-ramp" })
  ] });
}

// react/components/singlespark-business/SingleSparkTokenHeader.tsx
import { jsx as jsx69, jsxs as jsxs41 } from "react/jsx-runtime";
function SingleSparkTokenHeader({
  token = singleSparkBusinessSnapshot.topTokens[0],
  marketCap,
  className
}) {
  const mint = token.href.split("/").at(-1) || tokenMint;
  return /* @__PURE__ */ jsx69(Surface, { className, children: /* @__PURE__ */ jsxs41(SingleSparkPanel, { className: "ub-identity-panel", children: [
    /* @__PURE__ */ jsxs41("div", { className: "ub-token-identity", children: [
      /* @__PURE__ */ jsxs41("span", { className: "ub-framed-avatar ub-green-frame", children: [
        /* @__PURE__ */ jsx69("img", { src: asset(token.image), alt: token.ticker }),
        /* @__PURE__ */ jsx69("i", { children: /* @__PURE__ */ jsx69(
          "img",
          {
            src: asset(token.platform.toLowerCase() + "-logo.png"),
            alt: token.platform
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs41("div", { children: [
        /* @__PURE__ */ jsxs41("h1", { children: [
          /* @__PURE__ */ jsx69("strong", { children: token.ticker }),
          /* @__PURE__ */ jsx69("span", { children: token.name }),
          /* @__PURE__ */ jsx69(SingleSparkCopyButton, { value: mint })
        ] }),
        /* @__PURE__ */ jsxs41("p", { children: [
          /* @__PURE__ */ jsx69("span", { className: "ub-success", children: "Sep 25" }),
          " ",
          /* @__PURE__ */ jsx69(External, { href: "https://x.com/" + (token.handle || "singleSpark"), children: "X" }),
          " ",
          /* @__PURE__ */ jsx69(External, { href: "https://pump.fun/coin/" + mint, children: /* @__PURE__ */ jsx69(Icon2, { name: "external" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs41("div", { className: "ub-recorded", children: [
      /* @__PURE__ */ jsx69("strong", { children: marketCap || token.mc }),
      /* @__PURE__ */ jsx69("small", { children: "MC" })
    ] })
  ] }) });
}

// react/components/singlespark-business/RecipientSummary.tsx
import { jsx as jsx70, jsxs as jsxs42 } from "react/jsx-runtime";
function RecipientSummary({
  name = "Beff (e/acc)",
  handle = "beffjezos",
  avatar = "avatar-0.webp",
  recorded = "152,362.48",
  className
}) {
  return /* @__PURE__ */ jsx70(Surface, { className, children: /* @__PURE__ */ jsxs42(SingleSparkPanel, { className: "ub-identity-panel", children: [
    /* @__PURE__ */ jsxs42("div", { className: "ub-token-identity", children: [
      /* @__PURE__ */ jsxs42("span", { className: "ub-framed-avatar", children: [
        /* @__PURE__ */ jsx70("img", { className: "ub-avatar", src: asset(avatar), alt: "" }),
        /* @__PURE__ */ jsx70("i", { children: "X" })
      ] }),
      /* @__PURE__ */ jsxs42("div", { children: [
        /* @__PURE__ */ jsx70("h1", { children: /* @__PURE__ */ jsx70("strong", { children: name }) }),
        /* @__PURE__ */ jsx70("p", { children: /* @__PURE__ */ jsx70(External, { href: "https://x.com/" + handle, children: "X" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs42("div", { className: "ub-recorded", children: [
      /* @__PURE__ */ jsx70("strong", { children: recorded }),
      /* @__PURE__ */ jsx70("small", { children: "Recorded" })
    ] })
  ] }) });
}

// react/components/singlespark-business/ClaimEligibilityCard.tsx
import { jsx as jsx71, jsxs as jsxs43 } from "react/jsx-runtime";
function ClaimEligibilityCard({
  handle = "beffjezos",
  balance = "$7,594.60",
  solBalance = "63.205686161 SOL",
  onClaim,
  className,
  onNavigate
}) {
  return /* @__PURE__ */ jsx71(Surface, { className, children: /* @__PURE__ */ jsxs43(SingleSparkPanel, { children: [
    /* @__PURE__ */ jsxs43("div", { className: "ub-claim-heading", children: [
      /* @__PURE__ */ jsxs43("div", { children: [
        /* @__PURE__ */ jsxs43("strong", { children: [
          "Are you @",
          handle,
          "?"
        ] }),
        /* @__PURE__ */ jsx71("p", { children: "Claim all your creator fees - SOL and original quote assets - to a wallet you control." })
      ] }),
      /* @__PURE__ */ jsx71(
        SingleSparkButton,
        {
          className: "ub-primary",
          onClick: () => onClaim ? onClaim() : onNavigate?.("ClaimSignIn"),
          children: "Claim Fees"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs43("div", { className: "ub-claim-balance", children: [
      /* @__PURE__ */ jsx71("small", { children: "Claimable Balance \xB7 all tokens" }),
      /* @__PURE__ */ jsx71("strong", { children: balance }),
      /* @__PURE__ */ jsx71("p", { children: "SOL balance is across all your tokens; original quote assets below are for this token. USD is the fee value recorded at collection, not current market value." }),
      /* @__PURE__ */ jsx71(SingleSparkListRow, { label: "SOL", children: solBalance })
    ] })
  ] }) });
}

// react/components/singlespark-business/HistoricalBalanceCard.tsx
import { jsx as jsx72, jsxs as jsxs44 } from "react/jsx-runtime";
function HistoricalBalanceCard({
  balance = "$25,200.27",
  className
}) {
  return /* @__PURE__ */ jsx72(Surface, { className, children: /* @__PURE__ */ jsxs44("div", { className: "ub-historical", children: [
    /* @__PURE__ */ jsx72("strong", { children: "Earlier X Money balance" }),
    /* @__PURE__ */ jsx72("strong", { className: "ub-historical-value", children: balance }),
    /* @__PURE__ */ jsx72("p", { children: "Kept separate from the SOL claim." })
  ] }) });
}

// react/components/singlespark-business/MarketChartCore.tsx
import { useEffect as useEffect4, useRef as useRef5, useState as useState12 } from "react";
import { jsx as jsx73, jsxs as jsxs45 } from "react/jsx-runtime";
function MarketChartCore({
  interval: controlled,
  onIntervalChange,
  candles,
  symbol = "e/acc/USD",
  onCandleChange
}) {
  const [interval, setIntervalValue] = useValue(
    controlled,
    "5m",
    onIntervalChange
  );
  const canvas = useRef5(null);
  const [status, setStatus] = useState12("Loading\u2026");
  const [ohlc, setOhlc] = useState12();
  const [beams, setBeams] = useState12([]);
  const callback = useRef5(onCandleChange);
  callback.current = onCandleChange;
  useEffect4(() => {
    const element = canvas.current;
    if (!element) return;
    const controller = new AbortController();
    let disposed = false;
    let chart;
    let observer;
    let frame = 0;
    setStatus("Loading\u2026");
    setBeams([]);
    setOhlc(void 0);
    Promise.all([
      import(
        /* @vite-ignore */
        MarketChartCoreAsset0.href
      ),
      candles ? Promise.resolve(candles) : fetch(candleUrls[interval], { signal: controller.signal }).then(
        (r) => {
          if (!r.ok) throw new Error("Snapshot unavailable");
          return r.json();
        }
      )
    ]).then(([library, raw]) => {
      if (disposed || !element.isConnected) return;
      const seen = /* @__PURE__ */ new Set();
      const data = raw.filter((c) => {
        if (!Number.isFinite(c.time) || seen.has(c.time) || !["open", "high", "low", "close"].every(
          (k) => Number.isFinite(c[k])
        ))
          return false;
        seen.add(c.time);
        return true;
      }).sort((a, b) => a.time - b.time);
      if (!data.length) throw new Error("No chart data for this timeframe.");
      chart = library.createChart(element, {
        autoSize: true,
        layout: {
          background: { type: library.ColorType.Solid, color: "#1a1a1a" },
          textColor: "rgba(255,255,255,0.4)",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontSize: 11
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.045)" },
          horzLines: { color: "rgba(255,255,255,0.05)" }
        },
        rightPriceScale: { borderColor: "rgba(255,255,255,0.08)" },
        timeScale: {
          borderColor: "rgba(255,255,255,0.08)",
          timeVisible: true,
          secondsVisible: false,
          barSpacing: 9,
          rightOffset: 6
        },
        crosshair: {
          mode: library.CrosshairMode.Normal,
          vertLine: {
            color: "rgba(255,255,255,0.2)",
            labelBackgroundColor: "#2a2a2a"
          },
          horzLine: {
            color: "rgba(255,255,255,0.2)",
            labelBackgroundColor: "#2a2a2a"
          }
        },
        localization: { priceFormatter: chartFormat }
      });
      const series = chart.addCandlestickSeries({
        upColor: "#26a269",
        downColor: "#e5484d",
        wickUpColor: "#26a269",
        wickDownColor: "#e5484d",
        borderVisible: false,
        priceFormat: {
          type: "custom",
          formatter: chartFormat,
          minMove: 1e-7
        }
      });
      series.setData(data);
      chart.timeScale().scrollToRealTime();
      setStatus("");
      setOhlc(data.at(-1));
      chart.subscribeCrosshairMove(
        (p) => {
          const c = p.seriesData.get(series);
          if (c && !disposed) {
            setOhlc(c);
            callback.current?.(c);
          }
        }
      );
      const paint = () => {
        if (disposed) return;
        const height = element.clientHeight, a = series.coordinateToPrice(0), b = series.coordinateToPrice(height);
        if (a == null || b == null) return;
        const low = Math.min(a, b), high = Math.max(a, b), base = (high - low) / 6, power = 10 ** Math.floor(Math.log10(base)), ratio = base / power, step = (ratio >= 5 ? 5 : ratio >= 2 ? 2 : 1) * power, rows = [];
        if (!(step > 0)) return;
        for (let price = Math.ceil(low / step) * step; price <= high; price += step) {
          const y = series.priceToCoordinate(price);
          if (y > 6 && y < height - 6) rows.push(y);
        }
        setBeams(rows);
      };
      const schedule = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(paint);
      };
      chart.timeScale().subscribeVisibleLogicalRangeChange(schedule);
      observer = new ResizeObserver(schedule);
      observer.observe(element);
      schedule();
    }).catch((error) => {
      if (!disposed)
        setStatus(
          error.message === "No chart data for this timeframe." ? error.message : "Chart unavailable"
        );
    });
    return () => {
      disposed = true;
      controller.abort();
      cancelAnimationFrame(frame);
      observer?.disconnect();
      chart?.remove();
    };
  }, [interval, candles]);
  const delta = ohlc ? (ohlc.close - ohlc.open) / ohlc.open * 100 : 0;
  return /* @__PURE__ */ jsxs45("div", { className: "ub-market ub-real-market", children: [
    /* @__PURE__ */ jsx73("div", { className: "ub-market-toolbar", children: /* @__PURE__ */ jsx73(
      SingleSparkTabs,
      {
        values: ["1m", "5m", "15m", "1h", "4h", "1D"],
        value: interval,
        onChange: setIntervalValue
      }
    ) }),
    /* @__PURE__ */ jsxs45("div", { className: "ub-chart-stage", children: [
      /* @__PURE__ */ jsxs45("div", { className: "ub-chart-legend", children: [
        /* @__PURE__ */ jsxs45("strong", { children: [
          symbol,
          " Market Cap (USD)"
        ] }),
        ohlc && /* @__PURE__ */ jsxs45("span", { children: [
          "O",
          chartFormat(ohlc.open),
          " H",
          chartFormat(ohlc.high),
          " L",
          chartFormat(ohlc.low),
          " C",
          chartFormat(ohlc.close),
          " ",
          /* @__PURE__ */ jsxs45("span", { className: delta >= 0 ? "ub-success" : "ub-loss", children: [
            "(",
            delta >= 0 ? "+" : "",
            delta.toFixed(2),
            "%)"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx73("div", { className: "ub-chart-canvas", ref: canvas }),
      /* @__PURE__ */ jsx73("div", { className: "ub-chart-beams", "aria-hidden": "true", children: beams.map((y, i) => /* @__PURE__ */ jsx73("div", { style: { top: y }, children: /* @__PURE__ */ jsx73(
        "span",
        {
          style: {
            width: 26 + 13 * i % 22 + "%",
            "--ub-beam-duration": 2 + 0.37 * i % 1.2 + "s",
            "--ub-beam-delay": -0.9 * i + "s",
            background: `linear-gradient(90deg,transparent,hsl(${(47 * i + 205) % 360} 65% 58%) 42%,hsl(${(47 * i + 245) % 360} 65% 58%) 58%,transparent)`
          }
        }
      ) }, i)) }),
      status && /* @__PURE__ */ jsx73("span", { className: "ub-chart-loading", children: status })
    ] })
  ] });
}

// react/components/singlespark-business/SingleSparkMarketChart.tsx
import { jsx as jsx74 } from "react/jsx-runtime";
function SingleSparkMarketChart({ className, ...props }) {
  return /* @__PURE__ */ jsx74(Surface, { className, children: /* @__PURE__ */ jsx74(MarketChartCore, { ...props }) });
}

// react/components/singlespark-business/FeeClaimCore.tsx
import { jsx as jsx75, jsxs as jsxs46 } from "react/jsx-runtime";
function FeeClaimCore() {
  return /* @__PURE__ */ jsxs46("div", { className: "ub-fee-row", children: [
    /* @__PURE__ */ jsx75("strong", { children: "0.006046603 SOL" }),
    /* @__PURE__ */ jsx75("span", { children: "Claimed creator fees" }),
    /* @__PURE__ */ jsxs46(External, { href: "https://solscan.io/tx/Jz75gxjcxnsfyRnSLmSJjq3xHXmzqjXkG6HdFRzDBHextukT3k9DV7G5kXjDA9GJX3hjEtwhwSYHLCJxCdK7FdL", children: [
      "View transaction ",
      /* @__PURE__ */ jsx75(Icon2, { name: "external", size: 14 })
    ] })
  ] });
}

// react/components/singlespark-business/FeeClaimRow.tsx
import { jsx as jsx76 } from "react/jsx-runtime";
function FeeClaimRow({ className }) {
  return /* @__PURE__ */ jsx76(Surface, { className, children: /* @__PURE__ */ jsx76(FeeClaimCore, {}) });
}

// react/components/singlespark-business/TokenActivityTabs.tsx
import { useState as useState13 } from "react";
import { jsx as jsx77, jsxs as jsxs47 } from "react/jsx-runtime";
function TokenActivityTabs({
  payments = [defaultSingleSparkPayment],
  claims,
  className
}) {
  const [tab, setTab] = useState13(
    "Payments (25)"
  );
  return /* @__PURE__ */ jsxs47(Surface, { className, children: [
    /* @__PURE__ */ jsx77(
      SingleSparkTabs,
      {
        values: ["Payments (25)", "Claims (40)"],
        value: tab,
        onChange: setTab
      }
    ),
    /* @__PURE__ */ jsx77("div", { className: "ub-stack", children: tab === "Claims (40)" ? claims || /* @__PURE__ */ jsx77(FeeClaimCore, {}) : payments.map((p, i) => /* @__PURE__ */ jsx77(PaymentCore, { payment: p }, i)) })
  ] });
}

// react/components/singlespark-business/ProfileUnavailable.tsx
import { jsx as jsx78, jsxs as jsxs48 } from "react/jsx-runtime";
function ProfileUnavailable({ className }) {
  return /* @__PURE__ */ jsx78(Surface, { className, children: /* @__PURE__ */ jsxs48("div", { className: "ub-error", children: [
    /* @__PURE__ */ jsx78("h1", { children: "This page is unavailable" }),
    /* @__PURE__ */ jsx78("p", { children: "We could not reach the ledger. Please try again in a moment." })
  ] }) });
}

// react/components/singlespark-business/Unavailable.tsx
import { jsx as jsx79, jsxs as jsxs49 } from "react/jsx-runtime";
function Unavailable({
  title,
  children
}) {
  return /* @__PURE__ */ jsxs49("div", { className: "ub-unverified", children: [
    /* @__PURE__ */ jsx79("span", { children: "No verifiable interface captured" }),
    /* @__PURE__ */ jsx79("h3", { children: title }),
    /* @__PURE__ */ jsx79("p", { children })
  ] });
}

// react/components/singlespark-business/SingleSparkProfileContent.tsx
import { jsx as jsx80 } from "react/jsx-runtime";
function SingleSparkProfileContent({ className }) {
  return /* @__PURE__ */ jsx80(Surface, { className, children: /* @__PURE__ */ jsx80(Unavailable, { title: "Normal profile unverified", children: "The source returned a ledger error. No normal profile was obtained, so no speculative visual is provided." }) });
}

// react/components/singlespark-business/ClaimNotice.tsx
import { jsx as jsx81, jsxs as jsxs50 } from "react/jsx-runtime";
function ClaimNotice() {
  return /* @__PURE__ */ jsxs50("div", { className: "ub-claim-notice", children: [
    /* @__PURE__ */ jsx81("strong", { children: "Updated claim terms." }),
    " The manual-claim window is 14 days from availability. Existing balances receive a full 14 days after notice. Eligible unclaimed allocations then return to singleSpark\u2019s treasury, subject to existing rights, timely requests and holds. The Terms also describe fee ownership and discretionary distributions.",
    " ",
    /* @__PURE__ */ jsx81(External, { href: "https://usepaid.app/legal/terms", children: "Read the updated Terms" })
  ] });
}

// react/components/singlespark-business/ClaimTermsNotice.tsx
import { jsx as jsx82 } from "react/jsx-runtime";
function ClaimTermsNotice({ className }) {
  return /* @__PURE__ */ jsx82(Surface, { className, children: /* @__PURE__ */ jsx82(ClaimNotice, {}) });
}

// react/components/singlespark-business/ClaimSignIn.tsx
import { jsx as jsx83, jsxs as jsxs51 } from "react/jsx-runtime";
function ClaimSignIn({
  className,
  onAction,
  onSignIn
}) {
  return /* @__PURE__ */ jsx83(Surface, { className, children: /* @__PURE__ */ jsxs51("section", { className: "ub-claim-signin", children: [
    /* @__PURE__ */ jsx83("h1", { children: "Claim your fees" }),
    /* @__PURE__ */ jsx83("p", { children: "Claim one original recipient or deployer asset at a time to a wallet you control. The protocol share continues through its existing buyback policy. Historical X Money balances remain separate." }),
    /* @__PURE__ */ jsx83(ClaimNotice, {}),
    /* @__PURE__ */ jsx83(
      SingleSparkButton,
      {
        className: "ub-primary ub-full",
        onClick: () => onSignIn ? onSignIn() : onAction?.("sign-in"),
        children: "X\u3000 Sign in with X"
      }
    ),
    /* @__PURE__ */ jsxs51("small", { children: [
      "singleSpark is independent of X and X Money. X sign-in identifies your recipient account; it does not imply endorsement.",
      " ",
      /* @__PURE__ */ jsx83(External, { href: "https://usepaid.app/legal/terms", children: "Terms of Service" })
    ] })
  ] }) });
}

// react/components/singlespark-business/ClaimAssetPicker.tsx
import { jsx as jsx84 } from "react/jsx-runtime";
function ClaimAssetPicker({ className }) {
  return /* @__PURE__ */ jsx84(Surface, { className, children: /* @__PURE__ */ jsx84(Unavailable, { title: "Claim asset selection", children: "The public guide permits SOL or one original asset; the authenticated control layout remains unverified." }) });
}

// react/components/singlespark-business/ClaimWalletForm.tsx
import { jsx as jsx85 } from "react/jsx-runtime";
function ClaimWalletForm({ className }) {
  return /* @__PURE__ */ jsx85(Surface, { className, children: /* @__PURE__ */ jsx85(Unavailable, { title: "Claim wallet form", children: "The public guide requires a personal Solana wallet; the authenticated interface has not been obtained." }) });
}

// react/components/singlespark-business/ClaimStatusTracker.tsx
import { jsx as jsx86 } from "react/jsx-runtime";
function ClaimStatusTracker({ className }) {
  return /* @__PURE__ */ jsx86(Surface, { className, children: /* @__PURE__ */ jsx86(Unavailable, { title: "Claim status", children: "The public guide lists queued, processing, submitted and confirmed; the actual status component remains unverified." }) });
}

// react/components/singlespark-business/SingleSparkMark.tsx
import { jsx as jsx87 } from "react/jsx-runtime";
function SingleSparkMark() {
  return /* @__PURE__ */ jsx87("img", { className: "ub-singlespark-icon", src: asset("paid.svg"), alt: "PAID" });
}

// react/components/singlespark-business/CurrencyCore.tsx
import { jsx as jsx88, jsxs as jsxs52 } from "react/jsx-runtime";
function CurrencyCore({
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxs52("fieldset", { className: "ub-currency", children: [
    /* @__PURE__ */ jsx88("legend", { children: "Launch currency" }),
    /* @__PURE__ */ jsx88("div", { children: ["SOL", "PAID"].map((v) => /* @__PURE__ */ jsxs52(
      SingleSparkButton,
      {
        "aria-pressed": value === v,
        className: value === v ? "ub-selected" : "",
        onClick: () => onChange(v),
        children: [
          v === "SOL" ? /* @__PURE__ */ jsx88(Sol, {}) : /* @__PURE__ */ jsx88(SingleSparkMark, {}),
          "Launch with ",
          v
        ]
      },
      v
    )) }),
    /* @__PURE__ */ jsx88("p", { children: "Choose what people use to buy and sell your token. SOL is still needed for network fees." })
  ] });
}

// react/components/singlespark-business/LaunchCurrency.tsx
import { jsx as jsx89 } from "react/jsx-runtime";
function LaunchCurrency({
  value,
  onChange,
  className
}) {
  const [v, set] = useValue(value, "SOL", onChange);
  return /* @__PURE__ */ jsx89(Surface, { className, children: /* @__PURE__ */ jsx89(CurrencyCore, { value: v, onChange: set }) });
}

// react/components/singlespark-business/RecipientField.tsx
import { jsx as jsx90, jsxs as jsxs53 } from "react/jsx-runtime";
function RecipientField({
  value,
  onChange,
  label = "X Money sent to",
  hint
}) {
  return /* @__PURE__ */ jsxs53("label", { className: "ub-field", children: [
    /* @__PURE__ */ jsx90("span", { children: label }),
    /* @__PURE__ */ jsxs53("span", { className: "ub-input-icon", children: [
      /* @__PURE__ */ jsx90(Icon2, { name: "at" }),
      /* @__PURE__ */ jsx90(
        "input",
        {
          type: "text",
          placeholder: "Search X for an account",
          role: "combobox",
          "aria-expanded": "false",
          value,
          onChange: (e) => onChange(e.target.value)
        }
      )
    ] }),
    hint && /* @__PURE__ */ jsx90("small", { children: hint })
  ] });
}

// react/components/singlespark-business/SingleSparkRecipientSearch.tsx
import { jsx as jsx91 } from "react/jsx-runtime";
function SingleSparkRecipientSearch({
  value,
  onChange,
  className
}) {
  const [v, set] = useValue(value, "", onChange);
  return /* @__PURE__ */ jsx91(Surface, { className, children: /* @__PURE__ */ jsx91(RecipientField, { value: v, onChange: set }) });
}

// react/components/singlespark-business/DeployerCore.tsx
import { jsx as jsx92, jsxs as jsxs54 } from "react/jsx-runtime";
function DeployerCore({
  draft,
  onChange
}) {
  const valid = /^(?:|0|[1-9]|10)$/.test(draft.deployerReward);
  const reward = valid ? Number(draft.deployerReward) : 0;
  return /* @__PURE__ */ jsxs54("section", { className: "ub-deployer-reward", children: [
    /* @__PURE__ */ jsxs54("label", { className: "ub-field", children: [
      /* @__PURE__ */ jsx92("span", { children: "Deployer reward (optional)" }),
      /* @__PURE__ */ jsxs54("span", { className: "ub-input-icon", children: [
        /* @__PURE__ */ jsx92(
          "input",
          {
            type: "text",
            inputMode: "numeric",
            pattern: "(?:0|[1-9]|10)",
            placeholder: "0",
            value: draft.deployerReward,
            "aria-invalid": !valid,
            onChange: (e) => onChange({ deployerReward: e.target.value })
          }
        ),
        /* @__PURE__ */ jsx92("span", { children: "%" })
      ] }),
      /* @__PURE__ */ jsx92("small", { children: "0\u201310% of collected creator fees." })
    ] }),
    reward > 0 && /* @__PURE__ */ jsxs54("div", { className: "ub-deployer-details", children: [
      /* @__PURE__ */ jsx92(
        SingleSparkField,
        {
          label: "Deployer\u2019s X account",
          placeholder: "Search X for an account",
          value: draft.deployerHandle,
          onChange: (e) => onChange({ deployerHandle: e.target.value })
        }
      ),
      /* @__PURE__ */ jsxs54("div", { children: [
        /* @__PURE__ */ jsx92("p", { children: "For every $100 in collected creator fees" }),
        /* @__PURE__ */ jsxs54("dl", { children: [
          /* @__PURE__ */ jsxs54("div", { children: [
            /* @__PURE__ */ jsx92("dt", { children: "Recipient" }),
            /* @__PURE__ */ jsxs54("dd", { children: [
              "$",
              (80 - reward).toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxs54("div", { children: [
            /* @__PURE__ */ jsx92("dt", { children: "Deployer" }),
            /* @__PURE__ */ jsxs54("dd", { children: [
              "$",
              reward.toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxs54("div", { children: [
            /* @__PURE__ */ jsx92("dt", { children: "Protocol" }),
            /* @__PURE__ */ jsx92("dd", { children: "$20.00" })
          ] })
        ] }),
        /* @__PURE__ */ jsx92("p", { children: "The deployer reward is fixed at launch and deducted from the recipient pool. The collection-time policy determines the pool size." })
      ] })
    ] })
  ] });
}

// react/components/singlespark-business/DeployerRewardField.tsx
import { jsx as jsx93 } from "react/jsx-runtime";
function DeployerRewardField({
  value,
  onChange,
  className
}) {
  const [draft, change] = useDraft(value, onChange);
  return /* @__PURE__ */ jsx93(Surface, { className, children: /* @__PURE__ */ jsx93(DeployerCore, { draft, onChange: change }) });
}

// react/components/singlespark-business/MetadataCore.tsx
import { useEffect as useEffect5, useRef as useRef6, useState as useState14 } from "react";

// react/components/singlespark-business/SocialCore.tsx
import { jsx as jsx94, jsxs as jsxs55 } from "react/jsx-runtime";
function SocialCore({
  draft,
  onChange
}) {
  return /* @__PURE__ */ jsx94(SingleSparkAccordion, { className: "ub-socials", label: /* @__PURE__ */ jsx94("span", { children: "Social links (optional)" }), children: /* @__PURE__ */ jsxs55("div", { className: "ub-form-stack", children: [
    /* @__PURE__ */ jsx94(
      SingleSparkField,
      {
        label: "Website",
        placeholder: "Automatically your SingleSpark token link",
        value: draft.website,
        onChange: (e) => onChange({ website: e.target.value })
      }
    ),
    /* @__PURE__ */ jsx94("p", { className: "ub-caption", children: "Points to the token page on SingleSpark by default." }),
    /* @__PURE__ */ jsx94(
      SingleSparkField,
      {
        label: "Telegram",
        placeholder: "https://t.me/yourgroup",
        value: draft.telegram,
        onChange: (e) => onChange({ telegram: e.target.value })
      }
    ),
    /* @__PURE__ */ jsx94(
      SingleSparkField,
      {
        label: "X",
        placeholder: "Automatically your recipient\u2019s X profile",
        value: draft.x,
        onChange: (e) => onChange({ x: e.target.value })
      }
    )
  ] }) });
}

// react/components/singlespark-business/MetadataCore.tsx
import { jsx as jsx95, jsxs as jsxs56 } from "react/jsx-runtime";
function MetadataCore({
  draft,
  onChange,
  onImageFile
}) {
  const [filename, setFilename] = useState14("");
  const [error, setError] = useState14("");
  const preview = useRef6();
  useEffect5(
    () => () => {
      if (preview.current) URL.revokeObjectURL(preview.current);
    },
    []
  );
  return /* @__PURE__ */ jsxs56("div", { className: "ub-form-stack", children: [
    /* @__PURE__ */ jsxs56("div", { className: "ub-two-fields", children: [
      /* @__PURE__ */ jsx95(
        SingleSparkField,
        {
          label: "Name",
          placeholder: "Ledger Cat",
          maxLength: 32,
          value: draft.name,
          onChange: (e) => onChange({ name: e.target.value })
        }
      ),
      /* @__PURE__ */ jsx95(
        SingleSparkField,
        {
          label: "Ticker",
          placeholder: "LCAT",
          maxLength: 10,
          value: draft.ticker,
          onChange: (e) => onChange({ ticker: e.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs56("label", { className: "ub-field", children: [
      /* @__PURE__ */ jsx95("span", { children: "Token image" }),
      /* @__PURE__ */ jsxs56("span", { className: "ub-upload", children: [
        /* @__PURE__ */ jsx95(
          "input",
          {
            type: "file",
            accept: "image/*",
            onChange: (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
                setError("Choose an image smaller than 10 MB.");
                return;
              }
              setError("");
              setFilename(file.name);
              if (preview.current) URL.revokeObjectURL(preview.current);
              preview.current = URL.createObjectURL(file);
              onChange({ imageUrl: preview.current });
              onImageFile?.(file);
            }
          }
        ),
        /* @__PURE__ */ jsx95("span", { className: "ub-upload-icon", children: /* @__PURE__ */ jsx95(Icon2, { name: "image", size: 18 }) }),
        /* @__PURE__ */ jsx95("strong", { children: filename || "Choose image" })
      ] }),
      error && /* @__PURE__ */ jsx95("small", { role: "alert", children: error })
    ] }),
    /* @__PURE__ */ jsxs56("label", { className: "ub-field", children: [
      /* @__PURE__ */ jsx95("span", { children: "Description" }),
      /* @__PURE__ */ jsx95(
        "textarea",
        {
          placeholder: "What the token is.",
          maxLength: 256,
          value: draft.description,
          onChange: (e) => onChange({ description: e.target.value })
        }
      ),
      /* @__PURE__ */ jsxs56("small", { children: [
        draft.description.length,
        "/256 characters including the fee lines"
      ] })
    ] }),
    /* @__PURE__ */ jsx95(SocialCore, { draft, onChange })
  ] });
}

// react/components/singlespark-business/SingleSparkMetadataForm.tsx
import { jsx as jsx96 } from "react/jsx-runtime";
function SingleSparkMetadataForm({
  value,
  onChange,
  onImageFile,
  className
}) {
  const [draft, change] = useDraft(value, onChange);
  return /* @__PURE__ */ jsx96(Surface, { className, children: /* @__PURE__ */ jsx96(MetadataCore, { draft, onChange: change, onImageFile }) });
}

// react/components/singlespark-business/SocialLinksFields.tsx
import { jsx as jsx97 } from "react/jsx-runtime";
function SocialLinksFields({
  value,
  onChange,
  className
}) {
  const [draft, change] = useDraft(value, onChange);
  return /* @__PURE__ */ jsx97(Surface, { className, children: /* @__PURE__ */ jsx97(SocialCore, { draft, onChange: change }) });
}

// react/components/singlespark-business/InitialBuyCore.tsx
import { Fragment as Fragment15, jsx as jsx98, jsxs as jsxs57 } from "react/jsx-runtime";
function InitialBuyCore({
  value,
  onChange,
  platform = "Pump"
}) {
  return /* @__PURE__ */ jsxs57("label", { className: "ub-field", children: [
    /* @__PURE__ */ jsxs57("span", { children: [
      "Initial buy ",
      /* @__PURE__ */ jsx98("small", { children: "(optional)" })
    ] }),
    /* @__PURE__ */ jsxs57("span", { className: "ub-input-icon", children: [
      /* @__PURE__ */ jsx98(
        "input",
        {
          type: "number",
          min: "0",
          step: "any",
          placeholder: "0",
          value,
          onChange: (e) => onChange(e.target.value)
        }
      ),
      /* @__PURE__ */ jsx98("span", { children: platform === "Pons" ? "ETH" : /* @__PURE__ */ jsxs57(Fragment15, { children: [
        /* @__PURE__ */ jsx98(Sol, {}),
        " SOL"
      ] }) })
    ] })
  ] });
}

// react/components/singlespark-business/InitialBuyField.tsx
import { jsx as jsx99 } from "react/jsx-runtime";
function InitialBuyField({
  value,
  onChange,
  platform = "Pump",
  className
}) {
  const [v, set] = useValue(value, "", onChange);
  return /* @__PURE__ */ jsx99(Surface, { className, children: /* @__PURE__ */ jsx99(InitialBuyCore, { value: v, onChange: set, platform }) });
}

// react/components/singlespark-business/TaxCore.tsx
import { Fragment as Fragment16, jsx as jsx100, jsxs as jsxs58 } from "react/jsx-runtime";
function TaxCore({
  value,
  onChange
}) {
  const valid = Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 10;
  return /* @__PURE__ */ jsxs58(Fragment16, { children: [
    /* @__PURE__ */ jsx100(
      SingleSparkField,
      {
        label: "Added creator tax",
        type: "number",
        placeholder: "0",
        min: 0,
        max: 10,
        step: 0.01,
        value,
        "aria-invalid": !valid,
        onChange: (e) => onChange(e.target.value)
      }
    ),
    /* @__PURE__ */ jsx100("p", { className: "ub-caption", children: "1% base trading fee + 0\u201310% added creator tax. This setting is permanent." }),
    /* @__PURE__ */ jsx100(SingleSparkListRow, { label: "Total trading tax", children: /* @__PURE__ */ jsx100("strong", { children: valid ? 1 + Number(value) + "%" : "0%" }) })
  ] });
}

// react/components/singlespark-business/PonsTaxField.tsx
import { jsx as jsx101 } from "react/jsx-runtime";
function PonsTaxField({
  value,
  onChange,
  className
}) {
  const [v, set] = useValue(value, "", onChange);
  return /* @__PURE__ */ jsx101(Surface, { className, children: /* @__PURE__ */ jsx101(TaxCore, { value: v, onChange: set }) });
}

// react/components/singlespark-business/ConsentCore.tsx
import { jsx as jsx102, jsxs as jsxs59 } from "react/jsx-runtime";
function ConsentCore({
  agreed,
  onChange,
  onConnect
}) {
  return /* @__PURE__ */ jsxs59("div", { className: "ub-consent", children: [
    /* @__PURE__ */ jsxs59("label", { children: [
      /* @__PURE__ */ jsx102(
        "input",
        {
          type: "checkbox",
          checked: agreed,
          onChange: (e) => onChange(e.target.checked)
        }
      ),
      /* @__PURE__ */ jsxs59("span", { children: [
        "I agree to the",
        " ",
        /* @__PURE__ */ jsx102(External, { href: "https://usepaid.app/legal/terms", children: "Terms of Use" }),
        " ",
        "and",
        " ",
        /* @__PURE__ */ jsx102(External, { href: "https://usepaid.app/legal/disclosures", children: "Disclosures" }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxs59(SingleSparkButton, { className: "ub-primary ub-full", onClick: onConnect, children: [
      /* @__PURE__ */ jsx102(Icon2, { name: "wallet" }),
      "Connect wallet"
    ] }),
    /* @__PURE__ */ jsx102("p", { children: "By continuing you agree to the Terms of Use." })
  ] });
}

// react/components/singlespark-business/LaunchConsentAndWallet.tsx
import { jsx as jsx103 } from "react/jsx-runtime";
function LaunchConsentAndWallet({
  agreed,
  onAgreementChange,
  onConnect,
  className,
  onAction
}) {
  const [v, set] = useValue(agreed, false, onAgreementChange);
  return /* @__PURE__ */ jsx103(Surface, { className, children: /* @__PURE__ */ jsx103(
    ConsentCore,
    {
      agreed: v,
      onChange: set,
      onConnect: () => onConnect ? onConnect() : onAction?.("connect-wallet")
    }
  ) });
}

// react/components/singlespark-business/FeeSplitCore.tsx
import { jsx as jsx104 } from "react/jsx-runtime";
function FeeSplitCore({
  recipient = "\u2014",
  recipientShare = 65,
  treasuryShare = 10,
  buybackShare = 25
}) {
  return /* @__PURE__ */ jsx104(
    SingleSparkKeyValueList,
    {
      entries: [
        ["X Money sent to", recipient],
        ["Recipient share (current collections)", recipientShare + "%"],
        ["singleSpark treasury", treasuryShare + "%"],
        ["$PAID buybacks and burn", buybackShare + "%"]
      ]
    }
  );
}

// react/components/singlespark-business/PreviewCard.tsx
import { Fragment as Fragment17, jsx as jsx105, jsxs as jsxs60 } from "react/jsx-runtime";
function PreviewCard({
  draft,
  details
}) {
  return /* @__PURE__ */ jsxs60("div", { className: "ub-launch-preview-card", children: [
    /* @__PURE__ */ jsx105("div", { className: "ub-preview-photo", children: draft.imageUrl ? /* @__PURE__ */ jsx105("img", { src: draft.imageUrl, alt: "Selected token image" }) : /* @__PURE__ */ jsx105("span", { children: "\u2014" }) }),
    /* @__PURE__ */ jsxs60("div", { className: "ub-preview-title", children: [
      /* @__PURE__ */ jsx105("span", { children: draft.name || "Token name" }),
      /* @__PURE__ */ jsx105("code", { children: draft.ticker || "TICKER" })
    ] }),
    details !== void 0 ? details : /* @__PURE__ */ jsxs60(Fragment17, { children: [
      /* @__PURE__ */ jsxs60("div", { className: "ub-preview-values", children: [
        /* @__PURE__ */ jsx105("strong", { children: "$0" }),
        /* @__PURE__ */ jsx105("small", { children: "MC" }),
        /* @__PURE__ */ jsx105("strong", { children: "$0" }),
        /* @__PURE__ */ jsx105("small", { children: "Sent" })
      ] }),
      /* @__PURE__ */ jsx105(FeeSplitCore, { recipient: draft.recipient || "\u2014" })
    ] })
  ] });
}

// react/components/singlespark-business/PayoutFlow.tsx
import { useEffect as useEffect6, useState as useState15 } from "react";

// react/components/singlespark-business/XMoney.tsx
import { jsx as jsx106 } from "react/jsx-runtime";
function XMoney() {
  return /* @__PURE__ */ jsx106(
    "svg",
    {
      width: "27",
      height: "27",
      viewBox: "0 0 24 24",
      fill: "#4ade80",
      "aria-hidden": "true",
      children: /* @__PURE__ */ jsx106(
        "path",
        {
          fillRule: "evenodd",
          d: "M16.161 3.55h4.117l-1.924 6.416c1.283 1.091 2.098 2.717 2.098 4.534 0 3.286-2.664 5.95-5.95 5.95h-.22l-.5 2.5h-6.44l.5-2.5H3.227l2.033-6.781C4.204 12.595 3.552 11.124 3.552 9.5c0-3.286 2.664-5.95 5.95-5.95h.22l.5-2.5h6.44zm-4.88 1.9H9.502c-2.237 0-4.05 1.813-4.05 4.05s1.813 4.05 4.05 4.05h5c.525 0 .95.425.95.95s-.425.95-.95.95H6.709l-.93 3.1h4.382l-.5 2.5h2.562l.5-2.5h1.779c2.237 0 4.05-1.813 4.05-4.05s-1.813-4.05-4.05-4.05h-5c-.525 0-.95-.425-.95-.95 0-.525.425-.95.95-.95h7.293l.93-3.1h-3.882l.5-2.5H11.78z"
        }
      )
    }
  );
}

// react/components/singlespark-business/NotificationFrame.tsx
import { Fragment as Fragment18, jsx as jsx107, jsxs as jsxs61 } from "react/jsx-runtime";
function NotificationFrame({
  step = 0,
  className = "",
  age = "now",
  recipient = "Recipient",
  note = "Creator fees via @singleSpark",
  paused = false,
  title,
  children,
  actions,
  onClose,
  closeLabel = "Close",
  variant = "notification"
}) {
  const amount = [
    "5.00",
    "10.00",
    "20.00",
    "50.00",
    "100.00",
    "250.00",
    "500.00"
  ][Math.floor(step / 2) % 7];
  return /* @__PURE__ */ jsx107(
    "div",
    {
      className: "ub-notification " + (children !== void 0 ? "ub-notification-message " : "") + (variant === "toast" ? "ub-notification-toast " : "") + className,
      style: paused ? { animationPlayState: "paused" } : void 0,
      children: variant === "toast" ? /* @__PURE__ */ jsxs61(Fragment18, { children: [
        /* @__PURE__ */ jsx107("span", { className: "ub-notification-toast-text", children: children ?? title }),
        onClose && /* @__PURE__ */ jsx107(SingleSparkButton, { className: "ub-notification-close", "aria-label": closeLabel, onClick: onClose, children: /* @__PURE__ */ jsx107("span", { "aria-hidden": "true", children: /* @__PURE__ */ jsx107(Icon2, { name: "close" }) }) }),
        actions && /* @__PURE__ */ jsx107("div", { className: "ub-notification-actions", children: actions })
      ] }) : children !== void 0 ? /* @__PURE__ */ jsxs61(Fragment18, { children: [
        /* @__PURE__ */ jsxs61("div", { className: "ub-notification-heading", children: [
          /* @__PURE__ */ jsx107("span", { "aria-hidden": "true", children: /* @__PURE__ */ jsx107(Icon2, { name: "bell", size: 18 }) }),
          /* @__PURE__ */ jsx107("strong", { children: title }),
          onClose && /* @__PURE__ */ jsx107(SingleSparkButton, { className: "ub-notification-close", "aria-label": closeLabel, onClick: onClose, children: /* @__PURE__ */ jsx107("span", { "aria-hidden": "true", children: /* @__PURE__ */ jsx107(Icon2, { name: "close" }) }) })
        ] }),
        /* @__PURE__ */ jsx107("p", { className: "ub-notification-body", children }),
        actions && /* @__PURE__ */ jsx107("div", { className: "ub-notification-actions", children: actions })
      ] }) : step % 2 === 0 ? /* @__PURE__ */ jsxs61(Fragment18, { children: [
        /* @__PURE__ */ jsx107(Icon2, { name: "bell" }),
        /* @__PURE__ */ jsxs61("div", { className: "ub-notification-icons", children: [
          /* @__PURE__ */ jsx107(XMoney, {}),
          /* @__PURE__ */ jsx107(SingleSparkMark, {})
        ] }),
        /* @__PURE__ */ jsxs61("p", { children: [
          /* @__PURE__ */ jsx107("strong", { children: "SingleSpark" }),
          " sent you $",
          amount,
          " for \u201C",
          note,
          "\u201D",
          " ",
          /* @__PURE__ */ jsxs61("span", { children: [
            "\xB7 ",
            age
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxs61("div", { className: "ub-notification-receipt", children: [
        /* @__PURE__ */ jsxs61("div", { children: [
          /* @__PURE__ */ jsxs61("strong", { children: [
            "$",
            amount.replace(".00", "")
          ] }),
          /* @__PURE__ */ jsxs61("p", { children: [
            /* @__PURE__ */ jsx107("span", { children: "sent to" }),
            " ",
            /* @__PURE__ */ jsx107("b", { children: recipient })
          ] }),
          /* @__PURE__ */ jsxs61("small", { children: [
            "\u201C",
            note,
            "\u201D"
          ] })
        ] }),
        /* @__PURE__ */ jsxs61("div", { children: [
          /* @__PURE__ */ jsxs61("span", { className: "ub-mini-avatar-pair", children: [
            /* @__PURE__ */ jsx107(SingleSparkMark, {}),
            /* @__PURE__ */ jsx107("i", {})
          ] }),
          /* @__PURE__ */ jsx107("small", { children: age })
        ] })
      ] })
    }
  );
}

// react/components/singlespark-business/PayoutFlow.tsx
import { jsx as jsx108, jsxs as jsxs62 } from "react/jsx-runtime";
function PayoutFlow({
  paused = false,
  recipientName = "Recipient",
  note
}) {
  const [step, setStep] = useState15(0);
  const [reduced, setReduced] = useState15(false);
  useEffect6(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(media.matches);
    change();
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect6(() => {
    if (paused || reduced) return;
    const timer = setInterval(() => setStep((s) => s + 1), 3e3);
    return () => clearInterval(timer);
  }, [paused, reduced]);
  return /* @__PURE__ */ jsxs62("div", { className: "ub-notification-space", children: [
    /* @__PURE__ */ jsx108(
      NotificationFrame,
      {
        step,
        className: step ? "ub-notification-in" : "",
        recipient: recipientName,
        note,
        paused
      },
      "in-" + step
    ),
    step > 0 && /* @__PURE__ */ jsx108(
      NotificationFrame,
      {
        step: step - 1,
        className: "ub-notification-out",
        recipient: recipientName,
        note,
        age: "5s",
        paused
      },
      "out-" + step
    )
  ] });
}

// react/components/singlespark-business/LaunchPreviewCore.tsx
import { jsx as jsx109, jsxs as jsxs63 } from "react/jsx-runtime";
function LaunchPreviewCore({
  draft = {},
  details,
  notification,
  paused,
  motionPaused,
  recipientName,
  note
}) {
  return /* @__PURE__ */ jsxs63("aside", { className: "ub-launch-preview", children: [
    notification !== void 0 ? notification : /* @__PURE__ */ jsx109(
      PayoutFlow,
      {
        paused: paused || motionPaused,
        recipientName: recipientName || draft.recipient || "Recipient",
        note
      }
    ),
    /* @__PURE__ */ jsx109(PreviewCard, { draft, details })
  ] });
}

// react/components/singlespark-business/LaunchLivePreview.tsx
import { jsx as jsx110 } from "react/jsx-runtime";
function LaunchLivePreview({ className, ...props }) {
  return /* @__PURE__ */ jsx110(Surface, { className, children: /* @__PURE__ */ jsx110(LaunchPreviewCore, { ...props }) });
}

// react/components/singlespark-business/FeeSplitSummary.tsx
import { jsx as jsx111 } from "react/jsx-runtime";
function FeeSplitSummary({
  recipient,
  recipientShare,
  treasuryShare,
  buybackShare,
  className
}) {
  return /* @__PURE__ */ jsx111(Surface, { className, children: /* @__PURE__ */ jsx111(
    FeeSplitCore,
    {
      recipient,
      recipientShare,
      treasuryShare,
      buybackShare
    }
  ) });
}

// react/components/singlespark-business/RegisterCore.tsx
import { useEffect as useEffect7, useRef as useRef7, useState as useState16 } from "react";

// react/components/singlespark-business/TreasuryCopy.tsx
import { jsx as jsx112, jsxs as jsxs64 } from "react/jsx-runtime";
function TreasuryCopy() {
  return /* @__PURE__ */ jsx112(SingleSparkCopyButton, { value: treasury, className: "ub-treasury", children: /* @__PURE__ */ jsxs64("span", { children: [
    /* @__PURE__ */ jsx112("small", { children: "Pump fee-sharing address" }),
    /* @__PURE__ */ jsx112("code", { children: treasury })
  ] }) });
}

// react/components/singlespark-business/RegisterCore.tsx
import { Fragment as Fragment19, jsx as jsx113, jsxs as jsxs65 } from "react/jsx-runtime";
function RegisterCore({
  recipient: recipientValue,
  mint: mintValue,
  onRecipientChange,
  onMintChange,
  onCheck,
  onRegister
}) {
  const [recipient, setRecipient] = useValue(
    recipientValue,
    "",
    onRecipientChange
  );
  const [mint, setMint] = useValue(mintValue, "", onMintChange);
  const [status, setStatus] = useState16("Not checked yet.");
  const [confirmed, setConfirmed] = useState16(false);
  const [busy, setBusy] = useState16(false);
  const generation = useRef7(0);
  useEffect7(
    () => () => {
      generation.current++;
    },
    []
  );
  const reset = () => {
    generation.current++;
    setStatus("Not checked yet.");
    setConfirmed(false);
    setBusy(false);
  };
  const valid = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(mint.trim());
  const check = async () => {
    const ticket = ++generation.current;
    if (!onCheck) {
      setStatus("Provide an onCheck callback to verify the fee-sharing route.");
      return;
    }
    setBusy(true);
    setStatus("Reading the fee share on pump.fun\u2026");
    try {
      const result = await onCheck(mint.trim());
      if (ticket === generation.current) {
        setConfirmed(result.confirmed);
        setStatus(
          result.message || (result.confirmed ? "Fee route confirmed. 100% to singleSpark, config revoked." : "Could not verify the fee share. Try again.")
        );
      }
    } catch {
      if (ticket === generation.current)
        setStatus("Could not verify the fee share. Try again.");
    } finally {
      if (ticket === generation.current) setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxs65(Fragment19, { children: [
    /* @__PURE__ */ jsxs65("div", { className: "ub-form-stack", children: [
      /* @__PURE__ */ jsx113(Launchpads, { value: "Pump", onChange: () => {
      }, pumpOnly: true }),
      /* @__PURE__ */ jsx113(
        RecipientField,
        {
          value: recipient,
          onChange: (v) => {
            setRecipient(v);
            reset();
          },
          label: "X recipient in token metadata",
          hint: "Select the account your token already names. Registration cannot change it."
        }
      )
    ] }),
    /* @__PURE__ */ jsx113("hr", {}),
    /* @__PURE__ */ jsxs65("div", { className: "ub-form-stack", children: [
      /* @__PURE__ */ jsx113(
        SingleSparkField,
        {
          label: "Contract address",
          placeholder: "Mint address",
          autoComplete: "off",
          spellCheck: false,
          value: mint,
          "aria-invalid": !!mint && !valid,
          onChange: (e) => {
            setMint(e.target.value);
            reset();
          }
        }
      ),
      /* @__PURE__ */ jsx113("p", { className: "ub-caption", children: "The address of the token you already launched on pump.fun." })
    ] }),
    /* @__PURE__ */ jsx113("hr", {}),
    /* @__PURE__ */ jsxs65("section", { className: "ub-register-authority", children: [
      /* @__PURE__ */ jsxs65("div", { children: [
        /* @__PURE__ */ jsx113("h3", { children: "Set up fee sharing" }),
        /* @__PURE__ */ jsx113("p", { children: "On pump.fun, open the token's fee sharing, send 100% of the creator fees to the singleSpark fee-sharing address, and revoke the config. This confirms fee routing; a signed memo separately proves control of the fee admin." })
      ] }),
      /* @__PURE__ */ jsx113(TreasuryCopy, {}),
      /* @__PURE__ */ jsxs65("div", { className: "ub-register-check", children: [
        /* @__PURE__ */ jsx113(
          SingleSparkButton,
          {
            className: "ub-secondary",
            loading: busy,
            disabled: !valid || busy,
            onClick: check,
            children: confirmed ? "Check again" : "Check"
          }
        ),
        /* @__PURE__ */ jsx113("span", { role: "status", children: status })
      ] })
    ] }),
    /* @__PURE__ */ jsx113("hr", {}),
    /* @__PURE__ */ jsxs65("div", { className: "ub-form-stack ub-register-submit", children: [
      /* @__PURE__ */ jsx113("p", { children: "No wallet is needed to register fee routing. An on-chain memo is a separate proof for the singleSpark fee badge." }),
      /* @__PURE__ */ jsx113(
        SingleSparkButton,
        {
          className: "ub-primary ub-full",
          loading: busy,
          disabled: !confirmed || !recipient || !onRegister || busy,
          onClick: async () => {
            if (!onRegister) return;
            const ticket = ++generation.current;
            setBusy(true);
            try {
              await onRegister(mint.trim(), recipient);
              if (ticket === generation.current) setStatus("Registered");
            } catch {
              if (ticket === generation.current)
                setStatus("Registration could not be completed.");
            } finally {
              if (ticket === generation.current) setBusy(false);
            }
          },
          children: !recipient ? "Select metadata recipient" : !valid ? "Paste the contract address" : !confirmed ? "Check the fee authority first" : "Register token"
        }
      ),
      /* @__PURE__ */ jsxs65("small", { children: [
        "By registering, you agree to the",
        " ",
        /* @__PURE__ */ jsx113(External, { href: "https://usepaid.app/legal/terms", children: "Terms of Use" }),
        "."
      ] })
    ] })
  ] });
}

// react/components/singlespark-business/SingleSparkRegisterForm.tsx
import { jsx as jsx114 } from "react/jsx-runtime";
function SingleSparkRegisterForm({ className, ...props }) {
  return /* @__PURE__ */ jsx114(Surface, { className, children: /* @__PURE__ */ jsx114("div", { className: "ub-form-stack", children: /* @__PURE__ */ jsx114(RegisterCore, { ...props }) }) });
}

// react/components/singlespark-business/LaunchModesCore.tsx
import { useState as useState17 } from "react";

// react/components/singlespark-business/WalletlessCore.tsx
import React from "react";
import { Fragment as Fragment20, jsx as jsx115, jsxs as jsxs66 } from "react/jsx-runtime";
function WalletlessCore() {
  return /* @__PURE__ */ jsx115("div", { className: "ub-walletless-steps", children: [
    [
      "Name the recipient in the description",
      /* @__PURE__ */ jsxs66(Fragment20, { children: [
        "When you create the coin on pump.fun, add the same last line our launcher uses: ",
        /* @__PURE__ */ jsx115("span", { children: "Fees to @recipient via singleSpark" }),
        ". Replace @recipient with the X account that should receive the main creator share. Put your own description above that line."
      ] })
    ],
    [
      "Set up fee sharing",
      "Once the coin exists, open its fee sharing on pump.fun and send 100% of the creator fees to this address."
    ],
    [
      "Payouts start on their own",
      "Nothing to submit. The token appears on Explore and the first payout lands shortly, confirmed publicly by @singleSpark."
    ]
  ].map(([h, p], i) => /* @__PURE__ */ jsxs66(React.Fragment, { children: [
    i > 0 && /* @__PURE__ */ jsx115("hr", {}),
    /* @__PURE__ */ jsxs66("section", { children: [
      /* @__PURE__ */ jsxs66("div", { children: [
        /* @__PURE__ */ jsx115("span", { children: i + 1 }),
        /* @__PURE__ */ jsx115("h3", { children: h })
      ] }),
      /* @__PURE__ */ jsx115("p", { children: p }),
      i === 1 ? /* @__PURE__ */ jsx115(TreasuryCopy, {}) : i === 2 ? /* @__PURE__ */ jsx115("p", { className: "ub-walletless-footnote", children: "Launched already? Register checks the recipient named by the token\u2019s description or X link. It cannot change published metadata." }) : null
    ] })
  ] }, i)) });
}

// react/components/singlespark-business/WalletlessPreview.tsx
import { jsx as jsx116, jsxs as jsxs67 } from "react/jsx-runtime";
function WalletlessPreview({ paused }) {
  return /* @__PURE__ */ jsxs67("aside", { className: "ub-launch-preview", children: [
    /* @__PURE__ */ jsx116(PayoutFlow, { paused }),
    /* @__PURE__ */ jsxs67("div", { className: "ub-launch-preview-card ub-pump-guide", children: [
      /* @__PURE__ */ jsxs67("div", { children: [
        /* @__PURE__ */ jsx116("strong", { children: "Launch on Pump" }),
        /* @__PURE__ */ jsx116("p", { children: "pump.fun \xB7 Share creator rewards" })
      ] }),
      /* @__PURE__ */ jsx116(
        "img",
        {
          src: asset("pump-launch.png"),
          width: "524",
          height: "566",
          alt: "pump.fun\u2019s Share creator rewards screen"
        }
      ),
      /* @__PURE__ */ jsx116("p", { children: "Add our treasury as the only recipient, at 100%, before you create the coin." })
    ] })
  ] });
}

// react/components/singlespark-business/LaunchModesCore.tsx
import { Fragment as Fragment21, jsx as jsx117, jsxs as jsxs68 } from "react/jsx-runtime";
function LaunchModesCore({
  mode: controlled,
  defaultMode = "Launch",
  onModeChange,
  draft: draftValue,
  onDraftChange,
  onConnect,
  onAction,
  onImageFile,
  register,
  paused
}) {
  const [mode, setMode] = useValue(controlled, defaultMode, onModeChange);
  const [platform, setPlatform] = useState17("Pump");
  const [currency, setCurrency] = useState17("SOL");
  const [draft, change] = useDraft(draftValue, onDraftChange);
  return /* @__PURE__ */ jsxs68(Fragment21, { children: [
    mode !== "Launch" && /* @__PURE__ */ jsx117("p", { className: "ub-launch-mode-note", children: "These fee-sharing instructions are for Pump. To create a Pons token, use the Launch tab. Existing Pons tokens pointed at PAID are indexed automatically." }),
    /* @__PURE__ */ jsxs68("div", { className: "ub-launch", children: [
      /* @__PURE__ */ jsxs68("section", { className: "ub-launch-form", children: [
        /* @__PURE__ */ jsx117(
          Heading,
          {
            right: /* @__PURE__ */ jsx117(
              SingleSparkTabs,
              {
                values: ["Launch", "Register", "Walletless"],
                value: mode,
                onChange: setMode
              }
            ),
            children: mode === "Launch" ? "Launch token" : mode === "Register" ? "Register a token" : "Walletless launch"
          }
        ),
        mode === "Launch" ? /* @__PURE__ */ jsxs68(Fragment21, { children: [
          /* @__PURE__ */ jsxs68("div", { className: "ub-form-stack", children: [
            /* @__PURE__ */ jsx117(
              Launchpads,
              {
                value: platform,
                includeAll: false,
                onChange: (v) => setPlatform(v)
              }
            ),
            platform === "Pons" ? /* @__PURE__ */ jsx117(
              TaxCore,
              {
                value: draft.tax,
                onChange: (tax) => change({ tax })
              }
            ) : /* @__PURE__ */ jsx117(CurrencyCore, { value: currency, onChange: setCurrency }),
            /* @__PURE__ */ jsx117(
              RecipientField,
              {
                value: draft.recipient,
                onChange: (recipient) => change({ recipient })
              }
            ),
            /* @__PURE__ */ jsx117(DeployerCore, { draft, onChange: change })
          ] }),
          /* @__PURE__ */ jsx117("hr", {}),
          /* @__PURE__ */ jsx117(
            MetadataCore,
            {
              draft,
              onChange: change,
              onImageFile
            }
          ),
          /* @__PURE__ */ jsx117(
            InitialBuyCore,
            {
              value: draft.initialBuy,
              platform,
              onChange: (initialBuy) => change({ initialBuy })
            }
          ),
          /* @__PURE__ */ jsx117(
            ConsentCore,
            {
              agreed: draft.agreed,
              onChange: (agreed) => change({ agreed }),
              onConnect: () => onConnect ? onConnect() : onAction?.("connect-wallet")
            }
          )
        ] }) : mode === "Register" ? /* @__PURE__ */ jsx117(RegisterCore, { ...register }) : /* @__PURE__ */ jsxs68(Fragment21, { children: [
          /* @__PURE__ */ jsx117(Launchpads, { value: "Pump", onChange: () => {
          }, pumpOnly: true }),
          /* @__PURE__ */ jsx117(WalletlessCore, {})
        ] })
      ] }),
      mode === "Walletless" ? /* @__PURE__ */ jsx117(WalletlessPreview, { paused }) : mode === "Register" ? /* @__PURE__ */ jsx117("aside", { className: "ub-launch-preview", children: /* @__PURE__ */ jsx117(PreviewCard, { draft: {} }) }) : /* @__PURE__ */ jsx117(LaunchPreviewCore, { draft, paused })
    ] })
  ] });
}

// react/components/singlespark-business/SingleSparkLaunchModes.tsx
import { jsx as jsx118 } from "react/jsx-runtime";
function SingleSparkLaunchModes({ className, ...props }) {
  return /* @__PURE__ */ jsx118(Surface, { className, children: /* @__PURE__ */ jsx118(LaunchModesCore, { ...props }) });
}

// react/components/singlespark-business/SingleSparkWalletlessGuide.tsx
import { jsx as jsx119 } from "react/jsx-runtime";
function SingleSparkWalletlessGuide({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx119(Surface, { className, children: /* @__PURE__ */ jsx119(LaunchModesCore, { defaultMode: "Walletless", ...props }) });
}

// react/components/singlespark-business/SingleSparkPageIntro.tsx
import { jsx as jsx120, jsxs as jsxs69 } from "react/jsx-runtime";
function SingleSparkPageIntro({
  title = "Launch a token and route creator fees",
  description = "Deploy a new token on pump.fun or pons.family with its fees pointed at our treasury, or redirect the fees on a token you already launched.",
  className
}) {
  return /* @__PURE__ */ jsx120(Surface, { className, children: /* @__PURE__ */ jsxs69("section", { className: "ub-page-intro", children: [
    /* @__PURE__ */ jsx120("div", { className: "ub-intro-grid", "aria-hidden": "true", children: [0, 1, 2, 3, 4, 5, 6].map((i) => /* @__PURE__ */ jsx120(
      "span",
      {
        style: {
          top: i * 80,
          "--ub-beam-duration": [
            5.25228,
            4.37963,
            4.21107,
            5.12974,
            5.06278,
            4.94621,
            3.72959
          ][i] + "s",
          "--ub-beam-delay": -[
            1.11735,
            6.02239,
            1.12573,
            2.11096,
            9.88737,
            5.41257,
            4.27939
          ][i] + "s"
        }
      },
      i
    )) }),
    /* @__PURE__ */ jsxs69("div", { children: [
      /* @__PURE__ */ jsx120("h1", { children: title }),
      /* @__PURE__ */ jsx120("p", { children: description })
    ] })
  ] }) });
}

// react/components/singlespark-business/AnalyticsRange.tsx
import { jsx as jsx121, jsxs as jsxs70 } from "react/jsx-runtime";
function AnalyticsRange({
  value,
  onChange,
  ranges = ["24h", "7d", "30d", "All"],
  title = "Protocol Analytics",
  className
}) {
  const [v, set] = useValue(
    value,
    "All",
    onChange
  );
  return /* @__PURE__ */ jsx121(Surface, { className, children: /* @__PURE__ */ jsxs70("div", { className: "ub-analytics-heading", children: [
    title && /* @__PURE__ */ jsx121("h1", { children: title }),
    /* @__PURE__ */ jsx121(
      SingleSparkTabs,
      {
        values: ranges,
        value: v,
        onChange: set,
        className: "ub-range"
      }
    )
  ] }) });
}

// react/components/singlespark-business/AnalyticsMetrics.tsx
import { jsx as jsx122, jsxs as jsxs71 } from "react/jsx-runtime";
function AnalyticsMetrics({
  metrics = [
    { label: "Total fees claimed", value: "$5,689,241.52" },
    { label: "Total $PAID burnt", value: "$1,209,012.21" }
  ],
  className,
  loading = false
}) {
  return /* @__PURE__ */ jsx122(Surface, { className, children: /* @__PURE__ */ jsx122("div", { className: "ub-analytics-metrics", children: metrics.map((m) => /* @__PURE__ */ jsxs71("section", { children: [
    /* @__PURE__ */ jsx122("span", { children: m.label }),
    /* @__PURE__ */ jsxs71("strong", { children: [
      loading ? /* @__PURE__ */ jsx122(SingleSparkSkeleton, { variant: "input", width: 80, height: 28, label: `Loading ${m.label}` }) : /* @__PURE__ */ jsx122(SingleSparkMoney, { value: m.value }),
      !loading && m.unit && /* @__PURE__ */ jsx122("small", { className: "ub-metric-unit", children: m.unit })
    ] }),
    /* @__PURE__ */ jsx122("small", { children: m.comparison || "No baseline" })
  ] }, m.label)) }) });
}

// react/components/singlespark-business/BarChart.tsx
import { jsx as jsx123, jsxs as jsxs72 } from "react/jsx-runtime";
function BarChart({
  values,
  title,
  total,
  labels,
  valueLabels,
  description = "Daily in UTC \xB7 last 14 days shown.",
  emptyText = "No chart data"
}) {
  const max = Math.max(...values, 0) || 1;
  const date = (n) => labels?.[n] ?? (n < 7 ? "Sep " + (n + 24) : "Oct " + (n - 6));
  return /* @__PURE__ */ jsxs72("section", { className: "ub-analytics-chart", "aria-label": title, children: [
    /* @__PURE__ */ jsxs72("header", { children: [
      /* @__PURE__ */ jsx123("h3", { children: title }),
      /* @__PURE__ */ jsx123("strong", { children: total }),
      /* @__PURE__ */ jsx123("p", { children: description })
    ] }),
    values.length ? /* @__PURE__ */ jsxs72("div", { className: "ub-bar-surface", children: [
      /* @__PURE__ */ jsx123("div", { className: "ub-bars", children: values.map((v, n) => {
        const amount = valueLabels?.[n] ?? `$${v.toLocaleString("en-US")}`;
        return /* @__PURE__ */ jsxs72(
          "button",
          {
            type: "button",
            "aria-label": `${date(n)}${labels ? "" : ", 2026 UTC"} \xB7 ${amount}`,
            children: [
              /* @__PURE__ */ jsx123("span", { "data-zero": v === 0 || void 0, style: { height: (v > 0 ? Math.max(1, v / max * 100) : 0) + "%", minHeight: v > 0 ? 4 : 3, animationDelay: `${n / Math.max(1, values.length - 1) * 600}ms` } }),
              /* @__PURE__ */ jsxs72("span", { className: "ub-chart-tooltip", children: [
                date(n),
                /* @__PURE__ */ jsx123("strong", { children: amount })
              ] })
            ]
          },
          n
        );
      }) }),
      /* @__PURE__ */ jsxs72("div", { className: "ub-axis", children: [
        /* @__PURE__ */ jsx123("span", { children: date(0) }),
        /* @__PURE__ */ jsx123("span", { children: date(Math.floor((values.length - 1) / 2)) }),
        /* @__PURE__ */ jsx123("span", { children: date(values.length - 1) })
      ] })
    ] }) : /* @__PURE__ */ jsx123("div", { className: "ub-chart-skeleton", role: "status", children: emptyText })
  ] });
}

// react/components/singlespark-business/AnalyticsCharts.tsx
import { Fragment as Fragment22, jsx as jsx124, jsxs as jsxs73 } from "react/jsx-runtime";
function AnalyticsCharts({
  fees = feeBarSnapshot[0],
  burns = feeBarSnapshot[1],
  charts,
  className
}) {
  return /* @__PURE__ */ jsx124(Surface, { className, children: /* @__PURE__ */ jsx124("div", { className: "ub-analytics-charts", children: charts ? charts.map((chart) => /* @__PURE__ */ jsx124(BarChart, { ...chart }, chart.title)) : /* @__PURE__ */ jsxs73(Fragment22, { children: [
    /* @__PURE__ */ jsx124(BarChart, { values: fees, title: "Fees", total: "$5.69M" }),
    /* @__PURE__ */ jsx124(BarChart, { values: burns, title: "$PAID burnt", total: "$1.21M" }),
    /* @__PURE__ */ jsxs73("section", { className: "ub-analytics-chart", children: [
      /* @__PURE__ */ jsxs73("header", { children: [
        /* @__PURE__ */ jsx124("h3", { children: "Protocol volume" }),
        /* @__PURE__ */ jsx124("strong", { children: "Loading" }),
        /* @__PURE__ */ jsx124("p", { children: "Live volume coverage has not been captured." })
      ] }),
      /* @__PURE__ */ jsx124("div", { className: "ub-chart-skeleton" })
    ] })
  ] }) }) });
}

// react/components/singlespark-business/BurnDetailsCore.tsx
import { Fragment as Fragment23, jsx as jsx125, jsxs as jsxs74 } from "react/jsx-runtime";
function BurnDetailsCore() {
  return /* @__PURE__ */ jsxs74(Fragment23, { children: [
    /* @__PURE__ */ jsx125(
      SingleSparkKeyValueList,
      {
        entries: [
          ["SOL spent", "4.032 SOL"],
          ["Value", "$475.54"],
          ["$PAID bought", "70.7K"],
          ["$PAID burned", "70.7K"],
          ["Route", "Jupiter"],
          ["Token", /* @__PURE__ */ jsx125("code", { children: singleSparkMint })],
          [
            "Swap",
            /* @__PURE__ */ jsx125("code", { children: "3cV7ijsmaooPLp6oEreB6aPt7T2jNdg8yaXjnwixUzx3HTGMtLUk5GBQrKkmtcFcfLhvucSnCvqvVoJcEJRxxkK" })
          ],
          ["Burn", /* @__PURE__ */ jsx125("code", { children: burnTx })],
          ["Bought", "Oct 7, 2026, 9:34 AM"],
          ["Burned", "Oct 7, 2026, 9:34 AM"]
        ]
      }
    ),
    /* @__PURE__ */ jsxs74(
      External,
      {
        href: "https://solscan.io/tx/" + burnTx,
        className: "ub-button ub-primary ub-full",
        children: [
          "View burn on Solscan ",
          /* @__PURE__ */ jsx125(Icon2, { name: "external", size: 14 })
        ]
      }
    )
  ] });
}

// react/components/singlespark-business/BuybackDetails.tsx
import { jsx as jsx126 } from "react/jsx-runtime";
function BuybackDetails({ className }) {
  return /* @__PURE__ */ jsx126(Surface, { className, children: /* @__PURE__ */ jsx126(SingleSparkPanel, { children: /* @__PURE__ */ jsx126(BurnDetailsCore, {}) }) });
}

// react/components/singlespark-business/BuybackSummary.tsx
import { jsx as jsx127, jsxs as jsxs75 } from "react/jsx-runtime";
function BuybackSummary({ className }) {
  return /* @__PURE__ */ jsx127(Surface, { className, children: /* @__PURE__ */ jsxs75(SingleSparkPanel, { children: [
    /* @__PURE__ */ jsx127("dl", { className: "ub-buyback-totals", children: [
      ["SOL spent", "10,533.3021"],
      ["Value", "$1,209,012.21"],
      ["$PAID bought", "69.60M"],
      ["$PAID burned", "69.60M"]
    ].map(([h, v]) => /* @__PURE__ */ jsxs75("div", { children: [
      /* @__PURE__ */ jsx127("dt", { children: h }),
      /* @__PURE__ */ jsx127("dd", { children: v })
    ] }, h)) }),
    /* @__PURE__ */ jsx127(
      External,
      {
        href: "https://solscan.io/token/" + singleSparkMint,
        className: "ub-contract",
        children: "$PAID 98kfF7\u2026pump \u2197"
      }
    )
  ] }) });
}

// react/components/singlespark-business/BuybackList.tsx
import { useState as useState19 } from "react";

// react/components/singlespark-business/BurnCard.tsx
import { useId as useId6, useState as useState18 } from "react";
import { Fragment as Fragment24, jsx as jsx128, jsxs as jsxs76 } from "react/jsx-runtime";
function BurnCard({ index = 0, content, action }) {
  const [open, setOpen] = useState18(false);
  const detailsId = useId6();
  return /* @__PURE__ */ jsxs76("article", { className: "ub-payment ub-expand " + (open ? "ub-open" : ""), "aria-busy": action?.loading || void 0, children: [
    /* @__PURE__ */ jsxs76("div", { className: "ub-burn-main", children: [
      /* @__PURE__ */ jsxs76("div", { className: "ub-payment-text", children: [
        /* @__PURE__ */ jsx128("p", { children: content ? content.amount : `${["4.032", "1.7388", "2.0663"][index]} SOL` }),
        /* @__PURE__ */ jsx128("div", { children: content ? content.description : /* @__PURE__ */ jsxs76(Fragment24, { children: [
          /* @__PURE__ */ jsx128("span", { children: "bought and burned" }),
          /* @__PURE__ */ jsxs76("strong", { children: [
            ["70.7K", "31.8K", "38.8K"][index],
            " $PAID"
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx128("div", { className: "ub-burn-route", children: content ? content.route : /* @__PURE__ */ jsxs76(Fragment24, { children: [
        /* @__PURE__ */ jsx128("span", { children: /* @__PURE__ */ jsx128(Sol, {}) }),
        /* @__PURE__ */ jsx128(Icon2, { name: "arrow" }),
        /* @__PURE__ */ jsx128("span", { children: /* @__PURE__ */ jsx128(SingleSparkMark, {}) }),
        /* @__PURE__ */ jsx128(Icon2, { name: "arrow" }),
        /* @__PURE__ */ jsx128("span", { className: "ub-burn-icon", children: /* @__PURE__ */ jsx128(Icon2, { name: "burn", size: 20 }) })
      ] }) }),
      (!content || content.status != null || !!content.time) && /* @__PURE__ */ jsxs76("span", { className: "ub-burn-status", children: [
        content ? content.status : "Burned",
        " ",
        /* @__PURE__ */ jsx128("small", { children: content ? content.time : "30m" })
      ] }),
      /* @__PURE__ */ jsx128(
        "button",
        {
          type: "button",
          className: "ub-card-toggle",
          disabled: action?.disabled || action?.loading,
          "aria-busy": action?.loading || void 0,
          "aria-expanded": action ? void 0 : open,
          "aria-controls": action ? void 0 : detailsId,
          "aria-label": action ? action.label : content ? content.detailsLabel : "Show buyback details",
          onClick: action ? action.onClick : () => setOpen(!open),
          children: action?.loading && /* @__PURE__ */ jsx128("span", { className: "ub-card-progress", children: /* @__PURE__ */ jsx128(SingleSparkLoading, { size: 18, decorative: true }) })
        }
      ),
      action ? /* @__PURE__ */ jsx128(
        "button",
        {
          type: "button",
          className: "ub-card-chevron",
          "aria-label": content ? content.detailsLabel : "Show buyback details",
          "aria-expanded": open,
          "aria-controls": detailsId,
          onClick: () => setOpen(!open),
          children: /* @__PURE__ */ jsx128(Icon2, { name: "chevron" })
        }
      ) : /* @__PURE__ */ jsx128("span", { className: "ub-card-chevron", children: /* @__PURE__ */ jsx128(Icon2, { name: "chevron" }) })
    ] }),
    /* @__PURE__ */ jsx128("div", { className: "ub-expand-grid", children: /* @__PURE__ */ jsx128("div", { children: /* @__PURE__ */ jsx128(
      "div",
      {
        className: "ub-expand-body",
        id: detailsId,
        "aria-hidden": !open,
        ref: (node) => {
          if (node) node.inert = !open;
        },
        children: content ? content.details : index === 0 ? /* @__PURE__ */ jsx128(BurnDetailsCore, {}) : /* @__PURE__ */ jsx128(SingleSparkNotice, { title: "Snapshot detail", children: "Only the first event\u2019s detail is retained in this local snapshot." })
      }
    ) }) })
  ] });
}

// react/components/singlespark-business/BuybackList.tsx
import { jsx as jsx129, jsxs as jsxs77 } from "react/jsx-runtime";
function BuybackList({ className }) {
  const [tab, setTab] = useState19(
    "All"
  );
  return /* @__PURE__ */ jsxs77(Surface, { className, children: [
    /* @__PURE__ */ jsx129(Heading, { children: "Buyback and burn" }),
    /* @__PURE__ */ jsx129(
      SingleSparkTabs,
      {
        values: ["All", "Burned", "Pending", "Failed"],
        value: tab,
        onChange: setTab
      }
    ),
    /* @__PURE__ */ jsx129("div", { className: "ub-stack", children: tab === "Pending" || tab === "Failed" ? /* @__PURE__ */ jsxs77("div", { className: "ub-empty", children: [
      "No ",
      tab.toLowerCase(),
      " events in this captured snapshot."
    ] }) : [0, 1, 2].map((i) => /* @__PURE__ */ jsx129(BurnCard, { index: i }, i)) })
  ] });
}

// react/components/singlespark-business/AnalyticsMethodology.tsx
import { Fragment as Fragment25, jsx as jsx130, jsxs as jsxs78 } from "react/jsx-runtime";
function AnalyticsMethodology({ className, description, children }) {
  return /* @__PURE__ */ jsx130(Surface, { className, children: /* @__PURE__ */ jsxs78("section", { className: "ub-methodology", children: [
    /* @__PURE__ */ jsx130("h2", { children: "About these figures" }),
    /* @__PURE__ */ jsx130("p", { children: description ?? /* @__PURE__ */ jsx130(Fragment25, { children: "Updated every 30 seconds. Daily records use UTC. Missing values and unpriced records are not counted as zero." }) }),
    children ?? /* @__PURE__ */ jsxs78(Fragment25, { children: [
      /* @__PURE__ */ jsx130(SingleSparkAccordion, { label: "Trading volume methodology", children: "Volume coverage varies by asset and date. Missing intervals stay unknown." }),
      /* @__PURE__ */ jsx130(SingleSparkAccordion, { label: "Payment valuation breakdown", children: /* @__PURE__ */ jsx130(
        SingleSparkKeyValueList,
        {
          entries: [
            ["PAID quote state", "Ready"],
            ["Unpriced records", "9,542"],
            ["Direct PAID burns", "Separate from cash-funded buybacks"]
          ]
        }
      ) })
    ] })
  ] }) });
}

// react/components/singlespark-business/FactsCore.tsx
import { jsx as jsx131, jsxs as jsxs79 } from "react/jsx-runtime";
function FactsCore() {
  return /* @__PURE__ */ jsx131("dl", { className: "ub-facts", children: [
    ["Ticker", "$PAID"],
    ["Home chain", "Solana, via pump.fun"],
    ["Funded by", "Protocol allocations and PAID treasury fees"],
    ["Mechanism", "Open-market buy, then burn"]
  ].map(([a, b]) => /* @__PURE__ */ jsxs79("div", { children: [
    /* @__PURE__ */ jsx131("dt", { children: a }),
    /* @__PURE__ */ jsx131("dd", { children: b })
  ] }, a)) });
}

// react/components/singlespark-business/SingleSparkFacts.tsx
import { jsx as jsx132 } from "react/jsx-runtime";
function SingleSparkFacts({ className }) {
  return /* @__PURE__ */ jsx132(Surface, { className, children: /* @__PURE__ */ jsx132(FactsCore, {}) });
}

// react/components/singlespark-business/BurnStepsCore.tsx
import { jsx as jsx133, jsxs as jsxs80 } from "react/jsx-runtime";
function BurnStepsCore() {
  return /* @__PURE__ */ jsx133("div", { className: "ub-steps", children: [
    [
      "A claim settles",
      "Creator fees are claimed on chain and recorded as a fee event, keyed on the claim\u2019s own transaction signature."
    ],
    [
      "The cut is set aside",
      "The collection-time buyback share is recorded against its source. Execution costs reduce this budget; pending funding is not a completed burn."
    ],
    [
      "$PAID is bought on the open market",
      "The protocol buys from the same market as everyone else, at whatever the price is when it buys."
    ],
    [
      "The tokens are burnt",
      "Completed purchases and burns have on-chain transaction records."
    ]
  ].map(([h, p], i) => /* @__PURE__ */ jsxs80("div", { children: [
    /* @__PURE__ */ jsx133("span", { children: i + 1 }),
    /* @__PURE__ */ jsxs80("section", { children: [
      /* @__PURE__ */ jsx133("h3", { children: h }),
      /* @__PURE__ */ jsx133("p", { children: p })
    ] })
  ] }, h)) });
}

// react/components/singlespark-business/BuyBurnSteps.tsx
import { jsx as jsx134 } from "react/jsx-runtime";
function BuyBurnSteps({ className }) {
  return /* @__PURE__ */ jsx134(Surface, { className, children: /* @__PURE__ */ jsx134(BurnStepsCore, {}) });
}

// react/components/singlespark-business/BuyNotice.tsx
import { jsx as jsx135, jsxs as jsxs81 } from "react/jsx-runtime";
function BuyNotice() {
  return /* @__PURE__ */ jsxs81(SingleSparkNotice, { title: "Buyback and burn activity", children: [
    "Current buyback and burn records are published on each token's activity page. A pending buyback is not a completed burn.",
    /* @__PURE__ */ jsx135("br", {}),
    /* @__PURE__ */ jsx135("br", {}),
    "PAID token treasury fees fund buybacks in full."
  ] });
}

// react/components/singlespark-business/BuybackActivityNotice.tsx
import { jsx as jsx136 } from "react/jsx-runtime";
function BuybackActivityNotice({ className }) {
  return /* @__PURE__ */ jsx136(Surface, { className, children: /* @__PURE__ */ jsx136(BuyNotice, {}) });
}

// react/components/singlespark-business/ProtocolArticle.tsx
import { jsx as jsx137, jsxs as jsxs82 } from "react/jsx-runtime";
function ProtocolArticle({ className }) {
  return /* @__PURE__ */ jsx137(Surface, { className, children: /* @__PURE__ */ jsxs82("article", { className: "ub-article", children: [
    /* @__PURE__ */ jsxs82("header", { children: [
      /* @__PURE__ */ jsx137("span", { children: "Protocol" }),
      /* @__PURE__ */ jsx137("h1", { children: "$PAID" })
    ] }),
    /* @__PURE__ */ jsx137("p", { className: "ub-article-lead", children: "Standard creator fees fund recipient allocations, singleSpark treasury and buybacks. PAID token treasury fees separately fund buybacks in full. Pending allocations are not completed payments or burns." }),
    /* @__PURE__ */ jsxs82("div", { className: "ub-article-body", children: [
      /* @__PURE__ */ jsx137("p", { children: "Current collection split: 65% recipient pool / 10% singleSpark treasury / 25% buyback and burn." }),
      /* @__PURE__ */ jsx137(BuyNotice, {}),
      /* @__PURE__ */ jsxs82("section", { children: [
        /* @__PURE__ */ jsx137("h2", { children: "What it is for" }),
        /* @__PURE__ */ jsx137("p", { children: "$PAID is the protocol\u2019s value accrual, not a governance token and not a fee token." }),
        /* @__PURE__ */ jsx137(FactsCore, {})
      ] }),
      /* @__PURE__ */ jsxs82("section", { children: [
        /* @__PURE__ */ jsx137("h2", { children: "How the buy and burn works" }),
        /* @__PURE__ */ jsx137(BurnStepsCore, {})
      ] })
    ] })
  ] }) });
}

// react/components/singlespark-business/CapitalFlowSections.tsx
import { jsx as jsx138, jsxs as jsxs83 } from "react/jsx-runtime";
function CapitalFlowSections({ className, onNavigate }) {
  return /* @__PURE__ */ jsx138(Surface, { className, children: /* @__PURE__ */ jsxs83("article", { className: "ub-article", children: [
    /* @__PURE__ */ jsxs83("header", { children: [
      /* @__PURE__ */ jsx138("span", { children: "Fund flows" }),
      /* @__PURE__ */ jsx138("h1", { children: "New fees and historical balances." })
    ] }),
    /* @__PURE__ */ jsx138("p", { children: "Current collection split: 65% recipient pool / 10% singleSpark treasury / 25% buyback and burn." }),
    /* @__PURE__ */ jsxs83("div", { className: "ub-manual-grid", children: [
      /* @__PURE__ */ jsxs83("section", { children: [
        /* @__PURE__ */ jsx138("h2", { children: "Creator and deployer fees" }),
        /* @__PURE__ */ jsxs83("ol", { children: [
          /* @__PURE__ */ jsx138("li", { children: "Eligible fees are collected and recorded." }),
          /* @__PURE__ */ jsx138("li", { children: "Beneficiary shares stay in the original asset." }),
          /* @__PURE__ */ jsx138("li", { children: "The portal shows original asset availability." }),
          /* @__PURE__ */ jsx138("li", { children: "One eligible asset can be requested to the beneficiary\u2019s own Solana wallet." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs83("section", { children: [
        /* @__PURE__ */ jsx138("h2", { children: "Earlier X Money balances" }),
        /* @__PURE__ */ jsx138("p", { children: "Earlier balances stay outside manual claims. Previous conversion, ACH and X Money records remain historical evidence." }),
        /* @__PURE__ */ jsx138("h2", { children: "PAID treasury fees" }),
        /* @__PURE__ */ jsx138("p", { children: "100% of PAID treasury fees fund buybacks." })
      ] })
    ] }),
    /* @__PURE__ */ jsx138(
      SingleSparkButton,
      {
        className: "ub-primary",
        onClick: () => onNavigate?.("ClaimSignIn"),
        children: "View claim flow \u2192"
      }
    )
  ] }) });
}

// react/components/singlespark-business/OfficialLinkHub.tsx
import { jsx as jsx139, jsxs as jsxs84 } from "react/jsx-runtime";
function OfficialLinkHub({ className }) {
  return /* @__PURE__ */ jsx139(Surface, { className, children: /* @__PURE__ */ jsxs84("section", { className: "ub-links-hub", children: [
    /* @__PURE__ */ jsx139(SingleSparkMark, {}),
    /* @__PURE__ */ jsx139("h1", { children: "PAID" }),
    /* @__PURE__ */ jsx139("p", { children: "Token fees, paid through X Money." }),
    /* @__PURE__ */ jsx139("h2", { children: "Official links" }),
    [
      ["X", "x.com/singleSpark"],
      ["Telegram", "t.me/usepaidapp"],
      ["Discord", "discord.gg/usepaidapp"],
      ["Website", "usepaid.app"],
      ["Dexscreener", "dexscreener.com/solana/" + singleSparkMint]
    ].map(([name, url]) => /* @__PURE__ */ jsxs84(
      External,
      {
        href: "https://" + url,
        className: "ub-official-link",
        children: [
          /* @__PURE__ */ jsx139("span", { className: "ub-link-symbol", children: name === "X" ? "X" : /* @__PURE__ */ jsx139(Icon2, { name: "link", size: 22 }) }),
          /* @__PURE__ */ jsxs84("span", { children: [
            /* @__PURE__ */ jsx139("strong", { children: name }),
            /* @__PURE__ */ jsx139("small", { children: url })
          ] }),
          /* @__PURE__ */ jsx139(Icon2, { name: "external" })
        ]
      },
      name
    )),
    /* @__PURE__ */ jsxs84("div", { className: "ub-contract-copy", children: [
      /* @__PURE__ */ jsx139("code", { children: singleSparkMint }),
      /* @__PURE__ */ jsx139(SingleSparkCopyButton, { value: singleSparkMint })
    ] }),
    /* @__PURE__ */ jsx139("p", { children: "These are the only official links. Anything else is a fake." })
  ] }) });
}

// react/components/singlespark-business/LegalArticle.tsx
import { Fragment as Fragment26, jsx as jsx140, jsxs as jsxs85 } from "react/jsx-runtime";
function LegalArticle({
  className,
  title = "Terms of Use",
  children
}) {
  return /* @__PURE__ */ jsx140(Surface, { className, children: /* @__PURE__ */ jsxs85("article", { className: "ub-article", children: [
    /* @__PURE__ */ jsxs85("header", { children: [
      /* @__PURE__ */ jsx140("span", { children: "Legal" }),
      /* @__PURE__ */ jsx140("h1", { children: title })
    ] }),
    /* @__PURE__ */ jsx140("div", { className: "ub-article-body", children: children || /* @__PURE__ */ jsxs85(Fragment26, { children: [
      /* @__PURE__ */ jsx140("p", { children: "This preview preserves the public article typography. The current legal text is available at the source." }),
      /* @__PURE__ */ jsx140("h2", { children: "singleSpark terms" }),
      /* @__PURE__ */ jsx140("p", { children: "Read the full terms, privacy policy, and disclosures before using the service." }),
      /* @__PURE__ */ jsx140(External, { href: "https://usepaid.app/legal/terms", children: "Open Terms of Use \u2197" }),
      /* @__PURE__ */ jsx140("br", {}),
      /* @__PURE__ */ jsx140(External, { href: "https://usepaid.app/legal/privacy", children: "Privacy Policy \u2197" }),
      /* @__PURE__ */ jsx140("br", {}),
      /* @__PURE__ */ jsx140(External, { href: "https://usepaid.app/legal/disclosures", children: "Disclosures \u2197" })
    ] }) })
  ] }) });
}

// react/components/singlespark-business/OptOutExplanation.tsx
import { jsx as jsx141, jsxs as jsxs86 } from "react/jsx-runtime";
function OptOutExplanation({ className }) {
  return /* @__PURE__ */ jsx141(Surface, { className, children: /* @__PURE__ */ jsxs86("section", { className: "ub-opt-explanation", children: [
    /* @__PURE__ */ jsx141("h2", { children: "Opt out" }),
    /* @__PURE__ */ jsx141("p", { children: "singleSpark pays creator fees to the X account a token names. If that\u2019s you and you don\u2019t want it, opting out turns off everything we do with your handle." }),
    /* @__PURE__ */ jsx141("div", { className: "ub-steps", children: [
      [
        "Payments stop",
        "We won\u2019t send X Money payments to your account."
      ],
      [
        "Tokens naming you are hidden",
        "They come off Explore, Payments, search and your profile page."
      ],
      [
        "Unpaid fees are not sent to you",
        "Unpaid fees and later earnings are not sent to you."
      ],
      [
        "Launches here can\u2019t pick you",
        "The launch form won\u2019t accept your handle as the recipient."
      ]
    ].map(([h, p], i) => /* @__PURE__ */ jsxs86("div", { children: [
      /* @__PURE__ */ jsx141("span", { children: i + 1 }),
      /* @__PURE__ */ jsxs86("section", { children: [
        /* @__PURE__ */ jsx141("h3", { children: h }),
        /* @__PURE__ */ jsx141("p", { children: p })
      ] })
    ] }, h)) }),
    /* @__PURE__ */ jsx141(SingleSparkNotice, { title: "What we can\u2019t stop", children: "Anyone can still create a token on pump.fun or pons with your handle in it. singleSpark does not run those venues." })
  ] }) });
}

// react/components/singlespark-business/OptOutStatus.tsx
import { jsx as jsx142, jsxs as jsxs87 } from "react/jsx-runtime";
function OptOutStatus({ className }) {
  return /* @__PURE__ */ jsx142(Surface, { className, children: /* @__PURE__ */ jsxs87(SingleSparkPanel, { className: "ub-opt-status", children: [
    /* @__PURE__ */ jsxs87("div", { className: "ub-opt-account", children: [
      /* @__PURE__ */ jsx142("span", { children: /* @__PURE__ */ jsx142(Icon2, { name: "at", size: 28 }) }),
      /* @__PURE__ */ jsxs87("div", { children: [
        /* @__PURE__ */ jsx142("strong", { children: "Your X account" }),
        /* @__PURE__ */ jsx142("p", { children: "Checking sign-in" })
      ] })
    ] }),
    /* @__PURE__ */ jsx142(
      SingleSparkKeyValueList,
      {
        entries: [
          ["X Money payments", "\u2014"],
          ["Tokens shown on singleSpark", "\u2014"],
          ["Selectable at launch", "\u2014"],
          ["Unpaid fees", "\u2014"]
        ]
      }
    ),
    /* @__PURE__ */ jsx142(SingleSparkButton, { disabled: true, className: "ub-primary ub-full", children: "Checking" })
  ] }) });
}

// react/components/singlespark-business/OptOutSteps.tsx
import { jsx as jsx143, jsxs as jsxs88 } from "react/jsx-runtime";
function OptOutSteps({ className }) {
  return /* @__PURE__ */ jsxs88(Surface, { className, children: [
    /* @__PURE__ */ jsx143("ol", { className: "ub-opt-steps", children: ["Sign in with X", "Confirm", "Opted out"].map((v, i) => /* @__PURE__ */ jsxs88("li", { children: [
      /* @__PURE__ */ jsx143("span", { children: i + 1 }),
      v
    ] }, v)) }),
    /* @__PURE__ */ jsx143("p", { className: "ub-source-limit", children: "Only the public step indicator has been verified. Authentication and confirmation screens are not reconstructed." })
  ] });
}

// react/singlespark-business.tsx
var singleSparkBusinessComponents = {
  SingleSparkPageIntro,
  LaunchpadFilter,
  SingleSparkTokenCard,
  TopTokenGrid,
  TopProfileList,
  SectionPagination,
  PaymentSummary,
  PaymentRow,
  PaymentBreakdown,
  AssetTransferRow,
  HistoricalReceiptDetails,
  TopSingleSparkTokenList,
  OffRampList,
  OnRampList,
  RampEventDetails,
  TrendingStrip,
  ExploreFilters,
  TokenCatalog,
  SingleSparkTokenHeader,
  RecipientSummary,
  ClaimEligibilityCard,
  HistoricalBalanceCard,
  SingleSparkMarketChart,
  TokenActivityTabs,
  FeeClaimRow,
  ProfileUnavailable,
  SingleSparkProfileContent,
  ClaimSignIn,
  ClaimTermsNotice,
  ClaimAssetPicker,
  ClaimWalletForm,
  ClaimStatusTracker,
  AnalyticsRange,
  AnalyticsMetrics,
  AnalyticsCharts,
  BuybackSummary,
  BuybackList,
  BuybackDetails,
  AnalyticsMethodology,
  SingleSparkLaunchModes,
  LaunchCurrency,
  SingleSparkRecipientSearch,
  DeployerRewardField,
  SingleSparkMetadataForm,
  SocialLinksFields,
  InitialBuyField,
  PonsTaxField,
  LaunchConsentAndWallet,
  LaunchLivePreview,
  FeeSplitSummary,
  SingleSparkRegisterForm,
  SingleSparkWalletlessGuide,
  ProtocolArticle,
  SingleSparkFacts,
  BuyBurnSteps,
  BuybackActivityNotice,
  CapitalFlowSections,
  OfficialLinkHub,
  LegalArticle,
  OptOutExplanation,
  OptOutStatus,
  OptOutSteps
};

// react/singlespark-chart.shared.tsx
function normalizeSingleSparkCandles(data) {
  const rows = /* @__PURE__ */ new Map();
  for (const bar of data) {
    if (!Number.isInteger(bar.time) || bar.time < 0 || bar.time > 253402300799 || ![bar.open, bar.high, bar.low, bar.close].every(
      (v) => Number.isFinite(v) && v >= 0
    ) || bar.high < Math.max(bar.open, bar.close) || bar.low > Math.min(bar.open, bar.close) || bar.volume !== void 0 && (!Number.isFinite(bar.volume) || bar.volume < 0))
      continue;
    rows.set(bar.time, bar);
  }
  return [...rows.values()].sort((a, b) => a.time - b.time);
}
var emptyBars = [];
var SingleSparkCandlestickChartAsset0 = new URL(
  "../assets/singlespark/business/lightweight-charts-4.2.3.js",
  import.meta.url
);

// react/components/singlespark-chart/SingleSparkCandlestickChart.tsx
import { useEffect as useEffect8, useMemo, useRef as useRef8, useState as useState20 } from "react";
import { Fragment as Fragment27, jsx as jsx144, jsxs as jsxs89 } from "react/jsx-runtime";
function SingleSparkCandlestickChart({
  data = emptyBars,
  symbol = "Market",
  interval = "1h",
  intervals = ["1m", "5m", "15m", "1h", "4h", "1D"],
  onIntervalChange,
  height = 320,
  precision = 6,
  loading = false,
  error,
  onRetry,
  className = ""
}) {
  const container = useRef8(null);
  const instance = useRef8();
  const seriesRef = useRef8();
  const volumeRef = useRef8();
  const bars = useMemo(() => normalizeSingleSparkCandles(data), [data]);
  const latest = useRef8(bars);
  latest.current = bars;
  const [kind, setKind] = useState20("Candles");
  const [volume, setVolume] = useState20(true);
  const [hover, setHover] = useState20();
  const [engineError, setEngineError] = useState20("");
  const [ready, setReady] = useState20(false);
  const [attempt, setAttempt] = useState20(0);
  const digits = Math.min(12, Math.max(0, Math.trunc(precision) || 0));
  useEffect8(() => {
    const node = container.current;
    if (!node) return;
    let disposed = false;
    let chart;
    let observer;
    const media = matchMedia("(prefers-color-scheme: light)");
    let updateTheme = () => {
    };
    setReady(false);
    setEngineError("");
    import(
      /* @vite-ignore */
      SingleSparkCandlestickChartAsset0.href
    ).then((lib) => {
      if (disposed) return;
      chart = lib.createChart(node, {
        autoSize: true,
        height,
        grid: { vertLines: { visible: false } },
        rightPriceScale: { borderVisible: false },
        timeScale: { borderVisible: false, timeVisible: true },
        crosshair: { mode: lib.CrosshairMode.Normal }
      });
      const priceFormat = {
        type: "price",
        precision: digits,
        minMove: 10 ** -digits
      };
      const series = kind === "Candles" ? chart.addCandlestickSeries({ borderVisible: false, priceFormat }) : chart.addLineSeries({ lineWidth: 2, priceFormat });
      const histogram = chart.addHistogramSeries({
        lastValueVisible: false,
        priceLineVisible: false,
        priceFormat: { type: "volume" },
        priceScaleId: "volume"
      });
      histogram.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
      series.priceScale().applyOptions({
        scaleMargins: { top: 0.1, bottom: volume ? 0.22 : 0.1 }
      });
      instance.current = chart;
      seriesRef.current = series;
      volumeRef.current = histogram;
      updateTheme = () => {
        const css = getComputedStyle(node);
        const color = (name, fallback) => css.getPropertyValue(`--ss-${name}`).trim() || fallback;
        const bg = color("bg", "#0a0a0a"), text = color("muted", "#7d8187"), up = color("success", "#4ade80"), down = color("danger", "#f87171");
        chart.applyOptions({
          layout: {
            background: { type: lib.ColorType.Solid, color: bg },
            textColor: text,
            fontFamily: css.fontFamily
          },
          grid: { horzLines: { color: color("border", "#ffffff14") } }
        });
        series.applyOptions(
          kind === "Candles" ? {
            upColor: up,
            downColor: down,
            wickUpColor: up,
            wickDownColor: down
          } : {
            color: up
          }
        );
        histogram.setData(
          volume ? latest.current.map((c) => ({
            time: c.time,
            value: c.volume || 0,
            color: c.close >= c.open ? up : down
          })) : []
        );
      };
      updateTheme();
      observer = new MutationObserver(updateTheme);
      for (let ancestor = node.parentElement; ancestor; ancestor = ancestor.parentElement)
        observer.observe(ancestor, {
          attributes: true,
          attributeFilter: ["data-ss-theme", "style", "class"]
        });
      media.addEventListener("change", updateTheme);
      series.setData(
        kind === "Candles" ? latest.current : latest.current.map((c) => ({ time: c.time, value: c.close }))
      );
      chart.timeScale().fitContent();
      chart.subscribeCrosshairMove(
        (event) => setHover(latest.current.find((c) => c.time === event.time))
      );
      setReady(true);
    }).catch(() => {
      if (!disposed) setEngineError("Chart unavailable. Please retry.");
    });
    return () => {
      disposed = true;
      observer?.disconnect();
      media.removeEventListener("change", updateTheme);
      chart?.remove();
      instance.current = void 0;
      seriesRef.current = void 0;
      volumeRef.current = void 0;
    };
  }, [kind, volume, digits, height, attempt]);
  useEffect8(() => {
    if (!ready || !seriesRef.current) return;
    seriesRef.current.setData(
      kind === "Candles" ? bars : bars.map((c) => ({ time: c.time, value: c.close }))
    );
    const css = container.current ? getComputedStyle(container.current) : null;
    volumeRef.current?.setData(
      volume ? bars.map((c) => ({
        time: c.time,
        value: c.volume || 0,
        color: css?.getPropertyValue(
          c.close >= c.open ? "--ss-success" : "--ss-danger"
        ).trim()
      })) : []
    );
    setHover(void 0);
  }, [bars, kind, volume, ready]);
  const current = hover || bars.at(-1);
  const zoom = (factor) => {
    const scale = instance.current?.timeScale(), range = scale?.getVisibleLogicalRange();
    if (range) {
      const middle = (range.from + range.to) / 2, half = (range.to - range.from) * factor / 2;
      scale.setVisibleLogicalRange({ from: middle - half, to: middle + half });
    }
  };
  return /* @__PURE__ */ jsxs89(
    "section",
    {
      className: `ss-chart ${className}`,
      "aria-label": `${symbol} price chart`,
      "aria-busy": loading || !ready,
      children: [
        /* @__PURE__ */ jsxs89("header", { className: "ss-chart-toolbar", children: [
          /* @__PURE__ */ jsx144("strong", { children: symbol }),
          /* @__PURE__ */ jsx144(
            SingleSparkTabs,
            {
              values: intervals,
              value: interval,
              label: "Chart interval",
              onChange: onIntervalChange
            }
          ),
          /* @__PURE__ */ jsx144(
            SingleSparkTabs,
            {
              values: ["Candles", "Line"],
              value: kind,
              onChange: setKind,
              label: "Chart type"
            }
          )
        ] }),
        /* @__PURE__ */ jsx144("div", { className: "ss-chart-ohlc", children: current ? /* @__PURE__ */ jsxs89(Fragment27, { children: [
          /* @__PURE__ */ jsxs89("time", { children: [
            new Date(current.time * 1e3).toISOString().slice(0, 16).replace("T", " "),
            " ",
            "UTC"
          ] }),
          ["open", "high", "low", "close"].map((key) => /* @__PURE__ */ jsxs89("span", { children: [
            key[0].toUpperCase(),
            " ",
            /* @__PURE__ */ jsx144("b", { children: current[key].toFixed(digits) })
          ] }, key))
        ] }) : "No OHLC data" }),
        /* @__PURE__ */ jsxs89("div", { className: "ss-chart-canvas-wrap", children: [
          /* @__PURE__ */ jsx144(
            "div",
            {
              ref: container,
              className: "ss-chart-canvas",
              style: { height },
              "aria-hidden": "true"
            }
          ),
          (loading || !ready && !engineError && !error || error || engineError || !bars.length) && /* @__PURE__ */ jsxs89(
            "div",
            {
              className: "ss-chart-overlay",
              role: loading || !ready && !engineError && !error ? void 0 : "status",
              children: [
                loading || !ready && !engineError && !error ? /* @__PURE__ */ jsx144(SingleSparkSkeleton, { variant: "chart", label: "Loading chart\u2026" }) : error || engineError || "No price data for this interval",
                (error || engineError) && /* @__PURE__ */ jsx144(
                  SingleSparkButton,
                  {
                    onClick: () => {
                      setAttempt((n) => n + 1);
                      onRetry?.();
                    },
                    children: "Retry"
                  }
                )
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs89("footer", { className: "ss-chart-toolbar", children: [
          /* @__PURE__ */ jsxs89(
            SingleSparkButton,
            {
              size: "sm",
              "aria-pressed": volume,
              onClick: () => setVolume(!volume),
              children: [
                "Volume ",
                volume ? "on" : "off"
              ]
            }
          ),
          /* @__PURE__ */ jsxs89("div", { children: [
            /* @__PURE__ */ jsx144(SingleSparkIconButton, { "aria-label": "Zoom in", onClick: () => zoom(0.7), children: /* @__PURE__ */ jsx144(SingleSparkIcon, { name: "plus" }) }),
            /* @__PURE__ */ jsx144(
              SingleSparkIconButton,
              {
                "aria-label": "Zoom out",
                onClick: () => zoom(1.4),
                children: /* @__PURE__ */ jsx144(SingleSparkIcon, { name: "minus" })
              }
            ),
            /* @__PURE__ */ jsx144(
              SingleSparkButton,
              {
                size: "sm",
                onClick: () => instance.current?.timeScale().fitContent(),
                children: "Reset view"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs89("details", { className: "ss-chart-data", children: [
          /* @__PURE__ */ jsxs89("summary", { children: [
            "View OHLC data (",
            Math.min(50, bars.length),
            " latest bars)"
          ] }),
          /* @__PURE__ */ jsx144("div", { className: "ss-trades-table", children: /* @__PURE__ */ jsxs89("table", { children: [
            /* @__PURE__ */ jsx144("thead", { children: /* @__PURE__ */ jsx144("tr", { children: ["UTC", "Open", "High", "Low", "Close", "Volume"].map(
              (label) => /* @__PURE__ */ jsx144("th", { children: label }, label)
            ) }) }),
            /* @__PURE__ */ jsx144("tbody", { children: bars.slice(-50).map((c) => /* @__PURE__ */ jsxs89("tr", { children: [
              /* @__PURE__ */ jsx144("td", { children: new Date(c.time * 1e3).toISOString().slice(5, 16).replace("T", " ") }),
              [c.open, c.high, c.low, c.close, c.volume].map(
                (value, i) => /* @__PURE__ */ jsx144("td", { children: value ?? "0" }, i)
              )
            ] }, c.time)) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsx144(
          "a",
          {
            className: "ss-chart-credit",
            href: "https://www.tradingview.com/",
            target: "_blank",
            rel: "noreferrer",
            children: "Charts powered by TradingView Lightweight Charts\u2122"
          }
        )
      ]
    }
  );
}

// react/singlespark-trade.shared.tsx
function parseSingleSparkAmount(value, decimals) {
  if (typeof value !== "string" || !Number.isInteger(decimals) || decimals < 0 || decimals > 36 || value.length > 120 || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value))
    return null;
  const [whole = "0", fraction = ""] = value.split(".");
  if (fraction.length > decimals) return null;
  return BigInt(whole || "0") * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, "0") || "0");
}
function formatSingleSparkAmount(units, decimals) {
  if (units < 0n || !Number.isInteger(decimals) || decimals < 0 || decimals > 36)
    throw new RangeError("Invalid token amount");
  if (!decimals) return String(units);
  const padded = units.toString().padStart(decimals + 1, "0");
  return `${padded.slice(0, -decimals)}.${padded.slice(-decimals)}`.replace(
    /\.?0+$/,
    ""
  );
}
var singleSparkNativeSol = {
  id: "native",
  symbol: "SOL",
  name: "Solana",
  decimals: 9,
  chain: "solana"
};
function singleSparkTradeRequestKey(request) {
  return JSON.stringify([
    request.side,
    request.token.chain,
    request.token.id,
    request.token.decimals,
    request.currency.chain,
    request.currency.id,
    request.currency.decimals,
    request.amount,
    request.slippageBps
  ]);
}
function isSingleSparkQuoteValid(quote, decimals, now = Date.now()) {
  const output = parseSingleSparkAmount(quote.amountOut, decimals), minimum = parseSingleSparkAmount(quote.minimumReceived, decimals);
  return output !== null && output > 0n && minimum !== null && minimum > 0n && minimum <= output && Number.isFinite(quote.expiresAt) && quote.expiresAt > now && (quote.priceImpact === void 0 || Number.isFinite(quote.priceImpact));
}

// react/components/singlespark-trade/SingleSparkTradeTabs.tsx
import { jsx as jsx145 } from "react/jsx-runtime";
function SingleSparkTradeTabs({
  value = "buy",
  onChange,
  className = ""
}) {
  return /* @__PURE__ */ jsx145(
    SingleSparkTabs,
    {
      className: `ss-trade-tabs ${className}`,
      values: ["Buy", "Sell"],
      value: value === "buy" ? "Buy" : "Sell",
      label: "Trade side",
      onChange: (next) => onChange?.(next === "Buy" ? "buy" : "sell")
    }
  );
}

// react/components/singlespark-trade/SingleSparkTokenAmountInput.tsx
import { forwardRef, useId as useId7 } from "react";
import { jsx as jsx146, jsxs as jsxs90 } from "react/jsx-runtime";
var SingleSparkTokenAmountInput = forwardRef(function SingleSparkTokenAmountInput2({
  value = "",
  onChange,
  symbol = "SOL",
  icon,
  iconContent,
  label = "Amount",
  balance,
  balanceContent,
  inputProps,
  maxAmount,
  error,
  disabled = false,
  className = ""
}, ref) {
  const generatedId = useId7();
  const id = inputProps?.id ?? generatedId;
  return /* @__PURE__ */ jsxs90("div", { className: `ss-amount ${className}`, "data-invalid": !!error, children: [
    /* @__PURE__ */ jsxs90("div", { className: "ss-amount-heading", children: [
      /* @__PURE__ */ jsx146("label", { htmlFor: id, children: label }),
      balanceContent ?? /* @__PURE__ */ jsxs90("span", { children: [
        "Balance: ",
        balance ?? "0",
        " ",
        symbol
      ] })
    ] }),
    /* @__PURE__ */ jsxs90("div", { className: "ss-amount-field", children: [
      /* @__PURE__ */ jsx146(
        "input",
        {
          ...inputProps,
          ref,
          id,
          value,
          inputMode: "decimal",
          autoComplete: "off",
          placeholder: "0.00",
          disabled,
          "aria-invalid": !!error,
          "aria-describedby": [inputProps?.["aria-describedby"], `${id}-error`].filter(Boolean).join(" "),
          onChange: (e) => onChange?.(e.target.value)
        }
      ),
      /* @__PURE__ */ jsxs90("span", { children: [
        iconContent ?? /* @__PURE__ */ jsx146(SingleSparkTokenIcon, { symbol, src: icon, size: 24 }),
        symbol
      ] }),
      maxAmount !== void 0 && /* @__PURE__ */ jsx146(
        SingleSparkButton,
        {
          size: "sm",
          disabled,
          onClick: () => onChange?.(maxAmount),
          children: "Max"
        }
      )
    ] }),
    /* @__PURE__ */ jsx146("small", { id: `${id}-error`, "aria-live": "polite", className: "ss-error ss-amount-error", children: error })
  ] });
});

// react/components/singlespark-trade/SingleSparkAmountPresets.tsx
import { jsx as jsx147, jsxs as jsxs91 } from "react/jsx-runtime";
function SingleSparkAmountPresets({
  values = [
    { label: "0.1 SOL", value: "0.1" },
    { label: "0.5 SOL", value: "0.5" },
    { label: "1 SOL", value: "1" }
  ],
  value,
  onChange,
  disabled = false,
  showReset = true,
  label = "Quick amounts",
  busy = false,
  className = ""
}) {
  return /* @__PURE__ */ jsxs91(
    "div",
    {
      className: `ss-amount-presets ${className}`,
      role: "group",
      "aria-label": label,
      "aria-busy": busy,
      children: [
        showReset && /* @__PURE__ */ jsx147(
          SingleSparkButton,
          {
            size: "sm",
            disabled,
            onClick: () => onChange?.(""),
            children: "Reset"
          }
        ),
        values.map((item) => /* @__PURE__ */ jsx147(
          SingleSparkButton,
          {
            size: "sm",
            disabled,
            "aria-pressed": value === item.value,
            onClick: () => onChange?.(item.value),
            children: /* @__PURE__ */ jsx147(SingleSparkMoney, { value: item.label })
          },
          item.label
        ))
      ]
    }
  );
}

// react/components/singlespark-trade/SingleSparkSlippageControl.tsx
import { useEffect as useEffect9, useState as useState21 } from "react";
import { jsx as jsx148, jsxs as jsxs92 } from "react/jsx-runtime";
function SingleSparkSlippageControl({
  value,
  onChange,
  className = ""
}) {
  const [draft, setDraft] = useState21(
    value === void 0 ? "" : String(value / 100)
  );
  useEffect9(() => {
    if (value !== void 0) setDraft(String(value / 100));
  }, [value]);
  const units = parseSingleSparkAmount(draft, 2);
  const valid = units !== null && units >= 1n && units <= 5000n;
  return /* @__PURE__ */ jsxs92("div", { className: `ss-slippage ${className}`, children: [
    /* @__PURE__ */ jsxs92("label", { children: [
      "Max slippage",
      /* @__PURE__ */ jsxs92("div", { className: "ss-slippage-field", children: [
        /* @__PURE__ */ jsx148(
          "input",
          {
            "aria-label": "Max slippage percent",
            inputMode: "decimal",
            value: draft,
            "aria-invalid": !valid,
            onChange: (e) => {
              setDraft(e.target.value);
              const n = parseSingleSparkAmount(e.target.value, 2);
              onChange?.(
                n !== null && n >= 1n && n <= 5000n ? Number(n) : void 0
              );
            }
          }
        ),
        /* @__PURE__ */ jsx148("span", { children: "%" })
      ] })
    ] }),
    /* @__PURE__ */ jsx148("div", { className: "ss-amount-presets", children: [50, 100, 300].map((n) => /* @__PURE__ */ jsxs92(
      SingleSparkButton,
      {
        size: "sm",
        "aria-pressed": value === n,
        onClick: () => {
          setDraft(String(n / 100));
          onChange?.(n);
        },
        children: [
          n / 100,
          "%"
        ]
      },
      n
    )) }),
    /* @__PURE__ */ jsx148("small", { className: !valid ? "ss-error" : "ss-muted", children: !valid ? "Enter a value between 0.01% and 50%." : Number(units) > 500 ? "High slippage: the final amount may differ substantially." : "The trade will fail if the execution price exceeds this tolerance." })
  ] });
}

// react/components/singlespark-trade/SingleSparkTradeSummary.tsx
import { jsx as jsx149 } from "react/jsx-runtime";
function SingleSparkTradeSummary({
  quote,
  entries,
  loading = false,
  symbol = "TOKEN",
  slippageBps = 100,
  className = ""
}) {
  if (loading)
    return /* @__PURE__ */ jsx149(
      SingleSparkSkeleton,
      {
        variant: "text",
        rows: 5,
        label: "Loading quote\u2026",
        className
      }
    );
  return /* @__PURE__ */ jsx149(
    SingleSparkKeyValueList,
    {
      className: `ss-trade-summary ${className}`,
      entries: (entries ?? [
        ["Expected output", quote ? `${quote.amountOut} ${symbol}` : "0"],
        [
          "Minimum received",
          quote ? `${quote.minimumReceived} ${symbol}` : "0"
        ],
        ["Max slippage", `${slippageBps / 100}%`],
        [
          "Price impact",
          quote?.priceImpact === void 0 ? "0%" : `${quote.priceImpact.toFixed(2)}%`
        ],
        ["Estimated fee", quote?.fee || "0"]
      ]).map(([label, value]) => [label, typeof value === "string" || typeof value === "number" ? /* @__PURE__ */ jsx149(SingleSparkMoney, { value }) : value])
    }
  );
}

// react/components/singlespark-trade/SingleSparkTransactionStatus.tsx
import { jsx as jsx150, jsxs as jsxs93 } from "react/jsx-runtime";
function SingleSparkTransactionStatus({
  status = "idle",
  message,
  label,
  hash,
  className = ""
}) {
  const labels = {
    idle: "Ready to trade",
    quoting: "Fetching quote\u2026",
    signing: "Confirm in your wallet",
    submitted: "Transaction submitted",
    confirmed: "Transaction confirmed",
    error: "Transaction failed"
  };
  return /* @__PURE__ */ jsxs93(
    "div",
    {
      className: `ss-transaction-status ${className}`,
      "data-status": status,
      role: "status",
      children: [
        ["quoting", "signing", "submitted"].includes(status) ? /* @__PURE__ */ jsx150(SingleSparkLoading, { decorative: true }) : /* @__PURE__ */ jsx150(
          SingleSparkIcon,
          {
            name: status === "error" ? "warning" : status === "confirmed" ? "check" : "clock"
          }
        ),
        /* @__PURE__ */ jsxs93("div", { children: [
          /* @__PURE__ */ jsx150("strong", { children: label ?? labels[status] }),
          message && /* @__PURE__ */ jsx150("small", { children: message }),
          hash && /* @__PURE__ */ jsx150("code", { children: hash })
        ] })
      ]
    }
  );
}

// react/components/singlespark-trade/SingleSparkTokenTradePanel.tsx
import { useEffect as useEffect10, useRef as useRef9, useState as useState22 } from "react";
import { jsx as jsx151, jsxs as jsxs94 } from "react/jsx-runtime";
function SingleSparkTokenTradePanel({
  token,
  currency = singleSparkNativeSol,
  tokenBalance,
  currencyBalance,
  maxBuyAmount,
  connected = false,
  onConnect,
  onQuote,
  onTrade,
  className = ""
}) {
  const [side, setSide] = useState22("buy");
  const [amount, setAmount] = useState22("");
  const [slippage, setSlippage] = useState22(100);
  const [settings, setSettings] = useState22(false);
  const [review, setReview] = useState22(false);
  const [quoteResult, setQuoteResult] = useState22();
  const [status, setStatus] = useState22("idle");
  const [message, setMessage] = useState22("");
  const [hash, setHash] = useState22();
  const [refresh, setRefresh] = useState22(0);
  const [now, setNow] = useState22(Date.now);
  const submitting = useRef9(false);
  const mounted = useRef9(true);
  useEffect10(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const input = side === "buy" ? currency : token;
  const output = side === "buy" ? token : currency;
  const balance = side === "buy" ? currencyBalance : tokenBalance;
  const units = input ? parseSingleSparkAmount(amount, input.decimals) : null;
  const available = balance !== void 0 && input ? parseSingleSparkAmount(balance, input.decimals) : null;
  const spendable = side === "buy" && maxBuyAmount !== void 0 ? parseSingleSparkAmount(maxBuyAmount, currency.decimals) : null;
  const error = amount && units === null ? `Enter a valid amount (up to ${input?.decimals ?? 0} decimals).` : units !== null && available !== null && units > available ? "Insufficient balance" : units !== null && spendable !== null && units > spendable ? "Amount exceeds available balance after fees" : "";
  const sameAsset = token?.chain === currency.chain && token.id === currency.id;
  const request = token && token.chain === currency.chain && !sameAsset && units !== null && units > 0n && !error && slippage !== void 0 ? { side, token, currency, amount, slippageBps: slippage } : void 0;
  const key = request ? singleSparkTradeRequestKey(request) : "";
  const busy = status === "signing";
  const requestRef = useRef9(request);
  requestRef.current = request;
  useEffect10(() => {
    if (submitting.current) return;
    setQuoteResult(void 0);
    setMessage("");
    setHash(void 0);
    setStatus("idle");
    setReview(false);
    const controller = new AbortController();
    if (!key || !onQuote || !connected) return () => controller.abort();
    setStatus("quoting");
    const timer = setTimeout(async () => {
      try {
        const quote2 = await onQuote(requestRef.current, controller.signal);
        if (controller.signal.aborted) return;
        const current = requestRef.current;
        if (!current || singleSparkTradeRequestKey(current) !== key) return;
        const decimals = current.side === "buy" ? current.token.decimals : current.currency.decimals;
        if (!isSingleSparkQuoteValid(quote2, decimals))
          throw new Error("Quote is invalid or expired. Try again.");
        setQuoteResult({ key, quote: quote2 });
        setNow(Date.now());
        setStatus("idle");
      } catch (cause) {
        if (!controller.signal.aborted) {
          setStatus("error");
          setMessage(
            cause instanceof Error ? cause.message : "Unable to fetch quote"
          );
        }
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, onQuote, connected, refresh]);
  useEffect10(() => {
    if (!quoteResult) return;
    const timer = setTimeout(
      () => setNow(Date.now()),
      Math.max(
        0,
        Math.min(2147483647, quoteResult.quote.expiresAt - Date.now() + 20)
      )
    );
    return () => clearTimeout(timer);
  }, [quoteResult]);
  const quote = quoteResult?.key === key ? quoteResult.quote : void 0;
  const expired = !!quote && quote.expiresAt <= now;
  const canTrade = connected && !!request && !!quote && !expired && !!onTrade && !busy && status !== "submitted" && status !== "confirmed";
  const submit = async () => {
    const current = requestRef.current;
    if (submitting.current || !canTrade || !current || !quote || !onTrade || !isSingleSparkQuoteValid(quote, output.decimals)) {
      setNow(Date.now());
      return;
    }
    submitting.current = true;
    setReview(false);
    setStatus("signing");
    setMessage("");
    try {
      const receipt = await onTrade(current, quote);
      if (mounted.current) {
        setStatus(receipt.status);
        setHash(receipt.hash);
      }
    } catch (cause) {
      if (mounted.current) {
        setStatus("error");
        setMessage(
          cause instanceof Error ? cause.message : "Trade failed. Please retry."
        );
      }
    } finally {
      submitting.current = false;
    }
  };
  const sellUnits = tokenBalance !== void 0 && token ? parseSingleSparkAmount(tokenBalance, token.decimals) : null;
  const presets = side === "buy" ? ["0.1", "0.5", "1"].map((value) => ({
    label: `${value} ${currency.symbol}`,
    value
  })) : sellUnits !== null && token ? [25, 50, 75, 100].map((percent) => ({
    label: `${percent}%`,
    value: formatSingleSparkAmount(
      sellUnits * BigInt(percent) / 100n,
      token.decimals
    )
  })) : [];
  const actionLabel = !connected ? "Connect wallet" : !token ? "Select a market" : sameAsset || token.chain !== currency.chain ? "Unsupported pair" : !onQuote || !onTrade ? "Trading unavailable" : !amount || units === 0n ? "Enter an amount" : error ? "Check amount" : slippage === void 0 ? "Check slippage" : expired ? "Quote expired" : `Review ${side}`;
  return /* @__PURE__ */ jsxs94("section", { className: `ss-token-trade ${className}`, "data-side": side, children: [
    /* @__PURE__ */ jsxs94("header", { children: [
      /* @__PURE__ */ jsx151(SingleSparkTokenIdentity, { token }),
      /* @__PURE__ */ jsx151(
        SingleSparkIconButton,
        {
          "aria-label": "Trade settings",
          onClick: () => setSettings(true),
          disabled: busy,
          children: /* @__PURE__ */ jsx151(SingleSparkIcon, { name: "settings" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs94("fieldset", { disabled: busy, children: [
      /* @__PURE__ */ jsx151(
        SingleSparkTradeTabs,
        {
          value: side,
          onChange: (next) => {
            setSide(next);
            setAmount("");
          }
        }
      ),
      /* @__PURE__ */ jsxs94("div", { className: "ss-trade-context", children: [
        /* @__PURE__ */ jsx151("span", { children: singleSparkChains[currency.chain].name }),
        /* @__PURE__ */ jsxs94(SingleSparkButton, { size: "sm", onClick: () => setSettings(true), children: [
          "Slippage ",
          slippage === void 0 ? "0%" : `${slippage / 100}%`
        ] })
      ] }),
      /* @__PURE__ */ jsx151(
        SingleSparkTokenAmountInput,
        {
          value: amount,
          onChange: setAmount,
          symbol: input?.symbol || "TOKEN",
          icon: input?.icon,
          label: side === "buy" ? "You pay" : "You sell",
          balance,
          maxAmount: side === "buy" ? maxBuyAmount : tokenBalance,
          error
        }
      ),
      /* @__PURE__ */ jsx151(
        SingleSparkAmountPresets,
        {
          values: presets,
          value: amount,
          onChange: setAmount
        }
      )
    ] }),
    (quote || status === "quoting") && /* @__PURE__ */ jsx151(
      SingleSparkTradeSummary,
      {
        loading: status === "quoting",
        quote,
        symbol: output?.symbol,
        slippageBps: slippage
      }
    ),
    /* @__PURE__ */ jsxs94(
      SingleSparkButton,
      {
        className: "ss-trade-action",
        variant: "primary",
        disabled: busy || (connected ? !canTrade : !onConnect),
        loading: busy || status === "quoting",
        onClick: () => connected ? setReview(true) : onConnect?.(),
        children: [
          /* @__PURE__ */ jsx151(SingleSparkIcon, { name: side === "buy" ? "trend-up" : "trend-down" }),
          actionLabel
        ]
      }
    ),
    (expired || status === "error" || status === "submitted" || status === "confirmed") && /* @__PURE__ */ jsxs94(
      SingleSparkButton,
      {
        size: "sm",
        onClick: () => setRefresh((n) => n + 1),
        disabled: busy,
        children: [
          /* @__PURE__ */ jsx151(SingleSparkIcon, { name: "refresh", size: 14 }),
          expired ? "Refresh expired quote" : "New quote"
        ]
      }
    ),
    status !== "idle" && /* @__PURE__ */ jsx151(
      SingleSparkTransactionStatus,
      {
        status,
        message,
        hash
      }
    ),
    /* @__PURE__ */ jsx151(
      SingleSparkModal,
      {
        open: settings,
        onOpenChange: setSettings,
        title: "Trade settings",
        width: 380,
        footer: /* @__PURE__ */ jsx151(
          SingleSparkButton,
          {
            variant: "primary",
            disabled: slippage === void 0,
            onClick: () => setSettings(false),
            children: "Done"
          }
        ),
        children: /* @__PURE__ */ jsx151(SingleSparkSlippageControl, { value: slippage, onChange: setSlippage })
      }
    ),
    /* @__PURE__ */ jsxs94(
      SingleSparkModal,
      {
        open: review,
        onOpenChange: setReview,
        title: `Review ${side}`,
        width: 420,
        footer: /* @__PURE__ */ jsxs94(
          SingleSparkButton,
          {
            variant: "primary",
            disabled: !canTrade,
            onClick: submit,
            children: [
              "Confirm ",
              side
            ]
          }
        ),
        children: [
          /* @__PURE__ */ jsxs94("p", { children: [
            amount,
            " ",
            input?.symbol,
            " \u2192 ",
            quote?.amountOut || "0",
            " ",
            output?.symbol
          ] }),
          /* @__PURE__ */ jsx151(
            SingleSparkTradeSummary,
            {
              quote,
              symbol: output?.symbol,
              slippageBps: slippage
            }
          ),
          expired && /* @__PURE__ */ jsx151("p", { className: "ss-error", role: "alert", children: "Quote expired. Close and refresh before continuing." })
        ]
      }
    )
  ] });
}

// react/singlespark-web3.ts
var singleSparkWeb3Components = {
  SingleSparkChainIcon,
  SingleSparkTokenIcon,
  SingleSparkTokenIdentity,
  SingleSparkPriceChange,
  SingleSparkSparkline,
  SingleSparkStatCard,
  SingleSparkStatGrid,
  SingleSparkBondingProgress,
  SingleSparkTradesTable,
  SingleSparkCandlestickChart,
  SingleSparkTradeTabs,
  SingleSparkTokenAmountInput,
  SingleSparkAmountPresets,
  SingleSparkSlippageControl,
  SingleSparkTradeSummary,
  SingleSparkTransactionStatus,
  SingleSparkTokenTradePanel
};

export {
  SingleSparkModal,
  defaultWalletOptions,
  SingleSparkWalletButton,
  SingleSparkWalletOption,
  SingleSparkWalletList,
  SingleSparkWalletStatus,
  SingleSparkWalletDialog,
  singleSparkWalletComponents,
  singleSparkNavigation,
  defaultPreviewTokens,
  SingleSparkHero,
  TokenPreviewWall,
  PaymentPreviewStack,
  Graph,
  AnalyticsVisual,
  AnalyticsPreview,
  LaunchPreview,
  DocsPreview,
  FeaturePreviewGrid,
  SingleSparkGlobalSearch,
  SingleSparkTopbar,
  SingleSparkMobileMenu,
  SingleSparkSidebar,
  SingleSparkFooter,
  singleSparkHomeComponents,
  defaultSingleSparkPayment,
  SingleSparkTokenCard,
  LaunchpadFilter,
  SectionPagination,
  TopTokenGrid,
  TopProfileList,
  TopSingleSparkTokenList,
  ExploreFilters,
  TokenCatalog,
  TrendingStrip,
  PaymentRow,
  PaymentBreakdown,
  AssetTransferRow,
  PaymentSummary,
  HistoricalReceiptDetails,
  RampEventDetails,
  OffRampList,
  OnRampList,
  SingleSparkTokenHeader,
  RecipientSummary,
  ClaimEligibilityCard,
  HistoricalBalanceCard,
  SingleSparkMarketChart,
  FeeClaimRow,
  TokenActivityTabs,
  ProfileUnavailable,
  SingleSparkProfileContent,
  ClaimTermsNotice,
  ClaimSignIn,
  ClaimAssetPicker,
  ClaimWalletForm,
  ClaimStatusTracker,
  LaunchCurrency,
  SingleSparkRecipientSearch,
  DeployerRewardField,
  SingleSparkMetadataForm,
  SocialLinksFields,
  InitialBuyField,
  PonsTaxField,
  LaunchConsentAndWallet,
  NotificationFrame,
  LaunchLivePreview,
  FeeSplitSummary,
  SingleSparkRegisterForm,
  SingleSparkLaunchModes,
  SingleSparkWalletlessGuide,
  SingleSparkPageIntro,
  AnalyticsRange,
  AnalyticsMetrics,
  AnalyticsCharts,
  BuybackDetails,
  BuybackSummary,
  BurnCard,
  BuybackList,
  AnalyticsMethodology,
  SingleSparkFacts,
  BuyBurnSteps,
  BuybackActivityNotice,
  ProtocolArticle,
  CapitalFlowSections,
  OfficialLinkHub,
  LegalArticle,
  OptOutExplanation,
  OptOutStatus,
  OptOutSteps,
  singleSparkBusinessComponents,
  normalizeSingleSparkCandles,
  SingleSparkCandlestickChart,
  parseSingleSparkAmount,
  formatSingleSparkAmount,
  singleSparkNativeSol,
  singleSparkTradeRequestKey,
  isSingleSparkQuoteValid,
  SingleSparkTradeTabs,
  SingleSparkTokenAmountInput,
  SingleSparkAmountPresets,
  SingleSparkSlippageControl,
  SingleSparkTradeSummary,
  SingleSparkTransactionStatus,
  SingleSparkTokenTradePanel,
  singleSparkWeb3Components
};
