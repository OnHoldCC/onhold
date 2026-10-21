'use client';
import "./chunk-QQBHGKIW.js";
import "./chunk-BIDZ6CUL.js";
import {
  AddressLink,
  Checkbox,
  Input,
  NavigationIndicator,
  RangeInput,
  Textarea
} from "./chunk-Y2BLDS4Z.js";
import "./chunk-JIJS2BJG.js";
import {
  SingleSparkSparkline
} from "./chunk-TBO6LKPX.js";
import {
  SingleSparkButton,
  SingleSparkNotice,
  SingleSparkPanel
} from "./chunk-K6TMLM72.js";
import {
  SingleSparkLoading,
  SingleSparkSkeleton
} from "./chunk-V7OTFJLA.js";
import {
  SingleSparkIcon
} from "./chunk-DRA3EEEB.js";
import {
  SingleSparkMoney
} from "./chunk-BX7LGP4G.js";

// react/components/ui/Button.tsx
import { forwardRef } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var Button = forwardRef(function Button2({
  variant = "secondary",
  size = "md",
  leadingIcon,
  className = "",
  children,
  type = "button",
  ...props
}, ref) {
  return /* @__PURE__ */ jsxs(
    SingleSparkButton,
    {
      ref,
      variant: variant === "danger" ? "ghost" : variant,
      size: size === "lg" ? "md" : size,
      type,
      className: `app-button app-button--${variant} app-button--${size} ${className}`.trim(),
      ...props,
      children: [
        leadingIcon != null && /* @__PURE__ */ jsx("span", { className: "app-button__icon", "aria-hidden": "true", children: leadingIcon }),
        children != null && /* @__PURE__ */ jsx("span", { className: "app-button__label", children })
      ]
    }
  );
});

// react/components/ui/Dialog.tsx
import {
  forwardRef as forwardRef2,
  useEffect,
  useImperativeHandle,
  useRef
} from "react";
import { jsx as jsx2 } from "react/jsx-runtime";
var FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  '[tabindex]:not([tabindex="-1"])'
].join(",");
var modalStack = [];
var savedOverflow = "";
function isFocusable(element) {
  if (element.tabIndex < 0 || element.matches(":disabled")) return false;
  for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
    const style = getComputedStyle(ancestor);
    if (ancestor.hidden || ancestor.hasAttribute("inert") || ancestor.getAttribute("aria-hidden") === "true" || style.display === "none" || style.visibility === "hidden") return false;
    if (ancestor.tagName === "DETAILS" && !ancestor.hasAttribute("open") && !ancestor.querySelector("summary")?.contains(element)) return false;
  }
  return true;
}
function useDialogInteraction(open, dialogRef, {
  onClose,
  closeOnEscape = true,
  initialFocusRef
} = {}) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overlay = dialog.closest(".app-modal-overlay");
    const previousOverlay = modalStack[modalStack.length - 1]?.closest(".app-modal-overlay");
    const previousZIndex = overlay?.style.zIndex ?? "";
    if (overlay && previousOverlay) overlay.style.zIndex = String(Math.max(
      Number(getComputedStyle(overlay).zIndex) || 0,
      (Number(getComputedStyle(previousOverlay).zIndex) || 0) + 1
    ));
    if (!modalStack.length) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    modalStack.push(dialog);
    const isTop = () => modalStack[modalStack.length - 1] === dialog;
    const focusable = () => Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isFocusable);
    const focusInitial = () => {
      const initial = initialFocusRef?.current;
      (initial && isFocusable(initial) ? initial : focusable()[0] ?? dialog).focus({ preventScroll: true });
    };
    let active = true;
    queueMicrotask(() => {
      if (active && isTop()) focusInitial();
    });
    const handleFocus = (event) => {
      if (isTop() && event.target instanceof Node && !dialog.contains(event.target)) focusInitial();
    };
    const handleKeyDown = (event) => {
      if (!isTop() || event.defaultPrevented) return;
      if (event.key === "Escape" && closeOnEscape) {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !dialog.contains(document.activeElement) || (event.shiftKey ? document.activeElement === first || document.activeElement === dialog : document.activeElement === last || document.activeElement === dialog)) {
        event.preventDefault();
        (event.shiftKey ? last ?? dialog : first ?? dialog).focus();
      }
    };
    document.addEventListener("focusin", handleFocus);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      active = false;
      const wasTop = isTop();
      modalStack.splice(modalStack.indexOf(dialog), 1);
      if (overlay) overlay.style.zIndex = previousZIndex;
      if (!modalStack.length) document.body.style.overflow = savedOverflow;
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("keydown", handleKeyDown);
      if (wasTop) {
        const target = previouslyFocused?.isConnected && isFocusable(previouslyFocused) ? previouslyFocused : modalStack[modalStack.length - 1];
        target?.focus();
      }
    };
  }, [closeOnEscape, dialogRef, initialFocusRef, open]);
}
var Dialog = forwardRef2(function Dialog2({
  open = true,
  children,
  onClose,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  initialFocusRef,
  overlayClassName = "",
  className = "",
  overlayStyle,
  style
}, forwardedRef) {
  const dialogRef = useRef(null);
  useImperativeHandle(forwardedRef, () => dialogRef.current);
  useDialogInteraction(open, dialogRef, { onClose, closeOnEscape, initialFocusRef });
  if (!open) return null;
  const handleOverlayClick = (event) => {
    if (modalStack[modalStack.length - 1] === dialogRef.current && closeOnOverlayClick && event.target === event.currentTarget) onClose?.();
  };
  return /* @__PURE__ */ jsx2(
    "div",
    {
      className: `app-modal-overlay ${overlayClassName}`.trim(),
      onClick: handleOverlayClick,
      style: overlayStyle,
      children: /* @__PURE__ */ jsx2(
        "div",
        {
          ref: dialogRef,
          className: `app-modal-dialog ${className}`.trim(),
          role: "dialog",
          "aria-modal": "true",
          "aria-label": ariaLabel,
          "aria-labelledby": ariaLabelledBy,
          "aria-describedby": ariaDescribedBy,
          tabIndex: -1,
          style,
          children
        }
      )
    }
  );
});

// react/components/ui/EmptyState.tsx
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function EmptyState({
  title,
  description,
  icon,
  action,
  compact = false,
  className = ""
}) {
  return /* @__PURE__ */ jsxs2(
    "div",
    {
      role: "status",
      className: `app-empty-state ${compact ? "app-empty-state--compact" : ""} ${className}`.trim(),
      children: [
        icon != null && /* @__PURE__ */ jsx3("div", { className: "app-empty-state__icon", "aria-hidden": "true", children: icon }),
        /* @__PURE__ */ jsx3("div", { className: "app-empty-state__title", children: title }),
        description && /* @__PURE__ */ jsx3("div", { className: "app-empty-state__description", children: description }),
        action != null && /* @__PURE__ */ jsx3("div", { className: "app-empty-state__action", children: action })
      ]
    }
  );
}

// react/components/ui/Skeleton.tsx
import { jsx as jsx4 } from "react/jsx-runtime";
function Skeleton({
  count = 1,
  width = "100%",
  height = 12,
  borderRadius = 7,
  gap = 8,
  ariaLabel = "Loading",
  className = ""
}) {
  return /* @__PURE__ */ jsx4(
    "div",
    {
      role: ariaLabel ? "status" : void 0,
      "aria-label": ariaLabel ?? void 0,
      "aria-hidden": ariaLabel ? void 0 : true,
      className: `app-skeleton-group ${className}`.trim(),
      style: { gap },
      children: Array.from({ length: Math.max(1, count) }, (_, index) => /* @__PURE__ */ jsx4(
        SingleSparkSkeleton,
        {
          decorative: true,
          variant: "input",
          className: "app-skeleton",
          style: { width, height, borderRadius }
        },
        index
      ))
    }
  );
}

