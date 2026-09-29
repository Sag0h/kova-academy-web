import { describe, expect, it } from "vitest";
import { validateSlotInput } from "./slot-validation";

const now = new Date("2026-09-29T12:00:00-03:00");

describe("validación de turnos", () => {
  it("acepta un rango futuro y lo interpreta en horario argentino", () => {
    const result = validateSlotInput(
      { inicio: "2026-10-05T15:00", fin: "2026-10-05T17:00", servicioId: "", notas: "" },
      now,
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.inicio.toISOString()).toBe("2026-10-05T18:00:00.000Z");
      expect(result.data.servicioId).toBeNull();
    }
  });

  it("rechaza turnos pasados", () => {
    const result = validateSlotInput(
      { inicio: "2026-09-28T15:00", fin: "2026-09-28T17:00", servicioId: "", notas: "" },
      now,
    );

    expect(result).toMatchObject({ success: false, errors: { inicio: expect.any(Array) } });
  });

  it("rechaza una finalización anterior al inicio", () => {
    const result = validateSlotInput(
      { inicio: "2026-10-05T17:00", fin: "2026-10-05T15:00", servicioId: "", notas: "" },
      now,
    );

    expect(result).toMatchObject({ success: false, errors: { fin: expect.any(Array) } });
  });
});
