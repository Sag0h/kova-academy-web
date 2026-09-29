import { describe, expect, it } from "vitest";
import { validateServiceInput } from "./service-validation";

const base = {
  nombre: "Soft Gel",
  descripcion: "Extensión con tips de gel.",
  orden: "3",
  activo: true,
};

describe("validación de servicios", () => {
  it("acepta un precio desde positivo", () => {
    expect(validateServiceInput({ ...base, tipoPrecio: "desde", precio: "24000" })).toMatchObject({
      success: true,
      data: { precio: 24000, tipoPrecio: "desde" },
    });
  });

  it("no exige precio para una cotización", () => {
    expect(validateServiceInput({ ...base, tipoPrecio: "cotizacion", precio: "" })).toMatchObject({
      success: true,
      data: { precio: null },
    });
  });

  it("rechaza un servicio fijo sin precio", () => {
    expect(validateServiceInput({ ...base, tipoPrecio: "fijo", precio: "" })).toMatchObject({
      success: false,
      errors: { precio: expect.any(Array) },
    });
  });
});
