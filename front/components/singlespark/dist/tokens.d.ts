/** Shared design values. CSS variables are generated from this file during build. */
export declare const singleSparkColors: {
    readonly dark: {
        readonly bg: "#0a0a0a";
        readonly surface: "#1a1a1a";
        readonly text: "#ffffff";
        readonly muted: "#7d8187";
        readonly border: "#ffffff14";
        readonly primary: "#ffffff";
        readonly "primary-text": "#0a0a0a";
        readonly "primary-hover": "#f8f7f5";
        readonly success: "#4ade80";
        readonly danger: "#f87171";
        readonly focus: "#91caff";
    };
    readonly light: {
        readonly bg: "#ffffff";
        readonly surface: "#f5f6f8";
        readonly text: "#18191c";
        readonly muted: "#666b73";
        readonly border: "#00000024";
        readonly primary: "#18191c";
        readonly "primary-text": "#ffffff";
        readonly "primary-hover": "#383b42";
        readonly success: "#16803d";
        readonly danger: "#c62828";
        readonly focus: "#1677ff";
    };
};
export declare const singleSparkFonts: {
    readonly sans: "Arial, Helvetica, sans-serif";
    readonly mono: "SingleSpark Mono, ui-monospace, monospace";
    readonly wallet: "SingleSpark Teka, Arial, sans-serif";
    readonly inter: "SingleSpark Inter, Arial, sans-serif";
};
export declare const singleSparkSpacing: {
    readonly 1: 4;
    readonly 2: 8;
    readonly 3: 12;
    readonly 4: 16;
    readonly 5: 20;
    readonly 6: 24;
    readonly 8: 32;
    readonly 12: 48;
};
export declare const singleSparkRadii: {
    readonly sm: 8;
    readonly md: 12;
    readonly lg: 16;
    readonly full: 999;
};
export declare const singleSparkMotion: {
    readonly fast: "150ms";
    readonly collapse: "300ms";
    readonly enter: "400ms";
    readonly ease: "cubic-bezier(.22,1,.36,1)";
};
export declare const singleSparkTypeScale: {
    readonly caption: 12;
    readonly body: 14;
    readonly input: 15;
    readonly subtitle: 18;
    readonly title: 24;
    readonly display: 36;
};
export type SingleSparkColorToken = keyof typeof singleSparkColors.dark;
export type SingleSparkThemeMode = "dark" | "light" | "system";
export type SingleSparkTokens = Partial<Record<SingleSparkColorToken | `font-${keyof typeof singleSparkFonts}` | `space-${keyof typeof singleSparkSpacing}` | `radius-${keyof typeof singleSparkRadii}` | `motion-${keyof typeof singleSparkMotion}`, string>>;
