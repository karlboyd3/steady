import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-session";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "getsteady.app";

/**
 * Resolves the request's hostname (+ dev `?tenant=` override) into a tenant
 * key consumed by getTenant(): "default", a clinic slug, or `domain:<host>`
 * for a clinic's own custom domain. Never throws — an unrecognized host
 * simply becomes a `domain:` lookup that fails soft to DEFAULT_TENANT.
 */
export function resolveTenantKey(request: NextRequest): string {
  const hostname = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();

  if (process.env.NODE_ENV !== "production") {
    const override = request.nextUrl.searchParams.get("tenant");
    if (override) return override;
  }

  if (
    hostname === "" ||
    hostname === "localhost" ||
    hostname === ROOT_DOMAIN ||
    hostname === `www.${ROOT_DOMAIN}` ||
    hostname.endsWith(".vercel.app")
  ) {
    return "default";
  }

  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const slug = hostname.slice(0, -(ROOT_DOMAIN.length + 1));
    return slug || "default";
  }

  return `domain:${hostname}`;
}

/** Verifies the signed admin cookie. Fails closed when ADMIN_TOKEN is unset. */
function isAuthedAdmin(request: NextRequest): Promise<boolean> {
  return verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value, process.env.ADMIN_TOKEN);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !(await isAuthedAdmin(request))) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const headers = new Headers(request.headers);
  headers.set("x-tenant-key", resolveTenantKey(request));
  headers.set("x-is-admin", pathname.startsWith("/admin") ? "1" : "0");
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icons/|screenshots/|sw\\.js|offline\\.html|\\.well-known/).*)",
  ],
};
