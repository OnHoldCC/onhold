import { type ReactNode } from 'react';
import './CollectibleFan.css';
/** A browsable hand of supplied cards; fetching and page boundaries belong to the caller. */
export declare function CollectibleFan({ items, label, previousLabel, nextLabel, visibleCount }: {
    items: readonly {
        id: string;
        label: string;
        content: ReactNode | ((flipped: boolean) => ReactNode);
    }[];
    label: string;
    previousLabel: string;
    nextLabel: string;
    visibleCount?: number;
}): import("react").JSX.Element;
