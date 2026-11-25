# LATAMV Governance System 2.0 — especificación y núcleo demostrable

Estado del documento: **especificación con evaluador local determinista**, no certificación ni autorización de producción. Código canónico declarado en el material de origen: `CANON-EOC-TAMV-GOVERNANCE-2026-V2.0`. Fecha de emisión declarada: 2026-11-25. Última verificación local: 2026-11-25, 159/159 tests, `typecheck` OK, `build` OK y `audit` sin vulnerabilidades altas.

Fuente: texto `LATAMV GOVERNANCE SYSTEM 2.0 — MÓDULO CANÓNICO EVOLUCIONADO` aportado por el usuario. No existe un archivo `output/latamv-governance-2.0/LATAMV_GOVERNANCE_SYSTEM_2.0.md` en este repositorio; por eso las fases marcadas como "Implementado (prototipo)" en el texto de origen se tratan aquí como **afirmaciones de origen sin evidencia local**, no como hechos verificados.

## Principio y límite

El texto de origen propone: `DEFAULT = DENY` y `ALLOW = IDENTITY × AUTHORITY × POLICY × EVIDENCE × SAFETY × CONSENSUS`.

En este repositorio solo se implementa una **evaluación local y determinista**: reglas con ventana de vigencia, denegación por defecto, regla más estricta ganadora (`strictest-wins`) y conteo de aprobaciones por nivel de impacto. El evaluador **no verifica firmas**, no valida DID, no comprueba propiedad de claves, no genera ni verifica pruebas ZK, no autentica stakeholders, no evalúa evidencia BookPI real y no produce decisiones de autorización en producción.

`signatureMetadata` es una etiqueta informativa no verificada: cambiarla no cambia el resultado. El conteo de aprobaciones es aritmética, es decir, **conteo de aprobaciones, no firmas criptográficas**. Ningún resultado de esta demo debe presentarse como cuórum criptográfico, no-repudio ni cumplimiento legal.

## Estado por capa

| # | Capa de la especificación | Estado en este repositorio | Evidencia y límite |
|---|---|---|---|
| 1 | Constitución Digital Viva (CDV) | **Parcial — núcleo demostrable** | `lib/governance/latamv-v2.ts` evalúa vigencia temporal (`valid_from`/`valid_until`) y denegación por defecto. No hay gobernanza productiva ni ejecución automática de reglas. |
| 2 | Regulatorio DNA (R-DNA) | **Parcial — catálogo de demostración** | `LATAMV_V2_DEMO_GENES` define genes reutilizables y selección determinista de renovación. Las fuentes son declaraciones, no revisión jurídica. |
| 3 | Negociador Jurisdiccional | **Parcial — regla estricta, sin negociación** | `strictest-wins` compara severidad entre jurisdicciones. No hay negociación automática, excepciones firmadas ni intervención humana modelada. |
| 4 | Pruebas ZK de Cumplimiento | **No implementado** | No hay circuitos, *proving key*, *verifying key*, prueba ni verificación criptográfica. Cualquier resultado es lógica clásica sobre datos de ejemplo. |
| 5 | Auto-Sanación Constitucional | **No implementado** | `resolveRenewal()` solo selecciona una entrada vigente del catálogo. No re-sella cadenas, repara Merkle roots ni reinicia servicios. |
| 6 | Quórum Multi-Stakeholder | **Parcial — conteo local** | `requiredApprovals()` devuelve `[1,1,2,2,3]` para impactos `0..4`. No hay identidades verificadas, firmas Ed25519, veto ni quórum criptográfico. |
| 7 | Pasaporte de Cumplimiento Soberano | **No implementado** | No hay DID canónico, genoma firmado, historia de auditoría portable ni emisor verificable. |

## Roadmap de las 12 fases — lectura honesta

| Fase | Acción declarada | Estado verificable aquí |
|---|---|---|
| 1 | 5 Pilares (CROWN + BookPI + TJG + TPG + LCM) | Interfaz y documentación conceptual; no se afirma despliegue integral. |
| 2 | 8 Controles Universales LATAMV | Especificación; sin verificación externa. |
| 3 | Adaptadores Jurisdiccionales | Pendiente. |
| 4 | Automatización por Riesgo (0-4) | Parcial: conteo de aprobaciones por impacto en el evaluador local. |
| 5 | Domain Runtime + Router Semántico | Router público local; no es un runtime de gobernanza productivo. |
| 6 | Recuperación entre Workers | Afirmación de origen; sin evidencia en este repositorio. |
| 7 | Fail-Closed M6 Ciberfísico | Especificación; sin infraestructura ciberfísica. |
| 8 | Constitución Digital Viva (CDV) | Parcial: vigencia y denegación por defecto en el evaluador local. |
| 9 | Regulatorio DNA (R-DNA) | Parcial: catálogo de genes de demostración. |
| 10 | Negociador Jurisdiccional + Pruebas ZK | Parcial solo en `strictest-wins`; ZK no implementado. |
| 11 | Auto-Sanación + Quórum Multi-Stakeholder | Parcial solo en selección de renovación y conteo de aprobaciones. |
| 12 | Pasaporte de Cumplimiento Soberano + Auditoría Externa | Pendiente. |

## Evaluador determinista

API expuesta en `lib/governance/latamv-v2.ts`:

- `isGeneActive(gene, at)`: valida fechas `YYYY-MM-DD` y ventana inclusiva.
- `evaluateConstitution(genes, context, at)`: devuelve `DENY` si no hay regla vigente, si la regla vigente exige denegación, si falta alguno de los cinco factores o si el conteo de aprobaciones es inferior al umbral; solo devuelve `ALLOW` cuando todos los factores y el conteo requerido están presentes.
- `requiredApprovals(impact)`: `[1,1,2,2,3]` para impactos `0..4`.
- `resolveRenewal(genes, prefix, at)`: elige la entrada vigente más reciente de una familia; no repara nada.

Casos cubiertos por `tests/latamv-v2-policy.test.mjs`: vigencia exacta, regla ausente/expirada, severidad estricta entre jurisdicciones, factor ausente, aprobaciones insuficientes, neutralidad de la etiqueta de firma, renovación determinista y revisión de este documento.

## Superficie visible

La consola pública incluye un panel **CDV · evaluación local** dentro del laboratorio de verificación. Muestra regla coincidente, motivo de la decisión, aprobaciones requeridas y una nota explícita: es una evaluación local sobre datos de ejemplo, **no es cumplimiento legal**, ni autorización, ni verificación criptográfica.

## Cierre de brechas

Para pasar de demostración a operación real se requiere, como mínimo: catálogo de reglas revisado y versionado con dueño; verificación criptográfica de firmas con claves gestionadas; pruebas ZK reales con circuitos auditables; identidad y quorum verificables; events inmutables y auditoría externa; migración y prueba de la base; revisión de seguridad y evidencia de despliegue del SHA exacto. Hasta entonces, cualquier uso productivo de LATAMV 2.0 permanece fuera de alcance.
