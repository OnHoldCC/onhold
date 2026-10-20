import type { ReactNode } from "react";
export interface SingleSparkStatCardProps {
    label?: string;
    value?: ReactNode;
    change?: number;
    period?: string;
    icon?: ReactNode;
    history?: readonly number[];
    loading?: boolean;
    className?: string;
}
export interface SingleSparkTradeRow {
    id: string;
    side: "buy" | "sell";
    amount: string;
    total: string;
    account: string;
    time: string;
}
