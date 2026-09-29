import { prisma } from "@/lib/prisma";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { requireAdminSession } from "@/lib/require-admin";
import { deleteSlotAction, setSlotStatusAction } from "./actions";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "America/Argentina/Buenos_Aires",
});

const timeFormatter = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Argentina/Buenos_Aires",
});

const messages: Record<string, string> = {
  created: "El turno fue publicado.",
  updated: "Los cambios fueron guardados.",
};

export default async function SlotsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();
  const query = await searchParams;
  const filter = query.filter === "disponible" || query.filter === "ocupado" ? query.filter : "todos";
  const status = typeof query.created === "string" ? "created" : typeof query.updated === "string" ? "updated" : null;

  const slots = await prisma.slot.findMany({
    where: filter === "todos" ? undefined : { estado: filter },
    include: { servicio: { select: { nombre: true } } },
    orderBy: { inicio: "asc" },
  });

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Agenda</p>
          <h1>Turnos</h1>
          <p>Publicá disponibilidad y mantené actualizados los horarios confirmados.</p>
        </div>
        <a className="admin-button admin-button-primary" href="/admin/slots/nuevo">+ Nuevo turno</a>
      </header>

      {status && <p className="admin-notice" role="status">{messages[status]}</p>}
      {query.error === "occupied" && (
        <p className="admin-notice admin-notice-error" role="alert">Los turnos ocupados no se pueden eliminar.</p>
      )}

      <section className="admin-panel">
        <div className="admin-toolbar">
          <div className="filter-tabs" aria-label="Filtrar turnos">
            {[
              ["todos", "Todos"],
              ["disponible", "Disponibles"],
              ["ocupado", "Ocupados"],
            ].map(([value, label]) => (
              <a className={filter === value ? "active" : ""} href={value === "todos" ? "/admin/slots" : `/admin/slots?filter=${value}`} key={value}>
                {label}
              </a>
            ))}
          </div>
          <span>{slots.length} {slots.length === 1 ? "turno" : "turnos"}</span>
        </div>

        {slots.length === 0 ? (
          <div className="admin-empty">
            <strong>No hay turnos en esta vista.</strong>
            <p>Creá un turno nuevo o cambiá el filtro seleccionado.</p>
          </div>
        ) : (
          <div className="admin-table-wrap slots-table-wrap">
            <table className="admin-table slots-table">
              <thead>
                <tr><th>Fecha y hora</th><th>Servicio</th><th>Estado</th><th>Notas</th><th><span className="sr-only">Acciones</span></th></tr>
              </thead>
              <tbody>
                {slots.map((slot) => {
                  const toggleAction = setSlotStatusAction.bind(
                    null,
                    slot.id,
                    slot.estado === "disponible" ? "ocupado" : "disponible",
                  );
                  const deleteAction = deleteSlotAction.bind(null, slot.id);

                  return (
                    <tr key={slot.id}>
                      <td className="slot-date-cell"><strong>{dateFormatter.format(slot.inicio)}</strong><small>{timeFormatter.format(slot.inicio)} hs</small></td>
                      <td className="slot-service-cell"><small className="mobile-cell-label">Servicio</small>{slot.servicio?.nombre ?? <span className="muted">Cualquier servicio</span>}</td>
                      <td className="slot-status-cell"><span className={`status-chip status-${slot.estado}`}>{slot.estado === "disponible" ? "Disponible" : "Ocupado"}</span></td>
                      <td className="notes-cell slot-notes-cell"><small className="mobile-cell-label">Notas</small>{slot.notas ?? <span className="muted">Sin notas</span>}</td>
                      <td className="slot-actions-cell">
                        <div className="row-actions">
                          <form action={toggleAction}><button type="submit">{slot.estado === "disponible" ? "Marcar ocupado" : "Liberar"}</button></form>
                          <a href={`/admin/slots/${slot.id}/editar`}>Editar</a>
                          <form action={deleteAction}>
                            <ConfirmSubmitButton className="danger" disabled={slot.estado === "ocupado"} message="¿Eliminar este turno disponible?">
                              Eliminar
                            </ConfirmSubmitButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
