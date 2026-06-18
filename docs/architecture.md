# Architecture — Operion

## 1. Project Overview
Operion es un backend SaaS multi-tenant B2B. El proyecto está orientado a construir capacidades de negocio por módulos, sobre una base técnica consistente con NestJS, TypeScript, TypeORM y PostgreSQL.

## 2. Architectural Goal
El objetivo arquitectónico actual es mantener un backend multi-tenant, modular y mantenible, creciendo módulo por módulo. La prioridad es consolidar patrones estables para escalar el dominio sin romper consistencia.

## 3. High-Level Structure
La arquitectura separa capacidades transversales y dominios de negocio. El sistema hoy se organiza así:

```text
operion-backend
├─ src
│  ├─ core
│  │  ├─ tenants
│  │  ├─ users
│  │  └─ roles
│  ├─ modules
│  │  └─ product-passports
│  ├─ config
│  ├─ migrations
│  ├─ infrastructure
│  ├─ app.module.ts
│  └─ main.ts
├─ docs
├─ test
├─ docker-compose.yml
└─ data-source.ts
```

## 4. Core vs Business Modules
Core contiene capacidades compartidas del sistema que deben poder reutilizarse en distintos dominios, por ejemplo tenants, users y roles.

Modules contiene dominios de negocio reales, con sus reglas, endpoints y contratos de salida. Cada módulo debe ser autónomo en su dominio y alineado al estándar oficial de módulos.

## 5. Dependency Rules
- Modules puede depender de core.
- Modules no debe depender entre sí.
- No se debe acceder directamente a lógica interna de otro dominio de negocio.

Estas reglas existen para reducir acoplamiento y evitar integraciones frágiles entre dominios.

## 6. Multi-tenant Approach
El patrón multi-tenant actual se basa en tenantId explícito cuando aplica, relación con tenant cuando corresponde y validación de tenant al crear recursos.

Las reglas de negocio sensibles al tenant se evalúan por tenant y, cuando el caso lo requiere, se expone listado por tenant para asegurar aislamiento y trazabilidad funcional.

## 7. Current Core Capabilities and Business Modules
- core/tenants: capacidad base funcional para gestión de tenants.
- core/users: capacidad funcional para gestión de usuarios.
- core/roles: capacidad base existente para roles.
- modules/product-passports: primer módulo de negocio cerrado del proyecto (v2 inicial), con patrón completo de entity, DTOs, response DTO, mapper, service, controller, module y PATCH parcial seguro.

## 8. Reference Module
product-passports es el módulo referencia actual para futuros módulos de negocio y el primer módulo de negocio cerrado del proyecto. Define la base práctica de estructura interna, salida controlada, manejo de errores, logs y patrón multi-tenant.

Los futuros módulos de negocio deben seguir el estándar definido en docs/module-standard.md.

## 9. Current Project Status
El proyecto ya cuenta con una base sólida en core y un primer módulo de negocio de referencia cerrado. Estado actual:
- core base existente.
- tenants funcional.
- users funcional.
- roles base existente.
- product-passports cerrado como v2 inicial.

## 10. Near-Term Architectural Direction
La dirección de corto plazo no es abrir muchos módulos nuevos todavía. El foco es mantener consistencia, respetar el estándar de módulos y crecer sin improvisación.

Esto implica consolidar el patrón actual en cada nuevo módulo, mantener reglas de dependencia claras y preservar un crecimiento incremental y mantenible.