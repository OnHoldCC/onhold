import type { CSSProperties, ReactNode } from "react";
export interface SingleSparkAssetDisplay {
    symbol: string;
    name: string;
    icon: string;
    decimals: number;
}
/** Amount is already formatted in asset units; raw-unit conversion belongs to the caller. */
export declare function SingleSparkAssetAmount({ amount, asset, displayAmount, title, iconSize, iconClassName, className, style }: {
    amount: string | number;
    asset: SingleSparkAssetDisplay;
    displayAmount?: ReactNode;
    title?: string;
    iconSize?: number;
    iconClassName?: string;
    className?: string;
    style?: CSSProperties;
}): import("react").JSX.Element;
