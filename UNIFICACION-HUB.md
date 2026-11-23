# Unificación del hub TAMV — informe de portado

**Rama:** `unify/hub-tamv-v9` (desde `main` en `92d7d88`)
**Fecha:** 2026-11-23
**Estado:** trabajo local en la rama, **sin push a GitHub**. El usuario revisa el diff primero.
**Fuente:** hub estático `tamv-online-network.html` (5.8 MB, 3795 líneas, 27+ secciones).
Auditoría previa del hub: `docs/audit/2026-11-23-tamv-html-hub-audit.md`.

## Principio del portado

No se volcó el HTML monolítico en el repo. El contenido se portó a la
arquitectura Next.js 16 + React 19 + TypeScript del repositorio: componentes
de servidor, datos tipados o semillas en forma de las tablas Drizzle,
reutilización de Better Auth, del portal, del observatorio HCU y de la ruta
`/apoyar`. Las 37 asignaciones a `innerHTML` del hub no se portaron:
todo se reescribió con componentes React y escape.

## Qué se portó y dónde

### Fase 0 — Datos semilla, imágenes y home

- **Imágenes** — `public/hub/`: 17 data URI del hub → 11 archivos únicos,
  deduplicados por SHA-256, con nombres con hash de contenido (2.693.732
  bytes únicos; 4.251.743 bytes decodificados en total, igual que la
  auditoría). El logo extraído es byte-idéntico a `public/tamv-official.jpg`.
  Mapeo con alt y hash en `docs/audit/hub-images-mapping.md`. No queda
  ningún `data:image` en el repo.
- **Semilla de contenido** — `data/seed/hub-content.json`: 11 proyectos
  (Core 2: MD-X4/MD-X5, BookPI; Active 6: Isabella Villaseñor AI, TAMV OS,
  UTAMV, RDM Digital Hub, Creator Intelligence, Play & Go; Alpha 3: Atlas
  Transcendence, LITLE, Xclusive), 6 temas de investigación y el perfil del
  fundador, en forma de `research_projects`, `research_topics` y
  `researcher_profiles`. `sourceUrl` solo donde el hub da URL real
  (Atlas → Zenodo 20802425; Isabella → github.com/OsoPanda1/isabella-ai-tina);
  el resto es `null`, sin URLs inventadas.
- **Datos tipados** — `components/tamv-data.ts` (+307): manifiesto Enterprise
  y 5 axiomas, matriz de runtime (MD-X4, RDM-TOS, Isabella AI Genesis,
  MSR/BookPI, TAMV Network), perfil del fundador (ORCID
  0009-0008-5050-1539, ISNI 0000000531699229, Loop 3117809, GitHub OsoPanda1,
  principio rector, modelo TINA), las 8 monedas phygital solo por nombre
  (sin descripciones inventadas), cita de Legado verbatim y guía de 8 pasos.
- **Home** — `components/tamv-institutional-site.tsx` (+259, ES y EN):
  secciones 10/11/12: Empresa/Manifiesto, Fundador y Legado / El Camino,
  con enlaces a `/excelencia`, `/hcu` y `/auditoria-creator`.

### Fase 1 — Rutas nuevas documentales

- **`/utamv`** — `app/utamv/page.tsx` (383 líneas): documento maestro
  §§0–10. Borrador interno v3.0, emisión 1 de noviembre de 2026, Nodo Cero.
  TQAF-10 0/10, Pipeline 2/8, Sello de datos No emitido, Registro 2
  entradas, Tensión 2032 (C) 40%. Deslinde RVOE prominente en dos lugares:
  Academia y Red de Ciencia Abierta, no expide títulos ni cédulas
  estatales. Sistema TRI (7 roles, ejemplo TRI-TAMV-2026-0001), niveles
  N1–N3, tabla TQAF-10, pipeline con auditoría A1–A7, preguntas Q1–Q4.
  Único ejemplo numérico: Seguridad (X 92.8, Y 88, Z 93.3, T 2032,
  Q 20.6%, Ω 73.7; activaciones 2030/2038/2050).
