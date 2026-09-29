import { describe, expect, it } from "vitest";
import { validateSettingsInput } from "./settings-validation";

describe("validación de configuración", () => {
  it("normaliza el número de WhatsApp", () => {
    expect(validateSettingsInput({
      nombreNegocio: "Kova Academy",
      descripcion: "Manicuría personalizada",
      whatsappNumero: "+54 9 341 234-5678",
      tiktokUrl: "@kovaacademy",
    })).toMatchObject({
      success: true,
      data: { whatsappNumero: "5493412345678", tiktokUrl: "https://www.tiktok.com/@kovaacademy" },
    });
  });

  it("rechaza números demasiado cortos", () => {
    expect(validateSettingsInput({
      nombreNegocio: "Kova Academy",
      descripcion: "",
      whatsappNumero: "123",
      tiktokUrl: "",
    })).toMatchObject({ success: false, errors: { whatsappNumero: expect.any(Array) } });
  });

  it("rechaza enlaces que no pertenecen a TikTok", () => {
    expect(validateSettingsInput({
      nombreNegocio: "Kova Academy",
      descripcion: "",
      whatsappNumero: "5493412345678",
      tiktokUrl: "https://example.com/kova",
    })).toMatchObject({ success: false, errors: { tiktokUrl: expect.any(Array) } });
  });
});
