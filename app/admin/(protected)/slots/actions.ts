"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SlotActionState } from "@/lib/action-state";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";
import { validateSlotInput } from "@/lib/slot-validation";

async function validateForm(formData: FormData): Promise<SlotActionState | ReturnType<typeof validData>> {
  const validation = validateSlotInput({
    inicio: formData.get("inicio"),
    servicioId: formData.get("servicioId"),
    notas: formData.get("notas"),
  });

  if (!validation.success) return { errors: validation.errors };

  if (validation.data.servicioId) {
    const serviceExists = await prisma.servicio.findUnique({
      where: { id: validation.data.servicioId },
      select: { id: true },
    });
    if (!serviceExists) return { errors: { servicioId: ["El servicio seleccionado no existe."] } };
  }

  return validData(validation.data);
}

function validData(data: {
  inicio: Date;
  fin: Date;
  servicioId: string | null;
  notas: string | null;
}) {
  return { valid: true as const, data };
}

export async function createSlotAction(
  _previousState: SlotActionState,
  formData: FormData,
): Promise<SlotActionState> {
  await requireAdminSession();
  const result = await validateForm(formData);
  if (!("valid" in result)) return result;

  await prisma.slot.create({ data: result.data });
  revalidatePath("/");
  revalidatePath("/admin/slots");
  redirect("/admin/slots?created=1");
}

export async function updateSlotAction(
  id: string,
  _previousState: SlotActionState,
  formData: FormData,
): Promise<SlotActionState> {
  await requireAdminSession();
  const result = await validateForm(formData);
  if (!("valid" in result)) return result;

  const slot = await prisma.slot.findUnique({ where: { id }, select: { id: true } });
  if (!slot) return { message: "El turno ya no existe." };

  await prisma.slot.update({ where: { id }, data: result.data });
  revalidatePath("/");
  revalidatePath("/admin/slots");
  redirect("/admin/slots?updated=1");
}

export async function setSlotStatusAction(id: string, estado: "disponible" | "ocupado") {
  await requireAdminSession();
  await prisma.slot.update({ where: { id }, data: { estado } });
  revalidatePath("/");
  revalidatePath("/admin/slots");
}

export async function deleteSlotAction(id: string) {
  await requireAdminSession();
  const slot = await prisma.slot.findUnique({ where: { id }, select: { estado: true } });
  if (!slot) return;
  if (slot.estado === "ocupado") redirect("/admin/slots?error=occupied");

  await prisma.slot.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/slots");
}
