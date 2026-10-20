import type { PreviewProps } from "./../../types";
export declare function LaunchConsentAndWallet({ agreed, onAgreementChange, onConnect, className, onAction, }: PreviewProps & {
    agreed?: boolean;
    onAgreementChange?: (v: boolean) => void;
    onConnect?: () => void;
}): import("react").JSX.Element;
