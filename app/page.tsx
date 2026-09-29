import { WhatsAppLink } from "@/components/whatsapp-link";
import Image from "next/image";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import brandLogo from "@/img/logo.png";
import tiktokIcon from "@/img/tiktokicon.png";
import whatsappIcon from "@/img/wsp.png";
import { PortfolioCarousel } from "@/components/portfolio-carousel";
import { ScrollAnimations } from "@/components/scroll-animations";
import { ServiceGallery } from "@/components/service-gallery";
import type { PriceType } from "@/lib/domain";
import { getHomeData } from "@/lib/home-data";
import { prisma } from "@/lib/prisma";
import {
  buildQuoteMessage,
  buildSlotMessage,
  GENERAL_MESSAGE,
} from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const configuration = await prisma.configuracion.findUnique({ where: { id: "singleton" } });
  const businessName = configuration?.nombreNegocio ?? "Kova Academy";
  return {
    title: `${businessName} | Manicuría y Nail Art`,
    description: configuration?.descripcion ?? "Servicios, trabajos y turnos disponibles.",
  };
}

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "America/Argentina/Buenos_Aires",
});

function priceLabel(priceType: PriceType, price?: number) {
  if (priceType === "cotizacion") return "A cotizar";
  const formattedPrice = currencyFormatter.format(price ?? 0);
  return priceType === "desde" ? `Desde ${formattedPrice}` : formattedPrice;
}

