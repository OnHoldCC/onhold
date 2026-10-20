import type { ReactNode } from 'react';
import './FeedbackState.css';
export interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    compact?: boolean;
    className?: string;
}
/** Shared empty-state hierarchy with an optional follow-up action. */
export declare function EmptyState({ title, description, icon, action, compact, className, }: EmptyStateProps): import("react").JSX.Element;
