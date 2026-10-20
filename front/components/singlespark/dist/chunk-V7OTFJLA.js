'use client';

// react/singlespark-feedback.shared.tsx
var singleSparkSkeletonVariants = [
  "text",
  "avatar",
  "button",
  "input",
  "card",
  "list",
  "table",
  "stat",
  "chart",
  "trade",
  "wallet"
];

// react/components/singlespark-feedback/SingleSparkLoading.tsx
import { version } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function SingleSparkLoading({
  loading = true,
  variant = "spinner",
  size = 20,
  label = "Loading\u2026",
  showLabel = false,
  decorative = false,
  children,
  className = ""
}) {
  if (!loading) return /* @__PURE__ */ jsx(Fragment, { children });
  const indicator = /* @__PURE__ */ jsxs(
    "span",
    {
      className: `ss-loading ${className}`,
      role: decorative ? void 0 : "status",
      "aria-label": decorative ? void 0 : label,
      "aria-hidden": decorative || void 0,
      children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            className: `ss-loading-${variant}`,
            style: { width: size, height: size },
            "aria-hidden": "true",
            children: variant === "dots" && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("i", {}),
              /* @__PURE__ */ jsx("i", {}),
              /* @__PURE__ */ jsx("i", {})
            ] })
          }
        ),
        showLabel && /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: label })
      ]
    }
  );
  return children == null ? indicator : /* @__PURE__ */ jsxs("div", { className: "ss-loading-region", "aria-busy": "true", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "ss-loading-content",
        "aria-hidden": "true",
        ...{ inert: Number.parseInt(version, 10) >= 19 ? true : "" },
        children
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "ss-loading-overlay", children: indicator })
  ] });
}

// react/components/singlespark-feedback/SingleSparkSkeleton.tsx
import { Fragment as Fragment2, jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function SingleSparkSkeleton({
  variant = "text",
  loading = true,
  animation = "wave",
  rows = 3,
  width,
  height,
  label = "Loading content\u2026",
  children,
  className = "",
  decorative = false,
  style
}) {
  if (!loading) return /* @__PURE__ */ jsx2(Fragment2, { children });
  const count = Number.isFinite(rows) ? Math.max(1, Math.min(20, Math.floor(rows))) : 3;
  const block = (name = "line", style2) => /* @__PURE__ */ jsx2("span", { className: `ss-skeleton-block ss-skeleton-${name}`, style: style2 });
  const lines = /* @__PURE__ */ jsx2("span", { className: "ss-skeleton-lines", children: Array.from({ length: count }, (_, i) => /* @__PURE__ */ jsx2(
    "span",
    {
      className: "ss-skeleton-block ss-skeleton-line",
      style: { width: i === count - 1 ? "64%" : "100%" }
    },
    i
  )) });
  const list = /* @__PURE__ */ jsx2(Fragment2, { children: Array.from({ length: count }, (_, i) => /* @__PURE__ */ jsxs2("span", { className: "ss-skeleton-row", children: [
    block("avatar"),
    /* @__PURE__ */ jsxs2("span", { className: "ss-skeleton-lines", children: [
      block("line", { width: "45%" }),
      block("line", { width: "70%" })
    ] }),
    block("line", { width: 64 })
  ] }, i)) });
  let content;
  switch (variant) {
    case "avatar":
    case "button":
    case "input":
      content = block(variant, { width: "100%", height: "100%" });
      break;
    case "card":
      content = /* @__PURE__ */ jsxs2(Fragment2, { children: [
        block("media"),
        lines,
        block("button")
      ] });
      break;
    case "list":
    case "wallet":
      content = list;
      break;
    case "table":
      content = /* @__PURE__ */ jsx2(Fragment2, { children: Array.from({ length: count + 1 }, (_, i) => /* @__PURE__ */ jsx2("span", { className: "ss-skeleton-table-row", children: [0, 1, 2, 3, 4].map((n) => /* @__PURE__ */ jsx2("span", { className: "ss-skeleton-block ss-skeleton-line" }, n)) }, i)) });
      break;
    case "stat":
      content = /* @__PURE__ */ jsxs2(Fragment2, { children: [
        block("line", { width: "40%" }),
        block("line", { width: "65%", height: 32 }),
        block("line", { width: "30%" })
      ] });
      break;
    case "chart":
      content = /* @__PURE__ */ jsxs2(Fragment2, { children: [
        block("line", { width: "38%" }),
        /* @__PURE__ */ jsx2("span", { className: "ss-skeleton-plot", children: [30, 45, 36, 58, 50, 67, 55, 80, 70, 88, 76, 95].map((h, i) => /* @__PURE__ */ jsx2(
          "span",
          {
            className: "ss-skeleton-block",
            style: { height: `${h}%` }
          },
          i
        )) }),
        block("line")
      ] });
      break;
    case "trade":
      content = /* @__PURE__ */ jsxs2(Fragment2, { children: [
        block("line", { width: "42%" }),
        /* @__PURE__ */ jsxs2("span", { className: "ss-skeleton-row", children: [
          block("button"),
          block("button")
        ] }),
        block("input"),
        lines,
        block("button", { width: "100%" })
      ] });
      break;
    default:
      content = lines;
  }
  return /* @__PURE__ */ jsx2(
    "div",
    {
      className: `ss-skeleton-layout ss-skeleton-layout-${variant} ${className}`,
      "data-animation": animation || "none",
      style: { width, height, ...style },
      role: decorative ? void 0 : "status",
      "aria-label": decorative ? void 0 : label,
      "aria-hidden": decorative || void 0,
      "aria-busy": decorative ? void 0 : true,
      children: /* @__PURE__ */ jsx2("div", { className: "ss-skeleton-shapes", "aria-hidden": "true", children: content })
    }
  );
}

export {
  singleSparkSkeletonVariants,
  SingleSparkLoading,
  SingleSparkSkeleton
};
