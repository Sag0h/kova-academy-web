import { ServiceForm } from "@/components/admin/service-form";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";
import { createServiceAction } from "../actions";

export default async function NewServicePage() {
  await requireAdminSession();
  const lastService = await prisma.servicio.aggregate({ _max: { orden: true } });
  const nextOrder = (lastService._max.orden ?? 0) + 1;

  return (
    <main className="admin-page admin-form-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Catálogo</p>
          <h1>Nuevo servicio</h1>
          <p>Agregá el servicio, su precio y el orden en que aparecerá en el sitio.</p>
        </div>
      </header>
      <section className="admin-panel form-panel">
        <ServiceForm action={createServiceAction} defaultOrder={nextOrder} submitLabel="Crear servicio" />
      </section>
    </main>
  );
}
