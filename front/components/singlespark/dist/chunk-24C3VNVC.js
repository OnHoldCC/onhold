'use client';
import {
  backersAssetUrls
} from "./chunk-C5AITWP6.js";

// react/backers.shared.tsx
import { createContext } from "react";
var asset = (path) => backersAssetUrls[path.replace(/^\/assets\/backers\//, "")] || path;
var Navigation = createContext({});
var money = (cents) => "$" + (cents / 100).toLocaleString("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
function compact(cents) {
  const value = cents / 100, amount = Math.abs(value), prefix = value < 0 ? "-$" : "$";
  if (amount < 1) return prefix + amount.toFixed(2);
  if (amount < 1e4)
    return prefix + Math.floor(amount).toLocaleString("en-US");
  for (const [scale, suffix] of [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"]
  ])
    if (amount >= scale) {
      const n = amount / scale;
      return prefix + (n >= 100 ? Math.floor(n) : (Math.floor(n * 10) / 10).toFixed(1).replace(/\.0$/, "")) + suffix;
    }
  return prefix + amount;
}
function tokenPrice(value) {
  if (!Number.isFinite(value) || value <= 0) return "0";
  if (value >= 1)
    return value.toLocaleString("en-US", {
      maximumSignificantDigits: Math.max(4, Math.floor(Math.log10(value)) + 1)
    });
  const rounded = Number(value.toPrecision(4));
  if (rounded >= 1) return "1";
  const zeros = Math.max(0, Math.ceil(-Math.log10(rounded)) - 1), digits = rounded.toFixed(zeros + 4).slice(zeros + 2).replace(/0+$/, "");
  return zeros < 4 ? "0." + "0".repeat(zeros) + digits : "0.0" + String(zeros).replace(/\d/g, (d) => "\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089"[Number(d)]) + digits;
}
var brief = (s) => s.slice(0, 4) + "\u2026" + s.slice(-4);
var howSteps = [
  [
    "coin",
    "Pick a coin",
    "Every coin names one person on X. Its trading fees fill a pool, in SOL, to pay them."
  ],
  [
    "x",
    "Pay them with X Money",
    "Tap Back, then send the money in X Money within 10 minutes and paste the receipt link."
  ],
  [
    "wallet",
    "Get it back +10%",
    "Once the receipt checks out, the pool pays you back what you sent plus a 10% bonus, in SOL."
  ]
];
var contents = [
  ["overview", "Overview"],
  ["backing", "Back someone"],
  ["receipt", "Receipt links"],
  ["checks", "What we check"],
  ["payouts", "Payouts"],
  ["pending", "Pending payments"],
  ["limits", "Limits and tiers"],
  ["strikes", "Strikes and bans"],
  ["review", "Manual review"],
  ["launching", "Launch a coin"],
  ["register", "Bring a coin"],
  ["recipients", "Being named"],
  ["money", "Where money goes"],
  ["trading", "Trading"],
  ["safety", "Safety & privacy"],
  ["faq", "FAQ"],
  ["glossary", "Glossary"]
];
var faq = [
  [
    "What is Backers?",
    "A launchpad for Pump.fun coins that pay people on X. Each coin names one X account; its trading fees fill a pool; anyone who sends that person money with X Money can get it back from the pool, plus 10%, in SOL."
  ],
  [
    "Do I need crypto to back someone?",
    "You pay the recipient in US dollars with X Money. To receive your payout you need a Solana wallet linked to your X account, with a little SOL for network fees (0.01 SOL is plenty)."
  ],
  [
    "Why do I sign in with X?",
    "X Money receipts show who sent a payment and to whom. Your X sign-in lets us match your payments to your holds. We read your profile once and never post for you."
  ],
  [
    "Which wallets work?",
    "Phantom, Solflare, Backpack and any other standard Solana wallet. On a phone, open trybackers.com in your wallet app\u2019s browser."
  ]
];
var chartURL = new URL(
  "../assets/backers/lightweight-charts-5.2.1.js",
  import.meta.url
).href;
var emptyCandles = [];
var intervalSeconds = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
  "4h": 14400,
  "1d": 86400
};
var rules = [
  ["SingleSpark in US dollars", "Rejected, strike"],
  ["Sent from your X account", "Rejected, strike"],
  ["Sent to the coin\u2019s recipient", "Rejected, strike"],
  ["Made during your hold", "Rejected, strike"],
  ["At least $10.00", "Rejected, strike"],
  ["Not already used for another hold", "Rejected, strike"],
  [
    "Status Completed",
    "Pending: waits for the recipient (no strike). Cancelled: rejected, strike"
  ],
  [
    "Sender or recipient renamed during the hold",
    "Checked by hand (no strike)"
  ],
  ["A receipt we can\u2019t read automatically", "Checked by hand (no strike)"]
];
var glossary = [
  [
    "Backer",
    "Someone who pays a coin\u2019s recipient with X Money and gets it back from the pool."
  ],
  ["Recipient", "The person on X named by the coin."],
  [
    "Pool",
    "SOL collected from a coin\u2019s trading fees, held by the Backers program."
  ],
  ["Hold", "A reservation in a pool for a payment you will make."],
  [
    "Ready to back",
    "The largest payment a pool can cover right now, bonus included."
  ]
];

// react/components/backers/Scope.tsx
import { useEffect, useRef } from "react";
import { jsx } from "react/jsx-runtime";
function Scope({
  name,
  children,
  ...props
}) {
  const element = useRef(null);
  useEffect(() => {
    element.current?.getAnimations({ subtree: true }).forEach(
      (animation) => props.paused ? animation.pause() : animation.play()
    );
  }, [props.paused]);
  return /* @__PURE__ */ jsx(Navigation.Provider, { value: props, children: /* @__PURE__ */ jsx(
    "div",
    {
      ref: element,
      className: `p-root backers b-source b-component-${name} ${props.className || ""}`,
      children
    }
  ) });
}

// react/components/backers/Button.tsx
import { useContext } from "react";
import { jsx as jsx2 } from "react/jsx-runtime";
function Button({
  children,
  target,
  action,
  variant = "secondary",
  onClick,
  ...props
}) {
  const navigation = useContext(Navigation);
  return /* @__PURE__ */ jsx2(
    "button",
    {
      ...props,
      type: props.type || "button",
      className: `b-button b-${variant} ${props.className || ""}`,
      onClick: (event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          if (target) navigation.onNavigate?.(target);
          else if (action) navigation.onAction?.(action);
        }
      },
      children
    }
  );
}

// assets/backers/snapshot.json
var snapshot_default = {
  coins: [
    {
      mint: "CuEYhPvrm4wU52RANvCgmUS8f9hAaNN4rTwWN8LWv6KT",
      name: "OUROBOROS",
      symbol: "OUROCHAT",
      image_url: "/assets/backers/coin-0.jpg",
      description: "one login. every brain. the last AI account you\u2019ll ever need. your context, portable across any model.",
      recipient: {
        x_id: "1522646693514207232",
        handle: "sierracatalina",
        name: "\u26AA\uFE0F sierra catalina",
        avatar_url: "/assets/backers/person-1.jpg",
        instant_payouts: true
      },
      launcher: "7PC4EESvTMSZGkkvQRoCmSYLL42vvXLnvEKosPhjQQeZ",
      links: {
        website: "https://trybackers.com/coin/CuEYhPvrm4wU52RANvCgmUS8f9hAaNN4rTwWN8LWv6KT",
        twitter: "https://x.com/sierracatalina",
        telegram: null
      },
      created_at: 1791260399,
      pool: {
        available_lamports: "31191724299",
        locked_lamports: "0",
        available_usd_cents: 366779,
        deliverable_cents: 303123,
        delivered_cents: 30800,
        reward_cents: 3080,
        fees_lamports: "34054998178",
        fees_usd_cents: 400448,
        holds_count: 14,
        waiting_count: 0
      },
      market: {
        price_sol: 13550012082620952e-23,
        market_cap_usd_cents: 1593328,
        change_24h_bps: 24123,
        volume_24h_lamports: "4930135073044",
        trades_24h: 10066,
        curve_progress_bps: 1e4,
        graduated: true,
        last_trade_at: 1791367554,
        sparkline: [
          39701317897228376e-24,
          38688883027736295e-24,
          3868323269525977e-23,
          3804258921305711e-23,
          38023911370530644e-24,
          38005221878517357e-24,
          9300458893996615e-23,
          34681974599165515e-23,
          6804661378614615e-22,
          5404116587929772e-22,
          6293698187899284e-22,
          2915740608497382e-22,
          37615226208704665e-23,
          3486878787915175e-22,
          22316452809740197e-23,
          18235843271853752e-23,
          18064339195881896e-23,
          1593247209562264e-22,
          13090259770424462e-23,
          16019218572175693e-23,
          132868134141277e-21,
          1477605099227472e-22,
          14976945160335374e-23,
          13924131265097422e-23,
          13550012082620952e-23
        ]
      },
      featured: null,
      launched_on: "backers",
      tradable: true
    },
    {
      mint: "CLHMgCrEz7GE5HJPsrTEgvE5MYYtQQ1Tkm11Yan9wKwr",
      name: "Cybertruck",
      symbol: "CYBERTRUCK",
      image_url: "/assets/backers/coin-1.png",
      description: "Daniel's Cybertruck fund",
      recipient: {
        x_id: "1396867709481127937",
        handle: "danielcberk",
        name: "Daniel Berk",
        avatar_url: "/assets/backers/person-0.jpg",
        instant_payouts: true
      },
      launcher: "Fb3fTYm3bdVMmYPG7fGeFjBAcx8GirHjaXZDUEYFijzn",
      links: {
        website: "https://trybackers.com/coin/CLHMgCrEz7GE5HJPsrTEgvE5MYYtQQ1Tkm11Yan9wKwr",
        twitter: "https://x.com/danielcberk",
        telegram: null
      },
      created_at: 1791265893,
      pool: {
        available_lamports: "8095785576",
        locked_lamports: "0",
        available_usd_cents: 95197,
        deliverable_cents: 78675,
        delivered_cents: 572500,
        reward_cents: 57250,
        fees_lamports: "60710993552",
        fees_usd_cents: 713892,
        holds_count: 270,
        waiting_count: 0
      },
      market: {
        price_sol: 11440606325229307e-23,
        market_cap_usd_cents: 1345286,
        change_24h_bps: -8400,
        volume_24h_lamports: "3394802688099",
        trades_24h: 5231,
        curve_progress_bps: 1e4,
        graduated: true,
        last_trade_at: 1791367518,
        sparkline: [
          7098070956621697e-22,
          7196319737326091e-22,
          6175545576170681e-22,
          8387297759977899e-22,
          6686891264277124e-22,
          9912261281802078e-22,
          856179342807988e-21,
          8317054226861274e-22,
          6853645527595156e-22,
          6672478229232385e-22,
          6034124953630088e-22,
          5526268422134596e-22,
          18643762204066559e-22,
          9500970362183828e-22,
          7147159816699491e-22,
          6321675011918822e-22,
          2979395951036677e-22,
          2726496401855332e-22,
          22546940866243158e-23,
          22418833025375665e-23,
          2222872033715589e-22,
          2162931324095321e-22,
          18706348090338119e-23,
          18041116698629308e-23,
          15542952577510853e-23,
          15547233417399534e-23,
          14450701862156514e-23,
          14067457477845546e-23,
          1395740060299405e-22,
          14730132662078594e-23,
          13538042944536548e-23,
          18038129667325474e-23,
          16424005260003705e-23,
          14789901175596317e-23,
          14780128609491157e-23,
          14846642010421633e-23,
          132114027346518e-21,
          1053241677346879e-22,
          10120481229618368e-23,
          12265958896135402e-23,
          1264391489423885e-22,
          12005756812471377e-23,
          12003999401289013e-23,
          10556227120547305e-23,
          10888010882742302e-23,
          11604153759398551e-23,
          11412687404040609e-23,
          11440606325229307e-23
        ]
      },
      featured: null,
      launched_on: "backers",
      tradable: true
    },
    {
      mint: "7wveA777PGPyLFxABvTuqGDrcmbtQYVE9acp2W8T26Hd",
      name: "Claudia",
      symbol: "CLAUDIA",
      image_url: "/assets/backers/coin-2.jpg",
      description: "",
      recipient: {
        x_id: "1650509966388731904",
        handle: "anabology",
        name: "anabology",
        avatar_url: "/assets/backers/person-5.jpg",
        instant_payouts: true
      },
      launcher: "CUkc1XcPXm3EyHsfUkaRZAJKq3KzgjuCuzApbnupyJkE",
      links: {
        website: "https://trybackers.com/coin/7wveA777PGPyLFxABvTuqGDrcmbtQYVE9acp2W8T26Hd",
        twitter: "https://x.com/anabology",
        telegram: null
      },
      created_at: 1791337537,
      pool: {
        available_lamports: "7148387221",
        locked_lamports: "0",
        available_usd_cents: 84056,
        deliverable_cents: 69468,
        delivered_cents: 162e3,
        reward_cents: 16200,
        fees_lamports: "22316044254",
        fees_usd_cents: 262411,
        holds_count: 70,
        waiting_count: 0
      },
      market: {
        price_sol: 31479440184693153e-24,
        market_cap_usd_cents: 370163,
        change_24h_bps: 1259,
        volume_24h_lamports: "3262728146820",
        trades_24h: 6389,
        curve_progress_bps: 1e4,
        graduated: true,
        last_trade_at: 1791364962,
        sparkline: [
          44065386098745395e-24,
          3392006219446314e-22,
          7430270993712394e-23,
          4365314127705626e-23,
          43594121976578095e-24,
          405987683442903e-22,
          4260749348439736e-23,
          4260555902659371e-23,
          35566843979957003e-24,
          35172646749561226e-24,
          3185373821674328e-23,
          30653767029372065e-24,
          29421178592217845e-24,
          28142903508939774e-24,
          2936045845404933e-23,
          31479440184693153e-24
        ]
      },
      featured: null,
      launched_on: "backers",
      tradable: true
    },
    {
      mint: "2imTYzneSK6TStn5XuCfHiG23RsHZydezT8wfrNb3zLZ",
      name: "THE MAX EXTRACTOR",
      symbol: "EXTRACTOR",
      image_url: "/assets/backers/coin-3.jpg",
      description: "Fund the movie and we'll be the investors\n\nhttps://maxextractor.xyz/",
      recipient: {
        x_id: "3159122144",
        handle: "gabrielhaines",
        name: "Gabriel M Haines",
        avatar_url: "/assets/backers/person-gabrielhaines.jpg",
        instant_payouts: true
      },
      launcher: "8GGNyJeQ7QYirfnDj3nqoeUkWF9e2P7DA1LUJjv3FXdA",
      links: {
        website: "https://trybackers.com/coin/2imTYzneSK6TStn5XuCfHiG23RsHZydezT8wfrNb3zLZ",
        twitter: "https://x.com/gabrielhaines",
        telegram: null
      },
      created_at: 1791310739,
      pool: {
        available_lamports: "105120494",
        locked_lamports: "0",
        available_usd_cents: 1236,
        deliverable_cents: 1021,
        delivered_cents: 106228,
        reward_cents: 10622,
        fees_lamports: "9837770502",
        fees_usd_cents: 115681,
        holds_count: 48,
        waiting_count: 0
      },
      market: {
        price_sol: 58524534368408106e-24,
        market_cap_usd_cents: 688182,
        change_24h_bps: 10932,
        volume_24h_lamports: "2245846369615",
        trades_24h: 4670,
        curve_progress_bps: 1e4,
        graduated: true,
        last_trade_at: 1791364688,
        sparkline: [
          3029491676067032e-22,
          16061533669463233e-23,
          15418409333257864e-23,
          12248708053929918e-23,
          12955218552033605e-23,
          11755157952411773e-23,
          10028706554483076e-23,
          9930125610946422e-23,
          10594042043465745e-23,
          1010004612401141e-22,
          10936189945793264e-23,
          10680353612279736e-23,
          10634753150706602e-23,
          9483142812022439e-23,
          7810932572433679e-23,
          830001152523613e-22,
          7366238834123174e-23,
          6984162281421234e-23,
          6977342396235503e-23,
          7116426068577985e-23,
          651873180841457e-22,
          6477343717682098e-23,
          6220695035082752e-23,
          5891359930965009e-23,
          58686549616004446e-24,
          58586839292476995e-24,
          58524534368408106e-24
        ]
      },
      featured: null,
      launched_on: "backers",
      tradable: true
    },
    {
      mint: "9hpRmPEdVrEJT1Gf5z4Thwvjqqp5BNrzs8mcHnhcD7An",
      name: "Raindrop",
      symbol: "RAINDROP",
      image_url: "/assets/backers/coin-4.jpg",
      description: "",
      recipient: {
        x_id: "61344715",
        handle: "benhylak",
        name: "ben hylak",
        avatar_url: "/assets/backers/person-benhylak.jpg",
        instant_payouts: false
      },
      launcher: "25Ui55Ty9mY6WucrCXZTq2yTwwGjrbSK6S9fW8xdQvMd",
      links: {
        website: "https://trybackers.com/coin/9hpRmPEdVrEJT1Gf5z4Thwvjqqp5BNrzs8mcHnhcD7An",
        twitter: "https://x.com/benhylak",
        telegram: null
      },
      created_at: 1791340529,
      pool: {
        available_lamports: "2082494055",
        locked_lamports: "0",
        available_usd_cents: 24487,
        deliverable_cents: 20237,
        delivered_cents: 0,
        reward_cents: 0,
        fees_lamports: "2082494055",
        fees_usd_cents: 24487,
        holds_count: 0,
        waiting_count: 0
      },
      market: {
        price_sol: 3463977221928299e-23,
        market_cap_usd_cents: 407325,
        change_24h_bps: 2389,
        volume_24h_lamports: "732827931362",
        trades_24h: 1464,
        curve_progress_bps: 1374,
        graduated: false,
        last_trade_at: 1791363809,
        sparkline: [
          3735502895440025e-23,
          3682545270772967e-23,
          3672767824016849e-23,
          3681488481203283e-23,
          3545343479394246e-23,
          35696107888456e-21,
          34795923696405285e-24,
          3463977221928299e-23
        ]
      },
      featured: null,
      launched_on: "backers",
      tradable: true
    },
    {
      mint: "22tf6f7pzW74qizLhrUisDeYXpBrKsdgdMktkAzNWdWF",
      name: "ALX",
      symbol: "ALX",
      image_url: "/assets/backers/coin-5.jpg",
      description: "",
      recipient: {
        x_id: "534023",
        handle: "alx",
        name: "ALX (x/acc) \u{1F383}\u{1F1FA}\u{1F1F8}",
        avatar_url: "/assets/backers/person-alx.jpg",
        instant_payouts: false
      },
      launcher: "25Ui55Ty9mY6WucrCXZTq2yTwwGjrbSK6S9fW8xdQvMd",
      links: {
        website: "https://trybackers.com/coin/22tf6f7pzW74qizLhrUisDeYXpBrKsdgdMktkAzNWdWF",
        twitter: "https://x.com/alx",
        telegram: null
      },
      created_at: 1791183837,
      pool: {
        available_lamports: "2640223156",
        locked_lamports: "0",
        available_usd_cents: 31046,
        deliverable_cents: 25657,
        delivered_cents: 0,
        reward_cents: 0,
        fees_lamports: "2640223156",
        fees_usd_cents: 31046,
        holds_count: 2,
        waiting_count: 0
      },
      market: {
        price_sol: 39534231749239995e-24,
        market_cap_usd_cents: 464878,
        change_24h_bps: 1310,
        volume_24h_lamports: "552369403572",
        trades_24h: 1112,
        curve_progress_bps: 2151,
        graduated: false,
        last_trade_at: 1791364876,
        sparkline: [
          3474300699617608e-23,
          9536267710002262e-23,
          1034382474886754e-22,
          6120840004665493e-23,
          7685574376318139e-23,
          5193283532613055e-23,
          4857972013272473e-23,
          4726428839704591e-23,
          45316279859823515e-24,
          45111172383127846e-24,
          4403849743944701e-23,
          4358232640355712e-23,
          4354008034708904e-23,
          39134194329683415e-24,
          37121984887149455e-24,
          37050530278100327e-24,
          3992678724676628e-23,
          49934247477431323e-24,
          5380255554055072e-23,
          4737535072569624e-23,
          4737325799574117e-23,
          43713869553441214e-24,
          41993546577236357e-24,
          4806366449064101e-23,
          454620606215278e-22,
          44691019811336275e-24,
          4099734224147513e-23,
          4092987307001784e-23,
          4072031409631243e-23,
          4051236040962596e-23,
          39534231749239995e-24
        ]
      },
      featured: null,
      launched_on: "backers",
      tradable: true
    }
  ],
  people: [
    {
      x_id: "1396867709481127937",
      handle: "danielcberk",
      name: "Daniel Berk",
      avatar_url: "/assets/backers/person-0.jpg",
      verified: true,
      instant_payouts: true,
      coins: 1,
      fees_lamports: "60710993552",
      fees_usd_cents: 713892,
      delivered_cents: 572500
    },
    {
      x_id: "1522646693514207232",
      handle: "sierracatalina",
      name: "\u26AA\uFE0F sierra catalina",
      avatar_url: "/assets/backers/person-1.jpg",
      verified: true,
      instant_payouts: true,
      coins: 3,
      fees_lamports: "50524260092",
      fees_usd_cents: 594108,
      delivered_cents: 176100
    },
    {
      x_id: "2886410451",
      handle: "MarioJoos",
      name: "Mario Joos",
      avatar_url: "/assets/backers/person-2.jpg",
      verified: true,
      instant_payouts: false,
      coins: 1,
      fees_lamports: "44527162160",
      fees_usd_cents: 523589,
      delivered_cents: 0
    },
    {
      x_id: "1797154805129113600",
      handle: "noahrshinn",
      name: "Noah Shinn",
      avatar_url: "/assets/backers/person-3.jpg",
      verified: true,
      instant_payouts: true,
      coins: 1,
      fees_lamports: "30206924910",
      fees_usd_cents: 355199,
      delivered_cents: 12500
    },
    {
      x_id: "35803",
      handle: "mattt",
      name: "Mattt",
      avatar_url: "/assets/backers/person-4.jpg",
      verified: true,
      instant_payouts: false,
      coins: 1,
      fees_lamports: "28927644464",
      fees_usd_cents: 340156,
      delivered_cents: 0
    },
    {
      x_id: "1650509966388731904",
      handle: "anabology",
      name: "anabology",
      avatar_url: "/assets/backers/person-5.jpg",
      verified: true,
      instant_payouts: true,
      coins: 5,
      fees_lamports: "23625028812",
      fees_usd_cents: 277803,
      delivered_cents: 162e3
    }
  ],
  stats: {
    coins_launched: 163,
    payments: 396,
    backers: 64,
    delivered_cents: 1110156,
    rewards_cents: 111014,
    matches_cents: 731128,
    volume_24h_lamports: "17860269191508",
    volume_total_lamports: "58291330988691",
    sol_usd: 117.58871433
  },
  events: [
    {
      kind: "payment",
      t: 1791358335,
      coin: {
        mint: "CuEYhPvrm4wU52RANvCgmUS8f9hAaNN4rTwWN8LWv6KT",
        name: "OUROBOROS",
        symbol: "OUROCHAT",
        image_url: "/assets/backers/coin-0.jpg"
      },
      backer: "chefsteve_",
      recipient: "sierracatalina",
      paid_cents: 2500,
      reward_cents: 250,
      match_cents: null
    },
    {
      kind: "payment",
      t: 1791348449,
      coin: {
        mint: "CuEYhPvrm4wU52RANvCgmUS8f9hAaNN4rTwWN8LWv6KT",
        name: "OUROBOROS",
        symbol: "OUROCHAT",
        image_url: "/assets/backers/coin-0.jpg"
      },
      backer: "NODEfather",
      recipient: "sierracatalina",
      paid_cents: 1e3,
      reward_cents: 100,
      match_cents: null
    },
    {
      kind: "payment",
      t: 1791344598,
      coin: {
        mint: "7wveA777PGPyLFxABvTuqGDrcmbtQYVE9acp2W8T26Hd",
        name: "Claudia",
        symbol: "CLAUDIA",
        image_url: "/assets/backers/coin-2.jpg"
      },
      backer: "brock_1999",
      recipient: "anabology",
      paid_cents: 2500,
      reward_cents: 250,
      match_cents: null
    },
    {
      kind: "payment",
      t: 1791344459,
      coin: {
        mint: "7wveA777PGPyLFxABvTuqGDrcmbtQYVE9acp2W8T26Hd",
        name: "Claudia",
        symbol: "CLAUDIA",
        image_url: "/assets/backers/coin-2.jpg"
      },
      backer: "brock_1999",
      recipient: "anabology",
      paid_cents: 2500,
      reward_cents: 250,
      match_cents: null
    },
    {
      kind: "payment",
      t: 1791344357,
      coin: {
        mint: "7wveA777PGPyLFxABvTuqGDrcmbtQYVE9acp2W8T26Hd",
        name: "Claudia",
        symbol: "CLAUDIA",
        image_url: "/assets/backers/coin-2.jpg"
      },
      backer: "brock_1999",
      recipient: "anabology",
      paid_cents: 2500,
      reward_cents: 250,
      match_cents: null
    }
  ],
  candles: {
    interval: "1h",
    candles: [
      {
        t: 1791259200,
        o: 279589934766799e-22,
        h: 9718628201471758e-23,
        l: 279589934766799e-22,
        c: 76985498852442e-21,
        v: "274631653973"
      },
      {
        t: 1791262800,
        o: 8328145555649363e-23,
        h: 8594302840796969e-23,
        l: 2800931383183178e-23,
        c: 38030945757706776e-24,
        v: "57390633551"
      },
      {
        t: 1791266400,
        o: 38030945758784704e-24,
        h: 4763312974274222e-23,
        l: 38030945758784704e-24,
        c: 44276736757522484e-24,
        v: "7382806742"
      },
      {
        t: 179127e4,
        o: 4427673675753831e-23,
        h: 4427673675753831e-23,
        l: 3970882290494357e-23,
        c: 3970882290494357e-23,
        v: "2000423077"
      },
      {
        t: 1791291600,
        o: 39708822905343355e-24,
        h: 39708822905343355e-24,
        l: 39701317897228376e-24,
        c: 39701317897228376e-24,
        v: "3378770"
      },
      {
        t: 1791295200,
        o: 3970131789724634e-23,
        h: 3970131789724634e-23,
        l: 3868323269525977e-23,
        c: 3868323269525977e-23,
        v: "461342579"
      },
      {
        t: 1791309600,
        o: 38683232696034367e-24,
        h: 38683232696034367e-24,
        l: 3804258921305711e-23,
        c: 3804258921305711e-23,
        v: "293423514"
      },
      {
        t: 1791320400,
        o: 38042589213987995e-24,
        h: 38042589213987995e-24,
        l: 38023911370530644e-24,
        c: 38023911370530644e-24,
        v: "8591628"
      },
      {
        t: 1791327600,
        o: 38023911371563163e-24,
        h: 38023911371563163e-24,
        l: 38005221878517357e-24,
        c: 38005221878517357e-24,
        v: "8599099"
      },
      {
        t: 1791334800,
        o: 49251031800684326e-24,
        h: 9751250471552627e-22,
        l: 4925103179958382e-23,
        c: 34681974599165515e-23,
        v: "2604833485973"
      },
      {
        t: 1791338400,
        o: 34681974599165515e-23,
        h: 9846269177584689e-22,
        l: 2676552434335414e-22,
        c: 5404116587929772e-22,
        v: "1773520324850"
      },
      {
        t: 1791342e3,
        o: 5404116587929772e-22,
        h: 7323901287625641e-22,
        l: 2777715394809947e-22,
        c: 2915740608497382e-22,
        v: "284790762558"
      },
      {
        t: 1791345600,
        o: 2915740608497382e-22,
        h: 3948762659162845e-22,
        l: 2915740608497382e-22,
        c: 3486878787915175e-22,
        v: "106304390619"
      },
      {
        t: 1791349200,
        o: 3486878787915175e-22,
        h: 3487730152300257e-22,
        l: 18235843271853752e-23,
        c: 18235843271853752e-23,
        v: "56031648084"
      },
      {
        t: 1791352800,
        o: 18235843271853752e-23,
        h: 2106614586396387e-22,
        l: 1544975953854333e-22,
        c: 1593247209562264e-22,
        v: "36963125445"
      },
      {
        t: 1791356400,
        o: 1593247209562264e-22,
        h: 16156400686682106e-23,
        l: 12721752144781285e-23,
        c: 16019218572175693e-23,
        v: "25324282863"
      },
      {
        t: 179136e4,
        o: 16019218572175693e-23,
        h: 16327290045040976e-23,
        l: 1324671690450423e-22,
        c: 1477605099227472e-22,
        v: "19513638673"
      },
      {
        t: 1791363600,
        o: 1477605099227472e-22,
        h: 15856506849439127e-23,
        l: 1322080669596402e-22,
        c: 13924131265097422e-23,
        v: "21354497604"
      },
      {
        t: 1791367200,
        o: 13924131265097422e-23,
        h: 13932808038412898e-23,
        l: 13550012082620952e-23,
        c: 1359867270744966e-22,
        v: "814103916"
      }
    ]
  },
  trades: {
    trades: [
      {
        signature: "38Q3VPrR35aUZ3apYHuH3agfp1zwLHoMJFFvcgVjt5T4XuH4N7HTrCSqSC3iji3EXejbFbB8zbetpYtMaVq3UCtF",
        t: 1791367593,
        side: "buy",
        wallet: "7QFANQRVTSUJL3NPQt6zwjeptEiU6hkgB1bXSZhjwYq1",
        sol_lamports: "90523131",
        token_amount: "666737201344",
        price_sol: 1359867270744966e-22
      },
      {
        signature: "4ThPMzfBL6PkCN7yeLaVhd9YZRNSLDStcuXBb4bY3s1dyFwWYQYhP58tBSLH1XUDkmUhR3kVfLNkoLBnj3dbWbof",
        t: 1791367554,
        side: "sell",
        wallet: "AtCqXbG2gAGkHwTfypoSnkWcn43kQUF2SGCmurWLqcL3",
        sol_lamports: "386440300",
        token_amount: "2830843833631",
        price_sol: 13550012082620952e-23
      },
      {
        signature: "JCHo5NmF5J1f2G8T5TfTxHGEaeCHJPAZnCKxKCJES45kg9mMpRXXmYsBTWAGc8Zywsi5z8Wb4WmazYnaBCsz6G9",
        t: 1791367450,
        side: "sell",
        wallet: "HE9zFbJkZEyWjx4YpKsABR8sR5GrfSCAYQ9FazDDeWYL",
        sol_lamports: "24647093",
        token_amount: "179091256322",
        price_sol: 13758393268822045e-23
      },
      {
        signature: "2xPSqEsUTuUZ29aXNzbw1fEuLhi83wVx8KzNLTY5AiCYWAgv8hNvnSc1rkyuXqbqxNL6fCPW2s6s19rFSLFJnf3i",
        t: 1791367411,
        side: "sell",
        wallet: "2v64DwBvVyRpHpf1oEruNqAzaWUifYfUHdpSCyrjJMLX",
        sol_lamports: "13772710",
        token_amount: "100000000000",
        price_sol: 13771737727067595e-23
      },
      {
        signature: "5QNc1SteNrzX4hxEHyS9AM3pD6iuBXR5no8GjPXG1oqU97akzjftFkeJ3PnqQfkCGzjjx4BwPmrd6VjReU2HuheD",
        t: 1791367402,
        side: "sell",
        wallet: "Coke9Ne587ka9X2FmRLBeEG69xBmA4jmXKseN72jC1f2",
        sol_lamports: "251396173",
        token_amount: "1815854402415",
        price_sol: 13779197381579554e-23
      },
      {
        signature: "5mkAsRE7wzbwszLacNPBJwXGXZiwXBc2C3krucD5VRpT9usrC6f8gQiT4Tuw68pVNx2RvrEVF3Mk462HDs5V1ZSa",
        t: 1791367252,
        side: "sell",
        wallet: "3QyFyLrSrZ4BZYZKF6Fm1ZHDf3sUuGgWyHac43vRszrd",
        sol_lamports: "31389693",
        token_amount: "225476813948",
        price_sol: 13915714990941234e-23
      },
      {
        signature: "NKso2aGXVFDQG5oqv3mTvk3sNPxsPzDHsnBvpMDvhVZuBzNMLLPwevCCWFHaPSJRB8LKBPWmg4oPkJz4g28Kuey",
        t: 1791367251,
        side: "buy",
        wallet: "3QyFyLrSrZ4BZYZKF6Fm1ZHDf3sUuGgWyHac43vRszrd",
        sol_lamports: "15934816",
        token_amount: "114381771058",
        price_sol: 13932808038412898e-23
      },
      {
        signature: "Bn4gvuakLEA7HRG8828unFXqPFsnqJW9BmYReMP832Lw9ZUGWZZPdPo3f2zCPuJ99opFdXTaVYdaFtUKjmbzBjG",
        t: 1791366748,
        side: "sell",
        wallet: "8Q4Z8PJKedJ7tWyQyTWWpcdsvVyDRX1pHbzviHWa8aW9",
        sol_lamports: "937788",
        token_amount: "6736216044",
        price_sol: 13924131265097422e-23
      },
      {
        signature: "5bb8Uf2h94wpz25acR7csUdoFd3Eg6UWeNjyRvyFciTVmckgHH1tDY46yAvx7eNaAP4bn3i2v9yDMCCiY6vBsmxS",
        t: 1791366713,
        side: "buy",
        wallet: "BxzVbxN5tqiTKwrYYDwvG4Lfybi9kgmTudRAJncP3ob3",
        sol_lamports: "69004415",
        token_amount: "496126358142",
        price_sol: 13924641933926e-20
      },
      {
        signature: "5zWBKjyDUDhDxyQfqszGFN2DSUsZKzqJjmQvh8pKG5XzqhknrekPp5dGKm536ijxuyLQVuERMkztzeiajHbw7BA8",
        t: 1791366697,
        side: "buy",
        wallet: "CvPahBFhzz6rfSPsuh9isNWHBvheoR3vGVK8LRH7LvS2",
        sol_lamports: "46295737",
        token_amount: "333607991711",
        price_sol: 13887098375807351e-23
      }
    ]
  },
  pending: {
    recipients: [
      {
        x_id: "1797154805129113600",
        handle: "noahrshinn",
        name: "Noah Shinn",
        avatar_url: "/assets/backers/person-3.jpg",
        verified: true,
        waiting_cents: 55e3,
        payments: 2,
        since: 1791190237,
        returns_at: 1792399740,
        coins: [
          {
            mint: "3rZ97af6e85vNCqZPMLUSui5SmwNYhjpdRJ7RTTnG2Ff",
            name: "Instinct",
            symbol: "INSTINCT",
            image_url: "https://trybackers.com/v1/media/b10b299641963acd65ceda80d79b098ff90268dd6f76103a18922a544b282c5f"
          }
        ]
      },
      {
        x_id: "2106611411354787840",
        handle: "Try_Backers",
        name: "Backers",
        avatar_url: "/assets/backers/person-Try_Backers.jpg",
        verified: true,
        waiting_cents: 26e3,
        payments: 1,
        since: 1791191439,
        returns_at: 1792400940,
        coins: [
          {
            mint: "AzXvL7SUiV2pggfyzYuZRRhzqtDzwB9iFpaYNQmydW3c",
            name: "Backers Cat",
            symbol: "BCAT",
            image_url: "https://trybackers.com/v1/media/8fcd278c718518ef1ac1b69b6e90abad5980f1ff97d81b8aeac74fa70f939e99"
          }
        ]
      },
      {
        x_id: "35803",
        handle: "mattt",
        name: "Mattt",
        avatar_url: "/assets/backers/person-4.jpg",
        verified: true,
        waiting_cents: 2500,
        payments: 1,
        since: 1791307250,
        returns_at: 1792516800,
        coins: [
          {
            mint: "BAgGYintgfRHs65evX8E6ELLnwxCqi5QCJeDxHtL1WB",
            name: "Pollen Pet",
            symbol: "POLLEN",
            image_url: "https://trybackers.com/v1/media/2174f28c961dafbda4aa69595709ec6a85d352519455f4dc3eb88d130c328977"
          }
        ]
      }
    ]
  },
  intervals: {
    "1m": [
      {
        t: 1791338040,
        o: 6289095750693972e-22,
        h: 6289095750693972e-22,
        l: 444938561738585e-21,
        c: 5889458741734484e-22,
        v: "49029843178"
      },
      {
        t: 1791338100,
        o: 5889458741734484e-22,
        h: 6766934220948308e-22,
        l: 5039444259937228e-22,
        c: 6047791318752058e-22,
        v: "68102889716"
      },
      {
        t: 1791338160,
        o: 6047791318752058e-22,
        h: 6262525485039934e-22,
        l: 40388935466933807e-23,
        c: 5277678343269415e-22,
        v: "94889872368"
      },
      {
        t: 1791338220,
        o: 5290923519398557e-22,
        h: 5293544865885761e-22,
        l: 4067804762693508e-22,
        c: 41125209477031543e-23,
        v: "34840960459"
      },
      {
        t: 1791338280,
        o: 41125209477031543e-23,
        h: 4991886919920522e-22,
        l: 4071754476131615e-22,
        c: 47262727829434076e-23,
        v: "28481658818"
      },
      {
        t: 1791338340,
        o: 47262727829434076e-23,
        h: 4751241772691655e-22,
        l: 31345560328960595e-23,
        c: 34681974599165515e-23,
        v: "69183364603"
      },
      {
        t: 1791338400,
        o: 34681974599165515e-23,
        h: 34989873197982043e-23,
        l: 2676552434335414e-22,
        c: 3441432430747641e-22,
        v: "38081068978"
      },
      {
        t: 1791338460,
        o: 3441432430747641e-22,
        h: 3624889018117736e-22,
        l: 3401561175098551e-22,
        c: 34871928041895975e-23,
        v: "9843033452"
      },
      {
        t: 1791338520,
        o: 34871928041895975e-23,
        h: 6179230464139683e-22,
        l: 29875716785488807e-23,
        c: 5488711715211756e-22,
        v: "138194177595"
      },
      {
        t: 1791338580,
        o: 5488711715211756e-22,
        h: 6699575653058316e-22,
        l: 4454399325523652e-22,
        c: 4836967094490694e-22,
        v: "79132604412"
      },
      {
        t: 1791338640,
        o: 4836967094490694e-22,
        h: 5839366262721546e-22,
        l: 4836967094490694e-22,
        c: 5488670316916011e-22,
        v: "39246425042"
      },
      {
        t: 1791338700,
        o: 5488670316916011e-22,
        h: 7218897103355893e-22,
        l: 5437575657162874e-22,
        c: 6312452179382277e-22,
        v: "86237429070"
      },
      {
        t: 1791338760,
        o: 6312452179382277e-22,
        h: 7392697433817795e-22,
        l: 5908015327998422e-22,
        c: 6449821227723009e-22,
        v: "48637682134"
      },
      {
        t: 1791338820,
        o: 6449821227723009e-22,
        h: 9122431882718726e-22,
        l: 6140161457112604e-22,
        c: 8255535674240836e-22,
        v: "131778945665"
      },
      {
        t: 1791338880,
        o: 8255535674240836e-22,
        h: 9525871663853432e-22,
        l: 7504690559137348e-22,
        c: 8016972351294803e-22,
        v: "72262090850"
      },
      {
        t: 1791338940,
        o: 8147058018011875e-22,
        h: 9846269177584689e-22,
        l: 7447355258533928e-22,
        c: 9031959840074938e-22,
        v: "59101913839"
      },
      {
        t: 1791339e3,
        o: 9031959840074938e-22,
        h: 9306899694256718e-22,
        l: 7487699194232688e-22,
        c: 7625182145387105e-22,
        v: "57698982811"
      },
      {
        t: 1791339060,
        o: 7710998771858325e-22,
        h: 7973905039283458e-22,
        l: 6517964588639444e-22,
        c: 7511282599725215e-22,
        v: "53206044028"
      },
      {
        t: 1791339120,
        o: 7511282599725215e-22,
        h: 8207979526958212e-22,
        l: 7234893528215889e-22,
        c: 7457000907129545e-22,
        v: "38629295517"
      },
      {
        t: 1791339180,
        o: 7457000907129545e-22,
        h: 7870757737743877e-22,
        l: 7071183935806268e-22,
        c: 7407250040604852e-22,
        v: "20152646211"
      },
      {
        t: 1791339240,
        o: 7453236770843311e-22,
        h: 7481510106426369e-22,
        l: 6000623846278597e-22,
        c: 6229639844763716e-22,
        v: "41783966307"
      },
      {
        t: 1791339300,
        o: 6229639844763716e-22,
        h: 6357343007670866e-22,
        l: 4015215137029017e-22,
        c: 5035356589497325e-22,
        v: "60913849966"
      },
      {
        t: 1791339360,
        o: 5035356589497325e-22,
        h: 5576597149846283e-22,
        l: 5035356589497325e-22,
        c: 511033763173362e-21,
        v: "17172789144"
      },
      {
        t: 1791339420,
        o: 511033763173362e-21,
        h: 5168314553322988e-22,
        l: 44228485086864375e-23,
        c: 486411633568923e-21,
        v: "23209710972"
      },
      {
        t: 1791339480,
        o: 4864109492455202e-22,
        h: 5924470904620677e-22,
        l: 4739386696467297e-22,
        c: 5857766760657118e-22,
        v: "21529245043"
      },
      {
        t: 1791339540,
        o: 5857766760657118e-22,
        h: 6966827701521272e-22,
        l: 5857766760657118e-22,
        c: 6155035012392285e-22,
        v: "23907524091"
      },
      {
        t: 1791339600,
        o: 6155035012392285e-22,
        h: 6553157441628833e-22,
        l: 4818009220784184e-22,
        c: 5031156958468427e-22,
        v: "29152902977"
      },
      {
        t: 1791339660,
        o: 5031156958468427e-22,
        h: 5086075705610592e-22,
        l: 4504008001594431e-22,
        c: 481853461385832e-21,
        v: "20737579262"
      },
      {
        t: 1791339720,
        o: 481853461385832e-21,
        h: 4826928974751067e-22,
        l: 3630718199761341e-22,
        c: 3630718199761341e-22,
        v: "27754518612"
      },
      {
        t: 1791339780,
        o: 3630718199761341e-22,
        h: 5177107234966042e-22,
        l: 3630718199761341e-22,
        c: 430014028026961e-21,
        v: "32341858424"
      },
      {
        t: 1791339840,
        o: 43837964367922785e-23,
        h: 4941374114445998e-22,
        l: 43394370932877286e-23,
        c: 4821855788752663e-22,
        v: "14638609586"
      },
      {
        t: 1791339900,
        o: 477655469756998e-21,
        h: 5242522655354742e-22,
        l: 45969603679818317e-23,
        c: 5242522655354742e-22,
        v: "10037440861"
      },
      {
        t: 1791339960,
        o: 5242522655354742e-22,
        h: 6130745523702371e-22,
        l: 5242479443964612e-22,
        c: 5968329704655727e-22,
        v: "14132571227"
      },
      {
        t: 1791340020,
        o: 5968329704655727e-22,
        h: 5968329704655727e-22,
        l: 4890163418763299e-22,
        c: 5002866215002695e-22,
        v: "16465381367"
      },
      {
        t: 1791340080,
        o: 5002866215002695e-22,
        h: 5017798370588261e-22,
        l: 45044854214369365e-23,
        c: 45044854214369365e-23,
        v: "7829810318"
      },
      {
        t: 1791340140,
        o: 45044854214369365e-23,
        h: 7466752343777611e-22,
        l: 44635851524018217e-23,
        c: 6804661378614615e-22,
        v: "70367910588"
      },
      {
        t: 1791340200,
        o: 6799199511008955e-22,
        h: 6834293408683093e-22,
        l: 6199529411799961e-22,
        c: 6199529411799961e-22,
        v: "15725558556"
      },
      {
        t: 1791340260,
        o: 6199529411799961e-22,
        h: 6225321884086059e-22,
        l: 5683415689988847e-22,
        c: 5683415689988847e-22,
        v: "15044450022"
      },
      {
        t: 1791340320,
        o: 5413583302207443e-22,
        h: 6338989640961551e-22,
        l: 5188872060551164e-22,
        c: 6338989640961551e-22,
        v: "19774468319"
      },
      {
        t: 1791340380,
        o: 6338989640961551e-22,
        h: 6440273810523098e-22,
        l: 5755073226167805e-22,
        c: 6272719012583234e-22,
        v: "35425210550"
      },
      {
        t: 1791340440,
        o: 6272719012583234e-22,
        h: 6599402044860388e-22,
        l: 5728779029775467e-22,
        c: 5734115166414845e-22,
        v: "12181703668"
      },
      {
        t: 1791340500,
        o: 5734115166414845e-22,
        h: 5960708145486309e-22,
        l: 5271209136564215e-22,
        c: 5377808756365787e-22,
        v: "13455299531"
      },
      {
        t: 1791340560,
        o: 5377808756365787e-22,
        h: 5957629792028797e-22,
        l: 5377808756365787e-22,
        c: 5694956903306114e-22,
        v: "13126612576"
      },
      {
        t: 1791340620,
        o: 5694956903306114e-22,
        h: 587329513125259e-21,
        l: 5338360192871503e-22,
        c: 5689584854874653e-22,
        v: "11374805313"
      },
      {
        t: 1791340680,
        o: 5689584854874653e-22,
        h: 6198371810583787e-22,
        l: 5633995791610379e-22,
        c: 608241869651311e-21,
        v: "9672784426"
      },
      {
        t: 1791340740,
        o: 608241869651311e-21,
        h: 6350127975980025e-22,
        l: 5208453360137185e-22,
        c: 5304954562623271e-22,
        v: "13563269255"
      },
      {
        t: 1791340800,
        o: 5304954562623271e-22,
        h: 5582525498566767e-22,
        l: 489373008480672e-21,
        c: 5438777627801123e-22,
        v: "15544697453"
      },
      {
        t: 1791340860,
        o: 5438777627801123e-22,
        h: 641547795375974e-21,
        l: 5322090522731898e-22,
        c: 6190641603080385e-22,
        v: "18749293963"
      },
      {
        t: 1791340920,
        o: 6190641603080385e-22,
        h: 9030073654443388e-22,
        l: 6055649949148387e-22,
        c: 8598918928576639e-22,
        v: "52433551958"
      },
      {
        t: 1791340980,
        o: 8598918928576639e-22,
        h: 8941734851982055e-22,
        l: 7408087054414797e-22,
        c: 7993319317143012e-22,
        v: "54383222560"
      },
      {
        t: 1791341040,
        o: 804325126308442e-21,
        h: 847765323249013e-21,
        l: 7344928150899336e-22,
        c: 8009914581884903e-22,
        v: "32247396224"
      },
      {
        t: 1791341100,
        o: 8009914581884903e-22,
        h: 8112924537792374e-22,
        l: 7266328152536248e-22,
        c: 7642015629947024e-22,
        v: "23482118640"
      },
      {
        t: 1791341160,
        o: 7642015629947024e-22,
        h: 78308338693825e-20,
        l: 7186045011789217e-22,
        c: 723125828870154e-21,
        v: "9810938071"
      },
      {
        t: 1791341220,
        o: 723125828870154e-21,
        h: 723125828870154e-21,
        l: 6648628430712333e-22,
        c: 6957766622285715e-22,
        v: "14813125737"
      },
      {
        t: 1791341280,
        o: 6957766622285715e-22,
        h: 7150052979680947e-22,
        l: 6773495197264895e-22,
        c: 6780288254703802e-22,
        v: "6373068918"
      },
      {
        t: 1791341340,
        o: 6780288254703802e-22,
        h: 6843047666819022e-22,
        l: 6527058235579216e-22,
        c: 656854587797207e-21,
        v: "5673432476"
      },
      {
        t: 1791341400,
        o: 6568536219852606e-22,
        h: 7163366927161167e-22,
        l: 6567562130299878e-22,
        c: 7163366927161167e-22,
        v: "5422618048"
      },
      {
        t: 1791341460,
        o: 7163366927161167e-22,
        h: 7180679444474344e-22,
        l: 6108790346400842e-22,
        c: 6119368191619077e-22,
        v: "11524621937"
      },
      {
        t: 1791341520,
        o: 6119368191619077e-22,
        h: 6700501421801182e-22,
        l: 587219145898419e-21,
        c: 6700501421801182e-22,
        v: "11564750223"
      },
      {
        t: 1791341580,
        o: 6349557037600116e-22,
        h: 6414729346851673e-22,
        l: 6253336646004348e-22,
        c: 6255228369873678e-22,
        v: "6470967792"
      },
      {
        t: 1791341640,
        o: 6255228369873678e-22,
        h: 626900934875523e-21,
        l: 6251338251017807e-22,
        c: 6258056092741204e-22,
        v: "388647440"
      },
      {
        t: 1791341700,
        o: 6258056092741204e-22,
        h: 6348092489627054e-22,
        l: 6193522546209314e-22,
        c: 6330229557716514e-22,
        v: "2405145332"
      },
      {
        t: 1791341760,
        o: 6330229557716514e-22,
        h: 6330229557716514e-22,
        l: 4874723876856651e-22,
        c: 5165032247844932e-22,
        v: "22444463954"
      },
      {
        t: 1791341820,
        o: 5165032247844932e-22,
        h: 547794080977764e-21,
        l: 5160876795506448e-22,
        c: 5197062473328118e-22,
        v: "6905995479"
      },
      {
        t: 1791341880,
        o: 5197062473328118e-22,
        h: 5630081759239459e-22,
        l: 5154294790326016e-22,
        c: 5630081759239459e-22,
        v: "5791051358"
      },
      {
        t: 1791341940,
        o: 5630081759239459e-22,
        h: 5644546228055406e-22,
        l: 5404116587929772e-22,
        c: 5404116587929772e-22,
        v: "3569046722"
      },
      {
        t: 1791342e3,
        o: 5404116587929772e-22,
        h: 5559763029155559e-22,
        l: 5358595035147956e-22,
        c: 5553516368028461e-22,
        v: "2663801366"
      },
      {
        t: 1791342060,
        o: 5737218771388667e-22,
        h: 5886800209683303e-22,
        l: 5737218771388667e-22,
        c: 5869888528864788e-22,
        v: "4852757405"
      },
      {
        t: 1791342120,
        o: 5934462642288889e-22,
        h: 6034332389486424e-22,
        l: 5934462642288889e-22,
        c: 6025970495356221e-22,
        v: "1662968047"
      },
      {
        t: 1791342180,
        o: 6025970495356221e-22,
        h: 6648357787439131e-22,
        l: 5999868962394906e-22,
        c: 6533734992845405e-22,
        v: "7649210178"
      },
      {
        t: 1791342240,
        o: 6533734992845405e-22,
        h: 6772567505721075e-22,
        l: 6533734992845405e-22,
        c: 6693489614969844e-22,
        v: "2667472959"
      },
      {
        t: 1791342300,
        o: 6693489614969844e-22,
        h: 6703403318586045e-22,
        l: 6487607764508642e-22,
        c: 6571446618931764e-22,
        v: "2900951572"
      },
      {
        t: 1791342360,
        o: 6571446618931764e-22,
        h: 6854700638578523e-22,
        l: 6451973873376518e-22,
        c: 6628742555319303e-22,
        v: "7877283849"
      },
      {
        t: 1791342420,
        o: 6628742555319303e-22,
        h: 7323901287625641e-22,
        l: 6588073850861281e-22,
        c: 728376063967444e-21,
        v: "7100105015"
      },
      {
        t: 1791342480,
        o: 728376063967444e-21,
        h: 729772682358802e-21,
        l: 7187185075390833e-22,
        c: 7297163753923448e-22,
        v: "2672124409"
      },
      {
        t: 1791342540,
        o: 7297163753923448e-22,
        h: 7305039498527229e-22,
        l: 6205258164544823e-22,
        c: 6248874830453533e-22,
        v: "9915973938"
      },
      {
        t: 1791342600,
        o: 6248874830453533e-22,
        h: 6250263850598315e-22,
        l: 6058537961877901e-22,
        c: 607706981781361e-21,
        v: "2349598209"
      },
      {
        t: 1791342660,
        o: 607706981781361e-21,
        h: 6095644175873335e-22,
        l: 6076048381402555e-22,
        c: 609221622149275e-21,
        v: "224594695"
      },
      {
        t: 1791342720,
        o: 6090652425381535e-22,
        h: 6090652425381535e-22,
        l: 5285199352775739e-22,
        c: 5285199352775739e-22,
        v: "7562872514"
      },
      {
        t: 1791342780,
        o: 5285199352775739e-22,
        h: 5899115261841936e-22,
        l: 5279648454061243e-22,
        c: 5899115261841936e-22,
        v: "6339780501"
      },
      {
        t: 1791342840,
        o: 5899115261841936e-22,
        h: 6464011313594351e-22,
        l: 570369080122057e-21,
        c: 6464011313594351e-22,
        v: "8550464580"
      },
      {
        t: 1791342900,
        o: 6464011313594351e-22,
        h: 6464011313594351e-22,
        l: 6245746005663726e-22,
        c: 6370256087623277e-22,
        v: "3018580201"
      },
      {
        t: 1791342960,
        o: 6370256087623277e-22,
        h: 6374723278700638e-22,
        l: 6304908602078163e-22,
        c: 6304908602078163e-22,
        v: "1662767537"
      },
      {
        t: 1791343020,
        o: 6304908602078163e-22,
        h: 6308903962220772e-22,
        l: 6129601678055808e-22,
        c: 6135263356324413e-22,
        v: "1788733768"
      },
      {
        t: 1791343080,
        o: 6135263356324413e-22,
        h: 6140650091032319e-22,
        l: 6082867790413608e-22,
        c: 6140650091032319e-22,
        v: "1041069725"
      },
      {
        t: 1791343140,
        o: 6140650091032319e-22,
        h: 6140650091032319e-22,
        l: 5569501765553493e-22,
        c: 592055571757495e-21,
        v: "8420205903"
      },
      {
        t: 1791343200,
        o: 592055571757495e-21,
        h: 5962032980918462e-22,
        l: 592055571757495e-21,
        c: 5960379533805898e-22,
        v: "1083522439"
      },
      {
        t: 1791343260,
        o: 5960265430879515e-22,
        h: 6019016244640447e-22,
        l: 5751396741922021e-22,
        c: 5751396741922021e-22,
        v: "3317587368"
      },
      {
        t: 1791343320,
        o: 5751396741922021e-22,
        h: 5751396741922021e-22,
        l: 5509363529723534e-22,
        c: 5517965919939641e-22,
        v: "2641430490"
      },
      {
        t: 1791343380,
        o: 5517965919939641e-22,
        h: 5783773955741764e-22,
        l: 5462406116910992e-22,
        c: 5783773955741764e-22,
        v: "6187119344"
      },
      {
        t: 1791343440,
        o: 5783773955741764e-22,
        h: 6465050331878746e-22,
        l: 5783773955741764e-22,
        c: 6465050331878746e-22,
        v: "5964731988"
      },
      {
        t: 1791343500,
        o: 6465050331878746e-22,
        h: 6831172737933706e-22,
        l: 6135001223986848e-22,
        c: 6712493543430299e-22,
        v: "14195795101"
      },
      {
        t: 1791343560,
        o: 6712493543430299e-22,
        h: 6712493543430299e-22,
        l: 6178737820235643e-22,
        c: 6178737820235643e-22,
        v: "4778660389"
      },
      {
        t: 1791343620,
        o: 6178737820235643e-22,
        h: 6295571202651722e-22,
        l: 6056987868612784e-22,
        c: 6056987868612784e-22,
        v: "3297328571"
      },
      {
        t: 1791343680,
        o: 6056987868612784e-22,
        h: 6128331251503717e-22,
        l: 6011435210871134e-22,
        c: 6011435210871134e-22,
        v: "1652020824"
      },
      {
        t: 1791343740,
        o: 6011435210871134e-22,
        h: 6293698187899284e-22,
        l: 5993830898977373e-22,
        c: 6293698187899284e-22,
        v: "3383928983"
      },
      {
        t: 1791343800,
        o: 6293698187899284e-22,
        h: 6403444721200613e-22,
        l: 6293698187899284e-22,
        c: 6333988074944615e-22,
        v: "1542216275"
      },
      {
        t: 1791343860,
        o: 6333988074944615e-22,
        h: 6375494370970756e-22,
        l: 6108020988357752e-22,
        c: 6108020988357752e-22,
        v: "3508739743"
      },
      {
        t: 1791343920,
        o: 6108020988357752e-22,
        h: 6186274502108877e-22,
        l: 6108020988357752e-22,
        c: 6186274502108877e-22,
        v: "683828105"
      },
      {
        t: 1791343980,
        o: 6186274502108877e-22,
        h: 6449762017122886e-22,
        l: 6186274502108877e-22,
        c: 627667009577099e-21,
        v: "3755084328"
      },
      {
        t: 1791344040,
        o: 627667009577099e-21,
        h: 627667009577099e-21,
        l: 576523298562219e-21,
        c: 5775186213979141e-22,
        v: "4700712632"
      },
      {
        t: 1791344100,
        o: 5775186213979141e-22,
        h: 5791957794512646e-22,
        l: 5013596463941938e-22,
        c: 5333458100137809e-22,
        v: "10834626895"
      },
      {
        t: 1791344160,
        o: 5333458100137809e-22,
        h: 5333458100137809e-22,
        l: 4814593026882468e-22,
        c: 4974165341738923e-22,
        v: "8114649584"
      },
      {
        t: 1791344220,
        o: 4974165341738923e-22,
        h: 5180990874620803e-22,
        l: 4896122935739247e-22,
        c: 502474175323867e-21,
        v: "6313648153"
      },
      {
        t: 1791344280,
        o: 502474175323867e-21,
        h: 5051825880392253e-22,
        l: 4629354792086982e-22,
        c: 4629354792086982e-22,
        v: "4947082724"
      },
      {
        t: 1791344340,
        o: 4629354792086982e-22,
        h: 5049591630797961e-22,
        l: 44583265323574034e-23,
        c: 4874829726861458e-22,
        v: "10061448700"
      },
      {
        t: 1791344400,
        o: 4874829726861458e-22,
        h: 4884797283551656e-22,
        l: 45623836677966886e-23,
        c: 45623836677966886e-23,
        v: "3356071762"
      },
      {
        t: 1791344460,
        o: 45623836677966886e-23,
        h: 4840733775552063e-22,
        l: 4123306064513212e-22,
        c: 4840733775552063e-22,
        v: "15924687227"
      },
      {
        t: 1791344520,
        o: 4840733775552063e-22,
        h: 4840733775552063e-22,
        l: 4611671779989563e-22,
        c: 4631755669305548e-22,
        v: "2616035469"
      },
      {
        t: 1791344580,
        o: 4631755669305548e-22,
        h: 4638014761532917e-22,
        l: 4571222721102711e-22,
        c: 4571222721102711e-22,
        v: "878002819"
      },
      {
        t: 1791344640,
        o: 4571222721102711e-22,
        h: 4571222721102711e-22,
        l: 4421148465131611e-22,
        c: 4421148465131611e-22,
        v: "1531472258"
      },
      {
        t: 1791344700,
        o: 4421148465131611e-22,
        h: 4537296182688238e-22,
        l: 4416254759528032e-22,
        c: 4537296182688238e-22,
        v: "1842015819"
      },
      {
        t: 1791344760,
        o: 4537296182688238e-22,
        h: 4565849277266405e-22,
        l: 45041681675606857e-23,
        c: 45041681675606857e-23,
        v: "1237117298"
      },
      {
        t: 1791344820,
        o: 45041681675606857e-23,
        h: 45371618488172603e-23,
        l: 4299066274867877e-22,
        c: 4354276805436261e-22,
        v: "5330284412"
      },
      {
        t: 1791344880,
        o: 4354276805436261e-22,
        h: 4354276805436261e-22,
        l: 41167678523314346e-23,
        c: 41167678523314346e-23,
        v: "2571282026"
      },
      {
        t: 1791344940,
        o: 41167678523314346e-23,
        h: 41167678523314346e-23,
        l: 38306009829376657e-23,
        c: 3939032394710093e-22,
        v: "8804185885"
      },
      {
        t: 1791345e3,
        o: 3939032394710093e-22,
        h: 4036822942654739e-22,
        l: 3939032394710093e-22,
        c: 3987411611670082e-22,
        v: "1595192001"
      },
      {
        t: 1791345060,
        o: 3987411611670082e-22,
        h: 3987411611670082e-22,
        l: 3724238993927225e-22,
        c: 3724238993927225e-22,
        v: "3006444753"
      },
      {
        t: 1791345120,
        o: 3724238993927225e-22,
        h: 3738047209466193e-22,
        l: 36435955731138434e-23,
        c: 3678532832796123e-22,
        v: "2277785039"
      },
      {
        t: 1791345180,
        o: 3678532832796123e-22,
        h: 3678532832796123e-22,
        l: 30905371532992257e-23,
        c: 3320734187835111e-22,
        v: "10071261279"
      },
      {
        t: 1791345240,
        o: 3320734187835111e-22,
        h: 33515081386052027e-23,
        l: 3298109367632312e-22,
        c: 3298109367632312e-22,
        v: "1119626897"
      },
      {
        t: 1791345300,
        o: 3298109367632312e-22,
        h: 3361228673058276e-22,
        l: 2934558415547607e-22,
        c: 30894184335698063e-23,
        v: "13443311796"
      },
      {
        t: 1791345360,
        o: 30894184335698063e-23,
        h: 30990433161358535e-23,
        l: 2777715394809947e-22,
        c: 29157558998372025e-23,
        v: "10928169479"
      },
      {
        t: 1791345420,
        o: 29157558998372025e-23,
        h: 29812545110252693e-23,
        l: 29063755775359986e-23,
        c: 29101169396603283e-23,
        v: "2190533363"
      },
      {
        t: 1791345480,
        o: 29101169396603283e-23,
        h: 29777192172794396e-23,
        l: 28829321769148e-20,
        c: 2910537621702378e-22,
        v: "2888565709"
      },
      {
        t: 1791345540,
        o: 2910537621702378e-22,
        h: 2915740608497382e-22,
        l: 2871936592480421e-22,
        c: 2915740608497382e-22,
        v: "1293238260"
      },
      {
        t: 1791345600,
        o: 2915740608497382e-22,
        h: 32874248412790735e-23,
        l: 2915740608497382e-22,
        c: 31787304594307585e-23,
        v: "7402280010"
      },
      {
        t: 1791345660,
        o: 31787304594307585e-23,
        h: 31787304594307585e-23,
        l: 3101698001308417e-22,
        c: 3101698001308417e-22,
        v: "2232483973"
      },
      {
        t: 1791345720,
        o: 3101698001308417e-22,
        h: 31044246311245713e-23,
        l: 30732203192590335e-23,
        c: 30732203192590335e-23,
        v: "418128966"
      },
      {
        t: 1791345780,
        o: 30732203192590335e-23,
        h: 3314224542363805e-22,
        l: 30732203192590335e-23,
        c: 32404473296243107e-23,
        v: "4226793151"
      },
      {
        t: 1791345840,
        o: 32404473296243107e-23,
        h: 3327835425215029e-22,
        l: 32404473296243107e-23,
        c: 3327835425215029e-22,
        v: "1076020090"
      },
      {
        t: 1791345900,
        o: 3327835425215029e-22,
        h: 3878768113750897e-22,
        l: 3312011673768155e-22,
        c: 3772436431256052e-22,
        v: "11266594772"
      },
      {
        t: 1791345960,
        o: 3772436431256052e-22,
        h: 3948762659162845e-22,
        l: 3772436431256052e-22,
        c: 3948762659162845e-22,
        v: "1944449494"
      },
      {
        t: 1791346020,
        o: 3948762659162845e-22,
        h: 3948762659162845e-22,
        l: 38759799370441253e-23,
        c: 39464176885119924e-23,
        v: "1568762752"
      },
      {
        t: 1791346080,
        o: 39464176885119924e-23,
        h: 39464176885119924e-23,
        l: 3461839597417089e-22,
        c: 3500686828758674e-22,
        v: "6537617421"
      },
      {
        t: 1791346140,
        o: 3500686828758674e-22,
        h: 35042229658990477e-23,
        l: 34657705477544e-20,
        c: 34766465129894806e-23,
        v: "613606249"
      },
      {
        t: 1791346200,
        o: 34766465129894806e-23,
        h: 34766465129894806e-23,
        l: 34416434207956107e-23,
        c: 34416434207956107e-23,
        v: "407681170"
      },
      {
        t: 1791346260,
        o: 34416434207956107e-23,
        h: 34416434207956107e-23,
        l: 3197145460404862e-22,
        c: 32162392360293894e-23,
        v: "3212545286"
      },
      {
        t: 1791346320,
        o: 32162392360293894e-23,
        h: 3554159766261021e-22,
        l: 32162392360293894e-23,
        c: 35313774342730924e-23,
        v: "5435648191"
      },
      {
        t: 1791346380,
        o: 35313774342730924e-23,
        h: 3559853558261605e-22,
        l: 34978849247941344e-23,
        c: 3499327959693529e-22,
        v: "1058972868"
      },
      {
        t: 1791346500,
        o: 3499327959693529e-22,
        h: 3571086775402585e-22,
        l: 3499327959693529e-22,
        c: 3571086775402585e-22,
        v: "826919025"
      },
      {
        t: 1791346560,
        o: 3571086775402585e-22,
        h: 35882530500446773e-23,
        l: 3571086775402585e-22,
        c: 3579600643715302e-22,
        v: "295588326"
      },
      {
        t: 1791346620,
        o: 3579600643715302e-22,
        h: 3579600643715302e-22,
        l: 3485163998506715e-22,
        c: 35021243458909177e-23,
        v: "1285079785"
      },
      {
        t: 1791346680,
        o: 35021243458909177e-23,
        h: 37487195215177307e-23,
        l: 35019512708885683e-23,
        c: 37487195215177307e-23,
        v: "2810470102"
      },
      {
        t: 1791346740,
        o: 37487195215177307e-23,
        h: 3748968364356568e-22,
        l: 35822439498487956e-23,
        c: 37257949078351116e-23,
        v: "4500431959"
      },
      {
        t: 1791346800,
        o: 37394730599111564e-23,
        h: 37394730599111564e-23,
        l: 3730791091943026e-22,
        c: 3730791091943026e-22,
        v: "97313500"
      },
      {
        t: 1791346860,
        o: 3730791091943026e-22,
        h: 3730791091943026e-22,
        l: 3605666792305414e-22,
        c: 3605666792305414e-22,
        v: "1415263525"
      },
      {
        t: 1791346920,
        o: 3605666792305414e-22,
        h: 360705872177425e-21,
        l: 3605666792305414e-22,
        c: 36057684227159936e-23,
        v: "30599427"
      },
      {
        t: 1791346980,
        o: 36057684227159936e-23,
        h: 36403187337902525e-23,
        l: 36057684227159936e-23,
        c: 36403187337902525e-23,
        v: "393289110"
      },
      {
        t: 1791347040,
        o: 36403187337902525e-23,
        h: 3640806693228955e-22,
        l: 3632694816108663e-22,
        c: 36327316505648126e-23,
        v: "98105188"
      },
      {
        t: 1791347100,
        o: 36327316505648126e-23,
        h: 3794855812480347e-22,
        l: 36311736826474133e-23,
        c: 3794855812480347e-22,
        v: "1892964175"
      },
      {
        t: 1791347160,
        o: 3794855812480347e-22,
        h: 39305907056170954e-23,
        l: 3794855812480347e-22,
        c: 39305907056170954e-23,
        v: "1673909853"
      },
      {
        t: 1791347220,
        o: 39305907056170954e-23,
        h: 39448389011638534e-23,
        l: 3870637349138347e-22,
        c: 3870637349138347e-22,
        v: "968714831"
      },
      {
        t: 1791347280,
        o: 3870637349138347e-22,
        h: 3870637349138347e-22,
        l: 3835609219775204e-22,
        c: 3835609219775204e-22,
        v: "386565316"
      },
      {
        t: 1791347340,
        o: 3835609219775204e-22,
        h: 38736259510477876e-23,
        l: 37522974007788877e-23,
        c: 37615226208704665e-23,
        v: "1868711752"
      },
      {
        t: 1791347400,
        o: 37615226208704665e-23,
        h: 37615226208704665e-23,
        l: 34640810625509647e-23,
        c: 34640810625509647e-23,
        v: "3390659839"
      },
      {
        t: 1791347460,
        o: 34640810625509647e-23,
        h: 34661640321377713e-23,
        l: 34478980059555e-20,
        c: 34592814449361207e-23,
        v: "369783427"
      },
      {
        t: 1791347520,
        o: 34592814449361207e-23,
        h: 3483245640786843e-22,
        l: 3241032666934117e-22,
        c: 3241032666934117e-22,
        v: "3140722732"
      },
      {
        t: 1791347580,
        o: 3241032666934117e-22,
        h: 3241032666934117e-22,
        l: 32195913545349804e-23,
        c: 32195913545349804e-23,
        v: "258431756"
      },
      {
        t: 1791347640,
        o: 32765443474754204e-23,
        h: 37968369623994404e-23,
        l: 32765443474754204e-23,
        c: 3396819133797279e-22,
        v: "14284441374"
      },
      {
        t: 1791347700,
        o: 3396819133797279e-22,
        h: 3396819133797279e-22,
        l: 3395227295018038e-22,
        c: 3395227295018038e-22,
        v: "18712751"
      },
      {
        t: 1791347760,
        o: 3395227295018038e-22,
        h: 3396637815373593e-22,
        l: 3395227295018038e-22,
        c: 3396637815373593e-22,
        v: "16584814"
      },
      {
        t: 1791347820,
        o: 3396637815373593e-22,
        h: 3396637815373593e-22,
        l: 3332868114095729e-22,
        c: 336820813834717e-21,
        v: "1171457318"
      },
      {
        t: 1791347880,
        o: 336820813834717e-21,
        h: 33708932763022423e-23,
        l: 336820813834717e-21,
        c: 33708932763022423e-23,
        v: "31695093"
      },
      {
        t: 1791347940,
        o: 33708932763022423e-23,
        h: 3374364875889416e-22,
        l: 32739676834399396e-23,
        c: 32739676834399396e-23,
        v: "1233895784"
      },
      {
        t: 1791348e3,
        o: 32739676834399396e-23,
        h: 32739676834399396e-23,
        l: 32738830492070667e-23,
        c: 32738830492070667e-23,
        v: "1013297"
      },
      {
        t: 1791348060,
        o: 32738830492070667e-23,
        h: 3284467979668116e-22,
        l: 32738830492070667e-23,
        c: 3284467979668116e-22,
        v: "126653721"
      },
      {
        t: 1791348120,
        o: 3284467979668116e-22,
        h: 32932436376102595e-23,
        l: 3242029484636879e-22,
        c: 3259083117328612e-22,
        v: "923566336"
      },
      {
        t: 1791348180,
        o: 3259083117328612e-22,
        h: 3259083117328612e-22,
        l: 3242032886178245e-22,
        c: 32434291550233706e-23,
        v: "221670265"
      },
      {
        t: 1791348240,
        o: 32434291550233706e-23,
        h: 32758537091326804e-23,
        l: 32434291550233706e-23,
        c: 32758537091326804e-23,
        v: "389137661"
      },
      {
        t: 1791348300,
        o: 32758537091326804e-23,
        h: 3432645248499405e-22,
        l: 32758537091326804e-23,
        c: 3422359406475027e-22,
        v: "2349195207"
      },
      {
        t: 1791348360,
        o: 3422359406475027e-22,
        h: 3422359406475027e-22,
        l: 3369432336242275e-22,
        c: 3369432336242275e-22,
        v: "622202123"
      },
      {
        t: 1791348420,
        o: 3369432336242275e-22,
        h: 3373513946615233e-22,
        l: 3366572375755984e-22,
        c: 3373513946615233e-22,
        v: "115692166"
      },
      {
        t: 1791348480,
        o: 3373513946615233e-22,
        h: 3411575527451718e-22,
        l: 3373513946615233e-22,
        c: 3411575527451718e-22,
        v: "447755016"
      },
      {
        t: 1791348600,
        o: 3411575527451718e-22,
        h: 34200015429113824e-23,
        l: 3411575527451718e-22,
        c: 34200015429113824e-23,
        v: "98785184"
      },
      {
        t: 1791348720,
        o: 34200015429113824e-23,
        h: 34497702347422427e-23,
        l: 3244856384224941e-22,
        c: 3244856384224941e-22,
        v: "2774655667"
      },
      {
        t: 1791348780,
        o: 32257107274338394e-23,
        h: 32257107274338394e-23,
        l: 3064370715862693e-22,
        c: 3082805147369085e-22,
        v: "2511391903"
      },
      {
        t: 1791348840,
        o: 3082805147369085e-22,
        h: 3089441508873029e-22,
        l: 3082805147369085e-22,
        c: 3089441508873029e-22,
        v: "81854289"
      },
      {
        t: 1791348900,
        o: 3089441508873029e-22,
        h: 3148424073001624e-22,
        l: 3089441508873029e-22,
        c: 3148424073001624e-22,
        v: "848886327"
      },
      {
        t: 1791348960,
        o: 3148424073001624e-22,
        h: 31550052504608525e-23,
        l: 3148424073001624e-22,
        c: 31548597977949245e-23,
        v: "82098647"
      },
      {
        t: 1791349020,
        o: 31548597977949245e-23,
        h: 31874011897281973e-23,
        l: 31548597977949245e-23,
        c: 31874011897281973e-23,
        v: "395957936"
      },
      {
        t: 1791349080,
        o: 31874011897281973e-23,
        h: 3338137796143983e-22,
        l: 31665232655238003e-23,
        c: 3338137796143983e-22,
        v: "2656738900"
      },
      {
        t: 1791349140,
        o: 3338137796143983e-22,
        h: 3486878787915175e-22,
        l: 3337350550271827e-22,
        c: 3486878787915175e-22,
        v: "1795240819"
      },
      {
        t: 1791349260,
        o: 3486878787915175e-22,
        h: 3487730152300257e-22,
        l: 3486878787915175e-22,
        c: 3487730152300257e-22,
        v: "9878518"
      },
      {
        t: 1791349320,
        o: 3487730152300257e-22,
        h: 3487730152300257e-22,
        l: 3379236122820791e-22,
        c: 3379236122820791e-22,
        v: "1412719673"
      },
      {
        t: 1791349380,
        o: 3379236122820791e-22,
        h: 3379236122820791e-22,
        l: 3375692854730978e-22,
        c: 3375692854730978e-22,
        v: "41768007"
      },
      {
        t: 1791349440,
        o: 3375692854730978e-22,
        h: 3375692854730978e-22,
        l: 3270507323586978e-22,
        c: 3270507323586978e-22,
        v: "1250066581"
      },
      {
        t: 1791349500,
        o: 3270507323586978e-22,
        h: 3270507323586978e-22,
        l: 3184043555106734e-22,
        c: 3184043555106734e-22,
        v: "1042705903"
      },
      {
        t: 1791349560,
        o: 3184043555106734e-22,
        h: 3184043555106734e-22,
        l: 3037883403421372e-22,
        c: 3057601307930421e-22,
        v: "2787947418"
      },
      {
        t: 1791349620,
        o: 3057601307930421e-22,
        h: 3057601307930421e-22,
        l: 2994231842275743e-22,
        c: 3048264170837197e-22,
        v: "1462797135"
      },
      {
        t: 1791349680,
        o: 3048264170837197e-22,
        h: 30687294877937036e-23,
        l: 30173414697271887e-23,
        c: 30173414697271887e-23,
        v: "891757700"
      },
      {
        t: 1791349740,
        o: 30173414697271887e-23,
        h: 30567035884045323e-23,
        l: 30173414697271887e-23,
        c: 3050054572526192e-22,
        v: "732158921"
      },
      {
        t: 1791349860,
        o: 3050054572526192e-22,
        h: 30517604506530284e-23,
        l: 3047285935868026e-22,
        c: 30517604506530284e-23,
        v: "89872807"
      },
      {
        t: 1791349920,
        o: 30517604506530284e-23,
        h: 30517604506530284e-23,
        l: 30335926684617164e-23,
        c: 30335926684617164e-23,
        v: "225639113"
      },
      {
        t: 1791349980,
        o: 30335926684617164e-23,
        h: 3040038028235584e-22,
        l: 2998833379812127e-22,
        c: 3000099807595282e-22,
        v: "609706916"
      },
      {
        t: 1791350040,
        o: 3000099807595282e-22,
        h: 3000099807595282e-22,
        l: 2998770824200226e-22,
        c: 2998770824200226e-22,
        v: "16624176"
      },
      {
        t: 1791350100,
        o: 2998770824200226e-22,
        h: 2998770824200226e-22,
        l: 2726978211864604e-22,
        c: 2726978211864604e-22,
        v: "3480966358"
      },
      {
        t: 1791350160,
        o: 2726978211864604e-22,
        h: 2726978211864604e-22,
        l: 25136550723225163e-23,
        c: 25136550723225163e-23,
        v: "4667270175"
      },
      {
        t: 1791350280,
        o: 25136550723225163e-23,
        h: 25136550723225163e-23,
        l: 23613927776839313e-23,
        c: 24214912939292556e-23,
        v: "3152758876"
      },
      {
        t: 1791350340,
        o: 24214912939292556e-23,
        h: 24214912939292556e-23,
        l: 23947213637253195e-23,
        c: 23983797139396975e-23,
        v: "424937115"
      },
      {
        t: 1791350400,
        o: 23983797139396975e-23,
        h: 2433454954849224e-22,
        l: 23983797139396975e-23,
        c: 2433454954849224e-22,
        v: "488986666"
      },
      {
        t: 1791350460,
        o: 2433454954849224e-22,
        h: 2433454954849224e-22,
        l: 2432317869771463e-22,
        c: 2432317869771463e-22,
        v: "15793559"
      },
      {
        t: 1791350520,
        o: 2432317869771463e-22,
        h: 2432317869771463e-22,
        l: 2420696156798571e-22,
        c: 2420696156798571e-22,
        v: "161632127"
      },
      {
        t: 1791350580,
        o: 2420696156798571e-22,
        h: 2420696156798571e-22,
        l: 22900441976254931e-23,
        c: 2297429405900271e-22,
        v: "2016267711"
      },
      {
        t: 1791350640,
        o: 2297429405900271e-22,
        h: 2297429405900271e-22,
        l: 2159251673668948e-22,
        c: 2159251673668948e-22,
        v: "2005621174"
      },
      {
        t: 1791350700,
        o: 2159251673668948e-22,
        h: 2223081602043181e-22,
        l: 21432767750434746e-23,
        c: 2223081602043181e-22,
        v: "1406379753"
      },
      {
        t: 1791350760,
        o: 2223081602043181e-22,
        h: 2223081602043181e-22,
        l: 21339962648212794e-23,
        c: 21516686732970382e-23,
        v: "1569272435"
      },
      {
        t: 1791350820,
        o: 21516686732970382e-23,
        h: 22698440358111793e-23,
        l: 21512080456089427e-23,
        c: 22661633158360613e-23,
        v: "1791546809"
      },
      {
        t: 1791350880,
        o: 22659838502972032e-23,
        h: 22693841209278542e-23,
        l: 22282684853155462e-23,
        c: 224206478230559e-21,
        v: "842893171"
      },
      {
        t: 1791350940,
        o: 224206478230559e-21,
        h: 224206478230559e-21,
        l: 22316452809740197e-23,
        c: 22316452809740197e-23,
        v: "150932545"
      },
      {
        t: 1791351e3,
        o: 22316452809740197e-23,
        h: 2243192177495156e-22,
        l: 22316452809740197e-23,
        c: 2243192177495156e-22,
        v: "167275978"
      },
      {
        t: 1791351060,
        o: 2243192177495156e-22,
        h: 2243192177495156e-22,
        l: 22289401958747879e-23,
        c: 2230301626411975e-22,
        v: "226241926"
      },
      {
        t: 1791351120,
        o: 2230301626411975e-22,
        h: 2230301626411975e-22,
        l: 20745831824202147e-23,
        c: 2170020520598531e-22,
        v: "4392376609"
      },
      {
        t: 1791351240,
        o: 2170020520598531e-22,
        h: 2170020520598531e-22,
        l: 21486761666696282e-23,
        c: 21670296918890412e-23,
        v: "618010173"
      },
      {
        t: 1791351300,
        o: 21670296918890412e-23,
        h: 21670296918890412e-23,
        l: 19825793847194737e-23,
        c: 20833768077452343e-23,
        v: "4520552274"
      },
      {
        t: 1791351360,
        o: 20975052891297909e-23,
        h: 20975052891297909e-23,
        l: 20963213068863234e-23,
        c: 20963213068863234e-23,
        v: "17713996"
      },
      {
        t: 1791351420,
        o: 20963213068863234e-23,
        h: 20963213068863234e-23,
        l: 20531120217719087e-23,
        c: 20635411683191515e-23,
        v: "807449962"
      },
      {
        t: 1791351480,
        o: 20635411683191515e-23,
        h: 20670698743401026e-23,
        l: 20635411683191515e-23,
        c: 20651883234139864e-23,
        v: "81567003"
      },
      {
        t: 1791351600,
        o: 20651883234139864e-23,
        h: 20651883234139864e-23,
        l: 20459726208869958e-23,
        c: 20459726208869958e-23,
        v: "290370501"
      },
      {
        t: 1791351660,
        o: 20459726208869958e-23,
        h: 20459726208869958e-23,
        l: 202652712090763e-21,
        c: 202652712090763e-21,
        v: "295234609"
      },
      {
        t: 1791351720,
        o: 202652712090763e-21,
        h: 21490408813689683e-23,
        l: 20175031461545307e-23,
        c: 21236059809956184e-23,
        v: "2112554704"
      },
      {
        t: 1791351780,
        o: 21490408813689683e-23,
        h: 21767539930450468e-23,
        l: 21490408813689683e-23,
        c: 21645051062256218e-23,
        v: "588461431"
      },
      {
        t: 1791351840,
        o: 21645051062256218e-23,
        h: 21645051062256218e-23,
        l: 21419014046743624e-23,
        c: 21552656924156278e-23,
        v: "531306362"
      },
      {
        t: 1791351900,
        o: 21552656924156278e-23,
        h: 21552656924156278e-23,
        l: 20725310608490052e-23,
        c: 20725310608490052e-23,
        v: "1232909622"
      },
      {
        t: 1791351960,
        o: 20725310608490052e-23,
        h: 20725310608490052e-23,
        l: 20577526976496734e-23,
        c: 20577526976496734e-23,
        v: "222801366"
      },
      {
        t: 1791352020,
        o: 20577526976496734e-23,
        h: 20609909569674175e-23,
        l: 20577526976496734e-23,
        c: 20599217255328756e-23,
        v: "65036896"
      },
      {
        t: 1791352080,
        o: 20599217255328756e-23,
        h: 20599217255328756e-23,
        l: 19322436923172953e-23,
        c: 19730118337908327e-23,
        v: "3309210883"
      },
      {
        t: 1791352200,
        o: 19730118337908327e-23,
        h: 1974933281001604e-22,
        l: 19730118337908327e-23,
        c: 1974933281001604e-22,
        v: "29635555"
      },
      {
        t: 1791352320,
        o: 1974933281001604e-22,
        h: 19819550735843718e-23,
        l: 1963886258603564e-22,
        c: 19755425114808895e-23,
        v: "449308283"
      },
      {
        t: 1791352380,
        o: 19819550735843718e-23,
        h: 19819550735843718e-23,
        l: 19738739107124387e-23,
        c: 19738739107124387e-23,
        v: "124491286"
      },
      {
        t: 1791352440,
        o: 19738739107124387e-23,
        h: 19738739107124387e-23,
        l: 19450430425514403e-23,
        c: 19450430425514403e-23,
        v: "446232724"
      },
      {
        t: 1791352560,
        o: 19450430425514403e-23,
        h: 19450430425514403e-23,
        l: 19424191112934627e-23,
        c: 19424191112934627e-23,
        v: "40775887"
      },
      {
        t: 1791352620,
        o: 19424191112934627e-23,
        h: 19474563623333658e-23,
        l: 1882811588630027e-22,
        c: 18939336725076579e-23,
        v: "1595238033"
      },
      {
        t: 1791352740,
        o: 18939336725076579e-23,
        h: 18939336725076579e-23,
        l: 18235843271853752e-23,
        c: 18235843271853752e-23,
        v: "1117990679"
      },
      {
        t: 1791352800,
        o: 18235843271853752e-23,
        h: 18400882038275095e-23,
        l: 18166095601894937e-23,
        c: 18400882038275095e-23,
        v: "488282828"
      },
      {
        t: 1791352860,
        o: 18400882038275095e-23,
        h: 19478445654059063e-23,
        l: 18400882038275095e-23,
        c: 19368266759825234e-23,
        v: "1868193400"
      },
      {
        t: 1791352920,
        o: 19368266759825234e-23,
        h: 19368266759825234e-23,
        l: 18847819469569158e-23,
        c: 18847819469569158e-23,
        v: "815739592"
      },
      {
        t: 1791352980,
        o: 18847819469569158e-23,
        h: 19187014448752842e-23,
        l: 18847819469569158e-23,
        c: 19187014448752842e-23,
        v: "533013516"
      },
      {
        t: 1791353040,
        o: 19187014448752842e-23,
        h: 19187014448752842e-23,
        l: 19076317945909335e-23,
        c: 19076317945909335e-23,
        v: "173393057"
      },
      {
        t: 1791353100,
        o: 1884376604655478e-22,
        h: 1884376604655478e-22,
        l: 18461321512011216e-23,
        c: 18461321512011216e-23,
        v: "972619126"
      },
      {
        t: 1791353280,
        o: 18461321512011216e-23,
        h: 18461321512011216e-23,
        l: 17865414879882445e-23,
        c: 17926397499879732e-23,
        v: "1404230830"
      },
      {
        t: 1791353400,
        o: 17926397499879732e-23,
        h: 1799040686491665e-22,
        l: 17926397499879732e-23,
        c: 1799040686491665e-22,
        v: "103507624"
      },
      {
        t: 1791353520,
        o: 1799040686491665e-22,
        h: 1799040686491665e-22,
        l: 17888980540598058e-23,
        c: 17888980540598058e-23,
        v: "164066276"
      },
      {
        t: 1791353640,
        o: 17888980540598058e-23,
        h: 17888980540598058e-23,
        l: 1785081916141207e-22,
        c: 1786029815431085e-22,
        v: "84351078"
      },
      {
        t: 1791353700,
        o: 1786029815431085e-22,
        h: 1786029815431085e-22,
        l: 17845291099323749e-23,
        c: 17845291099323749e-23,
        v: "24334267"
      },
      {
        t: 1791353760,
        o: 17845291099323749e-23,
        h: 17845291099323749e-23,
        l: 178111705536463e-21,
        c: 178111705536463e-21,
        v: "55365319"
      },
      {
        t: 1791353820,
        o: 178111705536463e-21,
        h: 178111705536463e-21,
        l: 174885062104252e-21,
        c: 174885062104252e-21,
        v: "526212604"
      },
      {
        t: 1791353880,
        o: 174885062104252e-21,
        h: 17493688582235857e-23,
        l: 17294907440018977e-23,
        c: 17313250313154137e-23,
        v: "941015128"
      },
      {
        t: 1791354060,
        o: 17313250313154137e-23,
        h: 17313250313154137e-23,
        l: 17221442427331062e-23,
        c: 17221442427331062e-23,
        v: "151371683"
      },
      {
        t: 1791354180,
        o: 17221442427331062e-23,
        h: 17221442427331062e-23,
        l: 17173679065308228e-23,
        c: 17173679065308228e-23,
        v: "78911219"
      },
      {
        t: 1791354240,
        o: 17173679065308228e-23,
        h: 18694052662607763e-23,
        l: 17083613596646782e-23,
        c: 18694052662607763e-23,
        v: "3434588606"
      },
      {
        t: 1791354360,
        o: 18694052662607763e-23,
        h: 18694052662607763e-23,
        l: 18362770453475124e-23,
        c: 18362770453475124e-23,
        v: "527306651"
      },
      {
        t: 1791354480,
        o: 18362770453475124e-23,
        h: 18541780562116505e-23,
        l: 1811837730574824e-22,
        c: 1811837730574824e-22,
        v: "963154265"
      },
      {
        t: 1791354540,
        o: 1811837730574824e-22,
        h: 1811837730574824e-22,
        l: 18064339195881896e-23,
        c: 18064339195881896e-23,
        v: "87045353"
      },
      {
        t: 1791354600,
        o: 18064339195881896e-23,
        h: 18064339195881896e-23,
        l: 18046663479457582e-23,
        c: 18046663479457582e-23,
        v: "28500549"
      },
      {
        t: 1791354660,
        o: 18046663479457582e-23,
        h: 18046663479457582e-23,
        l: 17692846280054234e-23,
        c: 17692846280054234e-23,
        v: "573463759"
      },
      {
        t: 1791354780,
        o: 1943576785766539e-22,
        h: 20516521895774997e-23,
        l: 18736707948325345e-23,
        c: 20446391363530425e-23,
        v: "5286185160"
      },
      {
        t: 1791354900,
        o: 20446391363530425e-23,
        h: 2063508372243987e-22,
        l: 20446391363530425e-23,
        c: 2063508372243987e-22,
        v: "285311652"
      },
      {
        t: 1791354960,
        o: 2063508372243987e-22,
        h: 2063508372243987e-22,
        l: 1913531109519031e-22,
        c: 1913531109519031e-22,
        v: "2304748737"
      },
      {
        t: 1791355020,
        o: 1913531109519031e-22,
        h: 1969520721546378e-22,
        l: 1913531109519031e-22,
        c: 1969520721546378e-22,
        v: "870805335"
      },
      {
        t: 1791355080,
        o: 1969520721546378e-22,
        h: 2064053290999597e-22,
        l: 19656972687867884e-23,
        c: 2064053290999597e-22,
        v: "1560760967"
      },
      {
        t: 1791355140,
        o: 2064053290999597e-22,
        h: 2106614586396387e-22,
        l: 2064053290999597e-22,
        c: 2106614586396387e-22,
        v: "729931789"
      },
      {
        t: 1791355200,
        o: 2106614586396387e-22,
        h: 2106614586396387e-22,
        l: 2105925005565447e-22,
        c: 2105925005565447e-22,
        v: "10294789"
      },
      {
        t: 1791355260,
        o: 2105925005565447e-22,
        h: 2105925005565447e-22,
        l: 20613883129112121e-23,
        c: 20613883129112121e-23,
        v: "668498612"
      },
      {
        t: 1791355320,
        o: 20613883129112121e-23,
        h: 20845313206137444e-23,
        l: 20613883129112121e-23,
        c: 20845313206137444e-23,
        v: "348339503"
      },
      {
        t: 1791355380,
        o: 20845313206137444e-23,
        h: 20845313206137444e-23,
        l: 19865904945598669e-23,
        c: 19865904945598669e-23,
        v: "1487453442"
      },
      {
        t: 1791355560,
        o: 19865904945598669e-23,
        h: 19865904945598669e-23,
        l: 19859514492006855e-23,
        c: 19859514492006855e-23,
        v: "9824342"
      },
      {
        t: 1791355680,
        o: 19859514492006855e-23,
        h: 19859514492006855e-23,
        l: 19462100228601723e-23,
        c: 19462100228601723e-23,
        v: "614100530"
      },
      {
        t: 1791355740,
        o: 19462100228601723e-23,
        h: 19462100228601723e-23,
        l: 19327602863767834e-23,
        c: 19327602863767834e-23,
        v: "209248672"
      },
      {
        t: 1791355980,
        o: 19327602863767834e-23,
        h: 19327602863767834e-23,
        l: 18366184401198455e-23,
        c: 18366184401198455e-23,
        v: "1517468407"
      },
      {
        t: 1791356100,
        o: 18366184401198455e-23,
        h: 18366184401198455e-23,
        l: 1544975953854333e-22,
        c: 16090219979004158e-23,
        v: "6238887853"
      },
      {
        t: 1791356160,
        o: 16090219979004158e-23,
        h: 16125835297844636e-23,
        l: 16090219979004158e-23,
        c: 16125835297844636e-23,
        v: "60813553"
      },
      {
        t: 1791356220,
        o: 16125835297844636e-23,
        h: 16125835297844636e-23,
        l: 1588418102258278e-22,
        c: 1588418102258278e-22,
        v: "413873446"
      },
      {
        t: 1791356280,
        o: 1588418102258278e-22,
        h: 1588418102258278e-22,
        l: 15807227478816347e-23,
        c: 15807227478816347e-23,
        v: "132455907"
      },
      {
        t: 1791356340,
        o: 15807227478816347e-23,
        h: 1593247209562264e-22,
        l: 15807227478816347e-23,
        c: 1593247209562264e-22,
        v: "215456019"
      },
      {
        t: 1791356400,
        o: 1593247209562264e-22,
        h: 1593247209562264e-22,
        l: 1582839234927788e-22,
        c: 1582839234927788e-22,
        v: "178950990"
      },
      {
        t: 1791356460,
        o: 1582839234927788e-22,
        h: 1582839234927788e-22,
        l: 15722512492099272e-23,
        c: 15722512492099272e-23,
        v: "182650822"
      },
      {
        t: 1791356520,
        o: 15722512492099272e-23,
        h: 15959627894625325e-23,
        l: 15624885565363946e-23,
        c: 15624885565363946e-23,
        v: "985434767"
      },
      {
        t: 1791356640,
        o: 15624885565363946e-23,
        h: 15648210436253467e-23,
        l: 15624885565363946e-23,
        c: 15648210436253467e-23,
        v: "40423621"
      },
      {
        t: 1791356700,
        o: 15648210436253467e-23,
        h: 15648210436253467e-23,
        l: 15599103057654792e-23,
        c: 15599103057654792e-23,
        v: "85124602"
      },
      {
        t: 1791357e3,
        o: 15599103057654792e-23,
        h: 15599103057654792e-23,
        l: 1558813552127448e-22,
        c: 1558813552127448e-22,
        v: "19029844"
      },
      {
        t: 1791357060,
        o: 1558813552127448e-22,
        h: 1558813552127448e-22,
        l: 15577609323052234e-23,
        c: 15577609323052234e-23,
        v: "18270373"
      },
      {
        t: 1791357180,
        o: 15577609323052234e-23,
        h: 15577609323052234e-23,
        l: 15558461593897655e-23,
        c: 15558461593897655e-23,
        v: "33250641"
      },
      {
        t: 1791357240,
        o: 15558461593897655e-23,
        h: 15558461593897655e-23,
        l: 15557148112724535e-23,
        c: 15557148112724535e-23,
        v: "2281651"
      },
      {
        t: 1791357420,
        o: 15557148112724535e-23,
        h: 15557148112724535e-23,
        l: 15555981146924934e-23,
        c: 15555981146924934e-23,
        v: "2027220"
      },
      {
        t: 1791357540,
        o: 15555981146924934e-23,
        h: 15555981146924934e-23,
        l: 15446341079375318e-23,
        c: 15446341079375318e-23,
        v: "190804033"
      },
      {
        t: 1791357660,
        o: 15446341079375318e-23,
        h: 15446341079375318e-23,
        l: 1532593493919729e-22,
        c: 1532593493919729e-22,
        v: "210321892"
      },
      {
        t: 1791357720,
        o: 1509515409073377e-22,
        h: 1509515409073377e-22,
        l: 13985276344241684e-23,
        c: 13985276344241684e-23,
        v: "2498891204"
      },
      {
        t: 1791357780,
        o: 14053822572507453e-23,
        h: 1418647593332689e-22,
        l: 14053822572507453e-23,
        c: 1418647593332689e-22,
        v: "268604475"
      },
      {
        t: 1791357840,
        o: 1418647593332689e-22,
        h: 1418647593332689e-22,
        l: 12721752144781285e-23,
        c: 12721752144781285e-23,
        v: "3635819314"
      },
      {
        t: 1791357900,
        o: 12721752144781285e-23,
        h: 13431734299670742e-23,
        l: 12721752144781285e-23,
        c: 13431734299670742e-23,
        v: "1345644626"
      },
      {
        t: 1791358080,
        o: 13431734299670742e-23,
        h: 13431734299670742e-23,
        l: 1306703631998815e-22,
        c: 13090259770424462e-23,
        v: "730527854"
      },
      {
        t: 1791358320,
        o: 13090259770424462e-23,
        h: 13090259770424462e-23,
        l: 13076910628082735e-23,
        c: 13076910628082735e-23,
        v: "25287001"
      },
      {
        t: 1791358380,
        o: 13076910628082735e-23,
        h: 1424343641052027e-22,
        l: 13076910628082735e-23,
        c: 14159884591080597e-23,
        v: "2163514755"
      },
      {
        t: 1791358440,
        o: 1424343641052027e-22,
        h: 1504493965463141e-22,
        l: 1424343641052027e-22,
        c: 1504493965463141e-22,
        v: "1435521410"
      },
      {
        t: 1791358500,
        o: 1504493965463141e-22,
        h: 1504493965463141e-22,
        l: 15035077932809526e-23,
        c: 15035077932809526e-23,
        v: "17423647"
      },
      {
        t: 1791358560,
        o: 15035077932809526e-23,
        h: 15035077932809526e-23,
        l: 14504278052712047e-23,
        c: 14504278052712047e-23,
        v: "946397144"
      },
      {
        t: 1791358620,
        o: 14504278052712047e-23,
        h: 14504278052712047e-23,
        l: 1405614802195456e-22,
        c: 1405614802195456e-22,
        v: "812570860"
      },
      {
        t: 1791358680,
        o: 1405614802195456e-22,
        h: 14064214850833325e-23,
        l: 1405614802195456e-22,
        c: 14064214850833325e-23,
        v: "14743688"
      },
      {
        t: 1791358800,
        o: 14064214850833325e-23,
        h: 14064214850833325e-23,
        l: 1391484046205661e-22,
        c: 1391484046205661e-22,
        v: "273645344"
      },
      {
        t: 1791358860,
        o: 1391484046205661e-22,
        h: 15867383574833804e-23,
        l: 13912377120113328e-23,
        c: 1586680940908528e-22,
        v: "4501070760"
      },
      {
        t: 1791358920,
        o: 15867383574833804e-23,
        h: 16156400686682106e-23,
        l: 15867383574833804e-23,
        c: 16156400686682106e-23,
        v: "495004604"
      },
      {
        t: 1791359040,
        o: 16156400686682106e-23,
        h: 16156400686682106e-23,
        l: 15712913152074937e-23,
        c: 15712913152074937e-23,
        v: "761266689"
      },
      {
        t: 1791359100,
        o: 15712913152074937e-23,
        h: 15712913152074937e-23,
        l: 15481309900809675e-23,
        c: 15481309900809675e-23,
        v: "401829914"
      },
      {
        t: 1791359220,
        o: 15481309900809675e-23,
        h: 15551514871408732e-23,
        l: 15074603045260543e-23,
        c: 15074603045260543e-23,
        v: "957243129"
      },
      {
        t: 1791359280,
        o: 15074603045260543e-23,
        h: 15074603045260543e-23,
        l: 14982241668074747e-23,
        c: 14982241668074747e-23,
        v: "163249564"
      },
      {
        t: 1791359580,
        o: 14982241668074747e-23,
        h: 14982241668074747e-23,
        l: 14947773602690683e-23,
        c: 14947773602690683e-23,
        v: "61051516"
      },
      {
        t: 1791359700,
        o: 14947773602690683e-23,
        h: 15001090300651643e-23,
        l: 14947773602690683e-23,
        c: 15001090300651643e-23,
        v: "94426329"
      },
      {
        t: 1791359880,
        o: 15001090300651643e-23,
        h: 1522725425796439e-22,
        l: 15001090300651643e-23,
        c: 1522725425796439e-22,
        v: "398693525"
      },
      {
        t: 1791359940,
        o: 1522725425796439e-22,
        h: 16019218572175693e-23,
        l: 1522725425796439e-22,
        c: 16019218572175693e-23,
        v: "1373285055"
      },
      {
        t: 179136e4,
        o: 16019218572175693e-23,
        h: 16053778694216575e-23,
        l: 16019218572175693e-23,
        c: 16053778694216575e-23,
        v: "59146209"
      },
      {
        t: 1791360060,
        o: 16053778694216575e-23,
        h: 16327290045040976e-23,
        l: 16053778694216575e-23,
        c: 16327290045040976e-23,
        v: "465859588"
      },
      {
        t: 1791360180,
        o: 16327290045040976e-23,
        h: 16327290045040976e-23,
        l: 15565391139514137e-23,
        c: 15611529076505581e-23,
        v: "1307429045"
      },
      {
        t: 1791360240,
        o: 15565391139514137e-23,
        h: 15565391139514137e-23,
        l: 15508665340800264e-23,
        c: 15508665340800264e-23,
        v: "98609276"
      },
      {
        t: 1791360360,
        o: 14480822636439416e-23,
        h: 14480822636439416e-23,
        l: 14200597470662177e-23,
        c: 14200597470662177e-23,
        v: "2326087323"
      },
      {
        t: 1791360420,
        o: 14200597470662177e-23,
        h: 14200597470662177e-23,
        l: 1411695922354179e-22,
        c: 1411695922354179e-22,
        v: "152305460"
      },
      {
        t: 1791360480,
        o: 1411695922354179e-22,
        h: 1457983477664435e-22,
        l: 1411695922354179e-22,
        c: 1457983477664435e-22,
        v: "837503527"
      },
      {
        t: 1791360660,
        o: 1457983477664435e-22,
        h: 1457983477664435e-22,
        l: 1451582552083762e-22,
        c: 14535028493980088e-23,
        v: "149523475"
      },
      {
        t: 1791360900,
        o: 14535028493980088e-23,
        h: 14593949608184733e-23,
        l: 14535028493980088e-23,
        c: 14593949608184733e-23,
        v: "105811854"
      },
      {
        t: 1791360960,
        o: 14593949608184733e-23,
        h: 15778098894218313e-23,
        l: 14593949608184733e-23,
        c: 15762592552326797e-23,
        v: "2082948513"
      },
      {
        t: 1791361200,
        o: 15209704249742143e-23,
        h: 15510361266992638e-23,
        l: 14972385902874604e-23,
        c: 14972385902874604e-23,
        v: "1408097569"
      },
      {
        t: 1791361500,
        o: 14972385902874604e-23,
        h: 1518746779121482e-22,
        l: 14972385902874604e-23,
        c: 1518746779121482e-22,
        v: "379595171"
      },
      {
        t: 1791361680,
        o: 1518746779121482e-22,
        h: 1518746779121482e-22,
        l: 13264277772682083e-23,
        c: 13264277772682083e-23,
        v: "3495898492"
      },
      {
        t: 1791361740,
        o: 13264277772682083e-23,
        h: 132868134141277e-21,
        l: 13249805078024977e-23,
        c: 132868134141277e-21,
        v: "96868818"
      },
      {
        t: 1791362040,
        o: 132868134141277e-21,
        h: 13329482741714566e-23,
        l: 13281668018834666e-23,
        c: 13329482741714566e-23,
        v: "99511850"
      },
      {
        t: 1791362100,
        o: 13329482741714566e-23,
        h: 13372499164717103e-23,
        l: 13329482741714566e-23,
        c: 13372499164717103e-23,
        v: "80685384"
      },
      {
        t: 1791362460,
        o: 13372499164717103e-23,
        h: 13375661862061155e-23,
        l: 13372499164717103e-23,
        c: 13375661862061155e-23,
        v: "5927110"
      },
      {
        t: 1791362520,
        o: 13375661862061155e-23,
        h: 1427130002585704e-22,
        l: 13375661862061155e-23,
        c: 1427130002585704e-22,
        v: "1651195887"
      },
      {
        t: 1791362580,
        o: 1427130002585704e-22,
        h: 1427130002585704e-22,
        l: 14248034767419117e-23,
        c: 14248034767419117e-23,
        v: "42216771"
      },
      {
        t: 1791362820,
        o: 14248034767419117e-23,
        h: 14248034767419117e-23,
        l: 14033593371908014e-23,
        c: 14033593371908014e-23,
        v: "390756696"
      },
      {
        t: 1791362880,
        o: 14033593371908014e-23,
        h: 14033593371908014e-23,
        l: 14021570690890673e-23,
        c: 14021570690890673e-23,
        v: "21995917"
      },
      {
        t: 1791362940,
        o: 14021570690890673e-23,
        h: 14021570690890673e-23,
        l: 13803625280497797e-23,
        c: 13803625280497797e-23,
        v: "400386306"
      },
      {
        t: 1791363060,
        o: 13803625280497797e-23,
        h: 13803625280497797e-23,
        l: 1326823191200058e-22,
        c: 1326823191200058e-22,
        v: "997201032"
      },
      {
        t: 1791363120,
        o: 1326823191200058e-22,
        h: 1326823191200058e-22,
        l: 1324671690450423e-22,
        c: 1324671690450423e-22,
        v: "40489697"
      },
      {
        t: 1791363180,
        o: 1324671690450423e-22,
        h: 13294568645966374e-23,
        l: 1324671690450423e-22,
        c: 13294568645966374e-23,
        v: "90026887"
      },
      {
        t: 1791363240,
        o: 13294568645966374e-23,
        h: 13314296669848494e-23,
        l: 13294568645966374e-23,
        c: 13314296669848494e-23,
        v: "37068568"
      },
      {
        t: 1791363300,
        o: 13314296669848494e-23,
        h: 13336729006511134e-23,
        l: 13314296669848494e-23,
        c: 13336729006511134e-23,
        v: "42116569"
      },
      {
        t: 1791363360,
        o: 13336729006511134e-23,
        h: 14063334726024886e-23,
        l: 13336729006511134e-23,
        c: 14063334726024886e-23,
        v: "1345540920"
      },
      {
        t: 1791363420,
        o: 14063875253624911e-23,
        h: 14780645848764636e-23,
        l: 14063875253624911e-23,
        c: 1477605099227472e-22,
        v: "1302834759"
      },
      {
        t: 1791363600,
        o: 1477605099227472e-22,
        h: 1477605099227472e-22,
        l: 1433353435383251e-22,
        c: 1433353435383251e-22,
        v: "794831687"
      },
      {
        t: 1791363720,
        o: 1433353435383251e-22,
        h: 1433353435383251e-22,
        l: 13293492901609376e-23,
        c: 13293492901609376e-23,
        v: "1917840773"
      },
      {
        t: 1791363780,
        o: 13293492901609376e-23,
        h: 1344580643986427e-22,
        l: 13293492901609376e-23,
        c: 13391615885916033e-23,
        v: "386868820"
      },
      {
        t: 1791363840,
        o: 13391615885916033e-23,
        h: 13435397705826693e-23,
        l: 13391615885916033e-23,
        c: 13435397705826693e-23,
        v: "81930969"
      },
      {
        t: 1791363900,
        o: 13435397705826693e-23,
        h: 13435397705826693e-23,
        l: 13419943250946896e-23,
        c: 13419943250946896e-23,
        v: "28899603"
      },
      {
        t: 1791364020,
        o: 13419943250946896e-23,
        h: 13419943250946896e-23,
        l: 13413465121097974e-23,
        c: 13413465121097974e-23,
        v: "12118957"
      },
      {
        t: 1791364140,
        o: 13413465121097974e-23,
        h: 13413465121097974e-23,
        l: 13362689386900436e-23,
        c: 13373123681952378e-23,
        v: "114649684"
      },
      {
        t: 1791364320,
        o: 13373123681952378e-23,
        h: 15690501165901998e-23,
        l: 1322080669596402e-22,
        c: 15690501165901998e-23,
        v: "4742265604"
      },
      {
        t: 1791364380,
        o: 15690501165901998e-23,
        h: 15856506849439127e-23,
        l: 15690501165901998e-23,
        c: 15856506849439127e-23,
        v: "286477036"
      },
      {
        t: 1791364500,
        o: 1554836024402516e-22,
        h: 1554836024402516e-22,
        l: 1522359872679765e-22,
        c: 1522359872679765e-22,
        v: "1100221109"
      },
      {
        t: 1791364620,
        o: 1522359872679765e-22,
        h: 1522359872679765e-22,
        l: 14066484393833506e-23,
        c: 14066484393833506e-23,
        v: "2072334744"
      },
      {
        t: 1791364680,
        o: 14066484393833506e-23,
        h: 1417372093793521e-22,
        l: 14066484393833506e-23,
        c: 1417372093793521e-22,
        v: "195594664"
      },
      {
        t: 1791364920,
        o: 1417372093793521e-22,
        h: 1417372093793521e-22,
        l: 14107319002233825e-23,
        c: 14160963967147626e-23,
        v: "218799727"
      },
      {
        t: 1791364980,
        o: 14160963967147626e-23,
        h: 1422547228806437e-22,
        l: 14160963967147626e-23,
        c: 1422547228806437e-22,
        v: "117356796"
      },
      {
        t: 1791365100,
        o: 1422547228806437e-22,
        h: 15174397087852395e-23,
        l: 1422547228806437e-22,
        c: 15174397087852395e-23,
        v: "1696539068"
      },
      {
        t: 1791365160,
        o: 15174397087852395e-23,
        h: 15174397087852395e-23,
        l: 14976945160335374e-23,
        c: 14976945160335374e-23,
        v: "348475824"
      },
      {
        t: 1791365400,
        o: 14865100261150782e-23,
        h: 14920656368108995e-23,
        l: 1471154310096838e-22,
        c: 1475507591272101e-22,
        v: "472038364"
      },
      {
        t: 1791365640,
        o: 1471154310096838e-22,
        h: 1471154310096838e-22,
        l: 14489449220382361e-23,
        c: 14489449220382361e-23,
        v: "398294152"
      },
      {
        t: 1791365880,
        o: 14489449220382361e-23,
        h: 14688583232919362e-23,
        l: 14489449220382361e-23,
        c: 14688583232919362e-23,
        v: "357330563"
      },
      {
        t: 1791365940,
        o: 14688583232919362e-23,
        h: 15378840871655644e-23,
        l: 14688583232919362e-23,
        c: 15378840871655644e-23,
        v: "1220232428"
      },
      {
        t: 1791366180,
        o: 15378840871655644e-23,
        h: 15378840871655644e-23,
        l: 1512595819047186e-22,
        c: 1512595819047186e-22,
        v: "443714254"
      },
      {
        t: 1791366300,
        o: 1512595819047186e-22,
        h: 1512595819047186e-22,
        l: 14397942264980613e-23,
        c: 14397942264980613e-23,
        v: "1298530499"
      },
      {
        t: 1791366360,
        o: 14397942264980613e-23,
        h: 14397942264980613e-23,
        l: 13547718524348298e-23,
        c: 13547718524348298e-23,
        v: "1558806877"
      },
      {
        t: 1791366420,
        o: 13547718524348298e-23,
        h: 13547718524348298e-23,
        l: 1333577780185927e-22,
        c: 1333577780185927e-22,
        v: "396134130"
      },
      {
        t: 1791366480,
        o: 1333577780185927e-22,
        h: 1386193844030214e-22,
        l: 1333577780185927e-22,
        c: 1386193844030214e-22,
        v: "977973332"
      },
      {
        t: 1791366660,
        o: 1386193844030214e-22,
        h: 13924641933926e-20,
        l: 1386193844030214e-22,
        c: 13924641933926e-20,
        v: "115300152"
      },
      {
        t: 1791366720,
        o: 13924641933926e-20,
        h: 13924641933926e-20,
        l: 13924131265097422e-23,
        c: 13924131265097422e-23,
        v: "937788"
      },
      {
        t: 1791367200,
        o: 13924131265097422e-23,
        h: 13932808038412898e-23,
        l: 13915714990941234e-23,
        c: 13915714990941234e-23,
        v: "47324509"
      },
      {
        t: 1791367380,
        o: 13915714990941234e-23,
        h: 13915714990941234e-23,
        l: 13771737727067595e-23,
        c: 13771737727067595e-23,
        v: "265168883"
      },
      {
        t: 1791367440,
        o: 13771737727067595e-23,
        h: 13771737727067595e-23,
        l: 13758393268822045e-23,
        c: 13758393268822045e-23,
        v: "24647093"
      },
      {
        t: 1791367500,
        o: 13758393268822045e-23,
        h: 13758393268822045e-23,
        l: 13550012082620952e-23,
        c: 13550012082620952e-23,
        v: "386440300"
      },
      {
        t: 1791367560,
        o: 13550012082620952e-23,
        h: 1359867270744966e-22,
        l: 13550012082620952e-23,
        c: 1359867270744966e-22,
        v: "90523131"
      },
      {
        t: 1791367680,
        o: 1359867270744966e-22,
        h: 1359867270744966e-22,
        l: 13527381078450563e-23,
        c: 13527381078450563e-23,
        v: "132652344"
      },
      {
        t: 1791367800,
        o: 13527381078450563e-23,
        h: 13527381078450563e-23,
        l: 1350321260100165e-22,
        c: 1350321260100165e-22,
        v: "45049604"
      },
      {
        t: 1791367860,
        o: 1350321260100165e-22,
        h: 15880385675170185e-23,
        l: 13471565639096034e-23,
        c: 14664808243243325e-23,
        v: "6504271230"
      },
      {
        t: 1791367920,
        o: 14664808243243325e-23,
        h: 14688408285268135e-23,
        l: 14664808243243325e-23,
        c: 14688408285268135e-23,
        v: "42222763"
      },
      {
        t: 1791367980,
        o: 14688408285268135e-23,
        h: 14750005284264266e-23,
        l: 14688408285268135e-23,
        c: 14750005284264266e-23,
        v: "110043478"
      }
    ],
    "5m": [
      {
        t: 1791260400,
        o: 279589934766799e-22,
        h: 9294260570866142e-23,
        l: 279589934766799e-22,
        c: 4263803966633202e-23,
        v: "188996119921"
      },
      {
        t: 1791260700,
        o: 4263803966714314e-23,
        h: 4432295415114698e-23,
        l: 2939595174935649e-23,
        c: 2939595174935649e-23,
        v: "8786247481"
      },
      {
        t: 1791261e3,
        o: 29395951750306015e-24,
        h: 2977469106320123e-23,
        l: 29395951750306015e-24,
        c: 2977469106320123e-23,
        v: "197530863"
      },
      {
        t: 1791261600,
        o: 29774691064159938e-24,
        h: 30155854632689144e-24,
        l: 29774691064159938e-24,
        c: 30155854632689144e-24,
        v: "197530862"
      },
      {
        t: 1791262500,
        o: 3015585463344221e-23,
        h: 9718628201471758e-23,
        l: 3015585463344221e-23,
        c: 76985498852442e-21,
        v: "76454224846"
      },
      {
        t: 1791262800,
        o: 8328145555649363e-23,
        h: 8594302840796969e-23,
        l: 2802626255817767e-23,
        c: 2802626255817767e-23,
        v: "48961328744"
      },
      {
        t: 1791263100,
        o: 28026262558335445e-24,
        h: 4188293744941742e-23,
        l: 2800931383183178e-23,
        c: 38840828600946975e-24,
        v: "8058717737"
      },
      {
        t: 1791263400,
        o: 3884082860169098e-23,
        h: 3884082860169098e-23,
        l: 38248962564534306e-24,
        c: 38248962564534306e-24,
        v: "270441711"
      },
      {
        t: 1791263700,
        o: 38248962565017796e-24,
        h: 38248962565017796e-24,
        l: 38030945757706776e-24,
        c: 38030945757706776e-24,
        v: "100145359"
      },
      {
        t: 1791266400,
        o: 38030945758784704e-24,
        h: 38671293913588296e-24,
        l: 38030945758784704e-24,
        c: 38671293913588296e-24,
        v: "293333333"
      },
      {
        t: 1791267e3,
        o: 3867129391358832e-23,
        h: 3867694163081273e-23,
        l: 3867129391358832e-23,
        c: 3867694163081273e-23,
        v: "2576281"
      },
      {
        t: 1791267300,
        o: 4251731017708457e-23,
        h: 43029384057996714e-24,
        l: 40850202254501984e-24,
        c: 42886877477159735e-24,
        v: "1932435010"
      },
      {
        t: 1791267600,
        o: 4302938405799861e-23,
        h: 4370976338502305e-23,
        l: 4096293132755687e-23,
        c: 4370976338502305e-23,
        v: "2102398634"
      },
      {
        t: 1791267900,
        o: 4370976338618803e-23,
        h: 4763312974274222e-23,
        l: 4370976338618803e-23,
        c: 44276736757522484e-24,
        v: "3052063484"
      },
      {
        t: 1791272700,
        o: 4427673675753831e-23,
        h: 4427673675753831e-23,
        l: 3970882290494357e-23,
        c: 3970882290494357e-23,
        v: "2000423077"
      },
      {
        t: 1791292500,
        o: 39708822905343355e-24,
        h: 39708822905343355e-24,
        l: 39701317897228376e-24,
        c: 39701317897228376e-24,
        v: "3378770"
      },
      {
        t: 1791296100,
        o: 3970131789724634e-23,
        h: 3970131789724634e-23,
        l: 38688883027736295e-24,
        c: 38688883027736295e-24,
        v: "458765503"
      },
      {
        t: 1791297600,
        o: 3868888302816438e-23,
        h: 3868888302816438e-23,
        l: 3868323269525977e-23,
        c: 3868323269525977e-23,
        v: "2577076"
      },
      {
        t: 1791312900,
        o: 38683232696034367e-24,
        h: 38683232696034367e-24,
        l: 3804258921305711e-23,
        c: 3804258921305711e-23,
        v: "293423514"
      },
      {
        t: 1791322800,
        o: 38042589213987995e-24,
        h: 38042589213987995e-24,
        l: 38023911370530644e-24,
        c: 38023911370530644e-24,
        v: "8591628"
      },
      {
        t: 1791327600,
        o: 38023911371563163e-24,
        h: 38023911371563163e-24,
        l: 38005221878517357e-24,
        c: 38005221878517357e-24,
        v: "8599099"
      },
      {
        t: 1791335100,
        o: 49251031800684326e-24,
        h: 17548331501845948e-23,
        l: 4925103179958382e-23,
        c: 16304433000824975e-23,
        v: "114698375298"
      },
      {
        t: 1791335400,
        o: 1630443300087077e-22,
        h: 17572463698600577e-23,
        l: 11683085469946845e-23,
        c: 11683085469946845e-23,
        v: "17734926444"
      },
      {
        t: 1791335700,
        o: 11683085470088193e-23,
        h: 12964481740642387e-23,
        l: 11471930993093269e-23,
        c: 1292487036431133e-22,
        v: "4439001159"
      },
      {
        t: 1791336e3,
        o: 12146022289199943e-23,
        h: 12146022289199943e-23,
        l: 11607262393272823e-23,
        c: 11607262393272823e-23,
        v: "3488508551"
      },
      {
        t: 1791336300,
        o: 11607262393290847e-23,
        h: 11607262393290847e-23,
        l: 7671649061264641e-23,
        c: 9300458893996615e-23,
        v: "27661992538"
      },
      {
        t: 1791336600,
        o: 9271650337091064e-23,
        h: 2623829573470614e-22,
        l: 8546890231569885e-23,
        c: 244889341989144e-21,
        v: "185439305735"
      },
      {
        t: 1791336900,
        o: 2448893419891443e-22,
        h: 5382531501942764e-22,
        l: 20796586761763903e-23,
        c: 29858112602998864e-23,
        v: "377432818652"
      },
      {
        t: 1791337200,
        o: 29858112602998864e-23,
        h: 5911889757003219e-22,
        l: 28763548033103537e-23,
        c: 5320780012656606e-22,
        v: "386718525602"
      },
      {
        t: 1791337500,
        o: 5320780012656606e-22,
        h: 9751250471552627e-22,
        l: 3058368065466991e-22,
        c: 6753143674311917e-22,
        v: "923323861195"
      },
      {
        t: 1791337800,
        o: 6753143674311917e-22,
        h: 7237394479718302e-22,
        l: 444938561738585e-21,
        c: 5889458741734484e-22,
        v: "268397424835"
      },
      {
        t: 1791338100,
        o: 5889458741734484e-22,
        h: 6766934220948308e-22,
        l: 31345560328960595e-23,
        c: 34681974599165515e-23,
        v: "295498745964"
      },
      {
        t: 1791338400,
        o: 34681974599165515e-23,
        h: 6699575653058316e-22,
        l: 2676552434335414e-22,
        c: 5488670316916011e-22,
        v: "304497309479"
      },
      {
        t: 1791338700,
        o: 5488670316916011e-22,
        h: 9846269177584689e-22,
        l: 5437575657162874e-22,
        c: 9031959840074938e-22,
        v: "398018061558"
      },
      {
        t: 1791339e3,
        o: 9031959840074938e-22,
        h: 9306899694256718e-22,
        l: 6000623846278597e-22,
        c: 6229639844763716e-22,
        v: "211470934874"
      },
      {
        t: 1791339300,
        o: 6229639844763716e-22,
        h: 6966827701521272e-22,
        l: 4015215137029017e-22,
        c: 6155035012392285e-22,
        v: "146733119216"
      },
      {
        t: 1791339600,
        o: 6155035012392285e-22,
        h: 6553157441628833e-22,
        l: 3630718199761341e-22,
        c: 4821855788752663e-22,
        v: "124625468861"
      },
      {
        t: 1791339900,
        o: 477655469756998e-21,
        h: 7466752343777611e-22,
        l: 44635851524018217e-23,
        c: 6804661378614615e-22,
        v: "118833114361"
      },
      {
        t: 1791340200,
        o: 6799199511008955e-22,
        h: 6834293408683093e-22,
        l: 5188872060551164e-22,
        c: 5734115166414845e-22,
        v: "98151391115"
      },
      {
        t: 1791340500,
        o: 5734115166414845e-22,
        h: 6350127975980025e-22,
        l: 5208453360137185e-22,
        c: 5304954562623271e-22,
        v: "61192771101"
      },
      {
        t: 1791340800,
        o: 5304954562623271e-22,
        h: 9030073654443388e-22,
        l: 489373008480672e-21,
        c: 8009914581884903e-22,
        v: "173358162158"
      },
      {
        t: 1791341100,
        o: 8009914581884903e-22,
        h: 8112924537792374e-22,
        l: 6527058235579216e-22,
        c: 656854587797207e-21,
        v: "60152683842"
      },
      {
        t: 1791341400,
        o: 6568536219852606e-22,
        h: 7180679444474344e-22,
        l: 587219145898419e-21,
        c: 6258056092741204e-22,
        v: "35371605440"
      },
      {
        t: 1791341700,
        o: 6258056092741204e-22,
        h: 6348092489627054e-22,
        l: 4874723876856651e-22,
        c: 5404116587929772e-22,
        v: "41115702845"
      },
      {
        t: 1791342e3,
        o: 5404116587929772e-22,
        h: 6772567505721075e-22,
        l: 5358595035147956e-22,
        c: 6693489614969844e-22,
        v: "19496209955"
      },
      {
        t: 1791342300,
        o: 6693489614969844e-22,
        h: 7323901287625641e-22,
        l: 6205258164544823e-22,
        c: 6248874830453533e-22,
        v: "30466438783"
      },
      {
        t: 1791342600,
        o: 6248874830453533e-22,
        h: 6464011313594351e-22,
        l: 5279648454061243e-22,
        c: 6464011313594351e-22,
        v: "25027310499"
      },
      {
        t: 1791342900,
        o: 6464011313594351e-22,
        h: 6464011313594351e-22,
        l: 5569501765553493e-22,
        c: 592055571757495e-21,
        v: "15931357134"
      },
      {
        t: 1791343200,
        o: 592055571757495e-21,
        h: 6465050331878746e-22,
        l: 5462406116910992e-22,
        c: 6465050331878746e-22,
        v: "19194391629"
      },
      {
        t: 1791343500,
        o: 6465050331878746e-22,
        h: 6831172737933706e-22,
        l: 5993830898977373e-22,
        c: 6293698187899284e-22,
        v: "27307733868"
      },
      {
        t: 1791343800,
        o: 6293698187899284e-22,
        h: 6449762017122886e-22,
        l: 576523298562219e-21,
        c: 5775186213979141e-22,
        v: "14190581083"
      },
      {
        t: 1791344100,
        o: 5775186213979141e-22,
        h: 5791957794512646e-22,
        l: 44583265323574034e-23,
        c: 4874829726861458e-22,
        v: "40271456056"
      },
      {
        t: 1791344400,
        o: 4874829726861458e-22,
        h: 4884797283551656e-22,
        l: 4123306064513212e-22,
        c: 4421148465131611e-22,
        v: "24306269535"
      },
      {
        t: 1791344700,
        o: 4421148465131611e-22,
        h: 4565849277266405e-22,
        l: 38306009829376657e-23,
        c: 3939032394710093e-22,
        v: "19784885440"
      },
      {
        t: 1791345e3,
        o: 3939032394710093e-22,
        h: 4036822942654739e-22,
        l: 30905371532992257e-23,
        c: 3298109367632312e-22,
        v: "18070309969"
      },
      {
        t: 1791345300,
        o: 3298109367632312e-22,
        h: 3361228673058276e-22,
        l: 2777715394809947e-22,
        c: 2915740608497382e-22,
        v: "30743818607"
      },
      {
        t: 1791345600,
        o: 2915740608497382e-22,
        h: 3327835425215029e-22,
        l: 2915740608497382e-22,
        c: 3327835425215029e-22,
        v: "15355706190"
      },
      {
        t: 1791345900,
        o: 3327835425215029e-22,
        h: 3948762659162845e-22,
        l: 3312011673768155e-22,
        c: 34766465129894806e-23,
        v: "21931030688"
      },
      {
        t: 1791346200,
        o: 34766465129894806e-23,
        h: 3559853558261605e-22,
        l: 3197145460404862e-22,
        c: 3499327959693529e-22,
        v: "10114847515"
      },
      {
        t: 1791346500,
        o: 3499327959693529e-22,
        h: 3748968364356568e-22,
        l: 3485163998506715e-22,
        c: 37257949078351116e-23,
        v: "9718489197"
      },
      {
        t: 1791346800,
        o: 37394730599111564e-23,
        h: 37394730599111564e-23,
        l: 3605666792305414e-22,
        c: 36327316505648126e-23,
        v: "2034570750"
      },
      {
        t: 1791347100,
        o: 36327316505648126e-23,
        h: 39448389011638534e-23,
        l: 36311736826474133e-23,
        c: 37615226208704665e-23,
        v: "6790865927"
      },
      {
        t: 1791347400,
        o: 37615226208704665e-23,
        h: 37968369623994404e-23,
        l: 32195913545349804e-23,
        c: 3396819133797279e-22,
        v: "21444039128"
      },
      {
        t: 1791347700,
        o: 3396819133797279e-22,
        h: 3396819133797279e-22,
        l: 32739676834399396e-23,
        c: 32739676834399396e-23,
        v: "2472345760"
      },
      {
        t: 1791348e3,
        o: 32739676834399396e-23,
        h: 32932436376102595e-23,
        l: 3242029484636879e-22,
        c: 32758537091326804e-23,
        v: "1662041280"
      },
      {
        t: 1791348300,
        o: 32758537091326804e-23,
        h: 3432645248499405e-22,
        l: 32758537091326804e-23,
        c: 3411575527451718e-22,
        v: "3534844512"
      },
      {
        t: 1791348600,
        o: 3411575527451718e-22,
        h: 34497702347422427e-23,
        l: 3064370715862693e-22,
        c: 3089441508873029e-22,
        v: "5466687043"
      },
      {
        t: 1791348900,
        o: 3089441508873029e-22,
        h: 3486878787915175e-22,
        l: 3089441508873029e-22,
        c: 3486878787915175e-22,
        v: "5778922629"
      },
      {
        t: 1791349200,
        o: 3486878787915175e-22,
        h: 3487730152300257e-22,
        l: 3270507323586978e-22,
        c: 3270507323586978e-22,
        v: "2714432779"
      },
      {
        t: 1791349500,
        o: 3270507323586978e-22,
        h: 3270507323586978e-22,
        l: 2994231842275743e-22,
        c: 3050054572526192e-22,
        v: "6917367077"
      },
      {
        t: 1791349800,
        o: 3050054572526192e-22,
        h: 30517604506530284e-23,
        l: 2998770824200226e-22,
        c: 2998770824200226e-22,
        v: "941843012"
      },
      {
        t: 1791350100,
        o: 2998770824200226e-22,
        h: 2998770824200226e-22,
        l: 23613927776839313e-23,
        c: 23983797139396975e-23,
        v: "11725932524"
      },
      {
        t: 1791350400,
        o: 23983797139396975e-23,
        h: 2433454954849224e-22,
        l: 2159251673668948e-22,
        c: 2159251673668948e-22,
        v: "4688301237"
      },
      {
        t: 1791350700,
        o: 2159251673668948e-22,
        h: 22698440358111793e-23,
        l: 21339962648212794e-23,
        c: 22316452809740197e-23,
        v: "5761024713"
      },
      {
        t: 1791351e3,
        o: 22316452809740197e-23,
        h: 2243192177495156e-22,
        l: 20745831824202147e-23,
        c: 21670296918890412e-23,
        v: "5403904686"
      },
      {
        t: 1791351300,
        o: 21670296918890412e-23,
        h: 21670296918890412e-23,
        l: 19825793847194737e-23,
        c: 20651883234139864e-23,
        v: "5427283235"
      },
      {
        t: 1791351600,
        o: 20651883234139864e-23,
        h: 21767539930450468e-23,
        l: 20175031461545307e-23,
        c: 21552656924156278e-23,
        v: "3817927607"
      },
      {
        t: 1791351900,
        o: 21552656924156278e-23,
        h: 21552656924156278e-23,
        l: 19322436923172953e-23,
        c: 19730118337908327e-23,
        v: "4829958767"
      },
      {
        t: 1791352200,
        o: 19730118337908327e-23,
        h: 19819550735843718e-23,
        l: 19450430425514403e-23,
        c: 19450430425514403e-23,
        v: "1049667848"
      },
      {
        t: 1791352500,
        o: 19450430425514403e-23,
        h: 19474563623333658e-23,
        l: 18235843271853752e-23,
        c: 18235843271853752e-23,
        v: "2754004599"
      },
      {
        t: 1791352800,
        o: 18235843271853752e-23,
        h: 19478445654059063e-23,
        l: 18166095601894937e-23,
        c: 19076317945909335e-23,
        v: "3878622393"
      },
      {
        t: 1791353100,
        o: 1884376604655478e-22,
        h: 1884376604655478e-22,
        l: 17865414879882445e-23,
        c: 17926397499879732e-23,
        v: "2376849956"
      },
      {
        t: 1791353400,
        o: 17926397499879732e-23,
        h: 1799040686491665e-22,
        l: 1785081916141207e-22,
        c: 1786029815431085e-22,
        v: "351924978"
      },
      {
        t: 1791353700,
        o: 1786029815431085e-22,
        h: 1786029815431085e-22,
        l: 17294907440018977e-23,
        c: 17313250313154137e-23,
        v: "1546927318"
      },
      {
        t: 1791354e3,
        o: 17313250313154137e-23,
        h: 18694052662607763e-23,
        l: 17083613596646782e-23,
        c: 18694052662607763e-23,
        v: "3664871508"
      },
      {
        t: 1791354300,
        o: 18694052662607763e-23,
        h: 18694052662607763e-23,
        l: 18064339195881896e-23,
        c: 18064339195881896e-23,
        v: "1577506269"
      },
      {
        t: 1791354600,
        o: 18064339195881896e-23,
        h: 20516521895774997e-23,
        l: 17692846280054234e-23,
        c: 20446391363530425e-23,
        v: "5888149468"
      },
      {
        t: 1791354900,
        o: 20446391363530425e-23,
        h: 2106614586396387e-22,
        l: 1913531109519031e-22,
        c: 2106614586396387e-22,
        v: "5751558480"
      },
      {
        t: 1791355200,
        o: 2106614586396387e-22,
        h: 2106614586396387e-22,
        l: 19865904945598669e-23,
        c: 19865904945598669e-23,
        v: "2514586346"
      },
      {
        t: 1791355500,
        o: 19865904945598669e-23,
        h: 19865904945598669e-23,
        l: 19327602863767834e-23,
        c: 19327602863767834e-23,
        v: "833173544"
      },
      {
        t: 1791355800,
        o: 19327602863767834e-23,
        h: 19327602863767834e-23,
        l: 18366184401198455e-23,
        c: 18366184401198455e-23,
        v: "1517468407"
      },
      {
        t: 1791356100,
        o: 18366184401198455e-23,
        h: 18366184401198455e-23,
        l: 1544975953854333e-22,
        c: 1593247209562264e-22,
        v: "7061486778"
      },
      {
        t: 1791356400,
        o: 1593247209562264e-22,
        h: 15959627894625325e-23,
        l: 15624885565363946e-23,
        c: 15648210436253467e-23,
        v: "1387460200"
      },
      {
        t: 1791356700,
        o: 15648210436253467e-23,
        h: 15648210436253467e-23,
        l: 15599103057654792e-23,
        c: 15599103057654792e-23,
        v: "85124602"
      },
      {
        t: 1791357e3,
        o: 15599103057654792e-23,
        h: 15599103057654792e-23,
        l: 15557148112724535e-23,
        c: 15557148112724535e-23,
        v: "72832509"
      },
      {
        t: 1791357300,
        o: 15557148112724535e-23,
        h: 15557148112724535e-23,
        l: 15446341079375318e-23,
        c: 15446341079375318e-23,
        v: "192831253"
      },
      {
        t: 1791357600,
        o: 15446341079375318e-23,
        h: 15446341079375318e-23,
        l: 12721752144781285e-23,
        c: 12721752144781285e-23,
        v: "6613636885"
      },
      {
        t: 1791357900,
        o: 12721752144781285e-23,
        h: 13431734299670742e-23,
        l: 12721752144781285e-23,
        c: 13090259770424462e-23,
        v: "2076172480"
      },
      {
        t: 1791358200,
        o: 13090259770424462e-23,
        h: 1504493965463141e-22,
        l: 13076910628082735e-23,
        c: 1504493965463141e-22,
        v: "3624323166"
      },
      {
        t: 1791358500,
        o: 1504493965463141e-22,
        h: 1504493965463141e-22,
        l: 1405614802195456e-22,
        c: 14064214850833325e-23,
        v: "1791135339"
      },
      {
        t: 1791358800,
        o: 14064214850833325e-23,
        h: 16156400686682106e-23,
        l: 13912377120113328e-23,
        c: 15712913152074937e-23,
        v: "6030987397"
      },
      {
        t: 1791359100,
        o: 15712913152074937e-23,
        h: 15712913152074937e-23,
        l: 14982241668074747e-23,
        c: 14982241668074747e-23,
        v: "1522322607"
      },
      {
        t: 1791359400,
        o: 14982241668074747e-23,
        h: 14982241668074747e-23,
        l: 14947773602690683e-23,
        c: 14947773602690683e-23,
        v: "61051516"
      },
      {
        t: 1791359700,
        o: 14947773602690683e-23,
        h: 16019218572175693e-23,
        l: 14947773602690683e-23,
        c: 16019218572175693e-23,
        v: "1866404909"
      },
      {
        t: 179136e4,
        o: 16019218572175693e-23,
        h: 16327290045040976e-23,
        l: 15508665340800264e-23,
        c: 15508665340800264e-23,
        v: "1931044118"
      },
      {
        t: 1791360300,
        o: 14480822636439416e-23,
        h: 1457983477664435e-22,
        l: 1411695922354179e-22,
        c: 1457983477664435e-22,
        v: "3315896310"
      },
      {
        t: 1791360600,
        o: 1457983477664435e-22,
        h: 1457983477664435e-22,
        l: 1451582552083762e-22,
        c: 14535028493980088e-23,
        v: "149523475"
      },
      {
        t: 1791360900,
        o: 14535028493980088e-23,
        h: 15778098894218313e-23,
        l: 14535028493980088e-23,
        c: 15762592552326797e-23,
        v: "2188760367"
      },
      {
        t: 1791361200,
        o: 15209704249742143e-23,
        h: 15510361266992638e-23,
        l: 14972385902874604e-23,
        c: 14972385902874604e-23,
        v: "1408097569"
      },
      {
        t: 1791361500,
        o: 14972385902874604e-23,
        h: 1518746779121482e-22,
        l: 13249805078024977e-23,
        c: 132868134141277e-21,
        v: "3972362481"
      },
      {
        t: 1791361800,
        o: 132868134141277e-21,
        h: 13329482741714566e-23,
        l: 13281668018834666e-23,
        c: 13329482741714566e-23,
        v: "99511850"
      },
      {
        t: 1791362100,
        o: 13329482741714566e-23,
        h: 13372499164717103e-23,
        l: 13329482741714566e-23,
        c: 13372499164717103e-23,
        v: "80685384"
      },
      {
        t: 1791362400,
        o: 13372499164717103e-23,
        h: 1427130002585704e-22,
        l: 13372499164717103e-23,
        c: 14248034767419117e-23,
        v: "1699339768"
      },
      {
        t: 1791362700,
        o: 14248034767419117e-23,
        h: 14248034767419117e-23,
        l: 13803625280497797e-23,
        c: 13803625280497797e-23,
        v: "813138919"
      },
      {
        t: 1791363e3,
        o: 13803625280497797e-23,
        h: 13803625280497797e-23,
        l: 1324671690450423e-22,
        c: 13314296669848494e-23,
        v: "1164786184"
      },
      {
        t: 1791363300,
        o: 13314296669848494e-23,
        h: 14780645848764636e-23,
        l: 13314296669848494e-23,
        c: 1477605099227472e-22,
        v: "2690492248"
      },
      {
        t: 1791363600,
        o: 1477605099227472e-22,
        h: 1477605099227472e-22,
        l: 13293492901609376e-23,
        c: 13435397705826693e-23,
        v: "3181472249"
      },
      {
        t: 1791363900,
        o: 13435397705826693e-23,
        h: 13435397705826693e-23,
        l: 13362689386900436e-23,
        c: 13373123681952378e-23,
        v: "155668244"
      },
      {
        t: 1791364200,
        o: 13373123681952378e-23,
        h: 15856506849439127e-23,
        l: 1322080669596402e-22,
        c: 15856506849439127e-23,
        v: "5028742640"
      },
      {
        t: 1791364500,
        o: 1554836024402516e-22,
        h: 1554836024402516e-22,
        l: 14066484393833506e-23,
        c: 1417372093793521e-22,
        v: "3368150517"
      },
      {
        t: 1791364800,
        o: 1417372093793521e-22,
        h: 1422547228806437e-22,
        l: 14107319002233825e-23,
        c: 1422547228806437e-22,
        v: "336156523"
      },
      {
        t: 1791365100,
        o: 1422547228806437e-22,
        h: 15174397087852395e-23,
        l: 1422547228806437e-22,
        c: 14976945160335374e-23,
        v: "2045014892"
      },
      {
        t: 1791365400,
        o: 14865100261150782e-23,
        h: 14920656368108995e-23,
        l: 14489449220382361e-23,
        c: 14489449220382361e-23,
        v: "870332516"
      },
      {
        t: 1791365700,
        o: 14489449220382361e-23,
        h: 15378840871655644e-23,
        l: 14489449220382361e-23,
        c: 15378840871655644e-23,
        v: "1577562991"
      },
      {
        t: 1791366e3,
        o: 15378840871655644e-23,
        h: 15378840871655644e-23,
        l: 1512595819047186e-22,
        c: 1512595819047186e-22,
        v: "443714254"
      },
      {
        t: 1791366300,
        o: 1512595819047186e-22,
        h: 1512595819047186e-22,
        l: 1333577780185927e-22,
        c: 1386193844030214e-22,
        v: "4231444838"
      },
      {
        t: 1791366600,
        o: 1386193844030214e-22,
        h: 13924641933926e-20,
        l: 1386193844030214e-22,
        c: 13924131265097422e-23,
        v: "116237940"
      },
      {
        t: 1791367200,
        o: 13924131265097422e-23,
        h: 13932808038412898e-23,
        l: 13758393268822045e-23,
        c: 13758393268822045e-23,
        v: "337140485"
      },
      {
        t: 1791367500,
        o: 13758393268822045e-23,
        h: 13758393268822045e-23,
        l: 13527381078450563e-23,
        c: 13527381078450563e-23,
        v: "609615775"
      },
      {
        t: 1791367800,
        o: 13527381078450563e-23,
        h: 15880385675170185e-23,
        l: 13471565639096034e-23,
        c: 14750005284264266e-23,
        v: "6701587075"
      }
    ],
    "15m": [
      {
        t: 1791260100,
        o: 279589934766799e-22,
        h: 9294260570866142e-23,
        l: 279589934766799e-22,
        c: 2939595174935649e-23,
        v: "197782367402"
      },
      {
        t: 1791261e3,
        o: 29395951750306015e-24,
        h: 30155854632689144e-24,
        l: 29395951750306015e-24,
        c: 30155854632689144e-24,
        v: "395061725"
      },
      {
        t: 1791261900,
        o: 3015585463344221e-23,
        h: 9718628201471758e-23,
        l: 3015585463344221e-23,
        c: 76985498852442e-21,
        v: "76454224846"
      },
      {
        t: 1791262800,
        o: 8328145555649363e-23,
        h: 8594302840796969e-23,
        l: 2800931383183178e-23,
        c: 38248962564534306e-24,
        v: "57290488192"
      },
      {
        t: 1791263700,
        o: 38248962565017796e-24,
        h: 38248962565017796e-24,
        l: 38030945757706776e-24,
        c: 38030945757706776e-24,
        v: "100145359"
      },
      {
        t: 1791266400,
        o: 38030945758784704e-24,
        h: 3867694163081273e-23,
        l: 38030945758784704e-24,
        c: 3867694163081273e-23,
        v: "295909614"
      },
      {
        t: 1791267300,
        o: 4251731017708457e-23,
        h: 4763312974274222e-23,
        l: 40850202254501984e-24,
        c: 44276736757522484e-24,
        v: "7086897128"
      },
      {
        t: 1791272700,
        o: 4427673675753831e-23,
        h: 4427673675753831e-23,
        l: 3970882290494357e-23,
        c: 3970882290494357e-23,
        v: "2000423077"
      },
      {
        t: 1791292500,
        o: 39708822905343355e-24,
        h: 39708822905343355e-24,
        l: 39701317897228376e-24,
        c: 39701317897228376e-24,
        v: "3378770"
      },
      {
        t: 1791296100,
        o: 3970131789724634e-23,
        h: 3970131789724634e-23,
        l: 38688883027736295e-24,
        c: 38688883027736295e-24,
        v: "458765503"
      },
      {
        t: 1791297e3,
        o: 3868888302816438e-23,
        h: 3868888302816438e-23,
        l: 3868323269525977e-23,
        c: 3868323269525977e-23,
        v: "2577076"
      },
      {
        t: 1791312300,
        o: 38683232696034367e-24,
        h: 38683232696034367e-24,
        l: 3804258921305711e-23,
        c: 3804258921305711e-23,
        v: "293423514"
      },
      {
        t: 1791322200,
        o: 38042589213987995e-24,
        h: 38042589213987995e-24,
        l: 38023911370530644e-24,
        c: 38023911370530644e-24,
        v: "8591628"
      },
      {
        t: 1791327600,
        o: 38023911371563163e-24,
        h: 38023911371563163e-24,
        l: 38005221878517357e-24,
        c: 38005221878517357e-24,
        v: "8599099"
      },
      {
        t: 1791334800,
        o: 49251031800684326e-24,
        h: 17572463698600577e-23,
        l: 4925103179958382e-23,
        c: 11683085469946845e-23,
        v: "132433301742"
      },
      {
        t: 1791335700,
        o: 11683085470088193e-23,
        h: 12964481740642387e-23,
        l: 7671649061264641e-23,
        c: 9300458893996615e-23,
        v: "35589502248"
      },
      {
        t: 1791336600,
        o: 9271650337091064e-23,
        h: 5911889757003219e-22,
        l: 8546890231569885e-23,
        c: 5320780012656606e-22,
        v: "949590649989"
      },
      {
        t: 1791337500,
        o: 5320780012656606e-22,
        h: 9751250471552627e-22,
        l: 3058368065466991e-22,
        c: 34681974599165515e-23,
        v: "1487220031994"
      },
      {
        t: 1791338400,
        o: 34681974599165515e-23,
        h: 9846269177584689e-22,
        l: 2676552434335414e-22,
        c: 6229639844763716e-22,
        v: "913986305911"
      },
      {
        t: 1791339300,
        o: 6229639844763716e-22,
        h: 7466752343777611e-22,
        l: 3630718199761341e-22,
        c: 6804661378614615e-22,
        v: "390191702438"
      },
      {
        t: 1791340200,
        o: 6799199511008955e-22,
        h: 9030073654443388e-22,
        l: 489373008480672e-21,
        c: 8009914581884903e-22,
        v: "332702324374"
      },
      {
        t: 1791341100,
        o: 8009914581884903e-22,
        h: 8112924537792374e-22,
        l: 4874723876856651e-22,
        c: 5404116587929772e-22,
        v: "136639992127"
      },
      {
        t: 1791342e3,
        o: 5404116587929772e-22,
        h: 7323901287625641e-22,
        l: 5279648454061243e-22,
        c: 6464011313594351e-22,
        v: "74989959237"
      },
      {
        t: 1791342900,
        o: 6464011313594351e-22,
        h: 6831172737933706e-22,
        l: 5462406116910992e-22,
        c: 6293698187899284e-22,
        v: "62433482631"
      },
      {
        t: 1791343800,
        o: 6293698187899284e-22,
        h: 6449762017122886e-22,
        l: 4123306064513212e-22,
        c: 4421148465131611e-22,
        v: "78768306674"
      },
      {
        t: 1791344700,
        o: 4421148465131611e-22,
        h: 4565849277266405e-22,
        l: 2777715394809947e-22,
        c: 2915740608497382e-22,
        v: "68599014016"
      },
      {
        t: 1791345600,
        o: 2915740608497382e-22,
        h: 3948762659162845e-22,
        l: 2915740608497382e-22,
        c: 3499327959693529e-22,
        v: "47401584393"
      },
      {
        t: 1791346500,
        o: 3499327959693529e-22,
        h: 39448389011638534e-23,
        l: 3485163998506715e-22,
        c: 37615226208704665e-23,
        v: "18543925874"
      },
      {
        t: 1791347400,
        o: 37615226208704665e-23,
        h: 37968369623994404e-23,
        l: 32195913545349804e-23,
        c: 32758537091326804e-23,
        v: "25578426168"
      },
      {
        t: 1791348300,
        o: 32758537091326804e-23,
        h: 3486878787915175e-22,
        l: 3064370715862693e-22,
        c: 3486878787915175e-22,
        v: "14780454184"
      },
      {
        t: 1791349200,
        o: 3486878787915175e-22,
        h: 3487730152300257e-22,
        l: 2994231842275743e-22,
        c: 2998770824200226e-22,
        v: "10573642868"
      },
      {
        t: 1791350100,
        o: 2998770824200226e-22,
        h: 2998770824200226e-22,
        l: 21339962648212794e-23,
        c: 22316452809740197e-23,
        v: "22175258474"
      },
      {
        t: 1791351e3,
        o: 22316452809740197e-23,
        h: 2243192177495156e-22,
        l: 19825793847194737e-23,
        c: 21552656924156278e-23,
        v: "14649115528"
      },
      {
        t: 1791351900,
        o: 21552656924156278e-23,
        h: 21552656924156278e-23,
        l: 18235843271853752e-23,
        c: 18235843271853752e-23,
        v: "8633631214"
      },
      {
        t: 1791352800,
        o: 18235843271853752e-23,
        h: 19478445654059063e-23,
        l: 1785081916141207e-22,
        c: 1786029815431085e-22,
        v: "6607397327"
      },
      {
        t: 1791353700,
        o: 1786029815431085e-22,
        h: 18694052662607763e-23,
        l: 17083613596646782e-23,
        c: 18064339195881896e-23,
        v: "6789305095"
      },
      {
        t: 1791354600,
        o: 18064339195881896e-23,
        h: 2106614586396387e-22,
        l: 17692846280054234e-23,
        c: 19865904945598669e-23,
        v: "14154294294"
      },
      {
        t: 1791355500,
        o: 19865904945598669e-23,
        h: 19865904945598669e-23,
        l: 1544975953854333e-22,
        c: 1593247209562264e-22,
        v: "9412128729"
      },
      {
        t: 1791356400,
        o: 1593247209562264e-22,
        h: 15959627894625325e-23,
        l: 15557148112724535e-23,
        c: 15557148112724535e-23,
        v: "1545417311"
      },
      {
        t: 1791357300,
        o: 15557148112724535e-23,
        h: 15557148112724535e-23,
        l: 12721752144781285e-23,
        c: 13090259770424462e-23,
        v: "8882640618"
      },
      {
        t: 1791358200,
        o: 13090259770424462e-23,
        h: 16156400686682106e-23,
        l: 13076910628082735e-23,
        c: 15712913152074937e-23,
        v: "11446445902"
      },
      {
        t: 1791359100,
        o: 15712913152074937e-23,
        h: 16019218572175693e-23,
        l: 14947773602690683e-23,
        c: 16019218572175693e-23,
        v: "3449779032"
      },
      {
        t: 179136e4,
        o: 16019218572175693e-23,
        h: 16327290045040976e-23,
        l: 1411695922354179e-22,
        c: 14535028493980088e-23,
        v: "5396463903"
      },
      {
        t: 1791360900,
        o: 14535028493980088e-23,
        h: 15778098894218313e-23,
        l: 13249805078024977e-23,
        c: 132868134141277e-21,
        v: "7569220417"
      },
      {
        t: 1791361800,
        o: 132868134141277e-21,
        h: 1427130002585704e-22,
        l: 13281668018834666e-23,
        c: 14248034767419117e-23,
        v: "1879537002"
      },
      {
        t: 1791362700,
        o: 14248034767419117e-23,
        h: 14780645848764636e-23,
        l: 1324671690450423e-22,
        c: 1477605099227472e-22,
        v: "4668417351"
      },
      {
        t: 1791363600,
        o: 1477605099227472e-22,
        h: 15856506849439127e-23,
        l: 1322080669596402e-22,
        c: 15856506849439127e-23,
        v: "8365883133"
      },
      {
        t: 1791364500,
        o: 1554836024402516e-22,
        h: 1554836024402516e-22,
        l: 14066484393833506e-23,
        c: 14976945160335374e-23,
        v: "5749321932"
      },
      {
        t: 1791365400,
        o: 14865100261150782e-23,
        h: 15378840871655644e-23,
        l: 14489449220382361e-23,
        c: 1512595819047186e-22,
        v: "2891609761"
      },
      {
        t: 1791366300,
        o: 1512595819047186e-22,
        h: 1512595819047186e-22,
        l: 1333577780185927e-22,
        c: 13924131265097422e-23,
        v: "4347682778"
      },
      {
        t: 1791367200,
        o: 13924131265097422e-23,
        h: 15880385675170185e-23,
        l: 13471565639096034e-23,
        c: 14750005284264266e-23,
        v: "7648343335"
      }
    ],
    "1h": [
      {
        t: 1791259200,
        o: 279589934766799e-22,
        h: 9718628201471758e-23,
        l: 279589934766799e-22,
        c: 76985498852442e-21,
        v: "274631653973"
      },
      {
        t: 1791262800,
        o: 8328145555649363e-23,
        h: 8594302840796969e-23,
        l: 2800931383183178e-23,
        c: 38030945757706776e-24,
        v: "57390633551"
      },
      {
        t: 1791266400,
        o: 38030945758784704e-24,
        h: 4763312974274222e-23,
        l: 38030945758784704e-24,
        c: 44276736757522484e-24,
        v: "7382806742"
      },
      {
        t: 179127e4,
        o: 4427673675753831e-23,
        h: 4427673675753831e-23,
        l: 3970882290494357e-23,
        c: 3970882290494357e-23,
        v: "2000423077"
      },
      {
        t: 1791291600,
        o: 39708822905343355e-24,
        h: 39708822905343355e-24,
        l: 39701317897228376e-24,
        c: 39701317897228376e-24,
        v: "3378770"
      },
      {
        t: 1791295200,
        o: 3970131789724634e-23,
        h: 3970131789724634e-23,
        l: 3868323269525977e-23,
        c: 3868323269525977e-23,
        v: "461342579"
      },
      {
        t: 1791309600,
        o: 38683232696034367e-24,
        h: 38683232696034367e-24,
        l: 3804258921305711e-23,
        c: 3804258921305711e-23,
        v: "293423514"
      },
      {
        t: 1791320400,
        o: 38042589213987995e-24,
        h: 38042589213987995e-24,
        l: 38023911370530644e-24,
        c: 38023911370530644e-24,
        v: "8591628"
      },
      {
        t: 1791327600,
        o: 38023911371563163e-24,
        h: 38023911371563163e-24,
        l: 38005221878517357e-24,
        c: 38005221878517357e-24,
        v: "8599099"
      },
      {
        t: 1791334800,
        o: 49251031800684326e-24,
        h: 9751250471552627e-22,
        l: 4925103179958382e-23,
        c: 34681974599165515e-23,
        v: "2604833485973"
      },
      {
        t: 1791338400,
        o: 34681974599165515e-23,
        h: 9846269177584689e-22,
        l: 2676552434335414e-22,
        c: 5404116587929772e-22,
        v: "1773520324850"
      },
      {
        t: 1791342e3,
        o: 5404116587929772e-22,
        h: 7323901287625641e-22,
        l: 2777715394809947e-22,
        c: 2915740608497382e-22,
        v: "284790762558"
      },
      {
        t: 1791345600,
        o: 2915740608497382e-22,
        h: 3948762659162845e-22,
        l: 2915740608497382e-22,
        c: 3486878787915175e-22,
        v: "106304390619"
      },
      {
        t: 1791349200,
        o: 3486878787915175e-22,
        h: 3487730152300257e-22,
        l: 18235843271853752e-23,
        c: 18235843271853752e-23,
        v: "56031648084"
      },
      {
        t: 1791352800,
        o: 18235843271853752e-23,
        h: 2106614586396387e-22,
        l: 1544975953854333e-22,
        c: 1593247209562264e-22,
        v: "36963125445"
      },
      {
        t: 1791356400,
        o: 1593247209562264e-22,
        h: 16156400686682106e-23,
        l: 12721752144781285e-23,
        c: 16019218572175693e-23,
        v: "25324282863"
      },
      {
        t: 179136e4,
        o: 16019218572175693e-23,
        h: 16327290045040976e-23,
        l: 1324671690450423e-22,
        c: 1477605099227472e-22,
        v: "19513638673"
      },
      {
        t: 1791363600,
        o: 1477605099227472e-22,
        h: 15856506849439127e-23,
        l: 1322080669596402e-22,
        c: 13924131265097422e-23,
        v: "21354497604"
      },
      {
        t: 1791367200,
        o: 13924131265097422e-23,
        h: 15880385675170185e-23,
        l: 13471565639096034e-23,
        c: 14750005284264266e-23,
        v: "7648343335"
      }
    ],
    "4h": [
      {
        t: 1791259200,
        o: 279589934766799e-22,
        h: 9718628201471758e-23,
        l: 279589934766799e-22,
        c: 3970882290494357e-23,
        v: "341405517343"
      },
      {
        t: 1791288e3,
        o: 39708822905343355e-24,
        h: 39708822905343355e-24,
        l: 3868323269525977e-23,
        c: 3868323269525977e-23,
        v: "464721349"
      },
      {
        t: 1791302400,
        o: 38683232696034367e-24,
        h: 38683232696034367e-24,
        l: 3804258921305711e-23,
        c: 3804258921305711e-23,
        v: "293423514"
      },
      {
        t: 1791316800,
        o: 38042589213987995e-24,
        h: 38042589213987995e-24,
        l: 38005221878517357e-24,
        c: 38005221878517357e-24,
        v: "17190727"
      },
      {
        t: 1791331200,
        o: 49251031800684326e-24,
        h: 9846269177584689e-22,
        l: 4925103179958382e-23,
        c: 2915740608497382e-22,
        v: "4663144573381"
      },
      {
        t: 1791345600,
        o: 2915740608497382e-22,
        h: 3948762659162845e-22,
        l: 12721752144781285e-23,
        c: 16019218572175693e-23,
        v: "224623447011"
      },
      {
        t: 179136e4,
        o: 16019218572175693e-23,
        h: 16327290045040976e-23,
        l: 1322080669596402e-22,
        c: 14750005284264266e-23,
        v: "48516479612"
      }
    ],
    "1d": [
      {
        t: 1791244800,
        o: 279589934766799e-22,
        h: 9718628201471758e-23,
        l: 279589934766799e-22,
        c: 38005221878517357e-24,
        v: "342180852933"
      },
      {
        t: 1791331200,
        o: 49251031800684326e-24,
        h: 9846269177584689e-22,
        l: 4925103179958382e-23,
        c: 14750005284264266e-23,
        v: "4936284500004"
      }
    ]
  },
  status: {
    env: "mainnet",
    program_id: "BackjMdXcpBCQtyGUEpCkjZpWJEwbDVw4eMA3UKY2b2F",
    rpc_url: "https://trybackers.com/v1/rpc",
    sol_usd: {
      price: 117.54214473,
      publish_time: 1791368039
    },
    params: {
      reward_bps: 1e3,
      hold_secs: 600,
      settle_window_secs: 1900800,
      min_hold_cents: 1e3,
      max_hold_cents: 1e6,
      min_payment_cents: 1e3,
      tier_caps_cents: [
        1e5,
        25e4,
        5e5,
        1e6
      ],
      tier_delivered_cents: [
        0,
        5e4,
        25e4,
        1e6
      ],
      strike_threshold: 3,
      max_active_holds: 3,
      first_ban_days: 30,
      repeat_ban_days: 90,
      daily_payout_cap_cents: 1e7,
      coin_daily_share_bps: 1e4,
      backer_daily_share_bps: 1e4,
      lock_buffer_bps: 1e3,
      relink_cooldown_hours: 24,
      pending_wait_days: 21,
      holds_per_day: null
    },
    protocol_fee_bps: 1e3,
    holds_paused: false,
    external_coins: true,
    payouts_paused: false,
    promo: {
      name: "first-send-2000",
      match_max_cents: 2500,
      budget_cents: 2e5,
      remaining_cents: 2e5,
      matches_sent: 0,
      per_recipient: null,
      started_at: 1791365816,
      offering: true
    }
  },
  personDetail: {
    recipient: {
      x_id: "1522646693514207232",
      handle: "sierracatalina",
      name: "\u26AA\uFE0F sierra catalina",
      avatar_url: "/assets/backers/person-1.jpg",
      banner_url: "/assets/backers/sierra-banner.jpg",
      bio: "data sovereignty is cool I guess | CEO @ourochat | prev @xAI @prontoAI",
      verified: true,
      instant_payouts: true
    },
    totals: {
      coins: 3,
      fees_lamports: "50572224940",
      fees_usd_cents: 594460,
      delivered_cents: 176100,
      rewards_cents: 17610,
      ready_cents: 319721,
      payments: 44,
      backers: 30
    },
    coins: [
      {
        mint: "CuEYhPvrm4wU52RANvCgmUS8f9hAaNN4rTwWN8LWv6KT",
        name: "OUROBOROS",
        symbol: "OUROCHAT",
        image_url: "/assets/backers/coin-0.jpg",
        description: "one login. every brain. the last AI account you\u2019ll ever need. your context, portable across any model.",
        recipient: {
          x_id: "1522646693514207232",
          handle: "sierracatalina",
          name: "\u26AA\uFE0F sierra catalina",
          avatar_url: "https://pbs.twimg.com/profile_images/2085184458945175552/ZqfVaidA_200x200.jpg",
          instant_payouts: true
        },
        launcher: "7PC4EESvTMSZGkkvQRoCmSYLL42vvXLnvEKosPhjQQeZ",
        links: {
          website: "https://trybackers.com/coin/CuEYhPvrm4wU52RANvCgmUS8f9hAaNN4rTwWN8LWv6KT",
          twitter: "https://x.com/sierracatalina",
          telegram: null
        },
        created_at: 1791260399,
        pool: {
          available_lamports: "31239689147",
          locked_lamports: "0",
          available_usd_cents: 367213,
          deliverable_cents: 303482,
          delivered_cents: 30800,
          reward_cents: 3080,
          fees_lamports: "34102963026",
          fees_usd_cents: 400870,
          holds_count: 14,
          waiting_count: 0
        },
        market: {
          price_sol: 14241102657881012e-23,
          market_cap_usd_cents: 1674e3,
          change_24h_bps: 25864,
          volume_24h_lamports: "4937975832842",
          trades_24h: 10086,
          curve_progress_bps: 1e4,
          graduated: true,
          last_trade_at: 1791368082,
          sparkline: [
            39701317897228376e-24,
            38688883027736295e-24,
            3868323269525977e-23,
            3804258921305711e-23,
            38023911370530644e-24,
            38005221878517357e-24,
            9300458893996615e-23,
            34681974599165515e-23,
            6804661378614615e-22,
            5404116587929772e-22,
            6293698187899284e-22,
            2915740608497382e-22,
            37615226208704665e-23,
            3486878787915175e-22,
            22316452809740197e-23,
            18235843271853752e-23,
            18064339195881896e-23,
            1593247209562264e-22,
            13090259770424462e-23,
            16019218572175693e-23,
            132868134141277e-21,
            1477605099227472e-22,
            14976945160335374e-23,
            13924131265097422e-23,
            14241102657881012e-23
          ]
        },
        featured: null,
        launched_on: "backers",
        tradable: true
      },
      {
        mint: "EdAVcqLPg5gwDqjuPBghFbLr4q7SzrrSGHYq7nyfdQwP",
        name: "Sierra Catalina",
        symbol: "SIERRA",
        image_url: "/assets/backers/sierra-coin-1.jpg",
        description: "Sierra is owed tons of X Money that has been frozen she\u2019s been posting about. Let\u2019s get her some money!",
        recipient: {
          x_id: "1522646693514207232",
          handle: "sierracatalina",
          name: "\u26AA\uFE0F sierra catalina",
          avatar_url: "https://pbs.twimg.com/profile_images/2085184458945175552/ZqfVaidA_200x200.jpg",
          instant_payouts: true
        },
        launcher: "9eJGsM7UnyEQXi8n3enXrN58ADsyjXFCzJAwvQwYLFj5",
        links: {
          website: "https://trybackers.com/coin/EdAVcqLPg5gwDqjuPBghFbLr4q7SzrrSGHYq7nyfdQwP",
          twitter: "https://x.com/sierracatalina",
          telegram: null
        },
        created_at: 1791186285,
        pool: {
          available_lamports: "1574930016",
          locked_lamports: "1499440356",
          available_usd_cents: 18512,
          deliverable_cents: 15299,
          delivered_cents: 145300,
          reward_cents: 14530,
          fees_lamports: "16372462888",
          fees_usd_cents: 192453,
          holds_count: 41,
          waiting_count: 0
        },
        market: {
          price_sol: 5752647365549357e-23,
          market_cap_usd_cents: 676207,
          change_24h_bps: -7207,
          volume_24h_lamports: "451007783549",
          trades_24h: 782,
          curve_progress_bps: 1e4,
          graduated: true,
          last_trade_at: 1791367253,
          sparkline: [
            2032921431825419e-22,
            20566565728541168e-23,
            19693202288974988e-23,
            18616009333718422e-23,
            16599624241401073e-23,
            16062232511112546e-23,
            1599340753892853e-22,
            1591529807543539e-22,
            1576358567233559e-22,
            1448943169081978e-22,
            13579041967989258e-23,
            16505501236450706e-23,
            1402646660529927e-22,
            11312378321427901e-23,
            10799742602355992e-23,
            9095067681769814e-23,
            8328815890299168e-23,
            8180441863364316e-23,
            7608377821623569e-23,
            7604895007284764e-23,
            7154654275028358e-23,
            4982776645375609e-23,
            4982354897438708e-23,
            47940471895953354e-24,
            4568770472084449e-23,
            11942913046038292e-23,
            12159501489306016e-23,
            9135046462007825e-23,
            7950340519050406e-23,
            8378601372605426e-23,
            879628675839585e-22,
            10479036086552926e-23,
            14087100306292987e-23,
            1232551472087378e-22,
            10612101673310175e-23,
            9569117433228575e-23,
            8884215869175148e-23,
            6431614047841792e-23,
            639504274108525e-22,
            6387538769643841e-23,
            6363968861139037e-23,
            6327339240195976e-23,
            582016184943941e-22,
            5752647365549357e-23
          ]
        },
        featured: null,
        launched_on: "backers",
        tradable: true
      },
      {
        mint: "Ce6dfxN5VTHmGS9FAWu1ndBBnBeTXEssidSkBtMsZTov",
        name: "The Context Layer",
        symbol: "TCL",
        image_url: "/assets/backers/sierra-coin-2.jpg",
        description: "a user-controlled contract for moving the minimum useful context across models, agents & applications.",
        recipient: {
          x_id: "1522646693514207232",
          handle: "sierracatalina",
          name: "\u26AA\uFE0F sierra catalina",
          avatar_url: "https://pbs.twimg.com/profile_images/2085184458945175552/ZqfVaidA_200x200.jpg",
          instant_payouts: true
        },
        launcher: "7PC4EESvTMSZGkkvQRoCmSYLL42vvXLnvEKosPhjQQeZ",
        links: {
          website: "https://trybackers.com/coin/Ce6dfxN5VTHmGS9FAWu1ndBBnBeTXEssidSkBtMsZTov",
          twitter: "https://x.com/sierracatalina",
          telegram: null
        },
        created_at: 1791338992,
        pool: {
          available_lamports: "96799026",
          locked_lamports: "0",
          available_usd_cents: 1137,
          deliverable_cents: 940,
          delivered_cents: 0,
          reward_cents: 0,
          fees_lamports: "96799026",
          fees_usd_cents: 1137,
          holds_count: 0,
          waiting_count: 0
        },
        market: {
          price_sol: 3422490567081381e-23,
          market_cap_usd_cents: 402304,
          change_24h_bps: 2241,
          volume_24h_lamports: "15730498316",
          trades_24h: 54,
          curve_progress_bps: 1301,
          graduated: false,
          last_trade_at: 1791355203,
          sparkline: [
            33962417848059816e-24,
            3433768197183894e-23,
            3449241863390577e-23,
            34078162184468345e-24,
            3407949839216715e-23,
            34004474050678044e-24,
            3422490567081381e-23
          ]
        },
        featured: null,
        launched_on: "backers",
        tradable: true
      }
    ]
  }
};

// react/components/backers/Icon.tsx
import { Fragment, jsx as jsx3, jsxs } from "react/jsx-runtime";
function Icon({ name, size = 20 }) {
  const icons = {
    search: /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx3("circle", { cx: "10.5", cy: "10.5", r: "6.5" }),
      /* @__PURE__ */ jsx3("path", { d: "m16 16 4.5 4.5" })
    ] }),
    wallet: /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx3("path", { d: "M20 8H5a2 2 0 0 1 0-4h13v4M5 8H3v12h18V8h-1Z" }),
      /* @__PURE__ */ jsx3("path", { d: "M21 12h-6v4h6M17 14h.01" })
    ] }),
    plus: /* @__PURE__ */ jsx3("path", { d: "M12 5v14M5 12h14" }),
    home: /* @__PURE__ */ jsx3("path", { d: "m3 10 9-7 9 7v11h-7v-7h-4v7H3Z" }),
    bolt: /* @__PURE__ */ jsx3("path", { d: "m13 2-9 12h7l-1 8 10-12h-7Z" }),
    activity: /* @__PURE__ */ jsx3("path", { d: "M3 12h4l3-8 4 16 3-8h4" }),
    person: /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx3("circle", { cx: "12", cy: "7", r: "4" }),
      /* @__PURE__ */ jsx3("path", { d: "M4 21v-3a8 8 0 0 1 16 0v3" })
    ] }),
    copy: /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx3("rect", { x: "8", y: "8", width: "12", height: "12", rx: "2" }),
      /* @__PURE__ */ jsx3("path", { d: "M16 8V4H4v12h4" })
    ] }),
    arrow: /* @__PURE__ */ jsx3("path", { d: "M4 12h16m-6-6 6 6-6 6" }),
    coin: /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx3("circle", { cx: "12", cy: "12", r: "9" }),
      /* @__PURE__ */ jsx3("path", { d: "M12 6v12m3-10h-5a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H9" })
    ] }),
    x: /* @__PURE__ */ jsx3("path", { d: "M4 3h4l12 18h-4L4 3ZM4 21 20 3" }),
    check: /* @__PURE__ */ jsx3("path", { d: "m5 12 4 4L19 6" }),
    external: /* @__PURE__ */ jsx3("path", { d: "M14 3h7v7m0-7L10 14M10 3H3v18h18v-7" })
  };
  return /* @__PURE__ */ jsx3(
    "svg",
    {
      className: "b-icon",
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      children: icons[name] || icons.coin
    }
  );
}

