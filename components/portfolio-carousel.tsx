"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { PortfolioItem } from "@/lib/domain";

export function PortfolioCarousel({ items }: { items: PortfolioItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(items.length > 1);

  function updateControls() {
    const track = trackRef.current;
    if (!track) return;
    setCanGoBack(track.scrollLeft > 8);
    setCanGoForward(track.scrollLeft + track.clientWidth < track.scrollWidth - 8);
  }

  function move(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.max(track.clientWidth * 0.72, 280), behavior: "smooth" });
  }

  if (items.length === 0) {
    return <p className="portfolio-empty">Pronto vas a encontrar nuevos trabajos acá.</p>;
  }

  return (
    <div className="portfolio-carousel">
      <div className="portfolio-controls" aria-label="Controles del portfolio">
        <span>{items.length} {items.length === 1 ? "trabajo" : "trabajos"}</span>
        <button aria-label="Ver trabajos anteriores" disabled={!canGoBack} onClick={() => move(-1)} type="button">←</button>
        <button aria-label="Ver más trabajos" disabled={!canGoForward} onClick={() => move(1)} type="button">→</button>
      </div>
      <div className="portfolio-track" onScroll={updateControls} ref={trackRef} tabIndex={0}>
        {items.map((item, index) => (
          <figure className={`portfolio-slide art-${item.accent}`} key={item.id}>
            {item.imageUrl?.startsWith("https://") ? (
              <Image
                alt={item.description}
                className="portfolio-photo"
                fill
                priority={index < 2}
                sizes="(max-width: 640px) 84vw, (max-width: 1100px) 52vw, 430px"
                src={item.imageUrl}
              />
            ) : (
              <div className="portfolio-detail"><span /><span /><span /></div>
            )}
            <figcaption>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.description}
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="portfolio-hint">Deslizá para recorrer el portfolio</p>
    </div>
  );
}
