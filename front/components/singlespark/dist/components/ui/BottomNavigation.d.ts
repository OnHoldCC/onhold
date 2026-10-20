import { type MouseEventHandler, type ReactNode } from 'react';
import './BottomNavigation.css';
export interface BottomNavigationItem {
    id: string;
    label: string;
    icon: ReactNode;
    href?: string;
    active?: boolean;
    expanded?: boolean;
    onClick?: MouseEventHandler<HTMLElement>;
}
/** One persistent selection follows icons between the bar and its overflow sheet. */
export declare function BottomNavigation({ label, items, className, overflow }: {
    label: string;
    items: BottomNavigationItem[];
    className?: string;
    overflow?: {
        title: string;
        closeLabel: string;
        items: BottomNavigationItem[];
        onClose: () => void;
        footer?: ReactNode;
    };
}): import("react").JSX.Element;
