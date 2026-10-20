import { type ReactNode } from 'react';
import './CollectibleCarousel.css';
/** Browses supplied cards; eligibility, random results and rewards belong to the caller. */
export declare function CollectibleCarousel({ items, label, previousLabel, nextLabel }: {
    items: readonly {
        id: string;
        label: string;
        content: ReactNode;
    }[];
    label: string;
    previousLabel: string;
    nextLabel: string;
}): import("react").JSX.Element;
