/* ============================================================
   STEADY — admin tenant-form validation.
   Server actions parse raw FormData through this schema before
   any write touches Supabase, so bad input never reaches the DB.
   ============================================================ */

import { z } from "zod";
import { SLUG_PATTERN, HEX_COLOR_PATTERN, RESERVED_SLUGS } from "./types";

const optionalHttpsUrl = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .refine((v) => v === null || v.startsWith("https://"), {
    message: "Must be an https:// URL",
  });

const optionalString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v));

const optionalEmail = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .refine((v) => v === null || z.email().safeParse(v).success, {
    message: "Must be a valid email address",
  });

const hexColor = z
  .string()
  .trim()
  .regex(HEX_COLOR_PATTERN, "Must be a hex color like #2f6d5b");

export const tenantFormSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(SLUG_PATTERN, "Slug must be 2-32 lowercase letters, numbers, or hyphens")
    .refine((v) => !(RESERVED_SLUGS as readonly string[]).includes(v), {
      message: "That slug is reserved",
    }),
  clinicName: z.string().trim().min(1, "Clinic name is required"),
  logoUrl: optionalHttpsUrl,
  iconUrl: optionalHttpsUrl,
  colorPrimary: hexColor,
  colorAccent: hexColor,
  colorBackground: hexColor,
  colorSurface: hexColor,
  colorText: hexColor,
  mascotEnabled: z.boolean(),
  welcomeMessage: optionalString,
  contactEmail: optionalEmail,
  customDomain: optionalString,
  active: z.boolean(),
});

export type TenantFormValues = z.infer<typeof tenantFormSchema>;

export function tenantFormValuesFromFormData(formData: FormData): Record<string, unknown> {
  return {
    slug: String(formData.get("slug") ?? ""),
    clinicName: String(formData.get("clinicName") ?? ""),
    logoUrl: String(formData.get("logoUrl") ?? ""),
    iconUrl: String(formData.get("iconUrl") ?? ""),
    colorPrimary: String(formData.get("colorPrimary") ?? ""),
    colorAccent: String(formData.get("colorAccent") ?? ""),
    colorBackground: String(formData.get("colorBackground") ?? ""),
    colorSurface: String(formData.get("colorSurface") ?? ""),
    colorText: String(formData.get("colorText") ?? ""),
    mascotEnabled: formData.get("mascotEnabled") === "on",
    welcomeMessage: String(formData.get("welcomeMessage") ?? ""),
    contactEmail: String(formData.get("contactEmail") ?? ""),
    customDomain: String(formData.get("customDomain") ?? ""),
    active: formData.get("active") === "on",
  };
}

export type TenantFormResult =
  | { success: true; data: TenantFormValues }
  | { success: false; errors: Partial<Record<keyof TenantFormValues, string>> };

export function parseTenantForm(formData: FormData): TenantFormResult {
  const parsed = tenantFormSchema.safeParse(tenantFormValuesFromFormData(formData));
  if (parsed.success) return { success: true, data: parsed.data };

  const errors: Partial<Record<keyof TenantFormValues, string>> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in errors)) {
      errors[key as keyof TenantFormValues] = issue.message;
    }
  }
  return { success: false, errors };
}
