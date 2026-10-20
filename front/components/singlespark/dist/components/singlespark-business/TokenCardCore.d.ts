import { SingleSparkTokenData } from "../../singlespark-business.shared";
export declare function TokenCardCore({ token: p, onRecipientClick, catalog, }: {
    token: SingleSparkTokenData;
    onRecipientClick?: (handle: string) => void;
    catalog?: boolean;
}): import("react").JSX.Element;
