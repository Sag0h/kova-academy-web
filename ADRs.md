# ADRs — KovaAcad Turnos · Architecture Decision Records

> **Proyecto:** KovaAcadTurnos
> **Fecha:** 2026-09-28
> **Estado:** Draft v0.2 _(actualizado — modelo simplificado)_

---

## Changelog

| Versión | Fecha | Cambio |
|---------|-------|--------|
| v0.1 | 2026-09-28 | Draft inicial |
| v0.2 | 2026-09-28 | Eliminados ADRs de notificaciones email y cron job. El sistema ya no gestiona el ciclo de reserva. |

---

## ADR-001 — Stack tecnológico principal

**Estado:** Aceptado

### Contexto

El proyecto es una aplicación web de baja escala (1 admin, decenas de visitantes ocasionales). Prioridades:
- Costo de infraestructura mínimo
- Velocidad de desarrollo alta
- Facilidad de mantenimiento a largo plazo

### Decisión

**Next.js 14+ (App Router) + TypeScript** como framework full-stack.

- **Frontend:** React con Next.js App Router, Tailwind CSS para estilos
- **Backend:** Next.js API Routes / Server Actions (misma base de código)
- **ORM:** Prisma (type-safe, migraciones simples)
- **Base de datos:** PostgreSQL

### Justificación

| Opción considerada | Por qué se descartó |
|--------------------|---------------------|
| Separar frontend (React) y backend (Node/Express) | Más setup, más repos, más DevOps |
| Python (FastAPI) + React | Dos lenguajes, dos deploys para un proyecto pequeño |
| Full Python (Django) | Menor ecosistema moderno para lo que se necesita |
| **Next.js full-stack** | ✅ Un solo repo, un solo deploy, TypeScript end-to-end |

### Consecuencias

- Un solo repositorio monorepo
- Se puede deployar en Vercel (gratuito) o Railway
- El equipo (y los AI coding tools) trabajan en TypeScript consistentemente

---

## ADR-002 — Base de datos

**Estado:** Aceptado

### Decisión

**PostgreSQL** managed, hosteado en **Supabase (free tier)**.

### Modelo de datos principal (entidades clave)

```
Slot (turno disponible publicado por Alai)
  - id, fecha, horaInicio, horaFin, servicio (texto libre), estado (disponible | ocupado)

Servicio
  - id, nombre, descripcion
  - tipoPrecio: "fijo" | "desde" | "cotizacion"
  - precio (nullable — solo cuando tipoPrecio = "fijo" o "desde")
  - activo, orden
  (sin imagenUrl — las fotos van en ServicioFoto)

ServicioFoto
  - id, servicioId (FK → Servicio), imagenUrl, orden
  - Un servicio tiene de 1 a N fotos
  - Se muestran como galería/carrusel en la card del servicio

Trabajo (portfolio)
  - id, imagenUrl, descripcion, orden, creadoEn

Usuario (solo Alai)
  - id, email, passwordHash, nombre, whatsappNumero
```

### Ejemplos reales de servicios (seed inicial)

| nombre | tipoPrecio | precio | descripcion |
|--------|-----------|--------|-------------|
| Capping con Builder Gel | fijo | $22.000 | Refuerzo sobre la uña natural, sin extensión... |
| Nivelación / Semipermanente | fijo | $21.000 | Trabajo sobre la uña natural utilizando Base Rubber... |
| Soft Gel | **desde** | $24.000 | Sistema de extensión con tips de gel... (precio final según personalización) |
| Nail Art | cotizacion | — | Diseños personalizados, precio según complejidad |

> [!NOTE]
> Comportamiento según `tipoPrecio` en el sitio público:
> - `fijo` → muestra **"$22.000"** — botón lleva a slots disponibles
> - `desde` → muestra **"Desde $24.000"** — botón lleva a slots disponibles; se aclara que el precio final puede variar según personalización
> - `cotizacion` → muestra **"A cotizar"** — botón abre WhatsApp con mensaje de consulta directo

> [!NOTE]
> Se eliminó la entidad `Solicitud` ya que no hay flujo de reserva web. Los turnos pasan directamente de `disponible` a `ocupado` cuando Alai confirma por WhatsApp y lo marca manualmente.

### Justificación

- PostgreSQL es robusto, con soporte nativo en todos los PaaS
- Supabase free tier es suficiente para este volumen
- Prisma facilita las migraciones y el type-safety

---

## ADR-003 — Autenticación

**Estado:** Aceptado

### Contexto

