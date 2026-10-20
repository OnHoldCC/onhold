import type { ReactNode } from "react";
export declare function NotificationFrame({ step, className, age, recipient, note, paused, title, children, actions, onClose, closeLabel, variant, }: {
    step?: number;
    className?: string;
    age?: string;
    recipient?: string;
    note?: string;
    paused?: boolean;
    title?: ReactNode;
    children?: ReactNode;
    actions?: ReactNode;
    onClose?: () => void;
    closeLabel?: string;
    variant?: "notification" | "toast";
}): import("react").JSX.Element;
