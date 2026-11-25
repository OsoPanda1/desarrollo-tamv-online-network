# Mapa de controles de triple endurecimiento / Triple-hardening control map

Estado: inventario de implementación, **no una certificación**. Estándar de referencia: [`triple-hardening.md`](triple-hardening.md). Última prueba local: 2026-11-25. Responsable de cada control: mantenedor del repositorio (asignación formal pendiente). Próxima revisión: antes de cada despliegue de producción y, como máximo, 2026-12-25.

Tres planos independientes cubren fallos distintos: A (criptografía/almacenamiento/evidencia), B (aplicación/identidad/ejecución) y C (gobernanza/operación). Apilar tres algoritmos sobre el mismo payload **no** es triple endurecimiento. Los estados significan:

- **Implementado**: hay código o configuración verificable en este repositorio y una prueba ejecutable local. No implica despliegue ni revisión externa.
- **Parcial**: existe una parte verificable; el cierre depende de infraestructura, revisión o evidencia que este repositorio no puede generar.
- **Pendiente**: no hay evidencia de cierre para el SHA candidato.
- **No implementado**: el control no existe; no se simula.

## Plano A — criptografía, almacenamiento y evidencia

| Control | Implementación / configuración | Evidencia ejecutable | Estado y límite |
|---|---|---|---|
| HTTPS/TLS y origen inseguro | `lib/auth.ts` — `trustedOrigin()` solo acepta `https:` fuera de desarrollo; orígenes con credenciales se descartan. | `tests/triple-hardening-contract.test.mjs` | **Implementado** en la app. La terminación TLS en el edge es responsabilidad del proveedor y no se verifica aquí. |
| Cifrado en reposo gestionado | No hay configuración de cifrado en el repositorio. | — | **Pendiente**: confirmar en el proveedor de DB/backups sin publicar secretos. |
| AEAD para campos sensibles | No hay campos cifrados a nivel de aplicación. | — | **No implementado**: no se simula AES-GCM/ChaCha20 ni se inventa un modelo de amenaza. |
| Claves en KMS/secret manager y fuera del bundle | `.env.example` contiene solo marcadores; `lib/auth.ts` y adaptadores leen variables de entorno; `.github/workflows/secret-scan.yml` detecta secretos confirmados. | `tests/triple-hardening-contract.test.mjs` | **Parcial**: contrato de configuración y escaneo presentes; rotación real, KMS y revisión de alertas son externos (los workflow actualmente fallan sin logs recuperables). |
| Envelopes versionados, rotación, revocación y recuperación | No existe esquema de envelopes cifrados. | — | **No implementado**. |
| Digests para detección de cambios | `scripts/write-build-evidence.mjs` (SHA-512 de manifiestos seleccionados), `lib/research/provenance.ts` (SHA-256/SHA3-512 canónicos). | `tests/tamv-sovereign-console.test.mjs`, `tests/visual-system-contract.test.mjs` | **Implementado** como digest. Un hash no es firma, sello de tiempo, autoría ni aprobación de CI; la UI lo declara explícitamente. |
| Firmas institucionales controladas | `components/tamv-evidence-verifier.tsx` verifica Ed25519 **en el navegador** con clave aportada por la persona usuaria; no hay clave de firma institucional ni payload canónico firmado. | `tests/tamv-sovereign-console.test.mjs` | **No implementado** en el servidor. La demostración local no toma decisiones. |
| Seguridad post-cuántica | No hay interoperabilidad PQC ni ciclo de vida de claves PQC. | — | **No implementado**. No se usa el término como afirmación de seguridad. |
| Backups cifrados y restauración probada | No hay drill ni evidencia de restauración. | — | **Pendiente**: requiere base controlada y permisos de operador. |

## Plano B — aplicación, identidad y ejecución

