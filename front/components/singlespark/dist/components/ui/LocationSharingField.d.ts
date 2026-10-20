import './LocationSharingField.css';
export declare function LocationSharingField({ label, description, status, privacy, checked, onChange, disabled }: {
    label: string;
    description: string;
    status: string;
    privacy: string;
    checked: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
}): import("react").JSX.Element;
