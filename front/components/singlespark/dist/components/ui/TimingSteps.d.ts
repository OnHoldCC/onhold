import { type ProcessStep } from './ProcessSteps';
import './TimingSteps.css';
export type TimingLabels = Partial<Record<ProcessStep['status'] | 'steps' | 'elapsed' | 'details', string>>;
export declare function TimingSteps({ steps, labels }: {
    steps: readonly ProcessStep[];
    labels?: TimingLabels;
}): import("react").JSX.Element;
