import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/require-admin";

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminSession();
  const user = session.user!;

  return (
    <AdminShell userEmail={user.email ?? ""} userName={user.name ?? "Alai"}>
      {children}
    </AdminShell>
  );
}
