import React from "react";
export declare function Button({ children, target, action, variant, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    target?: string;
    action?: string;
    variant?: string;
}): React.JSX.Element;
