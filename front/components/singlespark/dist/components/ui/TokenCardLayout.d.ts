import type { ReactNode } from 'react';
import './TokenCardLayout.css';
export declare function TokenCardLayout({ variant, cover, avatar, identity, change, networks, facts, metrics, progress, footer, children }: {
    variant?: 'compact' | 'image';
    cover?: ReactNode;
    avatar?: ReactNode;
    identity: ReactNode;
    change?: ReactNode;
    networks?: ReactNode;
    facts?: ReactNode;
    metrics?: ReactNode;
    progress?: ReactNode;
    footer?: ReactNode;
    children?: ReactNode;
}): import("react").JSX.Element;
