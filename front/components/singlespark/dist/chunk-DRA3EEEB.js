'use client';

// react/icons.shared.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var iconPaths = {
  // Lucide pickaxe, ISC license and original SVG retained in ../extensions.
  pickaxe: /* @__PURE__ */ jsxs(Fragment, { children: [jsx("path", {d:"m14 13-8.381 8.38a1 1 0 0 1-3.001-3L11 9.999"}),jsx("path", {d:"M15.973 4.027A13 13 0 0 0 5.902 2.373c-1.398.342-1.092 2.158.277 2.601a19.9 19.9 0 0 1 5.822 3.024"}),jsx("path", {d:"M16.001 11.999a19.9 19.9 0 0 1 3.024 5.824c.444 1.369 2.26 1.676 2.603.278A13 13 0 0 0 20 8.069"}),jsx("path", {d:"M18.352 3.352a1.205 1.205 0 0 0-1.704 0l-5.296 5.296a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l5.296-5.296a1.205 1.205 0 0 0 0-1.704z"})] }),
  "trend-up": /* @__PURE__ */ jsx("path", { d: "m3 17 6-6 4 4 8-10m-6 0h6v6" }),
  "trend-down": /* @__PURE__ */ jsx("path", { d: "m3 7 6 6 4-4 8 10m-6 0h6v-6" }),
  settings: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M4 6h16M4 12h16M4 18h16" }),
    /* @__PURE__ */ jsx("circle", { cx: "9", cy: "6", r: "2" }),
    /* @__PURE__ */ jsx("circle", { cx: "15", cy: "12", r: "2" }),
    /* @__PURE__ */ jsx("circle", { cx: "9", cy: "18", r: "2" })
  ] }),
  swap: /* @__PURE__ */ jsx("path", { d: "M7 3v17m-4-4 4 4 4-4M17 21V4m-4 4 4-4 4 4" }),
  refresh: /* @__PURE__ */ jsx("path", { d: "M20 7V3m0 4h-4M4 17v4m0-4h4M5 8a8 8 0 0 1 14-3l1 2M4 17l1 2a8 8 0 0 0 14-3" }),
  candle: /* @__PURE__ */ jsx("path", { d: "M6 3v4m0 10v4M3 7h6v10H3zM18 3v7m0 6v5m-3-11h6v6h-6z" }),
  chart: /* @__PURE__ */ jsx("path", { d: "M3 3v18h18M7 15l4-5 4 2 5-7" }),
  info: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "9" }),
    /* @__PURE__ */ jsx("path", { d: "M12 11v6m0-10v1" })
  ] }),
  warning: /* @__PURE__ */ jsx("path", { d: "m12 3 10 18H2L12 3Zm0 6v5m0 3v1" }),
  clock: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "9" }),
    /* @__PURE__ */ jsx("path", { d: "M12 7v5l3 2" })
  ] }),
  plus: /* @__PURE__ */ jsx("path", { d: "M12 5v14M5 12h14" }),
  minus: /* @__PURE__ */ jsx("path", { d: "M5 12h14" }),
  star: /* @__PURE__ */ jsx("path", { d: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" }),
  logout: /* @__PURE__ */ jsx("path", { d: "M9 4H4v16h5m5-4 4-4-4-4m-5 4h12" }),
  chevron: /* @__PURE__ */ jsx("path", { d: "m6 9 6 6 6-6" }),
  left: /* @__PURE__ */ jsx("path", { d: "m15 18-6-6 6-6" }),
  right: /* @__PURE__ */ jsx("path", { d: "m9 18 6-6-6-6" }),
  arrow: /* @__PURE__ */ jsx("path", { d: "M5 12h14m-6-6 6 6-6 6" }),
  external: /* @__PURE__ */ jsx("path", { d: "M14 3h7v7M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" }),
  copy: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { x: "9", y: "9", width: "11", height: "11", rx: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })
  ] }),
  at: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "9" }),
    /* @__PURE__ */ jsx("path", { d: "M16 8v6a2 2 0 0 0 4 0M16 12a4 4 0 1 0-4 4" })
  ] }),
  search: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "10.5", cy: "10.5", r: "6.5" }),
    /* @__PURE__ */ jsx("path", { d: "m16 16 5 5" })
  ] }),
  image: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "3" }),
    /* @__PURE__ */ jsx("circle", { cx: "15.5", cy: "8.5", r: "1.5" }),
    /* @__PURE__ */ jsx("path", { d: "m3 16 5-5 8 10" })
  ] }),
  collectible: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "m7 5-3.8 1.4a1.8 1.8 0 0 0-1.1 2.3l4.3 11.8a1.8 1.8 0 0 0 2.3 1.1l2.1-.8M17 5l3.8 1.4a1.8 1.8 0 0 1 1.1 2.3l-4.3 11.8a1.8 1.8 0 0 1-2.3 1.1l-2.1-.8" }),
    /* @__PURE__ */ jsx("rect", { x: "7", y: "2.5", width: "10", height: "18", rx: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M12 7c.3 1.8 2.5 2.4 2.5 4.5a2.5 2.5 0 0 1-5 0c0-1 .4-1.9 1.2-2.7.1.8.4 1.3.8 1.6.8-.9.9-2.1.5-3.4ZM10 17h4" })
  ] }),
  burn: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M12 3s1 5-3 8c-2-1-2-4-2-4s-4 4-3 8a8 8 0 0 0 16 0c0-6-8-12-8-12Z" }),
    /* @__PURE__ */ jsx("path", { d: "M12 12s-4 4-2 7c3 3 7-1 2-7Z" })
  ] }),
  check: /* @__PURE__ */ jsx("path", { d: "m5 12 4 4L19 6" }),
  key: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M14 14a6 6 0 1 0-4-4L3 17v4h4v-3h3v-3Z" }),
    /* @__PURE__ */ jsx("circle", { cx: "16", cy: "8", r: "1" })
  ] }),
  link: /* @__PURE__ */ jsx("path", { d: "m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 1 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" }),
  bell: /* @__PURE__ */ jsx("path", { d: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M9 21h6" }),
  wallet: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { x: "3", y: "5", width: "18", height: "16", rx: "3" }),
    /* @__PURE__ */ jsx("path", { d: "M3 8V5l14-3v3m4 7h-6v5h6" })
  ] }),
  Home: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1.5" }),
    /* @__PURE__ */ jsx("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1.5" }),
    /* @__PURE__ */ jsx("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1.5" }),
    /* @__PURE__ */ jsx("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1.5" })
  ] }),
  Explore: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "9" }),
    /* @__PURE__ */ jsx("path", { d: "m16 8-2 6-6 2 2-6Z" })
  ] }),
  Payments: /* @__PURE__ */ jsx("path", { d: "M4 6h15v14H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12v2M19 10h-6v6h6M15 13h1" }),
  "Claim Fees": /* @__PURE__ */ jsx("path", { d: "M12 3v11m-4-4 4 4 4-4M4 14v6h16v-6" }),
  Analytics: /* @__PURE__ */ jsx("path", { d: "M4 4v16h16M8 15l4-5 4 2 4-6" }),
  Launch: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "4" }),
    /* @__PURE__ */ jsx("path", { d: "M12 7v10M7 12h10" })
  ] }),
  "Capital Flow": /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "6", height: "6", rx: "1" }),
    /* @__PURE__ */ jsx("rect", { x: "15", y: "15", width: "6", height: "6", rx: "1" }),
    /* @__PURE__ */ jsx("path", { d: "M9 6h9v5m-3-3 3 3 3-3M15 18H6v-5m-3 3 3-3 3 3" })
  ] }),
  Docs: /* @__PURE__ */ jsx("path", { d: "M6 3h9l4 4v14H6Z M14 3v5h5M9 12h7M9 16h7" }),
  Search: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "10.5", cy: "10.5", r: "6.5" }),
    /* @__PURE__ */ jsx("path", { d: "m16 16 4.5 4.5" })
  ] }),
  Menu: /* @__PURE__ */ jsx("path", { d: "M4 6h16M4 12h16M4 18h16" }),
  Close: /* @__PURE__ */ jsx("path", { d: "M6 6 18 18M6 18 18 6" }),
  Check: /* @__PURE__ */ jsx("path", { d: "M20 6 9 17l-5-5" }),
  Chevrons: /* @__PURE__ */ jsx("path", { d: "m7 7 5 5-5 5m5-10 5 5-5 5" }),
  close: /* @__PURE__ */ jsx("path", { d: "M6 6 18 18M6 18 18 6" })
};
var singleSparkIconNames = Object.keys(
  iconPaths
);

// react/components/icons/SingleSparkIcon.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function SingleSparkIcon({
  name = "chevron",
  size = 16,
  title,
  ...props
}) {
  return /* @__PURE__ */ jsxs2(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.7",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      role: title ? "img" : void 0,
      "aria-label": title,
      "aria-hidden": title ? void 0 : true,
      ...props,
      children: [
        title && /* @__PURE__ */ jsx2("title", { children: title }),
        iconPaths[name]
      ]
    }
  );
}

export {
  singleSparkIconNames,
  SingleSparkIcon
};
