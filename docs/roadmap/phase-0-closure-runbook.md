# Fase 0 — runbook de cierre y evidencia

**Corte:** 27 de noviembre de 2026  
**Ámbito:** integridad del repositorio, compilación, controles LGS, CI/seguridad y preparación de base de datos/rate limit.  
**Principio de seguridad:** esta guía no autoriza cambios en producción. No se ejecutan migraciones ni se activan secretos sin aprobación explícita, backup verificado y evidencia de staging.

## Estado de cierre

Fase 0 tiene tres bloques. El código y los contratos se pueden preparar en el repositorio; el cierre operativo exige resultados reales ligados al SHA candidato.

| ID | Criterio | Evidencia exigida | Estado conocido |
|---|---|---|---|
| M0.1 | Build, typecheck, suite y LGS | CI PASS + pruebas en SHA candidato + preview | Correcciones propuestas en PR #50; CI no ha ejecutado pasos |
| M0.2 | GitHub Actions, CodeQL, detección de secretos | Cada workflow con job y pasos ejecutados, logs y SHA identificable | Bloqueado: ejecuciones fallidas sin pasos/logs recuperables |
| M0.3 | Migración 0004, preflight y rate limit compartido | Staging identificado, backup/restauración probados, preflight antes/después y pruebas HTTP 429/503 | Bloqueado por falta de evidencia de base de datos/secretos de staging |

No interpretar “workflow failed con `steps: []`” como un error del código ni como un análisis de seguridad aprobado. Es un resultado no concluyente.

## M0.1 — integridad del build y LGS

Ejecutar desde un checkout limpio del SHA candidato, usando Node.js 22 y pnpm 12.16.1, igual que el workflow:

```bash
corepack enable
corepack prepare pnpm@12.16.1 --activate
node --version
pnpm --version
pnpm install --frozen-lockfile
node --check scripts/db-migrate.mjs
node --check scripts/db-preflight.mjs
node --check scripts/db-migration-contract.mjs
pnpm test
pnpm typecheck
pnpm build
pnpm audit --prod --audit-level high
```

Todos los comandos deben ejecutarse sobre el mismo SHA y conservarse sus códigos de salida. No reutilizar un resultado de otro commit. El build ejecuta `scripts/write-build-evidence.mjs`; inspeccionar el diff posterior y no confirmar artefactos generados sin revisar qué representan.

### Pruebas específicas LGS

- El parser JSX compila `components/lgs/lgs-risk-assessment-panel.tsx`.
- La ruta `/portal/lgs` importa el renderer privado existente y ejecuta `requireLgsFounder()` antes de leer la especificación.
- El guard exige sesión autenticada, correo de fundador verificado, rol admin, feature flag y revisión independiente; la política actual mantiene MFA resistente al phishing sin satisfacer y por tanto debe denegar acceso hasta que exista una implementación real.
- La especificación se lee sólo desde `LGS_CANONICAL_SPEC_MARKDOWN` del servidor; nunca desde `NEXT_PUBLIC_*`, el bundle de cliente, Git o logs.
- Sin especificación configurada, el panel debe mostrar el estado seguro y no filtrar contenido.
- La ruta declara `noindex`, `nofollow`, `noarchive` y `nosnippet`; estas directivas no sustituyen autorización del servidor.

**Criterio PASS:** suite completa, typecheck y build terminan en cero; las pruebas negativas de autorización pasan; el artefacto no incluye la especificación privada. Hasta disponer de análisis de bundle o prueba de runtime, la última condición sigue pendiente.

## M0.2 — GitHub Actions, CodeQL y secret scanning

1. Abrir los workflows CI, CodeQL y Secret scanning en la pestaña Actions.
2. Verificar que Actions está habilitado a nivel de repositorio/organización, que los workflows no están deshabilitados y que la política permite las acciones fijadas por SHA.
3. Revisar cuota/minutos de Actions, concurrencia, políticas de forks/PR y disponibilidad de runners alojados. No imprimir tokens ni cambiar permisos amplios como prueba.
4. Ejecutar `workflow_dispatch` desde la interfaz después de confirmar que los workflows aparecen habilitados.
5. Para cada run, guardar URL, SHA, estado, nombre de job, tiempos y pasos. Si no hay job, runner o pasos, escalar como bloqueo de plataforma; no marcarlo PASS.
6. Requerir:
   - CI: instalación congelada, validaciones de scripts, suite, typecheck y build.
   - Auditoría: `pnpm audit --prod --audit-level high`.
   - CodeQL: análisis TypeScript/JavaScript con consultas de seguridad ampliadas.
   - Secret scanning: análisis del historial completo y diff, sin subir artefactos ni publicar comentarios automáticos.
7. Corregir hallazgos reales y volver a ejecutar en un nuevo SHA. Un re-run vacío no sustituye logs de ejecución.

