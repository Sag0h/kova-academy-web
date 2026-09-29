"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createServicePhotosAction,
  deleteServicePhotoAction,
  moveServicePhotoAction,
} from "@/app/admin/(protected)/servicios/actions";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

interface ServicePhoto {
  id: string;
  imagenUrl: string;
}

interface PendingPhoto {
  id: string;
  file: File;
  previewUrl: string;
}

interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxSize = 5 * 1024 * 1024;

export function ServicePhotoManager({
  enabled,
  photos,
  serviceId,
}: {
  enabled: boolean;
  photos: ServicePhoto[];
  serviceId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const [error, setError] = useState<string>();
  const [uploading, setUploading] = useState(false);

  function selectFiles(files: FileList | null) {
    if (!files) return;
    const selected = Array.from(files);
    if (selected.length + pending.length > 10) {
      setError("Podés subir hasta 10 fotos por vez.");
      return;
    }
    if (selected.some((file) => !allowedTypes.has(file.type) || file.size > maxSize)) {
      setError("Usá imágenes JPG, PNG o WEBP de hasta 5 MB.");
      return;
    }
    setError(undefined);
    setPending((current) => [...current, ...selected.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }))]);
  }

  async function upload() {
    if (!enabled || pending.length === 0) return;
    setUploading(true);
    setError(undefined);
    try {
      const signatureResponse = await fetch("/api/cloudinary/sign?scope=services");
      if (!signatureResponse.ok) throw new Error("No se pudo preparar la subida.");
      const signature = (await signatureResponse.json()) as UploadSignature;
      const uploaded = await Promise.all(pending.map(async (photo) => {
        const body = new FormData();
        body.append("file", photo.file);
        body.append("api_key", signature.apiKey);
        body.append("timestamp", String(signature.timestamp));
        body.append("folder", signature.folder);
        body.append("signature", signature.signature);
        const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
          method: "POST",
          body,
        });
        if (!response.ok) throw new Error("Cloudinary rechazó una de las imágenes.");
        const result = (await response.json()) as { secure_url: string; public_id: string };
        return { imageUrl: result.secure_url, publicId: result.public_id };
      }));

      const result = await createServicePhotosAction(serviceId, uploaded);
      if (!result.success) throw new Error(result.error);
      pending.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      setPending([]);
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudieron subir las fotos.");
      setUploading(false);
    }
  }

  return (
    <section className="admin-panel service-photos-panel">
      <div className="upload-heading">
        <div><strong>Fotos del servicio</strong><p>Se muestran como carrusel en la página pública.</p></div>
        <label className={`admin-button admin-button-secondary ${!enabled ? "disabled-button" : ""}`}>
          Agregar fotos
          <input accept="image/jpeg,image/png,image/webp" disabled={!enabled} hidden multiple onChange={(event) => selectFiles(event.target.files)} type="file" />
        </label>
      </div>
      {!enabled && <p className="admin-notice admin-notice-warning">Configurá Cloudinary para habilitar nuevas fotos.</p>}
      {photos.length > 0 && (
        <div className="service-photo-grid">
          {photos.map((photo, index) => {
            const moveUp = moveServicePhotoAction.bind(null, photo.id, "up");
            const moveDown = moveServicePhotoAction.bind(null, photo.id, "down");
            const remove = deleteServicePhotoAction.bind(null, photo.id);
            return (
              <article className="service-photo-item" key={photo.id}>
                <div><Image alt={`Foto ${index + 1} del servicio`} fill sizes="160px" src={photo.imagenUrl} /></div>
                <span>#{index + 1}</span>
                <div className="service-photo-actions">
                  <form action={moveUp}><button disabled={index === 0} type="submit">←</button></form>
                  <form action={moveDown}><button disabled={index === photos.length - 1} type="submit">→</button></form>
                  <form action={remove}>
                    <ConfirmSubmitButton className="danger" message="¿Eliminar esta foto del servicio?">×</ConfirmSubmitButton>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {pending.length > 0 && (
        <div className="pending-service-photos">
          {pending.map((photo) => (
            <div className="pending-service-photo" key={photo.id}>
              <Image alt="Vista previa" fill sizes="110px" src={photo.previewUrl} unoptimized />
              <button onClick={() => setPending((current) => current.filter((item) => item.id !== photo.id))} type="button">×</button>
            </div>
          ))}
        </div>
      )}
      {(pending.length > 0 || error) && (
        <div className="upload-footer">
          {error && <p className="form-error" role="alert">{error}</p>}
          {pending.length > 0 && <button className="admin-button admin-button-primary" disabled={uploading} onClick={upload} type="button">{uploading ? "Subiendo…" : `Subir ${pending.length} fotos`}</button>}
        </div>
      )}
    </section>
  );
}
