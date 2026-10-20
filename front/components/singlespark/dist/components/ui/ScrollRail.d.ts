import { type ReactNode } from 'react';
import './ScrollRail.css';
/** A compact row with visible overflow controls and no scrollbar. */
export declare function ScrollRail({ children, activeIndex, previousLabel, nextLabel }: {
    children: ReactNode;
    activeIndex: number;
    previousLabel: string;
    nextLabel: string;
}): import("react").JSX.Element;
