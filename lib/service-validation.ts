import { z } from "zod";

const priceTypes = ["fijo", "desde", "cotizacion"] as const;

const serviceSchema = z.object({
  nombre: z.string().trim().min(1, "Ingresá el nombre del servicio.").max(100, "El nombre no puede superar los 100 caracteres."),
  descripcion: z.string().trim().min(1, "Ingresá una descripción.").max(500, "La descripción no puede superar los 500 caracteres."),
  tipoPrecio: z.enum(priceTypes, { error: "Elegí un tipo de precio válido." }),
  precio: z.string(),
  orden: z.coerce.number().int("El orden debe ser un número entero.").min(0, "El orden no puede ser negativo.").max(999),
  activo: z.boolean(),
});

export type ServiceInput = {
  nombre: string;
  descripcion: string;
  tipoPrecio: (typeof priceTypes)[number];
  precio: number | null;
  orden: number;
  activo: boolean;
};

export type ServiceValidationResult =
  | { success: true; data: ServiceInput }
  | { success: false; errors: Partial<Record<"nombre" | "descripcion" | "tipoPrecio" | "precio" | "orden", string[]>> };

export function validateServiceInput(values: Record<string, FormDataEntryValue | boolean | null>): ServiceValidationResult {
  const parsed = serviceSchema.safeParse(values);
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  let precio: number | null = null;
  if (parsed.data.tipoPrecio !== "cotizacion") {
    precio = Number(parsed.data.precio);
    if (!parsed.data.precio || !Number.isFinite(precio) || precio <= 0) {
      return { success: false, errors: { precio: ["Ingresá un precio mayor a cero."] } };
    }
  }

  return {
    success: true,
    data: { ...parsed.data, precio },
  };
}
