# Comprobante de Evidencia TAMV (CEV) v1

- **Estado:** fase 1 implementada (sin estado); fases 2-4 especificadas.
- **Esquema:** `tamv.evidence_receipt.v1`.
- **Dominio de hash:** `tamv.cev.v1`.
- **Canonización:** `tamv-jcs-1`.
- **Módulo:** `/desarrolladores/independiente`.
- **Origen intelectual:** Proof Drop (Brandon Ducar / ZABAL), sin copia de código. Ver `docs/research/proof-drop-method-analysis-v1.md`.

## 1. Resumen

El CEV es un sobre JSON portable que vincula **metadatos declarados** con la **huella SHA-256 de uno o más archivos de evidencia**. Su función es permitir que una persona comparta un artefacto y su evidencia de forma verificable en integridad, sin afirmar autoría, propiedad, veracidad, finalización, revisión, acreditación ni derecho a pago.

El diseño separa cinco cosas que Proof Drop mezclaba en un solo objeto:

1. **Evidencia:** bytes y sus huellas.
2. **Comprobante:** declaraciones del emisor y vínculo con las huellas.
3. **Registro:** almacenamiento autenticado y fechado por el servidor (fase 2).
4. **Atestaciones:** verificaciones y revisiones humanas, append-only (fase 2).
5. **Reconocimiento:** insignias, XP o cualquier consecuencia, derivados de hechos registrados (fase 3).

## 2. No objetivos

El CEV **no** es:

- una firma digital ni un mecanismo de no repudio;
- una prueba de autoría, propiedad intelectual o titularidad;
- una marca de tiempo confiable;
- una prueba de que una URL existe, está viva o corresponde al sujeto;
- una prueba de que un build funciona, está desplegado o pasó pruebas;
- una revisión por pares ni una acreditación;
- una instrucción de pago, un bounty ni una elegibilidad;
- un sistema de almacenamiento de archivos;
- un oráculo de verdad.

Estas exclusiones aparecen en el campo `semantics` del propio comprobante y en la respuesta de la API.

## 3. Principios de diseño

1. **Minimización:** el archivo nunca se sube; el servidor no lo recibe. La fase 1 no persiste nada.
2. **Declaración explícita:** todo campo que no se puede observar se etiqueta como declarado.
3. **Separación de niveles:** forma, integridad, vínculo con bytes, origen registrado y revisión humana no se colapsan.
4. **Determinismo:** la misma entrada canónica produce el mismo hash en navegador y servidor.
5. **Rechazo de ambigüedad:** esquema estricto, sin campos desconocidos, sin `undefined`, sin números no finitos, sin objetos con prototipo.
6. **Consentimiento:** compartir evidencia y publicar el comprobante son decisiones separadas.
7. **Trazabilidad:** un comprobante puede encadenarse a otro mediante `chain.previous`.
8. **Humanidad:** la revisión es una atestación humana fechada, no una respuesta automática.

## 4. Sobre canónico

Ejemplo abreviado (los campos completos están en `lib/evidence/receipt.ts`):

```json
{
  "schema": "tamv.evidence_receipt.v1",
  "createdAt": "2026-11-25T12:00:00Z",
  "nonce": "0123456789abcdef0123456789abcdef",
  "producer": {
    "name": "TAMV Online Network",
    "url": "https://tamv.online",
    "tool": "tamv-independent-developer-module",
    "version": "1.0.0"
  },
  "purpose": {
    "primary": "portable_evidence_receipt",
    "context": "Reto de desarrollo independiente",
    "note": "Comprobante creado en el módulo de desarrollador independiente. Todos los datos son declarados por el emisor."
  },
  "issuer": {
    "kind": "self_declared",
    "displayName": "Ana Example",
    "handles": [{ "platform": "github", "handle": "ana-example" }]
  },
  "subject": {
    "kind": "build",
    "title": "Módulo de evidencia para desarrolladores",
    "description": "Contribución acotada y reproducible.",
    "urls": ["https://example.org/build"]
  },
  "evidence": [
    {
      "label": "captura.png",
      "kind": "image",
      "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "sizeBytes": 18234,
      "contentType": "image/png",
      "uri": null,
      "license": "CC-BY-4.0"
    }
  ],
  "claims": [
    { "statement": "El build está publicado en la URL indicada.", "status": "declared" }
  ],
  "consent": {
    "shareEvidence": true,
    "publishReceipt": false,
    "termsVersion": "cev-1.0",
    "grantedAt": "2026-11-25T12:00:00Z"
  },
  "chain": { "previous": null },
  "hash": {
    "algorithm": "sha-256",
    "canonicalization": "tamv-jcs-1",
    "domain": "tamv.cev.v1",
    "value": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
  }
}
```

