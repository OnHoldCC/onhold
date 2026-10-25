'use client';
import {
  SingleSparkLoading,
  SingleSparkSkeleton
} from "./chunk-V7OTFJLA.js";
import {
  SingleSparkIcon
} from "./chunk-TR53XSAD.js";
import {
  SingleSparkMoney
} from "./chunk-BX7LGP4G.js";

// react/components/singlespark-primitives/SingleSparkButton.tsx
import { forwardRef, useRef } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var SingleSparkButton = forwardRef(function SingleSparkButton2({
  children = "Connect wallet",
  variant = "ghost",
  size = "md",
  loading = false,
  icon,
  iconPosition = "start",
  disabled,
  className = "",
  ...props
}, ref) {
  const label = useRef(children);
  if (!loading) label.current = children;
  return /* @__PURE__ */ jsxs(
    "button",
    {
      ref,
      type: "button",
      className: `singlespark-button ub-button singlespark-button-${variant} singlespark-button-${size} ${className}`,
      disabled: disabled || loading,
      "aria-busy": loading || void 0,
      ...props,
      children: [
        !loading && iconPosition === "start" && icon,
        loading ? label.current : children,
        !loading && iconPosition === "end" && icon,
        loading && /* @__PURE__ */ jsx(SingleSparkLoading, { size: 16, decorative: true })
      ]
    }
  );
});

// react/components/singlespark-primitives/SingleSparkIconButton.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
function SingleSparkIconButton({
  children,
  "aria-label": label = "Close",
  className = "",
  ...props
}) {
  return /* @__PURE__ */ jsx2(
    SingleSparkButton,
    {
      "aria-label": label,
      className: `singlespark-icon-button ub-icon-button ${className}`,
      ...props,
      children: children || /* @__PURE__ */ jsx2(SingleSparkIcon, { name: "close" })
    }
  );
}

// react/components/singlespark-primitives/SingleSparkTabs.tsx
import { useRef as useRef2, useState } from "react";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function SingleSparkTabs({
  values = ["All", "Payments", "Claims"],
  value,
  defaultValue,
  onChange,
  className = "",
  label = "View",
  icons
}) {
  const [local, setLocal] = useState(defaultValue || values[0]);
  const selected = value === void 0 ? local : value;
  const buttons = useRef2([]);
  const select = (next) => {
    setLocal(next);
    onChange?.(next);
  };
  return /* @__PURE__ */ jsx3(
    "div",
    {
      role: "tablist",
      "aria-label": label,
      className: `singlespark-tabs ub-tabs ${className}`,
      children: values.map((item, index) => /* @__PURE__ */ jsxs2(
        "button",
        {
          ref: (node) => {
            buttons.current[index] = node;
          },
          type: "button",
          role: "tab",
          "aria-selected": selected === item,
          tabIndex: selected === item ? 0 : -1,
          className: `singlespark-button ub-button ${selected === item ? "ub-selected" : ""}`,
          onClick: () => select(item),
          onKeyDown: (e) => {
            let next = index;
            if (e.key === "ArrowRight") next = (index + 1) % values.length;
            else if (e.key === "ArrowLeft")
              next = (index + values.length - 1) % values.length;
            else if (e.key === "Home") next = 0;
            else if (e.key === "End") next = values.length - 1;
            else return;
            e.preventDefault();
            select(values[next]);
            buttons.current[next]?.focus();
          },
          children: [
            icons?.[item],
            item
          ]
        },
        item
      ))
    }
  );
}

// react/components/singlespark-primitives/SingleSparkTextInput.tsx
import { forwardRef as forwardRef2 } from "react";
import { jsx as jsx4 } from "react/jsx-runtime";
var SingleSparkTextInput = forwardRef2(function SingleSparkTextInput2({
  className = "",
  ...props
}, ref) {
  return /* @__PURE__ */ jsx4(
    "input",
    {
      ref,
      placeholder: "Enter a value",
      className: `singlespark-input ${className}`,
      ...props
    }
  );
});

