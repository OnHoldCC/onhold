import type { ReactNode } from 'react';
import './SegmentedTabs.css';
export interface SegmentedTabOption<T extends string> {
    value: T;
    label: ReactNode;
    icon?: ReactNode;
    count?: ReactNode;
    ariaLabel?: string;
    disabled?: boolean;
}
interface SegmentedTabsProps<T extends string> {
    value: T;
    options: readonly SegmentedTabOption<T>[];
    onChange: (value: T) => void;
    ariaLabel: string;
    panelId?: string;
    className?: string;
    fillOnMobile?: boolean;
    collapseIconsOnMobile?: boolean;
    scrollLabels?: {
        previous: string;
        next: string;
    };
}
/** Reusable pill tabs and filters. */
export declare function SegmentedTabs<T extends string>({ value, options, onChange, ariaLabel, panelId, className, fillOnMobile, collapseIconsOnMobile, scrollLabels, }: SegmentedTabsProps<T>): import("react").JSX.Element;
export {};
