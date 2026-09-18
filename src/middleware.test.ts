import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { resolveTenantKey, middleware } from "./middleware";
import { createAdminSession, SESSION_MAX_AGE_SECONDS } from "@/lib/admin-session";

function request(host: string, path = "/", host_header = true): NextRequest {
  const url = `https://${host_header ? host : "example.invalid"}${path}`;
  return new NextRequest(url, {
    headers: host_header ? { host } : {},
  });
}

/** Runs the middleware for `path` with `cookie` as the admin session and
 *  `token` as the configured ADMIN_TOKEN (defaults to the matching secret). */
async function withCookie(path: string, cookie: string, token: string | undefined = "secret-token") {
  if (token === undefined) delete process.env.ADMIN_TOKEN;
  else process.env.ADMIN_TOKEN = token;
  const req = request("getsteady.app", path);
  req.cookies.set("admin_session", cookie);
  return middleware(req);
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.NEXT_PUBLIC_ROOT_DOMAIN = "getsteady.app";
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
});

describe("resolveTenantKey", () => {
  it("resolves the root domain to default", () => {
    expect(resolveTenantKey(request("getsteady.app"))).toBe("default");
  });

  it("resolves the www subdomain to default", () => {
    expect(resolveTenantKey(request("www.getsteady.app"))).toBe("default");
  });

  it("resolves localhost to default", () => {
    expect(resolveTenantKey(request("localhost"))).toBe("default");
  });

  it("resolves any *.vercel.app preview host to default", () => {
    expect(resolveTenantKey(request("steady-git-main-foo.vercel.app"))).toBe("default");
  });

  it("resolves a clinic subdomain to its slug", () => {
    expect(resolveTenantKey(request("acme-pt.getsteady.app"))).toBe("acme-pt");
  });

  it("resolves an unrecognized host to a domain: key", () => {
    expect(resolveTenantKey(request("clinic.example.com"))).toBe("domain:clinic.example.com");
  });

  it("strips the port from the host header", () => {
    expect(resolveTenantKey(request("localhost:3000"))).toBe("default");
  });

  it("honors ?tenant= override outside production", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(resolveTenantKey(request("acme-pt.getsteady.app", "/?tenant=other-clinic"))).toBe(
      "other-clinic"
    );
  });

  it("ignores ?tenant= override in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(resolveTenantKey(request("acme-pt.getsteady.app", "/?tenant=other-clinic"))).toBe(
      "acme-pt"
    );
  });
});

describe("middleware admin gating", () => {
  it("redirects /admin to /admin/login when no ADMIN_TOKEN is configured", async () => {
    delete process.env.ADMIN_TOKEN;
    const res = await middleware(request("getsteady.app", "/admin"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/login");
  });

  it("redirects /admin when ADMIN_TOKEN is unset even with a session minted from some other secret", async () => {
    const res = await withCookie("/admin", await createAdminSession("some-other-secret"), undefined);
    expect(res.status).toBe(307);
  });

  it("redirects /admin when the cookie is absent", async () => {
    process.env.ADMIN_TOKEN = "secret-token";
    const res = await middleware(request("getsteady.app", "/admin"));
    expect(res.status).toBe(307);
  });

  it("redirects /admin when the cookie is not a signed session at all", async () => {
    const res = await withCookie("/admin", "secret-token");
    expect(res.status).toBe(307);
  });

  it("redirects /admin when the session was signed with a different secret", async () => {
    const forged = await createAdminSession("not-the-real-token");
    const res = await withCookie("/admin", forged);
    expect(res.status).toBe(307);
  });

  it("redirects /admin when the expiry is tampered with to extend the session", async () => {
    const session = await createAdminSession("secret-token");
    const [, signature] = session.split(".");
    const tampered = `${Math.floor(Date.now() / 1000) + 999999}.${signature}`;
    const res = await withCookie("/admin", tampered);
    expect(res.status).toBe(307);
  });

  it("redirects /admin when the session has expired", async () => {
    const expired = await createAdminSession(
      "secret-token",
      Date.now() - (SESSION_MAX_AGE_SECONDS + 60) * 1000
    );
    const res = await withCookie("/admin", expired);
    expect(res.status).toBe(307);
  });

  it("allows /admin through for a valid, unexpired session", async () => {
    const res = await withCookie("/admin", await createAdminSession("secret-token"));
    expect(res.status).toBe(200);
  });

  it("always allows /admin/login through, even unauthenticated", async () => {
    delete process.env.ADMIN_TOKEN;
    const res = await middleware(request("getsteady.app", "/admin/login"));
    expect(res.status).toBe(200);
  });

  it("sets x-tenant-key on the forwarded request for non-admin paths", async () => {
    const res = await middleware(request("acme-pt.getsteady.app", "/"));
    expect(res.headers.get("x-middleware-request-x-tenant-key")).toBe("acme-pt");
  });

  it("sets x-is-admin=0 for non-admin paths", async () => {
    const res = await middleware(request("getsteady.app", "/"));
    expect(res.headers.get("x-middleware-request-x-is-admin")).toBe("0");
  });

  it("sets x-is-admin=1 for admin paths", async () => {
    const res = await withCookie("/admin", await createAdminSession("secret-token"));
    expect(res.headers.get("x-middleware-request-x-is-admin")).toBe("1");
  });
});
