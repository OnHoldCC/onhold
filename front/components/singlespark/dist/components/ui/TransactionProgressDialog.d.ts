import type { ReactNode } from 'react';
import { type DetailDialogProps } from './DetailDialog';
import { type ProcessStep } from './ProcessSteps';
/** Presentation only; the caller owns receipts, recovery and completion. */
export declare function TransactionProgressDialog({ status, steps, elapsed, children, ...dialog }: Omit<DetailDialogProps, 'children'> & {
    status: string;
    steps: readonly ProcessStep[];
    elapsed: string | undefined;
    children: ReactNode;
}): import("react").JSX.Element;
