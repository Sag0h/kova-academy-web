"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { destroyCloudinaryImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";

const uploadedItemsSchema = z.array(
  z.object({
    imageUrl: z.url(),
    publicId: z.string().min(1).max(255),
    description: z.string().trim().max(200),
  }),
).min(1);

export async function createPortfolioItemsAction(items: unknown) {
  await requireAdminSession();
  const parsed = uploadedItemsSchema.safeParse(items);
  if (!parsed.success) return { success: false, error: "Los datos de las imágenes no son válidos." };

  const last = await prisma.trabajo.aggregate({ _max: { orden: true } });
  const firstOrder = (last._max.orden ?? 0) + 1;

  await prisma.trabajo.createMany({
    data: parsed.data.map((item, index) => ({
      imagenUrl: item.imageUrl,
      imagenPublicId: item.publicId,
      descripcion: item.description || null,
      orden: firstOrder + index,
    })),
  });

  revalidatePath("/");
  revalidatePath("/admin/portfolio");
  return { success: true };
}

export async function updatePortfolioDescriptionAction(id: string, formData: FormData) {
  await requireAdminSession();
  const parsed = z.string().trim().max(200).safeParse(formData.get("descripcion"));
  if (!parsed.success) redirect("/admin/portfolio?error=description");

  await prisma.trabajo.update({
    where: { id },
    data: { descripcion: parsed.data || null },
  });
  revalidatePath("/");
  revalidatePath("/admin/portfolio");
}

export async function deletePortfolioItemAction(id: string) {
  await requireAdminSession();
  const item = await prisma.trabajo.findUnique({ where: { id } });
  if (!item) return;

  if (item.imagenPublicId) {
    try {
      await destroyCloudinaryImage(item.imagenPublicId);
    } catch {
      redirect("/admin/portfolio?error=cloudinary-delete");
    }
  }

  await prisma.trabajo.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/portfolio");
}

export async function movePortfolioItemAction(id: string, direction: "up" | "down") {
  await requireAdminSession();
  const items = await prisma.trabajo.findMany({
    orderBy: [{ orden: "asc" }, { creadoEn: "asc" }],
    select: { id: true, orden: true },
  });
  const index = items.findIndex((item) => item.id === id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= items.length) return;

  const current = items[index];
  const target = items[targetIndex];
  const temporaryOrder = Math.max(...items.map((item) => item.orden), 0) + 1000;

  await prisma.$transaction([
    prisma.trabajo.update({ where: { id: current.id }, data: { orden: temporaryOrder } }),
    prisma.trabajo.update({ where: { id: target.id }, data: { orden: current.orden } }),
    prisma.trabajo.update({ where: { id: current.id }, data: { orden: target.orden } }),
  ]);
  revalidatePath("/");
  revalidatePath("/admin/portfolio");
}