### 4.1 Campos

| Campo | Tipo | Regla | Por qué existe |
| --- | --- | --- | --- |
| `schema` | literal | `tamv.evidence_receipt.v1` | Versionado explícito. |
| `createdAt` | ISO 8601 con zona | Declarado por el emisor | No es tiempo confiable; el servidor añadirá `issuedAt` en fase 2. |
| `nonce` | hex 16-64 | 8-32 bytes aleatorios | Evita recibos idénticos para el mismo contenido. |
| `producer` | objeto | Herramienta y versión | Permite reproducir el productor. |
| `purpose.primary` | literal | `portable_evidence_receipt` | Impide reutilizar el sobre para pagos o certificaciones. |
| `purpose.context` | texto o null | ≤ 200 | Contexto libre; no es un evento obligatorio. |
| `issuer.kind` | enum | `account` o `self_declared` | Distingue identidad autenticada de alias. |
| `issuer.displayName` | texto o null | ≤ 120 | Identidad declarada; no verificada. |
| `issuer.handles` | array | ≤ 5, plataforma + handle | Correlación opcional; no prueba control de la cuenta. |
| `subject.kind` | enum | build, repository, dataset, publication, proposal, simulation, service, other | Categoría del artefacto. |
| `subject.title` | texto | ≤ 180 | Identificación legible. |
| `subject.description` | texto o null | ≤ 1200 | Alcance declarado. |
| `subject.urls` | array de URL http(s) | ≤ 10 | Localizadores públicos; no se consultan automáticamente. |
| `evidence[]` | array | ≤ 20 | Cada elemento es una huella, no un archivo. |
| `evidence[].sha256` | hex 64 | minúsculas | Vínculo con bytes. |
| `evidence[].sizeBytes` | entero o null | ≥ 0 | Metadato declarado; no se verifica en fase 1. |
| `evidence[].contentType` | texto o null | ≤ 160 | Metadato declarado. |
| `evidence[].uri` | URL o null | http(s) | Dónde se puede obtener la evidencia; no se descarga. |
| `evidence[].license` | texto o null | ≤ 160 | Licencia declarada; no se valida. |
| `claims[]` | array | ≤ 20; `status` siempre `declared` | Afirmaciones explícitas, nunca «verificadas» por el sello. |
| `consent.shareEvidence` | booleano | — | Autorización para compartir huellas/metadatos. |
| `consent.publishReceipt` | booleano | — | Autorización para publicar el comprobante completo. |
| `consent.termsVersion` | texto | `cev-1.0` | Versión de los términos aceptados. |
| `consent.grantedAt` | ISO 8601 | — | Fecha declarada del consentimiento. |
| `chain.previous` | hex 64 o null | — | Encadena con el recibo anterior del mismo emisor. |
| `hash` | objeto | Solo en el recibo sellado | Algoritmo, canonización, dominio y valor. |

Regla adicional: el comprobante debe tener al menos una huella o una URL pública. Un sobre vacío se rechaza.

## 5. Canonización y hash

### 5.1 `tamv-jcs-1`

La función `canonicalize` de `lib/evidence/receipt.ts`:

- ordena las claves de objeto por unidades de código UTF-16;
- normaliza las cadenas a NFC;
- rechaza surrogates UTF-16 sueltos;
- rechaza `undefined`, funciones, símbolos, bigints y objetos con prototipo distinto de `Object.prototype` o `null`;
- rechaza números no finitos y serializa `-0` como `0`;
- limita profundidad a 32 y nodos a 10 000;
- detecta claves que colisionan tras normalizar.

Diferencias deliberadas con RFC 8785 (JCS): normalización NFC y rechazo de `undefined` en objetos. Se documentan para que dos productores no discrepen en silencio.

