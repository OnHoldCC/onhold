import type { FormHTMLAttributes, ReactNode } from 'react';
import './LaunchFormLayout.css';
export declare function LaunchFormLayout({ children, preview, ...form }: FormHTMLAttributes<HTMLFormElement> & {
    preview: ReactNode;
}): import("react").JSX.Element;
