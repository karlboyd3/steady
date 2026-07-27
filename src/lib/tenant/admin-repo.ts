import "server-only";

import { supabase, mapRow, type TenantRow } from "./get-tenant";
import type { TenantConfig } from "./types";
import type { TenantFormValues } from "./admin-schema";

export interface TenantListItem {
  slug: string;
  clinicName: string;
  active: boolean;
  customDomain: string | null;
}

interface TenantListRow {
  slug: string;
  clinic_name: string;
  active: boolean;
  custom_domain: string | null;
}

export async function listTenants(): Promise<TenantListItem[]> {
  const { data, error } = await supabase()
    .from("tenants")
    .select("slug, clinic_name, active, custom_domain")
    .order("slug", { ascending: true });
  if (error || !data) return [];
  return (data as TenantListRow[]).map((r) => ({
    slug: r.slug,
    clinicName: r.clinic_name,
    active: r.active,
    customDomain: r.custom_domain,
  }));
}

/** TenantConfig plus the admin-only columns the public read path never needs. */
export interface TenantAdminRecord extends TenantConfig {
  customDomain: string | null;
  active: boolean;
}

interface TenantRowFull extends TenantRow {
  custom_domain: string | null;
  active: boolean;
}

/** Fetch a tenant by slug for the admin UI, bypassing the active-only public read path. */
export async function getTenantForAdmin(slug: string): Promise<TenantAdminRecord | null> {
  const { data, error } = await supabase()
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error || !data) return null;
  const row = data as TenantRowFull;
  return {
    ...mapRow(row),
    customDomain: row.custom_domain,
    active: row.active,
  };
}

function toRow(v: TenantFormValues) {
  return {
    slug: v.slug,
    clinic_name: v.clinicName,
    logo_url: v.logoUrl,
    icon_url: v.iconUrl,
    color_primary: v.colorPrimary,
    color_accent: v.colorAccent,
    color_background: v.colorBackground,
    color_surface: v.colorSurface,
    color_text: v.colorText,
    mascot_enabled: v.mascotEnabled,
    welcome_message: v.welcomeMessage,
    contact_email: v.contactEmail,
    custom_domain: v.customDomain,
    active: v.active,
    default_species: v.defaultSpecies,
  };
}

export async function createTenant(v: TenantFormValues): Promise<{ error: string | null }> {
  const { error } = await supabase().from("tenants").insert(toRow(v));
  return { error: error ? error.message : null };
}

export async function updateTenant(
  slug: string,
  v: TenantFormValues
): Promise<{ error: string | null }> {
  const { error } = await supabase().from("tenants").update(toRow(v)).eq("slug", slug);
  return { error: error ? error.message : null };
}
