import { type ReactNode } from "react";
export interface SingleSparkModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    title?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    width?: number;
    closeOnBackdrop?: boolean;
    className?: string;
}
