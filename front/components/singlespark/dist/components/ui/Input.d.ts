import { type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import './Input.css';
/** Shared field styling; native validation, refs and form events pass through. */
export declare const Input: import("react").ForwardRefExoticComponent<InputHTMLAttributes<HTMLInputElement> & {
    bare?: boolean;
} & import("react").RefAttributes<HTMLInputElement>>;
export declare const Textarea: import("react").ForwardRefExoticComponent<TextareaHTMLAttributes<HTMLTextAreaElement> & import("react").RefAttributes<HTMLTextAreaElement>>;
export declare const Checkbox: import("react").ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & import("react").RefAttributes<HTMLInputElement>>;
export declare const RangeInput: import("react").ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & import("react").RefAttributes<HTMLInputElement>>;
