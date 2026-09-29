"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/login/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});

  return (
    <form action={action} className="admin-form login-form">
      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div className="form-field">
        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      <button className="admin-button admin-button-primary" disabled={pending} type="submit">
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