### 5.2 Cálculo

```text
canonical = tamv-jcs-1(payload sin hash)
digest    = SHA-256(UTF-8("tamv.cev.v1\n" + canonical))
```

La cadena `tamv.cev.v1\n` es separación de dominio: evita que un hash de este protocolo se confunda con el de otro sobre que casualmente tenga la misma forma.

### 5.3 Verificación

`verifyReceipt(input)` valida primero la forma estricta y luego recalcula el hash. Devuelve:

```ts
{
  valid: boolean,
  levels: { shape: boolean, integrity: boolean },
  expected: string | null,
  actual: string | null,
  issues: { path, code, message }[],
  semantics: string
}
```

No devuelve el payload recibido. Esto reduce el riesgo de reflexión de datos y de filtrado de secretos en registros.

## 6. Niveles de verificación

| Nivel | Pregunta | Quién lo comprueba | Qué no prueba |
| --- | --- | --- | --- |
| 0. Forma | ¿Cumple el esquema estricto? | Cliente o API | Nada sobre el contenido. |
| 1. Integridad | ¿El payload canónico coincide con el hash? | Cliente o API | Autoría, verdad, tiempo, firma. |
| 2. Vínculo | ¿Los bytes que tengo producen la huella declarada? | Quien posee el archivo | Que el archivo sea auténtico o del emisor. |
| 3. Origen | ¿Una cuenta autenticada registró este hash? | Servidor (fase 2) | Autoría intelectual; solo vincula una cuenta. |
| 4. Revisión | ¿Una persona revisora dejó una atestación? | Servidor (fase 2) | Que la revisión sea correcta, completa o no controvertida. |

La interfaz muestra los niveles alcanzados y los no alcanzados. Nunca muestra un check global que implique verdad.

## 7. Modelo de amenazas

| Amenaza | Control | Riesgo residual |
| --- | --- | --- |
| Alterar el JSON después de sellarlo | Hash canónico | El atacante puede volver a sellar otro payload; el hash no es firma. |
| Copiar la huella de otra persona | Nivel 2 exige el archivo; nivel 3 vincula cuenta | La misma evidencia puede ser legítimamente compartida o plagiada. |
| Sustituir el archivo por otro con el mismo nombre | Se compara SHA-256, no el nombre | Colisión SHA-256 inviable; el contenido puede ser distinto y aun así declarado. |
| Inventar una URL | Se muestra como declarada; no se consulta | La URL puede no existir; el nivel 0/1 no lo detecta. |
| Falsificar la fecha | Se muestra `createdAt` declarado y, en fase 2, `issuedAt` del servidor | El emisor puede mentir sobre la fecha de los hechos. |
| Suplantar una identidad | `issuer.kind` distingue `self_declared`; fase 2 vincula cuenta | Un alias puede coincidir con otra persona. |
| Inyectar HTML/JS en campos | Se renderiza como texto; URLs validadas http(s) | XSS en otros consumidores si no escapan. |
| DoS por payload profundo o enorme | Límite 64 KiB, profundidad 32, nodos 10 000 | Ataques distribuidos requieren rate limit en fase 2. |
| Fuga de datos personales | Sin wallet; handles opcionales; sin persistencia en fase 1 | El emisor puede incluir PII en texto libre; la UI debe advertirlo. |
| Reutilizar el recibo para pago | `purpose.primary` literal y `semantics` | Un tercero puede ignorar el campo; el pago debe tener su propio contrato. |
| Repudio | No hay firma en v1 | Fase 4 puede añadir firmas, con gestión de claves y revocación. |
| Colisión de claves Unicode | Normalización NFC + detección de duplicados | Confusables visuales siguen siendo posibles; se muestran como texto. |

## 8. Modelo de datos (fase 2)

La fase 1 no crea tablas. La fase 2 añade tres tablas y una columna de vínculo.

