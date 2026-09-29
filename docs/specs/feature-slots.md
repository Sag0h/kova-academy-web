# Feature Spec — Gestión de Slots Disponibles

> **Feature ID:** feature-slots
> **Fecha:** 2026-09-28
> **Estado:** Draft v0.1

---

## 1. Descripción

Alai publica turnos disponibles desde el panel admin. Los visitantes los ven en el sitio público y pueden hacer click para iniciar contacto por WhatsApp indicando qué turno les interesa. Cuando Alai confirma un turno vía WhatsApp, lo marca como "ocupado" desde el admin.

---

## 2. User Stories

| ID | Como... | Quiero... | Para... |
|----|---------|-----------|---------|
| US-T01 | visitante | ver los turnos disponibles con fecha, hora y servicio | saber cuándo puede atenderme Alai |
| US-T02 | visitante | hacer click en un turno disponible y que se abra WhatsApp con un mensaje ya escrito | contactar a Alai fácilmente sin tener que escribir |
| US-T03 | admin (Alai) | crear slots disponibles indicando fecha, hora y servicio | publicar mi disponibilidad |
| US-T04 | admin (Alai) | marcar un slot como "ocupado" después de confirmar por WhatsApp | mantener la disponibilidad actualizada |
| US-T05 | admin (Alai) | eliminar un slot disponible si me equivoqué o cambié de planes | corregir mi agenda |

---

## 3. Diseño — Vista pública

### Layout

Lista o grid de "cards de turno", agrupadas por fecha.

```
Octubre 2026
─────────────────────────────────────
  Lunes 5 · 15:00hs · Soft Gel
  [ Quiero este turno → WhatsApp ]

  Lunes 5 · 17:00hs · (cualquier servicio)
  [ Quiero este turno → WhatsApp ]

Miércoles 7 · 10:00hs · Manicura
  [ Quiero este turno → WhatsApp ]
─────────────────────────────────────
```

- Solo se muestran slots con `estado = disponible` y fecha futura
- Slots pasados no aparecen (se filtran automáticamente)
- Si no hay slots disponibles → mensaje amigable: "Por ahora no tengo turnos publicados. ¡Escribime por WhatsApp y coordinamos!"

### Botón de cada turno

Al hacer click → abre WhatsApp con el mensaje pre-redactado (ver feature-whatsapp.md).

---

## 4. Diseño — Panel Admin

### Vista de slots (`/admin/slots`)

Tabla o lista con columnas:
- Fecha y hora
- Servicio (o "Cualquier servicio" si no tiene uno asignado)
- Estado (chip: **Disponible** en verde / **Ocupado** en gris)
- Acciones: marcar como ocupado, editar, eliminar

Filtros rápidos: "Todos" | "Disponibles" | "Ocupados"

Botón principal: **"+ Nuevo slot"**

### Formulario de nuevo slot (`/admin/slots/nuevo`)

Campos:
- `fecha` — date picker, requerido
- `horaInicio` — time picker, requerido
- `horaFin` — time picker, requerido (para mostrar duración aproximada)
- `servicio` — texto libre o selector de servicios existentes (opcional). Si no se especifica → el slot es genérico para cualquier servicio
- `notas` — campo interno de texto libre (visible solo en admin, nunca en el sitio público)

> [!NOTE]
> La creación de múltiples slots de una vez (ej: "todos los lunes de octubre a las 15hs") queda fuera del MVP. Es una mejora de UX para v1.1.

---

## 5. Modelo de datos involucrado

```prisma
model Slot {
  id         String     @id @default(cuid())
  fecha      DateTime   @db.Date
  horaInicio DateTime   @db.Time
  horaFin    DateTime   @db.Time
  servicio   String?
  estado     EstadoSlot @default(disponible)
  notas      String?
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
}

enum EstadoSlot {
  disponible
  ocupado
}
```

---

## 6. API / Server Actions

| Acción | Tipo | Ruta / Función |
|--------|------|---------------|
| Listar slots disponibles futuros (público) | Server Component | `getSlotsDisponibles()` |
| Listar todos los slots (admin) | Server Action | `getSlots(filtro?)` |
| Crear slot | Server Action | `crearSlot(data)` |
| Editar slot | Server Action | `editarSlot(id, data)` |
| Marcar como ocupado | Server Action | `marcarSlotOcupado(id)` |
| Eliminar slot | Server Action | `eliminarSlot(id)` |

---

## 7. Validaciones

- `fecha`: requerida, debe ser fecha futura (no se pueden crear slots en el pasado)
- `horaInicio`: requerida
- `horaFin`: requerida, debe ser posterior a `horaInicio`
- `servicio`: opcional, máx. 100 caracteres si se completa
- No se puede eliminar un slot con `estado = ocupado` (solo se puede editar o marcar como disponible de nuevo)

---

## 8. Criterios de aceptación

- [ ] El sitio público muestra únicamente slots con `estado = disponible` y fecha futura
- [ ] Los slots se agrupan por fecha en el sitio público
- [ ] Si no hay slots disponibles, se muestra el mensaje alternativo con CTA de WhatsApp
- [ ] Alai puede crear un slot en menos de 1 minuto
- [ ] Alai puede marcar un slot como ocupado con un solo click desde la lista
- [ ] Los slots pasados no se muestran en el sitio público (aunque existan en la DB)
