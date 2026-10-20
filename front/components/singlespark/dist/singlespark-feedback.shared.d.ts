import { type CSSProperties, type ReactNode } from "react";
export interface SingleSparkLoadingProps {
    loading?: boolean;
    variant?: "spinner" | "dots";
    size?: number;
    label?: string;
    /** Show the label alongside the indicator. */
    showLabel?: boolean;
    /** Decorative indicators inside an already labelled button/status. */
    decorative?: boolean;
    children?: ReactNode;
    className?: string;
}
export declare const singleSparkSkeletonVariants: readonly ["text", "avatar", "button", "input", "card", "list", "table", "stat", "chart", "trade", "wallet"];
export type SingleSparkSkeletonVariant = (typeof singleSparkSkeletonVariants)[number];
export interface SingleSparkSkeletonProps {
    /** A parent already announces loading. */
    decorative?: boolean;
    style?: CSSProperties;
    /** Use a preset or compose basic shapes to match any component. */
    variant?: SingleSparkSkeletonVariant;
    /** Render children when loading is false. */
    loading?: boolean;
    animation?: "wave" | "pulse" | false;
    rows?: number;
    width?: CSSProperties["width"];
    height?: CSSProperties["height"];
    label?: string;
    children?: ReactNode;
    className?: string;
}
