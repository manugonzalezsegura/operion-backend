# n8n local workflow: document intake

Workflow de desarrollo local para probar la integración mínima entre **n8n** y el backend **Operion**, usando datos simulados.

## Propósito

Este workflow es **solo para desarrollo local**. No implementa WhatsApp real, IA real ni integraciones con Google Drive o Google Sheets.

Simula un mensaje/documento recibido por WhatsApp y lo procesa en dos pasos contra el backend de Operion:

1. **POST** `/document-automation/documents` — crea o reutiliza un `DocumentRecord` con metadatos del remitente, nombre del archivo, tipo MIME, un `externalMessageId` de prueba y texto OCR simulado.
2. **PATCH** `/document-automation/tenants/:tenantId/documents/:documentId` — completa datos estructurados simulados (tipo de documento, RUT, contraparte, dirección financiera, vencimiento y monto).

El PATCH **simula la extracción de datos** a partir del OCR; no usa IA real ni servicios externos de parsing.

## URLs del backend

Desde el contenedor **n8n**, usa la URL según dónde corra Operion:

| Operion corre en… | Base URL |
|---|---|
| Local con `npm run start:dev` (fuera de Docker) | `http://host.docker.internal:3000` |
| Servicio `app` en Docker Compose | `http://app:3000` |

Endpoints usados por defecto en este workflow:

```
POST  http://host.docker.internal:3000/document-automation/documents
PATCH http://host.docker.internal:3000/document-automation/tenants/{tenantId}/documents/{documentId}
```

Si Operion corre como servicio `app` dentro del compose, cambia la base URL en los nodos **Create Document** y **Update Document** (por ejemplo `http://app:3000/...`).

## Crear el workflow manualmente en n8n

### Nodo 1: Manual Trigger

- Tipo: **Manual Trigger**
- Uso: ejecutar el workflow manualmente desde la UI de n8n.

### Nodo 2: Edit Fields / Set

- Tipo: **Edit Fields** (también llamado **Set**)
- Modo: asignar campos manualmente
- Campos a crear:

| Campo | Valor |
|---|---|
| `tenantId` | `UUID_REAL_DE_TENANT` (placeholder local; debe coincidir con el tenant del JWT para el PATCH) |
| `sourceChannel` | `WHATSAPP` |
| `senderIdentifier` | `+56911111111` |
| `originalFileName` | `documento-test.pdf` |
| `mimeType` | `application/pdf` |
| `externalMessageId` | `local-test-001` |
| `ocrText` | `Factura proveedor test rut 11111111-1 total 50000 vence 2026-06-30` |

### Nodo 3: Create Document

- Tipo: **HTTP Request**
- **Method:** `POST`
- **URL:** `http://host.docker.internal:3000/document-automation/documents`
- **Body Content Type:** `JSON`
- **Body:** enviar como JSON el payload generado por el nodo **Edit Fields**
  - En n8n, suele configurarse como body JSON con expresión `{{ $json }}` o equivalente según la versión del nodo.
- **Autenticación:** no configurar tokens en el JSON del workflow.
  - Agregar manualmente en n8n el header `Authorization: Bearer <accessToken>` si la petición responde `401 Unauthorized`.

### Nodo 4: Simulated Parsed Fields

- Tipo: **Edit Fields** (también llamado **Set**)
- Modo: asignar campos manualmente
- Simula el resultado de un parser/IA sobre el OCR; **no usa IA real**.
- Campos a crear:

| Campo | Valor |
|---|---|
| `documentType` | `INVOICE` |
| `counterpartyRut` | `11111111-1` |
| `counterpartyName` | `Proveedor Test` |
| `financialDirection` | `PAYABLE` |
| `dueDate` | `2026-06-30` |
| `totalAmount` | `50000` (tipo **number**, no string) |

### Nodo 5: Update Document

- Tipo: **HTTP Request**
- **Method:** `PATCH`
- **URL** (expresión n8n):

```
=http://host.docker.internal:3000/document-automation/tenants/{{ $('Edit Fields').item.json.tenantId }}/documents/{{ $('Create Document').item.json.id }}
```

- **Nota sobre nombres de nodos:** si al importar n8n renombra **Edit Fields** como **Edit Fields1**, la expresión de la URL debe referenciar el nombre real del nodo (por ejemplo `$('Edit Fields1')` en lugar de `$('Edit Fields')`).
- **Body Content Type:** `JSON`
- **Body:** enviar como JSON los campos generados por **Simulated Parsed Fields** (`{{ $json }}`).
- **Autenticación:** igual que en **Create Document** — header `Authorization: Bearer <accessToken>` agregado manualmente en n8n para pruebas locales.

### Resultado esperado

- La salida del nodo **Update Document** es el resultado visible final del workflow.
- Tras el PATCH, el `DocumentRecord` debe quedar con datos estructurados simulados:
  - `documentType`: `INVOICE`
  - `counterpartyRut`: `11111111-1`
  - `counterpartyName`: `Proveedor Test`
  - `financialDirection`: `PAYABLE`
  - `dueDate`: `2026-06-30`
  - `totalAmount`: `50000`

## Cómo probar

