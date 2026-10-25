import type { ProcessStep } from './ProcessSteps';
import { type TimingLabels } from './TimingSteps';
export declare function InteractionTimings({ view, labels }: {
    view?: {
        steps: readonly ProcessStep[];
        details: readonly ProcessStep[];
        elapsed: string;
    } | null;
    labels?: TimingLabels;
}): import("react").JSX.Element | null;