- **`/excelencia`** — `app/excelencia/page.tsx` +
  `components/excellence/fair-record-generator.tsx`: 4 pilares (rigor
  TQAF-10, arbitraje TRI-E, reproducibilidad FAIR, mejora continua BookPI),
  ciclo documental de 6 pasos con control N1/N2/N3 y generador FAIR en
  cliente (solo memoria de sesión): vista previa en vivo, copiar, descargar
  `.md` y mailto al canal canónico.
- **`/auditoria-creator`** — `app/auditoria-creator/page.tsx` +
  `components/audit/audit-sheet-generator.tsx`: ficha de una página, campos
  01–07 arriba, SHA-512 calculado en vivo y firma Ed25519 con clave
  efímera de demostración verificada en página abajo. Dos ejemplos
  editables (permitido / detenido fail-closed), copiar/descargar `.md`,
  impresión A4 aislando la ficha. Advertencia prominente: son ejemplos de
  formato, no registros reales; un hash no prueba inmutabilidad ni autoría
  sin firma ni ancla externa. Plantilla citada: BPI-2026-0001
  (2026-10-08).
- Enlace desde `app/desarrolladores/page.tsx` (+3) y estilos con alcance
  `.doc-*` / `.audit-sheet` + `@media print` en `app/globals.css` (+67).
  Las tres rutas están en `app/sitemap.ts`.

### Fase 2 — Reconciliación HCU

- **Semilla HCU** — `data/seed/hcu-graph.json`: 6 dominios, 26 átomos
  (X/Y/Z literales del hub; provisionales solo Educación y Trabajo) y
  8 hiperaristas (H1–H8, w 0,35/0,30, rezago 1–5 años, signo +1 en H1–H6
  y −1 en H7→Cambio Climático, H8→Ciberdelito; las 8 con
  `evidenceStatus: "hypothesis"` y nota «sin fuente»).
- **Reconciliación** — `docs/architecture/hcu-reconciliation.md`:
  escenarios del hub A/B/C (narrativas del documento maestro) frente a
  `baseline / conservative / collaborative` del repo, con correspondencia
  propuesta A→conservative, B→baseline, C→collaborative y sus límites;
  6 dominios del hub + Ω Core frente a los 7 ámbitos del repo
  (Economía y participación es placeholder sin átomos cuantificados);
  fórmulas Ω = X·(1−Q), Κ = Z·(1−Q); los 5 casos preparados de fallas;
  la raíz SHA3-512 como control local, no firma ni certificación.
  Caso de referencia verificado con el `simulate()` del propio hub:
  ciberseguridad, choques −1 en 2030/31/32, escenario B → A −0,58 en 2033
  (con el choque inicial +1 en IA Generativa en 2026 del estado
  demostrativo por defecto; sin él sería −0,73; ambas cifras registradas).
- **Página HCU** — `app/hcu/page.tsx` (+1): sección bilingüe que enlaza
  el documento de reconciliación y advierte que los valores son hipótesis.
  El modelo `lib/hcu/model.ts` no se modificó.

### Fase 3 — Cuenta y Únete sobre el portal real

- **`/cuenta`** — `app/cuenta/page.tsx`: comparativa Free ($0) y Premium
  según el hub, con los límites declarados en la página: sin cobro en
  línea, cuota Premium acordada por el canal canónico y confirmada por
  correo, activación y rol TRI confirmados por correo. Enlaces prominentes
  a `/sign-up`, `/sign-in` y `/portal` (Better Auth real).
- **`/unete`** — `app/unete/page.tsx`: 4 puertas (investigar, ingeniería
  TRI-D, dictaminar TRI-E, colaborar desde el territorio TRI-C) con enlaces
  reales a `/proyectos`, `/portal/propuestas/nueva`, GitHub,
  `/desarrolladores`, `/portal`, `/gobernanza` y `/comunidad`; guía para
  proponer proyecto nuevo con los campos del portal; ruta publicar
  (propuesta → arbitraje TQAF → DOI) hacia
  `/investigacion/publicaciones` y `/excelencia`.