// react/components/backers/Avatar.tsx
import { jsx as jsx4 } from "react/jsx-runtime";
function Avatar({
  person,
  size = 36
}) {
  return person.avatar_url ? /* @__PURE__ */ jsx4(
    "img",
    {
      className: "b-avatar",
      src: asset(person.avatar_url),
      alt: "",
      width: size,
      height: size,
      style: { width: size, height: size }
    }
  ) : /* @__PURE__ */ jsx4(
    "span",
    {
      className: "b-avatar b-initial",
      style: { width: size, height: size, fontSize: Math.max(10, size * 0.42) },
      children: (person.handle || "S")[0].toUpperCase()
    }
  );
}

// react/components/backers/Receipt.tsx
import { jsx as jsx5, jsxs as jsxs2 } from "react/jsx-runtime";
function Receipt({ payment = snapshot_default.events[0] }) {
  return /* @__PURE__ */ jsxs2("figure", { className: "b-receipt", children: [
    /* @__PURE__ */ jsxs2("div", { className: "b-receipt-paper", children: [
      /* @__PURE__ */ jsxs2("div", { className: "b-between b-small", children: [
        /* @__PURE__ */ jsxs2("strong", { className: "b-inline", children: [
          /* @__PURE__ */ jsx5(Icon, { name: "x", size: 14 }),
          " Money"
        ] }),
        /* @__PURE__ */ jsx5("span", { className: "b-completed", children: "\u2713 Completed" })
      ] }),
      /* @__PURE__ */ jsxs2("p", { className: "b-muted b-sent", children: [
        "@",
        payment.backer,
        " sent"
      ] }),
      /* @__PURE__ */ jsx5("p", { className: "b-display b-receipt-number", children: money(payment.paid_cents) }),
      /* @__PURE__ */ jsxs2("p", { className: "b-inline b-recipient", children: [
        /* @__PURE__ */ jsx5(Avatar, { person: { handle: payment.recipient }, size: 24 }),
        " to",
        " ",
        /* @__PURE__ */ jsxs2("strong", { children: [
          "@",
          payment.recipient
        ] })
      ] }),
      /* @__PURE__ */ jsx5("div", { className: "b-receipt-divider" }),
      /* @__PURE__ */ jsx5("p", { className: "b-muted b-small", children: "Backers paid back" }),
      /* @__PURE__ */ jsx5("p", { className: "b-display b-receipt-number b-green", children: money(payment.paid_cents + payment.reward_cents) }),
      /* @__PURE__ */ jsx5("p", { className: "b-muted b-small", children: "in SOL, from the coin\u2019s pool" }),
      /* @__PURE__ */ jsxs2("span", { className: "b-stamp", children: [
        /* @__PURE__ */ jsx5("strong", { className: "b-display", children: "+10%" }),
        /* @__PURE__ */ jsx5("span", { children: "BONUS" })
      ] })
    ] }),
    /* @__PURE__ */ jsx5("figcaption", { children: "Latest payment, 2h ago" })
  ] });
}

