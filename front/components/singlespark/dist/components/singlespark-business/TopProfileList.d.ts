import type { PreviewProps } from "./../../types";
import { singleSparkBusinessSnapshot as snapshot } from "./../../singlespark-business-data";
export declare function TopProfileList({ profiles, className, }: PreviewProps & {
    profiles?: typeof snapshot.profiles;
}): import("react").JSX.Element;
