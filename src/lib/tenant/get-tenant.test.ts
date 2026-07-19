import { describe, it, expect, vi, beforeEach } from "vitest";
import { DEFAULT_TENANT } from "./types";

vi.mock("server-only", () => ({}));
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, cache: <T>(fn: T) => fn };
});
vi.mock("next/cache", () => ({
  unstable_cache: <T>(fn: T) => fn,
}));

const singleMock = vi.fn();
const eqMock = vi.fn(() => ({ eq: eqMock, single: singleMock }));
const fromMock = vi.fn(() => ({ select: () => ({ eq: eqMock }) }));
const createClientMock = vi.fn().mockReturnValue({ from: fromMock });

vi.mock("@supabase/supabase-js", () => ({
  createClient: (url: string, key: string, opts: unknown) => createClientMock(url, key, opts),
}));

const row = {
  slug: "acme-pt",
  clinic_name: "Acme PT",
  logo_url: "https://example.com/logo.png",
  icon_url: null,
  color_primary: "#111111",
  color_accent: "#222222",
  color_background: "#333333",
  color_surface: "#444444",
  color_text: "#555555",
  mascot_enabled: false,
  welcome_message: "Welcome!",
  contact_email: "hi@acme.example",
};

beforeEach(() => {
  vi.clearAllMocks();
  eqMock.mockImplementation(() => ({ eq: eqMock, single: singleMock }));
});

describe("getTenant", () => {
  it("returns DEFAULT_TENANT for null key without querying Supabase", async () => {
    const { getTenant } = await import("./get-tenant");
    const result = await getTenant(null);
    expect(result).toEqual(DEFAULT_TENANT);
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("returns DEFAULT_TENANT for the literal 'default' key without querying Supabase", async () => {
    const { getTenant } = await import("./get-tenant");
    const result = await getTenant("default");
    expect(result).toEqual(DEFAULT_TENANT);
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("maps a known slug to a TenantConfig", async () => {
    singleMock.mockResolvedValueOnce({ data: row, error: null });
    const { getTenant } = await import("./get-tenant");
    const result = await getTenant("acme-pt");
    expect(result).toEqual({
      slug: "acme-pt",
      clinicName: "Acme PT",
      logoUrl: "https://example.com/logo.png",
      iconUrl: null,
      colors: {
        primary: "#111111",
        accent: "#222222",
        background: "#333333",
        surface: "#444444",
        text: "#555555",
      },
      mascotEnabled: false,
      welcomeMessage: "Welcome!",
      contactEmail: "hi@acme.example",
    });
    expect(fromMock).toHaveBeenCalledWith("tenants");
    expect(eqMock).toHaveBeenCalledWith("slug", "acme-pt");
  });

  it("resolves a domain-prefixed key against custom_domain", async () => {
    singleMock.mockResolvedValueOnce({ data: row, error: null });
    const { getTenant } = await import("./get-tenant");
    await getTenant("domain:clinic.example.com");
    expect(eqMock).toHaveBeenCalledWith("custom_domain", "clinic.example.com");
  });

  it("fails soft to DEFAULT_TENANT when the row is missing", async () => {
    singleMock.mockResolvedValueOnce({ data: null, error: { message: "no rows" } });
    const { getTenant } = await import("./get-tenant");
    const result = await getTenant("unknown-slug");
    expect(result).toEqual(DEFAULT_TENANT);
  });

  it("fails soft to DEFAULT_TENANT when the Supabase client throws", async () => {
    createClientMock.mockImplementationOnce(() => {
      throw new Error("missing env vars");
    });
    const { getTenant } = await import("./get-tenant");
    const result = await getTenant("acme-pt");
    expect(result).toEqual(DEFAULT_TENANT);
  });
});