Solo Alai necesita autenticarse. No hay registro público.

### Decisión

**NextAuth.js v5** (Auth.js) con proveedor **Credentials** (usuario + contraseña hasheada con bcrypt).

### Justificación

- No necesita OAuth social ni sistemas complejos
- NextAuth integra nativamente con Next.js
- Sesiones por JWT para simplicidad
- La contraseña se setea inicialmente a mano (seed en DB), sin flujo de registro público

### Alternativa descartada

- **Clerk / Auth0:** Excesivo para 1 usuario, agrega costo y dependencia externa

---

## ADR-004 — Almacenamiento de imágenes (Portfolio)

**Estado:** Aceptado

### Contexto

Alai sube fotos de sus trabajos desde el panel admin. Se necesita almacenamiento, optimización y URL pública.

### Decisión

**Cloudinary** (free tier: 25 GB storage + transformaciones de imagen).

### Justificación

- Free tier generoso para un portfolio pequeño
- Optimización automática de imágenes (WebP, resize, compresión)
- SDK simple para upload desde Next.js
- URL pública directa sin complejidad de CDN

### Alternativa

- **Supabase Storage:** También viable si ya se usa Supabase para DB. Migración sencilla si se necesita.

---

## ADR-005 — Integración WhatsApp (deeplink)

**Estado:** Aceptado

### Contexto

El mecanismo central de contacto y reserva es WhatsApp. No se usa la API de WhatsApp Business (tiene costo y complejidad). Se usa un **deeplink estático** que abre WhatsApp con un mensaje pre-redactado.

### Decisión

Usar el formato de deeplink de WhatsApp:

```
https://wa.me/549XXXXXXXXXX?text=Hola+Alai...
```

El número de WhatsApp de Alai se almacena en la configuración del sistema (campo en DB o variable de entorno). El mensaje se genera dinámicamente incluyendo:
- Fecha y hora del slot seleccionado
- Servicio asociado al slot (si lo tiene)

### Justificación

- Costo: $0
- Sin aprobación de Meta / WhatsApp Business
- Funciona en mobile y desktop
- El cliente ve el mensaje antes de enviarlo, lo que reduce malentendidos

### Alternativa descartada

- **WhatsApp Business API (Twilio/360dialog):** Requiere aprobación de Meta, tiene costo por mensaje, y es innecesario para este volumen

---

## ADR-006 — Hosting y Deployment

**Estado:** Aceptado

### Decisión

**Vercel + Supabase** (ambos en free tier).

| Componente | Servicio | Costo |
|------------|---------|-------|
| App Next.js | Vercel (Hobby plan) | $0/mes |
| Base de datos | Supabase (Free tier) | $0/mes |
| Imágenes | Cloudinary (Free) | $0/mes |
| **Total** | | **$0/mes** |

### Justificación

- Deploy automático desde GitHub (git push → deploy)
- CI/CD gratuito incluido en Vercel
- SSL automático
- Sin servidores que mantener

### Limitación conocida

Supabase free pausa la DB tras 1 semana de inactividad. Si esto resulta un problema, la alternativa es **Railway (~$5–15/mes)** que mantiene la DB siempre activa.

---

## ADR-007 — Estrategia de desarrollo con IA (Spec-Driven)

**Estado:** Aceptado

### Decisión

El desarrollo sigue el flujo **spec-driven development**:

1. **PRD** define QUÉ construir
2. **ADRs** definen CÓMO se construye (decisiones técnicas)
3. **Specs por feature** se crean antes de codear cada módulo (en `docs/specs/`)
4. La IA (Antigravity) implementa partiendo de las specs
5. Code review humano antes de merge a main

### Estructura de documentación

```
docs/
├── PRD.md
├── ADRs.md
└── specs/
    ├── feature-slots.md        ← gestión de slots disponibles
    ├── feature-portfolio.md    ← galería de trabajos
    ├── feature-servicios.md    ← lista de servicios y precios
    └── feature-whatsapp.md     ← deeplink y flujo de contacto
```

---

## Resumen de decisiones

| ADR | Decisión |
|-----|---------|
| 001 | Next.js 14 + TypeScript + Tailwind |
| 002 | PostgreSQL + Prisma + Supabase |
| 003 | NextAuth.js v5 (Credentials) |
| 004 | Cloudinary (imágenes del portfolio) |
| 005 | WhatsApp deeplink (wa.me) — sin API |
| 006 | Vercel + Supabase (hosting $0/mes) |
| 007 | Spec-driven development con Antigravity |
