# Investigación de respaldo editorial y técnico — TAMV Online Network

**Versión:** 1.0 · **Fecha:** 2026-11-25  
**Repositorio:** [desarrollo-tamv-online-network](https://github.com/OsoPanda1/desarrollo-tamv-online-network)  
**Rama de trabajo:** `feat/research-evidence-media-atlas-v1`

> **Alcance y honestidad editorial.** Este documento organiza estándares primarios, documentación técnica oficial y literatura académica ya localizada para fundamentar las secciones públicas del sitio. No equivale a una revisión sistemática concluida ni a una certificación de TAMV. Las búsquedas académicas de Undermind se encuentran en ejecución; los resultados se incorporarán con DOI y metadatos comprobados cuando terminen. No deben publicarse como hechos probados las aspiraciones, las relaciones conceptuales del atlas ni las funciones aún no desplegadas.

## 1. Modelo de evidencia editorial

Cada afirmación pública debe etiquetarse internamente como una de estas clases:

- **Estándar/documentación primaria:** una especificación o guía oficial define un formato o práctica.
- **Resultado de investigación:** un estudio aporta hallazgos con contexto, método y limitaciones.
- **Hecho de proyecto:** puede demostrarse con código, commit, prueba, release, registro persistente o despliegue observado.
- **Declaración del proyecto:** intención, visión, política o descripción propia; no es verificación externa.
- **Propuesta/roadmap:** trabajo futuro, no una capacidad disponible.
- **Evaluación de tercero:** solo se declara si existe un resultado publicado o una comunicación verificable del evaluador.

No utilizar una cita a un estándar para sugerir que TAMV ya cumple ese estándar. Una cita respalda la recomendación o el concepto, no el cumplimiento del producto.

## 2. Matriz de investigación por sección del sitio

### 2.1 Orígenes, identidad y autoría

**Secciones:** `/origenes`, `/quienes-somos`, pie institucional y perfil público.

**Base documental:** los identificadores persistentes permiten enlazar registros de personas, organizaciones y productos, pero no sustituyen una comprobación de identidad jurídica ni una auditoría de autoría. ORCID identifica perfiles de investigadores; ROR identifica organizaciones de investigación; DataCite y Crossref mantienen infraestructura de metadatos/DOI.

**Aplicación:** distinguir autoría declarada, identidad de perfil, contribución documentada y entidad legal constituida. Mostrar el vínculo entre persona, obra, versión, licencia y registro persistente; si falta corroboración, usar “declarado por el proyecto” o “registro enlazado”, no “certificado”.

Fuentes: [R1], [R2], [R3], [R4].

### 2.2 Investigación abierta, publicaciones y fuentes

**Secciones:** `/investigacion`, `/fuentes`, `/investigadores`, fichas de publicaciones y catálogo de proyectos.

**Base documental:** los principios FAIR orientan que los datos sean encontrables, accesibles, interoperables y reutilizables; TRUST describe propiedades relevantes para repositorios digitales confiables; CARE recuerda que la apertura debe coexistir con beneficio colectivo, autoridad para controlar, responsabilidad y ética, especialmente con datos indígenas/comunitarios.

**Aplicación:** cada ficha de investigación debe exponer título, autoría, fecha, versión, idioma, tipo de recurso, licencia, identificador persistente, DOI/URL, fuentes, método, limitaciones y fecha de revisión. No confundir que un artículo esté indexado con calidad metodológica o aceptación por pares. Mantener metadatos originales y traducciones etiquetadas por idioma.

Fuentes: [R5], [R6], [R7], [R8], [R9].

### 2.3 Procedencia, recibos y verificación TPVA

**Secciones:** `/auditoria-creator`, verificador de evidencia y documentación de procedencia.

**Base documental:** W3C PROV permite describir entidades, actividades y agentes implicados en la producción de un recurso. RO-Crate empaqueta datos, software y contexto de investigación con metadatos. SLSA define procedencia de build verificable. W3C Verifiable Credentials define un modelo de afirmaciones emitidas, presentadas y verificadas, con consideraciones de seguridad y privacidad.

**Aplicación:** registrar commit exacto, artefacto, digest, builder, workflow, herramientas/versiones, checks, evidencia, clave pública y estado de revocación. Verificar desde el lado del consumidor, no confiar en un badge enviado por el navegador. La integridad criptográfica demuestra que los datos comprobados no han cambiado respecto a la huella/firma; no demuestra por sí sola que el software sea seguro, que el contenido sea verdadero ni que un tercero lo haya aprobado.

Fuentes: [R10], [R11], [R12], [R13].

### 2.4 Seguridad de software y evaluación externa

**Secciones:** `/desarrolladores`, dossier de seguridad, registro de evidencias y página de revisión externa.

**Base documental:** OWASP API Security Top 10 ayuda a estructurar riesgos de autorización, autenticación, consumo de recursos, SSRF y configuración. OpenSSF Scorecard automatiza señales de seguridad de repositorios. OpenSSF Best Practices Badge es una autoevaluación pública de prácticas, no una auditoría independiente. Los requisitos de SLSA dependen de evidencia concreta del pipeline y del nivel pretendido.

**Aplicación:** presentar resultados fechados, versión/commit evaluado, alcance, hallazgos, excepciones y remediaciones. Separar claramente score automatizado, autoevaluación, pentest, auditoría profesional y certificación de un tercero. Nunca afirmar “certificado” porque una acción de CI pasa o se muestra un hash.

Fuentes: [R12], [R14], [R15], [R16], [R17].

### 2.5 Federación, API y ecosistema

**Secciones:** `/ecosistema`, `/ecosistema/metadata`, `/desarrolladores` y documentación de contratos.

**Base documental:** los contratos versionados reducen ambigüedad entre productores y consumidores; W3C PROV aporta un vocabulario para describir origen y transformación; las credenciales verificables definen roles de emisor, titular y verificador. OWASP advierte que las API deben controlar acceso a objetos, autenticación, propiedades, recursos y solicitudes salientes.

**Aplicación:** publicar OpenAPI versionado, ejemplos de éxito/error, límites de paginación, autenticación, rate limit, timeouts, política de deprecación y propiedad de los datos. Los repositorios listados en un catálogo son descubribles; no por ello comparten sesión, base de datos, permisos, estado de salud ni sincronización.

Fuentes: [R10], [R13], [R14], [R18].

### 2.6 Gobernanza comunitaria y soberanía digital

**Secciones:** gobernanza, institucionalización, membresías, apoyo, comunidad y políticas de datos.

**Base documental:** la investigación sobre gobernanza de bienes comunes y cooperativismo de plataformas destaca reglas explícitas, participación, responsabilidad y sostenibilidad; CARE orienta el gobierno responsable de datos comunitarios. La evidencia sobre escalabilidad y sostenibilidad depende del contexto y no autoriza extrapolaciones automáticas.

**Aplicación:** publicar una matriz de decisiones, autoridad y apelación; explicar qué se financia con aportaciones; separar objetivos de futura constitución legal de un estado jurídico actual; definir derechos de contribuyentes, licencias, salida y eliminación de datos cuando proceda. Medir participación y mantenimiento, no solo visitas o registros.

Fuentes: [R7], [R8], [R19], [R20].

### 2.7 Inteligencia artificial responsable e Isabella

**Secciones:** Isabella/IA, guía, automatización, enrutamiento de intención y gobernanza.

**Base documental:** NIST AI RMF 1.0 propone gestionar riesgos a través de GOVERN, MAP, MEASURE y MANAGE. Es un marco de gestión de riesgos, no una certificación de conformidad ni prueba de que un sistema es seguro.

**Aplicación:** documentar propósito, límites, datos de entrada/salida, supervisión humana, evaluación, incidentes, red teaming y riesgos conocidos. Etiquetar respuestas generadas y separar automatización de decisiones de autoridad. No presentar un agente como autónomo o productivo sin evidencia de deployment y controles operativos.

Fuentes: [R21], [R22].

### 2.8 Atlas HCU, territorio y memoria cultural

**Secciones:** `/hcu`, `/atlas`, `/portal/hcu`, memoria territorial y RDM Digital.

**Base documental:** la procedencia de datos, el contexto y las limitaciones deben acompañar visualizaciones y análisis. La guía de accesibilidad requiere alternativas comprensibles para contenido visual y controles operables. En el observatorio HCU, las coordenadas de visualización, las métricas derivadas y los umbrales son convenciones descriptivas, no predicciones causales ni validación científica.

**Aplicación:** cada nodo y relación debe mostrar origen, fecha, método, estado de evidencia, versión del corpus y limitaciones. Mantener una vista alternativa textual/2D, soporte de teclado y reducción de movimiento. No etiquetar una visualización territorial como certificación municipal ni como gemelo digital sincronizado si la sincronización no está demostrada.

Fuentes: [R10], [R23], [R24].

### 2.9 Diseño accesible, imágenes y videos

**Secciones:** portada, historias de origen, proyectos, atlas visual, tutoriales y archivo audiovisual.

**Base documental:** WCAG 2.2 contiene criterios de accesibilidad para contraste, ampliación de texto, teclado, foco y alternativas. Las imágenes informativas requieren texto alternativo equivalente; las imágenes decorativas se implementan para que tecnologías de asistencia las omitan. Los videos con información hablada deben incluir subtítulos sincronizados; cuando el contenido visual aporta información no presente en audio, se requiere una alternativa apropiada, como audiodescripción o descripción textual.

**Aplicación:** crear 20 slots de imagen y 12 de video con propósito editorial, proporción, alt/caption, derechos/licencia, crédito, idioma y estado. No llenar espacios con imágenes de stock sin permiso ni con URLs inventadas. Videos pendientes deben verse como placeholders, no como reproductores rotos. Implementar carga diferida para medios fuera de pantalla, dimensiones reservadas para evitar CLS, transcripciones y preferencia de movimiento reducido. Revisar contraste y funcionamiento con teclado en cada breakpoint.

Fuentes: [R23], [R24], [R25], [R26].

### 2.10 Membresías, apoyo y transparencia financiera

**Secciones:** `/membresias`, `/apoyar`, `/institucionalizacion`.

**Base documental:** la gobernanza y sostenibilidad de infraestructura abierta requieren explicar los costes recurrentes, el mantenimiento y las obligaciones de quienes participan. Los principios FAIR/TRUST no garantizan sostenibilidad financiera por sí mismos.

**Aplicación:** publicar precio, periodicidad, beneficios actuales, beneficios futuros, condiciones de cancelación, tratamiento de datos y destino declarado de fondos. No presentar una contribución como donativo deducible ni como inversión regulada sin base jurídica verificable. Si asientos empresariales aún no están implementados, no prometer administración de equipos.

Fuentes: [R6], [R19], [R20].

## 3. Registro de fuentes primarias

Las referencias siguientes son documentos técnicos primarios o páginas oficiales. Se enlazan para que la persona lectora pueda verificar versión, estado y alcance.

- **[R1] ORCID — About ORCID.** Identificador persistente para investigadores. https://orcid.org/about
- **[R2] Research Organization Registry (ROR).** Identificadores abiertos para organizaciones de investigación. https://ror.org/
- **[R3] DataCite — DOI basics / documentation.** Identificación persistente de productos de investigación. https://datacite.org/
- **[R4] Crossref — Metadata and REST API.** Infraestructura de metadatos bibliográficos. https://www.crossref.org/documentation/retrieve-metadata/rest-api/
- **[R5] Wilkinson et al. (2016), The FAIR Guiding Principles for scientific data management and stewardship. Scientific Data 3, 160018. DOI: https://doi.org/10.1038/sdata.2016.18
- **[R6] Lin et al. (2020), The TRUST Principles for digital repositories. Scientific Data 7, 144. DOI: https://doi.org/10.1038/s41597-020-0486-7
- **[R7] Carroll et al. (2020), The CARE Principles for Indigenous Data Governance. Data Science Journal 19(1). DOI: https://doi.org/10.5334/dsj-2020-043
- **[R8] GO FAIR — FAIR Principles.** https://www.go-fair.org/fair-principles/
- **[R9] UNESCO — Recommendation on Open Science (2021).** https://unesdoc.unesco.org/ark:/48223/pf0000379949
- **[R10] W3C — PROV Overview.** Modelo y familia de especificaciones de procedencia. https://www.w3.org/TR/prov-overview/
- **[R11] RO-Crate — Specification.** Paquetes de datos y contexto de investigación. https://www.researchobject.org/ro-crate/
- **[R12] SLSA — Provenance.** Procedencia verificable de artefactos de software; usar la versión vigente indicada por el proyecto. https://slsa.dev/spec/
- **[R13] W3C — Verifiable Credentials Data Model v2.0 (Recommendation, 2025-05-15).** https://www.w3.org/TR/vc-data-model/
- **[R14] OWASP — API Security Top 10 (2023).** https://owasp.org/API-Security/
- **[R15] OpenSSF — Scorecard.** Evaluación automatizada de señales de seguridad en repositorios. https://scorecard.dev/
- **[R16] OpenSSF — Best Practices Badge.** Autoevaluación pública de buenas prácticas. https://www.bestpractices.dev/
- **[R17] OpenSSF — Security Assessments Guide.** https://security-assessments.openssf.org/
- **[R18] OpenAPI Initiative — Specification.** Contrato legible por máquinas para APIs HTTP. https://spec.openapis.org/oas/latest.html
- **[R19] Scholz, T. & Schneider, N. (eds.) — Ours to Hack and to Own: The Rise of Platform Cooperativism (2016).** Versión editorial y contexto: https://www.orbooks.com/catalog/ours-to-hack-and-to-own/
- **[R20] Platform Cooperativism Consortium.** Recursos y casos sobre cooperativismo de plataformas. https://platform.coop/
- **[R21] NIST — AI Risk Management Framework (AI RMF 1.0, 2023).** https://doi.org/10.6028/NIST.AI.100-1
- **[R22] NIST — AI RMF Playbook.** https://airc.nist.gov/AI_RMF_Knowledge_Base/Playbook
- **[R23] W3C — Web Content Accessibility Guidelines (WCAG) 2.2.** https://www.w3.org/TR/WCAG22/
- **[R24] W3C WAI — Images Tutorial.** https://www.w3.org/WAI/tutorials/images/
- **[R25] W3C WAI — Audio and Video Media.** https://www.w3.org/WAI/media/av/
- **[R26] web.dev — Optimize CLS / lazy loading images and video.** https://web.dev/articles/optimize-cls · https://web.dev/articles/browser-level-image-lazy-loading

## 4. Reglas de cita y mantenimiento

1. Citar la fuente junto a la afirmación que respalda; no relegar todas las referencias al pie.
2. Preferir DOI/URL canónica y conservar fecha de consulta en fuentes que cambian.
3. No usar citas secundarias para atribuir una afirmación al documento primario.
4. Para resultados académicos de Undermind, confirmar título, autoría, año, DOI y alcance del estudio antes de incorporarlos.
5. Registrar fecha de revisión de cada página y asignar un responsable editorial.
6. Si una fuente contradice una afirmación institucional, corregir la afirmación; no elegir solo la evidencia favorable.
7. Las referencias a seguridad, privacidad, derecho o salud deben indicar jurisdicción y límites; el contenido del sitio no sustituye asesoría profesional.
8. Auditar enlaces rotos, licencias de imágenes/video, accesibilidad y claims de certificación antes de publicar.

## 5. Estado de investigación

- **Localizado:** estándares oficiales W3C, SLSA, OWASP, OpenSSF, NIST, FAIR/TRUST/CARE y documentación de identificadores persistentes.
- **Disponible en Undermind:** cinco revisiones temáticas existentes sobre gobernanza comunitaria, infraestructura científica abierta, federación, IA confiable y arquitecturas soberanas.
- **En curso:** revisión ampliada por secciones del sitio, accesibilidad multimedia y procedencia de software.
- **Pendiente de validación:** lectura a texto completo de estudios seleccionados, verificación final de DOI/metadatos, pruebas de cada URL y revisión editorial por especialista.
- **No afirmado:** certificación de terceros, cumplimiento integral, impacto social demostrado o disponibilidad de funciones que no tengan evidencia operativa.
