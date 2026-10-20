import './AddressLink.css';
/** Copy the address as one control; optional explorer navigation stays separate. */
export declare function AddressLink({ address, href, label, onError }: {
    address: string;
    href?: string;
    label?: string;
    onError?: (error: unknown) => void;
}): import("react").JSX.Element;
