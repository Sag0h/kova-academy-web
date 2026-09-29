"use client";

import { useActionState, useState } from "react";
import type { ServiceActionState } from "@/lib/action-state";
import type { PriceType } from "@/lib/domain";

interface ServiceFormProps {
  action: (state: ServiceActionState, formData: FormData) => Promise<ServiceActionState>;
  defaultOrder?: number;
  initialValues?: {
    nombre: string;
    descripcion: string;
    tipoPrecio: PriceType;
    precio: string;
    orden: number;
    activo: boolean;
  };
  submitLabel: string;
}

export function ServiceForm({ action, defaultOrder = 1, initialValues, submitLabel }: ServiceFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const [priceType, setPriceType] = useState<PriceType>(initialValues?.tipoPrecio ?? "fijo");

  return (
    <form action={formAction} className="admin-form service-form">
      <div className="form-field">
        <label htmlFor="nombre">Nombre</label>
        <input defaultValue={initialValues?.nombre} id="nombre" maxLength={100} name="nombre" required />
        {state.errors?.nombre?.map((error) => <small className="field-error" key={error}>{error}</small>)}
      </div>
      <div className="form-field">
        <label htmlFor="descripcion">Descripción</label>
        <textarea defaultValue={initialValues?.descripcion} id="descripcion" maxLength={500} name="descripcion" required rows={5} />
        {state.errors?.descripcion?.map((error) => <small className="field-error" key={error}>{error}</small>)}
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="tipoPrecio">Tipo de precio</label>
          <select
            defaultValue={priceType}
            id="tipoPrecio"
            name="tipoPrecio"
            onChange={(event) => setPriceType(event.target.value as PriceType)}
          >
            <option value="fijo">Precio fijo</option>
            <option value="desde">Desde</option>
            <option value="cotizacion">A cotizar</option>
          </select>
          {state.errors?.tipoPrecio?.map((error) => <small className="field-error" key={error}>{error}</small>)}
        </div>
        {priceType !== "cotizacion" && (
          <div className="form-field">
            <label htmlFor="precio">Precio en pesos</label>
            <input defaultValue={initialValues?.precio} id="precio" min="1" name="precio" step="1" type="number" required />
            {state.errors?.precio?.map((error) => <small className="field-error" key={error}>{error}</small>)}
          </div>
        )}
        {priceType === "cotizacion" && <input name="precio" type="hidden" value="" />}
      </div>
      <div className="form-row service-settings-row">
        <div className="form-field">
          <label htmlFor="orden">Orden de aparición</label>
          <input defaultValue={initialValues?.orden ?? defaultOrder} id="orden" max="999" min="0" name="orden" type="number" required />
          <small className="field-help">Cada servicio debe tener una posición diferente.</small>
          {state.errors?.orden?.map((error) => <small className="field-error" key={error}>{error}</small>)}
        </div>
        <label className="toggle-field">
          <input defaultChecked={initialValues?.activo ?? true} name="activo" type="checkbox" />
          <span><strong>Servicio activo</strong><small>Visible en el sitio público</small></span>
        </label>
      </div>
      {state.message && <p className="form-error" role="alert">{state.message}</p>}
      <div className="form-actions">
        <a className="admin-button admin-button-secondary" href="/admin/servicios">Cancelar</a>
        <button className="admin-button admin-button-primary" disabled={pending} type="submit">
          {pending ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
