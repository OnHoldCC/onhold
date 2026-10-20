import { TradeFormProps } from "../../backers.shared";
export declare function TradeFormBody({ side, coin, initialAmount, walletConnected, onAmountChange, onTrade, }: TradeFormProps & {
    side: "buy" | "sell";
}): import("react").JSX.Element;