// react/components/backers/BackersHero.tsx
import { jsx as jsx6, jsxs as jsxs3 } from "react/jsx-runtime";
function BackersHero(props = {}) {
  return /* @__PURE__ */ jsx6(Scope, { ...props, name: "BackersHero", children: /* @__PURE__ */ jsxs3("section", { className: "b-hero", children: [
    /* @__PURE__ */ jsxs3("div", { children: [
      /* @__PURE__ */ jsx6("h1", { className: "b-display", children: "Back anyone on X." }),
      /* @__PURE__ */ jsx6("p", { children: "Coins whose trading fees pay real people on X. Send them money with X Money \u2014 get it back +10% in SOL." }),
      /* @__PURE__ */ jsxs3("div", { className: "b-hero-buttons", children: [
        /* @__PURE__ */ jsx6(Button, { target: "CoinMetadataForm", variant: "primary b-large", children: "Launch a coin" }),
        /* @__PURE__ */ jsx6(Button, { target: "CoinExplorer", variant: "secondary b-large", children: "Explore coins" })
      ] })
    ] }),
    /* @__PURE__ */ jsx6("div", { className: "b-hero-receipt", children: /* @__PURE__ */ jsx6(Receipt, {}) })
  ] }) });
}

// react/components/backers/LatestPaymentCard.tsx
import { jsx as jsx7 } from "react/jsx-runtime";
function LatestPaymentCard(props = {}) {
  return /* @__PURE__ */ jsx7(Scope, { ...props, name: "LatestPaymentCard", children: /* @__PURE__ */ jsx7(Receipt, { payment: props.payment }) });
}

