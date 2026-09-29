# Feature Spec — Portfolio de Trabajos

> **Feature ID:** feature-portfolio
> **Fecha:** 2026-09-28
> **Estado:** Draft v0.1

---

## 1. Descripción

Galería pública donde Alai muestra fotos de sus trabajos realizados. Funciona como portafolio visual para atraer y convencer a nuevos clientes. Alai gestiona el contenido desde el panel admin: sube fotos, agrega descripciones opcionales y define el orden de aparición.

---

## 2. User Stories

| ID | Como... | Quiero... | Para... |
|----|---------|-----------|---------|
| US-P01 | visitante | ver una galería moderna con los trabajos de Alai | conocer su estilo y calidad antes de sacar un turno |
| US-P02 | visitante | hacer click en una foto para verla en grande | apreciar el detalle del trabajo |
| US-P03 | admin (Alai) | subir nuevas fotos de trabajos fácilmente | mantener mi portfolio actualizado |
| US-P04 | admin (Alai) | agregar una descripción opcional a cada foto | contextualizar el trabajo (técnica, diseño, etc.) |
| US-P05 | admin (Alai) | reordenar y eliminar fotos | tener control total de lo que se muestra |

---

## 3. Diseño — Vista pública

### Layout

Galería tipo **masonry grid** (columnas de altura variable, estilo Pinterest).
- Mobile: 2 columnas
- Desktop: 3–4 columnas

### Comportamiento

- Al hacer click en una foto → **lightbox** con imagen en grande
- El lightbox permite navegar con flechas o swipe entre fotos
- Si la foto tiene descripción → se muestra debajo de la imagen en el lightbox
- Lazy loading para no cargar todas las imágenes de una

### Elementos adicionales

- Botón flotante de WhatsApp visible en toda la sección ("Quiero sacar un turno")

---

## 4. Diseño — Panel Admin

### Lista de trabajos (`/admin/portfolio`)

Grid de miniaturas con:
- Thumbnail de la foto
- Descripción (si tiene, truncada)
- Acciones: editar descripción, eliminar, reordenar (flechas o drag & drop)

Botón principal: **"+ Subir foto(s)"**

### Subida de fotos

- Upload múltiple: se pueden subir varias fotos a la vez
- Drag & drop o selector de archivos
- Preview inmediato antes de confirmar
- Descripción opcional por foto (textarea, máx. 200 caracteres)
- Al confirmar → sube a Cloudinary, guarda en DB

---

## 5. Modelo de datos involucrado

```prisma
model Trabajo {
  id          String   @id @default(cuid())
  imagenUrl   String
  descripcion String?  @db.VarChar(200)
  orden       Int      @default(0)
  creadoEn    DateTime @default(now())
}
```

---

## 6. API / Server Actions

| Acción | Tipo | Ruta / Función |
|--------|------|---------------|
| Listar trabajos (público) | Server Component | `getTrabajos()` |
| Listar trabajos (admin) | Server Action | `getTrabajosAdmin()` |
| Subir foto(s) a Cloudinary | API Route | `POST /api/upload` (compartida con servicios) |
| Crear trabajo | Server Action | `crearTrabajo(imagenUrl, descripcion?)` |
| Editar descripción | Server Action | `editarTrabajo(id, descripcion)` |
| Eliminar trabajo | Server Action | `eliminarTrabajo(id)` |
| Reordenar trabajos | Server Action | `reordenarTrabajos(orden[])` |

---

## 7. Validaciones

- Formato de imagen permitido: JPG, PNG, WEBP
- Tamaño máximo por imagen: 10 MB (Cloudinary optimiza el resultado)
- Descripción: opcional, máx. 200 caracteres
- Se pueden subir hasta 10 fotos en un mismo batch

---

## 8. Criterios de aceptación

- [ ] La galería pública muestra los trabajos en masonry grid ordenados por `orden`
- [ ] El lightbox funciona correctamente en mobile y desktop (swipe/flechas)
- [ ] Alai puede subir múltiples fotos en una operación
- [ ] Las fotos se optimizan automáticamente via Cloudinary (WebP, tamaño reducido)
- [ ] Alai puede reordenar, editar descripción y eliminar trabajos desde el admin
- [ ] La galería hace lazy loading (no carga todo al iniciar la página)
