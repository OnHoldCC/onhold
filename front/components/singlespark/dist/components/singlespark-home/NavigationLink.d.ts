import { type ReactNode } from "react";
import type { PreviewProps } from "./../../types";
export declare function NavigationLink({ path, component, onNavigate, className, children, current, label, local, }: {
    path: string;
    component: string;
    onNavigate?: PreviewProps["onNavigate"];
    className?: string;
    children: ReactNode;
    current?: boolean;
    label?: string;
    local?: boolean;
}): import("react").JSX.Element;