// react/components/singlespark-primitives/SingleSparkSearchInput.tsx
import { jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
function SingleSparkSearchInput({
  className = "",
  ...props
}) {
  return /* @__PURE__ */ jsxs3("label", { className: `singlespark-search ${className}`, children: [
    /* @__PURE__ */ jsx5(SingleSparkIcon, { name: "search" }),
    /* @__PURE__ */ jsx5(
      "input",
      {
        type: "search",
        "aria-label": "Search",
        placeholder: "Search by contract address",
        ...props
      }
    )
  ] });
}

// react/components/singlespark-primitives/SingleSparkTextarea.tsx
import { forwardRef as forwardRef3 } from "react";
import { jsx as jsx6 } from "react/jsx-runtime";
var SingleSparkTextarea = forwardRef3(function SingleSparkTextarea2({
  className = "",
  ...props
}, ref) {
  return /* @__PURE__ */ jsx6(
    "textarea",
    {
      ref,
      "aria-label": "Description",
      placeholder: "What the token is.",
      rows: 4,
      className: `singlespark-input singlespark-textarea ${className}`,
      ...props
    }
  );
});

// react/components/singlespark-primitives/SingleSparkCheckbox.tsx
import { forwardRef as forwardRef4 } from "react";
import { jsx as jsx7, jsxs as jsxs4 } from "react/jsx-runtime";
var SingleSparkCheckboxInput = forwardRef4(function SingleSparkCheckboxInput2(props, ref) {
  return /* @__PURE__ */ jsx7("input", { ...props, ref, type: "checkbox" });
});
function SingleSparkCheckbox({
  children = "I agree to the Terms of Use and Disclosures.",
  className = "",
  ...props
}) {
  return /* @__PURE__ */ jsxs4("label", { className: `singlespark-checkbox ${className}`, children: [
    /* @__PURE__ */ jsx7(SingleSparkCheckboxInput, { ...props }),
    /* @__PURE__ */ jsx7("span", { children })
  ] });
}

// react/singlespark-primitives.shared.tsx
var SingleSparkAvatarAsset0 = new URL(
  "../assets/singlespark/business/51332a02d00d.webp",
  import.meta.url
);
var SingleSparkListAsset1 = new URL(
  "../assets/singlespark/business/8a673453be31.webp",
  import.meta.url
);

// react/components/singlespark-primitives/SingleSparkAvatar.tsx
import { jsx as jsx8 } from "react/jsx-runtime";
function SingleSparkAvatar({
  src = SingleSparkAvatarAsset0.href,
  alt = "",
  size = 40,
  className = ""
}) {
  return /* @__PURE__ */ jsx8(
    "img",
    {
      src,
      alt,
      width: size,
      height: size,
      className: `singlespark-avatar ub-avatar ${className}`,
      style: { width: size, height: size }
    }
  );
}

// react/components/singlespark-primitives/SingleSparkBadge.tsx
import { jsx as jsx9 } from "react/jsx-runtime";
function SingleSparkBadge({
  children = "Pump",
  className = "",
  ...props
}) {
  return /* @__PURE__ */ jsx9("span", { className: `singlespark-badge ${className}`, ...props, children });
}

// react/components/singlespark-primitives/SingleSparkCopyButton.tsx
import { useEffect, useRef as useRef3, useState as useState2 } from "react";
import { jsx as jsx10, jsxs as jsxs5 } from "react/jsx-runtime";
function SingleSparkCopyButton({
  value = "FfLpuH4WPn2MR8Lqn1MpwQc1HtAPPqL3qvMWZjnFHGpv",
  label = "Copy address",
  children,
  className = "ub-icon-button",
  onCopy,
  onError
}) {
  const [status, setStatus] = useState2(label);
  const timer = useRef3();
  useEffect(() => () => clearTimeout(timer.current), []);
  return /* @__PURE__ */ jsxs5(
    SingleSparkButton,
    {
      className,
      "aria-label": status,
      title: status,
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(value);
          setStatus("Copied");
          onCopy?.();
        } catch (error) {
          setStatus("Copy unavailable");
          onError?.(error);
        }
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setStatus(label), 1500);
      },
      children: [
        children,
        /* @__PURE__ */ jsx10(SingleSparkIcon, { name: status === "Copied" ? "check" : "copy" }),
        /* @__PURE__ */ jsx10("span", { className: "singlespark-sr-only", "aria-live": "polite", children: status })
      ]
    }
  );
}

// react/components/singlespark-primitives/SingleSparkPagination.tsx
import { useState as useState3 } from "react";
import { jsx as jsx11, jsxs as jsxs6 } from "react/jsx-runtime";
function SingleSparkPagination({
  page,
  defaultPage = 1,
  totalPages = 5,
  onPageChange,
  className = ""
}) {
  const [local, setLocal] = useState3(defaultPage);
  const total = Math.max(1, Math.floor(totalPages));
  const current = Math.min(total, Math.max(1, Math.floor(page ?? local)));
  const change = (next) => {
    setLocal(next);
    onPageChange?.(next);
  };
  return /* @__PURE__ */ jsxs6(
    "nav",
    {
      className: `singlespark-pagination ub-pagination ${className}`,
      "aria-label": "Pages",
      children: [
        /* @__PURE__ */ jsx11(
          SingleSparkIconButton,
          {
            "aria-label": "Previous page",
            disabled: current <= 1,
            onClick: () => change(current - 1),
            children: /* @__PURE__ */ jsx11(SingleSparkIcon, { name: "left" })
          }
        ),
        /* @__PURE__ */ jsxs6("span", { "aria-live": "polite", children: [
          current,
          " / ",
          total
        ] }),
        /* @__PURE__ */ jsx11(
          SingleSparkIconButton,
          {
            "aria-label": "Next page",
            disabled: current >= total,
            onClick: () => change(current + 1),
            children: /* @__PURE__ */ jsx11(SingleSparkIcon, { name: "right" })
          }
        )
      ]
    }
  );
}

