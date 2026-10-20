import type { ReactNode } from "react";
import { SingleSparkTransactionState } from "../../singlespark-trade.shared";
export declare function SingleSparkTransactionStatus({ status, message, label, hash, className, }: {
    status?: SingleSparkTransactionState;
    message?: ReactNode;
    label?: string;
    hash?: string;
    className?: string;
}): import("react").JSX.Element;
