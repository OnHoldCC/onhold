import type { ReactNode } from 'react';
import { type DetailDialogProps } from './DetailDialog';
import { type ProcessStep } from './ProcessSteps';
/** Presentation only; the caller owns receipts, recovery and completion. */
export declare function TransactionProgressDialog({ status, steps, elapsed, children, labels, ...dialog }: Omit<DetailDialogProps, 'children'> & {
    status: string;
    labels?: Partial<Record<ProcessStep['status'] | 'steps' | 'elapsed',string>>;
    steps: readonly ProcessStep[];
    elapsed: string | undefined;
    children: ReactNode;
}): import("react").JSX.Element;