### 8.1 `evidence_receipts`

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | text PK | UUID. |
| `user_id` | text not null | FK lógica a `user.id`; propiedad del registro. |
| `schema_version` | text not null | `tamv.evidence_receipt.v1`. |
| `receipt_hash` | text not null unique | Índice único; idempotencia. |
| `canonical_payload` | jsonb not null | Payload validado, sin `hash`. |
| `subject_kind` | text not null | Copia denormalizada para filtros. |
| `subject_title` | text not null | Copia para listados. |
| `purpose_context` | text | Contexto declarado. |
| `proposal_id` | text | Vínculo opcional con `research_proposals.id`. |
| `hcu_run_id` | text | Vínculo opcional con `hcu_runs.id`. |
| `visibility` | text not null default `private` | `private` o `public`. |
| `review_state` | text not null default `unreviewed` | `unreviewed`, `in_review`, `accepted`, `rejected`, `needs_changes`. |
| `share_evidence` | boolean not null default false | Consentimiento. |
| `publish_receipt` | boolean not null default false | Consentimiento. |
| `terms_version` | text not null | Versión aceptada. |
| `declared_created_at` | timestamptz not null | `createdAt` del payload. |
| `issued_at` | timestamptz not null default now() | Tiempo del servidor; no sustituye al declarado. |
| `supersedes_receipt_id` | text | Recibo anterior reemplazado. |
| `previous_receipt_hash` | text | Cadena declarada. |
| `revoked_at` | timestamptz | Revocación lógica. |
| `revocation_reason` | text | Motivo declarado por el propietario. |

Índices: `unique(receipt_hash)`, `(user_id, issued_at desc)`, `(proposal_id)`, `(review_state)`, `(visibility, issued_at desc)`.

### 8.2 `evidence_receipt_items`

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | text PK | UUID. |
| `receipt_id` | text not null | FK a `evidence_receipts.id`, `on delete cascade`. |
| `ordinal` | integer not null | Orden declarado. |
| `label` | text not null | Nombre del archivo o etiqueta. |
| `kind` | text not null | Enum del esquema. |
| `sha256` | text not null | Huella. |
| `size_bytes` | bigint | Declarado. |
| `content_type` | text | Declarado. |
| `uri` | text | Localizador opcional. |
| `license` | text | Declarada. |
| `visibility` | text not null default `private` | Puede diferir del recibo. |

Índice: `(receipt_id, ordinal)` y `(sha256)` para búsquedas de duplicados.

### 8.3 `evidence_receipt_attestations`

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | text PK | UUID. |
| `receipt_id` | text not null | FK. |
| `actor_user_id` | text not null | Quien atestigua. |
| `actor_role` | text not null | `owner`, `reviewer`, `moderator`, `system`. |
| `kind` | text not null | `submitted`, `integrity_checked`, `evidence_matched`, `reviewed`, `revoked`. |
| `outcome` | text | `accepted`, `rejected`, `needs_changes`, `informational`. |
| `note` | text | Justificación humana. |
| `canonical_payload` | jsonb not null | Contenido de la atestación. |
| `previous_attestation_hash` | text | Cadena. |
| `attestation_hash` | text not null | SHA-256 de la atestación. |
| `created_at` | timestamptz not null default now() | Tiempo del servidor. |

Índice: `(receipt_id, created_at)`.

### 8.4 Vínculo con evidencia existente

`proposal_evidence` ya tiene `sha256`, `version`, `license`, `visibility` y `verification_status`. La fase 2 añade `receipt_id text` nullable y un índice. La regla es:

- un recibo puede existir sin propuesta;
- una evidencia de propuesta puede apuntar a un recibo;
- no se duplican huellas ni estados de verificación;
- la propuesta conserva su propio flujo editorial.

## 9. Contratos de API

### 9.1 Fase 1 (implementada)

`POST /api/v1/evidence/receipts/verify`

- Público, sin sesión, sin estado.
- `Content-Type: application/json` exacto; `charset` permitido.
- Cuerpo máximo: 64 KiB.
- UTF-8 estricto.
- No descarga URLs, no recibe archivos, no persiste.
- Respuestas:
  - `200` forma e integridad correctas;
  - `422 schema_validation_failed` con `issues` sin eco del payload;
  - `422 integrity_mismatch` con `expected` y `actual`;
  - `413 payload_too_large`;
  - `415 unsupported_media_type`;
  - `400 invalid_json`, `invalid_utf8`, `request_body_unreadable`.
- Cabeceras: `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`.

Respuesta válida:

