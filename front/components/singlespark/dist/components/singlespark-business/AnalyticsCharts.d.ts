import type { PreviewProps } from "./../../types";
import { type BarChartProps } from "./BarChart";
export declare function AnalyticsCharts({ fees, burns, charts, className, }: PreviewProps & {
    fees?: number[];
    burns?: number[];
    charts?: BarChartProps[];
}): import("react").JSX.Element;
