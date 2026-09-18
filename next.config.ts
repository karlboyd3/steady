import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * Content-Security-Policy fitted to Steady.
 *
 * The patient-facing app is static and stores its state in localStorage, but
 * the project is no longer server-free: middleware resolves the tenant on
 * every request, and /admin runs server actions against Supabase. Those hold
 * real secrets (ADMIN_TOKEN, SUPABASE_SERVICE_ROLE_KEY), so the modules that
 * read them (lib/tenant/get-tenant.ts, lib/tenant/admin-repo.ts) are pinned
 * server-side with `import "server-only"` and no secret is ever serialized
 * into the client bundle.
 *
 * That is what keeps `connect-src 'self'` honest: Supabase is reached from
 * the server, never from the browser, so the page itself makes no
 * cross-origin requests. Fonts are self-hosted by next/font, so no external
 * font origins are needed either.
 *
 * 'unsafe-inline' is allowed for script/style because Next injects inline
 * hydration scripts and next/font inlines styles. Tenant-supplied strings
 * (clinic name, welcome message) are rendered as text through JSX and there
 * is no dangerouslySetInnerHTML anywhere in src/, so the XSS surface stays
 * small. 'unsafe-eval' is NOT allowed outside dev.
 *
 * Note for anyone populating `videoUrl` in lib/exercises.ts: LiteYouTube
 * wants an i.ytimg.com thumbnail and a youtube-nocookie.com iframe, and this
 * policy currently blocks both (img-src and the default-src fallback for
 * frame-src). Widen those two directives deliberately, or the embed will
 * fail silently.
 */
const isDev = process.env.NODE_ENV === "development";

// Next.js dev mode (Fast Refresh/HMR) evaluates code via eval(), so the
// strict script-src is relaxed with 'unsafe-eval' only in development.
// Production builds keep the exact same value as before — no 'unsafe-eval'.
//
// connect-src is intentionally left at 'self' in both environments: the
// Fast Refresh HMR client connects via WebSocket to the same host/port as
// the page itself (ws://<host> derived from location.host), and per the
// CSP3 scheme-matching algorithm, 'self' already covers the same-origin
// ws:/wss: companion of the page's http:/https: scheme in every current
// browser — no explicit ws://localhost:* entry is needed.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), browsing-topics=(), screen-wake-lock=(self)",
  },
];

const nextConfig: NextConfig = {
  // This project sits under a home dir that also has a lockfile; pin the
  // tracing root so Next packages the right files.
  outputFileTracingRoot: projectRoot,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
