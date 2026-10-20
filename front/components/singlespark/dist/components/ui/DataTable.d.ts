import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import './DataTable.css';
export interface DataTableColumn<T> {
    id: string;
    header: ReactNode;
    cell: (row: T, rowIndex: number) => ReactNode;
    align?: 'start' | 'center' | 'end';
    headerClassName?: string;
    cellClassName?: string;
}
export interface DataTableProps<T> {
    ariaLabel: string;
    columns: readonly DataTableColumn<T>[];
    rows: readonly T[];
    rowKey: (row: T, rowIndex: number) => string | number;
    loading?: boolean;
    loadingLabel?: string;
    loadingRows?: number;
    emptyTitle: string;
    emptyDescription?: string;
    emptyIcon?: ReactNode;
    gridTemplateColumns: CSSProperties['gridTemplateColumns'];
    minWidth?: CSSProperties['minWidth'];
    className?: string;
    scrollClassName?: string;
    headerRowClassName?: string;
    rowClassName?: string | ((row: T, rowIndex: number) => string);
    getRowProps?: (row: T, rowIndex: number) => HTMLAttributes<HTMLDivElement>;
}
/** Shared table presentation and loading/error/empty states; callers supply columns and responsive grids. */
export declare function DataTable<T>({ ariaLabel, columns, rows, rowKey, loading, loadingLabel, loadingRows, emptyTitle, emptyDescription, emptyIcon, gridTemplateColumns, minWidth, className, scrollClassName, headerRowClassName, rowClassName, getRowProps, }: DataTableProps<T>): import("react").JSX.Element;
