import React, { type ReactNode } from "react";
import type { PreviewProps } from "./types";
import data from "../assets/backers/snapshot.json";
export declare const asset: (path: string) => string;
export type BackersCoin = (typeof data.coins)[number];
export type BackersPerson = (typeof data.people)[number];
export type BackersPayment = (typeof data.events)[number];
export type BackersCandle = {
    t: number;
    o: number;
    h: number;
    l: number;
    c: number;
    v: string;
};
export interface CoinProps extends PreviewProps {
    coin?: BackersCoin;
}
export interface CoinListProps extends PreviewProps {
    coins?: BackersCoin[];
}
export interface PersonProps extends PreviewProps {
    person?: BackersPerson;
    rank?: number;
}
export interface PaymentProps extends PreviewProps {
    payment?: BackersPayment;
}
export declare const Navigation: React.Context<PreviewProps>;
export declare const money: (cents: number) => string;
export declare function compact(cents: number): string;
export declare function tokenPrice(value: number): string;
export declare const brief: (s: string) => string;
export interface SlippageProps extends PreviewProps {
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    defaultOpen?: boolean;
}
export interface TradeFormProps extends CoinProps {
    initialAmount?: string;
    walletConnected?: boolean;
    onAmountChange?: (amount: string) => void;
    onTrade?: (trade: {
        side: "buy" | "sell";
        amount: string;
        slippage: number;
        coin: BackersCoin;
    }) => void;
}
export interface TokenImageProps extends PreviewProps {
    onImageChange?: (file: File) => void;
}
export interface RecipientLookupProps extends PreviewProps {
    onLookup?: (handle: string) => Promise<{
        handle: string;
        name: string;
    } | null>;
    onRecipientChange?: (handle: string) => void;
}
export interface MetadataValue {
    name: string;
    symbol: string;
    description: string;
    telegram: string;
}
export interface MetadataProps extends RecipientLookupProps, TokenImageProps {
    initialValue?: Partial<MetadataValue>;
    onMetadataChange?: (value: MetadataValue) => void;
}
export interface RegisterProps extends PreviewProps {
    onCheck?: (mint: string) => Promise<string>;
}
export interface TradeTableProps extends CoinProps {
    trades?: typeof data.trades.trades;
}
export declare const howSteps: string[][];
export declare const contents: string[][];
export declare const faq: string[][];
export type CandleInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";
export type ChartUnit = "price" | "mcap";
export interface MarketChartProps extends CoinProps {
    interval?: CandleInterval;
    defaultInterval?: CandleInterval;
    unit?: ChartUnit;
    defaultUnit?: ChartUnit;
    onIntervalChange?: (interval: CandleInterval) => void;
    onUnitChange?: (unit: ChartUnit) => void;
    candles?: Partial<Record<CandleInterval, BackersCandle[]>>;
}
export interface ChartSeries {
    setData: (values: Record<string, number | string>[]) => void;
    priceScale: () => {
        applyOptions: (options: object) => void;
    };
}
export interface NativeChart {
    remove: () => void;
    addSeries: (definition: unknown, options: object) => ChartSeries;
    timeScale: () => {
        fitContent: () => void;
        applyOptions: (options: object) => void;
        scrollToRealTime: () => void;
    };
}
export interface ChartSDK {
    createChart: (element: HTMLElement, options: object) => NativeChart;
    CandlestickSeries: unknown;
    HistogramSeries: unknown;
    LineSeries: unknown;
    LineStyle: {
        Dashed: number;
    };
    ColorType: {
        Solid: string;
    };
    CrosshairMode: {
        Normal: number;
    };
}
export declare const chartURL: string;
export declare const emptyCandles: BackersCandle[];
export declare const intervalSeconds: Record<CandleInterval, number>;
export interface PersonHeaderProps extends PreviewProps {
    profile?: typeof data.personDetail;
    coin?: BackersCoin;
}
export interface TradePanelProps extends TradeFormProps {
    defaultMode?: "buy" | "sell" | "back";
    onModeChange?: (mode: "buy" | "sell" | "back") => void;
}
export declare const rules: string[][];
export declare const glossary: string[][];
export interface BackersButtonProps extends PreviewProps {
    children?: ReactNode;
    variant?: "primary" | "secondary" | "inverse" | "danger";
    size?: "default" | "large";
    disabled?: boolean;
    target?: string;
    action?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}
export interface BackersTabsProps extends PreviewProps {
    items?: readonly (readonly [string, string])[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    pills?: boolean;
    label?: string;
}
export interface BackersInputProps extends PreviewProps {
    label?: string;
    hint?: string;
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    type?: React.HTMLInputTypeAttribute;
    disabled?: boolean;
}
export interface BackersBadgeProps extends PreviewProps {
    variant?: "instant" | "graduated";
    children?: ReactNode;
}
export interface BackersAvatarProps extends PreviewProps {
    person?: {
        avatar_url?: string | null;
        handle?: string;
    };
    size?: number;
}
export interface BackersListProps extends PreviewProps {
    people?: BackersPerson[];
    children?: ReactNode;
}
export interface BackersSearchProps extends PreviewProps {
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
}