1. **Reemplazar** `UUID_REAL_DE_TENANT` por el `tenantId` del usuario con el que harás login (debe coincidir con el JWT usado en los nodos HTTP). Sirve para armar la URL del PATCH; el POST usa el tenant del token aunque el body traiga otro valor.
2. **Ejecutar Operion** (`npm run start:dev` o servicio `app` en Docker Compose).
3. **Abrir n8n** en [http://localhost:5678](http://localhost:5678).
4. **Importar** el workflow desde `docs/n8n/document-intake-local.workflow.json` o recrearlo siguiendo los pasos anteriores.
5. **Agregar** el header `Authorization: Bearer <accessToken>` en los nodos **Create Document** y **Update Document** (ver sección de autenticación).
6. **Ejecutar** el workflow manualmente (botón *Execute workflow*).
7. **Confirmar** que el POST crea un `DocumentRecord` y el PATCH lo enriquece con RUT, vencimiento, monto, tipo y dirección financiera.
8. **Ejecutar una segunda vez** con el mismo `externalMessageId` (`local-test-001`).
9. **Confirmar idempotencia:**
   - El POST reutiliza el mismo documento (`id` igual al de la primera ejecución).
   - El PATCH actualiza ese mismo registro con los campos simulados.

### Verificación rápida en base de datos

```sql
SELECT
  id,
  tenant_id,
  source_channel,
  external_message_id,
  document_type,
  counterparty_rut,
  counterparty_name,
  financial_direction,
  due_date,
  total_amount,
  processing_status,
  created_at
FROM document_records
WHERE external_message_id = 'local-test-001'
ORDER BY created_at;
```

Debe existir **un solo** registro para esa combinación `tenantId` + `sourceChannel` + `externalMessageId`, con los campos estructurados completados tras el PATCH.

## Importar desde JSON

1. En n8n, ir a **Workflows**.
2. Usar **Import from File** o **Import from URL**.
3. Seleccionar `docs/n8n/document-intake-local.workflow.json`.
4. Revisar y actualizar `UUID_REAL_DE_TENANT` en el nodo **Edit Fields**.
5. Ajustar las URLs de **Create Document** y **Update Document** si Operion corre como servicio `app`.
6. Agregar manualmente el header `Authorization: Bearer <accessToken>` en ambos nodos HTTP.

## Exportar el workflow

Después de ajustar o validar el workflow en n8n:

1. Abrir el workflow en el editor.
2. Abrir el menú de opciones del workflow (tres puntos / menú superior).
3. Elegir **Download** o **Export**.
4. Guardar el JSON exportado en:

```
docs/n8n/document-intake-local.workflow.json
```

Así el repositorio mantiene una copia versionada del workflow local.

## Alcance de esta fase

- Sin WhatsApp real.
- Sin IA real (el PATCH usa campos fijos simulados).
- Sin Google Drive ni Google Sheets.
- Sin credenciales ni secretos en el JSON del workflow.

## Multi-tenant y JWT

- El backend usa el **`tenantId` del JWT** como tenant efectivo en todos los endpoints de `document-automation`.
- En **POST** (`/documents`, `/payments`), cualquier `tenantId` enviado en el body se **ignora**; Operion sobrescribe con el tenant del token autenticado.
- En rutas con **`:tenantId` en la URL** (por ejemplo el PATCH de este workflow), el param debe **coincidir** con el `tenantId` del JWT. Si no coincide, el backend responde **`403 Forbidden`**.
- En el workflow local, el campo `tenantId` de **Edit Fields** se mantiene como **placeholder** para construir URLs y escenarios de prueba (por ejemplo la expresión del PATCH). Debe ser el **mismo UUID** que el tenant del usuario con el que se obtuvo el `accessToken`.

## Autenticación local con JWT

- Los endpoints `POST /document-automation/documents` y `PATCH /document-automation/tenants/:tenantId/documents/:documentId` están protegidos por JWT.
- Para probar desde n8n local, primero obtener un `accessToken` con el login local del backend.
- Ejemplo:
  POST http://localhost:3000/auth/login
  Body JSON:
  {
    "email": "admin.bootstrap@test.com",
    "password": "Secret123"
  }

- En los nodos **Create Document** y **Update Document**, agregar header:
  `Authorization: Bearer <accessToken>`

- El token debe pegarse manualmente en n8n solo para pruebas locales.
- No guardar tokens en `docs/n8n/document-intake-local.workflow.json`.
- No commitear tokens, refresh tokens ni secretos.
- Si el token expira, repetir login y reemplazar el `accessToken` en n8n.

## Resultado validado localmente

Prueba validada end-to-end con n8n local contra Operion, incluyendo **POST** y **PATCH**:

- **POST** (`Create Document`): crea o reutiliza un `DocumentRecord` por idempotencia (`tenantId` + `sourceChannel` + `externalMessageId`).
- **PATCH** (`Update Document`): completa datos estructurados simulados sobre el documento creado o reutilizado.

Datos validados en el PATCH:

| Campo | Valor |
|---|---|
| `documentType` | `INVOICE` |
| `counterpartyRut` | `11111111-1` |
| `counterpartyName` | `Proveedor Test` |
| `financialDirection` | `PAYABLE` |
| `dueDate` | `2026-06-30` |
| `totalAmount` | `50000` (number) |

Ejecuciones comprobadas:

- Primera ejecución: POST creó el `DocumentRecord` y PATCH completó los campos anteriores.
- Segunda ejecución con el mismo `externalMessageId` (`local-test-001`): POST reutilizó el mismo `id` y PATCH actualizó el mismo registro.