```json
{
  "valid": true,
  "levels": { "shape": true, "integrity": true },
  "digest": "…",
  "semantics": "This receipt records declared metadata and a SHA-256 digest…",
  "note": "Shape and payload integrity verified. File binding, registered origin, and human review were not checked."
}
```

### 9.2 Fase 2 (registro autenticado)

| Método | Ruta | Acceso | Reglas |
| --- | --- | --- | --- |
| `POST` | `/api/v1/evidence/receipts` | Sesión + mismo origen | Recalcula el hash, rechaza discrepancia, exige `shareEvidence`, persiste, idempotente por `receipt_hash` o `Idempotency-Key`. |
| `GET` | `/api/v1/evidence/receipts/{id}` | Público si `publish_receipt`; si no, propietario | `no-store`; no expone correo ni wallet. |
| `GET` | `/api/v1/evidence/receipts/{id}/verify` | Igual que el anterior | Verifica contra el payload almacenado y devuelve atestaciones. |
| `POST` | `/api/v1/evidence/receipts/{id}/attestations` | Revisor/moderador | Append-only; calcula `attestation_hash`; no muta el recibo. |
| `POST` | `/api/v1/evidence/receipts/{id}/revoke` | Propietario | Marca `revoked_at`; conserva el hash para auditoría. |
| `GET` | `/api/v1/evidence/receipts/{id}/export` | Propietario o público | `format=json|jsonld|csv`; CSV con una fila por evidencia. |

Reglas transversales:

- validación Zod estricta en servidor, nunca confiar en el cliente;
- recomputar el hash en servidor antes de persistir;
- no aceptar `hash` del cliente como verdad;
- no almacenar archivos;
- no resolver URLs;
- `Cache-Control: no-store` en lecturas privadas;
- respuestas de error sin eco del payload;
- límites de longitud y número de evidencias;
- `Idempotency-Key` para evitar duplicados por reintentos.

### 9.3 Límites operativos propuestos

| Operación | Límite | Ventana |
| --- | --- | --- |
| Verificación pública | 60 req/IP | 1 minuto |
| Creación de recibo | 10 req/cuenta | 1 hora |
| Atestación | 30 req/revisor | 1 hora |
| Exportación | 30 req/cuenta | 1 hora |
| Cuerpo JSON | 64 KiB | por solicitud |
| Evidencias por recibo | 20 | por recibo |
| Archivo en cliente | 50 MiB | por archivo |

La fase 1 no aplica rate limit porque no escribe ni persiste; la fase 2 debe usar un limitador distribuido, no memoria de proceso.

## 10. Interfaz

### 10.1 Módulo `/desarrolladores/independiente`

La primera rebanada incluye:

- explicación de límites y niveles;
- constructor con título, tipo, contexto, descripción, URLs, afirmaciones, identidad declarada, licencia y archivos;
- cálculo local de SHA-256;
- consentimiento separado para compartir evidencia y publicar;
- confirmación explícita de que el sello no prueba autoría, verdad ni pago;
- resultado con hash corto y completo, JSON copiable/descargable y verificación de integridad;
- verificador independiente que acepta JSON pegado o cargado y, opcionalmente, los archivos originales para el nivel 2;
- tabla de niveles y endpoint documentado.

### 10.2 Accesibilidad

- etiquetas asociadas a cada campo;
- `role="status"` y `aria-live="polite"` para el estado;
- `role="alert"` para errores;
- foco visible;
- `prefers-reduced-motion` para el indicador de carga;
- texto ES/EN;
- sin dependencia exclusiva del color: los niveles usan icono y texto.

### 10.3 Copy y tono

- «Sellar» no «certificar».
- «Verificar integridad» no «verificar verdad».
- «Evidencia declarada» no «evidencia probada».
- «Revisión humana» no «aprobación automática».
- «Comprobante» no «certificado», «título» ni «pago».

## 11. Integración con TAMV

### 11.1 Procedencia

El CEV complementa, no sustituye, `lib/ecosystem/provenance.ts` y `docs/architecture/provenance-record.schema.json`. La diferencia:

- procedencia: describe el origen de un registro externo;
- CEV: describe la integridad de un sobre y sus huellas.

Un recibo puede incluir una `sourceUri` en `evidence[].uri`; no se convierte automáticamente en un registro de procedencia validado.

