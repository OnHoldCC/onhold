'use client';
import {
  SingleSparkPanel
} from "./chunk-K6TMLM72.js";
import {
  SingleSparkSkeleton
} from "./chunk-V7OTFJLA.js";
import {
  SingleSparkIcon
} from "./chunk-DRA3EEEB.js";

// react/components/singlespark-stats/SingleSparkPriceChange.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function SingleSparkPriceChange({
  value,
  period,
  className = ""
}) {
  const valid = value !== void 0 && Number.isFinite(value);
  const direction = !valid || value === 0 ? "flat" : value > 0 ? "up" : "down";
  return /* @__PURE__ */ jsxs("span", { className: `ss-price-change ${className}`, "data-direction": direction, children: [
    valid && value !== 0 && /* @__PURE__ */ jsx(
      SingleSparkIcon,
      {
        name: value > 0 ? "trend-up" : "trend-down",
        size: 14
      }
    ),
    valid ? `${value > 0 ? "+" : ""}${value.toFixed(2)}%` : "0%",
    period && /* @__PURE__ */ jsx("small", { children: period })
  ] });
}

// react/components/singlespark-stats/SingleSparkSparkline.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
function SingleSparkSparkline({
  data = [],
  label = "Price history",
  height = 48,
  className = "",
  style,
  strokeWidth = 2
}) {
  const values = data.filter(Number.isFinite);
  const low = Math.min(...values), range = Math.max(...values) - low || 1;
  const points = values.map(
    (v, i) => `${4 + i / Math.max(values.length - 1, 1) * 192},${height - 4 - (v - low) / range * (height - 8)}`
  ).join(" ");
  return values.length > 1 ? /* @__PURE__ */ jsx2(
    "svg",
    {
      className: `ss-sparkline ${className}`,
      style: { height, ...style },
      viewBox: `0 0 200 ${height}`,
      role: "img",
      "aria-label": `${label}: ${values[0]} \u2192 ${values.at(-1)}`,
      "data-direction": values.at(-1) >= values[0] ? "up" : "down",
      preserveAspectRatio: "none",
      children: /* @__PURE__ */ jsx2(
        "polyline",
        {
          points,
          fill: "none",
          stroke: "currentColor",
          strokeWidth,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          vectorEffect: "non-scaling-stroke"
        }
      )
    }
  ) : /* @__PURE__ */ jsx2("span", { className: "ss-empty", children: "No chart data" });
}

// react/components/singlespark-stats/SingleSparkStatCard.tsx
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function SingleSparkStatCard({
  label = "Metric",
  value,
  change,
  period = "24h",
  icon,
  history,
  loading = false,
  className = ""
}) {
  return /* @__PURE__ */ jsxs2(
    SingleSparkPanel,
    {
      className: `ss-stat-card ${className}`,
      "aria-busy": loading,
      children: [
        /* @__PURE__ */ jsxs2("header", { children: [
          label,
          icon
        ] }),
        loading ? /* @__PURE__ */ jsx3(SingleSparkSkeleton, { rows: 1, height: 32, label: `Loading ${label}` }) : /* @__PURE__ */ jsx3("strong", { className: "ss-stat-value", children: value ?? "0" }),
        change !== void 0 && /* @__PURE__ */ jsx3(
          SingleSparkPriceChange,
          {
            value: loading ? void 0 : change,
            period
          }
        ),
        history && !loading && /* @__PURE__ */ jsx3(SingleSparkSparkline, { data: history, label: `${label} history` })
      ]
    }
  );
}

// react/components/singlespark-stats/SingleSparkStatGrid.tsx
import { jsx as jsx4 } from "react/jsx-runtime";
function SingleSparkStatGrid({
  items = [],
  className = ""
}) {
  return /* @__PURE__ */ jsx4("div", { className: `ss-stat-grid ${className}`, children: items.length ? items.map(({ id, ...props }) => /* @__PURE__ */ jsx4(SingleSparkStatCard, { ...props }, id)) : /* @__PURE__ */ jsx4("span", { className: "ss-empty", children: "No statistics available" }) });
}

// react/components/singlespark-stats/SingleSparkBondingProgress.tsx
import { jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
function SingleSparkBondingProgress({
  value = 0,
  label = "Bonding curve progress",
  description,
  complete = false,
  className = ""
}) {
  const percent = complete ? 100 : Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  return /* @__PURE__ */ jsxs3("div", { className: `ss-bonding ${className}`, children: [
    /* @__PURE__ */ jsxs3("header", { children: [
      /* @__PURE__ */ jsx5("span", { children: label }),
      /* @__PURE__ */ jsxs3("strong", { children: [
        percent.toFixed(1),
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsx5("progress", { "aria-label": label, max: 100, value: percent }),
    /* @__PURE__ */ jsx5("small", { children: complete ? "Graduated \xB7 Liquidity pool active" : description || "Progress towards liquidity pool migration" })
  ] });
}

// react/components/singlespark-stats/SingleSparkTradesTable.tsx
import { jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
function SingleSparkTradesTable({
  rows = [],
  loading = false,
  className = ""
}) {
  return /* @__PURE__ */ jsxs4(
    "div",
    {
      className: `ss-trades-table ${className}`,
      tabIndex: 0,
      role: "region",
      "aria-label": "Recent trades",
      "aria-busy": loading,
      children: [
        /* @__PURE__ */ jsxs4("table", { children: [
          /* @__PURE__ */ jsx6("caption", { className: "singlespark-sr-only", children: "Recent trades" }),
          /* @__PURE__ */ jsx6("thead", { children: /* @__PURE__ */ jsx6("tr", { children: ["Side", "Amount", "Total", "Account", "Time"].map((title) => /* @__PURE__ */ jsx6("th", { scope: "col", children: title }, title)) }) }),
          /* @__PURE__ */ jsx6("tbody", { children: loading ? /* @__PURE__ */ jsx6("tr", { children: /* @__PURE__ */ jsx6("td", { colSpan: 5, children: /* @__PURE__ */ jsx6(SingleSparkSkeleton, { variant: "table", label: "Loading trades\u2026" }) }) }) : rows.map((row) => /* @__PURE__ */ jsxs4("tr", { children: [
            /* @__PURE__ */ jsx6("td", { "data-side": row.side, children: row.side === "buy" ? "\u2197 Buy" : "\u2198 Sell" }),
            /* @__PURE__ */ jsx6("td", { children: row.amount }),
            /* @__PURE__ */ jsx6("td", { children: row.total }),
            /* @__PURE__ */ jsx6("td", { children: row.account }),
            /* @__PURE__ */ jsx6("td", { children: row.time })
          ] }, row.id)) })
        ] }),
        !loading && !rows.length && /* @__PURE__ */ jsx6("p", { className: "ss-empty", role: "status", children: "No trades yet" })
      ]
    }
  );
}

export {
  SingleSparkPriceChange,
  SingleSparkSparkline,
  SingleSparkStatCard,
  SingleSparkStatGrid,
  SingleSparkBondingProgress,
  SingleSparkTradesTable
};
