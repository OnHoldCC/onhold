import type { ReactEventHandler } from 'react';
export interface NetworkSelectorOption {
    value: string;
    label: string;
    icon?: string;
    disabled?: boolean;
}
export interface NetworkSelectorProps {
    value: string;
    options: readonly NetworkSelectorOption[];
    onChange: (value: string) => void;
    ariaLabel: string;
    className?: string;
    compact?: boolean;
    disabled?: boolean;
    locked?: boolean;
    placeholder?: string;
    scrollLabels: {
        previous: string;
        next: string;
    };
    onIconError?: ReactEventHandler<HTMLImageElement>;
}
/** Shared network row; compact locations use the same choices in a dropdown. */
export declare function NetworkSelector({ options, compact, disabled, locked, scrollLabels, onIconError, className, ...props }: NetworkSelectorProps): import("react").JSX.Element;
