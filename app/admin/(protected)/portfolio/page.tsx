import Image from "next/image";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { PortfolioUploader } from "@/components/admin/portfolio-uploader";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";
import {
  deletePortfolioItemAction,
  movePortfolioItemAction,
  updatePortfolioDescriptionAction,
} from "./actions";

export default async function PortfolioAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();
  const query = await searchParams;
  const items = await prisma.trabajo.findMany({
    orderBy: [{ orden: "asc" }, { creadoEn: "asc" }],
  });

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Galería</p>
          <h1>Portfolio</h1>
          <p>Subí trabajos, editá sus descripciones y elegí el orden de aparición.</p>
        </div>
      </header>

      {query.created && <p className="admin-notice" role="status">Las imágenes fueron publicadas.</p>}
      {query.error === "description" && <p className="admin-notice admin-notice-error">La descripción no puede superar los 200 caracteres.</p>}
      {query.error === "cloudinary-delete" && <p className="admin-notice admin-notice-error">No se pudo eliminar la imagen de Cloudinary. No se modificó el portfolio.</p>}

      <PortfolioUploader enabled={isCloudinaryConfigured()} />

      <section className="portfolio-admin-grid">
        {items.map((item, index) => {
          const deleteAction = deletePortfolioItemAction.bind(null, item.id);
          const updateAction = updatePortfolioDescriptionAction.bind(null, item.id);
          const moveUp = movePortfolioItemAction.bind(null, item.id, "up");
          const moveDown = movePortfolioItemAction.bind(null, item.id, "down");
          const realImage = item.imagenUrl.startsWith("https://");

          return (
            <article className="portfolio-admin-card" key={item.id}>
              <div className={`portfolio-admin-image art-${["rose", "wine", "pearl", "gold"][index % 4]}`}>
                {realImage ? <Image alt={item.descripcion ?? "Trabajo de Kova Academy"} fill sizes="(max-width: 600px) 100vw, 300px" src={item.imagenUrl} /> : <div className="portfolio-detail"><span /><span /><span /></div>}
                <span className="portfolio-order">#{index + 1}</span>
              </div>
              <form action={updateAction} className="portfolio-description-form">
                <label htmlFor={`description-${item.id}`}>Descripción</label>
                <textarea defaultValue={item.descripcion ?? ""} id={`description-${item.id}`} maxLength={200} name="descripcion" rows={2} />
                <button type="submit">Guardar descripción</button>
              </form>
              <div className="portfolio-card-actions">
                <form action={moveUp}><button disabled={index === 0} type="submit" aria-label="Mover antes">↑</button></form>
                <form action={moveDown}><button disabled={index === items.length - 1} type="submit" aria-label="Mover después">↓</button></form>
                <form action={deleteAction}>
                  <ConfirmSubmitButton className="danger" message="¿Eliminar este trabajo del portfolio? La imagen también se eliminará de Cloudinary.">
                    Eliminar
                  </ConfirmSubmitButton>
                </form>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
