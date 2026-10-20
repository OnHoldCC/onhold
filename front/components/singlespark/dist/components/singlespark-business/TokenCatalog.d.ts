import type { PreviewProps } from "./../../types";
import { SingleSparkTokenData, ExploreFilterValue } from "../../singlespark-business.shared";
export declare function TokenCatalog({ tokens, filters, onFiltersChange, className, }: PreviewProps & {
    tokens?: SingleSparkTokenData[];
    filters?: ExploreFilterValue;
    onFiltersChange?: (v: ExploreFilterValue) => void;
}): import("react").JSX.Element;
