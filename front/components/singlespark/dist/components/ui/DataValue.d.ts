import type { ReactNode } from 'react';
import './DataValue.css';
/** Unknown data stays distinct from confirmed zero; cached values remain visible during refresh. */
export declare function DataValue({ value, loading, loadingLabel, unavailableLabel, unit, digits, lang, compact }: {
    value?: string | number | bigint | null;
    loading?: boolean;
    loadingLabel?: string;
    unavailableLabel?: string;
    unit?: ReactNode;
    digits?: number;
    lang?: string;
    compact?: boolean;
}): import("react").JSX.Element;
