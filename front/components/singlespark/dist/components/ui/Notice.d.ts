import type { ReactNode } from 'react';
import './Notice.css';
export interface NoticeProps {
    title: ReactNode;
    children: ReactNode;
    icon?: ReactNode;
    onClose?: () => void;
    closeLabel?: string;
}
/** The atlas notice with an optional status icon and accessible dismissal. */
export declare function Notice({ title, children, icon, onClose, closeLabel }: NoticeProps): import("react").JSX.Element;
