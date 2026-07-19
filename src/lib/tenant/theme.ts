/* ============================================================
   STEADY — tenant color theming.
   Re-themes the same CSS custom properties globals.css already
   defines on :root (--pine, --bg, --card, --ink, ...) instead of
   introducing a parallel token set. The default tenant returns
   undefined so <html> renders with no inline style at all —
   byte-identical to pre-multi-tenant output.
   ============================================================ */

import type { TenantConfig } from "./types";

export type TenantCssVars = {
  "--pine": string;
  "--pine-deep": string;
  "--pine-tint": string;
  "--amber": string;
  "--amber-tint": string;
  "--bg": string;
  "--card": string;
  "--ink": string;
  "--ink-soft": string;
  "--line": string;
};

export function tenantCssVars(tenant: TenantConfig): TenantCssVars | undefined {
  if (tenant.slug === "default") return undefined;

  const { primary, accent, background, surface, text } = tenant.colors;

  return {
    "--pine": primary,
    "--pine-deep": `color-mix(in srgb, ${primary} 77%, black 23%)`,
    "--pine-tint": `color-mix(in srgb, ${primary} 15%, white 85%)`,
    "--amber": accent,
    "--amber-tint": `color-mix(in srgb, ${accent} 15%, white 85%)`,
    "--bg": background,
    "--card": surface,
    "--ink": text,
    "--ink-soft": `color-mix(in srgb, ${text} 70%, white 30%)`,
    "--line": `color-mix(in srgb, ${primary} 20%, white 80%)`,
  };
}
