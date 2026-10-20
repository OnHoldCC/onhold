import type { PreviewProps } from "./../../types";
import { Launchpad } from "../../singlespark-business.shared";
export declare function InitialBuyField({ value, onChange, platform, className, }: PreviewProps & {
    value?: string;
    onChange?: (v: string) => void;
    platform?: Launchpad;
}): import("react").JSX.Element;
