import { type ReactNode } from "react";
export type BurnCardContent = {
    amount: ReactNode;
    description: ReactNode;
    route: ReactNode;
    status: ReactNode;
    time: ReactNode;
    details: ReactNode;
    detailsLabel: string;
};
export declare function BurnCard({ index, content, action }: {
    index?: number;
    content?: BurnCardContent;
    action?: {
        label: string;
        onClick: () => void;
        disabled?: boolean;
        loading?: boolean;
    };
}): import("react").JSX.Element;
