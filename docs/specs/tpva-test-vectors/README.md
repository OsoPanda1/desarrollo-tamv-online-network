# Vectores TPVA Receipt v1

Todos los archivos son sintéticos. No contienen secretos, claves privadas ni datos reales de usuarios. Las firmas se generan en memoria dentro de `tests/tpva-receipt-v1.test.mjs` con un par Ed25519 efímero; los archivos conservan un valor de ejemplo de 128 ceros.

| Vector | Propósito | Estado esperado |
|---|---|---|
| `valid.receipt.json` | Payload completo, checks obligatorios aprobados, sin observaciones | `VERIFIED` |
| `with-notes.receipt.json` | Check opcional omitido y limitación documentada | `WITH NOTES` |
| `external-claim.receipt.json` | Reclamo de revisión independiente con proveedor declarado | `WITH NOTES`; nunca insignia externa |
| `altered-hash.receipt.json` | `receipt_hash` modificado | `FAILED` |
| `invalid-signature.receipt.json` | Firma alterada tras firmar | `FAILED` |
| `revoked-key.receipt.json` | `kid` con clave revocada | `REVOKED` |
| `unknown-key.receipt.json` | `kid` sin clave pública disponible | `UNVERIFIED` |
| `incomplete-receipt.receipt.json` | Falta `checks` | `UNVERIFIED` |
| `missing-evidence-ref.receipt.json` | `checks[].evidence_ref` sin entrada en `evidence[]` | `UNVERIFIED` |
| `mandatory-failed.receipt.json` | Check obligatorio en `fail` | `FAILED` |
| `path-traversal.receipt.json` | Ruta `../` en evidencia | `UNVERIFIED` |
| `oversized-evidence.receipt.json` | `size_bytes` sobre el límite | `UNVERIFIED` |
| `additional-property.receipt.json` | Propiedad `badge` no permitida | `UNVERIFIED` |
| `noncanonical-date.receipt.json` | Fecha sin milisegundos UTC | `UNVERIFIED` |
| `external-without-provider.receipt.json` | `external: true` sin proveedor real | `UNVERIFIED` |

El verificador offline no intenta redes, no consulta URLs de proveedor y no sustituye la decisión de un tercero.
