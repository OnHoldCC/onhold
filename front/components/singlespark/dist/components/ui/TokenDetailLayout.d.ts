import type { ReactNode } from 'react';
import './TokenDetailLayout.css';
export declare function TokenDetailHeader({ avatar, title, meta, metrics, children }: {
    avatar: ReactNode;
    title: ReactNode;
    meta: ReactNode;
    metrics?: ReactNode;
    children?: ReactNode;
}): import("react").JSX.Element;
export declare function TokenDetailLayout({ header, actions, actionsLabel, history, historyLabel, children, className }: {
    header: ReactNode;
    actions?: ReactNode;
    actionsLabel?: string;
    history?: ReactNode;
    historyLabel?: string;
    children?: ReactNode;
    className?: string;
}): import("react").JSX.Element;
export declare function TokenHistoryToolbar({ tabs, actions, actionsLabel, hint }: {
    tabs: ReactNode;
    actions?: ReactNode;
    actionsLabel: string;
    hint?: ReactNode;
}): import("react").JSX.Element;
