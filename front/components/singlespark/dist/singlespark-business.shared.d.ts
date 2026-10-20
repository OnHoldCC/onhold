import { type ReactNode } from "react";
import type { PreviewProps } from "./types";
export type Launchpad = "Pump" | "Pons";
export type ChartInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "1D";
export declare const candleUrls: Record<ChartInterval, string>;
export interface SingleSparkTokenData {
    name: string;
    ticker: string;
    image: string;
    avatar?: string;
    platform: Launchpad | string;
    recipient?: string;
    handle?: string;
    age: string;
    mc: string;
    href: string;
    badge?: string;
    amount?: string;
    address?: string;
    shortAddress?: string;
}
export interface TransferData {
    asset: string;
    amount: string;
    transactionUrl: string;
}
export interface PaymentBreakdownData {
    ticker: string;
    image: string;
    amount: string;
    transfers: TransferData[];
}
export interface PaymentData {
    amount: string;
    recipient: string;
    avatar: string;
    age: string;
    breakdowns: PaymentBreakdownData[];
}
export interface LaunchDraft {
    name: string;
    ticker: string;
    recipient: string;
    description: string;
    imageUrl?: string;
    website: string;
    telegram: string;
    x: string;
    initialBuy: string;
    deployerReward: string;
    deployerHandle: string;
    tax: string;
    agreed: boolean;
}
export interface SingleSparkTokenCardProps extends PreviewProps {
    token?: SingleSparkTokenData;
    onRecipientClick?: (handle: string) => void;
}
export interface PaymentRowProps extends PreviewProps {
    payment?: PaymentData;
    recipientLabel?: string;
    avatar?: ReactNode;
    children?: ReactNode;
    expanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
}
export interface LaunchPreviewProps extends PreviewProps {
    details?: ReactNode;
    notification?: ReactNode;
    draft?: Partial<LaunchDraft>;
    motionPaused?: boolean;
    recipientName?: string;
    note?: string;
}
export interface PaginationProps extends PreviewProps {
    page?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
}
export interface LaunchpadFilterProps extends PreviewProps {
    value?: Launchpad | "All";
    defaultValue?: Launchpad | "All";
    onChange?: (value: Launchpad | "All") => void;
    includeAll?: boolean;
}
export interface DraftFieldProps extends PreviewProps {
    value?: Partial<LaunchDraft>;
    onChange?: (value: Partial<LaunchDraft>) => void;
}
export declare const asset: (name: string) => string;
export declare const tokenMint = "CbcyNo7m1amFWqEQm2m4PLv1UNvpcL3C1Ujm6AkzpKoU";
export declare const singleSparkMint = "98kfF7rmsg1QDUEoCqNE7g7M1FdrTt92TEp2CLzypump";
export declare const treasury = "FfLpuH4WPn2MR8Lqn1MpwQc1HtAPPqL3qvMWZjnFHGpv";
export declare const emptyDraft: LaunchDraft;
export declare function useValue<T>(value: T | undefined, initial: T, onChange?: (value: T) => void): [T, (value: T) => void];
export interface ExploreFilterValue {
    venues: Launchpad[];
    query: string;
    sort: "Total X Payments" | "Market Cap" | "Recent";
}
export interface ExploreFiltersProps extends PreviewProps {
    value?: ExploreFilterValue;
    onChange?: (value: ExploreFilterValue) => void;
}
export declare const initialExplore: ExploreFilterValue;
export declare const demoTransfer: TransferData;
export declare const demoBreakdown: PaymentBreakdownData;
export declare const defaultSingleSparkPayment: PaymentData;
export declare const rampTx = "2aLSYucwFzMhT67kqPwrVSGU9JRZkKPYjRnX1cFQWbZDFteidZ2cFX5xey6Q369DGwFV55JwkVHtLvVoUnLnaoqK";
export type RampType = "Deposits" | "Swaps" | "ACH" | "On-ramp";
export interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}
export interface SingleSparkMarketChartProps extends PreviewProps {
    interval?: ChartInterval;
    onIntervalChange?: (interval: ChartInterval) => void;
    candles?: Candle[];
    symbol?: string;
    onCandleChange?: (candle: Candle) => void;
}
export declare const chartFormat: (value: number) => string;
export declare function useDraft(value: Partial<LaunchDraft> | undefined, onChange?: (draft: Partial<LaunchDraft>) => void): readonly [{
    name: string;
    ticker: string;
    recipient: string;
    description: string;
    imageUrl?: string;
    website: string;
    telegram: string;
    x: string;
    initialBuy: string;
    deployerReward: string;
    deployerHandle: string;
    tax: string;
    agreed: boolean;
}, (patch: Partial<LaunchDraft>) => void];
export interface RegisterFormProps extends PreviewProps {
    recipient?: string;
    mint?: string;
    onRecipientChange?: (v: string) => void;
    onMintChange?: (v: string) => void;
    onCheck?: (mint: string) => Promise<{
        confirmed: boolean;
        message?: string;
    }>;
    onRegister?: (mint: string, recipient: string) => Promise<void>;
}
export interface SingleSparkLaunchModesProps extends PreviewProps {
    defaultMode?: "Launch" | "Register" | "Walletless";
    mode?: "Launch" | "Register" | "Walletless";
    onModeChange?: (v: "Launch" | "Register" | "Walletless") => void;
    draft?: Partial<LaunchDraft>;
    onDraftChange?: (v: Partial<LaunchDraft>) => void;
    onConnect?: () => void;
    onImageFile?: (file: File) => void;
    register?: RegisterFormProps;
}
export declare const burnTx = "22AXVUsrdACnEtsD4jDj2p9AYPUf4HceyYe3EfzHdSVqaeXAnRdhP77h7QStJW34kkEHfLuPMP4HH9g1XNQJEFiC";
export declare const MarketChartCoreAsset0: URL;
