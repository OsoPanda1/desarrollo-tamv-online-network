# Blueprint maestro: TAMV Proof & Verification Atlas (TPVA)

Versión: 1.1 · Fecha: 2026-11-25 · Estado: **blueprint manual para ejecución**, no implementación desplegada.  
Repositorio de ejecución principal: `OsoPanda1/desarrollo-tamv-online-network`.  
Texto de atribución obligatorio, sin variación: **Proyecto impulsado con colaboración de tecnología latinoamericana TAMV ONLINE NETWORK Orgullosamente Realmontenses.**  
Producto: **PLAY & GO** (no renombrar ni sustituir).

---

## 0. Principio rector y límite ético

Este blueprint convierte la infraestructura existente de **TAMV Online Network**, **TAMV Atlas** y **LITLE Trust Fabric** en un sistema nativo de procedencia, integridad, revisión técnica independiente y evidencia pública verificable, tomando como referencia el flujo de **Hermes Verify / Proof Drop** (recibo criptográfico + evaluación + publicación), pero **sin usar su marca, su insignia ni sus resultados**.

Distinción no negociable:

- TPVA puede construir evidencia, automatizar comprobaciones, generar recibos propios y preparar paquetes de revisión.
- La insignia o verificación de un tercero **solo existe si ese tercero acepta el proyecto, aplica sus criterios y emite su propio resultado**.
- Una autoevaluación, un score automatizado o un recibo firmado por TAMV **no se presenta como certificación externa**.
- Los estados `VERIFIED`, `WITH NOTES`, `FAILED`, `UNVERIFIED` y `REVOKED` son **estados de evidencia TPVA**, no sellos de terceros.

### 0.1 Modelo de referencia Hermes Verify / Proof Drop

