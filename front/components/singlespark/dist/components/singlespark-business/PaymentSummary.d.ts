import type { PreviewProps } from "./../../types";
export interface PaymentSummaryProps extends PreviewProps {
    payouts?: string;
    claims?: string;
    payoutsLabel?: string;
    claimsLabel?: string;
    unit?: string;
}
export declare function PaymentSummary({ payouts, claims, payoutsLabel, claimsLabel, unit, className, }: PaymentSummaryProps): import("react").JSX.Element;