// react/components/singlespark-primitives/SingleSparkAccordion.tsx
import { useEffect as useEffect2, useId, useRef as useRef4, useState as useState4 } from "react";
import { jsx as jsx12, jsxs as jsxs7 } from "react/jsx-runtime";
function SingleSparkAccordion({
  label = "Payment breakdown",
  children = "Creator fees are recorded per token and asset.",
  open,
  defaultOpen = false,
  onOpenChange,
  className = ""
}) {
  const [local, setLocal] = useState4(defaultOpen);
  const expanded = open ?? local;
  const id = useId();
  const body = useRef4(null);
  useEffect2(() => {
    if (body.current) body.current.inert = !expanded;
  }, [expanded]);
  return /* @__PURE__ */ jsxs7(
    "div",
    {
      className: `singlespark-accordion ub-expand ${expanded ? "ub-open" : ""} ${className}`,
      children: [
        /* @__PURE__ */ jsxs7(
          "button",
          {
            type: "button",
            className: "ub-expand-toggle",
            "aria-expanded": expanded,
            "aria-controls": id,
            onClick: () => {
              setLocal(!expanded);
              onOpenChange?.(!expanded);
            },
            children: [
              label,
              /* @__PURE__ */ jsx12(SingleSparkIcon, {})
            ]
          }
        ),
        /* @__PURE__ */ jsx12("div", { className: "ub-expand-grid", children: /* @__PURE__ */ jsx12("div", { children: /* @__PURE__ */ jsx12(
          "div",
          {
            className: "ub-expand-body",
            id,
            ref: body,
            "aria-hidden": !expanded,
            children
          }
        ) }) })
      ]
    }
  );
}

// react/components/singlespark-primitives/SingleSparkPanel.tsx
import { jsx as jsx13 } from "react/jsx-runtime";
function SingleSparkPanel({
  children = "Panel content",
  className = "",
  ...props
}) {
  return /* @__PURE__ */ jsx13("section", { className: `singlespark-panel ub-panel ${className}`, ...props, children });
}

// react/components/singlespark-primitives/SingleSparkField.tsx
import { jsx as jsx14, jsxs as jsxs8 } from "react/jsx-runtime";
function SingleSparkField({
  label = "Name",
  hint,
  className = "",
  ...input
}) {
  return /* @__PURE__ */ jsxs8("label", { className: `singlespark-field ub-field ${className}`, children: [
    /* @__PURE__ */ jsx14("span", { children: label }),
    /* @__PURE__ */ jsx14(
      SingleSparkTextInput,
      {
        "aria-label": typeof label === "string" ? label : void 0,
        ...input
      }
    ),
    hint && /* @__PURE__ */ jsx14("small", { children: hint })
  ] });
}

// react/components/singlespark-primitives/SingleSparkNotice.tsx
import { jsx as jsx15, jsxs as jsxs9 } from "react/jsx-runtime";
function SingleSparkNotice({
  title = "Creator fees",
  children = "Amounts reflect the recorded collection value.",
  className = ""
}) {
  return /* @__PURE__ */ jsxs9("div", { className: `singlespark-notice ub-note ${className}`, children: [
    /* @__PURE__ */ jsx15("strong", { children: title }),
    /* @__PURE__ */ jsx15("p", { children })
  ] });
}

// react/components/singlespark-primitives/SingleSparkKeyValueList.tsx
import { jsx as jsx16, jsxs as jsxs10 } from "react/jsx-runtime";
function SingleSparkKeyValueList({
  entries = [
    ["Recipient", "Beff (e/acc)"],
    ["Platform", "Pump"]
  ],
  className = ""
}) {
  return /* @__PURE__ */ jsx16("dl", { className: `singlespark-key-value ub-dl ${className}`, children: entries.map(([key, value], index) => /* @__PURE__ */ jsxs10("div", { children: [
    /* @__PURE__ */ jsx16("dt", { children: key }),
    /* @__PURE__ */ jsx16("dd", { children: value })
  ] }, index)) });
}

