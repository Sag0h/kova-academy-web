"use client";

import { useActionState } from "react";
import { updateSettingsAction } from "@/app/admin/(protected)/configuracion/actions";

export function SettingsForm({
  initialValues,
}: {
  initialValues: { nombreNegocio: string; descripcion: string; whatsappNumero: string; tiktokUrl: string };
}) {
  const [state, action, pending] = useActionState(updateSettingsAction, {});

  return (
    <form action={action} className="admin-form settings-form">
      <div className="form-field">
        <label htmlFor="nombreNegocio">Nombre del negocio</label>
        <input defaultValue={initialValues.nombreNegocio} id="nombreNegocio" maxLength={100} name="nombreNegocio" required />
        {state.errors?.nombreNegocio?.map((error) => <small className="field-error" key={error}>{error}</small>)}
      </div>
      <div className="form-field">
        <label htmlFor="descripcion">Descripción pública</label>
        <textarea defaultValue={initialValues.descripcion} id="descripcion" maxLength={500} name="descripcion" rows={5} />
        {state.errors?.descripcion?.map((error) => <small className="field-error" key={error}>{error}</small>)}
        <small className="field-help">Se muestra en la presentación y el pie del sitio.</small>
      </div>
      <div className="form-field">
        <label htmlFor="whatsappNumero">Número de WhatsApp</label>
        <input defaultValue={initialValues.whatsappNumero} id="whatsappNumero" inputMode="tel" name="whatsappNumero" placeholder="5493412345678" required />
        {state.errors?.whatsappNumero?.map((error) => <small className="field-error" key={error}>{error}</small>)}
        <small className="field-help">Formato internacional. Puede escribirse con +, espacios o guiones; se guardará solo con dígitos.</small>
      </div>
      <div className="form-field">
        <label htmlFor="tiktokUrl">Perfil de TikTok <span>Opcional</span></label>
        <input defaultValue={initialValues.tiktokUrl} id="tiktokUrl" maxLength={300} name="tiktokUrl" placeholder="@usuario o https://www.tiktok.com/@usuario" />
        {state.errors?.tiktokUrl?.map((error) => <small className="field-error" key={error}>{error}</small>)}
        <small className="field-help">Al completarlo aparecerá el botón flotante de TikTok.</small>
      </div>
      {state.message && <p className="form-error">{state.message}</p>}
      <div className="form-actions">
        <button className="admin-button admin-button-primary" disabled={pending} type="submit">
          {pending ? "Guardando…" : "Guardar configuración"}
        </button>
      </div>
    </form>
  );
}
