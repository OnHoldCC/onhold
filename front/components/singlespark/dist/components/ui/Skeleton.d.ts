import type { CSSProperties } from 'react';
import './FeedbackState.css';
export interface SkeletonProps {
    count?: number;
    width?: CSSProperties['width'];
    height?: CSSProperties['height'];
    borderRadius?: CSSProperties['borderRadius'];
    gap?: CSSProperties['gap'];
    ariaLabel?: string | null;
    className?: string;
}
/** Shared block or multiline loading skeleton with reduced-motion support. */
export declare function Skeleton({ count, width, height, borderRadius, gap, ariaLabel, className, }: SkeletonProps): import("react").JSX.Element;
