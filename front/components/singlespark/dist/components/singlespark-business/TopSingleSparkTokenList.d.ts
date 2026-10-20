import type { PreviewProps } from "./../../types";
import { singleSparkBusinessSnapshot as snapshot } from "./../../singlespark-business-data";
export declare function TopSingleSparkTokenList({ payments, className, }: PreviewProps & {
    payments?: typeof snapshot.paid;
}): import("react").JSX.Element;
