import { type ReactNode } from "react";
import type { PreviewProps } from "./../../types";
import { PaymentData } from "../../singlespark-business.shared";
export declare function TokenActivityTabs({ payments, claims, className, }: PreviewProps & {
    payments?: PaymentData[];
    claims?: ReactNode;
}): import("react").JSX.Element;
