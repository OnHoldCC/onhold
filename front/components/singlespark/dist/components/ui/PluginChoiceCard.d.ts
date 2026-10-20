import { type ReactNode } from 'react';
import './PluginChoiceCard.css';
export declare function PluginChoiceCard({ title, description, icon, checked, onChange, children, disabled }: {
    title: string;
    description: string;
    icon?: ReactNode;
    checked: boolean;
    onChange: (checked: boolean) => void;
    children?: ReactNode;
    disabled?: boolean;
}): import("react").JSX.Element;