| Control | Implementación / configuración | Evidencia ejecutable | Estado y límite |
|---|---|---|---|
| Denegar por defecto; autenticar y autorizar por propietario/rol/estado | Rutas de escritura usan `getRequestSession()`, `requireModeratorRequest()`, filtros `userId` y transiciones de estado en `app/api/v1/research/**`, `app/api/v1/hcu/**`, `app/api/v1/admin/bootstrap` y `app/api/memberships/**`. | `tests/security-validation.test.mjs`, `tests/membership-billing-contract.test.mjs`, `tests/triple-hardening-contract.test.mjs` | **Implementado** en código; las pruebas son de contrato estático. Faltan pruebas negativas HTTP con sesiones reales. |
| Cookies HttpOnly/Secure/SameSite/ruta | `lib/auth.ts` fija `httpOnly: true`, `secure: true`, `path: "/"` y `sameSite: "lax"` en producción (`"none"` solo en desarrollo). | `tests/triple-hardening-contract.test.mjs` | **Implementado** en configuración. La inspección de cookies en staging sigue pendiente. |
| Rotación de sesión tras autenticación/cambio de privilegios | Better Auth gestiona la sesión; no hay una prueba que demuestre rotación en este repositorio. | — | **Pendiente**: verificar con sesión real en staging. |
| Validación y límites server-side | Zod estricto, `readJsonBody()` con techo de bytes, timeouts de fetch y paginación acotada en rutas públicas y privadas. | `tests/security-validation.test.mjs`, `tests/institutional-research-federation.test.mjs`, `tests/provenance-validation-route.test.mjs` | **Implementado** para las rutas cubiertas. |
| IDOR/BOLA | Cada consulta privada filtra por `session.user.id`; la autoría se comprueba antes de evidencia, consentimiento, apelación y TQAF. | `tests/security-validation.test.mjs` + matriz estática | **Parcial**: sin prueba de "otro usuario" ejecutándose contra HTTP. No se considera cerrado. |
| Límite de tasa | `lib/rate-limit/server.ts` usa contadores PostgreSQL atómicos y falla cerrado con 503; cubre federated, provenance, metadata y assistant. Existen límites por usuario para propuestas, intereses, simulación y HCU privado. | `tests/distributed-rate-limit.test.mjs`, `tests/public-rate-limit-routes.test.mjs` | **Parcial**: login/registro, exportaciones y notificaciones aún sin límite de aplicación; `migrations/0004` no aplicada. |
| CSRF / open redirect / XSS / SQLi / SSRF / prompt injection / agotamiento | Origin guard (`lib/http.ts`), `resolveInternalRedirect()`, renderizado React sin HTML inyectado, consultas Drizzle parametrizadas, URIs públicas filtradas en provenance y adapters con destino fijo, contenido recuperado marcado como no confiable en `lib/isabella-agent.ts`, topes de cuerpo/tiempo. | `tests/security-validation.test.mjs`, `tests/provenance-validation-route.test.mjs`, `tests/institutional-research-federation.test.mjs`, tests de rate limit | **Parcial**: defensas de código presentes; faltan pruebas de explotación en staging, WAF/CDN y CSP enforcement. |
| Política de IA: herramientas permitidas y acciones humanas | `lib/isabella-agent.ts` limita herramientas a dos lecturas públicas, `toolCallConcurrency: 1` y prohíbe ejecutar acciones; el router de la home es solo local. | `tests/tamv-sovereign-console.test.mjs`, `tests/isabella-search.test.mjs` | **Implementado** en la interfaz actual; registro de proveedor/modelo y aprobaciones humanas para acciones consecuenciales queda **pendiente**. |
| Dependencias fijas, auditoría, secret scan, SBOM y artifacts ligados a commits | `pnpm-lock.yaml`, `pnpm audit --prod --audit-level high`, workflow de secret scanning, manifiesto de build con SHA-512 de archivos seleccionados. | `tests/pnpm-lock-react-contract.test.mjs`, evidencia local de build/audit | **Parcial**: SBOM no se genera; CI/CodeQL/secret scan no tienen logs recuperables en este momento, por lo que no se afirma que pasaron. |

## Plano C — gobernanza y operación

