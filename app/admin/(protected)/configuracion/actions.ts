"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { SettingsActionState } from "@/lib/action-state";
import { destroyCloudinaryImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";
import { validateSettingsInput } from "@/lib/settings-validation";

export async function updateSettingsAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await requireAdminSession();
  const validation = validateSettingsInput({
    nombreNegocio: formData.get("nombreNegocio"),
    descripcion: formData.get("descripcion"),
    whatsappNumero: formData.get("whatsappNumero"),
    tiktokUrl: formData.get("tiktokUrl"),
  });

  if (!validation.success) return { errors: validation.errors };

  await prisma.configuracion.upsert({
    where: { id: "singleton" },
    update: validation.data,
    create: { id: "singleton", ...validation.data },
  });

  revalidatePath("/");
  revalidatePath("/admin/configuracion");
  redirect("/admin/configuracion?saved=1");
}

const heroImageSchema = z.object({
  imageUrl: z.url(),
  publicId: z.string().min(1).max(255),
});

export async function updateHeroImageAction(value: unknown) {
  await requireAdminSession();
  const parsed = heroImageSchema.safeParse(value);
  if (!parsed.success) return { success: false, error: "Los datos de la imagen no son válidos." };

  const settings = await prisma.configuracion.findUnique({ where: { id: "singleton" } });
  if (!settings) return { success: false, error: "Guardá primero la configuración general." };

  await prisma.configuracion.update({
    where: { id: "singleton" },
    data: { heroImagenUrl: parsed.data.imageUrl, heroImagenPublicId: parsed.data.publicId },
  });

  if (settings.heroImagenPublicId && settings.heroImagenPublicId !== parsed.data.publicId) {
    try {
      await destroyCloudinaryImage(settings.heroImagenPublicId);
    } catch {
      // The new image is already active; an orphaned previous asset must not undo the replacement.
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/configuracion");
  return { success: true };
}

export async function deleteHeroImageAction() {
  await requireAdminSession();
  const settings = await prisma.configuracion.findUnique({ where: { id: "singleton" } });
  if (!settings) return { success: false, error: "La configuración no existe." };

  if (settings.heroImagenPublicId) {
    try {
      await destroyCloudinaryImage(settings.heroImagenPublicId);
    } catch {
      return { success: false, error: "No se pudo eliminar la imagen de Cloudinary." };
    }
  }

  await prisma.configuracion.update({
    where: { id: "singleton" },
    data: { heroImagenUrl: null, heroImagenPublicId: null },
  });
  revalidatePath("/");
  revalidatePath("/admin/configuracion");
  return { success: true };
}
