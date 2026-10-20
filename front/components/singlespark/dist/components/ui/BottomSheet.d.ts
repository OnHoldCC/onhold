import type { ReactNode } from 'react';
import './BottomSheet.css';
/** Bounded bottom sheet using the shared dialog's focus, Escape and backdrop behavior. */
export declare function BottomSheet({ open, onClose, title, closeLabel, children, bottomInset }: {
    open: boolean;
    onClose: () => void;
    title: string;
    closeLabel: string;
    children: ReactNode;
    bottomInset?: number;
}): import("react").ReactPortal | null;
