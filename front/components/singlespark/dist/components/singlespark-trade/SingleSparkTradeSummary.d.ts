import type { ReactNode } from "react";
import { SingleSparkTradeQuote } from "../../singlespark-trade.shared";
export declare function SingleSparkTradeSummary({ quote, entries, loading, symbol, slippageBps, className, }: {
    quote?: SingleSparkTradeQuote;
    /** Exact formatted values supplied by the host's quote and currency formatters. */
    entries?: [ReactNode, ReactNode][];
    loading?: boolean;
    symbol?: string;
    slippageBps?: number;
    className?: string;
}): import("react").JSX.Element;