**Criterio PASS:** todos los jobs completan con resultados verificables asociados al SHA candidato; sin hallazgos críticos/altos abiertos y con los falsos positivos documentados. Los checks requeridos deben configurarse como protección de rama después de verificar sus nombres exactos en GitHub.

## M0.3 — PostgreSQL y rate limiting compartido

### Preparación segura

- Identificar explícitamente el entorno de staging y confirmar la identidad de base de datos/rol/esquema que reporta el plan.
- Confirmar que el gestor de secretos tiene un `DATABASE_URL` de staging y un `TAMV_RATE_LIMIT_SALT` aleatorio, secreto, específico del entorno y de al menos 32 caracteres. No mostrar ni copiar los valores en tickets, logs o chat.
- Preparar un backup consistente y verificar restauración en un entorno separado antes de cualquier escritura.
- Confirmar que el proveedor permite conexiones, advisory locks y las operaciones de las migraciones.
- No ejecutar `pnpm db:migrate:apply` en producción como parte de este cierre.

### Plan y migración

```bash
pnpm db:preflight
pnpm db:migrate
```

El segundo comando genera un plan de sólo lectura y un digest vinculado a la identidad de base de datos, archivos de migración y estado aplicado. Revisar manualmente base, rol, esquema, migraciones pendientes y hashes. Sólo tras aprobar el plan, disponer del backup verificado y comprobar el preflight estricto, aplicar con el digest exacto recién generado:

```bash
pnpm db:migrate:apply -- --plan-digest=<DIGEST_RECIEN_REVISADO>
pnpm db:preflight
```

No reutilizar un digest de otra ejecución, entorno o cambio de archivos. El migrador debe abortar si el digest no coincide, si el esquema no es `public`, si falta el historial en una base que ya tiene tablas de aplicación, si otro migrador mantiene el lock o si el preflight estricto falla.

### Validación del rate limiter

- Probar en staging el límite permitido y la petición siguiente; confirmar respuesta HTTP 429 y cabeceras/tiempos coherentes.
- Interrumpir de forma controlada el almacén compartido y confirmar HTTP 503, no bypass silencioso.
- Eliminar temporalmente la sal sólo en un entorno de prueba aislado y confirmar 503 por configuración inválida antes de llegar al almacén.
- Probar varias instancias/solicitudes concurrentes para verificar que el contador es compartido y atómico.
- Verificar que se persisten claves HMAC, no IPs en texto claro; comprobar caducidad/limpieza de contadores y costes de crecimiento de la tabla.
- Confirmar que el modo deshabilitado no se activa por accidente en local y que el comportamiento de producción coincide con la política de despliegue documentada.

**Criterio PASS:** backup y restauración demostrados; plan y migración con digest aprobado; preflight posterior limpio; 429/503 comprobados; contador compartido verificado; ningún secreto expuesto. Si no se dispone de credenciales/entorno, el criterio queda bloqueado, no aprobado.

## Registro de evidencia por SHA

Completar por cada candidato:

| Campo | Valor requerido |
|---|---|
| SHA completo | Commit exacto probado |
| Node / pnpm | Versiones reales |
| Install frozen | PASS/FAIL + log |
| Tests | PASS/FAIL + conteo y log |
| Typecheck / build | PASS/FAIL + log |
| Audit / CodeQL / secret scan | URL, conclusión y hallazgos |
| LGS | Autorización positiva/negativa y privacidad del bundle |
| DB | Identidad redactada, digest, backup/restore, preflight antes/después |
| Rate limit | Evidencia 429, 503, concurrencia y no persistencia de IP |
| Vercel Preview | URL y SHA desplegado; prueba de ruta |
| Decisión | PASS, FAIL o BLOCKED; responsable y siguiente acción |

Redactar host/usuario si pudieran identificar infraestructura sensible. Nunca adjuntar URLs de conexión, tokens, claves privadas ni la especificación LGS.

## Reversión y respuesta a incidentes

- Antes de migrar: backup verificable y plan de restauración aprobado.
- Ante error de migración: detener; conservar error sin secretos; confirmar si la transacción se revirtió; no editar una migración ya aplicada, crear una migración correctiva nueva.
- Ante 503 del rate limiter: mantener el fallo cerrado, comprobar conectividad, migración y sal sin exponerla. No desactivar el control para restaurar disponibilidad sin evaluación de riesgo.
- Ante secreto expuesto: revocar/rotar primero, luego limpiar historial según política; borrar el archivo no invalida el secreto filtrado.
- Ante build/CI sin runner: no alterar el código a ciegas; recuperar la capacidad de Actions y volver a ejecutar.

## Dictamen de cierre

La Fase 0 sólo puede declararse cerrada cuando M0.1, M0.2 y M0.3 tengan evidencia PASS del mismo SHA/release. La documentación y los tests contractuales reducen riesgo, pero no reemplazan ejecución CI, staging ni pruebas de base de datos.