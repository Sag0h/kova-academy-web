import { notFound } from "next/navigation";
import { ServiceForm } from "@/components/admin/service-form";
import { ServicePhotoManager } from "@/components/admin/service-photo-manager";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";
import { updateServiceAction } from "../../actions";

export default async function EditServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();
  const { id } = await params;
  const query = await searchParams;
  const service = await prisma.servicio.findUnique({
    where: { id },
    include: { fotos: { orderBy: [{ orden: "asc" }, { createdAt: "asc" }] } },
  });
  if (!service) notFound();

  return (
    <main className="admin-page admin-form-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Catálogo</p>
          <h1>Editar servicio</h1>
          <p>Los cambios se reflejan inmediatamente en la página pública.</p>
        </div>
      </header>
      <section className="admin-panel form-panel">
        <ServiceForm
          action={updateServiceAction.bind(null, service.id)}
          initialValues={{
            nombre: service.nombre,
            descripcion: service.descripcion,
            tipoPrecio: service.tipoPrecio,
            precio: service.precio?.toString() ?? "",
            orden: service.orden,
            activo: service.activo,
          }}
          submitLabel="Guardar cambios"
        />
      </section>
      {query.error === "cloudinary-delete" && <p className="admin-notice admin-notice-error service-photo-error">No se pudo eliminar la foto de Cloudinary.</p>}
      <ServicePhotoManager
        enabled={isCloudinaryConfigured()}
        photos={service.fotos.map((photo) => ({ id: photo.id, imagenUrl: photo.imagenUrl }))}
        serviceId={service.id}
      />
    </main>
  );
}