// react/components/backers/Metric.tsx
import { jsx as jsx8, jsxs as jsxs4 } from "react/jsx-runtime";
function Metric({
  label,
  value,
  green = false,
  sub
}) {
  return /* @__PURE__ */ jsxs4("div", { children: [
    /* @__PURE__ */ jsx8("dt", { children: label }),
    /* @__PURE__ */ jsx8("dd", { className: green ? "b-green" : "", children: value }),
    sub && /* @__PURE__ */ jsx8("small", { children: sub })
  ] });
}

// react/components/backers/ProtocolStats.tsx
import { jsx as jsx9, jsxs as jsxs5 } from "react/jsx-runtime";
function ProtocolStats(props = {}) {
  const s = snapshot_default.stats;
  return /* @__PURE__ */ jsx9(Scope, { ...props, name: "ProtocolStats", children: /* @__PURE__ */ jsxs5("dl", { className: "b-stats", children: [
    /* @__PURE__ */ jsx9(
      Metric,
      {
        label: "SingleSpark to people on X",
        value: compact(s.delivered_cents),
        green: true
      }
    ),
    /* @__PURE__ */ jsx9(
      Metric,
      {
        label: "Bonuses to backers",
        value: compact(s.rewards_cents + s.matches_cents),
        green: true
      }
    ),
    /* @__PURE__ */ jsx9(Metric, { label: "Coins launched", value: s.coins_launched }),
    /* @__PURE__ */ jsx9(
      Metric,
      {
        label: "Volume",
        value: compact(
          Number(s.volume_total_lamports) / 1e9 * s.sol_usd * 100
        )
      }
    )
  ] }) });
}

