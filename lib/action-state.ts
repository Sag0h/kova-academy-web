import type { SlotFieldErrors } from "@/lib/slot-validation";
import type { SettingsFieldErrors } from "@/lib/settings-validation";

export interface AuthActionState {
  error?: string;
}

export interface SlotActionState {
  message?: string;
  errors?: SlotFieldErrors;
}

export interface ServiceActionState {
  message?: string;
  errors?: Partial<Record<"nombre" | "descripcion" | "tipoPrecio" | "precio" | "orden", string[]>>;
}

export interface SettingsActionState {
  message?: string;
  errors?: SettingsFieldErrors;
}
