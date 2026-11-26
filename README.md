# TAMV Online Network

**Tecnología Avanzada Mexicana Versátil · Territorio Autónomo de Memoria Viva**

**Proyecto impulsado con colaboración de tecnología latinoamericana TAMV ONLINE NETWORK Orgullosamente Realmontenses.**

Producto: **PLAY & GO**. Este nombre se conserva en las superficies institucionales y de auditoría; no se sustituye por una marca de terceros.

Iniciativa mexicana independiente de investigación, tecnología, memoria territorial y sistemas de evidencia. El repositorio principal es `OsoPanda1/desarrollo-tamv-online-network`; la rama de trabajo validada se integra en `main` de forma aditiva, sin rebase ni reescritura de historial publicado.

---

## Estado actual de la validación

> **Alcance de los resultados históricos:** la siguiente tabla conserva los resultados de una ejecución local previa reportada durante la integración. En ese registro no quedó asociado un SHA reproducible. Por tanto, **no valida automáticamente el HEAD actual del PR #45**, que incluye cambios posteriores de medios, estilos, documentación y una prueba de regresión nueva.

| Comando — ejecución local previa | Resultado reportado |
|---|---|
| `pnpm test` (`node:test`) | **174/174 pruebas** |
| `pnpm typecheck` | OK |
| `pnpm build` (Next.js 16.4.6) | OK |
| `pnpm audit --prod --audit-level high` | Sin vulnerabilidades conocidas |

### Validación del HEAD actual

- Los workflows CI, CodeQL y secret scan del commit `0cef1eeec8ff0b25322102c25a6e94416ad4f2d0` concluyeron `failure` antes de ejecutar pasos. Los jobs disponibles muestran `runner_id: 0` y `steps: []`; no hay logs de pasos con causa verificable. Esto **no demuestra** que falle el código ni que se hayan encontrado secretos.
- La prueba nueva `tests/home-media-visibility.test.mjs` aún no se ha ejecutado. No hay resultado confirmado de typecheck, instalación congelada, suite completa ni build de producción para ese SHA.
- La revisión del estado de commit mostró Vercel `pending`; una Preview lista para navegador no está comprobada. Un comentario previo del proveedor informó que se había alcanzado el límite diario de despliegues.
- El build local previo mostró advertencias de Better Auth relativas a `BETTER_AUTH_URL`/base URL y secreto por defecto. La configuración productiva sigue siendo un gate pendiente; la presencia de variables en `.env.example` no demuestra que estén definidas en el gestor de secretos.
- `public/build-evidence.json` se había regenerado durante una validación local anterior y se revirtió antes del commit; no se debe sustituir evidencia del repositorio por un artefacto local sin identificar el commit y el entorno.
- No se declara un deploy de producción ni métricas reales. Analytics/Speed Insights necesitan un despliegue y tráfico efectivos.
- La auditoría actual, con evidencia y orden de cierre, está en [`docs/audit/2026-11-26-total-project-audit.md`](docs/audit/2026-11-26-total-project-audit.md).

---

## Stack y superficies

- **Aplicación**: Next.js 16.4.6, App Router, React 19.3.1, TypeScript.
- **Datos**: PostgreSQL con Drizzle ORM; pool configurado por `PG_POOL_MAX`.
- **Autenticación**: Better Auth; exige HTTPS, cookies endurecidas y configuración productiva antes de habilitarse.
- **Validación**: Zod en contratos de API y envelopes de procedencia.
- **Observabilidad**: `@vercel/analytics/next` y `@vercel/speed-insights/next` se renderizan en el layout raíz **sólo en producción**.
- **Repositorio institucional companions**: `OsoPanda1/tamvonline-weboficial.com`.
- **Repositorio canónico Creator OS**: `AnubisVillasenor1/tamv-creator-intelligence`, con CI 3/3 OK y deployment `dpl_EYkn7wcJWfWr4nurAzc66kKKSXMG` en estado READY según la metadata consultada. Ese estado pertenece a ese repositorio; no se traslada automáticamente a esta app.

Las superficies activas incluyen:

