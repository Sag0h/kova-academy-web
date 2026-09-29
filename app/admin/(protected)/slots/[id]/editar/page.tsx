import { notFound } from "next/navigation";
import { SlotForm } from "@/components/admin/slot-form";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";
import { updateSlotAction } from "../../actions";

const formatter = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Argentina/Buenos_Aires",
});

function dateTimeLocalValue(date: Date) {
  return formatter.format(date).replace(" ", "T");
}

export default async function EditSlotPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();
  const { id } = await params;
  const [slot, services] = await Promise.all([
    prisma.slot.findUnique({ where: { id } }),
    prisma.servicio.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
      select: { id: true, nombre: true },
    }),
  ]);

  if (!slot) notFound();
  const action = updateSlotAction.bind(null, slot.id);

  return (
    <main className="admin-page admin-form-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Agenda</p>
          <h1>Editar turno</h1>
          <p>Actualizá el horario, servicio o las notas internas.</p>
        </div>
      </header>
      <section className="admin-panel form-panel">
        <SlotForm
          action={action}
          initialValues={{
            inicio: dateTimeLocalValue(slot.inicio),
            servicioId: slot.servicioId ?? "",
            notas: slot.notas ?? "",
          }}
          services={services}
          submitLabel="Guardar cambios"
        />
      </section>
    </main>
  );
}
