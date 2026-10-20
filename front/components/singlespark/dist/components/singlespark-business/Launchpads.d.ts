import { Launchpad } from "../../singlespark-business.shared";
export declare function Launchpads({ value, onChange, includeAll, pumpOnly, }: {
    value: Launchpad | "All";
    onChange: (value: Launchpad | "All") => void;
    includeAll?: boolean;
    pumpOnly?: boolean;
}): import("react").JSX.Element;
