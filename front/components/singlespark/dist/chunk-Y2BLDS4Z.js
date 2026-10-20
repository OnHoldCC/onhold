'use client';
import {
  SingleSparkCheckboxInput,
  SingleSparkCopyButton,
  SingleSparkTextInput,
  SingleSparkTextarea
} from "./chunk-K6TMLM72.js";

// react/components/ui/NavigationIndicator.tsx
import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { jsx, jsxs } from "react/jsx-runtime";
var mix = (from, to, progress) => ({
  x: from.x + (to.x - from.x) * progress,
  y: from.y + (to.y - from.y) * progress
});
var ease = (progress) => 1 - (1 - Math.min(1, Math.max(0, progress))) ** 3;
var pose = (from, to, elapsed) => {
  const settling = Math.min(1, Math.max(0, (elapsed - 400) / 220));
  return {
    head: mix(from.head, to, ease(elapsed / 240)),
    tail: mix(from.tail, to, ease((elapsed - 120) / 300)),
    wobble: elapsed === 0 ? from.wobble : Math.sin(settling * Math.PI * 4) * (1 - settling) * 0.12
  };
};
function NavigationIndicator({ targetRef, clipSelector = "nav", className = "", zIndex = 50 }) {
  const indicatorRef = useRef(null);
  const headRef = useRef(null);
  const tailRef = useRef(null);
  const bridgeRef = useRef(null);
  const previousTarget = useRef(null);
  const destination = useRef(null);
  const surface = useRef(null);
  const origin = useRef({ x: 0, y: 0 });
  const animations = useRef([]);
  const motion = useRef(null);
  const cancel = () => {
    for (const animation of animations.current) {
      animation.onfinish = null;
      animation.cancel();
    }
    animations.current = [];
    motion.current = null;
  };
  const bounds = (...points) => {
    const indicator = indicatorRef.current;
    if (!indicator) return;
    const left = Math.min(...points.map((point) => point.x)) - 34;
    const top = Math.min(...points.map((point) => point.y)) - 30;
    origin.current = { x: left, y: top };
    indicator.style.transform = `translate3d(${left}px, ${top}px, 0px)`;
    indicator.style.width = `${Math.max(...points.map((point) => point.x)) - left + 34}px`;
    indicator.style.height = `${Math.max(...points.map((point) => point.y)) - top + 30}px`;
  };
  const transforms = ({ head, tail, wobble }) => {
    const hx = head.x - origin.current.x;
    const hy = head.y - origin.current.y;
    const tx = tail.x - origin.current.x;
    const ty = tail.y - origin.current.y;
    const distance = Math.hypot(hx - tx, hy - ty);
    return [
      `translate3d(${hx - 22}px, ${hy - 17}px, 0px) scale(${1 + wobble}, ${1 - wobble})`,
      `translate3d(${tx - 8}px, ${ty - 8}px, 0px)`,
      `translate3d(${tx}px, ${ty - 19}px, 0px) rotate(${Math.atan2(hy - ty, hx - tx)}rad) scaleX(${distance < 20 ? 0 : distance / 100})`
    ];
  };
  const draw = (next) => {
    surface.current = next;
    const values = transforms(next);
    [headRef.current, tailRef.current, bridgeRef.current].forEach((element, index) => {
      if (element) element.style.transform = values[index];
    });
  };
  const snap = () => {
    cancel();
    if (destination.current) {
      bounds(destination.current);
      draw({ head: destination.current, tail: destination.current, wobble: 0 });
    }
  };
  useEffect(() => {
    const preference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    preference?.addEventListener("change", snap);
    return () => {
      preference?.removeEventListener("change", snap);
      cancel();
    };
  }, []);
  useLayoutEffect(() => {
    const measure = () => {
      const target = targetRef.current;
      const icon = target?.getBoundingClientRect();
      const clip = target?.closest(clipSelector)?.getBoundingClientRect();
      const indicator = indicatorRef.current;
      if (!indicator) return;
      const visible = !!icon?.width && !!icon.height && (!clip || icon.top >= clip.top && icon.bottom <= clip.bottom && icon.left >= clip.left && icon.right <= clip.right);
      if (icon) {
        const next = { x: Math.round((icon.left + icon.width / 2) * 100) / 100, y: Math.round((icon.top + icon.height / 2) * 100) / 100 };
        if (next.x !== destination.current?.x || next.y !== destination.current?.y) {
          const travel = previousTarget.current !== target && previousTarget.current !== null;
          const from = motion.current ? pose(motion.current.from, motion.current.to, Number(animations.current[0]?.currentTime ?? 0)) : surface.current;
          destination.current = next;
          cancel();
          if (travel && from && visible && headRef.current?.animate && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
            bounds(from.head, from.tail, next);
            draw(from);
            const frames = Array.from({ length: 63 }, (_, index) => transforms(pose(from, next, index * 10)));
            motion.current = { from, to: next };
            animations.current = [headRef.current, tailRef.current, bridgeRef.current].map((element, index) => element.animate(frames.map((values) => ({ transform: values[index] })), { duration: 620, fill: "forwards" }));
            animations.current[0].onfinish = snap;
          } else {
            bounds(next);
            draw({ head: next, tail: next, wobble: 0 });
          }
        }
      }
      if (!visible) snap();
      indicator.style.visibility = visible ? "visible" : "hidden";
      previousTarget.current = target;
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    const nav = targetRef.current?.closest("nav");
    if (nav) observer?.observe(nav);
    if (targetRef.current) observer?.observe(targetRef.current);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  });
  return typeof document === "undefined" ? null : createPortal(/* @__PURE__ */ jsx(
    "span",
    {
      ref: indicatorRef,
      className: `app-navigation-indicator ${className}`.trim(),
      "aria-hidden": "true",
      style: { zIndex },
      children: /* @__PURE__ */ jsxs("span", { className: "app-navigation-indicator__liquid", children: [
        /* @__PURE__ */ jsx("span", { ref: bridgeRef, className: "app-navigation-indicator__neck", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 100 38", width: "100", height: "38", focusable: "false", children: /* @__PURE__ */ jsx("path", { d: "M 0 26 C 30 23 50 23 93 38 L 93 0 C 50 15 30 15 0 12 Z" }) }) }),
        /* @__PURE__ */ jsx("span", { ref: tailRef, className: "app-navigation-indicator__tail" }),
        /* @__PURE__ */ jsx("span", { ref: headRef, className: "app-navigation-indicator__head" })
      ] })
    }
  ), document.body);
}

// react/components/ui/AddressLink.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function AddressLink({ address, href, label = "Copy address", onError }) {
  const short = address.length > 12 ? `${address.slice(0, 6)}\u2026${address.slice(-4)}` : address;
  return /* @__PURE__ */ jsxs2("span", { className: "address-link", children: [
    /* @__PURE__ */ jsx2(SingleSparkCopyButton, { value: address, label, onError, className: "contract-copy", children: /* @__PURE__ */ jsx2("code", { title: address, children: short }) }, address),
    href && /* @__PURE__ */ jsx2("a", { className: "address-link__explorer", href, title: address, "aria-label": `View address ${address}`, target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsx2("i", { className: "ph ph-arrow-up-right", "aria-hidden": "true" }) })
  ] });
}

// react/components/ui/Input.tsx
import { forwardRef } from "react";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var Input = forwardRef(function Input2({ className = "", bare = false, ...props }, ref) {
  return /* @__PURE__ */ jsx3(SingleSparkTextInput, { ref, placeholder: void 0, className: `app-input ${bare ? "app-input--bare" : ""} ${className}`.trim(), ...props });
});
var Textarea = forwardRef(function Textarea2({ className = "", ...props }, ref) {
  return /* @__PURE__ */ jsx3(SingleSparkTextarea, { ref, "aria-label": void 0, placeholder: void 0, rows: 2, className: `app-input app-textarea ${className}`.trim(), ...props });
});
var Checkbox = forwardRef(function Checkbox2({ className = "", ...props }, ref) {
  return /* @__PURE__ */ jsxs3("span", { className: "app-checkbox", children: [
    /* @__PURE__ */ jsx3(SingleSparkCheckboxInput, { ref, className, ...props }),
    /* @__PURE__ */ jsx3("i", { className: "ph ph-check", "aria-hidden": "true" })
  ] });
});
var RangeInput = forwardRef(function RangeInput2({ className = "", ...props }, ref) {
  return /* @__PURE__ */ jsx3("input", { ref, type: "range", className: `app-range ${className}`.trim(), ...props });
});

export {
  NavigationIndicator,
  AddressLink,
  Input,
  Textarea,
  Checkbox,
  RangeInput
};
