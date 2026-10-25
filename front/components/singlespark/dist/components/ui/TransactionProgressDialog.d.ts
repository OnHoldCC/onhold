import { type ReactNode } from 'react';
import { type DialogProps } from './Dialog';
import type { ProcessStep } from './ProcessSteps';
import { type TimingLabels } from './TimingSteps';
import './TransactionProgressDialog.css';
/** Closing only dismisses this view; receipts, recovery and transaction lifetime belong to the caller. */
export declare function TransactionProgressDialog({ title, status, steps, details, elapsed, children, labels, done, open, closeLabel, onClose, className, ...dialog }: Omit<DialogProps, 'children'> & {
    title: string;
    status: string;
    steps: readonly ProcessStep[];
    details?: readonly ProcessStep[];
    elapsed?: string;
    children?: ReactNode;
    labels?: TimingLabels;
    done?: boolean;
    closeLabel?: string;
    onClose: () => void;
}): import("react").ReactPortal | null;
