import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { DEFAULT_TENANT, type TenantConfig } from "./types";
import { isSpecies } from "@/lib/rewards";

/** Service-role Supabase client. Shared with the admin CRUD layer (admin-repo.ts). */
export function supabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export interface TenantRow {
  slug: string;
  clinic_name: string;
  logo_url: string | null;
  icon_url: string | null;
  color_primary: string;
  color_accent: string;
  color_background: string;
  color_surface: string;
  color_text: string;
  mascot_enabled: boolean;
  welcome_message: string | null;
  contact_email: string | null;
  default_species: string | null;
}

export function mapRow(d: TenantRow): TenantConfig {
  return {
    slug: d.slug,
    clinicName: d.clinic_name,
    logoUrl: d.logo_url,
    iconUrl: d.icon_url,
    colors: {
      primary: d.color_primary,
      accent: d.color_accent,
      background: d.color_background,
      surface: d.color_surface,
      text: d.color_text,
    },
    mascotEnabled: d.mascot_enabled,
    welcomeMessage: d.welcome_message,
    contactEmail: d.contact_email,
    // Tenants created before this column existed read back as null.
    defaultSpecies: isSpecies(d.default_species) ? d.default_species : "turtle",
  };
}

/** Fetch by slug (bare key) or custom domain (`domain:<host>` key), revalidated every 60s. */
const fetchTenant = unstable_cache(
  async (key: string): Promise<TenantConfig | null> => {
    const byDomain = key.startsWith("domain:");
    const value = byDomain ? key.slice("domain:".length) : key;
    const { data, error } = await supabase()
      .from("tenants")
      .select("*")
      .eq(byDomain ? "custom_domain" : "slug", value)
      .eq("active", true)
      .single();
    if (error || !data) return null;
    return mapRow(data as TenantRow);
  },
  ["tenant-config"],
  { revalidate: 60 }
);

/**
 * Resolve a tenant key (slug, `domain:<host>`, `null`, or `"default"`) into a
 * TenantConfig. Fails soft to DEFAULT_TENANT on any miss or error — an
 * unknown tenant or a Supabase outage must never crash the app.
 */
export const getTenant = cache(async (key: string | null): Promise<TenantConfig> => {
  if (!key || key === "default") return DEFAULT_TENANT;
  try {
    return (await fetchTenant(key)) ?? DEFAULT_TENANT;
  } catch {
    return DEFAULT_TENANT;
  }
});
