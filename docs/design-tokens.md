# Design Tokens — KovaAcad Turnos

> **Fecha:** 2026-09-28
> **Estado:** v0.1

---

## Paleta de colores de marca

| Token | Uso | Hex | Tailwind custom |
|-------|-----|-----|----------------|
| `color-bg-primary` | Fondo principal | `#F8F5EF` | `bg-brand-ivory` |
| `color-bg-alt` | Fondo alternativo / secciones | `#EEE8DE` | `bg-brand-cream` |
| `color-border` | Bordes y superficies / cards | `#D9CAB5` | `border-brand-beige` |
| `color-accent` | Acento primario / botones / highlights | `#B49B79` | `bg-brand-gold` |
| `color-accent-dark` | Acento oscuro / hover de botones / íconos | `#765E3E` | `bg-brand-bronze` |
| `color-text-primary` | Texto principal | `#25211D` | `text-brand-dark` |
| `color-text-secondary` | Texto secundario / descripción | `#706960` | `text-brand-gray` |

---

## Configuración Tailwind (`tailwind.config.ts`)

```typescript
theme: {
  extend: {
    colors: {
      brand: {
        ivory:  '#F8F5EF',   // fondo principal
        cream:  '#EEE8DE',   // fondo alternativo
        beige:  '#D9CAB5',   // bordes / superficies
        gold:   '#B49B79',   // acento
        bronze: '#765E3E',   // acento oscuro
        dark:   '#25211D',   // texto principal
        gray:   '#706960',   // texto secundario
      },
    },
  },
}
```

---

## Tipografía

| Rol | Fuente | Variantes | Fuente |
|-----|--------|-----------|--------|
| Títulos / headings | **Cormorant Garamond** | 400, 600 | Google Fonts |
| Cuerpo / UI | **Inter** | 400, 500, 600 | Google Fonts |

### Configuración (`tailwind.config.ts`)

```typescript
import { Cormorant_Garamond, Inter } from 'next/font/google'

// En layout.tsx:
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '600'] })
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] })

// En tailwind.config.ts:
theme: {
  extend: {
    fontFamily: {
      serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      sans:  ['Inter', 'system-ui', 'sans-serif'],
    },
  },
}
```

### Escala tipográfica sugerida

| Elemento | Fuente | Tamaño | Peso |
|----------|--------|--------|------|
| Hero / nombre del negocio | serif | 3xl–5xl | 600 |
| Título de sección | serif | 2xl–3xl | 400 |
| Nombre de servicio (card) | serif | xl | 600 |
| Precio | sans | lg | 600 |
| Descripción / cuerpo | sans | sm–base | 400 |
| Botones / labels | sans | sm | 500 |

---

## Uso de colores por componente

### Fondo general del sitio
- Fondo: `#F8F5EF` (ivory)
- Secciones alternadas: `#EEE8DE` (cream)

### Cards de servicios
- Fondo card: `#F8F5EF` o blanco
- Borde: `#D9CAB5` (beige)
- Nombre servicio: `#25211D` (dark) — peso bold
- Precio: `#B49B79` (gold) — destacado
- Descripción: `#706960` (gray)
- CTA button fijo/desde: fondo `#B49B79`, texto blanco, hover `#765E3E`
- CTA button cotizacion: borde `#B49B79`, texto `#B49B79`, hover fondo `#B49B79` texto blanco

### Botón flotante WhatsApp
- Fondo: verde WhatsApp (`#25D366`) — excepción a la paleta por reconocimiento universal
- Sombra suave para destacar sobre el fondo ivory

### Header / Navbar
- Fondo: `#F8F5EF` o transparente con blur
- Logo / nombre: `#25211D`
- Links nav: `#706960` hover `#25211D`

### Panel Admin
- El admin puede usar una paleta más neutra/funcional (Tailwind defaults) para facilitar la legibilidad de formularios y tablas.

---

## Referencia visual del Figma

> **Figma:** [Galería de uñas · Diseños personalizados](https://www.figma.com/design/azCaK5z5YUqbdQwIJ0FQ9f/)
>
> ⚠️ Los colores del Figma son referenciales para la **estructura y layout** solamente.
> La paleta de colores final es la definida en este documento (tokens de marca de Alai).
