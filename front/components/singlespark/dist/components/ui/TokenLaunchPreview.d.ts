import type { ReactNode } from 'react';
import './TokenLaunchPreview.css';
export declare function TokenLaunchPreview({ label, name, symbol, avatar, cover, description, badges, socials, children }: {
    label: string;
    name: string;
    symbol: string;
    avatar: ReactNode;
    cover: ReactNode;
    description?: string;
    badges?: ReactNode;
    socials?: ReactNode;
    children?: ReactNode;
}): import("react").JSX.Element;