En la investigación pública no aparece un programa único de certificación de repositorios llamado exactamente `Hermes Verify / Proof Drop`. El proyecto [`BrandonDucar/hermes-verify`](https://github.com/BrandonDucar/hermes-verify) localizado es un plugin de agente que clasifica evidencia en niveles (`EXTERNALLY-VERIFIED`, `RUNTIME-VERIFIED`, `CODE-VERIFIED`, `DECLARED`, `PROPOSED`, `UNKNOWN`) y conserva recibos en logs auditables; no emite una auditoría de software ni una insignia para proyectos.

TPVA toma ese **patrón**, no su marca ni su resultado:

| Patrón Hermes-like | Adaptación TPVA | Límite explícito |
|---|---|---|
| Grados de evidencia conservadores | `checks[]` con origen, herramienta, versión y resultado; `review.type` separa automatización, mantenedor e independiente | `RUNTIME-VERIFIED` equivale a “la CI observó esto”, nunca a “el mundo lo validó” |
| Recibos consultables | `GET /api/v1/proofs/:receiptId` y `query` local de vectores | Un recibo prueba integridad del payload; no prueba aceptación por tercero |
| Verificación contra fuente independiente | Solo `review.external: true` con `provider` y `provider_url` reales | Sin proveedor real, el estado es `UNVERIFIED` |
| SSRF guard al consultar URLs | Allowlist de dominios, bloqueo de IP privada/link-local/metadata y límites de tamaño | La protección se implementa y prueba; no se asume por el hecho de usar HTTPS |
| Ancla de huella tipo “Proof Drop” | Publicación del `receipt_hash` en la página pública y, cuando exista identidad firma, opcionalmente en un transparency log | Publicar un hash no convierte el recibo en certificación |

---

## 1. Inventario real y hallazgos de la infraestructura disponible

Repositorios inspeccionados en los perfiles de GitHub (`AnubisVillasenor1` y `OsoPanda1`):

| Repositorio | Rol propuesto | Evidencia observada | Límite confirmado |
|---|---|---|---|
| `OsoPanda1/desarrollo-tamv-online-network` | Registro público, API, dossier y página de verificación | App principal; rama de trabajo `fix/local-validation-canonical-baseline`; validación local 159/159, typecheck y build OK | Sin push/despliegue autorizado; no puede afirmarse CI verde hasta recuperar logs de Actions |
| `OsoPanda1/tamv-atlas` | Índice federado de proyectos/versiones/evidencia | `src/lib/federated/atlasKernel.ts`: event store con `checksum` SHA-512, `verifyIntegrity()` y `replay()` | No hay firma digital, anclaje externo ni verificador independiente; es un kernel de eventos, no una prueba de autoría |
| `OsoPanda1/tamv-core-atlas` | Espejo/extensión del atlas | Contiene `tamv-atlas-nextgen/` con `docs/TAMV_OPENAPI_SPEC_v3.1.0.yaml`, backend con tests y módulos de constitución/auditoría | Duplicidad de árboles; requiere definir fuente canónica antes de federar |
| `OsoPanda1/litle-trust-fabric` | Contratos de evidencia, confianza y verificación | `src/lib/litle/sign.ts`, `src/lib/verify/engine.ts`, `src/lib/litle/pqc.test.ts`; hay tests Vitest | `SimulatedPqcProvider` y `condensedSignature` son **stand-ins HMAC/SHAKE**, no PQC real; no reutilizar como primitiva de seguridad |
| `OsoPanda1/litle-verified-trust` | Adaptador de estados y referencias de verificación | `src/lib/evidence/merkleDag.ts`, `src/lib/trust/scoreCalculator.ts`, `src/lib/crypto/keyManager.ts` | `keyManager.verifyHex()` hace `return true` si no hay clave activa (**fail-open**); `pqc.ts::standinBackend.verify()` no recalcula la firma, solo comprueba que no sea cero |
| `OsoPanda1/litle-verified-seal` | Presentación de sellos | `src/lib/trust/scoreCalculator.ts` con `trustTier()` y componentes visuales | El nivel de confianza es un cálculo interno; **no debe fijar estado canónico ni generar una insignia externa** |

Hallazgos adicionales:

- `.env` aparece en el árbol de `tamv-atlas`, `litle-trust-fabric`, `litle-verified-trust` y `litle-verified-seal`. No se leyó ni se publicó su contenido. Antes de cualquier revisión se debe confirmar que es plantilla o que está fuera del historial sensible.
- Los README de los repos LITLE son informes de auditoría conceptual con porcentajes estimados; **no son evidencia de implementación finalizada**.
- Ninguno de los repositorios LITLE exhibe una implementación de firma verificable de forma independiente lista para producción.

Consecuencia arquitectónica: **TPVA será la fuente de verdad del recibo**. LITLE aporta modelos reutilizables (DAG, score, adaptadores de vista) solo después de auditoría y aislamiento; no aporta la primitiva criptográfica.

---

## 2. Arquitectura objetivo

```mermaid
flowchart TD
  CI[CI autenticada<br/>tests + build + SBOM] --> EP[Evidence Pack Builder]
  EP --> CW[Canonicalizador y hash SHA-256]
  CW --> SIGN[Firma Ed25519 con clave en KMS/HSM]
  SIGN --> LEDGER[Registro append-only de recibos]
  LEDGER --> API[API pública /api/v1/proofs]
  API --> UI[Página /verificar/[receiptId]]
  API --> ATLAS[TAMV Atlas<br/>indexa, no modifica]
  API --> LFT[LITLE Trust Fabric<br/>contrato y adaptador auditado]
  LFT --> LVT[LITLE Verified Trust<br/>vista de estado]
  LVT --> LVS[LITLE Verified Seal<br/>solo renderiza estado del recibo]
  UI --> REV[Revisores externos<br/>Scorecard / OSTIF / otros]
  REV --> DOSSIER[Resultado externo real<br/>separado del recibo TPVA]
```

Fronteras de confianza:

1. **Zona de emisión**: CI autorizada + servicio de firma. Salen recibos firmados.
2. **Zona de registro**: base append-only, claves públicas y revocaciones.
3. **Zona de verificación**: verificador offline y API de lectura; recalcula todo; no confía en parámetros del cliente.
4. **Zona de federación**: Atlas y LITLE consumen el mismo payload canónico; nunca lo reescriben.
5. **Zona externa**: revisores independientes; su resultado se referencia, nunca se simula.

---

## 3. Contrato canónico del recibo TPVA v1

### 3.1 Esquema JSON (implementar en `docs/specs/tpva-receipt-v1.schema.json`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "urn:tamv:spec:tpva-receipt:v1",
  "title": "TPVA Receipt v1",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schema", "receipt_id", "repository", "commit_sha", "artifact_digest",
    "evidence", "checks", "review", "issued_at", "previous_receipt_hash",
    "receipt_hash", "signature"
  ],
  "properties": {
    "schema": { "const": "tpva-receipt/v1" },
    "receipt_id": { "type": "string", "pattern": "^rcpt_[a-f0-9]{32}$" },
    "repository": { "type": "string", "format": "uri", "pattern": "^https://github\\.com/" },
    "commit_sha": { "type": "string", "pattern": "^[a-f0-9]{40}$" },
    "artifact_digest": { "type": "string", "pattern": "^sha256:[a-f0-9]{64}$" },
    "evidence": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["path", "media_type", "size_bytes", "sha256"],
        "properties": {
          "path": { "type": "string", "pattern": "^[A-Za-z0-9._/-]+$" },
          "media_type": { "type": "string", "maxLength": 128 },
          "size_bytes": { "type": "integer", "minimum": 0, "maximum": 52428800 },
          "sha256": { "type": "string", "pattern": "^[a-f0-9]{64}$" }
        }
      }
    },
    "checks": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["name", "tool", "tool_version", "status", "evidence_ref", "mandatory"],
        "properties": {
          "name": { "type": "string", "minLength": 1, "maxLength": 120 },
          "tool": { "type": "string", "minLength": 1, "maxLength": 120 },
          "tool_version": { "type": "string", "minLength": 1, "maxLength": 60 },
          "status": { "enum": ["pass", "fail", "skipped", "not_available"] },
          "evidence_ref": { "type": "string", "pattern": "^[A-Za-z0-9._/-]+$" },
          "mandatory": { "type": "boolean" }
        }
      }
    },
    "review": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type", "scope", "limitations", "external"],
      "properties": {
        "type": { "enum": ["automated", "maintainer", "independent"] },
        "scope": { "type": "string", "minLength": 1, "maxLength": 4000 },
        "limitations": { "type": "string", "maxLength": 4000 },
        "external": { "type": "boolean" },
        "provider": { "type": "string", "maxLength": 160 },
        "provider_url": { "type": "string", "format": "uri" }
      }
    },
    "issued_at": { "type": "string", "format": "date-time" },
    "previous_receipt_hash": {
      "oneOf": [
        { "type": "null" },
        { "type": "string", "pattern": "^sha256:[a-f0-9]{64}$" }
      ]
    },
    "receipt_hash": { "type": "string", "pattern": "^sha256:[a-f0-9]{64}$" },
    "signature": {
      "type": "object",
      "additionalProperties": false,
      "required": ["algorithm", "kid", "public_key_ref", "value"],
      "properties": {
        "algorithm": { "const": "Ed25519" },
        "kid": { "type": "string", "pattern": "^tpva-[a-z0-9-]{1,64}$" },
        "public_key_ref": { "type": "string", "pattern": "^[A-Za-z0-9._/-]+$" },
        "value": { "type": "string", "pattern": "^[a-f0-9]{128}$" }
      }
    },
    "revocation": {
      "type": "object",
      "additionalProperties": false,
      "required": ["status", "reason"],
      "properties": {
        "status": { "enum": ["none", "revoked"] },
        "reason": { "type": "string", "maxLength": 1000 },
        "revoked_at": { "type": "string", "format": "date-time" }
      }
    }
  }
}
```

Regla de oro: `external: true` solo puede ponerse cuando exista `provider` y `provider_url` apuntando a un resultado real emitido por ese tercero. El sistema rechaza `external: true` sin esos campos. El campo `mandatory` decide qué checks bloquean; no se infiere del nombre del check ni del estado deseado.

### 3.2 Canonicalización determinista

`receipt_hash` se calcula sobre el payload canónico, **excluyendo** `receipt_hash` y `signature`:

1. Copiar el objeto y eliminar `receipt_hash` y `signature`.
2. Ordenar todas las claves lexicográficamente de forma recursiva.
3. Serializar JSON sin espacios, con UTF-8 y escapes mínimos (`JSON.stringify` con orden explícito o `canonical-json` auditado).
4. Normalizar fechas a ISO-8601 UTC con milisegundos.
5. Ordenar `evidence` por `path` y `checks` por `name` antes de serializar.
6. Calcular `sha256` de los bytes resultantes.
7. Firmar exactamente esos bytes con Ed25519; nunca firmar el JSON formateado para humanos.

### 3.3 Máquina de estados

| Estado | Regla determinista |
|---|---|
| `VERIFIED` | Esquema válido; todos los checks con `mandatory: true` en `pass`; hash recalculado igual; firma válida; `kid` activo; evidencia completa; sin revocación |
| `WITH NOTES` | Igual que `VERIFIED`, pero `review.limitations` no vacío o checks opcionales (`mandatory: false`) en `skipped`; bloquea solo lo que el revisor marcó como no bloqueante |
| `FAILED` | Algún check con `mandatory: true` en `fail`, evidencia alterada o firma inválida |
| `UNVERIFIED` | Falta evidencia, clave desconocida, `review.external: true` sin proveedor, o información insuficiente |
| `REVOKED` | `revocation.status: "revoked"` o clave revocada según procedimiento documentado |

Fail-closed: cualquier excepción, timeout, esquema inválido o dato faltante produce `UNVERIFIED`, nunca `VERIFIED`. Los recibos históricos nunca se sobrescriben; un nuevo intento genera nuevo `receipt_id`.

---

## 4. Modelo de datos y persistencia

Tablas/entidades mínimas (PostgreSQL, migración controlada):

| Entidad | Campos clave | Control |
|---|---|---|
| `tpva_receipts` | `receipt_id`, `commit_sha`, `repository`, `receipt_hash`, `state`, `issued_at`, `previous_receipt_hash`, `payload jsonb` | `append-only`; trigger que prohíbe `UPDATE` de payload/hash |
| `tpva_evidence` | `receipt_id`, `path`, `sha256`, `size_bytes`, `media_type` | FK a recibo; índice por hash |
| `tpva_checks` | `receipt_id`, `name`, `tool`, `status`, `evidence_ref` | FK; `status` enumerado |
| `tpva_keys` | `kid`, `algorithm`, `public_key`, `status`, `not_before`, `not_after`, `revoked_reason` | Solo metadatos públicos; **nunca** clave privada |
| `tpva_audit_log` | `id`, `actor`, `action`, `target`, `metadata`, `created_at`, `prev_log_hash`, `log_hash` | Cadena hash encadenada; append-only |
| `tpva_rate_limits` | `key`, `window_start`, `count` | Limitador distribuido; si la tabla no existe, responder 503 |

El limitador distribuido ya definido en el repo se conserva; su migración `migrations/0004_public_rate_limits.sql` debe aplicarse en base controlada antes de habilitar producción. Sin tabla → 503, nunca apertura.

---

## 5. Contratos entre repositorios

| Repo | Contrato que consume | Contrato que expone | Regla de integridad |
|---|---|---|---|
| `desarrollo-tamv-online-network` | Resultados de CI, SBOM, digest de artefacto | Recibo canónico, API, dossier, página pública | Es la única fuente de verdad del `receipt_hash` |
| `tamv-atlas` | Recibo firmado vía `GET /api/v1/proofs/:id` | Entrada de índice con `receipt_id`, `commit_sha`, `state`, `verified_at` | No modifica payload; un proyecto catalogado no se vuelve verificado por estar indexado |
| `tamv-core-atlas` | Misma especificación que `tamv-atlas` | Espejo de documentación/OpenAPI | Declarar cuál de los dos es canónico antes de federar |
| `litle-trust-fabric` | Recibo y DAG de evidencia | Adaptador de cadena de evidencia y reglas de confianza | Solo reutilizar `verifyEvidenceIntegrity`, `buildMerkleRoot` y el modelo de nodos tras auditoría; **no reutilizar `sign.ts`** como firma de TPVA |
| `litle-verified-trust` | `receipt_hash` + clave pública activa | Vista de estado coherente | `scoreCalculator` solo informativo; `trustTier()` nunca sustituye al estado del recibo |
| `litle-verified-seal` | Estado vigente del recibo desde API | Render visual del sello TPVA | El estado no puede venir de query string, props del cliente ni selección manual |

Primer hito federado: dos implementaciones independientes (verificador de `desarrollo-tamv-online-network` y adaptador de `litle-trust-fabric`) recalculan el mismo hash y rechazan exactamente los mismos vectores negativos.

---

## 6. API pública

| Método y ruta | Función | Autorización |
|---|---|---|
| `GET /api/v1/proofs` | Listado paginado; filtros `repository`, `state`, `since` | Pública; rate limit |
| `GET /api/v1/proofs/:receiptId` | Recibo completo | Pública |
| `GET /api/v1/proofs/:receiptId/verify` | Recalcula hash, verifica firma, evalúa estado | Pública; rate limit; nunca devuelve `VERIFIED` por error interno |
| `GET /api/v1/proofs/keys` | Claves públicas y revocaciones | Pública; sin secretos |
| `POST /api/v1/proofs/prepare` | Prepara payload desde CI autenticada | Token de servicio con scope `proofs:prepare` |
| `POST /api/v1/proofs/issue` | Emite recibo; idempotente por `commit_sha + artifact_digest` | Workflow de release con OIDC + scope `proofs:issue` |
| `POST /api/v1/proofs/:receiptId/revoke` | Revoca con motivo | Rol admin; MFA; audit log obligatorio |

`/api/v1/provenance/validate` conserva su significado actual: validación del sobre de procedencia. No se reclama authorship ni firma integral allí.

---

## 7. Interfaz

- `pages/verificar/[receiptId].tsx`: muestra commit, artefacto, checks, evidencia, limitations, clave usada, estado TPVA y enlace a resultado externo **si y solo si** existe.
- `pages/evidencias/index.tsx`: registro público paginado.
- Componente `ProofBadge`: recibe `state` **solo desde la API del servidor**; nunca desde URL. Etiqueta visible: `Estado de evidencia TPVA`, nunca `Certificación`.
- Si `review.external: false`, la UI muestra explícitamente: “Sin verificación externa emitida por tercero”.

---

## 8. Controles de seguridad obligatorios

1. Claves privadas en KMS/HSM o entorno de firma aislado; nunca en repo, navegador, base de datos ni logs.
2. Ed25519 con librería auditada; rotación y revocación documentadas. El material “PQC” de LITLE se trata como **experimental/no probado**; no se afirma seguridad postcuántica.
3. Rate limiting distribuido en PostgreSQL; caída del store → 503.
4. Validación estricta con JSON Schema; límites de tamaño; `additionalProperties: false`.
5. Protección contra SSRF (allowlist de dominios), path traversal (`path` restringido), ZIP slip (rechazo de `..` y rutas absolutas al descomprimir) e inspección de archivos maliciosos.
6. Separación de permisos: PR = solo lectura; release = emisión; admin = revocación; ningún token universal.
7. Idempotencia de emisión y audit log encadenado.
8. Pruebas negativas: hash alterado, firma inválida, `kid` revocado, recibo incompleto, `external: true` sin proveedor, timeouts de red, payload sobredimensionado.
9. No incluir en el paquete público: secretos, `.env`, tokens, dumps de usuarios, datos privados de Isabella/Horizon, vulnerabilidades no divulgadas.

---

## 9. Plan de implementación manual (fases ejecutables)

Usar siempre:

```powershell
node 'C:\Users\tamvo\AppData\Roaming\npm\node_modules\pnpm\bin\pnpm.mjs' <args>
```

Comandos base reproducibles, ejecutados desde la raíz del repo:

```powershell
node 'C:\Users\tamvo\AppData\Roaming\npm\node_modules\pnpm\bin\pnpm.mjs' test
node 'C:\Users\tamvo\AppData\Roaming\npm\node_modules\pnpm\bin\pnpm.mjs' typecheck
node 'C:\Users\tamvo\AppData\Roaming\npm\node_modules\pnpm\bin\pnpm.mjs' build
node 'C:\Users\tamvo\AppData\Roaming\npm\node_modules\pnpm\bin\pnpm.mjs' audit --prod --audit-level high
node 'C:\Users\tamvo\AppData\Roaming\npm\node_modules\pnpm\bin\pnpm.mjs' exec vitest run lib/proofs
```

Tras cualquier `build`, restaurar `public/build-evidence.json` antes de commit.

### Fase 0 — Precondiciones

- Confirmar árbol limpio: `git status --short`.
- Revertir cualquier `public/build-evidence.json` generado por build local antes de commit.
- Verificar que `.env` de los repos LITLE no contiene secretos reales; si los contiene, no publicar y rotar fuera de este blueprint.
- No ejecutar push ni deploy sin autorización explícita. Si se autoriza: `gh auth switch --user AnubisVillasenor1` → push → `gh auth switch --user OsoPanda1`.

### Fase 1 — Contrato y verificador offline

Crear:

- `docs/specs/tpva-receipt-v1.schema.json` (sección 3.1).
- `docs/specs/tpva-receipt-v1.md` (canonicalización y estados).
- `lib/proofs/canonical.ts`, `lib/proofs/hash.ts`, `lib/proofs/verify.ts`.
- `lib/proofs/__tests__/canonical.test.ts` y vectores en `docs/specs/tpva-test-vectors/`.

Criterio de cierre: el verificador offline pasa todos los vectores positivos y negativos; sin firmas productivas.

### Fase 2 — Evidence Pack Builder

Crear workflow `.github/workflows/tpva-evidence.yml`:

- `pnpm install --frozen-lockfile`.
- `pnpm test`, `pnpm typecheck`, `pnpm build`.
- Generar `TEST_SUMMARY.json` saneado, `SBOM.spdx.json` y, cuando el pipeline lo soporte, `RELEASE_PROVENANCE.json` SLSA/in-toto.
- Calcular digests y subir artefacto; nunca subir logs con secretos.

Criterio de cierre: paquete reproducible para un `commit_sha` exacto, sin secretos.

### Fase 3 — Firma y registro

- Implementar `KeyManager` propio con Ed25519 y backend KMS; **no** usar `litle-verified-trust/src/lib/crypto/keyManager.ts` por su fallback fail-open.
- Migración append-only para `tpva_receipts`, `tpva_keys`, `tpva_audit_log`.
- Política de rotación y revocación con prueba de procedimiento.

Criterio de cierre: clave privada no aparece en repo ni en BD; rotación y revocación probadas.

### Fase 4 — API

Implementar los endpoints de la sección 6 con validación, rate limit distribuido y auditoría.

Criterio de cierre: `/verify` recalcula y devuelve estado; los endpoints de escritura rechazan tokens sin scope.

### Fase 5 — Interfaz

Implementar `pages/verificar/[receiptId].tsx` y el registro público con límites visibles.

Criterio de cierre: cambiar un parámetro de URL no cambia el estado mostrado.

### Fase 6 — Federación

- Adaptador Atlas: consume recibo, indexa, no reescribe.
- Adaptador LITLE: usa solo módulos auditados; aislar cualquier función fail-open.
- Prueba de doble verificación independiente.

Criterio de cierre: ambos verificadores coinciden en todos los vectores.

### Fase 7 — Dossier de revisión

Crear `docs/security-review/` con:

`PROJECT_SCOPE.md`, `ARCHITECTURE.md`, `THREAT_MODEL.md`, `DATA_FLOW.md`, `SECURITY.md`, `SBOM.spdx.json`, `CI_EVIDENCE.md`, `TEST_SUMMARY.json`, `RELEASE_PROVENANCE.json`, `TPVA_RECEIPT.json`, `FINDINGS.md`, `LICENSES.md`, `OPERATIONS.md`, `LIMITATIONS.md`.

Criterio de cierre: cada afirmación tiene enlace a evidencia; cada limitación está escrita.

---

## 10. Mapa de revisión externa

### 10.1 Programas con revisión técnica o verificación real

| Programa | Naturaleza real | Qué aporta a TAMV | Qué NO aporta | Uso recomendado |
|---|---|---|---|---|
| [OpenSSF Scorecard](https://scorecard.dev/) | Análisis automatizado de prácticas (SAST, permisos de token, dependencias fijadas, releases firmados, etc.) | Evaluación fechada y reproducible del repo principal | No es auditoría humana ni insignia de seguridad absoluta | Prioridad 1; ejecutar Action y CLI sobre `desarrollo-tamv-online-network` |
| [GitHub CodeQL](https://docs.github.com/en/code-security/code-scanning/creating-an-advanced-setup-for-code-scanning/configuring-advanced-setup-for-code-scanning) | SAST automatizado integrado en GitHub | Findings reales de código; requisito previo para revisores | No certifica el sistema; los runs actuales fallaron sin steps, hay que recuperar logs | Prioridad inmediata; reparar ejecución antes de invocar auditoría |
| [OSPS Baseline](https://openssf.org/projects/osps-baseline/) | Catálogo de 41 requisitos en tres niveles de madurez, organizados en seis etapas del ciclo de vida | Matriz de brechas con evidencia por control | No emite por sí sola una verificación de TAMV | Preparar dossier y medir madurez |
| [SLSA](https://slsa.dev/spec/v1.2/provenance) e [in-toto](https://in-toto.io/) | Estándares de procedencia y attestation | Vincular artefacto ↔ commit ↔ build platform; base de `RELEASE_PROVENANCE.json` | No demuestra ausencia de vulnerabilidades ni sustituye auditoría | Implementar cuando el pipeline produzca provenance verificable |
| [OpenSSF Best Practices Badge](https://www.bestpractices.dev/) | **Autoevaluación pública gratuita** con criterios automatizables | Distintivo basado en prácticas declaradas y verificables por el portal | **No es auditoría externa**; marcar solo controles realmente cumplidos | Prioridad 2; usar como evidencia de proceso, no como sello independiente |
| [OSTIF](https://ostif.org/get-an-audit/) | Coordinación de auditoría profesional independiente, de pago | Revisión humana, informe público tras remediación | No garantiza aceptación ni financiación; costos iniciales USD 30k–200k según su sitio | Prioridad final; contacto con alcance acotado |

### 10.2 Plataformas que indexan, alojan o identifican (no verifican código)

| Plataforma | Rol real | Uso correcto en TAMV | No confundir con |
|---|---|---|---|
| [Zenodo](https://zenodo.org/) | Repositorio de investigación; DOI, versionado, integración GitHub | Depositar el dossier y el recibo del commit revisado | Revisión técnica o certificación |
| [OSF](https://osf.io/) | Registro de proyectos de investigación | Publicar protocolos y paquetes de replicación | Auditoría de seguridad |
| [Figshare](https://figshare.com/) | Alojamiento de artefactos de investigación | Publicar figuras/datasets con DOI | Verificación de procedencia de software |
| [ORCID](https://orcid.org/) | Identificador persistente de investigadores | Vincular autores y revisiones, nunca como prueba de firma | Verificación criptográfica de identidad |
| [Sigstore Rekor](https://docs.sigstore.dev/rekor/overview/) | Registro transparente de firmas y artefactos | Publicar la firma del `receipt_hash` como ancla pública opcional | Revisión de código, auditoría o insignia |

Estas plataformas fortalecen la **publicación y citabilidad** de la evidencia; no conceden la insignia que TPVA no puede fabricar.

### 10.3 Orden de presentación recomendado

1. Scorecard automatizado sobre `desarrollo-tamv-online-network`, con fecha y SHA.
2. Corregir CodeQL y secret scanning; recuperar logs/annotations reales.
3. Matriz OSPS Baseline con evidencia enlazada.
4. Badge de Best Practices como autoevaluación honesta, sin marcar pendientes como cumplidos.
5. TPVA en staging: primer recibo verificable para un commit exacto.
6. Depositario Zenodo/OSF del dossier + recibo.
7. Contacto exploratorio con OSTIF con alcance: autenticación/autorización, API pública, gestión de secretos, cadena de suministro y verificador TPVA.
8. Solo si un tercero emite resultado: publicar ese resultado con su proveedor y URL. Hasta entonces, decir “sin verificación externa emitida”.

Comandos de preparación para Scorecard, cuando se autorice ejecutarlos:

```powershell
go run github.com/ossf/scorecard/v5/cmd/scorecard@latest --repo=github.com/OsoPanda1/desarrollo-tamv-online-network --format=json > docs/security-review/SCORECARD.json
```

El visor públicamente disponible para el mismo repositorio es `https://scorecard.dev/viewer/?uri=github.com/OsoPanda1/desarrollo-tamv-online-network`. Un resultado del visor debe conservar fecha y SHA; no debe copiarse como si fuera un informe de auditoría.

