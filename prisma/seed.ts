import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no está configurada.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const serviceSeeds = [
  {
    id: "servicio-builder-gel",
    nombre: "Capping con Builder Gel",
    descripcion:
      "Refuerzo sobre la uña natural para sumar resistencia, nivelación y un acabado impecable.",
    tipoPrecio: "fijo" as const,
    precio: 22000,
    orden: 1,
  },
  {
    id: "servicio-nivelacion",
    nombre: "Nivelación",
    descripcion:
      "Base rubber y esmaltado semipermanente para una superficie pareja, prolija y duradera.",
    tipoPrecio: "fijo" as const,
    precio: 21000,
    orden: 2,
  },
  {
    id: "servicio-soft-gel",
    nombre: "Soft Gel",
    descripcion:
      "Extensión liviana con tips de gel. El largo, la forma y el diseño se adaptan a vos.",
    tipoPrecio: "desde" as const,
    precio: 24000,
    orden: 3,
  },
  {
    id: "servicio-nail-art",
    nombre: "Nail Art",
    descripcion:
      "Diseños personalizados, desde detalles sutiles hasta composiciones más elaboradas.",
    tipoPrecio: "cotizacion" as const,
    precio: null,
    orden: 4,
  },
];

function upcomingDate(daysFromNow: number, hour: number, minute = 0) {
  const argentinaNow = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Argentina/Buenos_Aires",
    }),
  );
  argentinaNow.setDate(argentinaNow.getDate() + daysFromNow);

  const year = argentinaNow.getFullYear();
  const month = String(argentinaNow.getMonth() + 1).padStart(2, "0");
  const day = String(argentinaNow.getDate()).padStart(2, "0");
  const localHour = String(hour).padStart(2, "0");
  const localMinute = String(minute).padStart(2, "0");

  return new Date(`${year}-${month}-${day}T${localHour}:${localMinute}:00-03:00`);
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL y ADMIN_PASSWORD son obligatorios para ejecutar el seed.");
  }

  const passwordHash = await hash(adminPassword, 12);

  await prisma.usuario.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: {
      passwordHash,
      nombre: "Alai",
      whatsappNumero: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5493412345678",
    },
    create: {
      email: adminEmail.toLowerCase(),
      passwordHash,
      nombre: "Alai",
      whatsappNumero: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5493412345678",
    },
  });

  await prisma.configuracion.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      whatsappNumero: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5493412345678",
      nombreNegocio: "Kova Academy",
      descripcion: "Manicuría y nail art con atención personalizada.",
    },
  });

  for (const service of serviceSeeds) {
    await prisma.servicio.upsert({
      where: { id: service.id },
      update: service,
      create: service,
    });
  }

  const slots = [
    {
      id: "slot-demo-soft-gel",
      inicio: upcomingDate(5, 15),
      fin: upcomingDate(5, 17),
      servicioId: "servicio-soft-gel",
    },
    {
      id: "slot-demo-generico",
      inicio: upcomingDate(5, 17, 30),
      fin: upcomingDate(5, 19),
      servicioId: null,
    },
    {
      id: "slot-demo-builder-gel",
      inicio: upcomingDate(7, 10),
      fin: upcomingDate(7, 12),
      servicioId: "servicio-builder-gel",
    },
  ];

  for (const slot of slots) {
    await prisma.slot.upsert({
      where: { id: slot.id },
      update: slot,
      create: slot,
    });
  }

  const works = [
    "French almendrada",
    "Nail art orgánico",
    "Soft gel nude",
    "Detalles dorados",
    "Borgoña clásico",
    "Mix & match",
  ];

  for (const [index, description] of works.entries()) {
    await prisma.trabajo.upsert({
      where: { id: `trabajo-demo-${index + 1}` },
      update: { descripcion: description, orden: index + 1 },
      create: {
        id: `trabajo-demo-${index + 1}`,
        imagenUrl: `/portfolio/demo-${index + 1}.webp`,
        descripcion: description,
        orden: index + 1,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
