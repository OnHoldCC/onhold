import type { ReactNode } from "react";
export interface BarChartProps {
    values: number[];
    title: string;
    total: ReactNode;
    labels?: string[];
    valueLabels?: string[];
    description?: string;
    emptyText?: string;
}
export declare function BarChart({ values, title, total, labels, valueLabels, description, emptyText, }: BarChartProps): import("react").JSX.Element;
