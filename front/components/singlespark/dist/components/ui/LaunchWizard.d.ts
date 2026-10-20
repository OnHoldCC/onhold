import { type FormHTMLAttributes, type ReactNode } from 'react';
import './LaunchWizard.css';
export type LaunchWizardStep = {
    label: string;
    title: string;
    description?: string;
    content: ReactNode;
};
export declare function LaunchWizard({ title, description, steps, preview, nextLabel, nextDisabled, backLabel, submitLabel, submitLoading, disabled, submitDisabled, secondaryAction, onSubmit, onContinue, step: controlledStep, onStepChange, ...form }: Omit<FormHTMLAttributes<HTMLFormElement>, 'children' | 'title'> & {
    title: string;
    description?: string;
    steps: readonly [LaunchWizardStep, LaunchWizardStep];
    preview: ReactNode | ((step: number) => ReactNode);
    nextLabel: string;
    nextDisabled?: boolean;
    backLabel: string;
    submitLabel: string;
    submitLoading?: boolean;
    disabled?: boolean;
    submitDisabled?: boolean;
    secondaryAction?: ReactNode;
    onContinue?: () => boolean;
    step?: 0 | 1;
    onStepChange?: (step: 0 | 1) => void;
}): import("react").JSX.Element;
