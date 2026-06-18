# n8n local — Operion

Guía breve para levantar n8n en el entorno de desarrollo local con Docker Compose.

## Levantar n8n

Desde la raíz del proyecto:

```bash
docker compose up -d n8n_postgres n8n
```

Para levantar todo el stack (Operion + n8n):

```bash
docker compose up -d
```

## URL de acceso

Abre n8n en el navegador:

**http://localhost:5678**

La primera vez se pedirá crear una cuenta de usuario local.

## Bases de datos separadas

- **Operion** usa PostgreSQL del servicio `db` (`operion_dev`).
- **n8n** usa su propia PostgreSQL del servicio `n8n_postgres` (`n8n`).

No comparten base de datos ni volúmenes.

## Llamar al backend de Operion desde n8n

Depende de dónde corra el backend NestJS:

| Backend corre en… | URL desde el contenedor n8n |
|---|---|
| Windows con `npm run start:dev` (fuera de Docker) | `http://host.docker.internal:3000` |
| Servicio `app` dentro del mismo `docker-compose.yml` | `http://app:3000` |

Usa la URL correspondiente en nodos HTTP Request, webhooks internos u otras integraciones hacia la API de Operion.

## Integraciones no configuradas (por ahora)

En esta fase local **no** están configuradas:

- WhatsApp
- Gmail
- Google Drive
- Google Sheets

No hay workflows predefinidos en el repositorio todavía.
