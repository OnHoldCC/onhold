export declare const singleSparkChains: {
    readonly bitcoin: {
        readonly name: "Bitcoin";
        readonly nativeSymbol: "BTC";
        readonly icon: string;
    };
    readonly ethereum: {
        readonly name: "Ethereum";
        readonly nativeSymbol: "ETH";
        readonly icon: string;
    };
    readonly solana: {
        readonly name: "Solana";
        readonly nativeSymbol: "SOL";
        readonly icon: string;
    };
    readonly "binance-smart-chain": {
        readonly name: "BNB Smart Chain";
        readonly nativeSymbol: "BNB";
        readonly icon: string;
    };
    readonly base: {
        readonly name: "Base";
        readonly nativeSymbol: "ETH";
        readonly icon: string;
    };
    readonly "arbitrum-one": {
        readonly name: "Arbitrum One";
        readonly nativeSymbol: "ETH";
        readonly icon: string;
    };
    readonly optimism: {
        readonly name: "OP Mainnet";
        readonly nativeSymbol: "ETH";
        readonly icon: string;
    };
    readonly avalanche: {
        readonly name: "Avalanche";
        readonly nativeSymbol: "AVAX";
        readonly icon: string;
    };
    readonly sui: {
        readonly name: "Sui";
        readonly nativeSymbol: "SUI";
        readonly icon: string;
    };
};
export type SingleSparkChain = keyof typeof singleSparkChains;
export declare const singleSparkTokenIcons: {
    readonly BTC: string;
    readonly ETH: string;
    readonly SOL: string;
    readonly BNB: string;
    readonly AVAX: string;
    readonly SUI: string;
    readonly USDC: string;
    readonly USDT: string;
};
export interface SingleSparkToken {
    /** Stable identity: use the chain-specific mint / contract address, or "native". */
    id: string;
    symbol: string;
    name: string;
    decimals: number;
    chain: SingleSparkChain;
    icon?: string;
}
export interface SingleSparkTokenIconProps {
    symbol?: string;
    src?: string;
    size?: number;
    className?: string;
}
