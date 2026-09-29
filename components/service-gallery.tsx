"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface ServiceGalleryProps {
  accent: string;
  index: number;
  name: string;
  photos: { id: string; url: string }[];
}

export function ServiceGallery({ accent, index, name, photos }: ServiceGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!lightbox) return;
    function close(event: KeyboardEvent) {
      if (event.key === "Escape") setLightbox(false);
    }
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [lightbox]);

  if (photos.length === 0) {
    return (
      <div className={`service-art art-${accent}`}>
        <span>0{index + 1}</span>
        <div className="polish-stroke" />
      </div>
    );
  }

  function previous() {
    setActive((current) => (current - 1 + photos.length) % photos.length);
  }

  function next() {
    setActive((current) => (current + 1) % photos.length);
  }

  return (
    <>
      <div className="service-gallery">
        <button aria-label={`Ampliar foto de ${name}`} className="service-gallery-image" onClick={() => setLightbox(true)} type="button">
          <Image alt={`${name}, ejemplo ${active + 1}`} fill sizes="(max-width: 640px) 100vw, 30vw" src={photos[active].url} />
        </button>
        {photos.length > 1 && (
          <>
            <button aria-label="Foto anterior" className="gallery-arrow gallery-previous" onClick={previous} type="button">‹</button>
            <button aria-label="Foto siguiente" className="gallery-arrow gallery-next" onClick={next} type="button">›</button>
            <div className="gallery-dots">
              {photos.map((photo, photoIndex) => (
                <button aria-label={`Ver foto ${photoIndex + 1}`} className={photoIndex === active ? "active" : ""} key={photo.id} onClick={() => setActive(photoIndex)} type="button" />
              ))}
            </div>
          </>
        )}
      </div>
      {lightbox && (
        <div aria-label={`Galería ampliada de ${name}`} aria-modal="true" className="lightbox" role="dialog">
          <button aria-label="Cerrar" className="lightbox-close" onClick={() => setLightbox(false)} type="button">×</button>
          <div className="lightbox-image"><Image alt={`${name}, ejemplo ${active + 1}`} fill sizes="90vw" src={photos[active].url} /></div>
          {photos.length > 1 && (
            <div className="lightbox-controls">
              <button onClick={previous} type="button">← Anterior</button>
              <span>{active + 1} / {photos.length}</span>
              <button onClick={next} type="button">Siguiente →</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
