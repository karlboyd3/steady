/* ============================================================
   STEADY — Tenant configuration types.
   DEFAULT_TENANT's colors mirror the literal values in globals.css's
   :root block exactly, so the default tenant never needs a CSS override
   (see get-tenant.ts / layout.tsx) and always renders pixel-identical.
   ============================================================ */

import type { Species } from "@/lib/rewards";

export interface TenantConfig {
  slug: string;
  clinicName: string;
  logoUrl: string | null;
  iconUrl: string | null;
  colors: {
    primary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  mascotEnabled: boolean;
  welcomeMessage: string | null;
  contactEmail: string | null;
  /** Species a brand-new user's pet defaults to. Falls back to "turtle"
   * when unset; never overrides a user's own later choice. */
  defaultSpecies: Species;
}

export const SLUG_PATTERN = /^[a-z0-9-]{2,32}$/;
export const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
export const RESERVED_SLUGS = ["default", "www", "admin", "api"] as const;

export const DEFAULT_TENANT: TenantConfig = {
  slug: "default",
  clinicName: "Steady",
  logoUrl: null,
  iconUrl: null,
  colors: {
    primary: "#2f6d5b", // --pine
    accent: "#e09a32", // --amber
    background: "#eff4f1", // --bg
    surface: "#ffffff", // --card
    text: "#22332d", // --ink
  },
  mascotEnabled: true,
  welcomeMessage: null,
  contactEmail: null,
  defaultSpecies: "turtle",
};