### 11.2 Propuestas y evidencia

En fase 2, `proposal_evidence.receipt_id` permite que una evidencia adjunta a una propuesta tenga un comprobante portable. El flujo editorial sigue siendo el de `app/api/v1/research/proposals/[id]/evidence` y `review`; el recibo no cambia el estado de la propuesta.

### 11.3 HCU

Un recibo puede vincularse a `hcu_runs.id` mediante `hcu_run_id`. La huella del recibo no sustituye `inputHash`/`outputHash` de la simulación; solo documenta la evidencia externa asociada.

### 11.4 Consentimiento

Se reutiliza el principio de `research_proposals.shareConsent`: privado por defecto, publicación explícita y revocable. El CEV añade dos permisos separados (`shareEvidence`, `publishReceipt`) y una versión de términos.

### 11.5 Insignias

No se añade ninguna insignia en fase 1. En fase 3, las únicas métricas admisibles serían hechos de base de datos:

- `receiptsIssued` (recibos persistidos del propietario);
- `receiptsReviewed` (atestaciones humanas registradas);
- `evidenceBound` (recibos con al menos una evidencia vinculada y revisada).

Nunca se premiaría visitar la página, pegar un JSON o generar un hash local. La insignia debe declarar que reconoce el acto registrado, no la verdad del contenido.

### 11.6 Exportación

`receiptToJsonLd` produce una proyección conservadora con `disclaimer`. En fase 2, el CSV tendrá una fila por evidencia y columnas: `receipt_id`, `receipt_hash`, `subject_title`, `evidence_label`, `sha256`, `size_bytes`, `review_state`, `issued_at`, `visibility`.

### 11.7 Relación con TPVA Receipt v1

El repositorio ya contiene una especificación distinta, `docs/specs/tpva-receipt-v1.md`, orientada a recibos de build/artefacto con checks, firma Ed25519 y estados `VERIFIED`/`WITH NOTES`/`FAILED`/`UNVERIFIED`/`REVOKED`. CEV y TPVA no son intercambiables:

| Dimensión | TPVA Receipt v1 | CEV v1 |
| --- | --- | --- |
| Esquema | `tpva-receipt/v1` | `tamv.evidence_receipt.v1` |
| Enfoque | Build, checks, artefacto | Evidencia portable de un contribuyente |
| Firma | Ed25519 en la spec | Ninguna en v1 |
| Canonización | Orden + normalización de fechas | `tamv-jcs-1` + NFC + dominio |
| Hash | `sha256:<hex>` del payload | SHA-256 de `tamv.cev.v1\n` + payload |
| Estado | Evaluación de checks y firma | Forma e integridad; niveles separados |

Un recibo CEV puede declarar como evidencia el hash o la URL de un recibo TPVA, pero eso no lo convierte en un TPVA válido ni viceversa. No se reutiliza el hash de un protocolo en el otro.

## 12. Privacidad y retención

- No se almacena wallet.
- Los handles son opcionales y se pueden omitir.
- El texto libre puede contener PII; la interfaz advierte que no se incluya información privada.
- Los archivos no se almacenan; solo huellas y metadatos.
- La revocación es lógica: conserva el hash y las atestaciones para auditoría, pero oculta el contenido público.
- Retención propuesta: recibos y atestaciones mientras exista la cuenta; evidencia, nunca en servidor.
- Borrado de cuenta: anonimizar `user_id` o eliminar recibos privados; conservar agregados sin PII.
- Exportación y borrado deben ser operaciones explícitas del propietario.

## 13. Fases

### Fase 0 — Análisis y decisión (completada)

- Inventario de la fuente.
- Análisis de garantías y fallos.
- Decisión de nombre, esquema y límites.
- Documento de investigación y este documento.

### Fase 1 — Rebanada sin estado (completada)

- `lib/evidence/receipt.ts`.
- `POST /api/v1/evidence/receipts/verify`.
- Constructor y verificador en `/desarrolladores/independiente`.
- Pruebas de contrato.
- Sin base de datos, sin cuentas, sin archivos, sin insignias.

### Fase 2 — Registro autenticado

