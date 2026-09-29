# Feature Spec — Contacto y Deeplink WhatsApp

> **Feature ID:** feature-whatsapp
> **Fecha:** 2026-09-28
> **Estado:** Draft v0.1

---

## 1. Descripción

El mecanismo central de contacto del sitio. No hay formularios ni flujos de reserva: el cliente hace click en un botón y se abre WhatsApp con un mensaje pre-redactado, listo para enviar. Esto aplica tanto al contacto desde un slot específico (con fecha y hora pre-cargadas en el mensaje) como al contacto general o desde un servicio "A cotizar".

---

## 2. User Stories

| ID | Como... | Quiero... | Para... |
|----|---------|-----------|---------|
| US-W01 | visitante | hacer click en "Quiero este turno" y que WhatsApp se abra con el mensaje ya escrito | no tener que tipear nada y reducir la fricción |
| US-W02 | visitante | poder editar el mensaje antes de enviarlo | agregar información extra si quiero |
| US-W03 | visitante | tener un botón de WhatsApp siempre visible en el sitio | poder contactar a Alai en cualquier momento |
| US-W04 | visitante | que al consultar por un servicio "A cotizar" el mensaje ya mencione el servicio | no tener que explicar de qué estoy hablando |
| US-W05 | admin (Alai) | configurar mi número de WhatsApp desde el panel | si cambio de número, poder actualizarlo sin tocar el código |

---

## 3. Tipos de deeplink y mensajes

### Tipo A — Desde un slot disponible

Contexto: el visitante hace click en "Quiero este turno" en la sección de slots.

**Mensaje generado:**
```
Hola Alai! 👋 Me interesa el turno del [día] [fecha] a las [horaInicio]hs para [servicio o "una sesión"]. ¿Está disponible?
```

**Ejemplos:**
- Con servicio: `Hola Alai! 👋 Me interesa el turno del lunes 5 de octubre a las 15:00hs para Soft Gel. ¿Está disponible?`
- Sin servicio: `Hola Alai! 👋 Me interesa el turno del lunes 5 de octubre a las 15:00hs. ¿Está disponible?`

---

### Tipo B — Desde un servicio "A cotizar"

Contexto: el visitante hace click en "Consultar por WhatsApp" en la card de un servicio con `tipoPrecio = cotizacion`.

**Mensaje generado:**
```
Hola Alai! 👋 Me gustaría cotizar [nombre del servicio]. ¿Me podés dar más info?
```

**Ejemplo:**
- `Hola Alai! 👋 Me gustaría cotizar Nail Art. ¿Me podés dar más info?`

---

### Tipo C — Contacto general (botón flotante / footer)

Contexto: botón de WhatsApp siempre visible en el sitio (flotante, esquina inferior derecha).

**Mensaje generado:**
```
Hola Alai! 👋 Te escribo desde tu página web.
```

---

## 4. Construcción del deeplink

```typescript
function buildWhatsAppUrl(numero: string, mensaje: string): string {
  const mensajeCodificado = encodeURIComponent(mensaje)
  return `https://wa.me/${numero}?text=${mensajeCodificado}`
}
```

- El número debe estar en formato internacional sin `+` ni espacios (ej: `5493412345678`)
- El número se obtiene de la configuración del sistema (`Configuracion.whatsappNumero`)
- El link abre WhatsApp Web en desktop y la app nativa en mobile

---

## 5. Diseño — Botón flotante

```
╔══════════╗
║  💬 WA   ║  ← botón circular verde, fijo en esquina inferior derecha
╚══════════╝
```

- Visible en todas las páginas del sitio público
- En mobile: siempre visible sobre el contenido (z-index alto)
- Tooltip al hover (desktop): "Escribime por WhatsApp"
- Al hacer click → deeplink Tipo C (contacto general)

---

## 6. Modelo de datos involucrado

```prisma
model Configuracion {
  id               String @id @default("singleton")
  whatsappNumero   String  // ej: "5493412345678"
  nombreNegocio    String  @default("Kova Academy")
  // (otros campos de configuración global del sitio)
}
```

> [!NOTE]
> El modelo `Configuracion` es un singleton (una única fila en la tabla). Se inicializa con el número de Alai al hacer el seed inicial. Alai puede editarlo desde `/admin/configuracion`.

---

## 7. API / Server Actions

| Acción | Tipo | Ruta / Función |
|--------|------|---------------|
| Obtener número de WhatsApp y config (público) | Server Component / cached | `getConfiguracion()` |
| Editar configuración | Server Action | `editarConfiguracion(data)` |

> [!NOTE]
> La generación del deeplink ocurre **en el cliente** (browser), no requiere llamada al servidor. El número se pasa como prop al componente de botón.

---

## 8. Criterios de aceptación

- [ ] El deeplink Tipo A incluye correctamente fecha, hora y servicio del slot seleccionado
- [ ] El deeplink Tipo B incluye el nombre del servicio cotizado
- [ ] El botón flotante de WhatsApp es visible en todas las páginas del sitio público
- [ ] En mobile, el deeplink abre la app de WhatsApp (no WhatsApp Web)
- [ ] Alai puede actualizar su número de WhatsApp desde el panel admin sin tocar código
- [ ] Los mensajes están en español argentino y tienen un tono cálido/informal
