import type { ReactNode } from 'react';
import './DetailDialog.css';
/** Shared detail and transaction dialog, outside page layout and stacking contexts. */
export interface DetailDialogProps {
    title: string;
    ariaLabel?: string;
    open?: boolean;
    onClose: () => void;
    children: ReactNode;
    closeLabel: string;
}
export declare function DetailDialog({ title, ariaLabel, open, onClose, children, closeLabel }: DetailDialogProps): import("react").ReactPortal;