- Migración `evidence_receipts`, `evidence_receipt_items`, `evidence_receipt_attestations`.
- `POST /api/v1/evidence/receipts` con idempotencia.
- Página pública `/evidencia/[id]`.
- Atestaciones y revocación.
- Rate limit distribuido.
- Exportación JSON/JSON-LD/CSV.

### Fase 3 — Integración editorial

- `proposal_evidence.receipt_id`.
- Vínculo con HCU.
- Insignias derivadas de hechos registrados.
- Panel del propietario y borrado/exportación.

### Fase 4 — Endurecimiento

- Firmas Ed25519/ES256 con claves gestionadas.
- Rotación y revocación de claves.
- Anclaje externo opcional (commit Git, OpenTimestamps) sin presentarlo como verdad.
- Federación con otros registros que acepten el esquema.

## 14. Criterios de aceptación

### Fase 1

- [x] El esquema rechaza campos desconocidos, digests mal formados y recibos sin localizador.
- [x] La canonización es determinista e independiente del orden de claves.
- [x] La normalización NFC está documentada y probada.
- [x] Un payload alterado falla la integridad.
- [x] El vínculo con archivos se comprueba localmente y reporta coincidencias y faltantes.
- [x] La API limita cuerpo, tipo de contenido y UTF-8; no refleja el payload.
- [x] La UI muestra los niveles alcanzados y no alcanzados.
- [x] La UI no promete autoría, verdad, revisión ni pago.
- [x] `pnpm test`, `pnpm typecheck` y `pnpm build` pasan.
- [x] No se copió código del proyecto externo.

### Fase 2

- [ ] Migración reversible y probada en base de datos desechable.
- [ ] El servidor recalcula el hash y rechaza discrepancias.
- [ ] La creación es idempotente.
- [ ] La lectura privada exige propietario; la pública exige `publishReceipt`.
- [ ] Las atestaciones son append-only y tienen cadena verificable.
- [ ] La revocación no borra la evidencia de auditoría.
- [ ] Rate limit distribuido documentado y probado.
- [ ] Exportación JSON/JSON-LD/CSV con los mismos límites semánticos.

## 15. Plan de pruebas

- **Unitarias:** canonización, límites, normalización, hash, sello, verificación, vínculo, nombres de archivo, JSON-LD.
- **Contrato de API:** válido, alterado, esquema inválido, tamaño, tipo, UTF-8, stream roto, no eco.
- **Propiedades:** el orden de claves no cambia el hash; un cambio de cualquier hoja cambia el hash; el hash recalculado siempre coincide con el declarado para un recibo sellado.
- **Integración (fase 2):** creación idempotente, permisos, revocación, atestaciones, exportación, rate limit.
- **Accesibilidad:** navegación por teclado, etiquetas, `aria-live`, contraste, reducción de movimiento.
- **Seguridad:** payload profundo, payload enorme, Unicode malformado, URL `javascript:`, XSS en campos, ausencia de eco.

## 16. Riesgos y preguntas abiertas

1. **Firma:** sin firma, el nivel 3 depende de la base de datos. ¿Se añade firma en fase 4 o se mantiene el foco en registro?
2. **Claves:** si se añaden firmas, ¿quién custodia las claves y cómo se revocan?
3. **Privacidad:** ¿se permite un recibo totalmente anónimo? La fase 1 sí; la fase 2 exigiría cuenta para persistir.
4. **Duplicados:** ¿un mismo hash puede pertenecer a dos cuentas? Sí, si ambas declaran la misma evidencia; la UI debe advertir que la primera declaración no confiere propiedad.
5. **Revisión:** ¿quién revisa y con qué criterios? Debe existir un flujo editorial separado, no un botón de «aprobar».
6. **Pago:** cualquier programa de pago debe tener su propio contrato, revisión y trazabilidad; el CEV no debe usarse como recibo de pago.
7. **Licencia:** la fuente externa no declara licencia; cualquier reutilización de su código requiere aclaración. Este documento y la implementación nativa no copian código.

## 17. Atribución

Método original: **Proof Drop**, asociado a Brandon Ducar y al contexto ZABAL Gamez. Esta evolución cita el origen y reelabora el concepto. No se copiaron código, textos, interfaz ni recursos. La fuente fijada es el commit `418457b243f8ca9d45e39f37b908a3b6aaef1f85` (2026-10-09).