- **Comunidad** — `app/comunidad/page.tsx` (+9): sección breve bilingüe
  que enlaza a `/unete` y `/cuenta`. Ambas rutas en `app/sitemap.ts`.

## Qué se reutilizó (sin duplicar)

- `TamvAppShell` + `PageIntro` + `LanguageSwitch` en todas las rutas nuevas.
- Better Auth (`/sign-up`, `/sign-in`, `/portal`) en lugar del login de
  sesión del hub.
- Portal real de propuestas, revisiones y apelaciones en lugar de las
  propuestas por mailto del hub.
- Observatorio HCU (`/hcu`, `lib/hcu/model.ts`, `components/hcu/*`) y
  simulador Monte Carlo P10–P90 en lugar del canvas del hub.
- `/apoyar` y `TamvDonationCTA` para donaciones; no se simuló ningún cobro.
- `components/tamv-data.ts` y `TamvProjectExplorer` para el contenido
  institucional y de proyectos.
- Imágenes ya existentes en `public/` (`tamv-official.jpg`,
  `tamv-research-editorial.png`).

## Qué NO se portó y por qué

- **El HTML monolítico del hub** (5.8 MB, data URIs, 37 `innerHTML`):
  duplicaría todo y rompería el auth, la DB y el i18n del repo.
- **El login de sesión del hub** (validación de formato TRI y dígito
  ORCID en el navegador): no es autenticación; el repo tiene Better Auth.
- **El foro del hub**: sus respuestas vivían solo en la sesión del
  navegador. La discusión y las propuestas viven en el portal real, con
  moderación, revisión y apelación.
- **El selector de donación por mailto del hub**: no simula cobro; las
  donaciones van por `/apoyar` y solo redirigen con `TAMV_DONATION_URL`
  configurada en un host permitido.
- **Los correos personales del registro ORCID**: nunca se publican. El
  único correo publicable es el canal canónico
  `anubiscastillo@visitarealdelmonte.online`.
- **Precios Premium, pasarelas, métricas de GitHub, rankings top 50,
  puntajes X/Y/Z adicionales, certificaciones TQAF, RVOE o acreditaciones**:
  no se inventaron. «Autocurativo» e «inalterable» se etiquetan como
  objetivos arquitectónicos, no como propiedades.
- **`WEBINSTITUCIONAL-TAMVONLINE/`**: sitio estático aparte, no
  sincronizado con la DB; no se tocó.
- **Licencias**: no se tocaron (la licencia del código está pendiente de
  decisión del mantenedor, según el README).

## Archivos creados y modificados

Creados: `public/hub/` (11 imágenes), `data/seed/hub-content.json`,
`data/seed/hcu-graph.json`, `docs/audit/hub-images-mapping.md`,
`docs/architecture/hcu-reconciliation.md`, `app/utamv/page.tsx`,
`app/excelencia/page.tsx`, `components/excellence/fair-record-generator.tsx`,
`app/auditoria-creator/page.tsx`, `components/audit/audit-sheet-generator.tsx`,
`app/cuenta/page.tsx`, `app/unete/page.tsx`, `UNIFICACION-HUB.md` (este
informe).

Modificados: `components/tamv-data.ts`, `components/tamv-institutional-site.tsx`,
`app/hcu/page.tsx`, `app/comunidad/page.tsx`, `app/desarrolladores/page.tsx`,
`app/sitemap.ts`, `app/globals.css`, y tres reparaciones mínimas de defectos
preexistentes de `main` (ver «Reparaciones de defectos preexistentes»).

## Reparaciones de defectos preexistentes (fuera del portado, necesarias para verificar)

`main` en `92d7d88` no compila: tres defectos ya presentes en esa base, en
archivos que el portado no tocaba, bloqueaban `typecheck` y `build`. Se
repararon con el cambio mínimo posible en esta rama, sin alterar
comportamiento salvo hacer compilable lo que no compilaba:

