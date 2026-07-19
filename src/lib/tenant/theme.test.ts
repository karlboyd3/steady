import { describe, it, expect } from "vitest";
import { tenantCssVars } from "./theme";
import { DEFAULT_TENANT } from "./types";

describe("tenantCssVars", () => {
  it("returns undefined for the default tenant", () => {
    expect(tenantCssVars(DEFAULT_TENANT)).toBeUndefined();
  });

  it("maps a non-default tenant's colors onto the CSS custom properties", () => {
    const tenant = {
      ...DEFAULT_TENANT,
      slug: "acme-pt",
      colors: {
        primary: "#111111",
        accent: "#222222",
        background: "#333333",
        surface: "#444444",
        text: "#555555",
      },
    };
    const vars = tenantCssVars(tenant);
    expect(vars).toEqual({
      "--pine": "#111111",
      "--pine-deep": "color-mix(in srgb, #111111 77%, black 23%)",
      "--pine-tint": "color-mix(in srgb, #111111 15%, white 85%)",
      "--amber": "#222222",
      "--amber-tint": "color-mix(in srgb, #222222 15%, white 85%)",
      "--bg": "#333333",
      "--card": "#444444",
      "--ink": "#555555",
      "--ink-soft": "color-mix(in srgb, #555555 70%, white 30%)",
      "--line": "color-mix(in srgb, #111111 20%, white 80%)",
    });
  });

  it("never touches --danger, --ok, --rest, or --rest-tint", () => {
    const tenant = { ...DEFAULT_TENANT, slug: "acme-pt" };
    const vars = tenantCssVars(tenant);
    expect(vars).not.toHaveProperty("--danger");
    expect(vars).not.toHaveProperty("--ok");
    expect(vars).not.toHaveProperty("--rest");
    expect(vars).not.toHaveProperty("--rest-tint");
  });
});
