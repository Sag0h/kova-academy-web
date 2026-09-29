-- CreateEnum
CREATE TYPE "TipoPrecio" AS ENUM ('fijo', 'desde', 'cotizacion');

-- CreateEnum
CREATE TYPE "EstadoSlot" AS ENUM ('disponible', 'ocupado');

-- CreateTable
CREATE TABLE "Servicio" (
    "id" TEXT NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(500) NOT NULL,
    "tipoPrecio" "TipoPrecio" NOT NULL,
    "precio" DECIMAL(12,2),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicioFoto" (
    "id" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "imagenUrl" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServicioFoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" TEXT NOT NULL,
    "inicio" TIMESTAMPTZ(3) NOT NULL,
    "fin" TIMESTAMPTZ(3) NOT NULL,
    "servicioId" TEXT,
    "estado" "EstadoSlot" NOT NULL DEFAULT 'disponible',
    "notas" VARCHAR(500),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trabajo" (
    "id" TEXT NOT NULL,
    "imagenUrl" TEXT NOT NULL,
    "descripcion" VARCHAR(200),
    "orden" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "whatsappNumero" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracion" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "whatsappNumero" VARCHAR(20) NOT NULL,
    "nombreNegocio" VARCHAR(100) NOT NULL DEFAULT 'Kova Academy',
    "descripcion" VARCHAR(500),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Servicio_activo_orden_idx" ON "Servicio"("activo", "orden");

-- CreateIndex
CREATE INDEX "ServicioFoto_servicioId_orden_idx" ON "ServicioFoto"("servicioId", "orden");

-- CreateIndex
CREATE INDEX "Slot_estado_inicio_idx" ON "Slot"("estado", "inicio");

-- CreateIndex
CREATE INDEX "Slot_servicioId_idx" ON "Slot"("servicioId");

-- CreateIndex
CREATE INDEX "Trabajo_orden_idx" ON "Trabajo"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "ServicioFoto" ADD CONSTRAINT "ServicioFoto_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
