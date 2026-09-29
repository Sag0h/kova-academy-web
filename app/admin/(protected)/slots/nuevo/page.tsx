import { SlotForm } from "@/components/admin/slot-form";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";
import { createSlotAction } from "../actions";

export default async function NewSlotPage() {
  await requireAdminSession();
  const services = await prisma.servicio.findMany({
    where: { activo: true },
    orderBy: { orden: "asc" },
    select: { id: true, nombre: true },
  });

  return (
    <main className="admin-page admin-form-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Agenda</p>
          <h1>Nuevo turno</h1>
          <p>Publicá una fecha disponible para que aparezca inmediatamente en el sitio.</p>
        </div>
      </header>
      <section className="admin-panel form-panel">
        <SlotForm action={createSlotAction} services={services} submitLabel="Publicar turno" />
      </section>
    </main>
  );
}