// react/components/backers/Go.tsx
import { useContext as useContext2 } from "react";
import { jsx as jsx10 } from "react/jsx-runtime";
function Go({
  children,
  target,
  className = ""
}) {
  const { onNavigate } = useContext2(Navigation);
  return /* @__PURE__ */ jsx10(
    "button",
    {
      type: "button",
      className: `b-link ${className}`,
      onClick: () => onNavigate?.(target),
      children
    }
  );
}

// react/components/backers/CoinImage.tsx
import { jsx as jsx11 } from "react/jsx-runtime";
function CoinImage({
  coin,
  size = 48
}) {
  return /* @__PURE__ */ jsx11(
    "img",
    {
      className: "b-coin-image",
      src: asset(coin.image_url),
      alt: "",
      width: size,
      height: size,
      style: { width: size, height: size }
    }
  );
}

// react/components/backers/Sparkline.tsx
import { jsx as jsx12 } from "react/jsx-runtime";
function Sparkline({ coin }) {
  const values = coin.market.sparkline, min = Math.min(...values), max = Math.max(...values);
  return /* @__PURE__ */ jsx12(
    "svg",
    {
      className: "b-sparkline",
      viewBox: "0 0 300 40",
      preserveAspectRatio: "none",
      "aria-label": "24 hour price history",
      children: /* @__PURE__ */ jsx12(
        "polyline",
        {
          points: values.map(
            (n, i) => `${i / Math.max(1, values.length - 1) * 300},${36 - (n - min) / (max - min || 1) * 32}`
          ).join(" "),
          fill: "none",
          stroke: coin.market.change_24h_bps < 0 ? "#ff4f5a" : "#00ba7c",
          strokeWidth: "1.5",
          vectorEffect: "non-scaling-stroke"
        }
      )
    }
  );
}

// react/components/backers/Progress.tsx
import { jsx as jsx13, jsxs as jsxs6 } from "react/jsx-runtime";
function Progress({ coin = snapshot_default.coins[0] }) {
  return coin.market.graduated ? /* @__PURE__ */ jsx13("span", { className: "b-badge b-blue", children: "\u2713 Graduated" }) : /* @__PURE__ */ jsxs6("div", { className: "b-progress-row", children: [
    /* @__PURE__ */ jsx13("span", { children: "Curve" }),
    /* @__PURE__ */ jsx13("div", { className: "b-progress", children: /* @__PURE__ */ jsx13("i", { style: { width: `${coin.market.curve_progress_bps / 100}%` } }) }),
    /* @__PURE__ */ jsxs6("strong", { children: [
      (coin.market.curve_progress_bps / 100).toFixed(1),
      "%"
    ] })
  ] });
}

