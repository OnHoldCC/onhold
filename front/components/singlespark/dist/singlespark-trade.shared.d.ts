import { type SingleSparkToken } from "./singlespark-assets";
import type { InputHTMLAttributes, ReactNode } from "react";
export declare function parseSingleSparkAmount(value: string, decimals: number): bigint | null;
export declare function formatSingleSparkAmount(units: bigint, decimals: number): string;
export type SingleSparkTradeSide = "buy" | "sell";
export interface SingleSparkTokenAmountInputProps {
    value?: string;
    onChange?: (value: string) => void;
    symbol?: string;
    icon?: string;
    iconContent?: ReactNode;
    label?: string;
    balance?: string;
    balanceContent?: ReactNode;
    inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'disabled'>;
    /** Spendable maximum supplied by the host, after reserving fees. */
    maxAmount?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
}
export interface SingleSparkTradeQuote {
    /** Exact human-readable decimal amount, in the output token. */ amountOut: string;
    minimumReceived: string;
    fee: string;
    priceImpact?: number;
    /** Unix milliseconds; the host must refresh expired quotes. */ expiresAt: number;
}
export type SingleSparkTransactionState = "idle" | "quoting" | "signing" | "submitted" | "confirmed" | "error";
export interface SingleSparkTradeRequest {
    side: SingleSparkTradeSide;
    token: SingleSparkToken;
    currency: SingleSparkToken;
    amount: string;
    slippageBps: number;
}
export declare const singleSparkNativeSol: SingleSparkToken;
export declare function singleSparkTradeRequestKey(request: SingleSparkTradeRequest): string;
export declare function isSingleSparkQuoteValid(quote: SingleSparkTradeQuote, decimals: number, now?: number): boolean;
export interface SingleSparkTokenTradePanelProps {
    token?: SingleSparkToken;
    currency?: SingleSparkToken;
    /** Human-readable balances; omit while unknown. */ tokenBalance?: string;
    currencyBalance?: string;
    /** Native currency available after fees; enables buy Max. */ maxBuyAmount?: string;
    connected?: boolean;
    onConnect?: () => void;
    onQuote?: (request: SingleSparkTradeRequest, signal: AbortSignal) => Promise<SingleSparkTradeQuote>;
    /** Host signs/submits; resolve confirmed only after actual chain confirmation. */
    onTrade?: (request: SingleSparkTradeRequest, quote: SingleSparkTradeQuote) => Promise<{
        hash?: string;
        status: "submitted" | "confirmed";
    }>;
    className?: string;
}
