export declare function Tabs<T extends string>({ items, value, onChange, pills, label, }: {
    items: readonly (readonly [T, string])[];
    value: T;
    onChange: (value: T) => void;
    pills?: boolean;
    label?: string;
}): import("react").JSX.Element;
