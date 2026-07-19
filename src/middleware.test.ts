import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { resolveTenantKey, middleware } from "./middleware";

function request(host: string, path = "/", host_header = true): NextRequest {
  const url = `https://${host_header ? host : "example.invalid"}${path}`;
  return new NextRequest(url, {
    headers: host_header ? { host } : {},
  });
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
  it("redirects /admin to /admin/login when no ADMIN_TOKEN is configured", () => {
    delete process.env.ADMIN_TOKEN;
    const res = middleware(request("getsteady.app", "/admin"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/login");
  });

  it("redirects /admin when the admin_session cookie doesn't match ADMIN_TOKEN", () => {
    process.env.ADMIN_TOKEN = "secret-token";
    const req = request("getsteady.app", "/admin");
    req.cookies.set("admin_session", "wrong-value");
    const res = middleware(req);
    expect(res.status).toBe(307);
  });

  it("allows /admin through when the admin_session cookie matches ADMIN_TOKEN", () => {
    process.env.ADMIN_TOKEN = "secret-token";
    const req = request("getsteady.app", "/admin");
    req.cookies.set("admin_session", "secret-token");
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it("always allows /admin/login through, even unauthenticated", () => {
    delete process.env.ADMIN_TOKEN;
    const res = middleware(request("getsteady.app", "/admin/login"));
    expect(res.status).toBe(200);
  });

  it("sets x-tenant-key on the forwarded request for non-admin paths", () => {
    const res = middleware(request("acme-pt.getsteady.app", "/"));
    expect(res.headers.get("x-middleware-request-x-tenant-key")).toBe("acme-pt");
  });
});
