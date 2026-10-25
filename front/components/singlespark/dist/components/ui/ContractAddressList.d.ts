import type { ReactNode } from 'react';
import './ContractAddressList.css';
/** Address labels, explorer links, network identity and wallet actions are supplied by the host. */
export declare function ContractAddressList({ network, label, entries, actions, children }: {
    network: ReactNode;
    label: string;
    entries: readonly {
        label: string;
        address: string;
        href: string;
    }[];
    actions?: ReactNode;
    children?: ReactNode;
}): import("react").JSX.Element;
