import { SettingsForm } from "@/components/admin/settings-form";
import { HeroImageManager } from "@/components/admin/hero-image-manager";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();
  const query = await searchParams;
  const settings = await prisma.configuracion.findUnique({ where: { id: "singleton" } });

  return (
    <main className="admin-page admin-form-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Sitio público</p>
          <h1>Configuración</h1>
          <p>Actualizá la identidad básica y el contacto utilizado en toda la web.</p>
        </div>
        <a className="admin-button admin-button-secondary" href="/" target="_blank" rel="noreferrer">Ver sitio ↗</a>
      </header>
      {query.saved && <p className="admin-notice" role="status">La configuración fue actualizada.</p>}
      <section className="admin-panel form-panel">
        <SettingsForm
          initialValues={{
            nombreNegocio: settings?.nombreNegocio ?? "Kova Academy",
            descripcion: settings?.descripcion ?? "",
            whatsappNumero: settings?.whatsappNumero ?? "",
            tiktokUrl: settings?.tiktokUrl ?? "",
          }}
        />
      </section>
      <HeroImageManager enabled={isCloudinaryConfigured()} imageUrl={settings?.heroImagenUrl ?? null} />
    </main>
  );
}
