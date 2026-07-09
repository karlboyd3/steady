import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * Content-Security-Policy fitted to Steady, a fully-static PWA with no server
 * code, no secrets, and no external requests. Fonts are self-hosted by
 * next/font, so no external font origins are needed.
 *
 * 'unsafe-inline' is allowed for script/style because Next injects inline
 * hydration scripts and next/font inlines styles; the app renders no
 * user-supplied HTML, so the XSS surface is minimal. 'unsafe-eval' is NOT
 * allowed.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
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