export default async function Home() {
  const {
    services,
    availableSlots,
    portfolio,
    businessName,
    businessDescription,
    heroImageUrl,
    tiktokUrl,
    whatsappNumber,
  } = await getHomeData();

  return (
    <main>
      <ScrollAnimations />
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Kova Academy, ir al inicio">
          <Image className="brand-logo" src={brandLogo} alt={businessName} priority />
        </a>
        <nav aria-label="Navegación principal">
          <a href="#servicios">Servicios</a>
          <a href="#trabajos">Trabajos</a>
          <a href="#turnos">Turnos</a>
        </nav>
        <WhatsAppLink className="header-cta" number={whatsappNumber} message={GENERAL_MESSAGE}>
          Hablemos
        </WhatsAppLink>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy" data-reveal>
          <p className="eyebrow">Manicuría · Nail art · Atención personalizada</p>
          <h1>El lujo de lo esencial.</h1>
          <p className="hero-description">
            {businessDescription}
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#turnos">Ver turnos disponibles</a>
            <a className="text-link" href="#trabajos">Conocé mi trabajo <span>↘</span></a>
          </div>
          <div className="hero-note">
            <span className="spark">✦</span>
            <span><strong>Atención personalizada</strong> · Tu turno es un momento para vos.</span>
          </div>
        </div>
        <div className={`hero-art ${heroImageUrl ? "has-photo" : ""}`} aria-label={heroImageUrl ? "Trabajo destacado de Kova Academy" : "Composición decorativa inspirada en nail art"} data-reveal>
          {heroImageUrl ? (
            <Image alt="Trabajo destacado de Kova Academy" className="hero-art-image" fill priority sizes="(max-width: 900px) 100vw, 50vw" src={heroImageUrl} />
          ) : (
            <div className="hero-arch">
              <span className="nail nail-one" />
              <span className="nail nail-two" />
              <span className="nail nail-three" />
              <span className="nail nail-four" />
              <span className="nail nail-five" />
            </div>
          )}
        </div>
      </section>

      <section className="section services-section" id="servicios">
        <div className="section-heading" data-reveal>
          <div>
            <p className="eyebrow">Elegí tu experiencia</p>
            <h2>Servicios</h2>
          </div>
          <p>Cada servicio incluye preparación, asesoramiento y terminación cuidada.</p>
        </div>
        <div className="services-grid">
          {services.map((service, index) => (
            <article className="service-card" data-reveal key={service.id} style={{ "--reveal-delay": `${Math.min(index, 3) * 70}ms` } as CSSProperties}>
              <ServiceGallery accent={service.accent} index={index} name={service.name} photos={service.photos} />
              <div className="service-content">
                <div className="service-title-row">
                  <h3>{service.name}</h3>
                  <span className="price">{priceLabel(service.priceType, service.price)}</span>
                </div>
                {service.priceType === "desde" && <span className="price-note">Precio final según diseño</span>}
                <p>{service.description}</p>
                {service.priceType === "cotizacion" ? (
                  <WhatsAppLink className="card-link" number={whatsappNumber} message={buildQuoteMessage(service.name)}>
                    Consultar por WhatsApp <span>↗</span>
                  </WhatsAppLink>
                ) : (
                  <a className="card-link" href="#turnos">Ver turnos disponibles <span>↓</span></a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section portfolio-section" id="trabajos">
        <div className="section-heading portfolio-heading" data-reveal>
          <div>
            <p className="eyebrow">Hecho con intención</p>
            <h2>Últimos trabajos</h2>
          </div>
          <p>Una selección de formas, texturas y colores creados en el estudio.</p>
        </div>
        <div data-reveal><PortfolioCarousel items={portfolio} /></div>
      </section>

      <section className="section slots-section" id="turnos">
        <div className="slots-intro" data-reveal>
          <p className="eyebrow">Tu próximo momento</p>
          <h2>Turnos disponibles</h2>
          <p>Elegí el horario que mejor te quede. Te llevo a WhatsApp para coordinar la seña y confirmar.</p>
        </div>
        <div
          aria-label={availableSlots.length > 4 ? "Lista desplazable de turnos disponibles" : undefined}
          className={`slots-list ${availableSlots.length > 4 ? "slots-list-scrollable" : ""}`}
          data-reveal
          tabIndex={availableSlots.length > 4 ? 0 : undefined}
        >
          {availableSlots.length === 0 ? (
            <div className="slots-empty">
              <p>Por ahora no tengo turnos publicados.</p>
              <WhatsAppLink
                className="button button-slot"
                number={whatsappNumber}
                message={GENERAL_MESSAGE}
              >
                Escribime y coordinamos <span>↗</span>
              </WhatsAppLink>
            </div>
          ) : availableSlots.map((slot) => (
            <article className="slot-card" key={slot.id}>
              <div className="slot-date">
                <span>{dateFormatter.format(new Date(`${slot.date}T12:00:00-03:00`))}</span>
                <strong>{slot.startTime}<small>hs</small></strong>
              </div>
              <div className="slot-meta">
                <span>{slot.service ?? "Cualquier servicio"}</span>
              </div>
              <WhatsAppLink className="button button-slot" number={whatsappNumber} message={buildSlotMessage(slot)}>
                Quiero este turno <span>↗</span>
              </WhatsAppLink>
            </article>
          ))}
        </div>
      </section>

      <footer data-reveal>
        <div className="brand footer-brand">
          <Image className="brand-logo brand-logo-footer" src={brandLogo} alt={businessName} />
        </div>
        <p>{businessDescription}</p>
        <WhatsAppLink className="text-link" number={whatsappNumber} message={GENERAL_MESSAGE}>Escribime por WhatsApp ↗</WhatsAppLink>
      </footer>

      <div className="social-floats">
        {tiktokUrl && (
          <a aria-label="Ver Kova Academy en TikTok" className="floating-social floating-tiktok" href={tiktokUrl} rel="noreferrer" target="_blank" title="TikTok">
            <Image aria-hidden="true" src={tiktokIcon} alt="" />
          </a>
        )}
        <WhatsAppLink
          aria-label="Escribime por WhatsApp"
          className="floating-social floating-whatsapp"
          number={whatsappNumber}
          message={GENERAL_MESSAGE}
          title="Escribime por WhatsApp"
        >
          <Image aria-hidden="true" src={whatsappIcon} alt="" />
        </WhatsAppLink>
      </div>
    </main>
  );
}
