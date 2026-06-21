# Deuda técnica — Document Automation

## 1. `externalMessageId` obligatorio para integraciones

Estado: Corregido y validado localmente

El backend valida en `DocumentRecordsService.create` que `WHATSAPP` y `EMAIL` incluyan `externalMessageId` no vacío; `MANUAL` sigue siendo opcional.

Contexto:
El flujo de automatización documental recibe documentos/eventos desde sistemas externos como n8n, WhatsApp, Email y futuras integraciones.

Problema:
Si un sistema externo reintenta enviar el mismo evento y la petición no trae `externalMessageId`, Operion no puede saber si es un evento nuevo o duplicado. Esto puede crear documentos duplicados.

Decisión:
Si un documento viene desde WhatsApp, Email, n8n o cualquier integración externa, debe traer un ID externo obligatorio.

Regla:

* Origen externo/integración: `externalMessageId` obligatorio.
* Origen manual/interno: `externalMessageId` puede ser opcional si en el futuro existe carga manual.

Implementación:

* Se agregó validación en `DocumentRecordsService.create`.
* Se normaliza `externalMessageId` con `trim()` antes de buscar por idempotencia y antes de guardar.
* La idempotencia sigue usando `tenantId + sourceChannel + externalMessageId`.

Validado localmente:

* `WHATSAPP` sin `externalMessageId` responde `400 Bad Request`.
* `WHATSAPP` con `" local-test-003 "` se guarda como `"local-test-003"`.
* Repetir `WHATSAPP` con `"local-test-003"` reutiliza el mismo documento.

Nota MVP:
El workflow local de n8n ya envía:

```json
"externalMessageId": "local-test-001"
```

## 2. Precisión financiera de `total_amount` en `document_records`

Estado: Corregido y validado localmente

Problema:
`DocumentRecordEntity.totalAmount` ya se validaba desde la API como string decimal, por ejemplo `"50000.00"`, pero la base de datos todavía debía reforzar la precisión financiera del campo.

Decisión:
`document_records.total_amount` debe guardarse como `NUMERIC(15,2)` y solo permitir montos positivos o `NULL`.

Implementación:

* `DocumentRecordEntity.totalAmount` mapea a `total_amount NUMERIC(15,2)` nullable.
* Se creó y ejecutó la migración `FixDocumentRecordsTotalAmountPrecision1780953600000`.
* La migración altera `document_records.total_amount` a `NUMERIC(15,2)`.
* Se agregó el constraint `chk_document_records_total_amount_positive`.

Regla de base de datos:

```sql
total_amount IS NULL OR total_amount > 0
```

Validado localmente:

* La migración fue ejecutada correctamente.
* `migration:show` marca `FixDocumentRecordsTotalAmountPrecision1780953600000` como `[X]`.
* `total_amount` quedó con `numeric_precision = 15` y `numeric_scale = 2`.
* El constraint existe en PostgreSQL como `chk_document_records_total_amount_positive`.
* La base de datos rechaza `total_amount = -1`.
* La API sigue recibiendo `totalAmount` como string decimal, por ejemplo `"50000.00"`.

Nota:
Con la regla actual también se rechaza `0.00`, porque el monto debe ser mayor a cero. Si en el futuro se requiere permitir documentos con monto cero, el constraint debería cambiar a `total_amount IS NULL OR total_amount >= 0`.
