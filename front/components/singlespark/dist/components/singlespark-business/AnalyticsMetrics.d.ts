import type { PreviewProps } from "./../../types";
import type { ReactNode } from "react";
export declare function AnalyticsMetrics({ metrics, className, loading, }: PreviewProps & {
    metrics?: {
        label: string;
        value: string;
        unit?: ReactNode;
        comparison?: string;
    }[];
    loading?: boolean;
}): import("react").JSX.Element;
