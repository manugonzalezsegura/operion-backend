# Module Standard — Operion

## 1. Purpose
Este estándar define la base oficial para construir módulos de negocio en Operion sin improvisación. Su objetivo es asegurar consistencia técnica, mantenibilidad y comportamiento predecible entre módulos.

## 2. Scope
Aplica a todos los módulos de negocio ubicados en modules/. No define todas las reglas internas de core/; solo establece cómo los dominios de negocio deben diseñarse e integrarse con capacidades compartidas.

## 3. Architectural Principles
- Modularidad real: cada módulo encapsula su dominio, su lógica y su API.
- Bajo acoplamiento: cambios en un módulo no deben romper otros módulos de negocio.
- Separación clara: core contiene capacidades transversales; modules contiene dominios de negocio.
- Salida controlada: nunca exponer entities crudas al cliente.
- Consistencia: todos los módulos nuevos deben seguir el mismo patrón base.

## 4. Allowed and Forbidden Dependencies
Permitido:
- Dependencias internas del propio módulo.
- Dependencias hacia core/ cuando sean capacidades compartidas.
- Dependencias técnicas del stack oficial (NestJS, TypeORM, class-validator, etc.).

Prohibido:
- Dependencias directas entre módulos de negocio dentro de modules/.
- Importar services, repositories, entities o lógica interna de otro módulo de negocio.
- Usar acceso directo entre dominios como atajo de integración.

Si en el futuro se requiere interacción entre dominios:
- Resolver mediante contratos explícitos.
- Resolver mediante una capa de aplicación/orquestación.
- Resolver mediante mecanismos de integración controlados.

Regla obligatoria:
- Los módulos de negocio pueden depender de core, pero no deben depender entre sí.

## 5. Required Module Structure
Estructura mínima esperada para un módulo de negocio:
- Entity principal del dominio.
- DTOs de entrada.
- Response DTO de salida.
- Mapper (Entity -> Response DTO).
- Service con lógica de negocio.
- Controller con endpoints HTTP.
- Module de Nest para composición.

Base de carpeta sugerida:
- module-name.entity.ts
- dto/
- module-name.mapper.ts o función de mapeo equivalente
- module-name.service.ts
- module-name.controller.ts
- module-name.module.ts

Puede haber variaciones menores según el caso, pero esta es la base obligatoria por defecto.

## 6. Naming Rules
- Clases, métodos, variables y archivos en inglés.
- Logs en español.
- Mensajes de error en español.
- Nombres alineados al dominio de negocio y consistentes en todo el módulo.

## 7. API Response Standard
- No devolver entities crudas al cliente.
- El service debe evitar exponer entities directamente a la capa de salida.
- Responder usando Response DTOs.
- La transformación al contrato de respuesta debe ser explícita y consistente.
- Usar mapper o una transformación equivalente para pasar de Entity a Response DTO.
- Mantener formato de respuesta consistente entre endpoints del mismo módulo.

Flujo oficial de salida:
- DB -> Entity -> Mapper -> Response DTO -> Controller -> Cliente.

## 8. Error Handling Standard
- 400 Bad Request: datos inválidos de entrada o validación de DTO.
- 404 Not Found: recurso no encontrado.
- 409 Conflict: conflicto de negocio o unicidad.

Reglas:
- Mensajes en español.
- Mensajes claros, directos y consistentes.
- No exponer detalles internos innecesarios.

## 9. Logging Standard
Regla práctica por nivel:
- debug: trazas útiles de inicio de operación o contexto técnico puntual.
- log: operación completada exitosamente con información relevante.
- warn: condición esperada pero problemática (por ejemplo, recurso inexistente).
- error: fallas de ejecución o excepciones.

Reglas:
- Logs en español.
- Evitar ruido: no duplicar logs sin valor.
- Mantener mensajes concretos y orientados a diagnóstico.

## 10. Multi-tenant Standard
- tenantId explícito en el modelo cuando aplique.
- Relación con tenant cuando corresponda al dominio.
- Validar existencia de tenant al crear registros.
- Exponer endpoint/listado por tenant cuando sea necesario para el caso de uso.
- Reglas de negocio sensibles al tenant deben evaluarse por tenant (por ejemplo, unicidad).

## 11. PATCH / Partial Update Standard
Regla oficial:
- Campo omitido: no cambia.
- Campo con valor válido: actualiza.
- Campo en null: inválido por validación.
- Solo se actualizan campos permitidos por el DTO.

Implementación esperada:
- Filtrar undefined antes de aplicar cambios.
- Aplicar actualización parcial de forma explícita y segura.
- PATCH no debe permitir cambios en campos restringidos por reglas de negocio.
- Si un campo requiere control especial, crear una operación o endpoint específico en lugar de abrir PATCH sin control.

## 12. Reference Module
El módulo product-passports es el módulo de referencia actual para futuros módulos de negocio en Operion. Cualquier módulo nuevo debe tomarlo como baseline de estructura, estilo y comportamiento.

## 13. Checklist for New Modules
- El módulo está dentro de modules/.
- Tiene entity, DTOs, response DTO, mapper, service, controller y module.
- No depende de otros módulos de negocio.
- Usa dependencias de core solo cuando corresponde.
- No retorna entities crudas; retorna response DTO.
- Maneja 400, 404 y 409 con mensajes en español.
- Implementa logs útiles en español con niveles correctos.
- Implementa tenantId explícito y validación de tenant cuando aplica.
- Implementa PATCH parcial con regla omitido/valor válido/null.



Para módulos que integren servicios externos, se deben separar los contratos internos
ports/interfaces de las implementaciones concretas providers/adapters.

Ejemplo:
- OcrProvider como contrato interno.
- TesseractOcrProvider como implementación inicial.
- AzureDocumentIntelligenceProvider como implementación futura.



## 14. Final Notes
Este estándar puede evolucionar con el proyecto, pero en el estado actual es de cumplimiento obligatorio para nuevos módulos. La prioridad es mantener consistencia y evitar decisiones ad hoc durante el desarrollo.


