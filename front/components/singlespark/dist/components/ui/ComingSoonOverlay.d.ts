import { type ReactNode } from 'react';
import './ComingSoonOverlay.css';
export interface ComingSoonOverlayProps {
    title: string;
    description: string;
    children?: ReactNode;
}
/** Cover one page's content while leaving the surrounding navigation usable. */
export declare function ComingSoonOverlay({ title, description, children }: ComingSoonOverlayProps): import("react").JSX.Element;