// react/components/ui/DataTable.tsx
import { jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
import { createElement } from "react";
function DataTable({
  ariaLabel,
  columns,
  rows,
  rowKey,
  loading = false,
  loadingLabel = "Loading",
  loadingRows = 3,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  gridTemplateColumns,
  minWidth,
  className = "",
  scrollClassName = "",
  headerRowClassName = "",
  rowClassName = "",
  getRowProps
}) {
  const gridStyle = { gridTemplateColumns, minWidth };
  return /* @__PURE__ */ jsx5(
    "div",
    {
      role: "table",
      "aria-label": ariaLabel,
      "aria-busy": loading || void 0,
      "aria-rowcount": loading ? void 0 : rows.length + 1,
      "aria-colcount": columns.length,
      className: `app-data-table ${className}`.trim(),
      children: /* @__PURE__ */ jsxs3("div", { className: `app-data-table__scroll ${scrollClassName}`.trim(), children: [
        /* @__PURE__ */ jsx5("div", { role: "rowgroup", children: /* @__PURE__ */ jsx5(
          "div",
          {
            role: "row",
            className: `app-data-table__row app-data-table__head ${headerRowClassName}`.trim(),
            style: gridStyle,
            children: columns.map((column) => /* @__PURE__ */ jsx5(
              "div",
              {
                role: "columnheader",
                "data-align": column.align ?? "start",
                className: column.headerClassName,
                children: column.header
              },
              column.id
            ))
          }
        ) }),
        /* @__PURE__ */ jsx5("div", { role: "rowgroup", className: "app-data-table__body", children: loading ? Array.from({ length: Math.max(1, loadingRows) }, (_, rowIndex) => /* @__PURE__ */ jsx5(
          "div",
          {
            role: "row",
            className: "app-data-table__row app-data-table__loading-row",
            style: gridStyle,
            children: columns.map((column, columnIndex) => /* @__PURE__ */ jsx5("div", { role: "cell", "data-align": column.align ?? "start", children: /* @__PURE__ */ jsx5(
              Skeleton,
              {
                ariaLabel: rowIndex === 0 && columnIndex === 0 ? loadingLabel : null,
                width: column.align === "center" ? "72%" : "88%",
                height: 9
              }
            ) }, column.id))
          },
          `loading-${rowIndex}`
        )) : rows.length === 0 ? /* @__PURE__ */ jsx5("div", { role: "row", className: "app-data-table__state-row", style: { minWidth }, children: /* @__PURE__ */ jsx5("div", { role: "cell", "aria-colspan": columns.length, children: /* @__PURE__ */ jsx5(
          EmptyState,
          {
            compact: true,
            icon: emptyIcon,
            title: emptyTitle,
            description: emptyDescription
          }
        ) }) }) : rows.map((row, rowIndex) => {
          const extraProps = getRowProps?.(row, rowIndex) ?? {};
          const configuredClass = typeof rowClassName === "function" ? rowClassName(row, rowIndex) : rowClassName;
          const { className: extraClass = "", style: extraStyle, ...restProps } = extraProps;
          return /* @__PURE__ */ createElement(
            "div",
            {
              ...restProps,
              key: rowKey(row, rowIndex),
              role: "row",
              className: `app-data-table__row app-data-table__data-row ${configuredClass} ${extraClass}`.trim(),
              style: { ...gridStyle, ...extraStyle }
            },
            columns.map((column) => /* @__PURE__ */ jsx5(
              "div",
              {
                role: "cell",
                "data-align": column.align ?? "start",
                className: column.cellClassName,
                children: column.cell(row, rowIndex)
              },
              column.id
            ))
          );
        }) })
      ] })
    }
  );
}

// react/components/ui/Sparkline.tsx
import { jsx as jsx6 } from "react/jsx-runtime";
function Sparkline({ data, up, width = 92, height = 26, strokeWidth = 1.6 }) {
  return /* @__PURE__ */ jsx6(
    SingleSparkSparkline,
    {
      data,
      height,
      strokeWidth,
      style: { width, height, color: up ? "var(--icon-success)" : "var(--icon-danger)" }
    }
  );
}

// react/components/ui/StatTile.tsx
import { jsx as jsx7, jsxs as jsxs4 } from "react/jsx-runtime";
function StatTile({
  icon,
  label,
  value,
  sub
}) {
  return /* @__PURE__ */ jsxs4(SingleSparkPanel, { className: "app-stat-tile", children: [
    /* @__PURE__ */ jsxs4(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "var(--soft)",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 10
        },
        children: [
          icon && /* @__PURE__ */ jsx7("i", { className: "ph " + icon, style: { fontSize: 16, color: "var(--icon-gold)" } }),
          label
        ]
      }
    ),
    /* @__PURE__ */ jsx7("div", { style: { fontFamily: "'DM Mono', monospace", fontSize: 24, fontWeight: 500 }, children: typeof value === "string" || typeof value === "number" ? /* @__PURE__ */ jsx7(SingleSparkMoney, { value }) : value }),
    sub && /* @__PURE__ */ jsx7("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 2 }, children: sub })
  ] });
}

// react/components/ui/SegmentedTabs.tsx
import { useLayoutEffect as useLayoutEffect2, useRef as useRef3, useState as useState2 } from "react";

// react/components/ui/ScrollRail.tsx
import { useLayoutEffect, useRef as useRef2, useState } from "react";
import { jsx as jsx8, jsxs as jsxs5 } from "react/jsx-runtime";
function ScrollRail({ children, activeIndex, previousLabel, nextLabel }) {
  const trackRef = useRef2(null);
  const [edges, setEdges] = useState({ previous: false, next: false });
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const overflowing2 = track.scrollWidth > (track.parentElement?.clientWidth ?? track.clientWidth) + 1;
      setEdges({ previous: overflowing2 && track.scrollLeft > 1, next: overflowing2 && track.scrollLeft + track.clientWidth < track.scrollWidth - 1 });
    };
    const resize = () => {
      const active = track.children[activeIndex];
      if (active) {
        if (active.offsetLeft < track.scrollLeft) track.scrollLeft = active.offsetLeft;
        else if (active.offsetLeft + active.offsetWidth > track.scrollLeft + track.clientWidth)
          track.scrollLeft = active.offsetLeft + active.offsetWidth - track.clientWidth;
      }
      measure();
    };
    resize();
    track.addEventListener("scroll", measure);
    window.addEventListener("resize", resize);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    observer?.observe(track);
    Array.from(track.children).forEach((child) => observer?.observe(child));
    return () => {
      track.removeEventListener("scroll", measure);
      window.removeEventListener("resize", resize);
      observer?.disconnect();
    };
  }, [activeIndex, children]);
  const move = (direction) => trackRef.current?.scrollBy({
    left: direction * trackRef.current.clientWidth * 0.75,
    behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
  });
  const overflowing = edges.previous || edges.next;
  return /* @__PURE__ */ jsxs5("div", { className: "scroll-rail", children: [
    overflowing && /* @__PURE__ */ jsx8("button", { className: "scroll-rail__arrow", type: "button", "aria-label": previousLabel, disabled: !edges.previous, onClick: () => move(-1), children: /* @__PURE__ */ jsx8("i", { className: "ph ph-caret-left", "aria-hidden": "true" }) }),
    /* @__PURE__ */ jsx8("div", { ref: trackRef, className: "scroll-rail__track", children }),
    overflowing && /* @__PURE__ */ jsx8("button", { className: "scroll-rail__arrow", type: "button", "aria-label": nextLabel, disabled: !edges.next, onClick: () => move(1), children: /* @__PURE__ */ jsx8("i", { className: "ph ph-caret-right", "aria-hidden": "true" }) })
  ] });
}

// react/components/ui/SegmentedTabs.tsx
import { jsx as jsx9, jsxs as jsxs6 } from "react/jsx-runtime";
function SegmentedTabs({
  value,
  options,
  onChange,
  ariaLabel,
  panelId,
  className = "",
  fillOnMobile = false,
  collapseIconsOnMobile = false,
  scrollLabels
}) {
  const rootRef = useRef3(null);
  const itemRefs = useRef3([]);
  const [slider, setSlider] = useState2(null);
  const classes = [
    "segmented-tabs",
    fillOnMobile && "segmented-tabs--mobile-fill",
    collapseIconsOnMobile && "segmented-tabs--mobile-collapse-icons",
    scrollLabels && "segmented-tabs--rail",
    className
  ].filter(Boolean).join(" ");
  useLayoutEffect2(() => {
    if (scrollLabels) return;
    const root = rootRef.current;
    const activeIndex = options.findIndex((option) => option.value === value);
    const activeItem = itemRefs.current[activeIndex];
    if (!root || !activeItem) {
      setSlider(null);
      return void 0;
    }
    const measure = () => {
      const rootRect = root.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const next = {
        left: itemRect.left - rootRect.left + root.scrollLeft,
        width: itemRect.width
      };
      setSlider((current) => current?.left === next.left && current.width === next.width ? current : next);
    };
    measure();
    window.addEventListener("resize", measure);
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resizeObserver?.observe(root);
    itemRefs.current.forEach((item) => item && resizeObserver?.observe(item));
    return () => {
      window.removeEventListener("resize", measure);
      resizeObserver?.disconnect();
    };
  }, [options, value, !!scrollLabels]);
  const handleKeyDown = (event, index) => {
    if (options[index].disabled) return;
    const enabled = options.map((option, i) => option.disabled ? -1 : i).filter((i) => i >= 0);
    if (!enabled.length) return;
    const current = enabled.indexOf(index);
    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = enabled[(current + 1) % enabled.length];
    if (event.key === "ArrowLeft") nextIndex = enabled[(current - 1 + enabled.length) % enabled.length];
    if (event.key === "Home") nextIndex = enabled[0];
    if (event.key === "End") nextIndex = enabled[enabled.length - 1];
    if (nextIndex == null) return;
    event.preventDefault();
    onChange(options[nextIndex].value);
    itemRefs.current[nextIndex]?.focus();
  };
  const items = options.map((option, index) => {
    const active = option.value === value;
    return /* @__PURE__ */ jsxs6(
      "button",
      {
        value: option.value,
        ref: (item) => {
          itemRefs.current[index] = item;
        },
        type: "button",
        className: `segmented-tabs__item${active ? " active" : ""}`,
        "aria-label": option.ariaLabel,
        id: panelId ? `${panelId}-tab-${option.value}` : void 0,
        role: panelId ? "tab" : void 0,
        "aria-controls": panelId,
        "aria-selected": panelId ? active : void 0,
        tabIndex: panelId ? active ? 0 : -1 : void 0,
        "aria-pressed": panelId ? void 0 : active,
        disabled: option.disabled,
        onClick: () => onChange(option.value),
        onKeyDown: (event) => handleKeyDown(event, index),
        children: [
          option.icon && (typeof option.icon === "string" ? /* @__PURE__ */ jsx9("i", { className: `ph ${option.icon} segmented-tabs__icon`, "aria-hidden": "true" }) : /* @__PURE__ */ jsx9("span", { className: "segmented-tabs__icon", "aria-hidden": "true", children: option.icon })),
          /* @__PURE__ */ jsx9("span", { className: "segmented-tabs__label", children: option.label }),
          option.count != null && /* @__PURE__ */ jsx9("b", { className: "segmented-tabs__count", children: typeof option.count === "number" || typeof option.count === "string" ? /* @__PURE__ */ jsx9(SingleSparkMoney, { value: option.count }) : option.count })
        ]
      },
      option.value
    );
  });
  return /* @__PURE__ */ jsxs6("div", { ref: rootRef, className: classes, role: panelId ? "tablist" : "group", "aria-label": ariaLabel, children: [
    !scrollLabels && /* @__PURE__ */ jsx9(
      "span",
      {
        className: `segmented-tabs__slider${slider ? " is-ready" : ""}`,
        "aria-hidden": "true",
        style: slider ? {
          width: `${slider.width}px`,
          transform: `translate3d(${slider.left}px, 0, 0)`
        } : void 0
      }
    ),
    scrollLabels ? /* @__PURE__ */ jsx9(ScrollRail, { activeIndex: options.findIndex((option) => option.value === value), previousLabel: scrollLabels.previous, nextLabel: scrollLabels.next, children: items }) : items
  ] });
}

