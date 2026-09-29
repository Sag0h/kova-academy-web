"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ServiceActionState } from "@/lib/action-state";
import { destroyCloudinaryImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";
import { validateServiceInput } from "@/lib/service-validation";

function readServiceForm(formData: FormData) {
  return validateServiceInput({
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion"),
    tipoPrecio: formData.get("tipoPrecio"),
    precio: formData.get("precio"),
    orden: formData.get("orden"),
    activo: formData.get("activo") === "on",
  });
}

export async function createServiceAction(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  await requireAdminSession();
  const validation = readServiceForm(formData);
  if (!validation.success) return { errors: validation.errors };

  const occupiedOrder = await prisma.servicio.findFirst({ where: { orden: validation.data.orden }, select: { id: true } });
  if (occupiedOrder) return { errors: { orden: ["Ese orden ya está asignado a otro servicio."] } };

  await prisma.servicio.create({ data: validation.data });
  revalidatePath("/");
  revalidatePath("/admin/servicios");
  redirect("/admin/servicios?created=1");
}

export async function updateServiceAction(
  id: string,
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  await requireAdminSession();
  const validation = readServiceForm(formData);
  if (!validation.success) return { errors: validation.errors };

  const service = await prisma.servicio.findUnique({ where: { id }, select: { id: true } });
  if (!service) return { message: "El servicio ya no existe." };

  const occupiedOrder = await prisma.servicio.findFirst({
    where: { orden: validation.data.orden, id: { not: id } },
    select: { id: true },
  });
  if (occupiedOrder) return { errors: { orden: ["Ese orden ya está asignado a otro servicio."] } };

  await prisma.servicio.update({ where: { id }, data: validation.data });
  revalidatePath("/");
  revalidatePath("/admin/servicios");
  redirect("/admin/servicios?updated=1");
}

export async function toggleServiceAction(id: string, activo: boolean) {
  await requireAdminSession();
  await prisma.servicio.update({ where: { id }, data: { activo } });
  revalidatePath("/");
  revalidatePath("/admin/servicios");
}

export async function deleteServiceAction(id: string) {
  await requireAdminSession();
  const futureSlots = await prisma.slot.count({
    where: {
      servicioId: id,
      estado: "disponible",
      inicio: { gt: new Date() },
    },
  });

  if (futureSlots > 0) redirect("/admin/servicios?error=active-slots");

  const service = await prisma.servicio.findUnique({
    where: { id },
    include: { fotos: { select: { imagenPublicId: true } } },
  });
  if (!service) return;

  try {
    await Promise.all(
      service.fotos
        .flatMap((photo) => photo.imagenPublicId ? [photo.imagenPublicId] : [])
        .map((publicId) => destroyCloudinaryImage(publicId)),
    );
  } catch {
    redirect("/admin/servicios?error=cloudinary-delete");
  }

  await prisma.servicio.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/servicios");
}

const uploadedPhotosSchema = z.array(z.object({
  imageUrl: z.url(),
  publicId: z.string().min(1).max(255),
})).min(1).max(10);

export async function createServicePhotosAction(serviceId: string, photos: unknown) {
  await requireAdminSession();
  const parsed = uploadedPhotosSchema.safeParse(photos);
  if (!parsed.success) return { success: false, error: "Los datos de las imágenes no son válidos." };

  const service = await prisma.servicio.findUnique({ where: { id: serviceId }, select: { id: true } });
  if (!service) return { success: false, error: "El servicio ya no existe." };

  const last = await prisma.servicioFoto.aggregate({
    where: { servicioId: serviceId },
    _max: { orden: true },
  });
  const firstOrder = (last._max.orden ?? 0) + 1;
  await prisma.servicioFoto.createMany({
    data: parsed.data.map((photo, index) => ({
      servicioId: serviceId,
      imagenUrl: photo.imageUrl,
      imagenPublicId: photo.publicId,
      orden: firstOrder + index,
    })),
  });
  revalidatePath("/");
  revalidatePath(`/admin/servicios/${serviceId}/editar`);
  return { success: true };
}

export async function deleteServicePhotoAction(photoId: string) {
  await requireAdminSession();
  const photo = await prisma.servicioFoto.findUnique({ where: { id: photoId } });
  if (!photo) return;

  if (photo.imagenPublicId) {
    try {
      await destroyCloudinaryImage(photo.imagenPublicId);
    } catch {
      redirect(`/admin/servicios/${photo.servicioId}/editar?error=cloudinary-delete`);
    }
  }
  await prisma.servicioFoto.delete({ where: { id: photo.id } });
  revalidatePath("/");
  revalidatePath(`/admin/servicios/${photo.servicioId}/editar`);
}

export async function moveServicePhotoAction(photoId: string, direction: "up" | "down") {
  await requireAdminSession();
  const photo = await prisma.servicioFoto.findUnique({ where: { id: photoId } });
  if (!photo) return;
  const photos = await prisma.servicioFoto.findMany({
    where: { servicioId: photo.servicioId },
    orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
    select: { id: true, orden: true },
  });
  const index = photos.findIndex((item) => item.id === photoId);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= photos.length) return;
  const current = photos[index];
  const target = photos[targetIndex];
  const temporaryOrder = Math.max(...photos.map((item) => item.orden), 0) + 1000;

  await prisma.$transaction([
    prisma.servicioFoto.update({ where: { id: current.id }, data: { orden: temporaryOrder } }),
    prisma.servicioFoto.update({ where: { id: target.id }, data: { orden: current.orden } }),
    prisma.servicioFoto.update({ where: { id: current.id }, data: { orden: target.orden } }),
  ]);
  revalidatePath("/");
  revalidatePath(`/admin/servicios/${photo.servicioId}/editar`);
}
