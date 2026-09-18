"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseTenantForm } from "@/lib/tenant/admin-schema";
import { createTenant, updateTenant } from "@/lib/tenant/admin-repo";
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createAdminSession,
  safeEqual,
} from "@/lib/admin-session";

export interface LoginState {
  error: string | null;
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const token = process.env.ADMIN_TOKEN;
  const submitted = String(formData.get("password") ?? "");
  if (!token || !(await safeEqual(submitted, token))) {
    return { error: "Incorrect password." };
  }
  // The cookie carries a signed, expiring session value, never the secret
  // itself. `secure` is relaxed only on http://localhost, where the browser
  // would otherwise drop the cookie and make local admin work impossible.
  (await cookies()).set(ADMIN_COOKIE, await createAdminSession(token), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export interface TenantFormState {
  error: string | null;
  fieldErrors: Record<string, string>;
}

export async function createTenantAction(
  _prevState: TenantFormState,
  formData: FormData
): Promise<TenantFormState> {
  const parsed = parseTenantForm(formData);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: parsed.errors };
  }
  const { error } = await createTenant(parsed.data);
  if (error) return { error, fieldErrors: {} };
  revalidatePath("/admin");
  redirect("/admin");
}

/**
 * The slug field is read-only in the edit form but still submits with the
 * form, so it doubles as the update target — no bound extra argument needed.
 */
export async function updateTenantAction(
  _prevState: TenantFormState,
  formData: FormData
): Promise<TenantFormState> {
  const parsed = parseTenantForm(formData);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: parsed.errors };
  }
  const { error } = await updateTenant(parsed.data.slug, parsed.data);
  if (error) return { error, fieldErrors: {} };
  revalidatePath("/admin");
  revalidatePath(`/admin/tenants/${parsed.data.slug}`);
  redirect("/admin");
}
