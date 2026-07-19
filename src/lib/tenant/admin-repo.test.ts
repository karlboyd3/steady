import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, cache: <T>(fn: T) => fn };
});
vi.mock("next/cache", () => ({
  unstable_cache: <T>(fn: T) => fn,
}));

let queryResult: { data?: unknown; error?: unknown } = { data: null, error: null };

interface Chain extends PromiseLike<{ data?: unknown; error?: unknown }> {
  select: (...args: unknown[]) => Chain;
  order: (...args: unknown[]) => Chain;
  eq: (...args: unknown[]) => Chain;
  single: (...args: unknown[]) => Chain;
  insert: (...args: unknown[]) => Chain;
  update: (...args: unknown[]) => Chain;
}

function makeChain(): Chain {
  const chain = {} as Chain;
  chain.select = vi.fn(() => chain);
  chain.order = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.single = vi.fn(() => chain);
  chain.insert = vi.fn(() => chain);
  chain.update = vi.fn(() => chain);
  chain.then = ((onfulfilled: (v: unknown) => unknown, onrejected?: (e: unknown) => unknown) =>
    Promise.resolve(queryResult).then(onfulfilled, onrejected)) as Chain["then"];
  return chain;
}

const fromMock = vi.fn(() => makeChain());
const createClientMock = vi.fn().mockReturnValue({ from: fromMock });

vi.mock("@supabase/supabase-js", () => ({
  createClient: (url: string, key: string, opts: unknown) => createClientMock(url, key, opts),
}));

import {
  listTenants,
  getTenantForAdmin,
  createTenant,
  updateTenant,
} from "./admin-repo";
import type { TenantFormValues } from "./admin-schema";

const FORM_VALUES: TenantFormValues = {
  slug: "acme-pt",
  clinicName: "Acme PT",
  logoUrl: null,
  iconUrl: null,
  colorPrimary: "#111111",
  colorAccent: "#222222",
  colorBackground: "#333333",
  colorSurface: "#444444",
  colorText: "#555555",
  mascotEnabled: true,
  welcomeMessage: null,
  contactEmail: null,
  customDomain: null,
  active: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  queryResult = { data: null, error: null };
});

describe("listTenants", () => {
  it("maps rows to TenantListItem", async () => {
    queryResult = {
      data: [
        { slug: "acme-pt", clinic_name: "Acme PT", active: true, custom_domain: null },
        { slug: "beta", clinic_name: "Beta Clinic", active: false, custom_domain: "beta.example.com" },
      ],
      error: null,
    };
    const result = await listTenants();
    expect(result).toEqual([
      { slug: "acme-pt", clinicName: "Acme PT", active: true, customDomain: null },
      { slug: "beta", clinicName: "Beta Clinic", active: false, customDomain: "beta.example.com" },
    ]);
  });

  it("returns an empty array on error", async () => {
    queryResult = { data: null, error: { message: "boom" } };
    expect(await listTenants()).toEqual([]);
  });
});

describe("getTenantForAdmin", () => {
  it("returns the full admin record including active/customDomain", async () => {
    queryResult = {
      data: {
        slug: "acme-pt",
        clinic_name: "Acme PT",
        logo_url: null,
        icon_url: null,
        color_primary: "#111111",
        color_accent: "#222222",
        color_background: "#333333",
        color_surface: "#444444",
        color_text: "#555555",
        mascot_enabled: true,
        welcome_message: null,
        contact_email: null,
        custom_domain: "acme.example.com",
        active: true,
      },
      error: null,
    };
    const result = await getTenantForAdmin("acme-pt");
    expect(result).toEqual({
      slug: "acme-pt",
      clinicName: "Acme PT",
      logoUrl: null,
      iconUrl: null,
      colors: {
        primary: "#111111",
        accent: "#222222",
        background: "#333333",
        surface: "#444444",
        text: "#555555",
      },
      mascotEnabled: true,
      welcomeMessage: null,
      contactEmail: null,
      customDomain: "acme.example.com",
      active: true,
    });
  });

  it("returns null when the tenant doesn't exist", async () => {
    queryResult = { data: null, error: { message: "no rows" } };
    expect(await getTenantForAdmin("nope")).toBeNull();
  });
});

describe("createTenant / updateTenant", () => {
  it("createTenant reports no error on success", async () => {
    queryResult = { error: null };
    expect(await createTenant(FORM_VALUES)).toEqual({ error: null });
  });

  it("createTenant surfaces the Supabase error message", async () => {
    queryResult = { error: { message: "duplicate key value" } };
    expect(await createTenant(FORM_VALUES)).toEqual({ error: "duplicate key value" });
  });

  it("updateTenant reports no error on success", async () => {
    queryResult = { error: null };
    expect(await updateTenant("acme-pt", FORM_VALUES)).toEqual({ error: null });
  });

  it("updateTenant surfaces the Supabase error message", async () => {
    queryResult = { error: { message: "constraint violation" } };
    expect(await updateTenant("acme-pt", FORM_VALUES)).toEqual({
      error: "constraint violation",
    });
  });
});
