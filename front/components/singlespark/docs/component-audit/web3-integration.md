# SingleSpark Web3 integration · 0.4.0

Seventeen independent React components are exported from `@singlespark/component-atlas` and use `singlespark.css`. Import chain icons from `/chain-icons` and token icons from `/token-icons`; `/icons` retains compatible exports. No new runtime npm dependency was added. Candles reuse the distributed Lightweight Charts 4.2.3.

## Preview and exports

Local catalog routes: [icons](http://localhost:4173/#/foundations/icons), [stats](http://localhost:4173/#/components/stat-grid), [candles](http://localhost:4173/#/components/candlestick-chart), [trade panel](http://localhost:4173/#/components/token-trade-panel).

All names below use the `SingleSpark` prefix.

| Group | Exports |
| --- | --- |
| Identity | ChainIcon, TokenIcon, TokenIdentity |
| Statistics | PriceChange, Sparkline, StatCard, StatGrid, BondingProgress |
| Markets | CandlestickChart, TradesTable |
| Trading | TradeTabs, TokenAmountInput, AmountPresets, SlippageControl, TradeSummary, TransactionStatus, TokenTradePanel |

Built-in chain artwork covers Bitcoin, Ethereum, Solana, BNB Chain, Base, Arbitrum, Optimism, Avalanche and Sui. Token artwork covers BTC, ETH, SOL, BNB, AVAX, SUI, USDC and USDT. Extend with trusted `src` or token `icon`; failed images show an abbreviation. Icons do not verify authenticity; identity is chain plus id.

## Trading integration

```tsx
import { useCallback } from 'react';
import {
  SingleSparkTheme, SingleSparkTokenTradePanel,
  type SingleSparkTokenTradePanelProps,
  type SingleSparkToken,
} from '@singlespark/component-atlas';
import '@singlespark/component-atlas/singlespark.css';

// Read mint/contract, decimals and chain from your trusted token list.
// Endpoint names illustrate host integration; the library provides no backend endpoints.
export function MarketTrade(props: {
  token: SingleSparkToken;
  connected: boolean;
  onConnect: () => void;
  solBalance?: string;
  tokenBalance?: string;
  spendableSol?: string;
  signAndSubmit: NonNullable<SingleSparkTokenTradePanelProps['onTrade']>;
}) {
  const fetchQuote = useCallback<NonNullable<SingleSparkTokenTradePanelProps['onQuote']>>(
    async (request, signal) => {
      const response = await fetch('/api/trade/quote', {
        method: 'POST', signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error('Quote unavailable');
      return response.json();
    }, []);
  return <SingleSparkTheme mode="dark">
    <SingleSparkTokenTradePanel token={props.token}
      connected={props.connected} onConnect={props.onConnect}
      currencyBalance={props.solBalance} tokenBalance={props.tokenBalance}
      maxBuyAmount={props.spendableSol}
      onQuote={fetchQuote} onTrade={props.signAndSubmit} />
  </SingleSparkTheme>;
}
```

`onQuote(request, signal)` returns:

```ts
{
  amountOut: string;         // Decimal output-token quantity.
  minimumReceived: string;  // Same units; > 0 and <= amountOut.
  fee: string;              // Display-only fee text, e.g. "0.000005 SOL".
  priceImpact?: number;     // Percentage.
  expiresAt: number;        // Unix milliseconds.
}
```

Requests contain side, token, currency, amount and slippageBps. Amounts remain strings; 100 bps equals 1%. Parsing and sale percentages use BigInt instead of floating-point monetary arithmetic. Changing side, amount, token or slippage invalidates the old quote; AbortSignal cancels stale requests. Expired quotes cannot be confirmed. A confirmation dialog precedes signing; signing disables the form and duplicate submission.

`onTrade(request, quote)` is the host signing/broadcast callback and returns `{status:'submitted'|'confirmed', hash?:string}`. Broadcasting is not confirmation. Return confirmed only after host verification. The host validates balances, actual fees, slippage limits, quote identity, routes and program addresses. The UI quote neither contains nor validates a signed transaction. After submitted, the host tracks confirmation in its own transaction list or TransactionStatus.

Native-coin Max appears only with `maxBuyAmount`, which should reserve network fees. Standalone AmountPresets delegates sale percentages to the host; the combined panel computes them exactly from tokenBalance with downward rounding. The panel supports same-chain fixed-pair buys/sells; cross-chain, limit orders and automated trading are outside its scope.

## Charts

`data` accepts `{time,open,high,low,close,volume?}[]` with UTC seconds. New data updates the series; `onIntervalChange` asks the host for the corresponding interval. Missing data shows an empty state without fetching an endpoint. Invalid OHLC and negative volume are discarded; duplicate times retain the last record. Features include inherited light/dark themes, Candles/Line, volume visibility, zoom/reset and an accessible table of the latest 50 records. Precision defaults to six and is configurable. TradingView Advanced Charts drawing/indicator tools are not included.

## Shared control updates

- Button supports icon/iconPosition; loading replaces its icon with a spinner. Pressed, disabled and focus states remain.
- Tabs accepts an icons map and retains arrow/Home/End navigation and controlled values.
- ListItem supports selected/disabled and a leading icon slot.
- Inputs, search and checkboxes retain disabled/error focus and hint colors; coarse pointers receive larger icon/tab hit targets.
- Styles use `--ss-*` tokens and respect prefers-reduced-motion.

## Reference and assets

Trading patterns follow observed public [pump.fun](https://pump.fun/) pages: Buy/Sell, settings, amount, percentage presets, Quick buy/sell, market cap, volume, holders, ATH, 5m/1h/24h metrics and candles. An initial skeleton later resolved. Observation did not connect a wallet or transact. These custom reusable components do not claim private source access or pixel-perfect equivalence.

Official/community sources, checksums and license limits for 17 SVGs are recorded in `assets/web3/NOTICE.md` and `sources.json`; brand artwork is not uniformly MIT. Example markets, balances, fees and receipts are labeled simulations. Bonding progress comes entirely from the host; no Pump graduation threshold is hardcoded.

## Icons and loading

```tsx
import { SingleSparkChainIcon } from '@singlespark/component-atlas/chain-icons';
import { SingleSparkTokenIcon, SingleSparkTokenIdentity } from '@singlespark/component-atlas/token-icons';
import { SingleSparkLoading, SingleSparkSkeleton } from '@singlespark/component-atlas';
import '@singlespark/component-atlas/singlespark.css';

<SingleSparkChainIcon chain="base" />
<SingleSparkTokenIcon symbol="ETH" />
<SingleSparkTokenIdentity token={{ id: 'native', symbol: 'ETH', name: 'Ether', chain: 'base', decimals: 18 }} />
<SingleSparkLoading size={24} variant="spinner" showLabel label="Loading…" />
<SingleSparkSkeleton variant="list" loading={loading}>
  <YourList />
</SingleSparkSkeleton>
```

TokenIcon no longer accepts chain; TokenIdentity composes network information separately. Symbol lookup is display-only and does not verify contracts. Custom assets require a trusted src.

Skeleton variants: text, avatar, button, input, card, list, table, stat, chart, trade and wallet. Compose shapes/width/height rather than duplicating skeletons for all 183 components. Animation supports wave, pulse or false and respects reduced motion. `loading=false` renders children.

Loading supports spinner/dots. With children, it overlays content and uses inert to suspend interaction. Buttons, connecting wallets and quoting/signing/submitted trades share it. Lists, WalletList, StatCard, TradesTable, CandlestickChart and TradeSummary reuse Skeleton; quoting automatically shows the quote skeleton.
