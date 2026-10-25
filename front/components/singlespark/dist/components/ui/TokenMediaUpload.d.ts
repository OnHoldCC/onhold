import type { ReactNode } from 'react';
import './TokenMediaUpload.css';
export declare function TokenMediaUpload({ value, t, authenticated, onAuthenticate, onChange, onBusyChange, uploadMedia, large, imagesOnly, disabled, compact, renderError, }: {
    renderError?: (message: string) => ReactNode;
    value: string;
    t: (key: string) => string;
    authenticated: boolean;
    onAuthenticate: () => void;
    onChange: (url: string) => void;
    onBusyChange: (busy: boolean) => void;
    uploadMedia?: (file: File) => Promise<string>;
    large?: boolean;
    imagesOnly?: boolean;
    disabled?: boolean;
    compact?: boolean;
}): import("react").JSX.Element;
