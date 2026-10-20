import { type PointerEvent, type ReactNode } from 'react';
import './CollectibleCard.css';
export declare function tiltCollectibleCard(card: HTMLElement | null, event: PointerEvent<HTMLElement>): void;
/** Card frame, tilt and diagonal sheen adapted from the user-supplied FWA AssetCard. */
export declare function CollectibleCard({ title, collection, eyebrow, grade, artwork, details, flipped: controlledFlipped, flipLabel }: {
    title: string;
    collection?: string;
    eyebrow?: string;
    grade?: {
        label: string;
        value: ReactNode;
    };
    artwork: ReactNode;
    details?: readonly {
        label: string;
        value: ReactNode;
    }[];
    flipped?: boolean;
    flipLabel?: string;
}): import("react").JSX.Element;