- `/` — consola Living Atlas con revelado progresivo y navegación bilingüe.
- `/quienes-somos`, `/origenes`, `/guia`, `/institucionalizacion` — identidad, carta, guía práctica y hoja de ruta institucional.
- `/investigacion`, `/proyectos`, `/investigadores`, `/fuentes` — investigación editorial y registros públicos.
- `/hcu`, `/atlas`, `/portal/hcu` — observatorio HCU con campo 3D interactivo, modos analíticos y visualización territorial.
- `/formacion`, `/membresias`, `/apoyar` — formación, membresías y apoyo institucional transparente.
- `/ecosistema`, `/ecosistema/metadata`, `/desarrolladores` — descubrimiento federado y contrato público.
- `/auditoria-creator` — dossier de Creator OS con límites explícitos de firma y verificación.

### HCU observatory and institutional interface

`/hcu` usa el grafo público de PostgreSQL con campo 3D interactivo, modos analíticos y lectura alternativa en 2D. El corpus `graph.js` del sitio institucional estático es documental y **no se sincroniza automáticamente** con el grafo de la aplicación. Las métricas y el layout son codificaciones descriptivas, no predicciones causales ni evidencia de validación independiente. Ver [`docs/architecture/hcu-observatory-v2.md`](docs/architecture/hcu-observatory-v2.md).

---

## Auditoría W1–W8 y blueprint TPVA

La revisión W1–W8 cerró con:

- Digest de auditoría: `sha256:b233fb962557debc22e5e5d4356241b458ed1d8a1176007ad59750da2cf9a1cd`.
- KeyId de referencia: `sha256:6b8a20278fbe7610b0df1489ade107cd8d943f3977cbe985d9c1cfa10958f229`.
- Blueprint maestro: [`docs/security-review/TPVA_MASTER_BLUEPRINT.md`](docs/security-review/TPVA_MASTER_BLUEPRINT.md), SHA-256 `04F9728B88E36F016374D47B2DF1BF4AA06E20F7B55D426BF9C4D235DD000951`.

**TPVA (TAMV Proof & Verification Atlas)** convierte la infraestructura existente en procedencia, integridad, revisión y evidencia pública. La fuente de verdad del recibo es TPVA: Atlas indexa sin reescribir payloads; LITLE se usa sólo como adaptador auditado, nunca como primitiva criptográfica.

Distinción no negociable:

- TPVA puede automatizar comprobaciones, generar recibos propios y preparar paquetes de revisión.
- Una insignia externa existe **sólo si un tercero la emite**. Una autoevaluación, un score automatizado o un recibo firmado por TAMV no es certificación externa.
- `VERIFIED`, `WITH NOTES`, `FAILED`, `UNVERIFIED` y `REVOKED` son estados de evidencia TPVA, no sellos de terceros.
- No se afirma no-repudio, cumplimiento normativo, PQC efectivo, SLSA runtime ni seguridad absoluta.

### Fase 1 implementada

La Fase 1 del blueprint quedó implementada y probada:

- [`docs/specs/tpva-receipt-v1.md`](docs/specs/tpva-receipt-v1.md) — contrato y límites.
- [`docs/specs/tpva-receipt-v1.schema.json`](docs/specs/tpva-receipt-v1.schema.json) — esquema `tpva-receipt/v1`.
- [`lib/proofs/canonical.ts`](lib/proofs/canonical.ts) — canonicalización determinista.
- [`lib/proofs/hash.ts`](lib/proofs/hash.ts) — SHA-256 del payload canónico.
- [`lib/proofs/validate.ts`](lib/proofs/validate.ts) — validación estricta y rutas seguras.
- [`lib/proofs/verify.ts`](lib/proofs/verify.ts) — verificador offline fail-closed.
- [`docs/specs/tpva-test-vectors/`](docs/specs/tpva-test-vectors/) — 15 vectores positivos y negativos.
- [`tests/tpva-receipt-v1.test.mjs`](tests/tpva-receipt-v1.test.mjs) — 9 pruebas con Ed25519 real generado en memoria.

El hash canónico excluye `receipt_hash` y `signature`, ordena claves y arrays y normaliza fechas UTC. La firma cubre exactamente esos bytes. `review.external: true` o `review.type: "independent"` **nunca** producen una insignia externa: offline se degradan a `WITH NOTES`. Ninguna clave privada se guarda en disco; el material PQC de LITLE se trata como stand-in no probado.

Las fases 2–7 del blueprint (Evidence Pack Builder, firma KMS/HSM, persistencia append-only, API `/api/v1/proofs`, UI pública y federación Atlas/LITLE) siguen pendientes y no se presentan como implementadas.

---

