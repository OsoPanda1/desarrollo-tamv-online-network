# TPVA Receipt v1 — especificación ejecutable parcial

Estado: **spec / Fase 1**. Este documento define el contrato y el verificador offline. No emite recibos productivos, no gestiona claves privadas, no contacta revisores externos y no concede insignias.

Archivos de la Fase 1:

- `docs/specs/tpva-receipt-v1.schema.json`: esquema canónico.
- `lib/proofs/canonical.ts`: canonicalización determinista.
- `lib/proofs/hash.ts`: SHA-256 del payload canónico.
- `lib/proofs/validate.ts`: validación estructural estricta y reglas de seguridad de rutas.
- `lib/proofs/verify.ts`: verificación offline y evaluación de estado.
- `docs/specs/tpva-test-vectors/`: vectores positivos y negativos.
- `tests/tpva-receipt-v1.test.mjs`: pruebas reproducibles.

## Payload canónico

`receipt_hash` se calcula sobre el payload canónico, excluyendo `receipt_hash` y `signature`. La canonicalización:

1. Elimina `receipt_hash` y `signature`.
2. Ordena todas las claves lexicográficamente de forma recursiva.
3. Ordena `evidence` por `path` y `checks` por `name`, con desempate determinista.
4. Normaliza `issued_at` y `revocation.revoked_at` a ISO-8601 UTC con milisegundos.
5. Serializa JSON sin espacios con escapes mínimos y lo codifica como UTF-8.
6. Calcula `sha256` y lo representa como `sha256:<64 hex>`.

La firma Ed25519, cuando se verifica, cubre exactamente esos bytes canónicos. No se firma el JSON formateado para humanos.

## Estados y precedencia

El verificador aplica reglas en este orden; la primera regla que dispara define el estado:

1. Esquema inválido → `UNVERIFIED`.
2. Hash recalculado distinto → `FAILED`.
3. Recibo revocado → `REVOKED`.
4. Clave desconocida → `UNVERIFIED`.
5. Clave revocada → `REVOKED`.
6. Firma Ed25519 inválida o ilegible → `FAILED`.
7. `checks[].evidence_ref` sin entrada en `evidence[]` → `UNVERIFIED`.
8. Check obligatorio (`mandatory: true`) distinto de `pass` → `FAILED`.
9. Observaciones, check opcional no aprobado, `review.type: "independent"` o `review.external: true` → `WITH NOTES`.
10. En caso contrario → `VERIFIED`.

Fuera de fallo: cualquier excepción o dato faltante degrada a `UNVERIFIED`. Un recibo histórico nunca se sobrescribe en esta spec; la emisión y persistencia pertenecen a fases posteriores.

## Límites explícitos

- No se verifica autoría, identidad de firmante, tiempo confiable ni peer review.
- No se comprueba el contenido de los archivos de evidencia, solo su declaración estructural y su clsula de integridad cuando exista.
- No se afirma SLSA runtime, no-repudio, cumplimiento normativo ni seguridad absoluta.
- `review.external: true` no produce una insignia externa: el verificador offline lo degrada a `WITH NOTES`.
- Las claves privadas nunca se leen ni se escriben. Las pruebas generan un par Ed25519 efímero en memoria.
- No se usa criptografía postcuántica simulada como primitiva de seguridad.

## Comandos de la Fase 1

```powershell
node 'C:\Users\tamvo\AppData\Roaming\npm\node_modules\pnpm\bin\pnpm.mjs' test
node 'C:\Users\tamvo\AppData\Roaming\npm\node_modules\pnpm\bin\pnpm.mjs' typecheck
```