// react/components/backers/CoinCardBody.tsx
import { jsx as jsx14, jsxs as jsxs7 } from "react/jsx-runtime";
function CoinCardBody({ coin = snapshot_default.coins[0] }) {
  const change = coin.market.change_24h_bps / 100;
  return /* @__PURE__ */ jsxs7("article", { className: "b-card b-coin-card", children: [
    /* @__PURE__ */ jsxs7("div", { className: "b-row b-start", children: [
      /* @__PURE__ */ jsx14(CoinImage, { coin }),
      /* @__PURE__ */ jsxs7("div", { className: "b-grow", children: [
        /* @__PURE__ */ jsx14("h3", { children: /* @__PURE__ */ jsx14(Go, { target: "CoinHeader", children: coin.name }) }),
        /* @__PURE__ */ jsxs7("p", { className: "b-muted b-small", children: [
          "$",
          coin.symbol
        ] })
      ] }),
      /* @__PURE__ */ jsxs7("div", { className: "b-right", children: [
        /* @__PURE__ */ jsx14("strong", { children: compact(coin.market.market_cap_usd_cents) }),
        /* @__PURE__ */ jsxs7("p", { className: `b-small ${change < 0 ? "b-red" : "b-green"}`, children: [
          change > 0 ? "+" : "",
          change.toFixed(1),
          "%"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs7("div", { className: "b-between b-small b-muted", children: [
      /* @__PURE__ */ jsxs7("span", { className: "b-inline", children: [
        /* @__PURE__ */ jsx14(Avatar, { person: coin.recipient, size: 20 }),
        "Pays ",
        /* @__PURE__ */ jsxs7(Go, { target: "PersonHeader", children: [
          "@",
          coin.recipient.handle
        ] }),
        /* @__PURE__ */ jsx14("span", { className: "b-green", children: /* @__PURE__ */ jsx14(Icon, { name: "bolt", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxs7("span", { className: "b-tiny", children: [
        "24h vol",
        " ",
        /* @__PURE__ */ jsx14("strong", { children: compact(
          Number(coin.market.volume_24h_lamports) / 1e9 * snapshot_default.stats.sol_usd * 100
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsx14(Sparkline, { coin }),
    /* @__PURE__ */ jsx14(Progress, { coin }),
    /* @__PURE__ */ jsxs7("div", { className: "b-coin-bottom", children: [
      /* @__PURE__ */ jsxs7("span", { children: [
        /* @__PURE__ */ jsx14("strong", { className: "b-green", children: compact(coin.pool.deliverable_cents) }),
        " ",
        /* @__PURE__ */ jsx14("span", { className: "b-muted", children: "ready to back" })
      ] }),
      /* @__PURE__ */ jsxs7("small", { className: "b-muted", children: [
        "Fees earned ",
        /* @__PURE__ */ jsx14("strong", { children: compact(coin.pool.fees_usd_cents) })
      ] })
    ] })
  ] });
}

// react/components/backers/CoinCard.tsx
import { jsx as jsx15 } from "react/jsx-runtime";
function CoinCard(props = {}) {
  return /* @__PURE__ */ jsx15(Scope, { ...props, name: "CoinCard", children: /* @__PURE__ */ jsx15(CoinCardBody, { coin: props.coin }) });
}

// react/components/backers/BondingProgress.tsx
import { jsx as jsx16 } from "react/jsx-runtime";
function BondingProgress(props = {}) {
  return /* @__PURE__ */ jsx16(Scope, { ...props, name: "BondingProgress", children: /* @__PURE__ */ jsx16(Progress, { coin: props.coin }) });
}

// react/components/backers/Instant.tsx
import { jsx as jsx17, jsxs as jsxs8 } from "react/jsx-runtime";
function Instant() {
  return /* @__PURE__ */ jsxs8("span", { className: "b-badge b-instant", children: [
    /* @__PURE__ */ jsx17(Icon, { name: "bolt", size: 12 }),
    "Instant payouts"
  ] });
}

// react/components/backers/BountyBody.tsx
import { jsx as jsx18, jsxs as jsxs9 } from "react/jsx-runtime";
function BountyBody({ coin = snapshot_default.coins[0] }) {
  return /* @__PURE__ */ jsxs9("article", { className: "b-card b-stack b-bounty", children: [
    /* @__PURE__ */ jsxs9("div", { className: "b-row", children: [
      /* @__PURE__ */ jsx18(Avatar, { person: coin.recipient, size: 40 }),
      /* @__PURE__ */ jsxs9("div", { children: [
        /* @__PURE__ */ jsx18("strong", { children: /* @__PURE__ */ jsx18(Go, { target: "PersonHeader", children: coin.recipient.name }) }),
        /* @__PURE__ */ jsxs9("p", { className: "b-muted b-small", children: [
          "@",
          coin.recipient.handle
        ] })
      ] })
    ] }),
    coin.recipient.instant_payouts && /* @__PURE__ */ jsx18(Instant, {}),
    /* @__PURE__ */ jsxs9("p", { className: "b-row b-small", children: [
      /* @__PURE__ */ jsx18("span", { className: "b-muted", children: "via" }),
      /* @__PURE__ */ jsx18(CoinImage, { coin, size: 36 }),
      /* @__PURE__ */ jsx18(Go, { target: "CoinHeader", children: coin.name }),
      " ",
      /* @__PURE__ */ jsxs9("span", { className: "b-muted", children: [
        "$",
        coin.symbol
      ] })
    ] }),
    /* @__PURE__ */ jsxs9("dl", { className: "b-grid-2", children: [
      /* @__PURE__ */ jsx18(Metric, { label: "Pay up to", value: money(coin.pool.deliverable_cents) }),
      /* @__PURE__ */ jsx18(
        Metric,
        {
          label: "Earn up to",
          value: "+" + money(Math.floor(coin.pool.deliverable_cents * 0.1)),
          green: true
        }
      )
    ] }),
    /* @__PURE__ */ jsx18(Button, { target: "BackForm", variant: "primary b-block", children: "Claim" })
  ] });
}

// react/components/backers/BountyCard.tsx
import { jsx as jsx19 } from "react/jsx-runtime";
function BountyCard(props = {}) {
  return /* @__PURE__ */ jsx19(Scope, { ...props, name: "BountyCard", children: /* @__PURE__ */ jsx19(BountyBody, { coin: props.coin }) });
}

// react/components/backers/Verified.tsx
import { jsx as jsx20, jsxs as jsxs10 } from "react/jsx-runtime";
function Verified() {
  return /* @__PURE__ */ jsxs10(
    "svg",
    {
      className: "b-verified",
      viewBox: "0 0 24 24",
      width: "16",
      height: "16",
      "aria-label": "verified",
      children: [
        /* @__PURE__ */ jsx20(
          "path",
          {
            fill: "currentColor",
            d: "m12 1 3 2 3.6.4 1.4 3.3 3 2.3-1 3.5.4 3.6-3.3 1.5L17 21l-3.6-.2L10 23l-2.5-2.7-3.5-1L3 15.8.5 13l1.8-3.2L2 6.2l3.5-1.3L8 2Z"
          }
        ),
        /* @__PURE__ */ jsx20("path", { fill: "none", stroke: "#fff", strokeWidth: "2", d: "m7 12 3 3 7-7" })
      ]
    }
  );
}

// react/components/backers/RankBody.tsx
import { jsx as jsx21, jsxs as jsxs11 } from "react/jsx-runtime";
function RankBody({
  person = snapshot_default.people[0],
  rank = 1,
  full = true
}) {
  return /* @__PURE__ */ jsxs11("div", { className: "b-rank", children: [
    /* @__PURE__ */ jsx21("span", { className: "b-rank-number", children: rank }),
    /* @__PURE__ */ jsx21(Avatar, { person, size: full ? 40 : 36 }),
    /* @__PURE__ */ jsxs11("div", { className: "b-grow", children: [
      /* @__PURE__ */ jsxs11("span", { className: "b-inline", children: [
        /* @__PURE__ */ jsx21("strong", { children: /* @__PURE__ */ jsx21(Go, { target: "PersonHeader", children: person.name }) }),
        person.verified && /* @__PURE__ */ jsx21(Verified, {}),
        person.instant_payouts && /* @__PURE__ */ jsx21("span", { className: "b-green", children: /* @__PURE__ */ jsx21(Icon, { name: "bolt", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxs11("small", { className: "b-muted", children: [
        "@",
        person.handle,
        " \xB7 ",
        person.coins,
        " coin",
        person.coins > 1 ? "s" : ""
      ] })
    ] }),
    /* @__PURE__ */ jsxs11("div", { className: "b-right", children: [
      /* @__PURE__ */ jsx21("small", { className: "b-muted", children: "Fees earned" }),
      /* @__PURE__ */ jsx21("strong", { className: "b-green", children: compact(person.fees_usd_cents) })
    ] }),
    full && /* @__PURE__ */ jsxs11("div", { className: "b-right b-rank-received", children: [
      /* @__PURE__ */ jsx21("small", { className: "b-muted", children: "Received" }),
      /* @__PURE__ */ jsx21("strong", { children: compact(person.delivered_cents) })
    ] })
  ] });
}

// react/components/backers/PersonRankRow.tsx
import { jsx as jsx22 } from "react/jsx-runtime";
function PersonRankRow(props = {}) {
  return /* @__PURE__ */ jsx22(Scope, { ...props, name: "PersonRankRow", children: /* @__PURE__ */ jsx22(RankBody, { person: props.person, rank: props.rank }) });
}

// react/components/backers/HowBody.tsx
import { jsx as jsx23, jsxs as jsxs12 } from "react/jsx-runtime";
function HowBody() {
  return /* @__PURE__ */ jsxs12("section", { className: "b-how", children: [
    /* @__PURE__ */ jsx23("h2", { className: "b-display", children: "How it works" }),
    /* @__PURE__ */ jsx23("ol", { children: howSteps.map(([icon, title, text], index) => /* @__PURE__ */ jsxs12("li", { className: "b-card b-stack", children: [
      /* @__PURE__ */ jsxs12("div", { className: "b-between", children: [
        /* @__PURE__ */ jsx23("span", { className: "b-how-icon", children: /* @__PURE__ */ jsx23(Icon, { name: icon }) }),
        /* @__PURE__ */ jsx23("span", { className: "b-display b-step-count", children: index + 1 })
      ] }),
      /* @__PURE__ */ jsx23("h3", { children: title }),
      /* @__PURE__ */ jsx23("p", { className: "b-muted", children: text })
    ] }, title)) }),
    /* @__PURE__ */ jsx23(Go, { target: "ArticleLayout", className: "b-blue-text", children: "Read the full guide and FAQ" })
  ] });
}

// react/components/backers/HowItWorksSteps.tsx
import { jsx as jsx24 } from "react/jsx-runtime";
function HowItWorksSteps(props = {}) {
  return /* @__PURE__ */ jsx24(Scope, { ...props, name: "HowItWorksSteps", children: /* @__PURE__ */ jsx24(HowBody, {}) });
}

// react/components/backers/GlobalSearchBody.tsx
import { useState } from "react";

// react/components/backers/Search.tsx
import { jsx as jsx25, jsxs as jsxs13 } from "react/jsx-runtime";
function Search({
  placeholder,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxs13("label", { className: "b-search", children: [
    /* @__PURE__ */ jsx25(Icon, { name: "search", size: 16 }),
    /* @__PURE__ */ jsx25(
      "input",
      {
        type: "search",
        placeholder,
        "aria-label": placeholder,
        value,
        onChange: (event) => onChange(event.target.value)
      }
    )
  ] });
}

// react/components/backers/GlobalSearchBody.tsx
import { jsx as jsx26, jsxs as jsxs14 } from "react/jsx-runtime";
function GlobalSearchBody() {
  const [query, setQuery] = useState(""), [closed, setClosed] = useState(false), matches = snapshot_default.people.filter(
    (p) => (p.name + " " + p.handle).toLowerCase().includes(query.toLowerCase())
  );
  return /* @__PURE__ */ jsxs14(
    "div",
    {
      className: "b-global-search",
      onKeyDown: (event) => {
        if (event.key === "Escape") setClosed(true);
      },
      children: [
        /* @__PURE__ */ jsx26(
          Search,
          {
            placeholder: "Coins or @people",
            value: query,
            onChange: (value) => {
              setQuery(value);
              setClosed(false);
            }
          }
        ),
        query && !closed && /* @__PURE__ */ jsxs14("div", { className: "b-card b-search-results", children: [
          matches.map((person, index) => /* @__PURE__ */ jsx26(
            RankBody,
            {
              person,
              rank: index + 1,
              full: false
            },
            person.handle
          )),
          matches.length === 0 && /* @__PURE__ */ jsx26("p", { className: "b-search-empty", children: "No matching people." })
        ] })
      ]
    }
  );
}

// react/components/backers/GlobalSearch.tsx
import { jsx as jsx27 } from "react/jsx-runtime";
function GlobalSearch(props = {}) {
  return /* @__PURE__ */ jsx27(Scope, { ...props, name: "GlobalSearch", children: /* @__PURE__ */ jsx27(GlobalSearchBody, {}) });
}

// react/components/backers/Logo.tsx
import { jsx as jsx28, jsxs as jsxs15 } from "react/jsx-runtime";
function Logo() {
  return /* @__PURE__ */ jsxs15("span", { className: "b-logo", children: [
    /* @__PURE__ */ jsxs15("svg", { width: "32", height: "32", viewBox: "0 0 32 32", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx28("rect", { width: "32", height: "32", rx: "9", fill: "#00ba7c" }),
      /* @__PURE__ */ jsx28(
        "path",
        {
          fill: "#000",
          fillRule: "evenodd",
          d: "M6.5 8H15c3.5 0 5.4 1.7 5.4 4.4 0 1.7-.9 3-2.4 3.5 2 .6 3.2 2.1 3.2 4.3 0 3.1-2.3 4.8-5.9 4.8H6.5Zm4.3 3.2v3.4h3.9c1.3 0 2-.6 2-1.7s-.7-1.7-2-1.7Zm0 6.3v4.4h4.3c1.5 0 2.3-.8 2.3-2.2s-.8-2.2-2.3-2.2Z"
        }
      ),
      /* @__PURE__ */ jsx28(
        "path",
        {
          fill: "#000",
          d: "M23.4 5.6h2.6v2.6h2.6v2.6H26v2.6h-2.6v-2.6h-2.6V8.2h2.6Z"
        }
      )
    ] }),
    /* @__PURE__ */ jsx28("span", { children: "Backers" })
  ] });
}

// react/components/backers/BackersHeader.tsx
import { jsx as jsx29, jsxs as jsxs16 } from "react/jsx-runtime";
function BackersHeader(props = {}) {
  return /* @__PURE__ */ jsx29(Scope, { ...props, name: "BackersHeader", children: /* @__PURE__ */ jsxs16("header", { className: "b-header", children: [
    /* @__PURE__ */ jsx29(Go, { target: "BackersHero", className: "b-logo-link", children: /* @__PURE__ */ jsx29(Logo, {}) }),
    /* @__PURE__ */ jsx29("nav", { children: [
      ["Explore", "CoinExplorer"],
      ["Bounties", "BountyExplorer"],
      ["People", "PeopleRanking"],
      ["Activity", "ActivityFeed"],
      ["Launch", "LaunchModeTabs"],
      ["Docs", "ArticleLayout"]
    ].map(([label, target]) => /* @__PURE__ */ jsx29(Go, { target, children: label }, target)) }),
    /* @__PURE__ */ jsxs16("div", { className: "b-header-actions", children: [
      /* @__PURE__ */ jsx29("div", { className: "b-header-search", children: /* @__PURE__ */ jsx29(GlobalSearchBody, {}) }),
      /* @__PURE__ */ jsxs16(Button, { target: "WalletDialog", variant: "secondary b-wallet-button", children: [
        /* @__PURE__ */ jsx29(Icon, { name: "wallet", size: 16 }),
        /* @__PURE__ */ jsx29("span", { children: "Connect wallet" })
      ] }),
      /* @__PURE__ */ jsxs16(Button, { action: "mock-signin", variant: "inverse", children: [
        "Sign in ",
        /* @__PURE__ */ jsx29(Icon, { name: "x", size: 14 })
      ] })
    ] })
  ] }) });
}

// react/components/backers/MobileNavBody.tsx
import { useContext as useContext3 } from "react";
import { jsx as jsx30, jsxs as jsxs17 } from "react/jsx-runtime";
function MobileNavBody() {
  const { onNavigate } = useContext3(Navigation);
  return /* @__PURE__ */ jsx30("nav", { className: "b-mobile-nav", children: [
    ["home", "Explore", "CoinExplorer"],
    ["coin", "Bounties", "BountyExplorer"],
    ["plus", "", "LaunchModeTabs"],
    ["activity", "Activity", "ActivityFeed"],
    ["person", "Account", "XSignInGate"]
  ].map(([icon, label, target]) => /* @__PURE__ */ jsxs17(
    "button",
    {
      type: "button",
      className: icon === "plus" ? "b-launch-round" : "",
      "aria-label": label || "Launch a coin",
      onClick: () => onNavigate?.(target),
      children: [
        /* @__PURE__ */ jsx30(Icon, { name: icon, size: icon === "plus" ? 28 : 22 }),
        label && /* @__PURE__ */ jsx30("span", { children: label })
      ]
    },
    target
  )) });
}

// react/components/backers/BackersMobileNav.tsx
import { jsx as jsx31 } from "react/jsx-runtime";
function BackersMobileNav(props = {}) {
  return /* @__PURE__ */ jsx31(Scope, { ...props, name: "BackersMobileNav", children: /* @__PURE__ */ jsx31(MobileNavBody, {}) });
}

// react/components/backers/ParticipationBody.tsx
import { jsx as jsx32, jsxs as jsxs18 } from "react/jsx-runtime";
function ParticipationBody() {
  return /* @__PURE__ */ jsxs18("div", { className: "b-participation", children: [
    /* @__PURE__ */ jsx32("h2", { children: "Before you take part" }),
    /* @__PURE__ */ jsxs18("ul", { children: [
      /* @__PURE__ */ jsxs18("li", { children: [
        /* @__PURE__ */ jsx32("strong", { children: "Not an investment." }),
        " Buying, holding or trading a coin gives no claim on its fees and no return of any kind. Pool money only pays backers who deliver payments to the recipient, or may go back to Backers if not paid out within 14 days."
      ] }),
      /* @__PURE__ */ jsxs18("li", { children: [
        /* @__PURE__ */ jsx32("strong", { children: "SingleSpark in SOL." }),
        " A verified payment of $P pays P plus 10% in SOL, converted at the SOL/USD price when the payment is verified. That SOL amount is then fixed."
      ] }),
      /* @__PURE__ */ jsxs18("li", { children: [
        /* @__PURE__ */ jsx32("strong", { children: "Where the fees go." }),
        " Each coin\u2019s Pump.fun creator fees fund its pool, after 10% goes to Backers. The pool repays backers; fees not paid out within 14 days may go back to Backers."
      ] }),
      /* @__PURE__ */ jsxs18("li", { children: [
        /* @__PURE__ */ jsx32("strong", { children: "Strikes." }),
        " A hold that expires without a receipt, a rejected receipt or cancelling a hold each count as a strike. 3 strikes \u2192 30-day ban; any later ban lasts 90 days."
      ] }),
      /* @__PURE__ */ jsx32("li", { children: "You pay the recipient yourself in X Money. Backers never moves your dollars and never posts on X for you. Naming a recipient doesn\u2019t mean they endorse the coin." })
    ] })
  ] });
}

// react/components/backers/ParticipationNotice.tsx
import { jsx as jsx33 } from "react/jsx-runtime";
function ParticipationNotice(props = {}) {
  return /* @__PURE__ */ jsx33(Scope, { ...props, name: "ParticipationNotice", children: /* @__PURE__ */ jsx33(ParticipationBody, {}) });
}

// react/components/backers/BackersFooter.tsx
import { jsx as jsx34, jsxs as jsxs19 } from "react/jsx-runtime";
function BackersFooter(props = {}) {
  return /* @__PURE__ */ jsx34(Scope, { ...props, name: "BackersFooter", children: /* @__PURE__ */ jsxs19("footer", { className: "b-footer", children: [
    /* @__PURE__ */ jsx34(ParticipationBody, {}),
    /* @__PURE__ */ jsxs19("div", { className: "b-stack", children: [
      /* @__PURE__ */ jsx34(Logo, {}),
      [
        ["Launch a coin", "CoinMetadataForm"],
        ["How it works", "ArticleLayout"],
        ["FAQ", "FAQGroups"],
        ["Terms of Use", "ArticleLayout"],
        ["Security", "ArticleLayout"]
      ].map(([label, target]) => /* @__PURE__ */ jsx34(Go, { target, className: "b-blue-text", children: label }, label)),
      /* @__PURE__ */ jsx34("p", { className: "b-muted b-small", children: "Backers runs on Solana (mainnet-beta)." })
    ] })
  ] }) });
}

// react/components/backers/WalletOption.tsx
import { useContext as useContext4 } from "react";
import { jsx as jsx35, jsxs as jsxs20 } from "react/jsx-runtime";
function WalletOption() {
  const { onAction } = useContext4(Navigation);
  return /* @__PURE__ */ jsxs20(
    "button",
    {
      type: "button",
      className: "b-wallet-option",
      onClick: () => onAction?.("mock-wallet"),
      children: [
        /* @__PURE__ */ jsx35("img", { src: asset("metamask.svg"), width: "28", height: "28", alt: "" }),
        /* @__PURE__ */ jsx35("strong", { children: "MetaMask" })
      ]
    }
  );
}

// react/components/backers/WalletDialog.tsx
import { jsx as jsx36, jsxs as jsxs21 } from "react/jsx-runtime";
function WalletDialog(props = {}) {
  return /* @__PURE__ */ jsx36(Scope, { ...props, name: "WalletDialog", children: /* @__PURE__ */ jsx36("div", { className: "b-modal-stage", children: /* @__PURE__ */ jsxs21(
    "section",
    {
      className: "b-wallet-modal",
      role: "group",
      "aria-label": "Connect a wallet",
      children: [
        /* @__PURE__ */ jsxs21("div", { className: "b-between", children: [
          /* @__PURE__ */ jsx36("h2", { children: "Connect a wallet" }),
          /* @__PURE__ */ jsx36(
            Button,
            {
              target: "BackersHeader",
              variant: "icon-button",
              "aria-label": "Close wallet dialog",
              children: "\xD7"
            }
          )
        ] }),
        /* @__PURE__ */ jsx36("p", { className: "b-muted b-small", children: "Backers never holds your keys. Your wallet signs transactions Backers builds; connecting doesn\u2019t approve anything." }),
        /* @__PURE__ */ jsx36(WalletOption, {})
      ]
    }
  ) }) });
}

// react/components/backers/XSignInGate.tsx
import { jsx as jsx37, jsxs as jsxs22 } from "react/jsx-runtime";
function XSignInGate(props = {}) {
  return /* @__PURE__ */ jsxs22(Scope, { ...props, name: "XSignInGate", children: [
    /* @__PURE__ */ jsxs22("header", { className: "b-page-heading", children: [
      /* @__PURE__ */ jsx37("h1", { className: "b-display b-account-title", children: "Your account" }),
      /* @__PURE__ */ jsx37("p", { className: "b-muted", children: "Sign in with X to back people, submit receipts and get paid." })
    ] }),
    /* @__PURE__ */ jsxs22("div", { className: "b-card b-signin b-stack", children: [
      /* @__PURE__ */ jsx37("p", { children: "Backers uses your X account to match your X Money payments to your holds. We never post on X for you." }),
      /* @__PURE__ */ jsxs22(Button, { action: "mock-signin", variant: "inverse b-large", children: [
        "Sign in with ",
        /* @__PURE__ */ jsx37(Icon, { name: "x", size: 16 })
      ] })
    ] })
  ] });
}

// react/components/backers/BountyExplorer.tsx
import { useState as useState2 } from "react";

// react/components/backers/Tabs.tsx
import { useRef as useRef2 } from "react";
import { jsx as jsx38 } from "react/jsx-runtime";
function Tabs({
  items,
  value,
  onChange,
  pills = false,
  label = "View"
}) {
  const refs = useRef2([]);
  return /* @__PURE__ */ jsx38(
    "div",
    {
      className: `b-tabs ${pills ? "b-pill-tabs" : ""}`,
      role: "tablist",
      "aria-label": label,
      children: items.map(([key, text], index) => /* @__PURE__ */ jsx38(
        "button",
        {
          ref: (node) => {
            refs.current[index] = node;
          },
          type: "button",
          role: "tab",
          "aria-selected": value === key,
          tabIndex: value === key ? 0 : -1,
          className: `${value === key ? "b-active" : ""} b-tab-${key}`,
          onClick: () => onChange(key),
          onKeyDown: (event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
              return;
            event.preventDefault();
            const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
            onChange(items[next][0]);
            refs.current[next]?.focus();
          },
          children: text
        },
        key
      ))
    }
  );
}

// react/components/backers/BountyExplorer.tsx
import { jsx as jsx39, jsxs as jsxs23 } from "react/jsx-runtime";
function BountyExplorer({
  coins = snapshot_default.coins,
  ...props
} = {}) {
  const [sort, setSort] = useState2("biggest"), [query, setQuery] = useState2(""), [limit, setLimit] = useState2(3), matches = coins.filter(
    (c) => (c.name + " " + c.symbol + " " + c.recipient.handle).toLowerCase().includes(query.toLowerCase())
  ).sort(
    (a, b) => sort === "newest" ? b.created_at - a.created_at : b.pool.deliverable_cents - a.pool.deliverable_cents
  );
  return /* @__PURE__ */ jsxs23(Scope, { ...props, name: "BountyExplorer", children: [
    /* @__PURE__ */ jsxs23("header", { className: "b-page-heading", children: [
      /* @__PURE__ */ jsx39("h1", { className: "b-display", children: "Bounties" }),
      /* @__PURE__ */ jsx39("h2", { children: "Pay someone on X, earn +10%." }),
      /* @__PURE__ */ jsx39("p", { className: "b-muted", children: "Claim one and you get 10 minutes to send the money with X Money and paste the receipt link. Once it checks out you get it back +10% in SOL from the coin\u2019s pool." })
    ] }),
    /* @__PURE__ */ jsxs23("div", { className: "b-explorer-tools", children: [
      /* @__PURE__ */ jsx39(
        Tabs,
        {
          items: [
            ["biggest", "Biggest"],
            ["newest", "Newest"]
          ],
          value: sort,
          onChange: setSort
        }
      ),
      /* @__PURE__ */ jsx39(
        Search,
        {
          placeholder: "@handle, name or $SYMBOL",
          value: query,
          onChange: setQuery
        }
      )
    ] }),
    /* @__PURE__ */ jsx39("div", { className: "b-card-grid", children: matches.slice(0, limit).map((coin) => /* @__PURE__ */ jsx39(BountyBody, { coin }, coin.mint)) }),
    matches.length === 0 && /* @__PURE__ */ jsx39("p", { className: "b-search-empty b-card", children: "No bounties match your search." }),
    limit < matches.length && /* @__PURE__ */ jsx39("div", { className: "b-center b-more", children: /* @__PURE__ */ jsx39(Button, { onClick: () => setLimit(limit + 3), children: "Load more bounties" }) })
  ] });
}

// react/components/backers/CoinExplorer.tsx
import { useState as useState3 } from "react";
import { jsx as jsx40, jsxs as jsxs24 } from "react/jsx-runtime";
function CoinExplorer({
  coins = snapshot_default.coins,
  ...props
} = {}) {
  const [sort, setSort] = useState3("trending"), [query, setQuery] = useState3(""), [limit, setLimit] = useState3(6), matches = coins.filter(
    (c) => (c.name + " " + c.symbol + " " + c.recipient.handle).toLowerCase().includes(query.toLowerCase())
  ).sort(
    (a, b) => sort === "new" ? b.created_at - a.created_at : sort === "mcap" ? b.market.market_cap_usd_cents - a.market.market_cap_usd_cents : sort === "pool" ? b.pool.deliverable_cents - a.pool.deliverable_cents : 0
  );
  return /* @__PURE__ */ jsxs24(Scope, { ...props, name: "CoinExplorer", children: [
    /* @__PURE__ */ jsxs24("div", { className: "b-between b-explorer-tools", children: [
      /* @__PURE__ */ jsx40("h2", { className: "b-display b-section-title", children: "Coins" }),
      /* @__PURE__ */ jsx40(
        Search,
        {
          placeholder: "Name, $SYMBOL or @handle",
          value: query,
          onChange: setQuery
        }
      )
    ] }),
    /* @__PURE__ */ jsx40(
      Tabs,
      {
        items: [
          ["trending", "Trending"],
          ["new", "New"],
          ["mcap", "Market cap"],
          ["pool", "Biggest pools"]
        ],
        value: sort,
        onChange: setSort
      }
    ),
    /* @__PURE__ */ jsx40("div", { className: "b-card-grid", children: matches.slice(0, limit).map((coin) => /* @__PURE__ */ jsx40(CoinCardBody, { coin }, coin.mint)) }),
    matches.length === 0 && /* @__PURE__ */ jsx40("p", { className: "b-search-empty b-card", children: "No coins match your search." }),
    limit < matches.length && /* @__PURE__ */ jsx40("div", { className: "b-center b-more", children: /* @__PURE__ */ jsx40(Button, { onClick: () => setLimit(limit + 6), children: "Load more coins" }) })
  ] });
}

// react/components/backers/PeopleRanking.tsx
import { useState as useState4 } from "react";
import { jsx as jsx41, jsxs as jsxs25 } from "react/jsx-runtime";
function PeopleRanking(props = {}) {
  const [sort, setSort] = useState4("fees"), people = [...props.people ?? snapshot_default.people].sort(
    (a, b) => sort === "paid" ? b.delivered_cents - a.delivered_cents : b.fees_usd_cents - a.fees_usd_cents
  );
  return /* @__PURE__ */ jsx41(Scope, { ...props, name: "PeopleRanking", children: /* @__PURE__ */ jsxs25("div", { className: "b-card b-people-ranking", children: [
    /* @__PURE__ */ jsx41(
      Tabs,
      {
        items: [
          ["fees", "Most fees"],
          ["paid", "Most received"]
        ],
        value: sort,
        onChange: setSort
      }
    ),
    /* @__PURE__ */ jsx41("div", { className: "b-ranking", children: people.map((person, index) => /* @__PURE__ */ jsx41(RankBody, { person, rank: index + 1 }, person.handle)) })
  ] }) });
}

// react/components/backers/PendingAcceptanceCard.tsx
import { jsx as jsx42, jsxs as jsxs26 } from "react/jsx-runtime";
function PendingAcceptanceCard(props = {}) {
  const p = snapshot_default.pending.recipients[0];
  return /* @__PURE__ */ jsx42(Scope, { ...props, name: "PendingAcceptanceCard", children: /* @__PURE__ */ jsxs26("article", { className: "b-card b-stack b-pending", children: [
    /* @__PURE__ */ jsxs26("div", { className: "b-row", children: [
      /* @__PURE__ */ jsx42(Avatar, { person: p, size: 40 }),
      /* @__PURE__ */ jsxs26("div", { children: [
        /* @__PURE__ */ jsx42("strong", { children: p.name || p.handle }),
        /* @__PURE__ */ jsxs26("p", { className: "b-muted b-small", children: [
          "@",
          p.handle
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs26("dl", { className: "b-grid-2", children: [
      /* @__PURE__ */ jsx42(Metric, { label: "Waiting", value: money(p.waiting_cents) }),
      /* @__PURE__ */ jsx42(Metric, { label: "Payments", value: p.payments })
    ] }),
    /* @__PURE__ */ jsx42("p", { className: "b-tiny b-muted", children: "Oldest sent 2d ago \xB7 X sends it back in 12 days if not accepted" }),
    /* @__PURE__ */ jsxs26("p", { className: "b-small b-muted", children: [
      "via ",
      p.coins.map((c) => c.name).join(", ")
    ] }),
    /* @__PURE__ */ jsx42(Button, { action: "mock-submit", children: "Let them know on X" })
  ] }) });
}

// react/components/backers/PersonCTABody.tsx
import { jsxs as jsxs27 } from "react/jsx-runtime";
function PersonCTABody({ coin = snapshot_default.coins[0] }) {
  return /* @__PURE__ */ jsxs27("div", { className: "b-profile-cta", children: [
    /* @__PURE__ */ jsxs27(Button, { target: "BackForm", variant: "primary b-large", children: [
      "Back @",
      coin.recipient.handle
    ] }),
    /* @__PURE__ */ jsxs27("p", { className: "b-small b-muted", children: [
      "Up to ",
      money(coin.pool.deliverable_cents),
      " via $",
      coin.symbol,
      ", +10% back in SOL."
    ] })
  ] });
}

// react/components/backers/PersonHeader.tsx
import { jsx as jsx43, jsxs as jsxs28 } from "react/jsx-runtime";
function PersonHeader({
  profile = snapshot_default.personDetail,
  coin = snapshot_default.coins[0],
  ...props
} = {}) {
  const p = profile.recipient, t = profile.totals;
  return /* @__PURE__ */ jsx43(Scope, { ...props, name: "PersonHeader", children: /* @__PURE__ */ jsxs28("section", { className: "b-card b-profile", children: [
    /* @__PURE__ */ jsx43("div", { className: "b-profile-banner", children: /* @__PURE__ */ jsx43("img", { src: asset(p.banner_url), alt: "" }) }),
    /* @__PURE__ */ jsxs28("div", { className: "b-profile-content", children: [
      /* @__PURE__ */ jsxs28("div", { className: "b-between b-profile-top", children: [
        /* @__PURE__ */ jsx43(Avatar, { person: p, size: 104 }),
        /* @__PURE__ */ jsxs28(
          "a",
          {
            className: "b-button b-secondary b-profile-x",
            href: `https://x.com/${p.handle}`,
            target: "_blank",
            rel: "noreferrer",
            children: [
              "View on ",
              /* @__PURE__ */ jsx43(Icon, { name: "x", size: 14 })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs28("h1", { className: "b-inline", children: [
        p.name,
        p.verified && /* @__PURE__ */ jsx43(Verified, {})
      ] }),
      /* @__PURE__ */ jsxs28("p", { className: "b-row b-muted b-profile-handle", children: [
        "@",
        p.handle,
        p.instant_payouts && /* @__PURE__ */ jsx43(Instant, {})
      ] }),
      /* @__PURE__ */ jsx43("p", { className: "b-profile-bio", children: p.bio }),
      /* @__PURE__ */ jsxs28("dl", { className: "b-profile-stats", children: [
        /* @__PURE__ */ jsxs28("div", { children: [
          /* @__PURE__ */ jsx43("dt", { children: "Fees earned" }),
          /* @__PURE__ */ jsx43("dd", { className: "b-display b-green", children: money(t.fees_usd_cents) }),
          /* @__PURE__ */ jsxs28("small", { children: [
            (Number(t.fees_lamports) / 1e9).toFixed(2),
            " SOL"
          ] })
        ] }),
        /* @__PURE__ */ jsx43(
          Metric,
          {
            label: "SingleSpark to them via X Money",
            value: money(t.delivered_cents)
          }
        ),
        /* @__PURE__ */ jsx43(
          Metric,
          {
            label: "Ready to back now",
            value: money(t.ready_cents),
            green: true
          }
        ),
        /* @__PURE__ */ jsx43(Metric, { label: "Coins", value: t.coins }),
        /* @__PURE__ */ jsx43(Metric, { label: "Backers", value: t.backers })
      ] }),
      /* @__PURE__ */ jsx43(PersonCTABody, { coin })
    ] })
  ] }) });
}

// react/components/backers/PersonBackCTA.tsx
import { jsx as jsx44 } from "react/jsx-runtime";
function PersonBackCTA(props = {}) {
  return /* @__PURE__ */ jsx44(Scope, { ...props, name: "PersonBackCTA", children: /* @__PURE__ */ jsx44(PersonCTABody, { coin: props.coin }) });
}

// react/components/backers/PersonCoinList.tsx
import { useState as useState5 } from "react";
import { jsx as jsx45, jsxs as jsxs29 } from "react/jsx-runtime";
function PersonCoinList({
  coins = snapshot_default.personDetail.coins,
  ...props
} = {}) {
  const [sort, setSort] = useState5("fees"), ordered = [...coins].sort(
    (a, b) => sort === "mcap" ? b.market.market_cap_usd_cents - a.market.market_cap_usd_cents : b.pool.fees_usd_cents - a.pool.fees_usd_cents
  );
  return /* @__PURE__ */ jsx45(Scope, { ...props, name: "PersonCoinList", children: /* @__PURE__ */ jsxs29("div", { className: "b-person-coin-list", children: [
    /* @__PURE__ */ jsxs29("div", { className: "b-between", children: [
      /* @__PURE__ */ jsxs29("p", { className: "b-small b-muted", children: [
        coins.length,
        " coins"
      ] }),
      /* @__PURE__ */ jsx45(
        Tabs,
        {
          items: [
            ["fees", "Fees"],
            ["mcap", "Market cap"]
          ],
          value: sort,
          onChange: setSort,
          pills: true
        }
      )
    ] }),
    ordered.map((coin) => /* @__PURE__ */ jsxs29("div", { className: "b-person-coin-row", children: [
      /* @__PURE__ */ jsx45(CoinImage, { coin, size: 36 }),
      /* @__PURE__ */ jsxs29("div", { className: "b-grow", children: [
        /* @__PURE__ */ jsx45("strong", { children: /* @__PURE__ */ jsx45(Go, { target: "CoinHeader", children: coin.name }) }),
        /* @__PURE__ */ jsxs29("p", { className: "b-tiny b-muted", children: [
          "$",
          coin.symbol,
          " \xB7 ",
          /* @__PURE__ */ jsx45("code", { children: brief(coin.mint) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs29("dl", { children: [
        /* @__PURE__ */ jsx45(
          Metric,
          {
            label: "Fees earned",
            value: compact(coin.pool.fees_usd_cents)
          }
        ),
        /* @__PURE__ */ jsx45(
          Metric,
          {
            label: "Market cap",
            value: compact(coin.market.market_cap_usd_cents)
          }
        ),
        /* @__PURE__ */ jsx45(
          Metric,
          {
            label: "Ready to back",
            value: compact(coin.pool.deliverable_cents),
            green: true
          }
        )
      ] })
    ] }, coin.mint))
  ] }) });
}

// react/components/backers/ActivityBody.tsx
import { Fragment as Fragment2, jsx as jsx46, jsxs as jsxs30 } from "react/jsx-runtime";
function ActivityBody({
  payment = snapshot_default.events[0]
}) {
  return /* @__PURE__ */ jsxs30("div", { className: "b-activity-row", children: [
    /* @__PURE__ */ jsx46(CoinImage, { coin: payment.coin, size: 36 }),
    /* @__PURE__ */ jsxs30("div", { className: "b-grow", children: [
      /* @__PURE__ */ jsxs30("p", { children: [
        /* @__PURE__ */ jsxs30("strong", { children: [
          "@",
          payment.backer
        ] }),
        " backed",
        " ",
        /* @__PURE__ */ jsx46("strong", { children: /* @__PURE__ */ jsxs30(Go, { target: "PersonHeader", children: [
          "@",
          payment.recipient
        ] }) }),
        " ",
        /* @__PURE__ */ jsx46("strong", { children: money(payment.paid_cents) }),
        /* @__PURE__ */ jsx46("span", { className: "b-muted", children: " \xB7 " }),
        /* @__PURE__ */ jsxs30("strong", { className: "b-green", children: [
          "+",
          money(payment.reward_cents),
          " bonus"
        ] }),
        !!payment.match_cents && /* @__PURE__ */ jsxs30(Fragment2, { children: [
          /* @__PURE__ */ jsx46("span", { className: "b-muted", children: " \xB7 " }),
          /* @__PURE__ */ jsxs30("strong", { className: "b-green", children: [
            "+",
            money(payment.match_cents),
            " match"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx46("p", { className: "b-small b-muted", children: /* @__PURE__ */ jsxs30(Go, { target: "CoinHeader", children: [
        payment.coin.name,
        " $",
        payment.coin.symbol
      ] }) })
    ] }),
    /* @__PURE__ */ jsx46("time", { className: "b-small b-muted", children: "2h" })
  ] });
}

// react/components/backers/ActivityItem.tsx
import { jsx as jsx47 } from "react/jsx-runtime";
function ActivityItem(props = {}) {
  return /* @__PURE__ */ jsx47(Scope, { ...props, name: "ActivityItem", children: /* @__PURE__ */ jsx47(ActivityBody, { payment: props.payment }) });
}

// react/components/backers/ActivityFeed.tsx
import { jsx as jsx48 } from "react/jsx-runtime";
function ActivityFeed(props = {}) {
  return /* @__PURE__ */ jsx48(Scope, { ...props, name: "ActivityFeed", children: /* @__PURE__ */ jsx48("div", { className: "b-card b-activity-feed", children: (props.payments ?? snapshot_default.events).map((payment, index) => /* @__PURE__ */ jsx48(ActivityBody, { payment }, index)) }) });
}

// react/components/backers/Copy.tsx
import { useContext as useContext5, useEffect as useEffect2, useRef as useRef3, useState as useState6 } from "react";
import { jsx as jsx49 } from "react/jsx-runtime";
function Copy({
  value,
  label = "Copy",
  icon = false
}) {
  const [copied, setCopied] = useState6(false), timer = useRef3(void 0), alive = useRef3(true), { onAction } = useContext5(Navigation);
  useEffect2(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      clearTimeout(timer.current);
    };
  }, []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      if (!alive.current) return;
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      onAction?.("copy-failed");
    }
  }
  return /* @__PURE__ */ jsx49(
    Button,
    {
      variant: icon ? "icon-button" : "secondary b-copy-pill",
      "aria-label": copied ? "Copied" : label,
      onClick: () => void copy(),
      children: copied ? "Copied" : icon ? /* @__PURE__ */ jsx49(Icon, { name: "copy", size: 16 }) : "Copy"
    }
  );
}

// react/components/backers/CoinHeaderBody.tsx
import { jsx as jsx50, jsxs as jsxs31 } from "react/jsx-runtime";
function CoinHeaderBody({ coin = snapshot_default.coins[0] }) {
  return /* @__PURE__ */ jsxs31("div", { className: "b-coin-heading b-row", children: [
    /* @__PURE__ */ jsx50(CoinImage, { coin, size: 48 }),
    /* @__PURE__ */ jsxs31("div", { className: "b-grow", children: [
      /* @__PURE__ */ jsxs31("h1", { children: [
        coin.name,
        " ",
        /* @__PURE__ */ jsxs31("span", { className: "b-muted b-coin-symbol", children: [
          "$",
          coin.symbol
        ] })
      ] }),
      /* @__PURE__ */ jsxs31("div", { className: "b-coin-subline", children: [
        /* @__PURE__ */ jsxs31("span", { className: "b-recipient-pill", children: [
          /* @__PURE__ */ jsxs31(Go, { target: "PersonHeader", children: [
            /* @__PURE__ */ jsx50(Avatar, { person: coin.recipient, size: 20 }),
            /* @__PURE__ */ jsx50("span", { className: "b-muted", children: "Pays" }),
            " ",
            /* @__PURE__ */ jsxs31("strong", { children: [
              "@",
              coin.recipient.handle
            ] })
          ] }),
          /* @__PURE__ */ jsx50(
            "a",
            {
              href: `https://x.com/${coin.recipient.handle}`,
              target: "_blank",
              rel: "noreferrer",
              "aria-label": "Recipient on X",
              children: /* @__PURE__ */ jsx50(Icon, { name: "x", size: 12 })
            }
          )
        ] }),
        coin.recipient.instant_payouts && /* @__PURE__ */ jsx50(Instant, {}),
        /* @__PURE__ */ jsx50(
          "a",
          {
            className: "b-muted",
            href: `https://explorer.solana.com/address/${coin.mint}`,
            target: "_blank",
            rel: "noreferrer",
            children: /* @__PURE__ */ jsx50("code", { children: brief(coin.mint) })
          }
        ),
        /* @__PURE__ */ jsx50(Copy, { value: coin.mint, label: "Copy mint address" }),
        coin.links.website && /* @__PURE__ */ jsx50(
          "a",
          {
            href: coin.links.website,
            target: "_blank",
            rel: "noreferrer",
            "aria-label": "Coin website",
            children: /* @__PURE__ */ jsx50(Icon, { name: "external", size: 14 })
          }
        )
      ] })
    ] })
  ] });
}

// react/components/backers/CoinHeader.tsx
import { jsx as jsx51 } from "react/jsx-runtime";
function CoinHeader(props = {}) {
  return /* @__PURE__ */ jsx51(Scope, { ...props, name: "CoinHeader", children: /* @__PURE__ */ jsx51(CoinHeaderBody, { coin: props.coin }) });
}

// react/components/backers/MetricStripBody.tsx
import { Fragment as Fragment3, jsx as jsx52, jsxs as jsxs32 } from "react/jsx-runtime";
function MetricStripBody({ coin = snapshot_default.coins[0] }) {
  return /* @__PURE__ */ jsxs32("dl", { className: "b-metric-strip", children: [
    /* @__PURE__ */ jsx52(
      Metric,
      {
        label: "Market cap",
        value: /* @__PURE__ */ jsxs32(Fragment3, { children: [
          compact(coin.market.market_cap_usd_cents),
          " ",
          /* @__PURE__ */ jsxs32(
            "small",
            {
              className: coin.market.change_24h_bps < 0 ? "b-red" : "b-green",
              children: [
                coin.market.change_24h_bps >= 0 ? "+" : "",
                (coin.market.change_24h_bps / 100).toFixed(1),
                "%"
              ]
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsx52(
      Metric,
      {
        label: "24h volume",
        value: compact(
          Number(coin.market.volume_24h_lamports) / 1e9 * snapshot_default.stats.sol_usd * 100
        )
      }
    ),
    /* @__PURE__ */ jsx52(
      Metric,
      {
        label: "Ready to back",
        value: compact(coin.pool.deliverable_cents),
        green: true
      }
    ),
    /* @__PURE__ */ jsx52(
      Metric,
      {
        label: coin.market.graduated ? "Trading on PumpSwap" : "Bonding curve",
        value: /* @__PURE__ */ jsx52(Progress, { coin })
      }
    )
  ] });
}

// react/components/backers/CoinMetricStrip.tsx
import { jsx as jsx53 } from "react/jsx-runtime";
function CoinMetricStrip(props = {}) {
  return /* @__PURE__ */ jsx53(Scope, { ...props, name: "CoinMetricStrip", children: /* @__PURE__ */ jsx53(MetricStripBody, { coin: props.coin }) });
}

// react/components/backers/ChartBody.tsx
import { useEffect as useEffect3, useRef as useRef4, useState as useState7 } from "react";
import { jsx as jsx54, jsxs as jsxs33 } from "react/jsx-runtime";
var chartSDK;
function ChartBody({
  coin = snapshot_default.coins[0],
  interval: controlledInterval,
  defaultInterval = "5m",
  unit: controlledUnit,
  defaultUnit = "mcap",
  onIntervalChange,
  onUnitChange,
  candles = snapshot_default.intervals
}) {
  const [localInterval, setInterval] = useState7(defaultInterval), [localUnit, setUnit] = useState7(defaultUnit), [ready, setReady] = useState7(false), [error, setError] = useState7("");
  const interval = controlledInterval ?? localInterval, unit = controlledUnit ?? localUnit, host = useRef4(null), bars = candles[interval] ?? emptyCandles;
  useEffect3(() => {
    let alive = true, chart;
    setReady(false);
    setError("");
    chartSDK ??= import(
      /* @vite-ignore */
      chartURL
    );
    chartSDK.then((sdk) => {
      const element = host.current;
      if (!alive || !element?.isConnected) return;
      const factor = unit === "mcap" ? Number(
        (coin.market.market_cap_usd_cents / 100 / coin.market.price_sol).toPrecision(10)
      ) : 1;
      const dateLabel = new Intl.DateTimeFormat(void 0, {
        month: "short",
        day: "numeric"
      }), timeLabel = new Intl.DateTimeFormat(void 0, {
        hour: "2-digit",
        minute: "2-digit"
      }), fullLabel = new Intl.DateTimeFormat(void 0, {
        dateStyle: "medium",
        timeStyle: "short"
      });
      chart = sdk.createChart(element, {
        autoSize: true,
        layout: {
          background: { type: sdk.ColorType.Solid, color: "transparent" },
          textColor: "#848A90",
          fontFamily: "'Backers Inter',ui-sans-serif,system-ui,sans-serif",
          fontSize: 12,
          attributionLogo: false
        },
        grid: {
          vertLines: { color: "rgba(47,51,54,0.45)" },
          horzLines: { color: "rgba(47,51,54,0.45)" }
        },
        crosshair: { mode: sdk.CrosshairMode.Normal },
        rightPriceScale: {
          borderColor: "#2F3336",
          scaleMargins: { top: 0.12, bottom: 0.2 }
        },
        timeScale: {
          borderColor: "#2F3336",
          barSpacing: 9,
          rightOffset: 4,
          timeVisible: true,
          secondsVisible: false,
          tickMarkFormatter: (time, type) => (type >= 3 ? timeLabel : dateLabel).format(new Date(time * 1e3))
        },
        localization: {
          timeFormatter: (time) => fullLabel.format(new Date(time * 1e3))
        }
      });
      const priceFormat = {
        type: "custom",
        formatter: (value) => unit === "mcap" ? compact(Math.round(value * 100)) : tokenPrice(value),
        minMove: unit === "mcap" ? 0.01 : 1e-12
      };
      const candlesSeries = chart.addSeries(sdk.CandlestickSeries, {
        upColor: "#00BA7C",
        downColor: "#F4212E",
        borderUpColor: "#00BA7C",
        borderDownColor: "#F4212E",
        wickUpColor: "#00BA7C",
        wickDownColor: "#F4212E",
        priceFormat
      });
      const volume = chart.addSeries(sdk.HistogramSeries, {
        priceScaleId: "",
        priceFormat: { type: "volume" },
        lastValueVisible: false,
        priceLineVisible: false
      });
      volume.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
      candlesSeries.setData(
        bars.map((bar) => ({
          time: bar.t,
          open: bar.o * factor,
          high: bar.h * factor,
          low: bar.l * factor,
          close: bar.c * factor
        }))
      );
      volume.setData(
        bars.map((bar) => ({
          time: bar.t,
          value: Number(bar.v) / 1e9,
          color: bar.c >= bar.o ? "#00BA7C66" : "#F4212E66"
        }))
      );
      if (bars.length === 0 && coin.market.price_sol > 0) {
        const step = intervalSeconds[interval], end = coin.market.last_trade_at - coin.market.last_trade_at % step;
        const line = chart.addSeries(sdk.LineSeries, {
          color: "#1D9BF0",
          lineStyle: sdk.LineStyle.Dashed,
          lineWidth: 2,
          priceFormat,
          crosshairMarkerVisible: false
        });
        line.setData([
          { time: end - step * 30, value: coin.market.price_sol * factor },
          { time: end, value: coin.market.price_sol * factor }
        ]);
      }
      if (bars.length >= 60) chart.timeScale().fitContent();
      else {
        chart.timeScale().applyOptions({ barSpacing: 9 });
        chart.timeScale().scrollToRealTime();
      }
      setReady(true);
    }).catch((reason) => {
      if (alive)
        setError(
          reason instanceof Error ? reason.message : "Could not load the chart."
        );
    });
    return () => {
      alive = false;
      chart?.remove();
    };
  }, [
    bars,
    coin.market.market_cap_usd_cents,
    coin.market.price_sol,
    coin.market.last_trade_at,
    interval,
    unit
  ]);
  const change = coin.market.change_24h_bps;
  return /* @__PURE__ */ jsxs33("section", { className: "b-chart", "aria-label": "Price chart", children: [
    /* @__PURE__ */ jsxs33("div", { className: "b-chart-toolbar", children: [
      /* @__PURE__ */ jsxs33("p", { className: "b-small", children: [
        /* @__PURE__ */ jsx54("span", { className: "b-muted b-tiny", children: unit === "mcap" ? "MCap" : "Price" }),
        /* @__PURE__ */ jsx54("strong", { children: unit === "mcap" ? compact(coin.market.market_cap_usd_cents) : tokenPrice(coin.market.price_sol) + " SOL" }),
        /* @__PURE__ */ jsxs33("span", { className: `${change >= 0 ? "b-green" : "b-red"} b-tiny`, children: [
          change > 0 ? "\u25B2 " : change < 0 ? "\u25BC " : "",
          (Math.abs(change) / 100).toFixed(2),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsx54(
        Tabs,
        {
          items: [
            ["price", "Price"],
            ["mcap", "MCap"]
          ],
          value: unit,
          onChange: (next) => {
            setUnit(next);
            onUnitChange?.(next);
          },
          label: "Chart values"
        }
      ),
      /* @__PURE__ */ jsx54("span", { className: "b-chart-separator", "aria-hidden": "true" }),
      /* @__PURE__ */ jsx54(
        Tabs,
        {
          items: ["1m", "5m", "15m", "1h", "4h", "1d"].map((value) => [value, value]),
          value: interval,
          onChange: (next) => {
            setInterval(next);
            onIntervalChange?.(next);
          },
          label: "Candle interval"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs33("div", { className: "b-chart-plot", children: [
      /* @__PURE__ */ jsx54(
        "div",
        {
          ref: host,
          className: "b-chart-native",
          "data-b-chart-ready": ready || void 0,
          role: "img",
          "aria-label": `${coin.symbol} ${unit === "mcap" ? "market cap in US dollars" : "price in SOL"}, ${interval} candles, public data snapshot`
        }
      ),
      !ready && /* @__PURE__ */ jsx54("p", { className: "b-chart-loading", role: "status", children: error || "Loading chart\u2026" }),
      /* @__PURE__ */ jsx54(
        "a",
        {
          className: "b-tv-label",
          href: "https://www.tradingview.com/",
          target: "_blank",
          rel: "noopener noreferrer",
          children: "Charts by TradingView"
        }
      )
    ] })
  ] });
}

// react/components/backers/MarketChart.tsx
import { jsx as jsx55 } from "react/jsx-runtime";
function MarketChart(props = {}) {
  return /* @__PURE__ */ jsx55(Scope, { ...props, name: "MarketChart", children: /* @__PURE__ */ jsx55(ChartBody, { ...props }) });
}

// react/components/backers/TradeFormBody.tsx
import { useState as useState9 } from "react";

// react/components/backers/SlippageBody.tsx
import { useState as useState8 } from "react";

// react/components/backers/Field.tsx
import { jsx as jsx56, jsxs as jsxs34 } from "react/jsx-runtime";
function Field({
  label,
  hint,
  optional,
  children
}) {
  return /* @__PURE__ */ jsxs34("label", { className: "b-field", children: [
    /* @__PURE__ */ jsxs34("span", { children: [
      label,
      optional && /* @__PURE__ */ jsx56("small", { children: " (optional)" })
    ] }),
    hint && /* @__PURE__ */ jsx56("small", { children: hint }),
    children
  ] });
}

// react/components/backers/SlippageBody.tsx
import { jsx as jsx57, jsxs as jsxs35 } from "react/jsx-runtime";
function SlippageBody({
  value,
  defaultValue = 3,
  onValueChange,
  defaultOpen = false
}) {
  const [local, setLocal] = useState8(defaultValue), [custom, setCustom] = useState8(false), [customText, setCustomText] = useState8(""), [open, setOpen] = useState8(defaultOpen);
  const current = value ?? local;
  const setValue = (next) => {
    setLocal(next);
    onValueChange?.(next);
  };
  return /* @__PURE__ */ jsxs35(
    "details",
    {
      className: "b-slippage",
      open,
      onToggle: (event) => setOpen(event.currentTarget.open),
      children: [
        /* @__PURE__ */ jsxs35("summary", { children: [
          /* @__PURE__ */ jsx57("span", { children: "Max slippage" }),
          /* @__PURE__ */ jsxs35("span", { className: "b-blue-text", children: [
            custom && !(Number(customText) >= 0.1 && Number(customText) <= 50) ? "invalid" : current.toFixed(2) + "%",
            " ",
            "\u25BE"
          ] })
        ] }),
        /* @__PURE__ */ jsxs35("div", { className: "b-slippage-options", children: [
          /* @__PURE__ */ jsxs35("div", { className: "b-chip-options", children: [
            [0.5, 1, 3, 5].map((n) => /* @__PURE__ */ jsxs35(
              "button",
              {
                type: "button",
                className: !custom && n === current ? "b-active" : "",
                onClick: () => {
                  setCustom(false);
                  setValue(n);
                },
                children: [
                  n.toFixed(2),
                  "%"
                ]
              },
              n
            )),
            /* @__PURE__ */ jsx57(
              "button",
              {
                type: "button",
                className: custom ? "b-active" : "",
                onClick: () => {
                  setCustom(true);
                  setCustomText(String(current));
                },
                children: "Custom"
              }
            )
          ] }),
          custom && /* @__PURE__ */ jsx57(Field, { label: "Custom slippage (%)", hint: "Use 0.1% to 50%.", children: /* @__PURE__ */ jsx57(
            "input",
            {
              className: "b-input",
              type: "number",
              min: "0.1",
              max: "50",
              step: "0.1",
              placeholder: "2.5",
              value: customText,
              onChange: (event) => {
                setCustomText(event.target.value);
                const n = Number(event.target.value);
                if (n >= 0.1 && n <= 50) setValue(n);
              }
            }
          ) }),
          /* @__PURE__ */ jsx57("p", { className: "b-tiny b-muted", children: "The trade fails instead of filling worse than this." })
        ] })
      ]
    }
  );
}

// react/components/backers/TradeFormBody.tsx
import { jsx as jsx58, jsxs as jsxs36 } from "react/jsx-runtime";
function TradeFormBody({
  side,
  coin = snapshot_default.coins[0],
  initialAmount = "",
  walletConnected = false,
  onAmountChange,
  onTrade
}) {
  const [amount, setAmount] = useState9(initialAmount), [slip, setSlip] = useState9(3), sell = side === "sell";
  const changeAmount = (next) => {
    setAmount(next);
    onAmountChange?.(next);
  };
  return /* @__PURE__ */ jsxs36(
    "form",
    {
      className: "b-stack b-trade-form",
      onSubmit: (event) => {
        event.preventDefault();
        if (walletConnected && Number(amount) > 0)
          onTrade?.({ side, amount, slippage: slip, coin });
      },
      children: [
        /* @__PURE__ */ jsxs36("p", { className: "b-small b-semibold", children: [
          "Amount (",
          sell ? "$" + coin.symbol : "SOL",
          ")"
        ] }),
        /* @__PURE__ */ jsxs36("div", { className: "b-amount", children: [
          /* @__PURE__ */ jsx58(
            "input",
            {
              inputMode: "decimal",
              placeholder: "0.0",
              value: amount,
              onChange: (event) => changeAmount(event.target.value),
              "aria-label": `Amount (${sell ? coin.symbol : "SOL"})`
            }
          ),
          /* @__PURE__ */ jsx58("span", { children: sell ? coin.symbol : "SOL" })
        ] }),
        /* @__PURE__ */ jsx58("div", { className: "b-presets", children: (sell ? ["25%", "50%", "75%", "100%"] : ["0.1", "0.5", "1", "Max"]).map((n) => /* @__PURE__ */ jsxs36(
          "button",
          {
            type: "button",
            disabled: sell || n === "Max",
            onClick: () => changeAmount(n),
            children: [
              n,
              !sell && n !== "Max" ? " SOL" : ""
            ]
          },
          n
        )) }),
        /* @__PURE__ */ jsx58("p", { className: "b-muted b-small b-quote", children: walletConnected ? "Enter an amount to request a quote." : "Connect a wallet to get a quote." }),
        walletConnected ? /* @__PURE__ */ jsxs36(
          Button,
          {
            type: "submit",
            variant: "inverse b-block b-cta",
            disabled: !onTrade || !(Number(amount) > 0),
            children: [
              sell ? "Sell" : "Buy",
              " ",
              coin.symbol
            ]
          }
        ) : /* @__PURE__ */ jsx58(Button, { target: "WalletDialog", variant: "inverse b-block b-cta", children: "Connect wallet" }),
        /* @__PURE__ */ jsx58(SlippageBody, { value: slip, onValueChange: setSlip })
      ]
    }
  );
}

// react/components/backers/BuyForm.tsx
import { jsx as jsx59 } from "react/jsx-runtime";
function BuyForm(props = {}) {
  return /* @__PURE__ */ jsx59(Scope, { ...props, name: "BuyForm", children: /* @__PURE__ */ jsx59("div", { className: "b-card b-trade", children: /* @__PURE__ */ jsx59(TradeFormBody, { ...props, side: "buy" }) }) });
}

// react/components/backers/SellForm.tsx
import { jsx as jsx60 } from "react/jsx-runtime";
function SellForm(props = {}) {
  return /* @__PURE__ */ jsx60(Scope, { ...props, name: "SellForm", children: /* @__PURE__ */ jsx60("div", { className: "b-card b-trade", children: /* @__PURE__ */ jsx60(TradeFormBody, { ...props, side: "sell" }) }) });
}

// react/components/backers/SlippageControl.tsx
import { jsx as jsx61 } from "react/jsx-runtime";
function SlippageControl(props = {}) {
  return /* @__PURE__ */ jsx61(Scope, { ...props, name: "SlippageControl", children: /* @__PURE__ */ jsx61("div", { className: "b-card b-trade", children: /* @__PURE__ */ jsx61(SlippageBody, { defaultOpen: true, ...props }) }) });
}

// react/components/backers/BackFormBody.tsx
import { jsx as jsx62, jsxs as jsxs37 } from "react/jsx-runtime";
function BackFormBody({ coin = snapshot_default.coins[0] }) {
  return /* @__PURE__ */ jsxs37("div", { className: "b-stack b-back-form", children: [
    /* @__PURE__ */ jsxs37("p", { className: "b-muted b-small", children: [
      "Pay @",
      coin.recipient.handle,
      " with X Money, get +10% back in SOL."
    ] }),
    /* @__PURE__ */ jsxs37("p", { className: "b-instant-explanation", children: [
      /* @__PURE__ */ jsx62(Instant, {}),
      /* @__PURE__ */ jsxs37("span", { children: [
        "@",
        coin.recipient.handle,
        "\u2019s latest payment here went through at once, so yours should too."
      ] })
    ] }),
    /* @__PURE__ */ jsxs37("p", { className: "b-back-match", children: [
      /* @__PURE__ */ jsx62("strong", { children: "First-send match:" }),
      " your first send on Backers is matched, up to $25, in SOL."
    ] }),
    /* @__PURE__ */ jsxs37("div", { className: "b-notice b-warning", children: [
      /* @__PURE__ */ jsx62("span", { className: "b-warning-glyph", children: "!" }),
      /* @__PURE__ */ jsx62("p", { children: "Sign in with X to hold an amount." }),
      /* @__PURE__ */ jsx62(Button, { action: "mock-signin", variant: "inverse b-small-button", children: "Sign in with X" })
    ] }),
    /* @__PURE__ */ jsxs37("fieldset", { disabled: true, children: [
      /* @__PURE__ */ jsxs37("label", { className: "b-small b-semibold", children: [
        "Amount to back (USD)",
        /* @__PURE__ */ jsxs37("div", { className: "b-amount b-usd-amount", children: [
          /* @__PURE__ */ jsx62(
            "input",
            {
              placeholder: "50.00",
              inputMode: "decimal",
              "aria-label": "Amount to back in USD"
            }
          ),
          /* @__PURE__ */ jsx62("span", { children: "$" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs37("p", { className: "b-muted b-tiny", children: [
        "Minimum $10.00 \xB7 your limit $1,000.00 \xB7 this pool can cover",
        " ",
        money(coin.pool.deliverable_cents)
      ] }),
      /* @__PURE__ */ jsx62("div", { className: "b-presets", children: [10, 25, 50, 100].map((n) => /* @__PURE__ */ jsxs37("button", { type: "button", children: [
        "$",
        n
      ] }, n)) }),
      /* @__PURE__ */ jsx62("p", { className: "b-small b-muted b-quote", children: "You get back what you send \xD7 1.10, as SOL at the price when your payment is verified." }),
      /* @__PURE__ */ jsxs37(Button, { variant: "primary b-block b-cta", disabled: true, children: [
        "Back @",
        coin.recipient.handle
      ] }),
      /* @__PURE__ */ jsxs37("p", { className: "b-tiny b-muted b-center", children: [
        "By backing you agree to the",
        " ",
        /* @__PURE__ */ jsx62(
          "a",
          {
            href: "https://trybackers.com/terms",
            target: "_blank",
            rel: "noreferrer",
            children: "Terms of Use"
          }
        ),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxs37("details", { className: "b-explainer", children: [
      /* @__PURE__ */ jsxs37("summary", { children: [
        "How backing works ",
        /* @__PURE__ */ jsx62("span", { children: "(10-minute window, strikes)" }),
        /* @__PURE__ */ jsx62("i", { children: "\u25BE" })
      ] }),
      /* @__PURE__ */ jsxs37("ul", { children: [
        /* @__PURE__ */ jsxs37("li", { children: [
          "Backing holds the amount for you for ",
          /* @__PURE__ */ jsx62("strong", { children: "10 minutes" }),
          ": send it in X Money and paste the receipt link in that time."
        ] }),
        /* @__PURE__ */ jsx62("li", { children: "Paying less than you hold is fine: you get what you paid \xD7 1.10." }),
        /* @__PURE__ */ jsx62("li", { children: "Your limit is $1,000.00." }),
        /* @__PURE__ */ jsx62("li", { children: "Letting the hold expire, a rejected receipt or cancelling counts as a strike." })
      ] })
    ] })
  ] });
}

// react/components/backers/BackForm.tsx
import { jsx as jsx63 } from "react/jsx-runtime";
function BackForm(props = {}) {
  return /* @__PURE__ */ jsx63(Scope, { ...props, name: "BackForm", children: /* @__PURE__ */ jsx63("div", { className: "b-card b-trade", children: /* @__PURE__ */ jsx63(BackFormBody, { coin: props.coin }) }) });
}

// react/components/backers/TradePanel.tsx
import { useState as useState10 } from "react";
import { jsx as jsx64, jsxs as jsxs38 } from "react/jsx-runtime";
function TradePanel({
  defaultMode = "buy",
  onModeChange,
  ...props
} = {}) {
  const [mode, setMode] = useState10(defaultMode);
  return /* @__PURE__ */ jsx64(Scope, { ...props, name: "TradePanel", children: /* @__PURE__ */ jsxs38("section", { className: "b-card b-trade", children: [
    /* @__PURE__ */ jsx64(
      Tabs,
      {
        items: [
          ["buy", "Buy"],
          ["sell", "Sell"],
          ["back", "Back @" + (props.coin ?? snapshot_default.coins[0]).recipient.handle]
        ],
        value: mode,
        onChange: (next) => {
          setMode(next);
          onModeChange?.(next);
        },
        pills: true
      }
    ),
    /* @__PURE__ */ jsx64("div", { className: "b-trade-body", children: mode === "back" ? /* @__PURE__ */ jsx64(BackFormBody, { coin: props.coin }) : /* @__PURE__ */ jsx64(TradeFormBody, { ...props, side: mode }) })
  ] }) });
}

// react/components/backers/PoolSummaryBody.tsx
import { jsx as jsx65, jsxs as jsxs39 } from "react/jsx-runtime";
function PoolSummaryBody({ coin = snapshot_default.coins[0] }) {
  return /* @__PURE__ */ jsxs39("div", { className: "b-card b-pool-summary", children: [
    /* @__PURE__ */ jsx65("p", { className: "b-tiny b-muted", children: coin.market.graduated ? "Bonding curve complete" : "Bonding curve" }),
    /* @__PURE__ */ jsx65(Progress, { coin }),
    /* @__PURE__ */ jsxs39("dl", { className: "b-grid-2", children: [
      /* @__PURE__ */ jsx65(
        Metric,
        {
          label: "Ready to back",
          value: money(coin.pool.deliverable_cents),
          green: true
        }
      ),
      /* @__PURE__ */ jsx65(
        Metric,
        {
          label: "SingleSpark to @" + coin.recipient.handle,
          value: money(coin.pool.delivered_cents)
        }
      )
    ] })
  ] });
}

// react/components/backers/PoolSummary.tsx
import { jsx as jsx66 } from "react/jsx-runtime";
function PoolSummary(props = {}) {
  return /* @__PURE__ */ jsx66(Scope, { ...props, name: "PoolSummary", children: /* @__PURE__ */ jsx66(PoolSummaryBody, { coin: props.coin }) });
}

// react/components/backers/PoolLedgerBody.tsx
import { jsx as jsx67, jsxs as jsxs40 } from "react/jsx-runtime";
function PoolLedgerBody({ coin = snapshot_default.coins[0] }) {
  const p = coin.pool;
  return /* @__PURE__ */ jsxs40("div", { className: "b-stack", children: [
    /* @__PURE__ */ jsx67("p", { className: "b-muted b-small", children: "Trading fees collected for this coin, held in SOL on Solana. Dollar figures use the current SOL price." }),
    /* @__PURE__ */ jsxs40("dl", { className: "b-ledger", children: [
      /* @__PURE__ */ jsx67(
        Metric,
        {
          label: "Fees earned",
          value: money(p.fees_usd_cents),
          sub: (Number(p.fees_lamports) / 1e9).toFixed(2) + " SOL"
        }
      ),
      /* @__PURE__ */ jsx67(Metric, { label: "Available", value: money(p.available_usd_cents) }),
      /* @__PURE__ */ jsx67(
        Metric,
        {
          label: "Ready to back",
          value: money(p.deliverable_cents),
          green: true
        }
      ),
      /* @__PURE__ */ jsx67(
        Metric,
        {
          label: "SingleSpark to @" + coin.recipient.handle,
          value: money(p.delivered_cents)
        }
      ),
      /* @__PURE__ */ jsx67(Metric, { label: "Bonuses paid", value: money(p.reward_cents), green: true })
    ] }),
    /* @__PURE__ */ jsxs40("p", { className: "b-small b-muted", children: [
      (Number(p.available_lamports) / 1e9).toFixed(4),
      " SOL available,",
      " ",
      (Number(p.locked_lamports) / 1e9).toFixed(4),
      " SOL held for open holds,",
      " ",
      p.holds_count,
      " holds so far. \u201CReady to back\u201D is the largest payment the pool can cover now, bonus included."
    ] }),
    /* @__PURE__ */ jsx67("p", { className: "b-small b-muted", children: "Naming a recipient doesn\u2019t mean they agreed to or endorse this coin." })
  ] });
}

// react/components/backers/PoolLedger.tsx
import { jsx as jsx68 } from "react/jsx-runtime";
function PoolLedger(props = {}) {
  return /* @__PURE__ */ jsx68(Scope, { ...props, name: "PoolLedger", children: /* @__PURE__ */ jsx68(PoolLedgerBody, { coin: props.coin }) });
}

// react/components/backers/TradesBody.tsx
import { jsx as jsx69, jsxs as jsxs41 } from "react/jsx-runtime";
function TradesBody({
  trades = snapshot_default.trades.trades,
  coin = snapshot_default.coins[0]
}) {
  return /* @__PURE__ */ jsx69("div", { className: "b-table-scroll", children: /* @__PURE__ */ jsxs41("table", { className: "b-table b-trades", children: [
    /* @__PURE__ */ jsx69("thead", { children: /* @__PURE__ */ jsx69("tr", { children: ["Time", "Type", "SOL", "$" + coin.symbol, "Wallet"].map(
      (label) => /* @__PURE__ */ jsx69("th", { children: label }, label)
    ) }) }),
    /* @__PURE__ */ jsx69("tbody", { children: trades.map((trade) => /* @__PURE__ */ jsxs41("tr", { children: [
      /* @__PURE__ */ jsx69("td", { children: new Date(trade.t * 1e3).toISOString().slice(11, 16) }),
      /* @__PURE__ */ jsx69("td", { className: trade.side === "buy" ? "b-green" : "b-red", children: /* @__PURE__ */ jsx69("strong", { children: trade.side === "buy" ? "Buy" : "Sell" }) }),
      /* @__PURE__ */ jsx69("td", { children: (Number(trade.sol_lamports) / 1e9).toFixed(4) }),
      /* @__PURE__ */ jsx69("td", { children: Math.round(Number(trade.token_amount) / 1e6).toLocaleString(
        "en-US"
      ) }),
      /* @__PURE__ */ jsx69("td", { children: /* @__PURE__ */ jsx69(
        "a",
        {
          href: `https://explorer.solana.com/tx/${trade.signature}`,
          target: "_blank",
          rel: "noreferrer",
          children: brief(trade.wallet)
        }
      ) })
    ] }, trade.signature)) })
  ] }) });
}

// react/components/backers/TradeTable.tsx
import { jsx as jsx70 } from "react/jsx-runtime";
function TradeTable(props = {}) {
  return /* @__PURE__ */ jsx70(Scope, { ...props, name: "TradeTable", children: /* @__PURE__ */ jsx70(TradesBody, { ...props }) });
}

// react/components/backers/AboutBody.tsx
import { jsx as jsx71, jsxs as jsxs42 } from "react/jsx-runtime";
function AboutBody({ coin = snapshot_default.coins[0] }) {
  return /* @__PURE__ */ jsxs42("div", { className: "b-stack b-about", children: [
    /* @__PURE__ */ jsx71("p", { children: coin.description }),
    /* @__PURE__ */ jsxs42("p", { className: "b-small b-muted", children: [
      "Launched",
      " ",
      new Date(coin.created_at * 1e3).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    ] }),
    /* @__PURE__ */ jsxs42("div", { className: "b-notice", children: [
      /* @__PURE__ */ jsx71("strong", { children: "Not an investment." }),
      /* @__PURE__ */ jsx71("p", { className: "b-small", children: "Buying or holding this coin gives no claim on its fees or pool." })
    ] }),
    /* @__PURE__ */ jsxs42("dl", { children: [
      /* @__PURE__ */ jsxs42("div", { className: "b-address-row", children: [
        /* @__PURE__ */ jsx71("dt", { children: "Recipient" }),
        /* @__PURE__ */ jsx71("dd", { children: /* @__PURE__ */ jsxs42(Go, { target: "PersonHeader", children: [
          "@",
          coin.recipient.handle
        ] }) })
      ] }),
      [
        ["Mint", coin.mint],
        ["Launcher", coin.launcher]
      ].map(([label, value]) => /* @__PURE__ */ jsxs42("div", { className: "b-address-row", children: [
        /* @__PURE__ */ jsx71("dt", { children: label }),
        /* @__PURE__ */ jsxs42("dd", { children: [
          /* @__PURE__ */ jsx71(
            "a",
            {
              href: `https://explorer.solana.com/address/${value}`,
              target: "_blank",
              rel: "noreferrer",
              children: brief(value)
            }
          ),
          /* @__PURE__ */ jsx71(Copy, { value, label: "Copy " + label, icon: true })
        ] })
      ] }, label))
    ] })
  ] });
}

// react/components/backers/CoinAbout.tsx
import { jsx as jsx72 } from "react/jsx-runtime";
function CoinAbout(props = {}) {
  return /* @__PURE__ */ jsx72(Scope, { ...props, name: "CoinAbout", children: /* @__PURE__ */ jsx72(AboutBody, { coin: props.coin }) });
}

// react/components/backers/MobileTradeActions.tsx
import { jsx as jsx73, jsxs as jsxs43 } from "react/jsx-runtime";
function MobileTradeActions(props = {}) {
  return /* @__PURE__ */ jsx73(Scope, { ...props, name: "MobileTradeActions", children: /* @__PURE__ */ jsxs43("div", { className: "b-mobile-trades", children: [
    /* @__PURE__ */ jsx73(Button, { target: "BuyForm", variant: "primary", children: "Buy" }),
    /* @__PURE__ */ jsx73(Button, { target: "SellForm", variant: "danger", children: "Sell" }),
    /* @__PURE__ */ jsxs43(Button, { target: "BackForm", variant: "inverse", children: [
      "Back @",
      (props.coin ?? snapshot_default.coins[0]).recipient.handle
    ] })
  ] }) });
}

// react/components/backers/CoinDetailTabs.tsx
import { useState as useState11 } from "react";
import { jsx as jsx74, jsxs as jsxs44 } from "react/jsx-runtime";
function CoinDetailTabs(props = {}) {
  const [tab, setTab] = useState11("trades");
  return /* @__PURE__ */ jsxs44(Scope, { ...props, name: "CoinDetailTabs", children: [
    /* @__PURE__ */ jsx74(
      Tabs,
      {
        items: [
          ["trades", "Trades"],
          ["payments", "Payments"],
          ["pool", "Pool"],
          ["about", "About"]
        ],
        value: tab,
        onChange: setTab
      }
    ),
    /* @__PURE__ */ jsx74("div", { className: "b-tab-content", children: tab === "trades" ? /* @__PURE__ */ jsx74(TradesBody, { coin: props.coin }) : tab === "payments" ? snapshot_default.events.map((payment, index) => /* @__PURE__ */ jsx74(ActivityBody, { payment }, index)) : tab === "pool" ? /* @__PURE__ */ jsx74(PoolLedgerBody, { coin: props.coin }) : /* @__PURE__ */ jsx74(AboutBody, { coin: props.coin }) })
  ] });
}

// react/components/backers/MetadataBody.tsx
import { useState as useState14 } from "react";

// react/components/backers/ImageFieldBody.tsx
import { useEffect as useEffect4, useRef as useRef5, useState as useState12 } from "react";
import { jsx as jsx75, jsxs as jsxs45 } from "react/jsx-runtime";
function ImageFieldBody({ onImageChange }) {
  const [url, setUrl] = useState12(""), [status, setStatus] = useState12(""), generation = useRef5(0), urls = useRef5([]);
  useEffect4(
    () => () => {
      generation.current++;
      urls.current.forEach(URL.revokeObjectURL);
    },
    []
  );
  async function select(file) {
    if (!file) return;
    const request = ++generation.current;
    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(
      file.type
    ) || file.size > 1048576) {
      setStatus("Use PNG, JPEG, WebP or GIF, up to 1 MB.");
      return;
    }
    const next = URL.createObjectURL(file);
    urls.current.push(next);
    const image = new Image();
    image.onload = () => {
      if (request !== generation.current) return;
      if (image.width > 2048 || image.height > 2048) {
        setStatus("Use an image up to 2048 \xD7 2048 pixels.");
        return;
      }
      setUrl(next);
      setStatus("Local image preview \xB7 not uploaded");
      onImageChange?.(file);
    };
    image.onerror = () => {
      if (request === generation.current)
        setStatus("This image could not be read.");
    };
    image.src = next;
  }
  return /* @__PURE__ */ jsxs45(
    Field,
    {
      label: "Image",
      hint: "PNG, JPEG, WebP or GIF, up to 1 MB and 2048 \xD7 2048 pixels. Square images look best.",
      children: [
        /* @__PURE__ */ jsxs45("div", { className: "b-row b-image-upload", children: [
          /* @__PURE__ */ jsx75("span", { className: "b-image-placeholder", children: url ? /* @__PURE__ */ jsx75("img", { src: url, alt: "Coin image preview" }) : "+" }),
          /* @__PURE__ */ jsx75(
            "input",
            {
              type: "file",
              accept: "image/png,image/jpeg,image/webp,image/gif",
              "aria-label": "Coin image",
              onChange: (event) => void select(event.target.files?.[0])
            }
          )
        ] }),
        /* @__PURE__ */ jsx75("p", { className: "b-upload-status", role: "status", children: status })
      ]
    }
  );
}

// react/components/backers/RecipientLookupBody.tsx
import { useContext as useContext6, useEffect as useEffect5, useRef as useRef6, useState as useState13 } from "react";
import { jsx as jsx76, jsxs as jsxs46 } from "react/jsx-runtime";
function RecipientLookupBody({
  onLookup,
  onRecipientChange
}) {
  const [handle, setHandle] = useState13(""), [status, setStatus] = useState13(""), [busy, setBusy] = useState13(false), { onAction } = useContext6(Navigation);
  const request = useRef6(0);
  useEffect5(
    () => () => {
      request.current++;
    },
    []
  );
  async function find() {
    if (!/^@?[A-Za-z0-9_]{1,15}$/.test(handle)) {
      setStatus("Enter an X handle like @jack.");
      return;
    }
    if (!onLookup) {
      onAction?.("find-person");
      return;
    }
    const version = ++request.current;
    setBusy(true);
    try {
      const result = await onLookup(handle.replace(/^@/, ""));
      if (version === request.current) {
        setStatus(
          result ? `${result.name} \xB7 @${result.handle}` : "No account found."
        );
        if (result) onRecipientChange?.(result.handle);
      }
    } catch (error) {
      if (version === request.current)
        setStatus(
          error instanceof Error ? error.message : "Could not look up that account."
        );
    } finally {
      if (version === request.current) setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxs46("div", { className: "b-stack", children: [
    /* @__PURE__ */ jsx76(
      Field,
      {
        label: "Recipient X account",
        hint: "The person on X this coin\u2019s trading fees pay. It can\u2019t be changed after launch.",
        children: /* @__PURE__ */ jsxs46("div", { className: "b-row", children: [
          /* @__PURE__ */ jsx76(
            "input",
            {
              className: "b-input",
              placeholder: "@handle",
              autoCapitalize: "off",
              spellCheck: false,
              value: handle,
              onChange: (event) => setHandle(event.target.value)
            }
          ),
          /* @__PURE__ */ jsx76(Button, { disabled: busy, onClick: () => void find(), children: busy ? "Finding\u2026" : "Find" })
        ] })
      }
    ),
    /* @__PURE__ */ jsx76("p", { className: "b-small b-muted", role: "status", children: status })
  ] });
}

// react/components/backers/MetadataBody.tsx
import { jsx as jsx77, jsxs as jsxs47 } from "react/jsx-runtime";
function MetadataBody({
  initialValue,
  onMetadataChange,
  ...props
}) {
  const [value, setValue] = useState14({
    name: "",
    symbol: "",
    description: "",
    telegram: "",
    ...initialValue
  });
  const change = (field, next) => {
    const updated = { ...value, [field]: next };
    setValue(updated);
    onMetadataChange?.(updated);
  };
  return /* @__PURE__ */ jsxs47("div", { className: "b-card b-metadata b-stack", children: [
    /* @__PURE__ */ jsxs47("div", { className: "b-name-symbol", children: [
      /* @__PURE__ */ jsx77(Field, { label: "Name", hint: "Up to 32 characters.", children: /* @__PURE__ */ jsx77(
        "input",
        {
          className: "b-input",
          placeholder: "Harbor Lights",
          maxLength: 32,
          value: value.name,
          onChange: (event) => change("name", event.target.value)
        }
      ) }),
      /* @__PURE__ */ jsx77(Field, { label: "Symbol", hint: "Up to 10 letters or numbers.", children: /* @__PURE__ */ jsx77(
        "input",
        {
          className: "b-input",
          placeholder: "HRBR",
          maxLength: 10,
          pattern: "[A-Za-z0-9]+",
          value: value.symbol,
          onChange: (event) => change("symbol", event.target.value)
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx77(Field, { label: "Description", hint: "Up to 500 characters.", optional: true, children: /* @__PURE__ */ jsx77(
      "textarea",
      {
        className: "b-input",
        rows: 3,
        maxLength: 500,
        value: value.description,
        onChange: (event) => change("description", event.target.value)
      }
    ) }),
    /* @__PURE__ */ jsx77(ImageFieldBody, { ...props }),
    /* @__PURE__ */ jsxs47("fieldset", { className: "b-metadata-links", children: [
      /* @__PURE__ */ jsxs47("legend", { children: [
        /* @__PURE__ */ jsx77("strong", { children: "Links" }),
        /* @__PURE__ */ jsx77("span", { children: "Saved in the coin\u2019s permanent metadata. The website and X are set for you." })
      ] }),
      /* @__PURE__ */ jsxs47("dl", { children: [
        /* @__PURE__ */ jsx77("dt", { children: "Website" }),
        /* @__PURE__ */ jsx77("dd", { children: "This coin\u2019s page on Backers" }),
        /* @__PURE__ */ jsx77("dt", { children: "X" }),
        /* @__PURE__ */ jsx77("dd", { children: "The recipient\u2019s X profile" })
      ] }),
      /* @__PURE__ */ jsx77(Field, { label: "Telegram", hint: "Optional.", children: /* @__PURE__ */ jsx77(
        "input",
        {
          className: "b-input",
          type: "url",
          placeholder: "https://t.me/project",
          value: value.telegram,
          onChange: (event) => change("telegram", event.target.value)
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx77(RecipientLookupBody, { ...props })
  ] });
}

// react/components/backers/CoinMetadataForm.tsx
import { jsx as jsx78 } from "react/jsx-runtime";
function CoinMetadataForm(props = {}) {
  return /* @__PURE__ */ jsx78(Scope, { ...props, name: "CoinMetadataForm", children: /* @__PURE__ */ jsx78(MetadataBody, { ...props }) });
}

// react/components/backers/TokenImageField.tsx
import { jsx as jsx79 } from "react/jsx-runtime";
function TokenImageField(props = {}) {
  return /* @__PURE__ */ jsx79(Scope, { ...props, name: "TokenImageField", children: /* @__PURE__ */ jsx79(ImageFieldBody, { ...props }) });
}

// react/components/backers/RecipientLookup.tsx
import { jsx as jsx80 } from "react/jsx-runtime";
function RecipientLookup(props = {}) {
  return /* @__PURE__ */ jsx80(Scope, { ...props, name: "RecipientLookup", children: /* @__PURE__ */ jsx80(RecipientLookupBody, { ...props }) });
}

// react/components/backers/MintField.tsx
import { useContext as useContext7, useEffect as useEffect6, useRef as useRef7, useState as useState15 } from "react";
import { Fragment as Fragment4, jsx as jsx81, jsxs as jsxs48 } from "react/jsx-runtime";
function MintField({ onCheck, hint }) {
  const [mint, setMint] = useState15(""), [status, setStatus] = useState15(""), [busy, setBusy] = useState15(false), { onAction } = useContext7(Navigation);
  const request = useRef7(0);
  useEffect6(
    () => () => {
      request.current++;
    },
    []
  );
  async function check() {
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(mint)) {
      setStatus("Enter a valid Solana mint address.");
      return;
    }
    if (!onCheck) {
      onAction?.("check-mint");
      return;
    }
    const version = ++request.current;
    setBusy(true);
    try {
      const result = await onCheck(mint);
      if (version === request.current) setStatus(result);
    } catch (error) {
      if (version === request.current)
        setStatus(
          error instanceof Error ? error.message : "Could not check this coin."
        );
    } finally {
      if (version === request.current) setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxs48(Fragment4, { children: [
    /* @__PURE__ */ jsx81(Field, { label: "Contract address", hint, children: /* @__PURE__ */ jsxs48("div", { className: "b-row", children: [
      /* @__PURE__ */ jsx81(
        "input",
        {
          className: "b-input",
          placeholder: "Contract address",
          spellCheck: false,
          value: mint,
          onChange: (event) => setMint(event.target.value)
        }
      ),
      /* @__PURE__ */ jsx81(Button, { disabled: busy, onClick: () => void check(), children: busy ? "Checking\u2026" : "Check" })
    ] }) }),
    /* @__PURE__ */ jsx81("p", { className: "b-small b-muted", role: "status", children: status })
  ] });
}

// react/components/backers/RegisterBody.tsx
import { jsx as jsx82, jsxs as jsxs49 } from "react/jsx-runtime";
function RegisterBody(props) {
  return /* @__PURE__ */ jsxs49("div", { className: "b-stack b-article", children: [
    /* @__PURE__ */ jsx82("p", { className: "b-muted", children: "Already launched on pump.fun or a Meteora bonding curve? Send all of the coin\u2019s creator fees to its Backers fee address for good, and it pays the person on X its description names, like any Backers coin. Registering is free and needs no wallet." }),
    /* @__PURE__ */ jsx82(
      MintField,
      {
        ...props,
        hint: "The coin\u2019s mint address, from its pump.fun or Meteora page."
      }
    ),
    /* @__PURE__ */ jsx82("p", { className: "b-small b-muted", children: "The recipient is read from the coin\u2019s own metadata: its description\u2019s last line \u201CFees to @handle via Backers\u201D, or else its X link. It can\u2019t be changed later." })
  ] });
}

// react/components/backers/RegisterCoinForm.tsx
import { jsx as jsx83 } from "react/jsx-runtime";
function RegisterCoinForm(props = {}) {
  return /* @__PURE__ */ jsx83(Scope, { ...props, name: "RegisterCoinForm", children: /* @__PURE__ */ jsx83(RegisterBody, { ...props }) });
}

// react/components/backers/WalletlessBody.tsx
import { useState as useState16 } from "react";
import { jsx as jsx84, jsxs as jsxs50 } from "react/jsx-runtime";
function WalletlessBody(props) {
  const [handle, setHandle] = useState16("");
  return /* @__PURE__ */ jsxs50("div", { className: "b-stack b-article", children: [
    /* @__PURE__ */ jsx84("p", { className: "b-muted", children: "Launch on pump.fun yourself, without connecting a wallet here. Backers finds the coin on its own once its fees are routed." }),
    /* @__PURE__ */ jsxs50("section", { className: "b-card b-guide-step", children: [
      /* @__PURE__ */ jsx84("span", { className: "b-step-number", children: "1" }),
      /* @__PURE__ */ jsxs50("div", { className: "b-stack", children: [
        /* @__PURE__ */ jsx84("h2", { children: "Name the recipient in the description" }),
        /* @__PURE__ */ jsx84(
          Field,
          {
            label: "Recipient X account",
            hint: "The person on X the coin\u2019s fees will pay.",
            children: /* @__PURE__ */ jsx84(
              "input",
              {
                className: "b-input",
                placeholder: "@handle",
                pattern: "@?[A-Za-z0-9_]{1,15}",
                value: handle,
                onChange: (event) => setHandle(event.target.value)
              }
            )
          }
        ),
        /* @__PURE__ */ jsxs50("code", { className: "b-code-line", children: [
          "Fees to @",
          handle.replace(/^@/, "") || "handle",
          " via Backers"
        ] }),
        /* @__PURE__ */ jsx84("p", { className: "b-small b-muted", children: "Make it the description\u2019s last line. pump.fun saves it for good, so check the handle." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs50("section", { className: "b-card b-guide-step", children: [
      /* @__PURE__ */ jsx84("span", { className: "b-step-number", children: "2" }),
      /* @__PURE__ */ jsxs50("div", { className: "b-stack", children: [
        /* @__PURE__ */ jsx84("h2", { children: "Launch the coin on pump.fun" }),
        /* @__PURE__ */ jsx84("p", { className: "b-small", children: "Create it as usual, with the line above at the end of its description." }),
        /* @__PURE__ */ jsx84(
          "a",
          {
            className: "b-button b-secondary",
            href: "https://pump.fun/create",
            target: "_blank",
            rel: "noreferrer",
            children: "Open pump.fun"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs50("section", { className: "b-card b-guide-step", children: [
      /* @__PURE__ */ jsx84("span", { className: "b-step-number", children: "3" }),
      /* @__PURE__ */ jsxs50("div", { className: "b-stack", children: [
        /* @__PURE__ */ jsx84("h2", { children: "Route its creator fees to Backers" }),
        /* @__PURE__ */ jsx84("p", { className: "b-small", children: "Paste the new coin\u2019s contract address to see its Backers fee address, then share 100% of its creator fees with it and lock the shares." }),
        /* @__PURE__ */ jsx84(MintField, { ...props })
      ] })
    ] })
  ] });
}

// react/components/backers/WalletlessGuide.tsx
import { jsx as jsx85 } from "react/jsx-runtime";
function WalletlessGuide(props = {}) {
  return /* @__PURE__ */ jsx85(Scope, { ...props, name: "WalletlessGuide", children: /* @__PURE__ */ jsx85(WalletlessBody, { ...props }) });
}

// react/components/backers/LaunchWalletGate.tsx
import { jsx as jsx86, jsxs as jsxs51 } from "react/jsx-runtime";
function LaunchWalletGate(props = {}) {
  return /* @__PURE__ */ jsx86(Scope, { ...props, name: "LaunchWalletGate", children: /* @__PURE__ */ jsxs51("div", { className: "b-stack", children: [
    /* @__PURE__ */ jsxs51("div", { className: "b-notice b-warning", children: [
      /* @__PURE__ */ jsxs51("div", { children: [
        /* @__PURE__ */ jsx86("strong", { children: "Connect a wallet to launch" }),
        /* @__PURE__ */ jsx86("p", { children: "Your wallet becomes the coin\u2019s launcher and pays the network fees." })
      ] }),
      /* @__PURE__ */ jsx86(Button, { target: "WalletDialog", children: "Connect wallet" })
    ] }),
    /* @__PURE__ */ jsx86(Button, { variant: "primary b-large b-block", disabled: true, children: "Launch coin" }),
    /* @__PURE__ */ jsxs51("p", { className: "b-muted b-small b-center", children: [
      "By launching you agree to the",
      " ",
      /* @__PURE__ */ jsx86(
        "a",
        {
          href: "https://trybackers.com/terms",
          target: "_blank",
          rel: "noreferrer",
          children: "Terms of Use"
        }
      ),
      "."
    ] }),
    /* @__PURE__ */ jsx86("p", { className: "b-muted b-small", children: "Naming someone as recipient doesn\u2019t mean they endorse the coin. Holding or trading it gives no claim on its fees." })
  ] }) });
}

// react/components/backers/LaunchModeTabs.tsx
import { useState as useState17 } from "react";
import { jsx as jsx87, jsxs as jsxs52 } from "react/jsx-runtime";
function LaunchModeTabs(props = {}) {
  const [mode, setMode] = useState17("launch");
  return /* @__PURE__ */ jsxs52(Scope, { ...props, name: "LaunchModeTabs", children: [
    /* @__PURE__ */ jsxs52("header", { className: "b-page-heading", children: [
      /* @__PURE__ */ jsx87("h1", { className: "b-display", children: mode === "launch" ? "Launch a coin for anyone on X." : mode === "register" ? "Bring a coin you launched elsewhere." : "Launch on pump.fun, no wallet here." }),
      /* @__PURE__ */ jsx87("p", { className: "b-muted", children: mode === "launch" ? "Create a Pump.fun coin whose trading fees pay one person on X. You pay the Solana and Pump.fun fees from your wallet." : mode === "register" ? "A pump.fun or Meteora coin can pay someone on X through Backers too." : "Name the recipient in the description, route the fees, and Backers lists the coin on its own." })
    ] }),
    /* @__PURE__ */ jsx87(
      Tabs,
      {
        items: [
          ["launch", "Launch here"],
          ["register", "Register"],
          ["walletless", "Walletless"]
        ],
        value: mode,
        onChange: setMode
      }
    ),
    /* @__PURE__ */ jsx87("div", { className: "b-tab-content", children: mode === "launch" ? /* @__PURE__ */ jsx87(MetadataBody, { ...props }) : mode === "register" ? /* @__PURE__ */ jsx87(RegisterBody, { ...props }) : /* @__PURE__ */ jsx87(WalletlessBody, { ...props }) })
  ] });
}

// react/components/backers/FirstSendMatch.tsx
import { jsx as jsx88, jsxs as jsxs53 } from "react/jsx-runtime";
function FirstSendMatch(props = {}) {
  const promo = snapshot_default.status.promo;
  return /* @__PURE__ */ jsx88(Scope, { ...props, name: "FirstSendMatch", children: /* @__PURE__ */ jsxs53("section", { className: "b-card b-first-match", children: [
    /* @__PURE__ */ jsxs53("div", { children: [
      /* @__PURE__ */ jsx88("p", { className: "b-match-kicker", children: "First-send match" }),
      /* @__PURE__ */ jsx88("h2", { className: "b-display", children: "Your first send, matched up to $25." }),
      /* @__PURE__ */ jsxs53("p", { children: [
        "Back someone on X for the first time: their coin\u2019s pool pays you back what you send +10%, and we add a match of up to $25 in SOL. Send $25, get ",
        /* @__PURE__ */ jsx88("strong", { children: "$52.50" }),
        " back."
      ] }),
      /* @__PURE__ */ jsxs53("p", { className: "b-small", children: [
        /* @__PURE__ */ jsx88("strong", { children: money(promo.remaining_cents).replace(".00", "") }),
        " ",
        "of the ",
        money(promo.budget_cents).replace(".00", ""),
        " promotion left \xB7 one match per person"
      ] })
    ] }),
    /* @__PURE__ */ jsxs53("div", { className: "b-match-actions", children: [
      /* @__PURE__ */ jsx88(Button, { target: "BountyExplorer", variant: "primary b-large", children: "Find someone to back" }),
      /* @__PURE__ */ jsx88(Go, { target: "FAQGroups", className: "b-blue-text", children: "How the match works" })
    ] })
  ] }) });
}

// react/components/backers/ContentsBody.tsx
import { jsx as jsx89, jsxs as jsxs54 } from "react/jsx-runtime";
function ContentsBody() {
  return /* @__PURE__ */ jsxs54("nav", { className: "b-docs-nav", "aria-label": "In this guide", children: [
    /* @__PURE__ */ jsx89("strong", { children: "In this guide" }),
    contents.map(([id, title], index) => /* @__PURE__ */ jsx89(
      "a",
      {
        className: index === 0 ? "b-active" : "",
        href: `https://trybackers.com/docs#${id}`,
        target: "_blank",
        rel: "noreferrer",
        children: title
      },
      id
    ))
  ] });
}

// react/components/backers/DocsContents.tsx
import { jsx as jsx90 } from "react/jsx-runtime";
function DocsContents(props = {}) {
  return /* @__PURE__ */ jsx90(Scope, { ...props, name: "DocsContents", children: /* @__PURE__ */ jsx90(ContentsBody, {}) });
}

// react/components/backers/FAQBody.tsx
import { useState as useState18 } from "react";
import { jsx as jsx91, jsxs as jsxs55 } from "react/jsx-runtime";
function FAQBody() {
  const [query, setQuery] = useState18(""), matches = faq.filter(
    (pair) => pair.join(" ").toLowerCase().includes(query.toLowerCase())
  );
  return /* @__PURE__ */ jsxs55("div", { className: "b-stack", children: [
    /* @__PURE__ */ jsxs55("div", { className: "b-field", children: [
      /* @__PURE__ */ jsx91("span", { children: "Search the FAQ" }),
      /* @__PURE__ */ jsx91(
        Search,
        {
          placeholder: "Pending, strikes, wallet\u2026",
          value: query,
          onChange: setQuery
        }
      )
    ] }),
    /* @__PURE__ */ jsx91("h3", { className: "b-kicker", children: "Getting started" }),
    /* @__PURE__ */ jsx91("div", { className: "b-card b-faq", children: matches.map(([question, answer]) => /* @__PURE__ */ jsxs55("details", { children: [
      /* @__PURE__ */ jsxs55("summary", { children: [
        question,
        /* @__PURE__ */ jsx91("span", { children: "+" })
      ] }),
      /* @__PURE__ */ jsx91("p", { children: answer })
    ] }, question)) }),
    matches.length === 0 && /* @__PURE__ */ jsx91("p", { className: "b-search-empty", children: "Nothing matches. Try another word." })
  ] });
}

// react/components/backers/FAQGroups.tsx
import { jsx as jsx92 } from "react/jsx-runtime";
function FAQGroups(props = {}) {
  return /* @__PURE__ */ jsx92(Scope, { ...props, name: "FAQGroups", children: /* @__PURE__ */ jsx92(FAQBody, {}) });
}

// react/components/backers/RuleTable.tsx
import { jsx as jsx93, jsxs as jsxs56 } from "react/jsx-runtime";
function RuleTable(props = {}) {
  return /* @__PURE__ */ jsx93(Scope, { ...props, name: "RuleTable", children: /* @__PURE__ */ jsx93("div", { className: "b-table-scroll", children: /* @__PURE__ */ jsxs56("table", { className: "b-table b-rule-table", children: [
    /* @__PURE__ */ jsx93("thead", { children: /* @__PURE__ */ jsxs56("tr", { children: [
      /* @__PURE__ */ jsx93("th", { children: "Check" }),
      /* @__PURE__ */ jsx93("th", { children: "If it fails" })
    ] }) }),
    /* @__PURE__ */ jsx93("tbody", { children: rules.map(([check, result]) => /* @__PURE__ */ jsxs56("tr", { children: [
      /* @__PURE__ */ jsx93("th", { scope: "row", children: check }),
      /* @__PURE__ */ jsx93("td", { children: result })
    ] }, check)) })
  ] }) }) });
}

// react/components/backers/Glossary.tsx
import { jsx as jsx94, jsxs as jsxs57 } from "react/jsx-runtime";
function Glossary(props = {}) {
  return /* @__PURE__ */ jsx94(Scope, { ...props, name: "Glossary", children: /* @__PURE__ */ jsx94("dl", { className: "b-glossary", children: glossary.map(([term, meaning]) => /* @__PURE__ */ jsxs57("div", { children: [
    /* @__PURE__ */ jsx94("dt", { children: term }),
    /* @__PURE__ */ jsx94("dd", { children: meaning })
  ] }, term)) }) });
}

// react/components/backers/ArticleLayout.tsx
import { jsx as jsx95, jsxs as jsxs58 } from "react/jsx-runtime";
function ArticleLayout(props = {}) {
  return /* @__PURE__ */ jsx95(Scope, { ...props, name: "ArticleLayout", children: /* @__PURE__ */ jsxs58("article", { className: "b-article-layout", children: [
    /* @__PURE__ */ jsxs58("header", { children: [
      /* @__PURE__ */ jsx95("p", { className: "b-kicker", children: "How Backers works" }),
      /* @__PURE__ */ jsxs58("h1", { className: "b-display", children: [
        "Pay someone on X.",
        /* @__PURE__ */ jsx95("br", {}),
        "Get it back +10%."
      ] }),
      /* @__PURE__ */ jsx95("p", { className: "b-muted b-lead", children: "Backers coins are Pump.fun coins that each name one person on X. The creator fees from every trade fill the coin\u2019s pool. Anyone who sends that person money with X Money can get it back from the pool, plus a 10% bonus, in SOL." }),
      /* @__PURE__ */ jsx95("div", { className: "b-key-numbers", children: [
        "+10% bonus in SOL",
        "10-minute holds",
        "$10.00 minimum payment"
      ].map((text) => /* @__PURE__ */ jsx95("span", { children: text }, text)) })
    ] }),
    /* @__PURE__ */ jsxs58("div", { className: "b-docs-layout", children: [
      /* @__PURE__ */ jsx95(ContentsBody, {}),
      /* @__PURE__ */ jsxs58("section", { children: [
        /* @__PURE__ */ jsx95("h2", { children: "Back someone, step by step" }),
        /* @__PURE__ */ jsx95("p", { className: "b-muted", children: "You need an X account at least 90 days old, with X Money, and a Solana wallet with a little SOL for network fees." }),
        /* @__PURE__ */ jsx95(HowBody, {})
      ] })
    ] })
  ] }) });
}

// react/components/backers/Unverified.tsx
import { jsx as jsx96, jsxs as jsxs59 } from "react/jsx-runtime";
function Unverified({ name }) {
  return /* @__PURE__ */ jsxs59("div", { className: "b-unverified", children: [
    /* @__PURE__ */ jsx96("h2", { children: "Authenticated interface unverified" }),
    /* @__PURE__ */ jsxs59("p", { children: [
      "The public documentation confirms this flow, but the actual ",
      name,
      " ",
      "interface has not been observed. No speculative reconstruction is shown."
    ] }),
    /* @__PURE__ */ jsx96("a", { href: "https://trybackers.com/docs", target: "_blank", rel: "noreferrer", children: "View the original flow documentation \u2197" })
  ] });
}

// react/components/backers/AccountProfile.tsx
import { jsx as jsx97 } from "react/jsx-runtime";
function AccountProfile(props = {}) {
  return /* @__PURE__ */ jsx97(Scope, { ...props, name: "AccountProfile", children: /* @__PURE__ */ jsx97(Unverified, { name: "AccountProfile" }) });
}

// react/components/backers/AccountLimits.tsx
import { jsx as jsx98 } from "react/jsx-runtime";
function AccountLimits(props = {}) {
  return /* @__PURE__ */ jsx98(Scope, { ...props, name: "AccountLimits", children: /* @__PURE__ */ jsx98(Unverified, { name: "AccountLimits" }) });
}

// react/components/backers/HoldStatusPanel.tsx
import { jsx as jsx99 } from "react/jsx-runtime";
function HoldStatusPanel(props = {}) {
  return /* @__PURE__ */ jsx99(Scope, { ...props, name: "HoldStatusPanel", children: /* @__PURE__ */ jsx99(Unverified, { name: "HoldStatusPanel" }) });
}

// react/components/backers/ReceiptSubmission.tsx
import { jsx as jsx100 } from "react/jsx-runtime";
function ReceiptSubmission(props = {}) {
  return /* @__PURE__ */ jsx100(Scope, { ...props, name: "ReceiptSubmission", children: /* @__PURE__ */ jsx100(Unverified, { name: "ReceiptSubmission" }) });
}

// react/components/backers/HoldResolution.tsx
import { jsx as jsx101 } from "react/jsx-runtime";
function HoldResolution(props = {}) {
  return /* @__PURE__ */ jsx101(Scope, { ...props, name: "HoldResolution", children: /* @__PURE__ */ jsx101(Unverified, { name: "HoldResolution" }) });
}

// react/components/backers/BackersButton.tsx
import { jsx as jsx102 } from "react/jsx-runtime";
function BackersButton({
  children = "Launch a coin",
  variant = "primary",
  size = "default",
  disabled,
  target,
  action,
  onClick,
  ...props
} = {}) {
  return /* @__PURE__ */ jsx102(Scope, { ...props, name: "BackersButton", children: /* @__PURE__ */ jsx102(
    Button,
    {
      variant: variant + (size === "large" ? " b-large" : ""),
      disabled,
      target,
      action,
      onClick,
      children
    }
  ) });
}

// react/components/backers/BackersTabs.tsx
import { useState as useState19 } from "react";
import { jsx as jsx103 } from "react/jsx-runtime";
function BackersTabs({
  items = [
    ["buy", "Buy"],
    ["sell", "Sell"],
    ["back", "Back @sierracatalina"]
  ],
  value,
  defaultValue = items[0]?.[0] ?? "",
  onValueChange,
  pills = true,
  label,
  ...props
} = {}) {
  const [local, setLocal] = useState19(defaultValue);
  return /* @__PURE__ */ jsx103(Scope, { ...props, name: "BackersTabs", children: /* @__PURE__ */ jsx103(
    Tabs,
    {
      items,
      value: value ?? local,
      onChange: (next) => {
        setLocal(next);
        onValueChange?.(next);
      },
      pills,
      label
    }
  ) });
}

// react/components/backers/BackersInput.tsx
import { useState as useState20 } from "react";
import { jsx as jsx104 } from "react/jsx-runtime";
function BackersInput({
  label = "Recipient X account",
  hint = "The person on X this coin\u2019s trading fees pay.",
  placeholder = "@handle",
  value,
  defaultValue = "",
  onValueChange,
  type = "text",
  disabled,
  ...props
} = {}) {
  const [local, setLocal] = useState20(defaultValue);
  return /* @__PURE__ */ jsx104(Scope, { ...props, name: "BackersInput", children: /* @__PURE__ */ jsx104(Field, { label, hint, children: /* @__PURE__ */ jsx104(
    "input",
    {
      className: "b-input",
      type,
      placeholder,
      disabled,
      value: value ?? local,
      onChange: (event) => {
        setLocal(event.target.value);
        onValueChange?.(event.target.value);
      }
    }
  ) }) });
}

// react/components/backers/BackersBadge.tsx
import { jsx as jsx105 } from "react/jsx-runtime";
function BackersBadge({
  variant = "instant",
  children,
  ...props
} = {}) {
  return /* @__PURE__ */ jsx105(Scope, { ...props, name: "BackersBadge", children: children ? /* @__PURE__ */ jsx105(
    "span",
    {
      className: `b-badge ${variant === "graduated" ? "b-blue" : "b-instant"}`,
      children
    }
  ) : variant === "graduated" ? /* @__PURE__ */ jsx105("span", { className: "b-badge b-blue", children: "\u2713 Graduated" }) : /* @__PURE__ */ jsx105(Instant, {}) });
}

// react/components/backers/BackersAvatar.tsx
import { jsx as jsx106 } from "react/jsx-runtime";
function BackersAvatar({
  person = snapshot_default.people[0],
  size = 40,
  ...props
} = {}) {
  return /* @__PURE__ */ jsx106(Scope, { ...props, name: "BackersAvatar", children: /* @__PURE__ */ jsx106(Avatar, { person, size }) });
}

// react/components/backers/BackersList.tsx
import { jsx as jsx107 } from "react/jsx-runtime";
function BackersList({
  people = snapshot_default.people.slice(0, 3),
  children,
  ...props
} = {}) {
  return /* @__PURE__ */ jsx107(Scope, { ...props, name: "BackersList", children: /* @__PURE__ */ jsx107("div", { className: "b-card b-ranking", children: children ?? people.map((person, index) => /* @__PURE__ */ jsx107(RankBody, { person, rank: index + 1 }, person.handle)) }) });
}

// react/components/backers/BackersListItem.tsx
import { jsx as jsx108 } from "react/jsx-runtime";
function BackersListItem(props = {}) {
  return /* @__PURE__ */ jsx108(Scope, { ...props, name: "BackersListItem", children: /* @__PURE__ */ jsx108(RankBody, { person: props.person, rank: props.rank }) });
}

// react/components/backers/BackersSearch.tsx
import { useState as useState21 } from "react";
import { jsx as jsx109 } from "react/jsx-runtime";
function BackersSearch({
  placeholder = "Coins or @people",
  value,
  defaultValue = "",
  onValueChange,
  ...props
} = {}) {
  const [local, setLocal] = useState21(defaultValue);
  return /* @__PURE__ */ jsx109(Scope, { ...props, name: "BackersSearch", children: /* @__PURE__ */ jsx109(
    Search,
    {
      placeholder,
      value: value ?? local,
      onChange: (next) => {
        setLocal(next);
        onValueChange?.(next);
      }
    }
  ) });
}

// react/backers.tsx
var backersComponents = {
  BackersHeader,
  BackersMobileNav,
  BackersFooter,
  ParticipationNotice,
  GlobalSearch,
  WalletDialog,
  XSignInGate,
  BackersHero,
  LatestPaymentCard,
  ProtocolStats,
  BountyCard,
  BountyExplorer,
  PersonRankRow,
  PeopleRanking,
  PendingAcceptanceCard,
  HowItWorksSteps,
  CoinCard,
  BondingProgress,
  CoinExplorer,
  PersonHeader,
  PersonBackCTA,
  PersonCoinList,
  ActivityItem,
  ActivityFeed,
  CoinHeader,
  CoinMetricStrip,
  MarketChart,
  TradePanel,
  BuyForm,
  SellForm,
  SlippageControl,
  BackForm,
  PoolSummary,
  MobileTradeActions,
  CoinDetailTabs,
  TradeTable,
  PoolLedger,
  CoinAbout,
  LaunchModeTabs,
  CoinMetadataForm,
  TokenImageField,
  RecipientLookup,
  LaunchWalletGate,
  RegisterCoinForm,
  WalletlessGuide,
  DocsContents,
  RuleTable,
  FAQGroups,
  Glossary,
  ArticleLayout,
  AccountProfile,
  AccountLimits,
  HoldStatusPanel,
  ReceiptSubmission,
  HoldResolution,
  FirstSendMatch
};
var backersPrimitiveComponents = {
  BackersButton,
  BackersTabs,
  BackersInput,
  BackersBadge,
  BackersAvatar,
  BackersList,
  BackersListItem,
  BackersSearch
};

export {
  BackersHero,
  LatestPaymentCard,
  ProtocolStats,
  CoinCard,
  BondingProgress,
  BountyCard,
  PersonRankRow,
  HowItWorksSteps,
  GlobalSearch,
  BackersHeader,
  BackersMobileNav,
  ParticipationNotice,
  BackersFooter,
  WalletDialog,
  XSignInGate,
  BountyExplorer,
  CoinExplorer,
  PeopleRanking,
  PendingAcceptanceCard,
  PersonHeader,
  PersonBackCTA,
  PersonCoinList,
  ActivityItem,
  ActivityFeed,
  CoinHeader,
  CoinMetricStrip,
  MarketChart,
  BuyForm,
  SellForm,
  SlippageControl,
  BackForm,
  TradePanel,
  PoolSummary,
  PoolLedger,
  TradeTable,
  CoinAbout,
  MobileTradeActions,
  CoinDetailTabs,
  CoinMetadataForm,
  TokenImageField,
  RecipientLookup,
  RegisterCoinForm,
  WalletlessGuide,
  LaunchWalletGate,
  LaunchModeTabs,
  FirstSendMatch,
  DocsContents,
  FAQGroups,
  RuleTable,
  Glossary,
  ArticleLayout,
  AccountProfile,
  AccountLimits,
  HoldStatusPanel,
  ReceiptSubmission,
  HoldResolution,
  BackersButton,
  BackersTabs,
  BackersInput,
  BackersBadge,
  BackersAvatar,
  BackersList,
  BackersListItem,
  BackersSearch,
  backersComponents,
  backersPrimitiveComponents
};
