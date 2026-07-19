import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const cookiesSetMock = vi.fn();
const cookiesDeleteMock = vi.fn();
vi.mock("next/headers", () => ({
  cookies: () => ({ set: cookiesSetMock, delete: cookiesDeleteMock }),
}));

const redirectMock = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url),
}));

const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: (path: string) => revalidatePathMock(path),
}));

const createTenantMock = vi.fn();
const updateTenantMock = vi.fn();
vi.mock("@/lib/tenant/admin-repo", () => ({
  createTenant: (v: unknown) => createTenantMock(v),
  updateTenant: (slug: string, v: unknown) => updateTenantMock(slug, v),
}));

import { login, logout, createTenantAction, updateTenantAction } from "./actions";

const ORIGINAL_ADMIN_TOKEN = process.env.ADMIN_TOKEN;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  if (ORIGINAL_ADMIN_TOKEN === undefined) delete process.env.ADMIN_TOKEN;
  else process.env.ADMIN_TOKEN = ORIGINAL_ADMIN_TOKEN;
});

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("login", () => {
  it("rejects when ADMIN_TOKEN is not configured", async () => {
    delete process.env.ADMIN_TOKEN;
    const result = await login({ error: null }, formData({ password: "anything" }));
    expect(result).toEqual({ error: "Incorrect password." });
    expect(cookiesSetMock).not.toHaveBeenCalled();
  });

  it("rejects a wrong password", async () => {
    process.env.ADMIN_TOKEN = "secret";
    const result = await login({ error: null }, formData({ password: "wrong" }));
    expect(result).toEqual({ error: "Incorrect password." });
    expect(cookiesSetMock).not.toHaveBeenCalled();
  });

  it("sets an httpOnly cookie and redirects on a correct password", async () => {
    process.env.ADMIN_TOKEN = "secret";
    await login({ error: null }, formData({ password: "secret" }));
    expect(cookiesSetMock).toHaveBeenCalledWith(
      "admin_session",
      "secret",
      expect.objectContaining({ httpOnly: true })
    );
    expect(redirectMock).toHaveBeenCalledWith("/admin");
  });
});

describe("logout", () => {
  it("clears the cookie and redirects to login", async () => {
    await logout();
    expect(cookiesDeleteMock).toHaveBeenCalledWith("admin_session");
    expect(redirectMock).toHaveBeenCalledWith("/admin/login");
  });
});

const VALID_FIELDS = {
  slug: "acme-pt",
  clinicName: "Acme PT",
  logoUrl: "",
  iconUrl: "",
  colorPrimary: "#2f6d5b",
  colorAccent: "#e09a32",
  colorBackground: "#eff4f1",
  colorSurface: "#ffffff",
  colorText: "#22332d",
  welcomeMessage: "",
  contactEmail: "",
  customDomain: "",
};

describe("createTenantAction", () => {
  it("returns field errors and never calls the repo on invalid input", async () => {
    const result = await createTenantAction(
      { error: null, fieldErrors: {} },
      formData({ ...VALID_FIELDS, slug: "a" })
    );
    expect(result.error).toBeTruthy();
    expect(result.fieldErrors.slug).toBeDefined();
    expect(createTenantMock).not.toHaveBeenCalled();
  });

  it("creates the tenant, revalidates, and redirects on valid input", async () => {
    createTenantMock.mockResolvedValue({ error: null });
    await createTenantAction({ error: null, fieldErrors: {} }, formData(VALID_FIELDS));
    expect(createTenantMock).toHaveBeenCalled();
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin");
    expect(redirectMock).toHaveBeenCalledWith("/admin");
  });

  it("surfaces a repo error without redirecting", async () => {
    createTenantMock.mockResolvedValue({ error: "duplicate key" });
    const result = await createTenantAction(
      { error: null, fieldErrors: {} },
      formData(VALID_FIELDS)
    );
    expect(result.error).toBe("duplicate key");
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

describe("updateTenantAction", () => {
  it("updates using the slug carried in the form, revalidates, and redirects", async () => {
    updateTenantMock.mockResolvedValue({ error: null });
    await updateTenantAction({ error: null, fieldErrors: {} }, formData(VALID_FIELDS));
    expect(updateTenantMock).toHaveBeenCalledWith(
      "acme-pt",
      expect.objectContaining({ slug: "acme-pt" })
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin");
    expect(redirectMock).toHaveBeenCalledWith("/admin");
  });

  it("returns field errors and never calls the repo on invalid input", async () => {
    const result = await updateTenantAction(
      { error: null, fieldErrors: {} },
      formData({ ...VALID_FIELDS, colorPrimary: "nope" })
    );
    expect(result.fieldErrors.colorPrimary).toBeDefined();
    expect(updateTenantMock).not.toHaveBeenCalled();
  });
});