// react/components/ui/Select.tsx
import { useEffect as useEffect2, useId, useRef as useRef4, useState as useState3 } from "react";
import { jsx as jsx10, jsxs as jsxs7 } from "react/jsx-runtime";
function Select({
  value,
  options,
  onChange,
  ariaLabel,
  className = "",
  compact = false,
  disabled = false,
  placeholder,
  editable = false,
  inputMode,
  iconPlacement = "start",
  inputIcon,
  optionsLabel
}) {
  const [open, setOpen] = useState3(false);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const initialIndex = Math.max(0, selectedIndex);
  const [highlightedIndex, setHighlightedIndex] = useState3(initialIndex);
  const rootRef = useRef4(null);
  const triggerRef = useRef4(null);
  const inputRef = useRef4(null);
  const typeahead = useRef4({ text: "", time: 0 });
  const listboxId = `${useId()}-listbox`;
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : void 0;
  useEffect2(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  useEffect2(() => {
    if (open) document.getElementById(`${listboxId}-option-${highlightedIndex}`)?.scrollIntoView?.({ block: "nearest" });
  }, [open, highlightedIndex, listboxId]);
  useEffect2(() => {
    if (!open) return void 0;
    const closeFromOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeFromOutside);
    return () => document.removeEventListener("pointerdown", closeFromOutside);
  }, [open]);
  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) {
      if (editable) inputRef.current?.focus();
      else triggerRef.current?.focus();
    }
  };
  const selectIndex = (index) => {
    if (disabled) return;
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    close(true);
  };
  const moveHighlight = (nextIndex, direction = 1) => {
    if (!options.length) return;
    for (let offset = 0; offset < options.length; offset++) {
      const index = ((nextIndex + offset * direction) % options.length + options.length) % options.length;
      if (!options[index].disabled) {
        setHighlightedIndex(index);
        return;
      }
    }
  };
  const openAt = (index, direction = 1) => {
    moveHighlight(index, direction);
    setOpen(true);
  };
  const handleKeyDown = (event) => {
    if (disabled) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) openAt(initialIndex);
        else moveHighlight(highlightedIndex + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) openAt(initialIndex);
        else moveHighlight(highlightedIndex - 1, -1);
        break;
      case "Home":
        event.preventDefault();
        openAt(0);
        break;
      case "End":
        event.preventDefault();
        openAt(options.length - 1, -1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (open) selectIndex(highlightedIndex);
        else openAt(initialIndex);
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          close(true);
        }
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          const now = Date.now();
          const key = event.key.toLocaleLowerCase();
          const previous = now - typeahead.current.time < 700 ? typeahead.current.text : "";
          const query = previous === key ? key : previous + key;
          typeahead.current = { text: query, time: now };
          const start = query.length === 1 ? (open ? highlightedIndex : initialIndex) + 1 : 0;
          const index = options.map((_, offset) => (start + offset) % options.length).find((index2) => !options[index2].disabled && options[index2].label.toLocaleLowerCase().startsWith(query));
          if (index !== void 0) {
            if (open) moveHighlight(index);
            else onChange(options[index].value);
          }
        }
        break;
    }
  };
  const handleInputKeyDown = (event) => {
    if (disabled) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) openAt(initialIndex);
        else moveHighlight(highlightedIndex + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) openAt(initialIndex);
        else moveHighlight(highlightedIndex - 1, -1);
        break;
      case "Home":
        if (open) {
          event.preventDefault();
          moveHighlight(0);
        }
        break;
      case "End":
        if (open) {
          event.preventDefault();
          moveHighlight(options.length - 1, -1);
        }
        break;
      case "Enter":
        if (open) {
          event.preventDefault();
          selectIndex(highlightedIndex);
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          close(true);
        }
        break;
      default:
        break;
    }
  };
  const renderOptionContent = (option) => /* @__PURE__ */ jsxs7("span", { className: "app-select__option-content", children: [
    iconPlacement === "start" && option.icon && /* @__PURE__ */ jsx10("span", { className: "app-select__icon", "aria-hidden": "true", children: option.icon }),
    /* @__PURE__ */ jsx10("span", { className: "app-select__text", children: option.label }),
    iconPlacement === "end" && option.icon && /* @__PURE__ */ jsx10("span", { className: "app-select__icon app-select__icon--end", "aria-hidden": "true", children: option.icon })
  ] });
  return /* @__PURE__ */ jsxs7("div", { ref: rootRef, onBlur: (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) close();
  }, className: `app-select ${open ? "app-select--open" : ""} ${compact ? "app-select--compact" : ""} ${disabled ? "app-select--disabled" : ""} ${className}`.trim(), children: [
    editable ? /* @__PURE__ */ jsxs7("div", { className: "app-select__editable-control", children: [
      /* @__PURE__ */ jsx10(
        Input,
        {
          bare: true,
          ref: inputRef,
          className: "app-select__input",
          type: "text",
          inputMode,
          disabled,
          value,
          placeholder: placeholder ?? "Select",
          role: "combobox",
          "aria-label": ariaLabel,
          "aria-haspopup": "listbox",
          "aria-autocomplete": "list",
          "aria-expanded": open,
          "aria-controls": listboxId,
          "aria-activedescendant": open ? `${listboxId}-option-${highlightedIndex}` : void 0,
          onChange: (event) => onChange(event.target.value),
          onKeyDown: handleInputKeyDown
        }
      ),
      (inputIcon ?? selectedOption?.icon) && /* @__PURE__ */ jsx10("span", { className: "app-select__input-icon", "aria-hidden": "true", children: inputIcon ?? selectedOption?.icon }),
      /* @__PURE__ */ jsx10(
        "button",
        {
          ref: triggerRef,
          type: "button",
          disabled,
          className: "app-select__toggle",
          "aria-label": optionsLabel ?? `${ariaLabel} options`,
          "aria-expanded": open,
          "aria-controls": listboxId,
          onClick: () => {
            if (open) close();
            else openAt(initialIndex);
          },
          children: /* @__PURE__ */ jsx10("span", { className: "app-select__chevron", "aria-hidden": "true", children: /* @__PURE__ */ jsx10("i", { className: "ph ph-caret-down" }) })
        }
      )
    ] }) : /* @__PURE__ */ jsxs7(
      "button",
      {
        ref: triggerRef,
        type: "button",
        disabled,
        className: "app-select__trigger",
        role: "combobox",
        "aria-label": ariaLabel,
        title: selectedOption?.label,
        "aria-haspopup": "listbox",
        "aria-expanded": open,
        "aria-controls": listboxId,
        "aria-activedescendant": open ? `${listboxId}-option-${highlightedIndex}` : void 0,
        onClick: () => {
          if (open) close();
          else openAt(initialIndex);
        },
        onKeyDown: handleKeyDown,
        children: [
          /* @__PURE__ */ jsxs7("span", { className: "app-select__value", children: [
            iconPlacement === "start" && selectedOption?.icon && /* @__PURE__ */ jsx10("span", { className: "app-select__icon", "aria-hidden": "true", children: selectedOption.icon }),
            /* @__PURE__ */ jsx10("span", { className: "app-select__text", children: selectedOption?.label ?? placeholder ?? "Select" }),
            iconPlacement === "end" && selectedOption?.icon && /* @__PURE__ */ jsx10("span", { className: "app-select__icon app-select__icon--end", "aria-hidden": "true", children: selectedOption.icon })
          ] }),
          /* @__PURE__ */ jsx10("span", { className: "app-select__chevron", "aria-hidden": "true", children: /* @__PURE__ */ jsx10("i", { className: "ph ph-caret-down" }) })
        ]
      }
    ),
    open && /* @__PURE__ */ jsx10("div", { id: listboxId, className: "app-select__listbox", role: "listbox", "aria-label": ariaLabel, children: options.map((option, index) => {
      const selected = option.value === value;
      const highlighted = index === highlightedIndex;
      return /* @__PURE__ */ jsxs7(
        "button",
        {
          id: `${listboxId}-option-${index}`,
          type: "button",
          role: "option",
          tabIndex: -1,
          "aria-selected": selected,
          "aria-disabled": option.disabled || void 0,
          disabled: option.disabled,
          title: option.label,
          className: `app-select__option ${selected ? "app-select__option--selected" : ""} ${highlighted ? "app-select__option--highlighted" : ""}`.trim(),
          onPointerMove: () => {
            if (!option.disabled) setHighlightedIndex(index);
          },
          onClick: () => selectIndex(index),
          children: [
            renderOptionContent(option),
            selected && /* @__PURE__ */ jsx10("i", { className: "ph ph-check", "aria-hidden": "true" })
          ]
        },
        option.value
      );
    }) })
  ] });
}

