import './ProcessSteps.css';
export interface ProcessStep {
    id: string;
    label: string;
    status: 'pending' | 'active' | 'complete' | 'error';
    description?: string;
    elapsed?: string;
}
/** Read-only steps; the caller supplies progress from its own operation. */
export declare function ProcessSteps({ steps, label, statusLabels, elapsedLabel }: {
    steps: readonly ProcessStep[];
    label: string;
    statusLabels?: Partial<Record<ProcessStep['status'], string>>;
    elapsedLabel?: string;
}): import("react").JSX.Element;
