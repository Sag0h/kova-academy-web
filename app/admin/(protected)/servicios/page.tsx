import { prisma } from "@/lib/prisma";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { requireAdminSession } from "@/lib/require-admin";
import { deleteServiceAction, toggleServiceAction } from "./actions";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

function priceLabel(tipo: "fijo" | "desde" | "cotizacion", price: number | null) {
  if (tipo === "cotizacion") return "A cotizar";
  const formatted = currencyFormatter.format(price ?? 0);
  return tipo === "desde" ? `Desde ${formatted}` : formatted;
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();
  const query = await searchParams;
  const services = await prisma.servicio.findMany({
    include: {
      _count: {
        select: {
          slots: { where: { estado: "disponible", inicio: { gt: new Date() } } },
          fotos: true,
        },
      },
    },
    orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
  });

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Catálogo</p>
          <h1>Servicios</h1>
          <p>Administrá nombres, precios, visibilidad y orden de aparición.</p>
        </div>
        <a className="admin-button admin-button-primary" href="/admin/servicios/nuevo">+ Nuevo servicio</a>
      </header>

      {query.created && <p className="admin-notice" role="status">El servicio fue creado.</p>}
      {query.updated && <p className="admin-notice" role="status">Los cambios fueron guardados.</p>}
      {query.error === "active-slots" && (
        <p className="admin-notice admin-notice-error" role="alert">
          No se puede eliminar un servicio con turnos futuros disponibles. Desactivalo o reasigná esos turnos primero.
        </p>
      )}
      {query.error === "cloudinary-delete" && (
        <p className="admin-notice admin-notice-error" role="alert">No se pudieron eliminar las fotos de Cloudinary. El servicio no fue modificado.</p>
      )}

      <section className="admin-panel">
        <div className="admin-toolbar">
          <strong>Catálogo completo</strong>
          <span>{services.length} {services.length === 1 ? "servicio" : "servicios"}</span>
        </div>
        {services.length === 0 ? (
          <div className="admin-empty">
            <strong>Todavía no hay servicios.</strong>
            <p>Creá el primero para comenzar a completar el catálogo.</p>
          </div>
        ) : (
          <div className="admin-table-wrap services-table-wrap">
            <table className="admin-table services-table">
              <thead>
                <tr><th>Servicio</th><th>Precio</th><th>Estado y uso</th><th><span className="sr-only">Acciones</span></th></tr>
              </thead>
              <tbody>
                {services.map((service) => {
                  const toggleAction = toggleServiceAction.bind(null, service.id, !service.activo);
                  const deleteAction = deleteServiceAction.bind(null, service.id);

                  return (
                    <tr key={service.id}>
                      <td className="service-name-cell">
                        <div className="service-name-layout">
                          <span className="order-badge" title={`Orden ${service.orden}`}>{service.orden}</span>
                          <div><strong>{service.nombre}</strong><small>{service.descripcion}</small></div>
                        </div>
                      </td>
                      <td className="service-price-cell"><small className="mobile-cell-label">Precio</small>{priceLabel(service.tipoPrecio, service.precio ? Number(service.precio) : null)}</td>
                      <td className="service-status-cell">
                        <span className={`status-chip ${service.activo ? "status-disponible" : "status-ocupado"}`}>{service.activo ? "Activo" : "Inactivo"}</span>
                        <small>{service._count.slots} turnos · {service._count.fotos} fotos</small>
                      </td>
                      <td className="service-actions-cell">
                        <div className="row-actions">
                          <form action={toggleAction}><button type="submit">{service.activo ? "Desactivar" : "Activar"}</button></form>
                          <a href={`/admin/servicios/${service.id}/editar`}>Editar</a>
                          <form action={deleteAction}>
                            <ConfirmSubmitButton className="danger" disabled={service._count.slots > 0} message={`¿Eliminar el servicio ${service.nombre}?`}>
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
