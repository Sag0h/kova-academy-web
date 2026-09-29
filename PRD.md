# PRD — KovaAcad Turnos · Catálogo y Gestión de Turnos vía WhatsApp

> **Proyecto:** KovaAcadTurnos
> **Propietaria del producto:** Alai (emprendedora de manicura)
> **Fecha:** 2026-09-28
> **Estado:** Draft v0.2 _(actualizado — cambio de modelo de negocio)_

---

## Changelog

| Versión | Fecha | Cambio |
|---------|-------|--------|
| v0.1 | 2026-09-28 | Draft inicial con flujo de reserva y aprobación |
| v0.2 | 2026-09-28 | Eliminado flujo de solicitud/aprobación. Modelo simplificado: catálogo + WhatsApp |

---

## 1. Contexto y Problema

Alai gestiona su agenda manualmente vía WhatsApp, lo que le funciona bien. El problema es que no tiene presencia web donde mostrar su trabajo, sus precios ni sus horarios disponibles. Además, requiere una seña de $4.000 para confirmar turnos, lo que hace inviable manejar la reserva completa por web sin un sistema de pagos.

**Decisión de negocio:** el ciclo de reserva (coordinación de seña y confirmación) se mantiene por WhatsApp. La web actúa como **catálogo y punto de contacto**, no como sistema de reservas.

---

## 2. Objetivo

Construir una aplicación web que:

1. **Muestre el trabajo de Alai** (portfolio, servicios, precios)
2. **Muestre sus turnos disponibles** para que los clientes sepan cuándo puede atenderlos
3. **Facilite el contacto vía WhatsApp** con un mensaje pre-redactado cuando el cliente elige un turno
4. **Sea completamente editable por Alai** sin conocimientos técnicos

---

## 3. Usuarios

| Rol | Descripción |
|-----|-------------|
| **Visitante/Cliente** | Navega el sitio, ve trabajos, elige un turno disponible y contacta a Alai por WhatsApp |
| **Administradora (Alai)** | Gestiona portfolio, servicios, precios y slots disponibles desde el panel admin |

---

## 4. Funcionalidades

### 4.1 Sitio Público

| ID | Funcionalidad | Prioridad |
|----|---------------|-----------|
| F01 | Landing page con info del negocio (nombre, descripción, contacto) | Must |
| F02 | Galería/portfolio de trabajos con diseño moderno | Must |
| F03 | Lista de servicios y precios | Must |
| F04 | Vista de turnos disponibles (fecha, hora, servicio aplicable) | Must |
| F05 | Botón "Reservar este turno" → abre WhatsApp con mensaje pre-redactado | Must |
| F06 | Botón de contacto general por WhatsApp (flotante o en header/footer) | Must |

#### F05 — Detalle del deeplink WhatsApp

Al hacer click en un turno disponible, se abre WhatsApp con el siguiente mensaje pre-redactado (el usuario solo confirma y envía):

```
Hola Alai! Me interesa el turno del [día, fecha] a las [hora] para [servicio]. ¿Está disponible?
```

El cliente puede editar el mensaje antes de enviarlo si quiere agregar algo.

---

### 4.2 Panel Administrativo (solo Alai)

| ID | Funcionalidad | Prioridad |
|----|---------------|-----------|
| A01 | Login seguro con usuario/contraseña | Must |
| A02 | CRUD de slots disponibles (fecha, hora, servicio opcional) | Must |
| A03 | Marcar un slot como **ocupado** (turno coordinado por WhatsApp) | Must |
| A04 | CRUD de servicios y precios | Must |
| A05 | CRUD de trabajos del portfolio (foto + descripción opcional) | Must |
| A06 | Reordenar trabajos del portfolio (drag & drop o flechas) | Should |

> [!NOTE]
> No existe flujo de solicitud/aprobación de turnos. Alai coordina directamente por WhatsApp y luego marca el slot como ocupado en el panel.

---

## 5. Flujo principal

```
Visitante                         Sitio web                          Alai (Admin)
    │                                 │                                    │
    ├─ Visita el sitio ──────────────►│                                    │
    ├─ Ve portfolio y precios ◄───────┤                                    │
    ├─ Ve turnos disponibles ◄────────┤  (cargados por Alai previamente)   │
    │                                 │                                    │
    ├─ Click "Reservar turno X" ─────►│                                    │
    │  WhatsApp se abre con           │                                    │
    │  mensaje pre-redactado ◄────────┤                                    │
    │                                 │                                    │
    ├──────── Conversación en WhatsApp ──────────────────────────────────►│
    │         (coordina seña y confirma)                                   │
    │                                 │                                    │
    │                                 │◄── Alai marca slot como ocupado ───┤
    │                                 │    en el panel admin               │
```

---

## 6. Fuera de Scope

- ❌ Pagos o cobros online (la seña se coordina por WhatsApp)
- ❌ Formulario de solicitud de turno
- ❌ Sistema de aprobación/rechazo de turnos
- ❌ Notificaciones automáticas por email
- ❌ Cancelaciones por parte del cliente
- ❌ Múltiples usuarios administradores
- ❌ Sistema de reseñas/calificaciones

---

## 7. Criterios de éxito

- Alai puede publicar un nuevo slot disponible en menos de 1 minuto
- Un visitante puede iniciar contacto por WhatsApp con el turno de interés en menos de 2 clics
- El portfolio puede actualizarse sin ayuda técnica
- El sitio funciona correctamente en mobile (responsivo) — la mayoría de los clientes usarán el celular
- El deeplink de WhatsApp genera el mensaje correcto con fecha, hora y servicio del turno seleccionado

---

## 8. Restricciones

- **Presupuesto de infraestructura:** mínimo ($0/mes en el MVP)
- **Usuarios concurrentes esperados:** < 50 simultáneos
- **Idioma:** Español
- **Dispositivos prioritarios:** Mobile-first (clientes llegan desde Instagram/redes sociales)

---

## 9. Timeline estimado (fases)

| Fase | Contenido |
|------|-----------|
| MVP | F01–F06, A01–A06 |
| v1.1 | Integración con Google Calendar (Alai carga slots desde GCal) |