// react/components/ui/NetworkSelector.tsx
import { Fragment, jsx as jsx11, jsxs as jsxs8 } from "react/jsx-runtime";
function NetworkSelector({ options, compact, disabled, locked, scrollLabels, onIconError, className = "", ...props }) {
  const choices = options.map((option) => {
    const icon = option.icon && /* @__PURE__ */ jsx11("img", { src: option.icon, "data-network-enabled": !option.disabled && !disabled, width: 20, height: 20, alt: "", draggable: false, onError: onIconError });
    return { ...option, disabled: disabled || locked || option.disabled, icon };
  });
  const classes = `network-selector${locked && !disabled ? " network-selector--locked" : ""} ${className}`;
  if (compact) return /* @__PURE__ */ jsx11(Select, { ...props, className: classes, compact: true, disabled: disabled || locked, options: choices });
  return /* @__PURE__ */ jsx11(SegmentedTabs, { ...props, className: classes, scrollLabels, options: choices.map(({ icon, ...option }) => ({
    ...option,
    ariaLabel: option.label,
    label: /* @__PURE__ */ jsxs8(Fragment, { children: [
      icon,
      /* @__PURE__ */ jsx11("span", { children: option.label })
    ] })
  })) });
}

// react/components/ui/SegProgressBar.tsx
import { useEffect as useEffect3, useRef as useRef5, useState as useState4 } from "react";
import { jsx as jsx12 } from "react/jsx-runtime";
var STOPS = [
  [255, 107, 53],
  [255, 61, 139],
  [160, 107, 255],
  [77, 159, 255]
];
function colorAt(t) {
  const seg = Math.min(2, Math.floor(t * 3));
  const f = t * 3 - seg;
  const a = STOPS[seg];
  const b = STOPS[seg + 1];
  return [0, 1, 2].map((k) => Math.round(a[k] + (b[k] - a[k]) * f));
}
function SegProgressBar({
  value,
  cells = 32,
  headCount = 2,
  height = 10,
  gap = 2,
  reveal = true,
  showDone = false,
  ariaLabel,
  style,
  className
}) {
  const [k, setK] = useState4(reveal ? 0 : 1);
  const rafRef = useRef5(0);
  useEffect3(() => {
    if (!reveal) return;
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / 900);
      setK(1 - Math.pow(1 - t, 3));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reveal]);
  const available = Number.isFinite(value);
  const shown = available ? Math.max(0, Math.min(100, value * k)) : 0;
  const lit = Math.min(cells, Math.ceil(shown / 100 * cells));
  const done = showDone && value >= 100 && k >= 1;
  return /* @__PURE__ */ jsx12(
    "div",
    {
      className: "sb" + (done ? " sb-done" : "") + (className ? " " + className : ""),
      style: { height, gap, ...style },
      role: "progressbar",
      "aria-label": ariaLabel,
      "aria-valuenow": available ? Math.max(0, Math.min(100, value)) : void 0,
      "aria-valuetext": available ? void 0 : "Unavailable",
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      children: Array.from({ length: cells }, (_, i) => {
        const [r, g, b] = colorAt(cells === 1 ? 0 : i / (cells - 1));
        const fill = Math.max(0, Math.min(1, shown / 100 * cells - i));
        const on = i < lit;
        const head = on && !done && shown < 100 && headCount > 0 && i >= lit - headCount;
        return /* @__PURE__ */ jsx12(
          "div",
          {
            className: "sb-cell" + (on ? " on" : "") + (fill > 0 && fill < 1 ? " partial" : "") + (head ? " head" : ""),
            style: {
              ["--i"]: String(i),
              ["--fill"]: `${fill * 100}%`,
              ["--c"]: `rgb(${r},${g},${b})`,
              ["--glow"]: `rgba(${r},${g},${b},0.55)`
            }
          },
          i
        );
      })
    }
  );
}

// react/components/ui/DetailDialog.tsx
import { createPortal } from "react-dom";
import { jsx as jsx13, jsxs as jsxs9 } from "react/jsx-runtime";
function DetailDialog({ title, ariaLabel = title, open = true, onClose, children, closeLabel }) {
  return createPortal(/* @__PURE__ */ jsxs9(Dialog, { open, className: "token-detail-dialog", ariaLabel, onClose, children: [
    /* @__PURE__ */ jsxs9("header", { className: "token-detail-dialog__header", children: [
      /* @__PURE__ */ jsx13("h2", { children: title }),
      /* @__PURE__ */ jsx13(Button, { variant: "ghost", "aria-label": closeLabel, onClick: onClose, children: /* @__PURE__ */ jsx13("i", { className: "ph ph-x", "aria-hidden": "true" }) })
    ] }),
    /* @__PURE__ */ jsx13("div", { className: "token-detail-dialog__body", children })
  ] }), document.body);
}

// react/components/ui/Notice.tsx
import { Fragment as Fragment2, jsx as jsx14, jsxs as jsxs10 } from "react/jsx-runtime";
function Notice({ title, children, icon, onClose, closeLabel = "Close" }) {
  return /* @__PURE__ */ jsx14(
    SingleSparkNotice,
    {
      className: `app-notice${icon ? " app-notice--icon" : ""}${onClose ? " app-notice--dismissible" : ""}`,
      title: /* @__PURE__ */ jsxs10(Fragment2, { children: [
        icon && /* @__PURE__ */ jsx14("span", { className: "app-notice__icon", "aria-hidden": "true", children: icon }),
        /* @__PURE__ */ jsx14("span", { children: title }),
        onClose && /* @__PURE__ */ jsx14(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: "app-notice__close",
            "aria-label": closeLabel,
            onClick: onClose,
            leadingIcon: /* @__PURE__ */ jsx14("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", children: /* @__PURE__ */ jsx14("path", { d: "m6 6 12 12M18 6 6 18" }) })
          }
        )
      ] }),
      children
    }
  );
}

// react/components/ui/BottomNavigation.tsx
import { useLayoutEffect as useLayoutEffect3, useRef as useRef6, useState as useState5 } from "react";

// react/components/ui/BottomSheet.tsx
import { createPortal as createPortal2 } from "react-dom";
import { jsx as jsx15, jsxs as jsxs11 } from "react/jsx-runtime";
function BottomSheet({ open, onClose, title, closeLabel, children, bottomInset }) {
  if (!open || typeof document === "undefined") return null;
  return createPortal2(/* @__PURE__ */ jsxs11(
    Dialog,
    {
      onClose,
      ariaLabel: title,
      overlayClassName: `app-bottom-sheet-overlay${bottomInset === void 0 ? "" : " app-bottom-sheet-overlay--navigation"}`,
      className: "app-bottom-sheet",
      overlayStyle: bottomInset === void 0 ? void 0 : { "--navigation-inset": `${bottomInset}px` },
      children: [
        /* @__PURE__ */ jsxs11("header", { className: "app-bottom-sheet__header", children: [
          /* @__PURE__ */ jsx15("h2", { children: title }),
          /* @__PURE__ */ jsx15(Button, { variant: "ghost", "aria-label": closeLabel, onClick: onClose, children: /* @__PURE__ */ jsx15("span", { "aria-hidden": "true", children: "\xD7" }) })
        ] }),
        /* @__PURE__ */ jsx15("div", { className: "app-bottom-sheet__body", children })
      ]
    }
  ), document.body);
}

