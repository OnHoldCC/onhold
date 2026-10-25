'use client';

// react/components/theme/SingleSparkTheme.tsx
import { jsx } from "react/jsx-runtime";
function SingleSparkTheme({
  mode = "dark",
  tokens = {},
  style,
  className = "",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-ss-theme": mode,
      className: `singlespark-theme ${className}`,
      style: {
        ...Object.fromEntries(
          Object.entries(tokens).map(([key, value]) => [
            `--ss-${key}`,
            value
          ])
        ),
        ...style
      },
      ...props
    }
  );
}

export {
  SingleSparkTheme
};
