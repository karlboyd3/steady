import { describe, it, expect } from "vitest";
import { parseTenantForm } from "./admin-schema";

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const VALID_FIELDS = {
  slug: "acme-pt",
  clinicName: "Acme PT",
  logoUrl: "https://example.com/logo.png",
  iconUrl: "https://example.com/icon.png",
  colorPrimary: "#2f6d5b",
  colorAccent: "#e09a32",
  colorBackground: "#eff4f1",
  colorSurface: "#ffffff",
  colorText: "#22332d",
  welcomeMessage: "Welcome!",
  contactEmail: "hi@acme.example",
  customDomain: "acme.example.com",
};

describe("parseTenantForm", () => {
  it("accepts a fully valid submission", () => {
    const result = parseTenantForm(formData(VALID_FIELDS));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe("acme-pt");
      expect(result.data.mascotEnabled).toBe(false);
      expect(result.data.active).toBe(false);
    }
  });

  it("reads checkbox fields from 'on'", () => {
    const fd = formData(VALID_FIELDS);
    fd.set("mascotEnabled", "on");
    fd.set("active", "on");
    const result = parseTenantForm(fd);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mascotEnabled).toBe(true);
      expect(result.data.active).toBe(true);
    }
  });

  it("lowercases the slug", () => {
    const fd = formData({ ...VALID_FIELDS, slug: "Acme-PT" });
    const result = parseTenantForm(fd);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.slug).toBe("acme-pt");
  });

  it("rejects a slug that fails the pattern", () => {
    const fd = formData({ ...VALID_FIELDS, slug: "a" });
    const result = parseTenantForm(fd);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.slug).toBeDefined();
  });

  it.each(["default", "www", "admin", "api"])(
    "rejects the reserved slug %s",
    (reserved) => {
      const fd = formData({ ...VALID_FIELDS, slug: reserved });
      const result = parseTenantForm(fd);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.errors.slug).toBe("That slug is reserved");
    }
  );

  it("rejects a non-https logo URL", () => {
    const fd = formData({ ...VALID_FIELDS, logoUrl: "http://example.com/logo.png" });
    const result = parseTenantForm(fd);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.logoUrl).toBeDefined();
  });

  it("allows an empty logo/icon URL (treated as null)", () => {
    const fd = formData({ ...VALID_FIELDS, logoUrl: "", iconUrl: "" });
    const result = parseTenantForm(fd);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.logoUrl).toBeNull();
      expect(result.data.iconUrl).toBeNull();
    }
  });

  it("rejects a malformed hex color", () => {
    const fd = formData({ ...VALID_FIELDS, colorPrimary: "not-a-color" });
    const result = parseTenantForm(fd);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.colorPrimary).toBeDefined();
  });

  it("rejects an invalid contact email but allows an empty one", () => {
    const bad = parseTenantForm(formData({ ...VALID_FIELDS, contactEmail: "not-an-email" }));
    expect(bad.success).toBe(false);
    if (!bad.success) expect(bad.errors.contactEmail).toBeDefined();

    const empty = parseTenantForm(formData({ ...VALID_FIELDS, contactEmail: "" }));
    expect(empty.success).toBe(true);
    if (empty.success) expect(empty.data.contactEmail).toBeNull();
  });

  it("requires a non-empty clinic name", () => {
    const fd = formData({ ...VALID_FIELDS, clinicName: "  " });
    const result = parseTenantForm(fd);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.clinicName).toBeDefined();
  });
});
