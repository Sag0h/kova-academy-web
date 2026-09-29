import type { AvailableSlot } from "./domain";

const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

export function sanitizeWhatsAppNumber(number: string): string {
  return number.replace(/\D/g, "");
}

export function buildWhatsAppUrl(number: string, message: string): string {
  const normalizedNumber = sanitizeWhatsAppNumber(number);

  if (!normalizedNumber) {
    throw new Error("El número de WhatsApp no puede estar vacío.");
  }

  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}

function formatSlotDate(date: string): string {
  const parsedDate = new Date(`${date}T12:00:00-03:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("La fecha del turno no es válida.");
  }

  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: ARGENTINA_TIME_ZONE,
  }).format(parsedDate);
}

export function buildSlotMessage(slot: AvailableSlot): string {
  const serviceText = slot.service ? ` para ${slot.service}` : "";

  return `Hola Alai! Me interesa el turno del ${formatSlotDate(slot.date)} a las ${slot.startTime}hs${serviceText}. ¿Está disponible?`;
}

export function buildQuoteMessage(serviceName: string): string {
  return `Hola Alai! Me gustaría cotizar ${serviceName}. ¿Me podés dar más info?`;
}

export const GENERAL_MESSAGE = "Hola Alai! Te escribo desde tu página web.";
