import type { PreviewProps } from "./../../types";
export declare function LaunchCurrency({ value, onChange, className, }: PreviewProps & {
    value?: "SOL" | "PAID";
    onChange?: (value: "SOL" | "PAID") => void;
}): import("react").JSX.Element;
