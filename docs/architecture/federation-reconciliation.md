# Reconciliación de federaciones — mapa canónico del repositorio y variantes históricas de Drive

**Fecha:** 2026-11-23 · **Rama:** `unify/hub-tamv-v9` · **Alcance:** Fase 2 del portado de unificación del hub TAMV
**Fuentes:** `ANALISIS-ARQUITECTURA-TAMV.md` (§2.3, §6.1 punto 1, §7.1, §7.3 decisión 1), a partir de 20 documentos de Google Drive / Google Docs leídos íntegros; `components/tamv-institutional-site.tsx` (lista `federationAreas`).

> **Resumen / Summary.** Todos los documentos coinciden en que el modelo es heptafederado (7 federaciones, "no triple"), pero ningún mapa de federaciones coincide con otro. El repositorio ya usa sus propias 7 áreas de referencia, que son el mapa canónico del portado. Los 6 mapas de Drive se transcriben abajo como variantes históricas, sin mezclarlos con el mapa canónico ni entre sí.
>
> **Summary.** Every document agrees the model is heptafederated (7 federations, "not triple"), yet no two federation maps agree with each other. The repository already uses its own 7 reference areas, which are the canonical map for this port. The 6 Drive maps are transcribed below as historical variants, never mixed with the canonical map or with each other.

## 1. Mapa canónico del repositorio

El mapa canónico es el de las 7 áreas de referencia ya presentes en la home (`components/tamv-institutional-site.tsx`, `federationAreas`):

| # | Área de referencia (ES) | Reference area (EN) |
|---|---|---|
| 1 | Identidad y confianza | Identity and trust |
| 2 | Conocimiento e investigación | Knowledge and research |
| 3 | Gobernanza y responsabilidad | Governance and accountability |
| 4 | Inteligencia artificial | Artificial intelligence |
| 5 | Aprendizaje y academia | Learning and academia |
| 6 | Economía y participación | Economy and participation |
| 7 | Territorio y comunidad | Place and community |

Este mapa es, en rigor, un séptimo mapa distinto de los seis de Drive (análisis §2.3): fue elegido como canónico por decisión de portado (§7.3, decisión 1), no porque los documentos lo respalden. Es el único mapa que se muestra en las vistas del hub.

## 2. Variantes históricas de Drive (transcripción, sin reconciliar)

### Mapa 1 — Manifiesto de estructura final

**Fuente:** "Ecosistema TAMV - Manifiesto y Estructura Final", §II.

| # | Federación |
|---|---|
| F1 | Capa Fundacional (propósito y principios éticos) |
| F2 | Capa Estructural (ontología y taxonomías) |
| F3 | Capa de Conocimiento (documentación) |
| F4 | Capa Narrativa (identidad y territorio) |
| F5 | Capa Económica (modelos de negocio y finanzas) |
| F6 | Capa Técnica (código, Zero-Trust, orquestación) |
| F7 | Capa de Alianza – Isabella (kernel de IA ética y gobernanza) |

### Mapa 2 — Manual Maestro

**Fuente:** "MANUAL DOCUMENTAL MAESTRO Y BLUEPRINT INTEGRAL DE ISABELLA VILLASEÑOR AI™ & TAMV ONLINE", §3.

| # | Federación |
|---|---|
| F1 | Mesh / CITEMESH |
| F2 | Identidad |
| F3 | Educación / UTAMV |
| F4 | Transaccional / BookPI |
| F5 | Cognitivo / Isabella + KEC + EOCT |
| F6 | Cultural / DreamSpaces |
| F7 | Logística / Turismo / Comercio |

### Mapa 3 — Informe YUN

**Fuente:** "Informe Estratégico: Ecosistema TAMV Online y la Arquitectura de Soberanía Digital YUN", §2.

| # | Federación |
|---|---|
| Fed1 | Comercio local |
| Fed2 | Turismo y cultura |
| Fed3 | Academia |
| Fed4 | Gobierno local |
| Fed5 | Tecnología |
| Fed6 | Comunidad |
| Fed7 | Metaverso / XR |

