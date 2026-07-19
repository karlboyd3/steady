"use client";

import { useActionState } from "react";
import type { TenantFormState } from "@/app/admin/actions";
import type { TenantAdminRecord } from "@/lib/tenant/admin-repo";

const INITIAL_STATE: TenantFormState = { error: null, fieldErrors: {} };

export function TenantForm({
  action,
  initial,
  slugEditable,
  submitLabel,
}: {
  action: (prevState: TenantFormState, formData: FormData) => Promise<TenantFormState>;
  initial?: TenantAdminRecord;
  slugEditable: boolean;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="card admin-form">
      {state.error && <p className="alert">{state.error}</p>}

      <label className="admin-field">
        Slug
        <input
          name="slug"
          defaultValue={initial?.slug ?? ""}
          readOnly={!slugEditable}
          required
        />
        {state.fieldErrors.slug && <span className="field-error">{state.fieldErrors.slug}</span>}
      </label>

      <label className="admin-field">
        Clinic name
        <input name="clinicName" defaultValue={initial?.clinicName ?? ""} required />
        {state.fieldErrors.clinicName && (
          <span className="field-error">{state.fieldErrors.clinicName}</span>
        )}
      </label>

      <label className="admin-field">
        Logo URL
        <input name="logoUrl" type="url" defaultValue={initial?.logoUrl ?? ""} />
        {state.fieldErrors.logoUrl && (
          <span className="field-error">{state.fieldErrors.logoUrl}</span>
        )}
      </label>

      <label className="admin-field">
        Icon URL
        <input name="iconUrl" type="url" defaultValue={initial?.iconUrl ?? ""} />
        {state.fieldErrors.iconUrl && (
          <span className="field-error">{state.fieldErrors.iconUrl}</span>
        )}
      </label>

      <div className="admin-color-grid">
        <label className="admin-field">
          Primary
          <input
            name="colorPrimary"
            type="color"
            defaultValue={initial?.colors.primary ?? "#2f6d5b"}
          />
        </label>
        <label className="admin-field">
          Accent
          <input
            name="colorAccent"
            type="color"
            defaultValue={initial?.colors.accent ?? "#e09a32"}
          />
        </label>
        <label className="admin-field">
          Background
          <input
            name="colorBackground"
            type="color"
            defaultValue={initial?.colors.background ?? "#eff4f1"}
          />
        </label>
        <label className="admin-field">
          Surface
          <input
            name="colorSurface"
            type="color"
            defaultValue={initial?.colors.surface ?? "#ffffff"}
          />
        </label>
        <label className="admin-field">
          Text
          <input name="colorText" type="color" defaultValue={initial?.colors.text ?? "#22332d"} />
        </label>
      </div>

      <label className="admin-checkbox">
        <input
          name="mascotEnabled"
          type="checkbox"
          defaultChecked={initial?.mascotEnabled ?? true}
        />
        Show the Shelby mascot
      </label>

      <label className="admin-field">
        Welcome message
        <textarea name="welcomeMessage" defaultValue={initial?.welcomeMessage ?? ""} />
      </label>

      <label className="admin-field">
        Contact email
        <input name="contactEmail" type="email" defaultValue={initial?.contactEmail ?? ""} />
        {state.fieldErrors.contactEmail && (
          <span className="field-error">{state.fieldErrors.contactEmail}</span>
        )}
      </label>

      <label className="admin-field">
        Custom domain
        <input
          name="customDomain"
          defaultValue={initial?.customDomain ?? ""}
          placeholder="clinic.example.com"
        />
      </label>

      <label className="admin-checkbox">
        <input name="active" type="checkbox" defaultChecked={initial?.active ?? true} />
        Active
      </label>

      <button className="big-btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </button>

      {initial && (
        <a
          className="big-btn ghost"
          href={`/?tenant=${initial.slug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open preview in new tab →
        </a>
      )}
    </form>
  );
}
