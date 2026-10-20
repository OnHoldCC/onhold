import { type ReactNode, type ButtonHTMLAttributes } from "react";
export interface SingleSparkButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md";
    loading?: boolean;
    icon?: ReactNode;
    iconPosition?: "start" | "end";
}
export interface SingleSparkTabsProps<T extends string = string> {
    values?: readonly T[];
    value?: T;
    defaultValue?: T;
    onChange?: (value: T) => void;
    className?: string;
    label?: string;
    icons?: Partial<Record<T, ReactNode>>;
}
export interface SingleSparkCopyButtonProps {
    value?: string;
    label?: string;
    children?: ReactNode;
    className?: string;
    onCopy?: () => void;
    onError?: (error: unknown) => void;
}
export interface SingleSparkPaginationProps {
    page?: number;
    defaultPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
    className?: string;
}
export interface SingleSparkAccordionProps {
    label?: ReactNode;
    children?: ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
}
export interface SingleSparkListItemProps {
    selected?: boolean;
    disabled?: boolean;
    title?: ReactNode;
    description?: ReactNode;
    leading?: ReactNode;
    trailing?: ReactNode;
    onClick?: () => void;
    className?: string;
}
export declare const SingleSparkAvatarAsset0: URL;
export declare const SingleSparkListAsset1: URL;
