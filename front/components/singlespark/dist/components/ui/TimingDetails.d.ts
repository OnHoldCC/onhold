import type { ProcessStep } from './ProcessSteps';
import { type TimingLabels } from './TimingSteps';
export declare function TimingDetails({ steps, details, labels }: {
    steps: readonly ProcessStep[];
    details?: readonly ProcessStep[];
    labels?: TimingLabels;
}): import("react").JSX.Element | null;
