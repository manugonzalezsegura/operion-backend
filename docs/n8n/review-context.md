# Contexto de revisión — n8n local + document automation

## Proyecto

**Operion** — backend SaaS B2B multi-tenant.

## Stack

- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- Docker Compose
- n8n (local)

## Alcance revisado

- `src/modules/document-automation`
- `docs/n8n`

## Objetivo de la fase

Probar la integración local **n8n → Operion** con datos simulados, sin integraciones externas reales.

## Flujo validado

```
Manual Trigger → Edit Fields → Create Document → Simulated Parsed Fields → Update Document
```

### POST `/document-automation/documents`

Crea o reutiliza un `DocumentRecord` por **idempotencia**, usando la clave compuesta:

- `tenantId`
- `sourceChannel`
- `externalMessageId`

### PATCH `/document-automation/tenants/:tenantId/documents/:documentId`

Completa **datos estructurados simulados** sobre el documento creado o reutilizado (tipo, contraparte, dirección financiera, vencimiento, monto, etc.).

## Responsabilidades

| Capa | Rol |
|---|---|
| **n8n** | Orquestación local de prueba. Transporta payloads simulados. **No** contiene lógica financiera ni es fuente de verdad. |
| **Operion** | Reglas de negocio, aislamiento multi-tenant, persistencia, manejo de dinero e idempotencia. |

## Fuera de alcance (por ahora)

- WhatsApp real
- IA real
- Google Drive / Google Sheets
- Fintoc

## Dinero y `totalAmount`

- En el workflow n8n, `totalAmount` viaja como **string decimal**, por ejemplo `"50000.00"`.
- El backend debe tratar dinero con **decimal/numeric** o **centavos**; **no** usar `parseFloat` para montos.

## Autenticación local

- Los tokens JWT se agregan **manualmente** en n8n local (`Authorization: Bearer <accessToken>`).
- **Nunca** commitear tokens, refresh tokens ni secretos en el repositorio.

## Objetivo de revisión (Codex)

Revisar:

- Arquitectura
- Seguridad
- Multi-tenant
- Contrato DTO
- Workflow n8n
- Documentación
- Posibles riesgos y deuda técnica

## Criterios de feedback

- **No** pedir refactor grande salvo bug o riesgo real.
- Mantener el **MVP simple y mantenible**.

## Rama / fase

- Rama: `feature/n8n-local-workflow`
- Fase revisada: integración local `n8n → Operion` con datos simulados.
- Esta revisión no debe incluir WhatsApp real, IA real, Google Drive/Sheets ni Fintoc.

## Criterios ya validados localmente

- El workflow local ejecuta:
  `Manual Trigger → Edit Fields → Create Document → Simulated Parsed Fields → Update Document`
- `POST /document-automation/documents` crea un `DocumentRecord`.
- Una segunda ejecución con el mismo `externalMessageId` reutiliza el documento existente por idempotencia.
- `PATCH /document-automation/tenants/:tenantId/documents/:documentId` completa los datos simulados.
- `totalAmount` funciona como string decimal, ejemplo `"50000.00"`.

## Puntos sensibles para revisión

- Validar aislamiento multi-tenant: no confiar solo en `documentId`; usar `tenantId + entityId`.
- Confirmar que no existan tokens reales, refresh tokens ni secretos en `docs/n8n/*.json`.
- Revisar que `totalAmount`/montos no usen `parseFloat` para lógica financiera.
- Confirmar que la idempotencia tenga respaldo real con índice/constraint, no solo lógica de servicio.
- Confirmar que las respuestas públicas usen DTOs/mappers y no entities crudas, si ese es el patrón del módulo.
- Revisar que n8n solo orqueste y no contenga reglas de negocio.

## Formato esperado de revisión

La revisión debe responder como code review:

1. Findings ordenados por severidad.
2. Archivo o sección afectada.
3. Riesgo concreto.
4. Corrección sugerida.
5. Si no hay problemas graves, decirlo claramente y listar solo mejoras pequeñas.