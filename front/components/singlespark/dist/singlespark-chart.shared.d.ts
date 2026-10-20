export interface SingleSparkCandle {
    /** UTC Unix timestamp in seconds. */ time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}
export declare function normalizeSingleSparkCandles(data: readonly SingleSparkCandle[]): SingleSparkCandle[];
export interface SingleSparkCandlestickChartProps {
    data?: readonly SingleSparkCandle[];
    symbol?: string;
    interval?: string;
    intervals?: readonly string[];
    /** Host supplies fresh bars when the timeframe changes. */
    onIntervalChange?: (interval: string) => void;
    height?: number;
    precision?: number;
    loading?: boolean;
    error?: string;
    onRetry?: () => void;
    className?: string;
}
export declare const emptyBars: SingleSparkCandle[];
export declare const SingleSparkCandlestickChartAsset0: URL;