## LATAMV 2.0

LATAMV 2.0 está integrado como **spec / evaluador local determinista**:

- [`lib/governance/latamv-v2.ts`](lib/governance/latamv-v2.ts) — selección de reglas por jurisdicción, ventana de validez y decisión fail-closed.
- [`docs/governance/latamv-v2-specification.md`](docs/governance/latamv-v2-specification.md) — especificación y límites.
- [`tests/latamv-v2-policy.test.mjs`](tests/latamv-v2-policy.test.mjs) — 9 pruebas de política.
- El panel público `/gobernanza` es un evaluador local y nunca afirma autorización productiva.

`requiredApprovals()` devuelve aritmética `[1,1,2,2,3]`; no verifica identidades. `signatureMetadata` es una etiqueta no verificada. `verifyRuntimeProvenance()` sigue `{ verified: false, status: "not-integrated" }`.

**No implementados:** ZK, quórum criptográfico real, auto-sanación, pasaporte soberano, negociación jurisdiccional ejecutable y cumplimiento legal. No se presentan como functionalities terminadas.

---

## Puente Hugging Face (metadatos públicos)

Se reparó el shim local de `hf` y se usa `huggingface_hub`/CLI 2.4.0 con `hf auth whoami` = `AnubisVilla`. El puente es deliberadamente local y acotado:

- [`scripts/hf-evidence-snapshot.mjs`](scripts/hf-evidence-snapshot.mjs) — generador con comandos de sólo lectura permitidos.
- [`pnpm hf:snapshot`](package.json) — regenera el snapshot.
- [`docs/evidence/huggingface-public-snapshot.json`](docs/evidence/huggingface-public-snapshot.json) — snapshot fechado `2026-11-26T01:53:16.697Z` con 9 modelos y 10 datasets públicos.
- [`docs/evidence/README.md`](docs/evidence/README.md) — alcance y límites.
- [`lib/huggingface/public-snapshot.ts`](lib/huggingface/public-snapshot.ts) — validación Zod del archivo comiteado.
- `GET /api/v1/huggingface` — expone el snapshot local con rate limit; **no llama a Hugging Face en runtime**.

El generador sólo ejecuta `hf models list`, `hf datasets list` y `hf version` con términos y límites fijos. No guarda tokens, repositorios privados o gated, descripciones, pesos, embeddings ni salidas de inferencia. Un listado de Hub no implica evaluación, adopción, licencia claro ni revisión externa.

---

## Observabilidad de Vercel

`@vercel/speed-insights@2.1.0` se añadió con `pnpm` y se integró en [`app/layout.tsx`](app/layout.tsx) junto a Analytics existente. Ambos componentes se montan bajo `process.env.NODE_ENV === 'production'`.

- [`tests/observability-contract.test.mjs`](tests/observability-contract.test.mjs) bloquea la dependencia, el import y el gate de producción.
- No hay script `deploy` en `package.json`.
- Core Web Vitals requieren deploy y visitas; hasta entonces el estado es “no medido”.

---

## API pública y federación

El contrato machine-readable está en [`public/openapi.yaml`](public/openapi.yaml) y la guía reproducible en [`docs/api/public-api-quickstart.md`](docs/api/public-api-quickstart.md).

Rutas públicas relevantes:

| Ruta | Función | Límite |
|---|---|---|
| `GET /api/v1/research/topics` | Catálogo editorial de temas | Público |
| `GET /api/v1/research/projects` | Registros públicos de proyectos | Público |
| `GET /api/v1/researchers` | Perfiles opt-in | Público |
| `GET /api/v1/hcu/graph` | Grafo declarativo HCU | Público; no es modelo causal validado |
| `GET /api/v1/exports/research` | JSON-LD/CSV exportable | Público |
| `GET /api/v1/ecosystem` | Catálogo de ocho sistemas | Público |
| `GET /api/v1/ecosystem/metadata` | Metadata pública de GitHub | Público; dominio fijo |
| `GET /api/v1/huggingface` | Snapshot local de metadatos públicos HF | Público; sin llamada remota |
| `POST /api/v1/provenance/validate` | Validación de envelope, 64 KiB | Público; no prueba autoría |
| `POST /api/v1/research/federated` | Puente de búsqueda institucional | Deshabilitado sin URL HTTPS configurada |