### Mapa 4 — OSF

**Fuente:** "OSF Home Canonical Project Description - TAMV Paradigm & RDM Digital Hub", §I.2.

| # | Federación |
|---|---|
| F1 | Identidad |
| F2 | Memoria y Patrimonio |
| F3 | Turismo |
| F4 | Economía |
| F5 | Gemelos Digitales |
| F6 | IA Colectiva / C.R.O.W.N. |
| F7 | Resiliencia PQC |

### Mapa 5 — ROOT CANON

**Fuente:** "DOCUMENTO MAESTRO DE AUTORÍA CANÓNICA (ROOT CANON) — TAMV ONLINE NETWORK™", §3.

| # | Federación |
|---|---|
| 1 | Identidad |
| 2 | Mentoría |
| 3 | Economía |
| 4 | Territorio |
| 5 | Criptografía |
| 6 | Ética |
| 7 | Soberanía |

### Mapa 6 — Soberanía TAMV (árbol de ISABELLA CERO)

**Fuente:** "Soberanía TAMV", §8.3, árbol de ISABELLA CERO.

| # | Federación | Capa técnica asociada |
|---|---|---|
| 1 | Ontológica | ISNI |
| 2 | Constitucional | DOI |
| 3 | Plataforma | PLAT / MD-X4 |
| 4 | Económica y Ledger | DATA / BookPI & MSR |
| 5 | Cognitiva | AI / Isabella & TINA |
| 6 | Inmersiva | XR / HyperRender X4 & DreamSpaces |
| 7 | Territorial | SOT / RDM Hub & LITLE |

## 3. Advertencia

**Ningún documento del corpus reconoce la discrepancia.** No existe en Drive ninguna tabla de correspondencia, ningún mapeo ni ninguna decisión que explique cómo se relacionan estos seis mapas entre sí o con el mapa del repositorio (análisis §2.3 y §6.1, punto 1). Las similitudes de nombre entre mapas (por ejemplo, "Identidad" aparece en los Mapas 2, 4, 5 y 6, y "Economía" en los Mapas 3, 4 y 5) no implican equivalencia: cada documento define su federación en su propio contexto y con distinto alcance, por lo que **dos federaciones con el mismo nombre en mapas distintos no deben tratarse como la misma federación**.

**Los mapas nunca deben mezclarse en una misma vista.** Cada vista del hub muestra un solo mapa —el canónico del repositorio (§1)— y remite a esta nota para las variantes. No se crean etiquetas híbridas, no se renombran federaciones de un mapa con nombres de otro, y no se presenta ninguna correspondencia entre mapas como equivalencia verificada.

## 4. Decisión de portado

- **Mapa canónico:** el del repositorio (§1). Es el único que se renderiza en la home y en el grafo público HCU.
- **Variantes históricas:** los Mapas 1–6 (§2) se conservan únicamente en esta nota, como transcripción documental con su fuente y sección.
- **Sin correspondencia:** no se establece mapeo entre mapas. Si en el futuro el mantenedor decide una correspondencia, debe documentarse aquí con su justificación y su fuente, no inferirse de la similitud de nombres.
- **Pregunta abierta relacionada:** la correspondencia entre los 6 dominios HCU del hub y las 7 federaciones de gobernanza sigue abierta (ver `docs/architecture/hcu-reconciliation.md`, §2); esta nota no la resuelve.

## 5. Referencias

- Análisis de arquitectura TAMV, §2.3 (cuyo encabezado dice "cinco mapas distintos" pero enumera seis: Manifiesto, Manual Maestro, Informe YUN, OSF, ROOT CANON y Soberanía TAMV), §6.1 punto 1, §7.1 (tabla "Sí debe alimentar el portado"), §7.3 decisión 1.
- `components/tamv-institutional-site.tsx` — `federationAreas` (ES) y su versión EN.
- `docs/architecture/hcu-reconciliation.md` — reconciliación del grafo HCU del hub con el grafo público del repositorio.
