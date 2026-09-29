# Feature Spec — Servicios y Precios

> **Feature ID:** feature-servicios
> **Fecha:** 2026-09-28
> **Estado:** Draft v0.1

---

## 1. Descripción

Sección pública que muestra todos los servicios activos de Alai con nombre, precio, descripción y una galería de fotos de ejemplo por servicio. También permite a Alai gestionar (CRUD) los servicios y sus fotos desde el panel admin.

---

## 2. User Stories

| ID | Como... | Quiero... | Para... |
|----|---------|-----------|---------|
| US-S01 | visitante | ver todos los servicios disponibles con foto, nombre y precio | saber qué ofrece Alai y cuánto cuesta |
| US-S02 | visitante | ver fotos de ejemplo de cada servicio en un carrusel/galería | hacerme una idea visual del resultado |
| US-S03 | visitante | ver claramente si un servicio tiene precio fijo, "desde X" o "a cotizar" | no llevarme sorpresas |
| US-S04 | admin (Alai) | crear, editar y eliminar servicios | mantener mi lista de precios actualizada |
| US-S05 | admin (Alai) | subir, reordenar y eliminar fotos de cada servicio | mostrar mis trabajos por servicio |

---

## 3. Diseño — Vista pública

### Layout general

Grid de cards, una por servicio. Mobile: 1 columna. Tablet: 2 columnas. Desktop: 3 columnas.

### Anatomía de una card de servicio

```
┌──────────────────────────────┐
│  [foto 1 / 2 / 3]  ← carrusel│
│  ◄  ●●○○  ►                  │
├──────────────────────────────┤
│  Soft Gel                    │
│  Desde $24.000               │  ← tipoPrecio condicional (ver abajo)
│                              │
│  Sistema de extensión con    │
│  tips de gel...              │
│                              │
│  [ Ver turnos disponibles ]  │  ← CTA condicional (ver abajo)
└──────────────────────────────┘
```

### Renderizado condicional por `tipoPrecio`

| tipoPrecio | Texto precio | CTA |
|-----------|-------------|-----|
| `fijo` | `$22.000` | `Ver turnos disponibles` → anchor a sección de slots |
| `desde` | `Desde $24.000` + chip "Precio final según diseño" | `Ver turnos disponibles` → anchor a sección de slots |
| `cotizacion` | `A cotizar` | `Consultar por WhatsApp` → deeplink WhatsApp |

### Galería de fotos por servicio

- El carrusel muestra las fotos en el orden definido por `ServicioFoto.orden`
- Mínimo 1 foto, sin máximo
- En mobile: swipe horizontal
- En desktop: flechas laterales + dots indicadores
- Al hacer click en una foto → lightbox con la imagen completa

---

## 4. Diseño — Panel Admin

### Lista de servicios (`/admin/servicios`)

Tabla con columnas: foto preview (primera foto), nombre, precio, tipo, estado (activo/inactivo), acciones (editar, eliminar).

Incluye botón **"+ Nuevo servicio"**.

### Formulario de servicio (`/admin/servicios/nuevo` y `/admin/servicios/[id]/editar`)

Campos:
- `nombre` — texto, requerido
- `descripcion` — textarea, requerido
- `tipoPrecio` — selector: Fijo | Desde | A cotizar
- `precio` — número (se oculta si tipoPrecio = "cotizacion")
- `activo` — toggle on/off
- `orden` — número (para ordenar en la página)

Sección de fotos (debajo del formulario):
- Upload múltiple de imágenes (drag & drop o click)
- Preview de cada foto subida
- Botón de eliminar por foto
- Reordenar por drag & drop (o flechas arriba/abajo en mobile)
- Al guardar → se suben a Cloudinary y se guardan las URLs en `ServicioFoto`

---

## 5. Modelo de datos involucrado

```prisma
model Servicio {
  id          String         @id @default(cuid())
  nombre      String
  descripcion String
  tipoPrecio  TipoPrecio
  precio      Decimal?
  activo      Boolean        @default(true)
  orden       Int            @default(0)
  fotos       ServicioFoto[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

model ServicioFoto {
  id         String   @id @default(cuid())
  servicioId String
  servicio   Servicio @relation(fields: [servicioId], references: [id], onDelete: Cascade)
  imagenUrl  String
  orden      Int      @default(0)
}

enum TipoPrecio {
  fijo
  desde
  cotizacion
}
```

---

## 6. API / Server Actions

| Acción | Tipo | Ruta / Función |
|--------|------|---------------|
| Listar servicios activos (público) | Server Component | `getServiciosActivos()` |
| Listar todos los servicios (admin) | Server Action | `getServicios()` |
| Crear servicio | Server Action | `crearServicio(data)` |
| Editar servicio | Server Action | `editarServicio(id, data)` |
| Eliminar servicio | Server Action | `eliminarServicio(id)` |
| Subir foto a Cloudinary | API Route | `POST /api/upload` |
| Reordenar fotos | Server Action | `reordenarFotos(servicioId, orden[])` |
| Eliminar foto | Server Action | `eliminarFoto(fotoId)` |

---

## 7. Validaciones

- `nombre`: requerido, máx. 100 caracteres
- `descripcion`: requerido, máx. 500 caracteres
- `precio`: requerido si `tipoPrecio` ≠ `cotizacion`, debe ser > 0
- Fotos: mínimo 1 foto al crear; formato permitido JPG/PNG/WEBP; tamaño máx. 5MB por foto
- No se puede eliminar un servicio si tiene slots activos asociados (prevención de inconsistencia)

---

## 8. Criterios de aceptación

- [ ] La sección pública muestra todos los servicios activos ordenados por `orden`
- [ ] Cada card muestra carrusel funcional con las fotos del servicio
- [ ] El texto del precio y el CTA se renderizan correctamente según `tipoPrecio`
- [ ] El admin puede crear un servicio con fotos sin ayuda técnica
- [ ] El admin puede reordenar fotos de un servicio
- [ ] El admin puede marcar un servicio como inactivo (no aparece en el sitio público)
- [ ] El carrusel funciona con swipe en mobile