// react/components/singlespark-primitives/SingleSparkListRow.tsx
import { jsx as jsx17, jsxs as jsxs11 } from "react/jsx-runtime";
function SingleSparkListRow({
  label,
  children,
  className = ""
}) {
  return /* @__PURE__ */ jsxs11("div", { className: `singlespark-list-row ub-row ${className}`, children: [
    /* @__PURE__ */ jsx17("span", { children: label }),
    /* @__PURE__ */ jsx17("span", { children })
  ] });
}

// react/components/singlespark-primitives/SingleSparkListItem.tsx
import { Fragment, jsx as jsx18, jsxs as jsxs12 } from "react/jsx-runtime";
function SingleSparkListItem({
  title = "Beff (e/acc)",
  description = "@beffjezos",
  leading = /* @__PURE__ */ jsx18(SingleSparkAvatar, {}),
  trailing,
  onClick,
  selected,
  disabled,
  children,
  className = ""
}) {
  const content = /* @__PURE__ */ jsxs12(Fragment, { children: [
    leading,
    /* @__PURE__ */ jsxs12("span", { className: "singlespark-list-label", children: [
      /* @__PURE__ */ jsx18("strong", { children: title }),
      description && /* @__PURE__ */ jsx18("small", { children: description })
    ] }),
    trailing != null && /* @__PURE__ */ jsx18("span", { className: "singlespark-list-trailing", children: trailing }),
    children != null && /* @__PURE__ */ jsx18("section", { className: "singlespark-list-content", children })
  ] });
  return /* @__PURE__ */ jsx18("li", { className: `singlespark-list-item ${className}`, children: onClick ? /* @__PURE__ */ jsx18(
    "button",
    {
      type: "button",
      onClick,
      "aria-pressed": selected,
      disabled,
      children: content
    }
  ) : /* @__PURE__ */ jsx18("div", { children: content }) });
}

// react/components/singlespark-primitives/SingleSparkList.tsx
import { Fragment as Fragment2, jsx as jsx19, jsxs as jsxs13 } from "react/jsx-runtime";
function SingleSparkList({
  children,
  loading = false,
  className = "",
  ...props
}) {
  return /* @__PURE__ */ jsx19(
    "ul",
    {
      className: `singlespark-list ${className}`,
      "aria-busy": loading,
      ...props,
      children: loading ? /* @__PURE__ */ jsx19("li", { children: /* @__PURE__ */ jsx19(SingleSparkSkeleton, { variant: "list", label: "Loading list\u2026" }) }) : children || /* @__PURE__ */ jsxs13(Fragment2, { children: [
        /* @__PURE__ */ jsx19(SingleSparkListItem, { trailing: "$250,208.62" }),
        /* @__PURE__ */ jsx19(
          SingleSparkListItem,
          {
            title: "Elon Musk",
            description: "@elonmusk",
            leading: /* @__PURE__ */ jsx19(SingleSparkAvatar, { src: SingleSparkListAsset1.href }),
            trailing: "$177,942.53"
          }
        )
      ] })
    }
  );
}

// react/components/singlespark-primitives/SingleSparkDivider.tsx
import { jsx as jsx20 } from "react/jsx-runtime";
function SingleSparkDivider({ className = "" }) {
  return /* @__PURE__ */ jsx20("hr", { className: `singlespark-divider ${className}` });
}

// react/singlespark-primitives.tsx
var singleSparkPrimitiveComponents = {
  SingleSparkLoading,
  SingleSparkSkeleton,
  SingleSparkButton,
  SingleSparkIconButton,
  SingleSparkTabs,
  SingleSparkTextInput,
  SingleSparkSearchInput,
  SingleSparkTextarea,
  SingleSparkCheckbox,
  SingleSparkAvatar,
  SingleSparkBadge,
  SingleSparkCopyButton,
  SingleSparkPagination,
  SingleSparkAccordion,
  SingleSparkPanel,
  SingleSparkField,
  SingleSparkMoney,
  SingleSparkNotice,
  SingleSparkKeyValueList,
  SingleSparkList,
  SingleSparkListItem,
  SingleSparkDivider
};

export {
  SingleSparkButton,
  SingleSparkIconButton,
  SingleSparkTabs,
  SingleSparkTextInput,
  SingleSparkSearchInput,
  SingleSparkTextarea,
  SingleSparkCheckboxInput,
  SingleSparkCheckbox,
  SingleSparkAvatar,
  SingleSparkBadge,
  SingleSparkCopyButton,
  SingleSparkPagination,
  SingleSparkAccordion,
  SingleSparkPanel,
  SingleSparkField,
  SingleSparkNotice,
  SingleSparkKeyValueList,
  SingleSparkListRow,
  SingleSparkListItem,
  SingleSparkList,
  SingleSparkDivider,
  singleSparkPrimitiveComponents
};
