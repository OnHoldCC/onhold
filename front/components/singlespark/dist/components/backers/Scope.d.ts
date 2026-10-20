import { type ReactNode } from "react";
import type { PreviewProps } from "./../../types";
export declare function Scope({ name, children, ...props }: PreviewProps & {
    name: string;
    children: ReactNode;
}): import("react").JSX.Element;
