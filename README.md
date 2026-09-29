# KovaAcad Turnos

Catálogo web mobile-first para mostrar servicios, portfolio y turnos disponibles, con contacto y coordinación final por WhatsApp.

## Estado actual

Primer incremento público conectado a PostgreSQL local:

- landing responsive;
- cards de servicios con precios condicionales;
- portfolio visual provisional;
- slots disponibles;
- deeplinks de WhatsApp por turno, cotización y contacto general;
- pruebas unitarias de la generación de mensajes;
- esquema, migraciones y seed reproducibles con Prisma;
- login administrativo y CRUD de turnos protegido por sesión;
- CRUD administrativo de servicios, precios, visibilidad y orden.
- gestión de portfolio con descripciones, orden, eliminación y uploads firmados a Cloudinary.
- configuración global editable de identidad y contacto por WhatsApp.
- galerías de fotos por servicio con carrusel público y lightbox.

Las formas visuales demo se reemplazan automáticamente a medida que se publican fotos reales. Para habilitar uploads deben configurarse las tres variables `CLOUDINARY_*`; la conexión remota a Supabase continúa pendiente.

## Desarrollo local

```bash
npm install
cp .env.example .env
npm run db:up
npm run db:deploy
npm run db:seed
npm run dev
```

Abrir `http://localhost:3000`.

### Panel administrativo local

Abrir `http://localhost:3000/admin/login` y usar las credenciales definidas en
`ADMIN_EMAIL` y `ADMIN_PASSWORD`. Los valores de `.env.example` son únicamente
para desarrollo local; deben reemplazarse antes de conectar Supabase o publicar
la aplicación. El seed guarda un hash bcrypt, nunca la contraseña en texto plano.

## Comandos

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

Para detener PostgreSQL sin borrar sus datos: `npm run db:down`.

`prisma/migrations/` es la fuente de verdad del esquema. Cuando exista el
proyecto remoto de Supabase, se cambia `DATABASE_URL` y se ejecuta
`npm run db:deploy`; no se recrean las tablas manualmente desde el dashboard.

## Configuración

`NEXT_PUBLIC_WHATSAPP_NUMBER` debe usar formato internacional, sin `+`, espacios ni guiones. El valor de `.env.example` es solamente demostrativo.

La documentación funcional y técnica original está en `PRD.md`, `ADRs.md` y `docs/specs/`.
