"use client";

import { useActionState } from "react";
import type { SlotActionState } from "@/lib/action-state";

interface ServiceOption {
  id: string;
  nombre: string;
}

interface SlotFormProps {
  action: (state: SlotActionState, formData: FormData) => Promise<SlotActionState>;
  initialValues?: {
    inicio: string;
    servicioId: string;
    notas: string;
  };
  services: ServiceOption[];
  submitLabel: string;
}

export function SlotForm({ action, initialValues, services, submitLabel }: SlotFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="admin-form slot-form">
      <div className="form-field">
        <label htmlFor="inicio">Fecha y hora</label>
        <input
          defaultValue={initialValues?.inicio}
          id="inicio"
          name="inicio"
          type="datetime-local"
          required
        />
        {state.errors?.inicio?.map((error) => <small className="field-error" key={error}>{error}</small>)}
      </div>
      <div className="form-field">
        <label htmlFor="servicioId">Servicio</label>
        <select defaultValue={initialValues?.servicioId ?? ""} id="servicioId" name="servicioId">
          <option value="">Cualquier servicio</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>{service.nombre}</option>
          ))}
        </select>
        {state.errors?.servicioId?.map((error) => <small className="field-error" key={error}>{error}</small>)}
      </div>
      <div className="form-field">
        <label htmlFor="notas">Notas internas <span>Opcional</span></label>
        <textarea
          defaultValue={initialValues?.notas}
          id="notas"
          maxLength={500}
          name="notas"
          placeholder="Información visible solo en el panel"
          rows={4}
        />
        {state.errors?.notas?.map((error) => <small className="field-error" key={error}>{error}</small>)}
      </div>
      {state.message && <p className="form-error" role="alert">{state.message}</p>}
      <div className="form-actions">
        <a className="admin-button admin-button-secondary" href="/admin/slots">Cancelar</a>
        <button className="admin-button admin-button-primary" disabled={pending} type="submit">
          {pending ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
