"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions";

const INITIAL_STATE: LoginState = { error: null };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, INITIAL_STATE);

  return (
    <div className="card admin-login">
      <h1>Admin sign in</h1>
      {state.error && <p className="alert">{state.error}</p>}
      <form action={formAction}>
        <label className="admin-field">
          Password
          <input name="password" type="password" required autoFocus />
        </label>
        <button className="big-btn" type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