// react/components/ui/BottomNavigation.tsx
import { Fragment as Fragment3, jsx as jsx16, jsxs as jsxs12 } from "react/jsx-runtime";
function BottomNavigation({ label, items, className = "", overflow }) {
  const expandedIndex = items.findIndex((item) => item.expanded);
  const activeIndex = expandedIndex >= 0 ? expandedIndex : items.findIndex((item) => item.active);
  const navRef = useRef6(null);
  const activeIconRef = useRef6(null);
  const overflowIndex = expandedIndex >= 0 ? overflow?.items.findIndex((item) => item.active) ?? -1 : -1;
  const [barHeight, setBarHeight] = useState5(65);
  useLayoutEffect3(() => {
    const measure = () => setBarHeight((previous) => navRef.current?.getBoundingClientRect().height || previous);
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    if (navRef.current) observer?.observe(navRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  return /* @__PURE__ */ jsxs12(Fragment3, { children: [
    /* @__PURE__ */ jsx16("nav", { ref: navRef, "aria-label": label, className: `app-bottom-navigation ${className}`.trim(), children: /* @__PURE__ */ jsx16("div", { className: "app-bottom-navigation__track", style: { gridTemplateColumns: `repeat(${Math.max(1, items.length)}, minmax(0, 1fr))` }, children: items.map((item, index) => {
      const content = /* @__PURE__ */ jsxs12(Fragment3, { children: [
        /* @__PURE__ */ jsx16("span", { ref: index === activeIndex && overflowIndex < 0 ? activeIconRef : void 0, className: "app-bottom-navigation__icon", "aria-hidden": "true", children: item.icon }),
        /* @__PURE__ */ jsx16("span", { children: item.label })
      ] });
      const props = { className: "app-bottom-navigation__item", "data-active": index === activeIndex || void 0, onClick: item.onClick };
      return item.href ? /* @__PURE__ */ jsx16("a", { ...props, href: item.href, "aria-current": item.active ? "page" : void 0, children: content }, item.id) : /* @__PURE__ */ jsx16("button", { ...props, type: "button", "aria-haspopup": item.expanded === void 0 ? void 0 : "dialog", "aria-expanded": item.expanded, children: content }, item.id);
    }) }) }),
    overflow && /* @__PURE__ */ jsxs12(BottomSheet, { open: expandedIndex >= 0, title: overflow.title, closeLabel: overflow.closeLabel, onClose: overflow.onClose, bottomInset: barHeight, children: [
      /* @__PURE__ */ jsx16("nav", { className: "app-navigation-list", "aria-label": overflow.title, children: overflow.items.map((item, index) => /* @__PURE__ */ jsxs12("a", { href: item.href, "aria-current": item.active ? "page" : void 0, onClick: item.onClick, children: [
        /* @__PURE__ */ jsx16("span", { ref: index === overflowIndex ? activeIconRef : void 0, className: "app-bottom-navigation__icon", "aria-hidden": "true", children: item.icon }),
        /* @__PURE__ */ jsx16("span", { className: "app-navigation-list__label", children: item.label }),
        /* @__PURE__ */ jsx16("i", { className: "ph ph-caret-right", "aria-hidden": "true" })
      ] }, item.id)) }),
      overflow.footer
    ] }),
    /* @__PURE__ */ jsx16(NavigationIndicator, { targetRef: activeIconRef, clipSelector: ".app-bottom-sheet__body", className: "app-bottom-navigation__indicator", zIndex: expandedIndex >= 0 ? 81 : 50 })
  ] });
}

// react/components/ui/TokenDetailLayout.tsx
import { jsx as jsx17, jsxs as jsxs13 } from "react/jsx-runtime";
function TokenDetailHeader({ avatar, title, meta, metrics, children }) {
  return /* @__PURE__ */ jsxs13("header", { className: "arc-token-header arc-surface", children: [
    /* @__PURE__ */ jsxs13("div", { className: "arc-token-identity", children: [
      avatar,
      /* @__PURE__ */ jsxs13("div", { children: [
        /* @__PURE__ */ jsx17("div", { className: "arc-token-title", children: title }),
        /* @__PURE__ */ jsx17("div", { className: "arc-token-meta", children: meta })
      ] })
    ] }),
    metrics,
    children
  ] });
}
function TokenDetailLayout({ header, actions, actionsLabel, history, historyLabel, children, className = "" }) {
  return /* @__PURE__ */ jsxs13("main", { className: `arc-token-detail${className ? ` ${className}` : ""}`, children: [
    header,
    children,
    actions != null && /* @__PURE__ */ jsx17("div", { className: "token-detail-features", role: "group", "aria-label": actionsLabel, children: actions }),
    history != null && /* @__PURE__ */ jsx17("section", { className: "token-detail-history", "aria-label": historyLabel, children: history })
  ] });
}
function TokenHistoryToolbar({ tabs, actions, actionsLabel, hint }) {
  return /* @__PURE__ */ jsxs13("div", { className: "token-history-toolbar", children: [
    hint != null && /* @__PURE__ */ jsx17("div", { className: "token-history-hint", children: hint }),
    tabs,
    actions != null && /* @__PURE__ */ jsx17("div", { className: "token-history-actions", role: "group", "aria-label": actionsLabel, children: actions })
  ] });
}

// react/components/ui/TokenPluginPanel.tsx
import { jsx as jsx18, jsxs as jsxs14 } from "react/jsx-runtime";
function TokenPluginPanel({ plugins, label }) {
  return /* @__PURE__ */ jsxs14(SingleSparkPanel, { className: "token-plugin-panel", "aria-label": label, children: [
    /* @__PURE__ */ jsx18("h2", { className: "token-plugin-panel__label", children: label }),
    plugins
  ] });
}

// react/components/ui/VaultOverview.tsx
import { jsx as jsx19, jsxs as jsxs15 } from "react/jsx-runtime";
function VaultOverview({ label, balances, address, delay, children }) {
  return /* @__PURE__ */ jsxs15("section", { className: "vault-overview", "aria-label": label, children: [
    /* @__PURE__ */ jsx19("dl", { className: "vault-overview__balances", children: balances.map((balance) => /* @__PURE__ */ jsxs15("div", { children: [
      /* @__PURE__ */ jsx19("dt", { children: balance.label }),
      /* @__PURE__ */ jsx19("dd", { children: balance.amount })
    ] }, balance.label)) }),
    (address || delay) && /* @__PURE__ */ jsxs15("div", { className: "vault-overview__meta", children: [
      address,
      delay && /* @__PURE__ */ jsx19("span", { className: "vault-overview__delay", children: delay })
    ] }),
    children
  ] });
}
function RevenueAllocation({ label, items, summary, rules, rulesLabel }) {
  let offset = 0;
  const slices = items.map((item, index) => {
    const start = offset;
    offset += item.percent;
    return { ...item, start, color: `var(--allocation-color-${index}, var(--soft))` };
  }).filter((item) => item.percent > 0);
  return /* @__PURE__ */ jsxs15("section", { className: "revenue-allocation", "aria-label": label, children: [
    /* @__PURE__ */ jsxs15("div", { className: "revenue-allocation__body", children: [
      /* @__PURE__ */ jsxs15("div", { className: "revenue-allocation__chart", children: [
        /* @__PURE__ */ jsx19("svg", { viewBox: "0 0 120 120", "aria-hidden": "true", children: /* @__PURE__ */ jsx19("g", { transform: "rotate(-90 60 60)", children: slices.map(
          (item) => /* @__PURE__ */ jsx19(
            "circle",
            {
              cx: "60",
              cy: "60",
              r: "48",
              fill: "none",
              stroke: item.color,
              strokeWidth: "10",
              pathLength: "100",
              strokeDasharray: `${item.percent} ${100 - item.percent}`,
              strokeDashoffset: -item.start
            },
            item.label
          )
        ) }) }),
        summary && /* @__PURE__ */ jsxs15("div", { className: "revenue-allocation__summary", children: [
          /* @__PURE__ */ jsx19("b", { children: summary.amount }),
          /* @__PURE__ */ jsx19("span", { children: summary.label })
        ] })
      ] }),
      /* @__PURE__ */ jsx19("dl", { className: "revenue-allocation__legend", children: slices.map((item) => /* @__PURE__ */ jsxs15("div", { children: [
        /* @__PURE__ */ jsxs15("dt", { children: [
          /* @__PURE__ */ jsx19("i", { "aria-hidden": "true", style: { background: item.color } }),
          item.label
        ] }),
        /* @__PURE__ */ jsxs15("dd", { title: `${item.percent}%`, children: [
          new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(item.percent),
          "%"
        ] })
      ] }, item.label)) })
    ] }),
    rules && /* @__PURE__ */ jsxs15("details", { className: "vault-rules", children: [
      /* @__PURE__ */ jsx19("summary", { children: rulesLabel }),
      rules,
      items.map((item) => item.detail && /* @__PURE__ */ jsxs15("div", { children: [
        item.label,
        " \xB7 ",
        item.detail
      ] }, item.label))
    ] })
  ] });
}

// react/components/ui/LaunchFormLayout.tsx
import { jsx as jsx20, jsxs as jsxs16 } from "react/jsx-runtime";
function LaunchFormLayout({ children, preview, ...form }) {
  return /* @__PURE__ */ jsx20("div", { className: "launch-form-layout", children: /* @__PURE__ */ jsxs16(SingleSparkPanel, { className: "arc-create-layout arc-surface", children: [
    /* @__PURE__ */ jsx20("form", { className: "arc-create-form", ...form, children }),
    /* @__PURE__ */ jsx20("div", { className: "arc-create-preview-column", children: preview })
  ] }) });
}

// react/components/ui/TokenLaunchPreview.tsx
import { jsx as jsx21, jsxs as jsxs17 } from "react/jsx-runtime";
function TokenLaunchPreview({ label, name, symbol, avatar, cover, description, badges, socials, children }) {
  return /* @__PURE__ */ jsxs17("aside", { className: "arc-create-preview", "aria-label": label, children: [
    /* @__PURE__ */ jsx21("span", { className: "arc-create-eyebrow", children: label }),
    /* @__PURE__ */ jsx21("div", { className: "arc-create-preview-image", children: cover }),
    /* @__PURE__ */ jsxs17("div", { className: "arc-create-identity", children: [
      avatar,
      /* @__PURE__ */ jsxs17("div", { children: [
        /* @__PURE__ */ jsxs17("div", { className: "arc-create-preview-title", children: [
          /* @__PURE__ */ jsx21("h2", { children: name }),
          badges
        ] }),
        /* @__PURE__ */ jsxs17("span", { children: [
          "$",
          symbol
        ] })
      ] })
    ] }),
    description && /* @__PURE__ */ jsx21("p", { className: "arc-create-hint arc-create-description", children: description }),
    socials && /* @__PURE__ */ jsx21("div", { className: "arc-create-social-preview", children: socials }),
    children
  ] });
}

// react/components/ui/TokenCardLayout.tsx
import { jsx as jsx22, jsxs as jsxs18 } from "react/jsx-runtime";
function TokenCardLayout({ variant = "compact", cover, avatar, identity, change, networks, facts, metrics, progress, footer, children }) {
  return /* @__PURE__ */ jsxs18("article", { className: `discover-token-surface discover-token-card${variant === "image" ? " discover-token-card--image" : ""}`, "data-motion-token": true, children: [
    /* @__PURE__ */ jsx22("span", { className: "token-card-shine", "aria-hidden": "true" }),
    variant === "image" && /* @__PURE__ */ jsx22("div", { className: "token-card-cover", children: cover }),
    /* @__PURE__ */ jsxs18("div", { className: "token-card-header", children: [
      variant === "compact" && avatar,
      /* @__PURE__ */ jsx22("div", { className: "token-card-identity", style: { minWidth: 0 }, children: identity }),
      /* @__PURE__ */ jsx22("span", { className: "token-card-change", style: { minWidth: "max-content", justifySelf: "end", flexShrink: 0, whiteSpace: "nowrap" }, children: change })
    ] }),
    /* @__PURE__ */ jsx22("div", { className: "token-card-networks", children: networks }),
    facts,
    /* @__PURE__ */ jsx22("div", { className: "token-card-metrics", children: metrics }),
    progress && /* @__PURE__ */ jsx22("div", { className: "token-card-progress", children: progress }),
    /* @__PURE__ */ jsx22("div", { className: "discover-token-socials token-card-socials", children: footer }),
    children
  ] });
}

// react/components/ui/TransactionRecovery.tsx
import { jsx as jsx23, jsxs as jsxs19 } from "react/jsx-runtime";
function TransactionRecovery({ busy = false, onRefresh, transactionHref, refreshLabel = "Refresh transaction status", viewLabel = "View transaction" }) {
  return /* @__PURE__ */ jsxs19("div", { className: "transaction-recovery", children: [
    /* @__PURE__ */ jsx23(Button, { "data-analytics": "transaction.recover", size: "sm", variant: "ghost", loading: busy, disabled: busy, onClick: onRefresh, children: refreshLabel }),
    transactionHref && /* @__PURE__ */ jsx23("a", { href: transactionHref, target: "_blank", rel: "noopener noreferrer", children: viewLabel })
  ] });
}

// react/components/ui/LaunchWizard.tsx
import { useEffect as useEffect4, useId as useId2, useRef as useRef7, useState as useState6 } from "react";
import { Fragment as Fragment4, jsx as jsx24, jsxs as jsxs20 } from "react/jsx-runtime";
function LaunchWizard({
  title,
  description,
  steps,
  preview,
  nextLabel,
  nextDisabled = false,
  backLabel,
  submitLabel,
  submitLoading = false,
  disabled = false,
  submitDisabled = false,
  secondaryAction,
  onSubmit,
  onContinue,
  step: controlledStep,
  onStepChange,
  ...form
}) {
  const [localStep, setLocalStep] = useState6(0);
  const step = controlledStep ?? localStep;
  const setStep = (next) => {
    setLocalStep(next);
    onStepChange?.(next);
  };
  const id = useId2();
  const heading = useRef7(null);
  const previousStep = useRef7(step);
  useEffect4(() => {
    if (previousStep.current !== step) heading.current?.focus();
    previousStep.current = step;
  }, [step]);
  return /* @__PURE__ */ jsxs20("section", { className: "launch-wizard", "aria-labelledby": `${id}-title`, children: [
    /* @__PURE__ */ jsxs20("header", { className: "launch-wizard__header", children: [
      /* @__PURE__ */ jsx24("h1", { id: `${id}-title`, children: title }),
      description && /* @__PURE__ */ jsx24("p", { children: description })
    ] }),
    /* @__PURE__ */ jsxs20("div", { className: "launch-wizard__workspace", children: [
      /* @__PURE__ */ jsxs20("form", { className: "launch-wizard__form", ...form, onSubmit: (event) => {
        event.preventDefault();
        if (disabled || (step === 0 ? nextDisabled : submitDisabled) || !event.currentTarget.reportValidity()) return;
        if (step === 0) {
          if (!onContinue || onContinue()) setStep(1);
        } else onSubmit?.(event);
      }, children: [
        /* @__PURE__ */ jsx24("ol", { className: "launch-wizard__steps", "aria-label": title, children: steps.map((item, i) => /* @__PURE__ */ jsx24("li", { "aria-current": step === i ? "step" : void 0, "data-done": i < step || void 0, children: /* @__PURE__ */ jsxs20("button", { type: "button", disabled: disabled || i > step, onClick: () => setStep(i), children: [
          /* @__PURE__ */ jsx24("span", { className: "launch-wizard__step-number", "aria-hidden": "true", children: i < step ? "\u2713" : i + 1 }),
          item.label
        ] }) }, item.label)) }),
        /* @__PURE__ */ jsxs20("div", { className: "launch-wizard__section-heading", children: [
          /* @__PURE__ */ jsx24("h2", { ref: heading, tabIndex: -1, children: steps[step].title }),
          steps[step].description && /* @__PURE__ */ jsx24("p", { children: steps[step].description })
        ] }),
        steps.map((item, i) => /* @__PURE__ */ jsx24(
          "fieldset",
          {
            className: "launch-wizard__fields",
            disabled: disabled || step !== i,
            hidden: step !== i,
            "aria-label": item.label,
            children: item.content
          },
          item.label
        )),
        /* @__PURE__ */ jsxs20("div", { className: "launch-wizard__actions", children: [
          step === 1 && /* @__PURE__ */ jsx24(Button, { variant: "ghost", disabled, onClick: () => setStep(0), children: backLabel }),
          /* @__PURE__ */ jsx24(Button, { type: "submit", variant: "primary", size: "lg", loading: step === 1 && submitLoading, disabled: disabled || (step === 0 ? nextDisabled : submitDisabled), children: step === 0 ? /* @__PURE__ */ jsxs20(Fragment4, { children: [
            nextLabel,
            !nextDisabled && /* @__PURE__ */ jsx24("span", { "aria-hidden": "true", children: " \u2192" })
          ] }) : submitLabel })
        ] }),
        secondaryAction && /* @__PURE__ */ jsx24("div", { className: "launch-wizard__secondary", children: secondaryAction })
      ] }),
      /* @__PURE__ */ jsx24("div", { className: "launch-wizard__preview", children: typeof preview === "function" ? preview(step) : preview })
    ] })
  ] });
}

// react/components/ui/LocationSharingField.tsx
import { useId as useId3 } from "react";
import { jsx as jsx25, jsxs as jsxs21 } from "react/jsx-runtime";
function LocationSharingField({ label, description, status, privacy, checked, onChange, disabled = false }) {
  const id = useId3();
  return /* @__PURE__ */ jsxs21("div", { className: "location-sharing-field", "data-checked": checked || void 0, "data-disabled": disabled || void 0, children: [
    /* @__PURE__ */ jsxs21("label", { className: "location-sharing-field__control", htmlFor: id, children: [
      /* @__PURE__ */ jsx25("span", { className: "location-sharing-field__icon", "aria-hidden": "true", children: /* @__PURE__ */ jsxs21("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", children: [
        /* @__PURE__ */ jsx25("circle", { cx: "12", cy: "12", r: "9" }),
        /* @__PURE__ */ jsx25("ellipse", { cx: "12", cy: "12", rx: "4", ry: "9" }),
        /* @__PURE__ */ jsx25("path", { d: "M3 12h18M5 6.5c4 2 10 2 14 0M5 17.5c4-2 10-2 14 0" })
      ] }) }),
      /* @__PURE__ */ jsxs21("span", { className: "location-sharing-field__copy", children: [
        /* @__PURE__ */ jsx25("strong", { children: label }),
        /* @__PURE__ */ jsx25("span", { id: `${id}-description`, children: description })
      ] }),
      /* @__PURE__ */ jsxs21("span", { className: "location-sharing-field__switch", children: [
        /* @__PURE__ */ jsx25(
          Checkbox,
          {
            id,
            role: "switch",
            "aria-label": label,
            "aria-describedby": `${id}-description ${id}-status ${id}-privacy`,
            checked,
            disabled,
            onChange: (event) => {
              if (!disabled) onChange?.(event.target.checked);
            }
          }
        ),
        /* @__PURE__ */ jsx25("span", { className: "location-sharing-field__track", "aria-hidden": "true" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs21("div", { className: "location-sharing-field__footer", children: [
      /* @__PURE__ */ jsxs21("span", { className: "location-sharing-field__status", id: `${id}-status`, role: "status", children: [
        /* @__PURE__ */ jsx25("span", { "aria-hidden": "true" }),
        status
      ] }),
      /* @__PURE__ */ jsxs21("span", { className: "location-sharing-field__privacy", id: `${id}-privacy`, children: [
        /* @__PURE__ */ jsxs21("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.3", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsx25("rect", { x: "3.5", y: "7", width: "9", height: "6.5", rx: "1.5" }),
          /* @__PURE__ */ jsx25("path", { d: "M5.5 7V5a2.5 2.5 0 0 1 5 0v2" })
        ] }),
        privacy
      ] })
    ] })
  ] });
}

// react/components/ui/PluginChoiceCard.tsx
import { useId as useId4 } from "react";
import { jsx as jsx26, jsxs as jsxs22 } from "react/jsx-runtime";
function PluginChoiceCard({ title, description, icon, checked, onChange, children, disabled = false }) {
  const id = useId4();
  return /* @__PURE__ */ jsxs22("div", { className: "plugin-choice-card", "data-selected": checked || void 0, children: [
    /* @__PURE__ */ jsxs22("label", { className: "plugin-choice-card__choice", htmlFor: id, children: [
      icon && /* @__PURE__ */ jsx26("span", { className: "plugin-choice-card__icon", children: icon }),
      /* @__PURE__ */ jsxs22("span", { className: "plugin-choice-card__copy", children: [
        /* @__PURE__ */ jsx26("strong", { children: title }),
        /* @__PURE__ */ jsx26("span", { id: `${id}-description`, children: description })
      ] }),
      /* @__PURE__ */ jsx26(
        Checkbox,
        {
          id,
          "aria-label": title,
          "aria-describedby": `${id}-description`,
          checked,
          disabled,
          onChange: (event) => onChange(event.target.checked)
        }
      )
    ] }),
    checked && children && /* @__PURE__ */ jsx26("div", { className: "plugin-choice-card__settings", children })
  ] });
}

// react/components/ui/CollectibleCard.tsx
import { useId as useId5, useRef as useRef8, useState as useState7 } from "react";
import { jsx as jsx27, jsxs as jsxs23 } from "react/jsx-runtime";
function tiltCollectibleCard(card, event) {
  if (!card || event.pointerType !== "mouse" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const box = card.getBoundingClientRect();
  if (!box.width || !box.height) return;
  const x = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
  const y = Math.max(0, Math.min(1, (event.clientY - box.top) / box.height));
  card.style.setProperty("--collectible-rx", `${(0.5 - y) * 14}deg`);
  card.style.setProperty("--collectible-ry", `${(x - 0.5) * 14}deg`);
}
function CollectibleCard({ title, collection, eyebrow, grade, artwork, details, flipped: controlledFlipped, flipLabel }) {
  const id = useId5();
  const [localFlipped, setLocalFlipped] = useState7(false);
  const flipped = controlledFlipped ?? (flipLabel ? localFlipped : void 0);
  const card = useRef8(null);
  const reset = () => card.current?.removeAttribute("style");
  const header = (side) => /* @__PURE__ */ jsxs23("header", { className: "collectible-card__header", children: [
    /* @__PURE__ */ jsxs23("div", { children: [
      eyebrow && /* @__PURE__ */ jsx27("span", { className: "collectible-card__eyebrow", children: eyebrow }),
      /* @__PURE__ */ jsx27("h3", { id: `${id}-${side}-title`, children: title }),
      collection && /* @__PURE__ */ jsx27("p", { children: collection })
    ] }),
    grade && /* @__PURE__ */ jsxs23("div", { className: "collectible-card__grade", children: [
      /* @__PURE__ */ jsx27("span", { children: grade.label }),
      /* @__PURE__ */ jsx27("strong", { children: grade.value })
    ] })
  ] });
  const metadata = details && /* @__PURE__ */ jsx27("dl", { className: "collectible-card__details", tabIndex: flipped ? 0 : void 0, children: details.map((detail) => /* @__PURE__ */ jsxs23("div", { children: [
    /* @__PURE__ */ jsx27("dt", { children: detail.label }),
    /* @__PURE__ */ jsx27("dd", { children: detail.value })
  ] }, detail.label)) });
  return /* @__PURE__ */ jsxs23(
    "figure",
    {
      className: "collectible-card",
      ref: card,
      "data-flipped": flipped ?? false,
      "aria-labelledby": `${id}-${flipped ? "back" : "front"}-title`,
      onPointerMove: (event) => tiltCollectibleCard(card.current, event),
      onPointerLeave: reset,
      onPointerCancel: reset,
      children: [
        /* @__PURE__ */ jsxs23("div", { className: "collectible-card__rotator", children: [
          /* @__PURE__ */ jsxs23("div", { className: "collectible-card__face", "aria-hidden": flipped === true, children: [
            header("front"),
            /* @__PURE__ */ jsxs23("div", { className: "collectible-card__artwork", children: [
              artwork,
              /* @__PURE__ */ jsx27("span", { className: "collectible-card__sheen", "aria-hidden": "true" })
            ] }),
            flipped === void 0 && metadata
          ] }),
          flipped !== void 0 && /* @__PURE__ */ jsxs23("div", { className: "collectible-card__face collectible-card__back", "aria-hidden": !flipped, children: [
            header("back"),
            metadata
          ] })
        ] }),
        flipLabel && controlledFlipped === void 0 && /* @__PURE__ */ jsx27(
          "button",
          {
            className: "collectible-card__toggle",
            type: "button",
            "aria-label": flipLabel,
            "aria-expanded": localFlipped,
            onClick: () => setLocalFlipped((value) => !value)
          }
        )
      ]
    }
  );
}

// react/components/ui/CollectibleFan.tsx
import { useLayoutEffect as useLayoutEffect4, useRef as useRef9, useState as useState8 } from "react";
import { jsx as jsx28, jsxs as jsxs24 } from "react/jsx-runtime";
function CollectibleFan({ items, label, previousLabel, nextLabel, visibleCount = 5 }) {
  const [selection, setSelection] = useState8(0);
  const [flippedId, setFlippedId] = useState8(null);
  const root = useRef9(null);
  const [cardHeight, setCardHeight] = useState8(0);
  const active = items.length ? selection % items.length : 0;
  const move = (direction) => {
    setFlippedId(null);
    setSelection((active + direction + items.length) % items.length);
  };
  const count = Math.min(Math.max(1, Math.min(8, Math.floor(visibleCount))), items.length);
  useLayoutEffect4(() => {
    const cards = root.current?.querySelectorAll(".collectible-fan__card");
    const measure = () => setCardHeight(Math.max(0, ...Array.from(cards ?? [], (card) => card.offsetHeight)));
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    cards?.forEach((card) => observer?.observe(card));
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [items, active]);
  return /* @__PURE__ */ jsxs24(
    "div",
    {
      className: "collectible-fan",
      role: "region",
      "aria-label": label,
      tabIndex: 0,
      ref: root,
      style: { "--fan-visible-count": Math.max(1, count) },
      onKeyDown: (event) => {
        if (items.length < 2 || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();
        root.current?.focus();
        move(event.key === "ArrowLeft" ? -1 : 1);
      },
      children: [
        /* @__PURE__ */ jsx28("ul", { className: "collectible-fan__stage", style: cardHeight ? { height: cardHeight + 160 } : void 0, children: Array.from({ length: count }, (_, slot) => {
          const offset = slot - (count - 1) / 2;
          const index = (active + slot - Math.floor(count / 2) + items.length) % items.length;
          const item = items[index];
          const flipped = flippedId === item.id;
          return /* @__PURE__ */ jsxs24(
            "li",
            {
              className: "collectible-fan__item",
              "data-selected": index === active,
              onPointerMove: (event) => tiltCollectibleCard(event.currentTarget.querySelector(".collectible-card"), event),
              onPointerLeave: (event) => event.currentTarget.querySelector(".collectible-card")?.removeAttribute("style"),
              onPointerCancel: (event) => event.currentTarget.querySelector(".collectible-card")?.removeAttribute("style"),
              style: { "--fan-offset": offset, "--fan-layer": count - Math.abs(slot - Math.floor(count / 2)) },
              children: [
                /* @__PURE__ */ jsx28("div", { className: "collectible-fan__card", children: typeof item.content === "function" ? item.content(flipped) : item.content }),
                /* @__PURE__ */ jsx28(
                  "button",
                  {
                    className: "collectible-fan__select",
                    type: "button",
                    "aria-label": item.label,
                    "aria-pressed": index === active,
                    "aria-expanded": typeof item.content === "function" ? flipped : void 0,
                    onClick: () => {
                      setSelection(index);
                      setFlippedId(typeof item.content === "function" && !flipped ? item.id : null);
                    }
                  }
                )
              ]
            },
            item.id
          );
        }) }),
        /* @__PURE__ */ jsxs24("div", { className: "collectible-fan__controls", children: [
          /* @__PURE__ */ jsx28(Button, { variant: "ghost", "aria-label": previousLabel, disabled: items.length < 2, onClick: () => move(-1), children: /* @__PURE__ */ jsx28("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", "aria-hidden": "true", children: /* @__PURE__ */ jsx28("path", { d: "M19 12H5m7-7-7 7 7 7" }) }) }),
          /* @__PURE__ */ jsxs24("span", { "aria-live": "polite", "aria-atomic": "true", children: [
            items[active]?.label,
            /* @__PURE__ */ jsxs24("small", { children: [
              items.length ? active + 1 : 0,
              " / ",
              items.length
            ] })
          ] }),
          /* @__PURE__ */ jsx28(Button, { variant: "ghost", "aria-label": nextLabel, disabled: items.length < 2, onClick: () => move(1), children: /* @__PURE__ */ jsx28("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", "aria-hidden": "true", children: /* @__PURE__ */ jsx28("path", { d: "M5 12h14m-7-7 7 7-7 7" }) }) })
        ] })
      ]
    }
  );
}

// react/components/ui/CollectibleCarousel.tsx
import { useRef as useRef10, useState as useState9 } from "react";
import { jsx as jsx29, jsxs as jsxs25 } from "react/jsx-runtime";
function CollectibleCarousel({ items, label, previousLabel, nextLabel }) {
  const track = useRef10(null);
  const [selection, setSelection] = useState9(0);
  const active = Math.min(selection, Math.max(0, items.length - 1));
  const move = (direction) => {
    const node = track.current;
    const card = node?.children[Math.min(items.length - 1, Math.max(0, active + direction))];
    if (!node || !card) return;
    node.scrollTo({
      left: card.offsetLeft - (node.clientWidth - card.offsetWidth) / 2,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
    });
  };
  return /* @__PURE__ */ jsxs25("section", { className: "collectible-carousel", "aria-label": label, children: [
    /* @__PURE__ */ jsx29(
      "ul",
      {
        className: "collectible-carousel__track",
        ref: track,
        tabIndex: 0,
        "aria-label": label,
        onKeyDown: (event) => {
          if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        },
        onScroll: () => {
          const node = track.current;
          if (!node?.children.length) return;
          const center = node.scrollLeft + node.clientWidth / 2;
          const distances = Array.from(node.children, (card) => Math.abs(card.offsetLeft + card.offsetWidth / 2 - center));
          setSelection(distances.indexOf(Math.min(...distances)));
        },
        children: items.map((item, index) => /* @__PURE__ */ jsx29("li", { className: "collectible-carousel__item", "data-selected": index === active, children: item.content }, item.id))
      }
    ),
    /* @__PURE__ */ jsxs25("div", { className: "collectible-carousel__controls", children: [
      /* @__PURE__ */ jsx29(Button, { variant: "ghost", "aria-label": previousLabel, disabled: !items.length || active === 0, onClick: () => move(-1), children: /* @__PURE__ */ jsx29(SingleSparkIcon, { name: "left", size: 20 }) }),
      /* @__PURE__ */ jsxs25("span", { "aria-live": "polite", "aria-atomic": "true", children: [
        items[active]?.label,
        /* @__PURE__ */ jsxs25("small", { children: [
          items.length ? active + 1 : 0,
          " / ",
          items.length
        ] })
      ] }),
      /* @__PURE__ */ jsx29(Button, { variant: "ghost", "aria-label": nextLabel, disabled: !items.length || active === items.length - 1, onClick: () => move(1), children: /* @__PURE__ */ jsx29(SingleSparkIcon, { name: "right", size: 20 }) })
    ] })
  ] });
}

// react/components/ui/CollectibleMarquee.tsx
import { useLayoutEffect as useLayoutEffect5, useRef as useRef11, useState as useState10, version } from "react";
import { jsx as jsx30, jsxs as jsxs26 } from "react/jsx-runtime";
function CollectibleMarquee({ items, label, pauseLabel, resumeLabel }) {
  const [paused, setPaused] = useState10(false);
  const viewport = useRef11(null);
  const [cycles, setCycles] = useState10(1);
  useLayoutEffect5(() => {
    const node = viewport.current;
    const measure = () => {
      const group = node?.querySelector(".collectible-marquee__group");
      const first = group?.firstElementChild;
      if (!node || !group || !first || !items.length) {
        setCycles(1);
        return;
      }
      const lap = (first.getBoundingClientRect().width + parseFloat(getComputedStyle(group).gap)) * items.length;
      if (lap > 0) setCycles(Math.max(1, Math.ceil(node.clientWidth / lap)));
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    if (node) observer?.observe(node);
    return () => observer?.disconnect();
  }, [items.length]);
  return /* @__PURE__ */ jsxs26(
    "section",
    {
      className: "collectible-marquee",
      "aria-label": label,
      "data-paused": paused,
      style: { "--marquee-count": Math.max(1, items.length * cycles) },
      children: [
        /* @__PURE__ */ jsx30("div", { className: "collectible-marquee__viewport", ref: viewport, tabIndex: 0, role: "group", "aria-label": label, children: /* @__PURE__ */ jsx30("div", { className: "collectible-marquee__track", children: [false, true].map((copy) => /* @__PURE__ */ jsx30(
          "ul",
          {
            className: "collectible-marquee__group",
            "aria-hidden": copy || void 0,
            ...copy ? { inert: Number.parseInt(version, 10) >= 19 ? true : "" } : {},
            children: Array.from({ length: cycles }, (_, cycle) => items.map((item) => /* @__PURE__ */ jsx30(
              "li",
              {
                className: "collectible-marquee__item",
                "aria-hidden": cycle > 0 || void 0,
                ...cycle > 0 ? { inert: Number.parseInt(version, 10) >= 19 ? true : "" } : {},
                children: item.content
              },
              `${cycle}:${item.id}`
            )))
          },
          String(copy)
        )) }) }),
        items.length > 0 && /* @__PURE__ */ jsx30(
          Button,
          {
            className: "collectible-marquee__pause",
            variant: "ghost",
            "aria-pressed": paused,
            onClick: () => setPaused((value) => !value),
            children: paused ? resumeLabel : pauseLabel
          }
        )
      ]
    }
  );
}

// react/components/ui/CollectibleReel.tsx
import { useLayoutEffect as useLayoutEffect6, useRef as useRef12, useState as useState11 } from "react";
import { jsx as jsx31, jsxs as jsxs27 } from "react/jsx-runtime";
function CollectibleReel({ items, spinning, resultId, label, waitingLabel }) {
  const track = useRef12(null);
  const position = useRef12(0);
  const [settled, setSettled] = useState11(false);
  const result = items.findIndex((item) => item.id === resultId);
  useLayoutEffect6(() => {
    const node = track.current, first = node?.firstElementChild;
    setSettled(false);
    if (!node || !first || !items.length) return;
    const step = first.offsetWidth + parseFloat(getComputedStyle(node).gap);
    const lap = step * items.length;
    if (!lap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.style.transform = `translateX(${-Math.max(0, result) * step}px)`;
      setSettled(result >= 0);
      return;
    }
    if (!spinning && result < 0) return;
    const start = position.current % lap;
    const end = result >= 0 ? -(2 * lap + result * step) : start - lap;
    const animation = node.animate(
      [{ transform: `translateX(${start}px)` }, { transform: `translateX(${end}px)` }],
      { duration: result >= 0 ? 1800 : 1500, iterations: result >= 0 ? 1 : Infinity, easing: result >= 0 ? "cubic-bezier(.12,.8,.18,1)" : "linear", fill: "forwards" }
    );
    animation.onfinish = () => {
      node.style.transform = `translateX(${end}px)`;
      setSettled(true);
    };
    return () => {
      const transform = getComputedStyle(node).transform;
      position.current = transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m41;
      node.style.transform = `translateX(${position.current}px)`;
      animation.cancel();
    };
  }, [spinning, resultId, items]);
  return /* @__PURE__ */ jsxs27("section", { className: "collectible-reel", "aria-label": label, "aria-busy": spinning || result >= 0 && !settled, children: [
    /* @__PURE__ */ jsx31("div", { className: "collectible-reel__window", "aria-hidden": "true", children: /* @__PURE__ */ jsx31("div", { ref: track, className: "collectible-reel__track", children: Array.from({ length: 4 }, (_, copy) => items.map((item) => /* @__PURE__ */ jsx31("div", { className: "collectible-reel__item", children: item.content }, `${copy}:${item.id}`))) }) }),
    /* @__PURE__ */ jsx31("p", { role: "status", "aria-live": "polite", children: settled && result >= 0 ? items[result].label : waitingLabel })
  ] });
}

// react/components/ui/ComingSoonOverlay.tsx
import { useId as useId6, version as version2 } from "react";
import { jsx as jsx32, jsxs as jsxs28 } from "react/jsx-runtime";
function ComingSoonOverlay({ title, description, children }) {
  const id = useId6();
  return /* @__PURE__ */ jsxs28("section", { className: "coming-soon", "aria-labelledby": `${id}-title`, "aria-describedby": `${id}-description`, children: [
    /* @__PURE__ */ jsx32("div", { className: "coming-soon__preview", ...{ inert: Number.parseInt(version2, 10) >= 19 ? true : "" }, "aria-hidden": "true", children }),
    /* @__PURE__ */ jsx32("div", { className: "coming-soon-overlay", style: { backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }, children: /* @__PURE__ */ jsxs28("div", { className: "coming-soon-dialog", children: [
      /* @__PURE__ */ jsx32("h1", { id: `${id}-title`, children: title }),
      /* @__PURE__ */ jsx32("p", { id: `${id}-description`, children: description })
    ] }) })
  ] });
}

// react/components/ui/ProcessSteps.tsx
import { Fragment as Fragment5, jsx as jsx33, jsxs as jsxs29 } from "react/jsx-runtime";
function ProcessSteps({ steps, label, statusLabels = {} }) {
  const states = { pending: "Not started", active: "In progress", complete: "Completed", error: "Stopped" };
  return /* @__PURE__ */ jsx33("ol", { className: "process-steps", "aria-label": label, "aria-busy": steps.some((step) => step.status === "active"), children: steps.map((step, index) => /* @__PURE__ */ jsxs29(
    "li",
    {
      "data-status": step.status,
      "aria-current": step.status === "active" || step.status === "error" ? "step" : void 0,
      children: [
        /* @__PURE__ */ jsx33("span", { className: "process-steps__mark", "aria-hidden": "true", children: step.status === "active" ? /* @__PURE__ */ jsx33(SingleSparkLoading, { decorative: true, size: 16 }) : step.status === "complete" ? /* @__PURE__ */ jsx33(SingleSparkIcon, { name: "check", size: 16 }) : step.status === "error" ? /* @__PURE__ */ jsx33(SingleSparkIcon, { name: "warning", size: 16 }) : index + 1 }),
        /* @__PURE__ */ jsxs29("span", { className: "process-steps__label", children: [
          step.label,
          step.description && /* @__PURE__ */ jsx33("small", { children: step.description })
        ] }),
        /* @__PURE__ */ jsxs29("small", { children: [
          statusLabels[step.status] ?? states[step.status],
          step.elapsed && /* @__PURE__ */ jsxs29(Fragment5, { children: [
            " \xB7 ",
            /* @__PURE__ */ jsx33("span", { "aria-label": "Elapsed time", children: step.elapsed })
          ] })
        ] })
      ]
    },
    step.id
  )) });
}

// react/components/ui/TransactionProgressDialog.tsx
import { jsx as jsx34, jsxs as jsxs30 } from "react/jsx-runtime";
function TransactionProgressDialog({ status, steps, elapsed, children, labels = {}, ...dialog }) {
  return /* @__PURE__ */ jsxs30(DetailDialog, { ...dialog, children: [
    /* @__PURE__ */ jsx34("p", { role: "status", "aria-live": "polite", style: { overflowWrap: "anywhere" }, children: status }),
    /* @__PURE__ */ jsx34(ProcessSteps, { steps, label: labels.steps ?? "Transaction steps", statusLabels: labels }),
    /* @__PURE__ */ jsxs30("p", { children: [
      (labels.elapsed ?? "Total elapsed") + ": ",
      /* @__PURE__ */ jsx34("span", { "aria-label": labels.elapsed ?? "Total elapsed time", children: elapsed })
    ] }),
    children
  ] });
}
export {
  AddressLink,
  BottomNavigation,
  BottomSheet,
  Button,
  Checkbox,
  CollectibleCard,
  CollectibleCarousel,
  CollectibleFan,
  CollectibleMarquee,
  CollectibleReel,
  ComingSoonOverlay,
  DataTable,
  DetailDialog,
  Dialog,
  EmptyState,
  Input,
  LaunchFormLayout,
  LaunchWizard,
  LocationSharingField,
  NavigationIndicator,
  NetworkSelector,
  Notice,
  PluginChoiceCard,
  ProcessSteps,
  RangeInput,
  RevenueAllocation,
  ScrollRail,
  SegProgressBar,
  SegmentedTabs,
  Select,
  Skeleton,
  Sparkline,
  StatTile,
  Textarea,
  TokenCardLayout,
  TokenDetailHeader,
  TokenDetailLayout,
  TokenHistoryToolbar,
  TokenLaunchPreview,
  TokenPluginPanel,
  TransactionProgressDialog,
  TransactionRecovery,
  VaultOverview,
  tiltCollectibleCard,
  useDialogInteraction
};
