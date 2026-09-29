"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPortfolioItemsAction } from "@/app/admin/(protected)/portfolio/actions";

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
  description: string;
}

interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxSize = 10 * 1024 * 1024;

export function PortfolioUploader({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [images, setImages] = useState<PendingImage[]>([]);
  const [error, setError] = useState<string>();
  const [uploading, setUploading] = useState(false);

  function chooseFiles(files: FileList | null) {
    if (!files) return;
    const selected = Array.from(files);
    const invalid = selected.find((file) => !allowedTypes.has(file.type) || file.size > maxSize);
    if (invalid) {
      setError("Usá imágenes JPG, PNG o WEBP de hasta 10 MB.");
      return;
    }
    setError(undefined);
    setImages((current) => [
      ...current,
      ...selected.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        description: "",
      })),
    ]);
  }

  function removeImage(id: string) {
    setImages((current) => {
      const removed = current.find((image) => image.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((image) => image.id !== id);
    });
  }

  async function upload() {
    if (!enabled || images.length === 0) return;
    setUploading(true);
    setError(undefined);

    try {
      const signatureResponse = await fetch("/api/cloudinary/sign?scope=portfolio");
      if (!signatureResponse.ok) throw new Error("No se pudo preparar la subida.");
      const signature = (await signatureResponse.json()) as UploadSignature;

      const uploaded: { imageUrl: string; publicId: string; description: string }[] = [];
      for (let index = 0; index < images.length; index += 5) {
        const batch = images.slice(index, index + 5);
        const results = await Promise.all(batch.map(async (image) => {
          const body = new FormData();
          body.append("file", image.file);
          body.append("api_key", signature.apiKey);
          body.append("timestamp", String(signature.timestamp));
          body.append("folder", signature.folder);
          body.append("signature", signature.signature);

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
            { method: "POST", body },
          );
          if (!response.ok) throw new Error("Cloudinary rechazó una de las imágenes.");
          const result = (await response.json()) as { secure_url: string; public_id: string };
          return { imageUrl: result.secure_url, publicId: result.public_id, description: image.description };
        }));
        uploaded.push(...results);
      }

      const result = await createPortfolioItemsAction(uploaded);
      if (!result.success) throw new Error(result.error);
      router.push("/admin/portfolio?created=1");
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudieron subir las imágenes.");
      setUploading(false);
    }
  }

  return (
    <section className="admin-panel portfolio-upload-panel">
      <div className="upload-heading">
        <div><strong>Subir trabajos</strong><p>Sin límite de cantidad · Máximo 10 MB por imagen</p></div>
        <label className={`admin-button admin-button-secondary ${!enabled ? "disabled-button" : ""}`}>
          Elegir imágenes
          <input accept="image/jpeg,image/png,image/webp" disabled={!enabled} hidden multiple onChange={(event) => chooseFiles(event.target.files)} type="file" />
        </label>
      </div>
      {!enabled && (
        <p className="admin-notice admin-notice-warning">
          Completá las variables <code>CLOUDINARY_CLOUD_NAME</code>, <code>CLOUDINARY_API_KEY</code> y <code>CLOUDINARY_API_SECRET</code> para habilitar nuevas subidas.
        </p>
      )}
      {images.length > 0 && (
        <div className="pending-images">
          {images.map((image) => (
            <article className="pending-image" key={image.id}>
              <div className="pending-preview"><Image alt="Vista previa" fill sizes="160px" src={image.previewUrl} unoptimized /></div>
              <div className="form-field">
                <label htmlFor={`description-${image.id}`}>Descripción <span>Opcional</span></label>
                <input
                  id={`description-${image.id}`}
                  maxLength={200}
                  onChange={(event) => setImages((current) => current.map((item) => item.id === image.id ? { ...item, description: event.target.value } : item))}
                  placeholder="Ej: French almendrada"
                  value={image.description}
                />
              </div>
              <button className="remove-pending" onClick={() => removeImage(image.id)} type="button">Quitar</button>
            </article>
          ))}
          <div className="upload-footer">
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="admin-button admin-button-primary" disabled={uploading} onClick={upload} type="button">
              {uploading ? "Subiendo…" : `Subir ${images.length} ${images.length === 1 ? "imagen" : "imágenes"}`}
            </button>
          </div>
        </div>
      )}
      {images.length === 0 && error && <p className="form-error" role="alert">{error}</p>}
    </section>
  );
}
