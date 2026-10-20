import { type RefObject } from 'react';
import './NavigationIndicator.css';
/** One decorative liquid surface shared by sidebar, bottom bar and overflow. */
export declare function NavigationIndicator({ targetRef, clipSelector, className, zIndex }: {
    targetRef: RefObject<HTMLElement>;
    clipSelector?: string;
    className?: string;
    zIndex?: number;
}): import("react").ReactPortal | null;
