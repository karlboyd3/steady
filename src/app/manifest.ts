import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getTenant } from "@/lib/tenant/get-tenant";

const DEFAULT_ICONS: NonNullable<MetadataRoute.Manifest["icons"]> = [
  { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "/icons/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
  { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
];

const DESCRIPTION =
  "A gentle, progressive 30-day program of guided exercises to strengthen the muscles that support your knees and improve mobility.";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const tenantKey = (await headers()).get("x-tenant-key");
  const tenant = await getTenant(tenantKey);

  // Default tenant: byte-identical to the pre-multi-tenant manifest, since
  // the installed TWA's name/id/start_url/scope/display must never drift.
  if (tenant.slug === "default") {
    return {
      id: "/",
      name: "Steady — Knee Strength & Mobility",
      short_name: "Steady",
      description: DESCRIPTION,
      start_url: "/",
      scope: "/",
      lang: "en-US",
      dir: "ltr",
      display: "standalone",
      orientation: "portrait",
      background_color: "#EFF4F1",
      theme_color: "#245446",
      categories: ["health", "fitness", "medical"],
      icons: DEFAULT_ICONS,
      screenshots: [
        {
          src: "/screenshots/home.png",
          sizes: "1080x2400",
          type: "image/png",
          form_factor: "narrow",
          label: "Your 30-day plan at a glance",
        },
        {
          src: "/screenshots/session.png",
          sizes: "1080x2400",
          type: "image/png",
          form_factor: "narrow",
          label: "Guided exercises with timers and rep pacing",
        },
        {
          src: "/screenshots/rest.png",
          sizes: "1080x2400",
          type: "image/png",
          form_factor: "narrow",
          label: "Built-in rest between exercises",
        },
      ],
    };
  }

  return {
    id: "/",
    name: tenant.clinicName,
    short_name: tenant.clinicName,
    description: DESCRIPTION,
    start_url: "/",
    scope: "/",
    lang: "en-US",
    dir: "ltr",
    display: "standalone",
    orientation: "portrait",
    background_color: tenant.colors.background,
    theme_color: tenant.colors.primary,
    categories: ["health", "fitness", "medical"],
    icons: tenant.iconUrl
      ? [{ src: tenant.iconUrl, sizes: "512x512", type: "image/png", purpose: "any" }]
      : DEFAULT_ICONS,
    // Screenshots are a default-tenant-only asset; omitted for other tenants.
  };
}