1. `app/api/health/ready/route.ts` — el archivo estaba sintácticamente roto
   en `main`: un `try {` sin `catch`/`finally`, referencia a una variable
   `ready` inexistente y llave sin cerrar. Reparación: `catch` que devuelve
   `readinessPayload(false)` con 503 (sin exponer texto de excepción, como
   exige el comentario del propio archivo) y éxito que devuelve
   `readinessPayload(true)` con 200.
2. `components/hcu/hcu-3d-canvas.tsx:507` — `node.atom?.riskY >= HIGH_RISK`
   (TS18048, posiblemente `undefined`). Reparación: `(node.atom?.riskY ?? 0)`.
3. `components/hcu/hcu-analytics-overview.tsx:123` — uso de `localized(...)`
   sin definir (TS2552). Reparación: `english ? row.domain.nameEn :
   row.domain.nameEs`, con la variable `english` ya existente en ese
   componente.

Si Edwin prefiere no incluir estas reparaciones en el merge, puede revertir
esos tres archivos; el portado en sí no depende de ellos, pero sin ellos la
rama (como `main`) no pasa `typecheck` ni `build`.

## Pendientes

1. **Aplicar las semillas a la DB** (`hub-content.json`, `hcu-graph.json`)
   cuando haya `DATABASE_URL` y con revisión humana. Antes de insertar el
   grafo HCU hacen falta: traducción revisada de `nameEn`/`descriptionEn`
   (el hub no publica EN; la semilla los deja `null` y las columnas son
   NOT NULL), reconciliar los ids de dominio propuestos (`hub-…`) con las
   filas existentes de `hcu_domains`, y upsert con revisión.
2. **Etiquetas de madurez** `core/active/alpha` de la semilla: el mapa
   `maturityLabels` de `tamv-project-explorer.tsx` no las contempla y hace
   fallback al texto crudo. Decidir si se mapean o se dejan literales.
3. **Enlace de `/hcu` al documento de reconciliación**: apunta a la rama
   `unify/hub-tamv-v9`; tras el merge a `main` debe actualizarse a `main`.
4. **`app/comunidad/page.tsx`** no tiene soporte `?lang=` (página estática
   en ES); su nueva sección muestra ambos idiomas en lugar de conmutar.
5. **Revisión humana del diff** antes de cualquier push (pendiente del
   usuario). Sin push realizado.
6. **Verificación visual en navegador**: no realizada en este entorno
   (la auditoría previa ya señaló que Chromium bloquea el esquema local).

## Mejoras integradas desde Drive (23 nov 2026)

Fuente: análisis `~/workspace/your_files/arquitectura-tamv-drive/ANALISIS-ARQUITECTURA-TAMV.md`
(20 Google Docs leídos íntegros, ~42.300 palabras) más las 2 hojas de Google
Sheets leídas el 23 nov 2026 tras conectar Sheets. Regla aplicada en todo:
afirmado por un documento / declarado como objetivo / no verificado.

### Qué se integró y dónde

1. **Federaciones** — `docs/architecture/federation-reconciliation.md`
   (nuevo): el mapa del repo (sus 7 áreas de referencia) es el canónico; los
   6 mapas de Drive (Manifiesto §II; Manual Maestro §3; Informe YUN §2;
   OSF §I.2; ROOT CANON §3; Soberanía TAMV §8.3) quedan transcritos como
   variantes históricas, sin mezclar mapas en una misma vista. Nota visible
   en la sección de arquitectura de la home (ES y EN) con enlace al
   documento. Nota: el encabezado de §2.3 del análisis dice "cinco mapas"
   pero enumera seis; se registraron seis.
