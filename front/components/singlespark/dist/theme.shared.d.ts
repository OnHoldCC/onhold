import type { HTMLAttributes } from "react";
import type { SingleSparkThemeMode, SingleSparkTokens } from "./tokens";
export interface SingleSparkThemeProps extends HTMLAttributes<HTMLDivElement> {
    mode?: SingleSparkThemeMode;
    tokens?: SingleSparkTokens;
}