Todas las rutas abusables usan el limitador distribuido PostgreSQL con hashing de identidad y fail-closed HTTP 503. Las rutas de escritura requieren sesión y mismo origen; no son APIs anónimas.

El catálogo ecosistémico separa `catalogued`, `contracted`, `adapter_implemented` y `verified`. Estar listado no prueba conexión viva, salud de deployment ni verificación. Las fuentes canónicas y contratos están en:

- [`docs/architecture/ecosystem-federation-v1.md`](docs/architecture/ecosystem-federation-v1.md)
- [`docs/architecture/github-public-metadata-adapter-v1.md`](docs/architecture/github-public-metadata-adapter-v1.md)
- [`docs/architecture/institutional-research-federation-v1.md`](docs/architecture/institutional-research-federation-v1.md)
- [`docs/architecture/federation-contract.md`](docs/architecture/federation-contract.md)

---

## Membresías, formación y apoyo

### Support and donation checkout

El CTA de apoyo aparece en la navegación compartida, el landing institucional, el footer de la app y la invitación de temas de investigación, y enlaza a `/apoyar`. Esa ruta es transparente cuando no hay proveedor de pago configurado: **no solicita ni procesa pagos** y no afirma que ocurrió una transacción. `TAMV_DONATION_URL` siembra un hosted-checkout HTTPS con hosts aprobados; sin él se ofrece contacto institucional en lugar de inventar datos bancarios.

**Billing permanece deshabilitado por defecto.** Live checkout requiere aprobaciones explícitas y configuración productiva.

- `/membresias`: plan individual **MXN $229/mes por usuario** y plan business **MXN $699/mes por organización**. Precios fijados en servidor.
- `/formacion`: cinco módulos prácticos con progreso guardado para el usuario autenticado.
- `POST /api/billing/checkout`, `POST /api/webhooks/stripe`, `POST /api/billing/portal`, `GET /api/billing/me`: sesión, firma raw-body de Stripe e idempotencia; el redirect del navegador no activa acceso.
- `/apoyar`: no solicita datos bancarios ni simula pagos. `TAMV_DONATION_URL` permite redirecciones HTTPS a hosts aprobados.
- El plan business está ligado al usuario contratante y nombre de organización; no hay seats, invitaciones ni transferencia a empleados implementados.
- AI Lounge es una plataforma tercera; los enlaces son descubrimiento, no pase, afiliación ni patrocinio verificado.
- La hoja de ruta ROR es un objetivo institucional futuro; un ROR ID no es incorporación legal ni verificación criptográfica.

Antes de producción: [`docs/production/membership-billing-runbook.md`](docs/production/membership-billing-runbook.md) y [`docs/audit/2026-11-23-production-deployment-memberships-audit.md`](docs/audit/2026-11-23-production-deployment-memberships-audit.md).

---

## Operaciones, base de datos y health

- `GET /api/health` — liveness independiente de PostgreSQL.
- `GET /api/health/ready` — `SELECT 1` con presupuesto de 1.5 s; HTTP 503 si falla o expira, sin exponer cadenas de conexión ni errores internos.
- `PG_POOL_MAX` — entero 1–20, default 3.
- `pnpm db:preflight` y `pnpm db:preflight -- --strict` — diagnóstico sólo lectura; usar primero contra base desechable.
- `pnpm db:migrate` — migraciones checksummed sólo tras preflight estricto y backup/restore ensayado.
- **`migrations/0004_public_rate_limits.sql` sigue pendiente de aplicar** en la base correcta. Sin la tabla, el limitador responde 503 en producción; nunca se abre sin límite.
- La carpeta `supabase/migrations/`, `drizzle/` y los datos privados de Isabella/Horizon no se tocaron en este trabajo.

---

## Seguridad y puertas de release

Los modelos de control están en:

- [`docs/security/triple-hardening.md`](docs/security/triple-hardening.md)
- [`docs/security/triple-hardening-controls.md`](docs/security/triple-hardening-controls.md)
- [`docs/security/release-readiness.md`](docs/security/release-readiness.md)
- [`docs/audit/2026-11-baseline.md`](docs/audit/2026-11-baseline.md)

Tres planos:

1. **Criptográfico/datos**: TLS, cifrado gestionado, digests, rotación de claves y recuperación de backups.
2. **Aplicación/identidad**: autorización deny-by-default, validación server-side, sesiones, rate limits, safe redirects y supply chain.
3. **Gobernanza/operación**: consentimiento, retención, moderación, apelaciones, aprobaciones e incidencias.

