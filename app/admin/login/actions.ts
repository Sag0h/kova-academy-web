"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import type { AuthActionState } from "@/lib/action-state";

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin/slots",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "El email o la contraseña no son correctos." };
    }
    throw error;
  }

  return {};
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
