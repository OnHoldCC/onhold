export declare function SingleSparkSlippageControl({ value, onChange, className, }: {
    /** Basis points: 100 = 1%. Undefined is invalid input. */ value?: number;
    onChange?: (basisPoints: number | undefined) => void;
    className?: string;
}): import("react").JSX.Element;
