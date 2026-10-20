import type { ReactNode } from 'react';
import './VaultOverview.css';
export declare function VaultOverview({ label, balances, address, delay, children }: {
    label: string;
    balances: {
        label: string;
        amount: ReactNode;
    }[];
    address?: ReactNode;
    delay?: ReactNode;
    children?: ReactNode;
}): import("react").JSX.Element;
export declare function RevenueAllocation({ label, items, summary, rules, rulesLabel }: {
    label: string;
    items: {
        label: string;
        percent: number;
        detail?: ReactNode;
    }[];
    summary?: {
        label: string;
        amount: ReactNode;
    };
    rules?: ReactNode;
    rulesLabel: string;
}): import("react").JSX.Element;
