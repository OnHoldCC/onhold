import { type ReactNode } from 'react';
import './CollectibleMarquee.css';
/** A continuous artwork strip; supplied cards never imply a draw or owned NFT. */
export declare function CollectibleMarquee({ items, label, pauseLabel, resumeLabel }: {
    items: readonly {
        id: string;
        content: ReactNode;
    }[];
    label: string;
    pauseLabel: string;
    resumeLabel: string;
}): import("react").JSX.Element;
