# TAMV Online Network

**Tecnología Avanzada Mexicana Versátil · Territorio Autónomo de Memoria Viva**

**Proyecto impulsado con colaboración de tecnología latinoamericana. TAMV Online Network — Orgullosamente Realmontenses. Orgullosamente Latinoamericanos.**

TAMV Online Network es una iniciativa mexicana independiente orientada a tecnología, investigación, memoria territorial, gobernanza digital y sistemas de evidencia. Su enfoque combina una plataforma web, documentación técnica, interfaces de investigación y una hoja de ruta para conectar proyectos sin presentar los enlaces de catálogo como integraciones verificadas.

- **Repositorio:** [OsoPanda1/desarrollo-tamv-online-network](https://github.com/OsoPanda1/desarrollo-tamv-online-network)
- **Sitio institucional de referencia:** [tamv.online](https://tamv.online)
- **Repositorio institucional complementario:** [OsoPanda1/tamvonline-weboficial.com](https://github.com/OsoPanda1/tamvonline-weboficial.com)
- **Identidad del proyecto:** Tecnología Avanzada Mexicana Versátil y Territorio Autónomo de Memoria Viva.
- **Producto/superficie institucional identificada en el proyecto:** PLAY & GO.
- **Licenciamiento:** arquitectura híbrida propuesta; su alcance depende de cada activo, de la cadena de titularidad y de la revisión descrita en [LICENSES.md](LICENSES.md).

> **Importante:** este README describe el código y la documentación del repositorio. No constituye una certificación de seguridad, una declaración de cumplimiento legal, una garantía de producción, una acreditación externa ni una afirmación de que todos los activos pertenecen a una única persona o entidad.

## Estado del repositorio y validación

La rama de trabajo de licenciamiento asociada al [PR #51](https://github.com/OsoPanda1/desarrollo-tamv-online-network/pull/51) incorpora la propuesta de licenciamiento híbrido, un registro inicial de activos, borradores de gobernanza y un workflow de generación de SBOM. El PR permanece sujeto a revisión; no se debe interpretar como fusionado ni como aprobación jurídica.

### Qué está respaldado y qué sigue pendiente

| Área | Estado documentado | Límite |
|---|---|---|
| Aplicación web | Código Next.js en el repositorio | No equivale a despliegue productivo verificado |
| Pruebas, TypeScript y build | Existen scripts en package.json | Los resultados históricos no validan automáticamente el HEAD de esta rama |
| Workflow de licencias/SBOM | Workflow definido en .github/workflows/license-compliance.yml | La definición del workflow no demuestra que una ejecución haya terminado correctamente |
| Inventario de activos | Registro inicial en docs/legal/asset-register.csv | Las filas iniciales están marcadas UNREVIEWED; no constituyen una auditoría de titularidad |
| Licencias | Apache-2.0 en LICENSE; política híbrida en revisión | El alcance por archivo y los derechos de terceros deben verificarse |
| Privacidad y marca | Borradores y requisitos documentados | No sustituyen avisos publicados, autorizaciones ni revisión profesional |
| Despliegue y métricas | Hay integración de Analytics y Speed Insights condicionada a producción | No se declaran Core Web Vitals ni métricas reales sin tráfico observado |
| Membresías y pagos | Rutas y contratos de aplicación presentes en el código | La configuración de pagos está deshabilitada por defecto; no asumir transacciones activas |
| Base de datos | PostgreSQL/Drizzle y scripts de migración | La migración 0004 de rate limits debe verificarse y aplicarse en el entorno correcto antes de producción |
| Integraciones externas | Algunos adaptadores y catálogos públicos | Listar un sistema no demuestra conexión viva, autorización, salud ni certificación externa |

Una ejecución local histórica reportó 174/174 pruebas, typecheck correcto, build correcto y ausencia de vulnerabilidades de nivel alto en una auditoría de producción. Ese registro no está vinculado aquí a un SHA reproducible y **no debe citarse como validación del HEAD actual**. La evidencia de CI, Vercel y las auditorías debe consultarse para el commit concreto que se quiera liberar. Los fallos de workflows sin pasos ejecutados o logs suficientes se clasifican como **bloqueados/no concluyentes**, no como pruebas de que el código falla ni como resultados satisfactorios.

- [Pull request de licenciamiento #51](https://github.com/OsoPanda1/desarrollo-tamv-online-network/pull/51)
- [Historial de GitHub Actions](https://github.com/OsoPanda1/desarrollo-tamv-online-network/actions)
- [Auditoría técnica integral del 26 de noviembre de 2026](docs/audit/2026-11-26-total-project-audit.md)
- [Plan de preparación de producción](docs/security/release-readiness.md)

## Propósito y principios

El proyecto busca preservar memoria, investigación y trabajo tecnológico con procedencia visible. La implementación debe diferenciar de forma explícita:

1. **Declarado:** información que mantiene el proyecto o que registra un autor.
2. **Implementado:** código o configuración presentes en una versión concreta.
3. **Probado:** comportamiento respaldado por una ejecución reproducible.
4. **Desplegado:** versión disponible en un entorno identificado.
5. **Verificado externamente:** resultado emitido o confirmado por un tercero identificable.

Un hash identifica bytes, pero no prueba por sí solo la veracidad de una afirmación, la autoría legal o la titularidad. Un DOI, ORCID, catálogo de repositorios, puntaje automatizado o recibo interno tampoco equivale por sí mismo a revisión por pares, certificación, acreditación o impacto independiente.

## Arquitectura técnica

Las versiones declaradas en package.json para esta rama incluyen:

- **Framework:** Next.js 16.4.6 con App Router.
- **UI:** React y React DOM 19.3.1.
- **Lenguaje:** TypeScript 7.0.2.
- **Gestor de paquetes:** pnpm 12.16.1, declarado en packageManager.
- **Persistencia:** PostgreSQL con Drizzle ORM.
- **Autenticación:** Better Auth.
- **Validación de contratos:** Zod.
- **Tokens y utilidades criptográficas:** jose; las primitivas y afirmaciones de seguridad deben revisarse según el uso concreto.
- **IA y UI de chat:** AI SDK y @ai-sdk/react.
- **Observabilidad web:** @vercel/analytics y @vercel/speed-insights, montados sólo en producción.
- **Pruebas:** Node.js test runner mediante node:test.

La instalación reproducible debe respetar pnpm-lock.yaml y usar una versión de Node compatible con las dependencias. El lockfile y package.json son las fuentes de verdad para la instalación de esta revisión; no debe copiarse una versión de pnpm de notas antiguas si contradice packageManager.

## Superficies de la aplicación

Las rutas documentadas en el código incluyen las siguientes áreas. La presencia de una ruta no implica que todos los servicios externos requeridos estén configurados en cada entorno.

| Ruta o área | Propósito documentado |
|---|---|
| / | Consola Living Atlas, con revelado progresivo y navegación bilingüe |
| /quienes-somos, /origenes | Identidad, contexto y narrativa de origen |
| /guia, /institucionalizacion | Guía de uso y hoja de ruta institucional |
| /investigacion, /proyectos, /investigadores, /fuentes | Contenido de investigación, proyectos, perfiles opt-in y fuentes |
| /hcu, /atlas, /portal/hcu | Observatorio HCU y visualización territorial |
| /formacion, /membresias, /apoyar | Formación, membresías y apoyo institucional |
| /ecosistema, /ecosistema/metadata, /desarrolladores | Catálogo y metadatos de sistemas, contratos e información para desarrolladores |
| /auditoria-creator | Dossier de Creator OS con límites de procedencia y verificación |
| /gobernanza | Evaluador local de políticas; no equivale a autorización legal productiva |

### HCU y visualización territorial

El observatorio HCU utiliza un grafo público respaldado por PostgreSQL y ofrece visualización interactiva y una lectura alternativa. El archivo graph.js del sitio institucional estático es documental y no se sincroniza automáticamente con el grafo de la aplicación. Las métricas y posiciones visuales son codificaciones descriptivas: no constituyen predicciones causales ni validación científica independiente.

Especificación: [HCU Observatory v2](docs/architecture/hcu-observatory-v2.md).

## Procedencia y evidencia: TPVA

**TPVA (TAMV Proof & Verification Atlas)** es una arquitectura para organizar procedencia, integridad, revisión y evidencia. Su implementación debe describirse con límites explícitos y por versión.

La Fase 1 documentada incluye:

- [Contrato de recibo TPVA v1](docs/specs/tpva-receipt-v1.md).
- [Esquema JSON](docs/specs/tpva-receipt-v1.schema.json).
- Canonicalización determinista en lib/proofs/canonical.ts.
- Hash SHA-256 del payload canónico en lib/proofs/hash.ts.
- Validación estricta en lib/proofs/validate.ts.
- Verificador offline fail-closed en lib/proofs/verify.ts.
- Vectores de prueba en docs/specs/tpva-test-vectors/.
- Pruebas de recibo en tests/tpva-receipt-v1.test.mjs.

La firma cubre los bytes canónicos definidos por el contrato. Ningún estado local ni campo aportado por quien envía el recibo puede convertir una revisión en certificación de un tercero. Los estados VERIFIED, WITH NOTES, FAILED, UNVERIFIED y REVOKED son estados de evidencia TPVA, no sellos externos.

Las fases 2–7 —constructor de paquetes de evidencia, firma con KMS/HSM, persistencia append-only, API pública de pruebas, interfaz pública y federación Atlas/LITLE— siguen pendientes según la documentación de esta revisión. El material PQC descrito en otros componentes no debe presentarse como una implementación poscuántica validada si sólo es un adaptador, etiqueta o stand-in.

Referencia de diseño: [TPVA Master Blueprint](docs/security-review/TPVA_MASTER_BLUEPRINT.md).

## Gobernanza LATAMV

LATAMV 2.0 se documenta como especificación y evaluador local determinista en lib/governance/latamv-v2.ts. La especificación está en docs/governance/latamv-v2-specification.md y las pruebas de política en tests/latamv-v2-policy.test.mjs.

Límites declarados:

- requiredApprovals() calcula cantidades; no verifica identidades ni firmas.
- signatureMetadata es metadato declarativo, no prueba criptográfica.
- verifyRuntimeProvenance() permanece no integrado.
- No se presentan como implementados ZK, quórum criptográfico real, auto-sanación, pasaporte soberano, negociación jurisdiccional ejecutable ni cumplimiento legal.

## APIs públicas y federación

El contrato machine-readable está en [public/openapi.yaml](public/openapi.yaml) y la guía en [Public API Quickstart](docs/api/public-api-quickstart.md).

Rutas documentadas relevantes:

| Método y ruta | Alcance y límite |
|---|---|
| GET /api/health | Liveness, independiente de PostgreSQL |
| GET /api/health/ready | Readiness con comprobación de PostgreSQL; devuelve 503 si la dependencia no está disponible |
| GET /api/v1/research/topics | Catálogo público de temas |
| GET /api/v1/research/projects | Registros públicos de proyectos |
| GET /api/v1/researchers | Perfiles opt-in |
| GET /api/v1/hcu/graph | Grafo declarativo HCU; no es modelo causal validado |
| GET /api/v1/exports/research | Exportaciones JSON-LD/CSV |
| GET /api/v1/ecosystem | Catálogo de sistemas |
| GET /api/v1/ecosystem/metadata | Metadatos públicos de GitHub con dominio fijo |
| GET /api/v1/huggingface | Snapshot local de metadatos públicos; no consulta el Hub en runtime |
| POST /api/v1/provenance/validate | Validación de envelope; no prueba autoría |
| POST /api/v1/research/federated | Puente de investigación institucional, deshabilitado si no hay URL HTTPS configurada |

El catálogo separa los estados catalogued, contracted, adapter_implemented y verified. Un sistema catalogado no debe describirse como integrado o verificado sin evidencia adicional.

Referencias: [ecosystem federation](docs/architecture/ecosystem-federation-v1.md), [GitHub public metadata adapter](docs/architecture/github-public-metadata-adapter-v1.md), [institutional research federation](docs/architecture/institutional-research-federation-v1.md) y [federation contract](docs/architecture/federation-contract.md).

## Snapshot de Hugging Face

El puente de Hugging Face está diseñado como un snapshot local de metadatos públicos. El generador se encuentra en scripts/hf-evidence-snapshot.mjs, el comando en el script hf:snapshot y la validación en lib/huggingface/public-snapshot.ts. El snapshot versionado se describe en docs/evidence/huggingface-public-snapshot.json.

No guarda tokens, repositorios privados o gated, pesos, embeddings ni resultados de inferencia. Un listado público no prueba que un modelo haya sido evaluado, adoptado, licenciado para un uso concreto o revisado externamente. El endpoint lee el snapshot local y no hace llamadas remotas al Hub durante las solicitudes.

## Membresías, formación y apoyo

Las superficies documentadas incluyen:

- **Plan individual:** MXN $229 por mes y usuario.
- **Plan business:** MXN $699 por mes y organización.
- **Formación:** cinco módulos prácticos con progreso para usuarios autenticados.
- **Apoyo/donaciones:** /apoyar muestra un flujo transparente cuando no hay proveedor configurado; no debe simular pagos ni solicitar datos bancarios.
- **Billing:** los endpoints de checkout, webhook, portal y estado de membresía requieren configuración y controles de producción. La redirección del navegador no concede acceso por sí sola.
- **Seats de organización:** el plan business está ligado al usuario contratante y al nombre de organización; no se documentan seats, invitaciones ni transferencia de acceso a empleados como implementados.
- **AI Lounge:** los enlaces a plataformas externas son referencias de descubrimiento, no prueba de pase, patrocinio, afiliación ni autorización.
- **ROR:** el registro de organización es una meta institucional futura; un ROR ID no constituye por sí mismo incorporación legal ni verificación criptográfica.

Antes de activar pagos, revisar [Membership Billing Runbook](docs/production/membership-billing-runbook.md) y la [auditoría de despliegue y membresías](docs/audit/2026-11-23-production-deployment-memberships-audit.md).

## Base de datos y operaciones

- PostgreSQL es la persistencia principal documentada para la aplicación.
- Drizzle ORM administra el acceso desde el código.
- PG_POOL_MAX admite un valor entre 1 y 20, con valor por defecto 3.
- pnpm db:preflight y pnpm db:preflight -- --strict son diagnósticos de sólo lectura.
- pnpm db:migrate ejecuta el flujo de migraciones sujeto a las comprobaciones documentadas; no debe aplicarse en producción sin preflight estricto y backup/restore comprobado.
- La migración migrations/0004_public_rate_limits.sql debe verificarse en la base de datos correcta. Si la tabla de rate limits no existe, el limitador puede responder 503 de forma fail-closed; no se debe eludir el control abriendo solicitudes sin límite.
- No se deben compartir cadenas de conexión, tokens, dumps o datos personales en issues o PR.

## Seguridad y preparación para producción

Las referencias principales son [triple hardening](docs/security/triple-hardening.md), [triple hardening controls](docs/security/triple-hardening-controls.md), [release readiness](docs/security/release-readiness.md), [baseline audit](docs/audit/2026-11-baseline.md) y la auditoría integral enlazada arriba.

Los controles se organizan en tres planos:

1. **Criptografía y datos:** TLS, gestión de cifrado, digests, rotación de claves y recuperación de backups, según el entorno.
2. **Aplicación e identidad:** autorización deny-by-default, validación server-side, sesiones, rate limits, redirecciones seguras y cadena de suministro.
3. **Gobernanza y operación:** consentimiento, retención, moderación, apelaciones, aprobaciones y gestión de incidentes.

Antes de una liberación productiva se debe verificar, como mínimo:

- Configuración productiva de Better Auth, URL base, secreto fuerte y cookies seguras.
- Variables de entorno configuradas en el proveedor de despliegue; un archivo .env.example no demuestra que existan secretos configurados.
- Instalación reproducible desde lockfile, pruebas, typecheck, build y revisión de dependencias.
- Migraciones, preflight, backup y restauración ensayada en el entorno adecuado.
- Pruebas de autorización y aislamiento de datos con sesiones de prueba.
- Workflow de licencias/SBOM completado y artefactos vinculados al SHA liberado.
- Revisión de privacidad, términos, marca, afiliaciones y cadena de titularidad.
- Estado real de despliegue y métricas observadas; no declarar mediciones si no existen datos.

No se declara que el sistema esté al 100 % en producción, que tenga seguridad absoluta, no-repudio, cumplimiento normativo, PQC efectivo o certificación externa.

## Desarrollo local

Requisitos: Node.js compatible con las dependencias del lockfile y pnpm 12.16.1, conforme a package.json. Usa una base de datos de desarrollo o pruebas; no ejecutes migraciones contra producción como parte de una validación local.

Instalación y comprobaciones:

    pnpm install --frozen-lockfile
    pnpm test
    pnpm typecheck
    pnpm build
    pnpm audit --prod --audit-level high
    pnpm hf:snapshot
    pnpm dev

Si una comprobación falla, registra el comando, versión de Node/pnpm, SHA del commit, salida relevante y si el fallo procede del código, de la configuración o de una dependencia externa. No marques como exitoso un comando que no se ejecutó.

Variables de entorno y credenciales deben gestionarse localmente o mediante el gestor de secretos del entorno. No incluyas archivos .env reales en Git.

## Licenciamiento híbrido y derechos

La propuesta distingue capas que no deben aplicarse automáticamente al mismo activo:

| Capa | Instrumento propuesto | Alcance previsto | Estado |
|---|---|---|---|
| Software original público | Apache License 2.0 (Apache-2.0) | Sólo el material comprendido por LICENSE y con derechos de redistribución acreditados | LICENSE existe; alcance por activo aún requiere revisión |
| Documentación editorial | Creative Commons Attribution 4.0 (CC BY 4.0) | Documentos identificados expresamente y libres de restricciones de terceros | No aplicar por extensión ni asumir que cubre todo docs/ |
| Bases de datos públicas seleccionadas | Open Data Commons ODbL 1.0 | Datasets identificados, autorizados y acompañados de manifiesto | Reservada para datasets revisados; no activa por defecto |
| Activos privados | Borrador de licencia privada TAMV | Sólo activos enumerados en un anexo y con cadena de titularidad probada | Borrador no aprobado ni firmado |
| Marca y afiliación | Política y autorizaciones separadas | Nombres, logos, afiliaciones, credenciales y representaciones oficiales | Borrador pendiente de verificación jurídica |
| Datos personales | Avisos y contratos de tratamiento independientes | Tratamiento con finalidades, transparencia, seguridad y base jurídica aplicable | No lo resuelve una licencia de software |

Documentos de referencia:

- [Mapa de licencias y derechos](LICENSES/README.md)
- [Resumen de alcance](LICENSES.md)
- [Estado de licenciamiento](docs/governance/licensing-status.md)
- [Plan de implementación](docs/legal/LICENSING-IMPLEMENTATION-PLAN.md)
- [Registro de activos](docs/legal/asset-register.csv)
- [Borrador de licencia privada](LICENSES/TAMV-PRIVATE-LICENSE-DRAFT.md)
- [Borrador de política de marca y afiliación](LICENSES/TRADEMARK-AND-AFFILIATION-POLICY-DRAFT.md)
- [Síntesis de investigación](docs/legal/RESEARCH-SYNTHESIS-HYBRID-LICENSING.md)

La licencia privada no puede revocar retroactivamente derechos concedidos válidamente bajo Apache-2.0. CC BY no debe usarse para software. ODbL no autoriza por sí sola la divulgación de datos personales ni resuelve todos los derechos sobre contenido individual. Las contribuciones no se consideran cedidas a TAMV sólo por aparecer en GitHub, una comunidad o una conversación.

El registro inicial de activos contiene filas de ejemplo y está marcado UNREVIEWED. Hasta completar la revisión de cada activo, no debe usarse como prueba de titularidad ni como autorización para publicar datos, contenido de terceros, credenciales, información confidencial o materiales culturalmente restringidos.

**Revisión profesional pendiente:** la política final, la cadena de titularidad, los contratos de contribución, la protección de datos, las condiciones de membresía y los derechos de marca requieren revisión por asesoría jurídica cualificada en México antes de adoptarse como vinculantes.

## Contribuir

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) antes de abrir un pull request.

- Explica el problema, los pasos para reproducirlo y un criterio de aceptación.
- Añade pruebas relevantes y reporta sólo resultados que se hayan ejecutado.
- Documenta los cambios de API, migraciones, variables de entorno y riesgos de compatibilidad.
- Identifica origen, licencia y versión de los componentes o materiales externos.
- No subas secretos, credenciales, datos personales ni activos cuya publicación no esté autorizada.
- No afirmes certificación, afiliación, titularidad o cumplimiento sin evidencia verificable.
- Mantén alineadas las versiones en español e inglés cuando ambas existan.

## Investigación y fuentes

Conserva URL canónica, identificador, fecha de consulta, versión inspeccionada, licencia aplicable y estado de revisión para cada fuente. Distingue títulos localizados por una búsqueda bibliográfica de textos completos efectivamente revisados. La síntesis de licenciamiento registra literatura localizada y temas de compatibilidad; sus referencias deben completar metadatos y validación de texto completo antes de usarse como bibliografía académica definitiva.

## Contacto y reportes de seguridad

No publiques vulnerabilidades explotables, tokens, datos personales ni registros privados en issues públicos. Utiliza el mecanismo privado de reporte de vulnerabilidades de GitHub si está habilitado para el repositorio, o un canal institucional verificado. No asumas que un reporte fue recibido hasta contar con confirmación explícita.

## Aviso final

TAMV Online Network se desarrolla como un proyecto tecnológico y de memoria en evolución. Las descripciones, estados de madurez, integraciones, licencias y métricas deben interpretarse con referencia al commit, al entorno y a la evidencia concreta. Este README no sustituye los contratos, licencias completas, avisos de privacidad, documentación de terceros ni una auditoría independiente.
