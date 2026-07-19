import { describe, it, expect, vi, beforeEach } from "vitest";
import { DEFAULT_TENANT } from "@/lib/tenant/types";

const getTenantMock = vi.fn();
vi.mock("@/lib/tenant/get-tenant", () => ({
  getTenant: (key: string | null) => getTenantMock(key),
}));

const headersMock = vi.fn();
vi.mock("next/headers", () => ({
  headers: () => headersMock(),
}));

import manifest from "./manifest";

beforeEach(() => {
  vi.clearAllMocks();
  headersMock.mockReturnValue(new Headers());
});

describe("manifest", () => {
  it("returns the byte-identical default manifest for the default tenant", async () => {
    getTenantMock.mockResolvedValue(DEFAULT_TENANT);
    const result = await manifest();
    expect(result.name).toBe("Steady — Knee Strength & Mobility");
    expect(result.id).toBe("/");
    expect(result.start_url).toBe("/");
    expect(result.scope).toBe("/");
    expect(result.display).toBe("standalone");
    expect(result.background_color).toBe("#EFF4F1");
    expect(result.theme_color).toBe("#245446");
    expect(result.icons).toHaveLength(4);
    expect(result.screenshots).toHaveLength(3);
  });

  it("overrides name/colors/icons for a non-default tenant and omits screenshots", async () => {
    const tenant = {
      ...DEFAULT_TENANT,
      slug: "acme-pt",
      clinicName: "Acme PT",
      iconUrl: "https://example.com/icon.png",
      colors: { ...DEFAULT_TENANT.colors, primary: "#111111", background: "#222222" },
    };
    getTenantMock.mockResolvedValue(tenant);
    const result = await manifest();
    expect(result.name).toBe("Acme PT");
    expect(result.short_name).toBe("Acme PT");
    expect(result.background_color).toBe("#222222");
    expect(result.theme_color).toBe("#111111");
    expect(result.icons).toEqual([
      {
        src: "https://example.com/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ]);
    expect(result.screenshots).toBeUndefined();
    // TWA-critical fields never drift across tenants.
    expect(result.id).toBe("/");
    expect(result.start_url).toBe("/");
    expect(result.scope).toBe("/");
    expect(result.display).toBe("standalone");
  });

  it("falls back to the default icon set when the tenant has no custom icon", async () => {
    const tenant = { ...DEFAULT_TENANT, slug: "acme-pt", iconUrl: null };
    getTenantMock.mockResolvedValue(tenant);
    const result = await manifest();
    expect(result.icons).toHaveLength(4);
  });
});
