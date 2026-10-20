import type { PreviewProps } from "./../../types";
export declare function AnalyticsRange({ value, onChange, ranges, title, className, }: PreviewProps & {
    value?: "24h" | "7d" | "30d" | "All";
    onChange?: (v: "24h" | "7d" | "30d" | "All") => void;
    ranges?: readonly ("24h" | "7d" | "30d" | "All")[];
    title?: string | null;
}): import("react").JSX.Element;
