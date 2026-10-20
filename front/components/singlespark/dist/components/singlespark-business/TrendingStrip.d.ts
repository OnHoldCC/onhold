import type { PreviewProps } from "./../../types";
import { singleSparkBusinessSnapshot as snapshot } from "./../../singlespark-business-data";
export declare function TrendingStrip({ tokens, className, onNavigate, motionPaused, }: PreviewProps & {
    tokens?: typeof snapshot.trending;
    motionPaused?: boolean;
}): import("react").JSX.Element;