2. **`/isabella`** — `app/isabella/page.tsx` (nueva, 312 líneas, molde
   `TamvAppShell` + `PageIntro` + bilingüe): ficha Genesis v4.3.3 con la
   madurez honesta (54% global, 46,2% ponderado, 62% preparación de
   despliegue, `production_safe: false`, CI caída por facturación issue
   #66, GHCR bloqueado, migración `20260926030000` pendiente); pipeline
   FGAIS de 7 etapas, red pentagonal de 5 nodos, Policy Gate de doble capa
   con monotonía estricta, ledger `isabella_decisions` SHA3-512, memoria
   de 5 niveles. Enlazada desde home, `/proyectos`, `/desarrolladores` y
   el sitemap.
3. **TINA** — sección en `/isabella` con la definición EXACTA del caso de
   estudio ("Trusted Intelligence, Native & Adaptive"), fórmula de 6
   eslabones, ciclo de 9 etapas no puenteables, 20 subsistemas, 7 estados
   de verificación, 11 áreas de deuda técnica y estado "Prototipo, no
   certificado para producción". Es la única fuente que la define.
4. **CROWN** — en `/isabella` como Policy Decision Point / Policy-as-Code,
   con su única expansión documentada ("Constitution of the Reality
   Ontological Web Native"), sin descomponerla por letras; tensión anotada
   entre la fórmula de 5 vectores y la ecuación de legitimidad de 8
   factores.
5. **BookPI** — en `/isabella`, fórmula `Dₙ = SHA3-512(Blockₙ + Dₙ₋₁)` con
   la cautela de que "inmutable" es objetivo arquitectónico; enlace en
   texto con la cadena `proposal_events` del repo. La descripción de la
   semilla ("marcas de tiempo inmutables") se corrigió a lenguaje de
   objetivo.
6. **Hyper Core Turbo Ω-X3** — en `/isabella`, objetivos 3.0× y 900→300 ms
   etiquetados explícitamente como OBJETIVOS A VALIDAR, con la cita del
   documento. "Isabella VΩ" anotada como no definida; CTH/ISK y "Trinidad
   vLLM" anotados como no documentados en el corpus de Drive.
7. **Gobernanza** — `app/gobernanza/page.tsx` (+43): formulación canónica
   de 6 dimensiones de separación; 5 axiomas, 7 leyes, 8 principios y
   doctrina de 4 principios como variantes; sección "Brechas conocidas"
   (Bus Factor = 1, punto único de fallo, sucesión obligatoria, y las 5
   brechas de la auditoría de terceros con severidad); EOCT con 3
   definiciones y TIME-UP con 2, sin elegir una; sección "Hitos declarados
   por los documentos" (CITIS 2026 Guayaquil; invitación Frontiers, límites
   28 feb 2027 / 31 may 2027; research-box v0.6.0; Hermes Verify tras 89
   pruebas; caso Google 26897541239, junio 2026).
8. **Método 4L** — sección en `app/excelencia/page.tsx` (+23): L1–L4 con
   identificadores (DOI Zenodo 10.5281/zenodo.19411506; Figshare
   10.6084/M9.FIGSHARE.32098846; Frontier ID 3117809), sin afirmaciones de
   validez legal ni de violación de tratados OMPI/WIPO (presentadas solo
   como declaraciones del documento).
9. **Fichas de proyecto** — `data/seed/hub-content.json` (11 → 27
   proyectos): las 11 fichas corregidas (MD-X5 como proyección 2026–2027;
   TAMV OS / Play & Go / Xclusive etiquetados "sin documentación en el
   corpus de Drive; contenido del hub"; UTAMV como Academia y Red de
   Ciencia Abierta con el matiz no formal del Documento Canónico §7.3;
   RDM con activación declarada 30-07-2026 y descarte de `apps/rdm-hub`;
   Atlas con la nota de nombre; LITLE reescrita como solo mención, sin
   ficha de certificación inventada). **Creator Intelligence corregida
   con la hoja de Sheets**: 4 skills públicas v3
   (`UNSIGNED_RELEASE_PENDING`), 37 contratos internos como declaración
   de la hoja, fuente GitHub `AnubisVillasenor1/tamv-creator-intelligence`,
   NIST CSF 2.0, kernel TAMV Genesis, sello SHA-256 + Ed25519; sección
   bilingüe añadida en `app/auditoria-creator/page.tsx`. **16 módulos
   nuevos de la hoja "Especificaciones Técnicas y Financieras"**
   (Phoenix Protocol, Synapse AI, Oracle Sentinel Economy, Anubis
   Sentinel, Dekateotl System, Nubiwallet, DreamSpaces, MSR Ledger, Echo
   Chamber AI, AuraBid, Chrysalis AI, Synergy Guard AI, Ember Stream,
   OmniSentinel AI, Kaos Audio 3D / Kaos Engine, IsabellaCore/KEC) como
   registros `unverified`, "según la hoja de especificaciones, sin
   documentación adicional". Alamexa no se añadió (no está en la hoja).
10. **Correcciones de datos** — P0 FIXED correcto 35/134 = 26,1% (no 44);
    DOI 10.5281/zenodo.19436662 con su triple atribución anotada donde se
    cita (home ES/EN, `/hcu`, `/utamv` campo "Registros DOI de base");
    EOCT (3 definiciones) y TIME-UP (2 definiciones) anotados en
    gobernanza; cautela Enterprise sin la palabra "verificables"; monedas
    phygital anotadas (OSF menciona un "vector de 8 tokens funcionales"
    sin enumerarlos; los 8 nombres provienen del Documento Magno del hub).

### Qué se corrigió del portado anterior

- BookPI: "marcas de tiempo inmutables" como propiedad → objetivo
  arquitectónico.
- LITLE: ficha de estándar de certificación con 9 dimensiones (inventada)
  → solo mención por nombre, sin definición.
- MD-X5: presentado como línea de evolución existente → proyección
  2026–2027.
- TAMV OS: "su alcance operativo se verifica en los depósitos enlazados"
  → sin documentación en el corpus de Drive.
- Creator Intelligence / Play & Go / Xclusive: "ficha resumida desde la
  documentación pública del ecosistema" → etiqueta explícita de falta de
  documentación en Drive (Creator Intelligence luego corregida con la hoja
  de Sheets, ver punto 9).
- Auditoría de solo lectura de contenido prohibido (§7.2) sobre
  `app/`, `components/`, `data/` y `docs/`: **cero restos** de CTH/ISK,
  Trinidad, VΩ, TRL 6.5–7, 94/100, "Green Light", "VERIFICADO (A)",
  valuación $25M, inversión $2.5M, proyecciones de usuarios, repartos
  75/25, 75/20/5, 70/20/10, horas de trabajo como métrica precisa, precios
  Premium o pasarelas. Sin menciones de Elysium / OnlyFans en lo portado.

### Qué NO se portó de las hojas de Sheets

- **Algoritmos inferidos**: la columna "Algoritmo o Lógica (Inferido)" de
  los 20 módulos no se portó en ningún registro; solo consta en límites
  que existe en la hoja como inferida.
- **Cifras económicas**: FairSplit 70%, "Inversión Ética AAA",
  monetización de certificados, rango $2–$99 USD de Chrysalis AI y demás
  impactos económicos no se portaron como cifras.
- **Fuentes `.docx`/`.txt`**: citadas por nombre como fuentes de la hoja,
  no como documentos leídos (ninguno fue leído).

### Pendientes actualizados (23 nov 2026)

- **Sheets: ambas hojas leídas.** Quedan sin leer del Anexo A.2 del
  análisis: 3 Google Docs ("Manual Técnico Maestro Integral", "TAMV -
  Documento Oficial: El Regalo del Alma", variante LATAM de "Arquitectura
  Cognitiva Programable"), la tesis `.md` "Tesis Doctoral y Caso de
  Estudio - Gobernanza TAMV.md" y los espejos de repositorios (restricción
  de seguridad de ejecución).
- Enlace de la home al doc de reconciliación de federaciones apunta a la
  rama `unify/hub-tamv-v9`; tras el merge debe apuntar a `main`.
- La madurez `alpha` de los 16 módulos nuevos de la hoja de
  especificaciones es una convención conservadora del agente, no un dato
  de la hoja; queda anotada en sus límites.
- Residuos terminológicos "inmutable" en `/utamv`:72 (criterio TQAF-10
  n.º 10) y :175 (§0): son transcripción literal del Documento Maestro
  v3.0 del hub, con matices ya presentes en §9.4; pendiente decidir si se
  renombran o se dejan como transcripción.
- Verificación visual en navegador de `/isabella` y de las nuevas
  secciones: no realizada en este entorno.

## Comandos de verificación

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
```

### Resultados (2026-11-23, en la rama `unify/hub-tamv-v9`)

- `pnpm install --frozen-lockfile` — **OK** (ejecutado con
  `npx -y pnpm@12.3.4`, pues `pnpm` no estaba en el PATH; 42,4 s).
- `pnpm test` — **29 pass, 2 fail; los 2 fallos son preexistentes en `main`**
  (verificados en un worktree limpio de `92d7d88` con idénticos resultados,
  2 pass/1 fail y 4 pass/1 fail respectivamente). El portado introduce
  **cero fallos nuevos**:
  - `tests/hcu-observatory-contract.test.mjs`: 4 pass / 1 fail — el test
    espera `/function projectWorld/` pero el canvas define
    `const projectWorld = (...) => {`.
  - `tests/developer-adoption-contract.test.mjs`: 2 pass / 1 fail — el test
    espera que `app/desarrolladores/page.tsx` contenga la ruta `/proyectos`;
    en `main` tampoco la contiene (nuestro diff solo añadió 3 líneas).
  - Resto: `db-pool-config` 3/0, `health` 7/0,
    `institutional-support-and-design` 5/0, `public-api-openapi` 2/0,
    `security-validation` 6/0.
- `pnpm typecheck` — **OK tras reparar los 3 defectos preexistentes**
  descritos arriba (antes de la reparación: 1 error en la ruta de salud;
  tras ella, 2 errores en componentes HCU; tras repararlos, 0 errores).
  El generador de la ficha de auditoría (Ed25519, señalado como riesgo en
  la Fase 1) compila sin errores.
- `pnpm build` — **OK** (`next build`, compilado en 7,6 s). Rutas nuevas
  presentes en el manifiesto: `/auditoria-creator`, `/cuenta`,
  `/excelencia`, `/unete`, `/utamv`.

### No verificado (declarado explícitamente)

- **Sin `DATABASE_URL` no se puede verificar** la conexión a la base de
  datos, la aplicación de las semillas (`hub-content.json`,
  `hcu-graph.json`) ni las rutas que leen la DB (`/`, `/proyectos`, `/hcu`,
  `/investigacion`). El build compila esas rutas, pero no las ejecuta
  contra una DB real.
- **Verificación visual en navegador**: no realizada en este entorno.

### Resultados de la fase 2 — Mejoras desde Drive (2026-11-23)

Verificación ejecutada por el coordinador tras integrar los 5 bloques
(federaciones, Isabella/TINA, gobernanza, fichas, Sheets):

- `pnpm install --frozen-lockfile` — **OK** (lockfile al día; ejecutado
  con `npx -y pnpm@12.3.4`).
- `pnpm test` — **29 pass, 2 fail; los 2 fallos son los mismos
  preexistentes de `main`** (verificados idénticos en la fase 1):
  `developer-adoption-contract` (espera `/proyectos` en la página de
  desarrolladores) y `hcu-observatory-contract` (espera
  `/function projectWorld/`). Cero fallos nuevos.
- `pnpm typecheck` — **OK** (0 errores).
- `pnpm build` — **OK** (compilado en 24,7 s). Rutas nuevas presentes en
  el manifiesto: `/auditoria-creator`, `/cuenta`, `/excelencia`,
  `/isabella`, `/unete`, `/utamv`.

Estado final de la rama: 12 archivos modificados (717 inserciones, 8
eliminaciones) y rutas nuevas sin seguimiento (`app/isabella/`,
`docs/architecture/federation-reconciliation.md` y las de la fase 1).
Sin commit, sin push; la rama remota sigue en `92d7d88`.

### Rebase sobre el nuevo `main` y reparación del PR #22 (2026-11-23)

El usuario autorizó llevar el trabajo a `main`. Antes de fusionar, el
`main` remoto había avanzado a `e77ced2` (Merge PR #22, "Build TAMV
research and Isabella features", 23 nov 2026 11:40 CST). La rama se
rebasó sobre ese `main` (`92d7d88` es ancestro, sin divergencia de
historia). El rebase dejó **un solo conflicto**,
`components/tamv-institutional-site.tsx` (bloque de imports: el nuevo
`main` añade `TamvSiteGuide`; el portado añade los imports de datos
Enterprise/fundador/legado): resuelto conservando ambos lados.
`app/globals.css` y `app/hcu/page.tsx` se fusionaron automáticamente.

El nuevo `main` venía roto en verificación, por defecto del PR #22
(no del portado), y se reparó en la rama antes de fusionar:

1. **Dependencias declaradas que faltaban en `package.json`.** El
   código del PR #22 importa `ai`, `@ai-sdk/react` y
   `@shadcn/react/message-scroller`, pero `package.json` en `e77ced2`
   no los declaraba (el `pnpm-lock.yaml` de ese commit sí contenía
   `@ai-sdk/react`, inconsistente con el manifiesto). Se añadieron
   `ai@^7.0.179`, `@ai-sdk/react@^4.0.183` (versiones del lockfile
   original) y `@shadcn/react@^0.3.1` (existe en npm; el submódulo
   `message-scroller` resuelve). `pnpm install` regeneró el lockfile.
2. **`components/hcu/hcu-simulator.tsx` con estado eliminado.**
   El PR #22 pasó el simulador a un solo choque pero dejó referencias
   al estado `shocks`/`setShocks` eliminado (11 errores TS). Se
   eliminaron las funciones muertas `updateShock`, `updateStartYear`,
   `updateEndYear` y el cuerpo del `fetch` ahora deriva el choque
   único del formulario (`shockAtomId`, `shockYear`, `intensity`).
3. **Los 2 fallos de test preexistentes se corrigieron.**
   `developer-adoption-contract` esperaba `/proyectos` en
   `/desarrolladores`: se añadió un enlace real al catálogo público
   de proyectos en la tarjeta "02 / DATA". `hcu-observatory-contract`
   esperaba `function projectWorld` y `function drawOrbit`:
   `projectWorld` y `drawOrbit` pasaron de arrow function a
   declaración de función (con guarda `if (!ctx) return` en
   `drawOrbit`, necesaria porque la declaración pierde el narrowing
   de `ctx` no nulo).

Enlaces a los documentos de reconciliación actualizados de la rama a
`main` (`blob/main/docs/architecture/...`) en `/hcu` y en la home
(ES/EN), ya que tras el merge esos documentos viven en `main`.

Verificación final sobre la rama rebasada y reparada:

- `pnpm typecheck` — **OK** (0 errores; antes del rebase el nuevo
  `main` daba 23 errores).
- `pnpm test` — **36 pass, 0 fail** (antes: 29 pass, 2 fail
  preexistentes; el PR #22 añadió 5 tests nuevos que ahora pasan).
- `pnpm build` — **OK**. Rutas en el manifiesto: las 6 nuevas del
  portado (`/auditoria-creator`, `/cuenta`, `/excelencia`,
  `/isabella`, `/unete`, `/utamv`) más `/arquitectura` del PR #22.

Pendiente sin verificar (igual que en las fases 1 y 2): conexión a la
DB y aplicación de semillas (sin `DATABASE_URL`); verificación visual
en navegador.