Borrador de alcance para OSTIF (no enviar sin aprobación):

> Solicitamos una conversación exploratoria para acotar una revisión de seguridad del repositorio `OsoPanda1/desarrollo-tamv-online-network` en el commit `<SHA>`, centrada en autenticación/autorización, API pública `/api/v1/proofs`, gestión de secretos, pipeline CI/CD y verificador TPVA. Se aportan dossier en `docs/security-review/`, Scorecard, SBOM y recibo TPVA. No solicitamos auditoría de todo el ecosistema en una sola fase ni asumimos financiación.

---

## 11. Criterios de aceptación finales

El trabajo se considera terminado solo cuando:

- El recibo puede recalcularse y verificarse de forma independiente, sin consultar estado almacenado.
- Las pruebas negativas pasan y rechazan exactamente los mismos casos en dos verificadores.
- Commit y artefacto coinciden con el payload firmado.
- La clave privada está controlada y la rotación/revocación están probadas.
- La página pública muestra límites y distingue evidencia interna de verificación externa.
- Atlas y LITLE consumen el mismo contrato; ninguno modifica el payload.
- No se afirma 100 % producción, no-repudio, cumplimiento normativo, PQC efectivo ni certificación externa no emitida.
- No hay push, deploy ni secretos expuestos sin autorización.

---

## 12. Evidencia de la investigación

- Repositorios listados con `gh api users/<user>/repos --paginate`.
- Código inspeccionado con `gh api repos/<repo>/git/trees/main?recursive=1` y `gh api repos/<repo>/contents/<path>` (Accept: raw).
- Fuentes oficiales consultadas: scorecard.dev, bestpractices.dev, ostif.org/get-an-audit, openssf.org/projects/osps-baseline, slsa.dev/spec/v1.2/provenance, in-toto.io, docs.sigstore.dev/rekor/overview, docs.github.com CodeQL, zenodo.org.
- Referencia Hermes-like inspeccionada: `BrandonDucar/hermes-verify` (plugin de agente con grados de evidencia y recibos; no auditoría de software).
- Estado local previo: rama `fix/local-validation-canonical-baseline`, HEAD `7d74b88`, validación 159/159 + typecheck + build + audit en `latamv-v2-local-validation.txt`.
- Este blueprint queda como archivo local sin commitear, sin push y sin deploy.

**Proyecto impulsado con colaboración de tecnología latinoamericana TAMV ONLINE NETWORK Orgullosamente Realmontenses.**