Bloqueos que permanecen explícitos:

- Vercel reportó `Deployment rate limited — retry in 24 hours`; no se desplegó este árbol.
- Actions/CodeQL/secret scanning sin logs recuperables; marcar como bloqueado, no pasado.
- Sin staging controlado para preflight de migración, backup/restore ni pruebas IDOR con sesiones reales.
- TPVA fases 2–7 y verificación externa real siguen pendientes.
- No se afirma “100 % producción”, no-repudio, cumplimiento normativo, PQC efectivo ni certificación no emitida.

---

## Desarrollo local

Usa Node 26.x y pnpm 12.3.4. En este entorno:

```powershell
node 'C:\Users\tamvo\AppData\Roaming\npm\node_modules\pnpm\bin\pnpm.mjs' install --frozen-lockfile
node 'C:\Users\tamvo\AppData\Roaming\npm\node_modules\pnpm\bin\pnpm.mjs' test
node 'C:\Users\tamvo\AppData\Roaming\npm\node_modules\pnpm\bin\pnpm.mjs' typecheck
node 'C:\Users\tamvo\AppData\Roaming\npm\node_modules\pnpm\bin\pnpm.mjs' build
node 'C:\Users\tamvo\AppData\Roaming\npm\node_modules\pnpm\bin\pnpm.mjs' audit --prod --audit-level high
node 'C:\Users\tamvo\AppData\Roaming\npm\node_modules\pnpm\bin\pnpm.mjs' hf:snapshot
node 'C:\Users\tamvo\AppData\Roaming\npm\node_modules\pnpm\bin\pnpm.mjs' dev
```

Tras `build`, revertir `public/build-evidence.json` si el script local lo regeneró. Nunca commitear `.env.local`, credenciales, claves privadas, dumps ni datos reales de usuarios.

---

## Evidencia, licencias y citación

- [`LICENSES.md`](LICENSES.md) separa **original software under Apache-2.0**, prosa CC BY 4.0, materiales terceros y material comunitario restringido. Un merge no limpia derechos de terceros.
- [`CITATION.cff`](CITATION.cff) es metadata de citación; no es licencia, revisión por pares, acreditación ni prueba de readiness.
- [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), [`SECURITY.md`](SECURITY.md) y [`CONTRIBUTING.md`](CONTRIBUTING.md) definen participación, reporte responsable y revisión.
- Una URL, DOI, ORCID, hash o listado público no prueba autoría, verdad de fuente, estado legal ni producción.
- Métricas de adopción, tráfico, conversiones y madurez permanecen **no medidas** hasta instrumentación y validación reproducibles.

La carta bilingüe y el playbook operativo están en [`docs/institutional/charter-and-cooperation.md`](docs/institutional/charter-and-cooperation.md). La identidad pública se presenta en `/quienes-somos` con Edwin Oswaldo Castillo Trejo, también conocido como Anubis Villaseñor; las afirmaciones públicas se limitan a la evidencia disponible.

---

## Mapa de documentos

| Tema | Documento |
|---|---|
| Blueprint maestro TPVA | `docs/security-review/TPVA_MASTER_BLUEPRINT.md` |
| Spec TPVA + vectores | `docs/specs/tpva-receipt-v1.md`, `docs/specs/tpva-test-vectors/` |
| LATAMV 2.0 | `docs/governance/latamv-v2-specification.md` |
| Triple hardening | `docs/security/triple-hardening-controls.md` |
| Puente HF | `docs/evidence/README.md` |
| API pública | `docs/api/public-api-quickstart.md`, `public/openapi.yaml` |
| Federación | `docs/architecture/ecosystem-federation-v1.md` |
| Adopción | `docs/strategy/developer-adoption-latam.md`, `docs/strategy/tamv-platform-excellence-roadmap.md` |
| Investigación a producción | `docs/strategy/evidence-driven-research-to-production.md` |
| Gobernanza ROR | `docs/strategy/institutional-legalization-and-ror-roadmap.md` |
| Billing | `docs/production/membership-billing-runbook.md` |
| Auditoría integral y gates de release | `docs/audit/2026-11-26-total-project-audit.md` |

**Proyecto impulsado con colaboración de tecnología latinoamericana TAMV ONLINE NETWORK Orgullosamente Realmontenses.**
