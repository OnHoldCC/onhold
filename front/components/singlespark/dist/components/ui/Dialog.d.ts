import { type CSSProperties, type ReactNode, type RefObject } from 'react';
import './Dialog.css';
/** Shared by dialogs and the persistent mobile trade panel. Only the top modal handles input. */
export declare function useDialogInteraction(open: boolean, dialogRef: RefObject<HTMLElement | null>, { onClose, closeOnEscape, initialFocusRef, }?: Pick<DialogProps, 'onClose' | 'closeOnEscape' | 'initialFocusRef'>): void;
export interface DialogProps {
    open?: boolean;
    children: ReactNode;
    onClose?: () => void;
    closeOnEscape?: boolean;
    closeOnOverlayClick?: boolean;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
    initialFocusRef?: RefObject<HTMLElement | null>;
    overlayClassName?: string;
    className?: string;
    overlayStyle?: CSSProperties;
    style?: CSSProperties;
}
/** Stateless modal shell with a shared overlay, close policy and focus management. */
export declare const Dialog: import("react").ForwardRefExoticComponent<DialogProps & import("react").RefAttributes<HTMLDivElement>>;
