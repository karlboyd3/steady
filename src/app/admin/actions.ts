"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseTenantForm } from "@/lib/tenant/admin-schema";
import { createTenant, updateTenant } from "@/lib/tenant/admin-repo";

const ADMIN_COOKIE = "admin_session";

export interface LoginState {
  error: string | null;
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const token = process.env.ADMIN_TOKEN;
  const submitted = String(formData.get("password") ?? "");
  if (!token || submitted !== token) {
    return { error: "Incorrect password." };
  }
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
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