| Control | Implementación / configuración | Evidencia ejecutable | Estado y límite |
|---|---|---|---|
| Clasificación, consentimiento, visibilidad, apelación y borrado | Estados privados/publicados, consentimiento y apelación en rutas de research; docs de gates y runbook de membresía. | `tests/security-validation.test.mjs`, `tests/production-membership-docs.test.mjs` | **Parcial**: la política de retención/borrado no tiene prueba operativa automatizada. |
| Eventos de seguridad append-only con actor, acción, objetivo, hora, traza y resultado | No existe un registro de eventos de seguridad central. Los hashes de research cubren integridad de eventos de dominio, no auditoría de seguridad. | — | **No implementado**: no se inventa un log. |
| Revisión de cambios sensibles y separación de privilegios de despliegue | Ramas `feat/**`, `fix/**`, `security/**` en los workflows; `docs/security/release-gates.md` describe el requisito. | `.github/workflows/*.yml` | **Pendiente**: branch protection, revisores y permisos de deploy dependen del administrador de GitHub; no verificados. |
| Runbooks de incidentes, vulnerabilidades, backup/restore, contingencia y compromiso de claves | Hay runbook de membresía y criterios de readiness; falta el conjunto completo. | — | **Pendiente**. |
| Inventario de controles con dueño, estado, evidencia y fechas | Este documento fija estado, evidencia y fechas; el dueño formal queda por asignar. | `tests/triple-hardening-contract.test.mjs` | **Parcial**: inventario versionado, sin aprobación de dueño ni revisión externa. |
| Correcciones editoriales y procedencia de afirmaciones públicas | `docs/audit/`, esquema de procedencia y validación de URIs; la UI separa catálogo de integración activa. | `tests/provenance-validation-route.test.mjs`, tests de consola | **Parcial**: la validación de procedencia es de esquema; no verifica autoría, firma, tiempo confiable, peer review ni acreditación. |
| Gobernanza constitucional LATAMV 2.0 | Evaluador local `lib/governance/latamv-v2.ts` con vigencia, denegación por defecto, `strictest-wins` y conteo de aprobaciones; panel CDV en la consola. Especificación en [`docs/governance/latamv-v2-specification.md`](../governance/latamv-v2-specification.md). | `tests/latamv-v2-policy.test.mjs`, tests de consola | **Parcial**: solo lógica determinista sobre datos de ejemplo. No verifica firmas, no hay quórum criptográfico, pruebas ZK, auto-sanación real, pasaporte ni cumplimiento legal. |

## Compuertas obligatorias del estándar

| Compuerta | Estado para este SHA local |
|---|---|
| Instalación limpia desde lockfile | **Parcial**: se usa `pnpm install --frozen-lockfile` en CI; la instalación limpia local se da por resuelta por el entorno de trabajo, sin evidencia nueva de CI. |
| Typecheck, tests y build | **Implementado localmente**: 159/159 tests, `typecheck` OK, `build` OK; ver `latamv-v2-local-validation.txt`. Lint no tiene script dedicado. |
| Migración y recuperación en base desechable | **Pendiente**: `0004_public_rate_limits.sql` no se ha aplicado ni probado con backup/restore. |
| Pruebas de autorización anónimo/propietario/otro usuario/moderador/admin | **Pendiente**: sin base/sesiones de staging controladas. |
| Secret scan, auditoría de dependencias y credenciales solo server-side | **Parcial**: `pnpm audit` sin vulnerabilidades altas; workflow de secret scan sin logs recuperables. |
| Smoke de rutas y health sin filtrar entorno | **Parcial**: liveness/readiness y payloads tienen pruebas locales; sin smoke de deploy. |
| Restauración de backup y revisión de incidentes | **Pendiente**. |

## Límites de afirmación

No se afirma "triple cifrado", "zero trust", "quantum secure", "tamper-proof", "certificado", "no repudio", cumplimiento normativo ni seguridad absoluta. Tres planos de control son una arquitectura de defensa en profundidad; su eficacia depende de evidencia de despliegue, revisión y operación que todavía no está completa. Este mapa debe actualizarse en el mismo commit que cambie un control o su prueba.
