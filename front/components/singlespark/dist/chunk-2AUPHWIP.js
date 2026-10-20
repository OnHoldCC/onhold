'use client';

// react/tokens.ts
var singleSparkColors = {
  dark: {
    bg: "#0a0a0a",
    surface: "#1a1a1a",
    text: "#ffffff",
    muted: "#7d8187",
    border: "#ffffff14",
    primary: "#ffffff",
    "primary-text": "#0a0a0a",
    "primary-hover": "#f8f7f5",
    success: "#4ade80",
    danger: "#f87171",
    focus: "#91caff"
  },
  light: {
    bg: "#ffffff",
    surface: "#f5f6f8",
    text: "#18191c",
    muted: "#666b73",
    border: "#00000024",
    primary: "#18191c",
    "primary-text": "#ffffff",
    "primary-hover": "#383b42",
    success: "#16803d",
    danger: "#c62828",
    focus: "#1677ff"
  }
};
var singleSparkFonts = {
  sans: "Arial, Helvetica, sans-serif",
  mono: "SingleSpark Mono, ui-monospace, monospace",
  wallet: "SingleSpark Teka, Arial, sans-serif",
  inter: "SingleSpark Inter, Arial, sans-serif"
};
var singleSparkSpacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  12: 48
};
var singleSparkRadii = { sm: 8, md: 12, lg: 16, full: 999 };
var singleSparkMotion = {
  fast: "150ms",
  collapse: "300ms",
  enter: "400ms",
  ease: "cubic-bezier(.22,1,.36,1)"
};
var singleSparkTypeScale = {
  caption: 12,
  body: 14,
  input: 15,
  subtitle: 18,
  title: 24,
  display: 36
};

export {
  singleSparkColors,
  singleSparkFonts,
  singleSparkSpacing,
  singleSparkRadii,
  singleSparkMotion,
  singleSparkTypeScale
};
