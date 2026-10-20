import { LaunchDraft } from "../../singlespark-business.shared";
export declare function MetadataCore({ draft, onChange, onImageFile, }: {
    draft: LaunchDraft;
    onChange: (v: Partial<LaunchDraft>) => void;
    onImageFile?: (file: File) => void;
}): import("react").JSX.Element;
