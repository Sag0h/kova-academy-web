import { z } from "zod";

const slotFieldsSchema = z.object({
  inicio: z.string().min(1, "Elegí una fecha y hora de inicio."),
  fin: z.string().optional(),
  servicioId: z.string(),
  notas: z.string().max(500, "Las notas no pueden superar los 500 caracteres."),
});

export interface SlotInput {
  inicio: Date;
  fin: Date;
  servicioId: string | null;
  notas: string | null;
}

export type SlotFieldErrors = Partial<Record<"inicio" | "fin" | "servicioId" | "notas", string[]>>;

export type SlotValidationResult =
  | { success: true; data: SlotInput }
  | { success: false; errors: SlotFieldErrors };

function argentinaDateTime(value: string): Date {
  return new Date(`${value}:00-03:00`);
}

export function validateSlotInput(
  values: Record<string, FormDataEntryValue | null>,
  now = new Date(),
): SlotValidationResult {
  const parsed = slotFieldsSchema.safeParse({
    inicio: values.inicio,
    fin: values.fin,
    servicioId: values.servicioId ?? "",
    notas: values.notas ?? "",
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const inicio = argentinaDateTime(parsed.data.inicio);
  const fin = parsed.data.fin
    ? argentinaDateTime(parsed.data.fin)
    : new Date(inicio.getTime() + 2 * 60 * 60 * 1000);
  const errors: SlotFieldErrors = {};

  if (Number.isNaN(inicio.getTime())) errors.inicio = ["La fecha de inicio no es válida."];
  if (Number.isNaN(fin.getTime())) errors.fin = ["El horario interno calculado no es válido."];
  if (!errors.inicio && inicio <= now) errors.inicio = ["El turno debe comenzar en el futuro."];
  if (!errors.inicio && !errors.fin && fin <= inicio) {
    errors.fin = ["La finalización debe ser posterior al inicio."];
  }

  if (Object.keys(errors).length > 0) return { success: false, errors };

  return {
    success: true,
    data: {
      inicio,
      fin,
      servicioId: parsed.data.servicioId || null,
      notas: parsed.data.notas.trim() || null,
    },
  };
}
