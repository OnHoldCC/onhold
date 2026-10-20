import type { HTMLAttributes, ReactNode } from 'react';
import './Select.css';
export interface SelectOption<T extends string> {
    value: T;
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
}
export interface SelectProps<T extends string> {
    value: T;
    options: readonly SelectOption<T>[];
    onChange: (value: T) => void;
    ariaLabel: string;
    className?: string;
    compact?: boolean;
    disabled?: boolean;
    placeholder?: string;
    editable?: boolean;
    inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
    iconPlacement?: 'start' | 'end';
    inputIcon?: ReactNode;
    optionsLabel?: string;
}
/** Themed dropdown with keyboard navigation and ARIA listbox semantics. */
export declare function Select<T extends string>({ value, options, onChange, ariaLabel, className, compact, disabled, placeholder, editable, inputMode, iconPlacement, inputIcon, optionsLabel, }: SelectProps<T>): import("react").JSX.Element;
