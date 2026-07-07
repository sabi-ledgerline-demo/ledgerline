import type { CSSProperties } from "react";

// The ported class components built up styles as CSS text strings
// ("display:flex;color:red") and bound them via style="{{ expr }}". React's
// style prop needs an object, so every computed (non-literal) style string
// is passed through this small converter at the point it's produced.
export function cssToObj(cssText: string): CSSProperties {
  const out: Record<string, string> = {};
  cssText.split(";").forEach((decl) => {
    const idx = decl.indexOf(":");
    if (idx < 0) return;
    const prop = decl.slice(0, idx).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (!prop) return;
    out[prop] = decl.slice(idx + 1).trim();
  });
  return out as CSSProperties;
}
