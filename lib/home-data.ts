import { prisma } from "@/lib/prisma";
import type { AvailableSlot, PortfolioItem, Service } from "@/lib/domain";

const TIME_ZONE = "America/Argentina/Buenos_Aires";
const serviceAccents = ["rose", "pearl", "wine", "gold"];
const portfolioShapes: PortfolioItem["shape"][] = ["tall", "square", "wide"];

function datePart(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TIME_ZONE,
  }).format(date);
}

function timePart(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIME_ZONE,
  }).format(date);
}

export async function getHomeData() {
  const [databaseServices, databaseSlots, databasePortfolio, configuration] =
    await Promise.all([
      prisma.servicio.findMany({
        where: { activo: true },
        include: { fotos: { orderBy: [{ orden: "asc" }, { createdAt: "asc" }] } },
        orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
      }),
      prisma.slot.findMany({
        where: {
          estado: "disponible",
          inicio: { gt: new Date() },
        },
        include: { servicio: { select: { nombre: true } } },
        orderBy: { inicio: "asc" },
      }),
      prisma.trabajo.findMany({
        orderBy: [{ orden: "asc" }, { creadoEn: "desc" }],
      }),
      prisma.configuracion.findUnique({ where: { id: "singleton" } }),
    ]);

  const services: Service[] = databaseServices.map((service, index) => ({
    id: service.id,
    name: service.nombre,
    description: service.descripcion,
    priceType: service.tipoPrecio,
    price: service.precio ? Number(service.precio) : undefined,
    accent: serviceAccents[index % serviceAccents.length],
    photos: service.fotos.map((photo) => ({ id: photo.id, url: photo.imagenUrl })),
  }));

  const availableSlots: AvailableSlot[] = databaseSlots.map((slot) => ({
    id: slot.id,
    date: datePart(slot.inicio),
    startTime: timePart(slot.inicio),
    endTime: timePart(slot.fin),
    service: slot.servicio?.nombre,
  }));

  const portfolio: PortfolioItem[] = databasePortfolio.map((item, index) => ({
    id: item.id,
    description: item.descripcion ?? "Trabajo realizado en Kova Academy",
    imageUrl: item.imagenUrl,
    accent: serviceAccents[index % serviceAccents.length],
    shape: portfolioShapes[index % portfolioShapes.length],
  }));

  return {
    services,
    availableSlots,
    portfolio,
    businessName: configuration?.nombreNegocio ?? "Kova Academy",
    businessDescription:
      configuration?.descripcion ??
      "Diseños pensados para vos, con técnica, cuidado y una atención tranquila y personalizada.",
    heroImageUrl: configuration?.heroImagenUrl ?? null,
    tiktokUrl: configuration?.tiktokUrl ?? null,
    whatsappNumber:
      configuration?.whatsappNumero ??
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
      "5493412345678",
  };
}
