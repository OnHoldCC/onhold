import { type ReactNode } from "react";
import { type SingleSparkButtonProps } from "./singlespark-primitives";
import type { PreviewProps } from "./types";
export declare const walletImages: Record<string, string>;
export declare const image: (src: string) => string;
export interface SingleSparkWalletData {
    name: string;
    image: string;
    networks?: string[];
    qrCode?: boolean;
}
export declare const defaultWalletOptions: SingleSparkWalletData[];
export interface SingleSparkWalletButtonProps extends SingleSparkButtonProps {
    address?: string;
    connecting?: boolean;
    walletIcon?: ReactNode;
}
export interface SingleSparkWalletOptionProps {
    wallet?: SingleSparkWalletData;
    selected?: boolean;
    disabled?: boolean;
    onSelect?: (wallet: SingleSparkWalletData) => void;
    className?: string;
}
export interface SingleSparkWalletListProps {
    loading?: boolean;
    wallets?: SingleSparkWalletData[];
    selected?: string;
    searchable?: boolean;
    onSelect?: (wallet: SingleSparkWalletData) => void;
    className?: string;
}
export interface SingleSparkWalletStatusProps {
    status?: "disconnected" | "connecting" | "connected" | "error";
    wallet?: string;
    address?: string;
    message?: ReactNode;
    onDisconnect?: () => void;
    onRetry?: () => void;
    className?: string;
    walletIcon?: ReactNode;
}
export interface SingleSparkWalletDialogProps extends PreviewProps {
    open?: boolean;
    wallets?: SingleSparkWalletData[];
    presentation?: "inline" | "modal";
    onClose?: () => void;
    onConnectWallet?: (wallet: string) => void;
    onSearchWallet?: () => void;
}
