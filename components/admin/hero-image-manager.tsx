"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  deleteHeroImageAction,
  updateHeroImageAction,
} from "@/app/admin/(protected)/configuracion/actions";

interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxSize = 10 * 1024 * 1024;

export function HeroImageManager({ enabled, imageUrl }: { enabled: boolean; imageUrl: string | null }) {
  const router = useRouter();
  const [file, setFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [error, setError] = useState<string>();
  const [working, setWorking] = useState(false);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function chooseFile(selected: File | undefined) {
    if (!selected) return;
    if (!allowedTypes.has(selected.type) || selected.size > maxSize) {
      setError("Usá una imagen JPG, PNG o WEBP de hasta 10 MB.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setError(undefined);
  }

  async function upload() {
    if (!enabled || !file) return;
    setWorking(true);
    setError(undefined);
    try {
      const signatureResponse = await fetch("/api/cloudinary/sign?scope=branding");
      if (!signatureResponse.ok) throw new Error("No se pudo preparar la subida.");
      const signature = (await signatureResponse.json()) as UploadSignature;
      const body = new FormData();
      body.append("file", file);
      body.append("api_key", signature.apiKey);
      body.append("timestamp", String(signature.timestamp));
      body.append("folder", signature.folder);
      body.append("signature", signature.signature);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
        method: "POST",
        body,
      });
      if (!response.ok) throw new Error("Cloudinary rechazó la imagen.");
      const uploaded = (await response.json()) as { secure_url: string; public_id: string };
      const result = await updateHeroImageAction({ imageUrl: uploaded.secure_url, publicId: uploaded.public_id });
      if (!result.success) throw new Error(result.error);
      setFile(undefined);
      setPreviewUrl(undefined);
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir la imagen.");
    } finally {
      setWorking(false);
    }
  }

  async function remove() {
    if (!window.confirm("¿Quitar la imagen principal del sitio?")) return;
    setWorking(true);
    setError(undefined);
    const result = await deleteHeroImageAction();
    if (!result.success) setError(result.error);
    else router.refresh();
    setWorking(false);
  }

  const visibleImage = previewUrl ?? imageUrl;

  return (
    <section className="admin-panel hero-image-panel">
      <div className="upload-heading">
        <div>
          <strong>Imagen principal</strong>
          <p>Se muestra en el panel grande de la portada. Recomendado: foto vertical o cuadrada.</p>
        </div>
        <label className={`admin-button admin-button-secondary ${!enabled ? "disabled-button" : ""}`}>
          {imageUrl ? "Reemplazar imagen" : "Elegir imagen"}
          <input accept="image/jpeg,image/png,image/webp" disabled={!enabled || working} hidden onChange={(event) => chooseFile(event.target.files?.[0])} type="file" />
        </label>
      </div>
      {!enabled && <p className="admin-notice admin-notice-warning">Configurá Cloudinary para habilitar la imagen principal.</p>}
      {visibleImage && (
        <div className="hero-image-preview">
          <Image alt="Vista previa de la imagen principal" fill sizes="700px" src={visibleImage} unoptimized={Boolean(previewUrl)} />
        </div>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}
      {(file || imageUrl) && (
        <div className="hero-image-actions">
          {imageUrl && !file && <button className="admin-button admin-button-secondary" disabled={working} onClick={remove} type="button">Quitar imagen</button>}
          {file && <button className="admin-button admin-button-primary" disabled={working} onClick={upload} type="button">{working ? "Subiendo…" : "Publicar imagen"}</button>}
        </div>
      )}
    </section>
  );
}
