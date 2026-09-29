import { describe, expect, it } from "vitest";
import {
  buildQuoteMessage,
  buildSlotMessage,
  buildWhatsAppUrl,
  sanitizeWhatsAppNumber,
} from "./whatsapp";

describe("WhatsApp deeplinks", () => {
  it("normaliza el número y codifica el mensaje", () => {
    const url = buildWhatsAppUrl("+54 9 341 234-5678", "Hola Alai!");

    expect(url).toBe("https://wa.me/5493412345678?text=Hola%20Alai!");
  });

  it("rechaza un número vacío", () => {
    expect(() => buildWhatsAppUrl("---", "Hola")).toThrow(
      "El número de WhatsApp no puede estar vacío.",
    );
  });

  it("genera el mensaje de un turno con servicio", () => {
    expect(
      buildSlotMessage({
        id: "slot-1",
        date: "2026-10-05",
        startTime: "15:00",
        endTime: "17:00",
        service: "Soft Gel",
      }),
    ).toBe(
      "Hola Alai! Me interesa el turno del lunes, 5 de octubre a las 15:00hs para Soft Gel. ¿Está disponible?",
    );
  });

  it("omite el servicio en un turno genérico", () => {
    const message = buildSlotMessage({
      id: "slot-2",
      date: "2026-10-05",
      startTime: "17:30",
      endTime: "19:00",
    });

    expect(message).not.toContain(" para ");
    expect(message).toContain("17:30hs");
  });

  it("genera la consulta de cotización", () => {
    expect(buildQuoteMessage("Nail Art")).toBe(
      "Hola Alai! Me gustaría cotizar Nail Art. ¿Me podés dar más info?",
    );
  });

  it("expone la normalización como regla de dominio", () => {
    expect(sanitizeWhatsAppNumber("+54 (9) 341 234-5678")).toBe("5493412345678");
  });
});
