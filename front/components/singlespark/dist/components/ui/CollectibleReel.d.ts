import { type ReactNode } from 'react';
import './CollectibleReel.css';
/** The host supplies the verified result; scrolling never selects a prize. */
export declare function CollectibleReel({ items, spinning, resultId, label, waitingLabel }: {
    items: readonly {
        id: string;
        label: string;
        content: ReactNode;
    }[];
    spinning: boolean;
    resultId?: string;
    label: string;
    waitingLabel: string;
}): import("react").JSX.Element;
