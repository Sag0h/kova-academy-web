import { z } from "zod";

const settingsSchema = z.object({
  nombreNegocio: z.string().trim().min(2, "Ingresá el nombre del negocio.").max(100, "El nombre no puede superar los 100 caracteres."),
  descripcion: z.string().trim().max(500, "La descripción no puede superar los 500 caracteres."),
  whatsappNumero: z.string().transform((value) => value.replace(/\D/g, "")).pipe(
    z.string().min(8, "Ingresá un número de WhatsApp válido.").max(15, "El número no puede superar los 15 dígitos."),
  ),
  tiktokUrl: z.string().trim().max(300, "El enlace de TikTok es demasiado largo."),
});

export type SettingsInput = Omit<z.infer<typeof settingsSchema>, "tiktokUrl"> & { tiktokUrl: string | null };
export type SettingsFieldErrors = Partial<Record<keyof SettingsInput, string[]>>;

export type SettingsValidationResult =
  | { success: true; data: SettingsInput }
  | { success: false; errors: SettingsFieldErrors };

export function validateSettingsInput(values: Record<string, FormDataEntryValue | null>): SettingsValidationResult {
  const parsed = settingsSchema.safeParse(values);
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  let tiktokUrl: string | null = null;
  if (parsed.data.tiktokUrl) {
    const candidate = parsed.data.tiktokUrl.startsWith("@")
      ? `https://www.tiktok.com/${parsed.data.tiktokUrl}`
      : parsed.data.tiktokUrl;
    try {
      const url = new URL(candidate);
      if (url.protocol !== "https:" || !/(^|\.)tiktok\.com$/i.test(url.hostname)) {
        return { success: false, errors: { tiktokUrl: ["Ingresá un perfil válido de TikTok."] } };
      }
      tiktokUrl = url.toString();
    } catch {
      return { success: false, errors: { tiktokUrl: ["Ingresá un perfil válido de TikTok."] } };
    }
  }

  return { success: true, data: { ...parsed.data, tiktokUrl } };
}
