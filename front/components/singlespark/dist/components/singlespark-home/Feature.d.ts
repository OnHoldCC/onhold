import { type ReactNode } from "react";
import type { PreviewProps } from "./../../types";
export declare function Feature({ title, children, wide, onNavigate, navigation, interactive, }: {
    title: string;
    children: ReactNode;
    wide?: boolean;
    onNavigate?: PreviewProps["onNavigate"];
    navigation?: {
        path: string;
        label?: string;
    };
    interactive?: boolean;
}): import("react").JSX.Element;
