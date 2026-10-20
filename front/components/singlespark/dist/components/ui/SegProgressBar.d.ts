import './SegProgressBar.css';
/** Segmented progress with a coral-to-blue gradient and glow, a moving brightness wave, pulsing leading segments and a smooth reveal. A completed value turns the segments green when showDone is enabled. */
export interface SegProgressBarProps {
    /** Progress from 0 to 100. */
    value: number;
    /** Number of segments. */
    cells?: number;
    /** Number of pulsing leading segments; zero disables the pulse. */
    headCount?: number;
    /** Height in pixels. */
    height?: number;
    /** Segment gap in pixels. */
    gap?: number;
    /** Animate from zero to value on mount. */
    reveal?: boolean;
    /** Show the green completion state when value is at least 100. */
    showDone?: boolean;
    ariaLabel?: string;
    style?: React.CSSProperties;
    className?: string;
}
export declare function SegProgressBar({ value, cells, headCount, height, gap, reveal, showDone, ariaLabel, style, className, }: SegProgressBarProps): import("react").JSX.Element;
