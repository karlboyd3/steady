import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Atkinson_Hyperlegible, Fraunces } from "next/font/google";
import "./globals.css";
import { RegisterSW } from "@/components/RegisterSW";
import { ProgressProvider } from "@/components/ProgressProvider";
import { DisclaimerModal } from "@/components/DisclaimerModal";
import { getTenant } from "@/lib/tenant/get-tenant";
import { TenantProvider } from "@/lib/tenant/tenant-provider";
import { tenantCssVars, type TenantCssVars } from "@/lib/tenant/theme";

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const DEFAULT_DESCRIPTION =
  "A gentle, progressive 30-day program to strengthen the muscles that support your knees. Guided sessions with timers, rep pacing, and animated demos.";
const DEFAULT_ICONS: Metadata["icons"] = {
  icon: [
    { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
  ],
  apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
};

export async function generateMetadata(): Promise<Metadata> {
  const tenantKey = (await headers()).get("x-tenant-key");
  const tenant = await getTenant(tenantKey);

  if (tenant.slug === "default") {
    return {
      title: "Steady — 30-Day Knee Strength & Recovery",
      description: DEFAULT_DESCRIPTION,
      applicationName: "Steady",
      manifest: "/manifest.webmanifest",
      appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Steady",
      },
      icons: DEFAULT_ICONS,
    };
  }

  return {
    title: `${tenant.clinicName} — 30-Day Knee Strength & Recovery`,
    description: tenant.welcomeMessage ?? DEFAULT_DESCRIPTION,
    applicationName: tenant.clinicName,
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: tenant.clinicName,
    },
    icons: tenant.iconUrl
      ? {
          icon: [{ url: tenant.iconUrl, sizes: "512x512", type: "image/png" }],
          apple: [{ url: tenant.iconUrl, sizes: "512x512" }],
        }
      : DEFAULT_ICONS,
  };
}

export async function generateViewport(): Promise<Viewport> {
  const tenantKey = (await headers()).get("x-tenant-key");
  const tenant = await getTenant(tenantKey);

  return {
    themeColor: tenant.slug === "default" ? "#245446" : tenant.colors.primary,
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hdrs = await headers();
  const tenant = await getTenant(hdrs.get("x-tenant-key"));
  const isAdmin = hdrs.get("x-is-admin") === "1";
  const cssVars = tenantCssVars(tenant);

  return (
    <html lang="en" style={cssVars as React.CSSProperties & TenantCssVars}>
      <body className={`${atkinson.variable} ${fraunces.variable}`}>
        <TenantProvider tenant={tenant}>
          <ProgressProvider>
            <div className="steady">
              <div className={isAdmin ? "frame admin-frame" : "frame"}>{children}</div>
            </div>
            <DisclaimerModal />
          </ProgressProvider>
        </TenantProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
