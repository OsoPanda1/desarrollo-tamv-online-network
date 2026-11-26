"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ExternalLink, Network } from "lucide-react"
import type { Locale } from "@/lib/i18n"
import styles from "./tamv-mind-map.module.css"

type MindMapId = "governance" | "research" | "isabella" | "federation"
type Source = { label: string; href: string }
type MapItem = { titleEs: string; titleEn: string; detailEs: string; detailEn: string; sources: Source[] }
type MapBranch = { id: string; titleEs: string; titleEn: string; detailEs: string; detailEn: string; items: MapItem[] }
type MindMapDefinition = { number: string; titleEs: string; titleEn: string; introEs: string; introEn: string; rootEs: string; rootEn: string; rootDetailEs: string; rootDetailEn: string; noteEs: string; noteEn: string; reviewedEs: string; reviewedEn: string; branches: MapBranch[] }

const maps: Record<MindMapId, MindMapDefinition> = {
  governance: {
    number: "01",
    titleEs: "Gobernanza global y regional de la inteligencia artificial",
    titleEn: "Global and regional AI governance",
    introEs: "Un mapa para distinguir regulación vinculante, autoridad supervisora y marcos de orientación. Las fechas y competencias deben comprobarse en la fuente primaria antes de tomar decisiones.",
    introEn: "A map for distinguishing binding regulation, supervisory authorities and guidance frameworks. Dates and responsibilities must be checked against primary sources before decisions are made.",
    rootEs: "Gobernanza de IA",
    rootEn: "AI governance",
    rootDetailEs: "Normas · autoridades · estándares",
    rootDetailEn: "Rules · authorities · standards",
    noteEs: "Mapa orientativo, no asesoría jurídica. Revisión de fuentes: 25 de noviembre de 2026. La normativa cambia y puede tener aplicación escalonada.",
    noteEn: "Orientation only, not legal advice. Sources reviewed: 25 November 2026. Regulations change and may apply in phases.",
    reviewedEs: "Fuentes oficiales y fechas de aplicación",
    reviewedEn: "Official sources and application dates",
    branches: [
      {
        id: "eu", titleEs: "Reglamento de la Unión Europea", titleEn: "European Union AI Act",
        detailEs: "Regulación vinculante con obligaciones según tipo de sistema, uso y calendario aplicable.", detailEn: "Binding regulation with obligations depending on system type, use and applicable timeline.",
        items: [
          { titleEs: "Reglamento (UE) 2024/1689", titleEn: "Regulation (EU) 2024/1689", detailEs: "Texto jurídico y modificaciones vigentes: consultar la versión consolidada oficial.", detailEn: "Legal text and current amendments: consult the official consolidated version.", sources: [{ label: "EUR-Lex · Reglamento", href: "https://eur-lex.europa.eu/eli/reg/2024/1689/2026-07-27/eng" }] },
          { titleEs: "Aplicación escalonada", titleEn: "Phased application", detailEs: "La mayoría de las reglas comienzan a aplicarse desde el 2 de agosto de 2026; ciertos deberes de alto riesgo tienen plazos posteriores.", detailEn: "Most rules begin applying on 2 August 2026; some high-risk obligations have later dates.", sources: [{ label: "Comisión Europea · calendario", href: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act" }] },
        ],
      },
      {
        id: "spain", titleEs: "Modelo español y la AESIA", titleEn: "Spanish model and AESIA",
        detailEs: "Supervisión, asesoramiento, sensibilización y funciones de inspección dentro de sus competencias legales.", detailEn: "Supervision, advice, awareness and inspection functions within its legal remit.",
        items: [
          { titleEs: "Funciones institucionales", titleEn: "Institutional responsibilities", detailEs: "La AESIA describe sus funciones en relación con la normativa nacional y europea; la atribución concreta debe leerse en su base jurídica.", detailEn: "AESIA describes its role in relation to national and European rules; specific powers must be read in their legal basis.", sources: [{ label: "AESIA · información institucional", href: "https://aesia.digital.gob.es/storage/media/informacion-institucional.pdf" }] },
          { titleEs: "Supervisión no equivale a certificación universal", titleEn: "Supervision is not universal certification", detailEs: "La autoridad, el alcance del control y el régimen aplicable dependen del supuesto; no asumir una aprobación automática.", detailEn: "Authority, scope of control and applicable regime depend on the case; do not assume automatic approval.", sources: [{ label: "Comisión Europea · cumplimiento", href: "https://digital-strategy.ec.europa.eu/en/policies/enforcement-ai-act" }] },
        ],
      },
      {
        id: "latam", titleEs: "Marco normativo en América Latina", titleEn: "Latin American regulatory landscape",
        detailEs: "Las respuestas nacionales son distintas y evolucionan; comparar país por país y separar ley vigente, propuesta y política pública.", detailEn: "National approaches differ and evolve; compare country by country and distinguish enacted law, bill and public policy.",
        items: [
          { titleEs: "México: ficha de contexto", titleEn: "Mexico: country context", detailEs: "La ficha UNESCO recoge evaluación y recomendaciones; no sustituye la revisión de legislación mexicana vigente.", detailEn: "The UNESCO profile presents an assessment and recommendations; it does not replace review of current Mexican law.", sources: [{ label: "UNESCO · México", href: "https://www.unesco.org/ethics-ai/es/mexico" }] },
          { titleEs: "Comparación regional", titleEn: "Regional comparison", detailEs: "Registrar jurisdicción, fecha de consulta, tipo de instrumento y autoridad responsable en cada afirmación.", detailEn: "Record jurisdiction, review date, instrument type and responsible authority for each claim.", sources: [{ label: "UNESCO · Observatorio global", href: "https://www.unesco.org/ethics-ai/en" }] },
        ],
      },
      {
        id: "standards", titleEs: "Estándares y marcos internacionales", titleEn: "International standards and frameworks",
        detailEs: "Principios, guías y metodologías que orientan gobernanza; no todos son normas jurídicas obligatorias.", detailEn: "Principles, guidance and methods that inform governance; not all are binding law.",
        items: [
          { titleEs: "Ética de IA de UNESCO", titleEn: "UNESCO AI ethics", detailEs: "Derechos humanos, participación, supervisión, evaluación de impacto y rendición de cuentas.", detailEn: "Human rights, participation, oversight, impact assessment and accountability.", sources: [{ label: "UNESCO · Recomendación", href: "https://www.unesco.org/en/legal-affairs/recommendation-ethics-artificial-intelligence" }] },
          { titleEs: "OCDE y NIST", titleEn: "OECD and NIST", detailEs: "Usar principios y gestión del riesgo como estructuras de trabajo; documentar alcance y límites de cada marco.", detailEn: "Use principles and risk management as working structures; document the scope and limits of each framework.", sources: [{ label: "OCDE · Principios de IA", href: "https://oecd.ai/en/ai-principles" }, { label: "NIST · AI RMF", href: "https://www.nist.gov/itl/ai-risk-management-framework" }] },
        ],
      },
    ],
  },
  research: {
    number: "02",
    titleEs: "Investigación abierta, evidencia y memoria verificable",
    titleEn: "Open research, evidence and verifiable memory",
    introEs: "Cómo pasar de una idea o publicación a un registro descubrible, trazable y reutilizable sin confundir metadatos con calidad científica.",
    introEn: "How to move from an idea or publication to a discoverable, traceable and reusable record without confusing metadata with scientific quality.",
    rootEs: "Ciclo de evidencia",
    rootEn: "Evidence lifecycle",
    rootDetailEs: "Describir · vincular · preservar",
    rootDetailEn: "Describe · link · preserve",
    noteEs: "Un DOI, una ficha FAIR o un paquete de procedencia mejoran la identificación y revisión, pero no garantizan verdad, revisión por pares ni reproducibilidad.",
    noteEn: "A DOI, FAIR record or provenance package improves identification and review, but does not guarantee truth, peer review or reproducibility.",
    reviewedEs: "Referencias sobre datos abiertos y procedencia",
    reviewedEn: "Open-data and provenance references",
    branches: [
      {
        id: "fair", titleEs: "Datos FAIR", titleEn: "FAIR data",
        detailEs: "Localizables, accesibles bajo condiciones explícitas, interoperables y reutilizables.", detailEn: "Findable, accessible under explicit conditions, interoperable and reusable.",
        items: [
          { titleEs: "Metadatos descriptivos", titleEn: "Descriptive metadata", detailEs: "Definir identificadores, formatos, idiomas, licencias y condiciones de acceso.", detailEn: "Define identifiers, formats, languages, licences and access conditions.", sources: [{ label: "Principios FAIR · DOI", href: "https://doi.org/10.1038/sdata.2016.18" }] },
          { titleEs: "Custodia y gobernanza", titleEn: "Stewardship and governance", detailEs: "Aplicar principios TRUST para repositorios y CARE cuando importen derechos colectivos y soberanía de datos.", detailEn: "Apply TRUST for repositories and CARE where collective rights and data sovereignty matter.", sources: [{ label: "TRUST · DOI", href: "https://doi.org/10.1038/s41597-020-0486-7" }, { label: "CARE · DOI", href: "https://doi.org/10.5334/dsj-2020-043" }] },
        ],
      },
      {
        id: "pids", titleEs: "Identificadores persistentes", titleEn: "Persistent identifiers",
        detailEs: "Relacionar personas, organizaciones, obras, conjuntos de datos y versiones sin borrar la procedencia.", detailEn: "Connect people, organisations, works, datasets and versions without erasing provenance.",
        items: [
          { titleEs: "Personas y organizaciones", titleEn: "People and organisations", detailEs: "Usar ORCID para perfiles de autoría y ROR para organizaciones cuando corresponda.", detailEn: "Use ORCID for author identities and ROR for organisations where appropriate.", sources: [{ label: "ORCID", href: "https://orcid.org/" }, { label: "ROR", href: "https://ror.org/" }] },
          { titleEs: "Obras y versiones", titleEn: "Works and versions", detailEs: "Vincular DOI, versión, fecha, contribuciones y referencia de origen.", detailEn: "Link DOI, version, date, contributions and source reference.", sources: [{ label: "DataCite", href: "https://datacite.org/" }] },
        ],
      },
      {
        id: "prov", titleEs: "Procedencia y reproducibilidad", titleEn: "Provenance and reproducibility",
        detailEs: "Explicar quién generó un artefacto, mediante qué proceso y con qué relación respecto de sus fuentes.", detailEn: "Explain who generated an artefact, through which process and how it relates to its sources.",
        items: [
          { titleEs: "W3C PROV", titleEn: "W3C PROV", detailEs: "Modelar entidades, actividades y agentes, preservando relaciones de procedencia.", detailEn: "Model entities, activities and agents while preserving provenance relationships.", sources: [{ label: "W3C · PROV", href: "https://www.w3.org/TR/prov-overview/" }] },
          { titleEs: "RO-Crate", titleEn: "RO-Crate", detailEs: "Empaquetar datos, software, resultados y contexto descriptivo en una estructura reutilizable.", detailEn: "Package data, software, results and descriptive context in a reusable structure.", sources: [{ label: "Research Object · RO-Crate", href: "https://www.researchobject.org/ro-crate/" }] },
        ],
      },
      {
        id: "assessment", titleEs: "Calidad de evidencia y transparencia", titleEn: "Evidence quality and transparency",
        detailEs: "Publicar metodología, versión, límites y resultados; separar la integridad criptográfica de la validación sustantiva.", detailEn: "Publish method, version, limitations and results; separate cryptographic integrity from substantive validation.",
        items: [
          { titleEs: "Evaluación documentada", titleEn: "Documented assessment", detailEs: "Declarar criterios y método de evaluación; las métricas pueden discrepar y requieren interpretación.", detailEn: "Declare assessment criteria and method; metrics can diverge and require interpretation.", sources: [{ label: "FAIR assessment · DOI", href: "https://doi.org/10.5334/dsj-2024-033" }] },
          { titleEs: "Integridad de artefactos", titleEn: "Artifact integrity", detailEs: "Firmas y hashes ayudan a detectar cambios, pero no prueban que el contenido sea correcto o inocuo.", detailEn: "Signatures and hashes help detect changes, but do not prove content is correct or harmless.", sources: [{ label: "SLSA · provenance", href: "https://slsa.dev/spec/" }] },
        ],
      },
    ],
  },
  isabella: {
    number: "03",
    titleEs: "Isabella IA: seguridad, supervisión y uso responsable",
    titleEn: "Isabella AI: security, oversight and responsible use",
    introEs: "Una vista de los controles que deben rodear a un agente: la autoridad reside en políticas verificables y servicios, no únicamente en las instrucciones del modelo.",
    introEn: "A view of controls surrounding an agent: authority belongs in verifiable policies and services, not only in model instructions.",
    rootEs: "Ciclo seguro del agente",
    rootEn: "Secure agent lifecycle",
    rootDetailEs: "Entradas · herramientas · evaluación",
    rootDetailEn: "Inputs · tools · evaluation",
    noteEs: "Es un marco de diseño. No acredita que estos controles estén desplegados en Isabella; cada control requiere implementación, pruebas y evidencia de ejecución.",
    noteEn: "This is a design framework. It does not certify that these controls are deployed in Isabella; each control needs implementation, tests and execution evidence.",
    reviewedEs: "Fuentes de seguridad y gestión de riesgo",
    reviewedEn: "Security and risk-management sources",
    branches: [
      {
        id: "inputs", titleEs: "Entradas no confiables", titleEn: "Untrusted inputs",
        detailEs: "Tratar páginas web, archivos, resultados de búsqueda y mensajes externos como datos potencialmente hostiles.", detailEn: "Treat web pages, files, search results and external messages as potentially hostile data.",
        items: [
          { titleEs: "Inyección de prompts", titleEn: "Prompt injection", detailEs: "Separar instrucciones confiables de contenido recuperado; no depender únicamente del prompt para hacer cumplir la política.", detailEn: "Separate trusted instructions from retrieved content; do not rely on the prompt alone to enforce policy.", sources: [{ label: "OWASP · GenAI Security", href: "https://genai.owasp.org/llm-top-10/" }] },
          { titleEs: "Pruebas de ataque", titleEn: "Adversarial testing", detailEs: "Probar escenarios directos e indirectos, medir efectos no autorizados y documentar fallos conocidos.", detailEn: "Test direct and indirect scenarios, measure unauthorised effects and document known failures.", sources: [{ label: "AgentDojo · arXiv", href: "https://arxiv.org/abs/2406.13352" }] },
        ],
      },
      {
        id: "tools", titleEs: "Autorización de herramientas", titleEn: "Tool authorization",
        detailEs: "El servicio ejecutor debe validar cada llamada, argumento, alcance y permiso con denegación por defecto.", detailEn: "The execution service should validate every call, argument, scope and permission with default deny.",
        items: [
          { titleEs: "Mínimo privilegio", titleEn: "Least privilege", detailEs: "Limitar herramientas, credenciales y recursos a la tarea y duración necesarias.", detailEn: "Limit tools, credentials and resources to the required task and duration.", sources: [{ label: "Progent · arXiv", href: "https://arxiv.org/abs/2504.11703" }] },
          { titleEs: "Validación fuera del modelo", titleEn: "Validation outside the model", detailEs: "Verificar esquema y reglas de negocio de manera determinista antes de producir efectos externos.", detailEn: "Check schemas and business rules deterministically before producing external side effects.", sources: [{ label: "NIST · AI RMF", href: "https://www.nist.gov/itl/ai-risk-management-framework" }] },
        ],
      },
      {
        id: "oversight", titleEs: "Supervisión y límites", titleEn: "Oversight and boundaries",
        detailEs: "Definir qué requiere aprobación humana y cuándo el sistema debe detenerse o escalar.", detailEn: "Define what requires human approval and when the system must stop or escalate.",
        items: [
          { titleEs: "Revisión humana proporcional al riesgo", titleEn: "Risk-proportionate human review", detailEs: "Aplicar aprobación y mecanismos de apelación para acciones sensibles o de impacto alto.", detailEn: "Apply approval and appeal mechanisms for sensitive or high-impact actions.", sources: [{ label: "NIST · Generative AI Profile", href: "https://doi.org/10.6028/NIST.AI.600-1" }] },
          { titleEs: "Degradación segura", titleEn: "Safe degradation", detailEs: "Si una dependencia o comprobación falla, informar el estado y evitar simular éxitos.", detailEn: "When a dependency or check fails, report the state and avoid simulating success.", sources: [{ label: "OWASP · GenAI Security", href: "https://genai.owasp.org/llm-top-10/" }] },
        ],
      },
      {
        id: "observability", titleEs: "Evaluación y observabilidad", titleEn: "Evaluation and observability",
        detailEs: "Registrar eventos necesarios y seguros, medir calidad por separado de efectos, y revisar incidentes.", detailEn: "Log necessary and safe events, measure quality separately from side effects, and review incidents.",
        items: [
          { titleEs: "Trazabilidad", titleEn: "Traceability", detailEs: "Relacionar solicitud, política, herramienta, resultado y versión sin exponer secretos en los registros.", detailEn: "Connect request, policy, tool, result and version without exposing secrets in logs.", sources: [{ label: "NIST · AI RMF", href: "https://www.nist.gov/itl/ai-risk-management-framework" }] },
          { titleEs: "Evaluación continua", titleEn: "Continuous evaluation", detailEs: "Repetir pruebas tras cambios de modelo, prompt, herramientas, permisos o dependencias.", detailEn: "Repeat tests after changes to model, prompt, tools, permissions or dependencies.", sources: [{ label: "AgentDojo · arXiv", href: "https://arxiv.org/abs/2406.13352" }] },
        ],
      },
    ],
  },
  federation: {
    number: "04",
    titleEs: "Federación TAMV y Living Atlas: de repositorios a servicios verificables",
    titleEn: "TAMV federation and Living Atlas: from repositories to verifiable services",
    introEs: "Una arquitectura federada necesita contratos, identidad, propiedad de datos y observabilidad. Enlazar repositorios o mostrar una tarjeta común no demuestra integración operativa.",
    introEn: "A federated architecture needs contracts, identity, data ownership and observability. Linking repositories or showing a shared card does not prove operational integration.",
    rootEs: "Federación de servicios",
    rootEn: "Service federation",
    rootDetailEs: "Contratos · identidad · procedencia",
    rootDetailEn: "Contracts · identity · provenance",
    noteEs: "El mapa define criterios de integración. Cada relación entre repositorios requiere pruebas de contrato, permisos, conectividad, telemetría y evidencia de ejecución antes de declararse operativa.",
    noteEn: "This map defines integration criteria. Every relationship between repositories needs contract, permissions, connectivity, telemetry and execution evidence before it is called operational.",
    reviewedEs: "Estándares de interoperabilidad y cadena de suministro",
    reviewedEn: "Interoperability and supply-chain sources",
    branches: [
      {
        id: "contracts", titleEs: "Contratos y versiones de API", titleEn: "API contracts and versions",
        detailEs: "Publicar interfaces explícitas y probar compatibilidad entre productor y consumidor.", detailEn: "Publish explicit interfaces and test compatibility between producers and consumers.",
        items: [
          { titleEs: "Especificación OpenAPI", titleEn: "OpenAPI specification", detailEs: "Documentar rutas, esquemas, errores, autenticación y versiones compatibles.", detailEn: "Document routes, schemas, errors, authentication and compatible versions.", sources: [{ label: "OpenAPI Specification", href: "https://spec.openapis.org/oas/latest.html" }] },
          { titleEs: "Pruebas de contrato", titleEn: "Contract tests", detailEs: "Validar respuestas, cambios y consumidores antes del despliegue coordinado.", detailEn: "Validate responses, changes and consumers before coordinated deployment.", sources: [{ label: "OWASP API Security", href: "https://owasp.org/API-Security/" }] },
        ],
      },
      {
        id: "identity", titleEs: "Identidad y autorización", titleEn: "Identity and authorization",
        detailEs: "La confianza debe comprobarse en cada frontera; una identidad compartida no concede acceso ilimitado.", detailEn: "Trust must be verified at every boundary; shared identity does not grant unlimited access.",
        items: [
          { titleEs: "OAuth y tokens acotados", titleEn: "OAuth and scoped tokens", detailEs: "Usar tokens con audiencias, permisos y vigencias limitados al recurso previsto.", detailEn: "Use tokens with audience, permissions and validity limited to the intended resource.", sources: [{ label: "RFC 9700 · OAuth Security BCP", href: "https://www.rfc-editor.org/rfc/rfc9700.html" }] },
          { titleEs: "Verificación por frontera", titleEn: "Boundary verification", detailEs: "Aplicar autenticación, autorización y límites de tasa por servicio y operación.", detailEn: "Apply authentication, authorization and rate limits by service and operation.", sources: [{ label: "OWASP API Security", href: "https://owasp.org/API-Security/" }] },
        ],
      },
      {
        id: "events", titleEs: "Eventos y procedencia", titleEn: "Events and provenance",
        detailEs: "Definir propiedad de datos, evolución de esquemas, idempotencia y registro auditable.", detailEn: "Define data ownership, schema evolution, idempotency and auditable records.",
        items: [
          { titleEs: "Procesamiento robusto", titleEn: "Robust processing", detailEs: "Diseñar para reintentos y entregas repetidas; declarar explícitamente las garantías de consistencia.", detailEn: "Design for retries and repeated delivery; state consistency guarantees explicitly.", sources: [{ label: "W3C · PROV", href: "https://www.w3.org/TR/prov-overview/" }] },
          { titleEs: "Registro común de evidencia", titleEn: "Shared evidence record", detailEs: "Vincular artefacto, origen, versión, método y resultado sin confundir integridad con validez.", detailEn: "Link artifact, source, version, method and result without confusing integrity with validity.", sources: [{ label: "RO-Crate", href: "https://www.researchobject.org/ro-crate/" }] },
        ],
      },
      {
        id: "supply", titleEs: "Artefactos y cadena de suministro", titleEn: "Artifacts and software supply chain",
        detailEs: "Relacionar el código fuente con el artefacto construido y documentar sus dependencias.", detailEn: "Connect source code to the built artifact and document its dependencies.",
        items: [
          { titleEs: "Procedencia de compilación", titleEn: "Build provenance", detailEs: "Conservar evidencia de fuente, proceso de build y salida; verificarla con políticas del consumidor.", detailEn: "Keep evidence of source, build process and output; verify it against consumer policy.", sources: [{ label: "SLSA · especificación", href: "https://slsa.dev/spec/" }] },
          { titleEs: "SBOM y firmas", titleEn: "SBOM and signatures", detailEs: "Inventariar componentes y verificar integridad; ninguna medida aislada garantiza ausencia de vulnerabilidades.", detailEn: "Inventory components and verify integrity; no isolated measure guarantees absence of vulnerabilities.", sources: [{ label: "OpenSSF", href: "https://openssf.org/" }] },
        ],
      },
    ],
  },
}

export function TamvMindMap({ mapId, locale = "es" }: { mapId: MindMapId; locale?: Locale }) {
  const map = maps[mapId]
  const english = locale === "en"
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({})
  const expandedCount = map.branches.filter((branch) => expandedBranches[branch.id]).length
  const allExpanded = expandedCount === map.branches.length
  const toggleAll = () => setExpandedBranches(Object.fromEntries(map.branches.map((branch) => [branch.id, !allExpanded])))
  const toggleBranch = (id: string) => setExpandedBranches((current) => ({ ...current, [id]: !current[id] }))

  return (
    <section className={styles.section} aria-labelledby={`mind-map-title-${mapId}`}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{english ? `KNOWLEDGE MAP / ${map.number}` : `MAPA DE CONOCIMIENTO / ${map.number}`}</p>
            <h2 id={`mind-map-title-${mapId}`}>{english ? map.titleEn : map.titleEs}</h2>
            <p className={styles.intro}>{english ? map.introEn : map.introEs}</p>
          </div>
          <div className={styles.headerMark} aria-hidden="true"><Network size={24} strokeWidth={1.7} /></div>
        </header>

        <div className={styles.canvas}>
          <div className={styles.flow}>
            <div className={styles.rootColumn}>
              <div className={styles.rootNode}>
                <span className={styles.rootOverline}>{english ? "CENTRAL CONCEPT" : "CONCEPTO CENTRAL"}</span>
                <strong>{english ? map.rootEn : map.rootEs}</strong>
                <span className={styles.rootDetail}>{english ? map.rootDetailEn : map.rootDetailEs}</span>
              </div>
              <button
                className={styles.rootToggle}
                type="button"
                onClick={toggleAll}
                aria-expanded={allExpanded}
                aria-label={allExpanded ? (english ? "Collapse all branches" : "Contraer todas las ramas") : (english ? "Expand all branches" : "Expandir todas las ramas")}
                title={allExpanded ? (english ? "Collapse all" : "Contraer todo") : (english ? "Expand all" : "Expandir todo")}
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <p className={styles.rootHelper}>{english ? "Select a branch to explore its subtopics." : "Selecciona una rama para explorar sus subtemas."}</p>
            </div>

            <div className={styles.branchColumn}>
              {map.branches.map((branch, index) => {
                const open = Boolean(expandedBranches[branch.id])
                const branchTitle = english ? branch.titleEn : branch.titleEs
                return (
                  <article className={styles.branch} key={branch.id}>
                    <button
                      type="button"
                      className={styles.branchToggle}
                      onClick={() => toggleBranch(branch.id)}
                      aria-expanded={open}
                      aria-controls={`mind-map-${mapId}-branch-${branch.id}`}
                    >
                      <span className={styles.branchIndex}>{String(index + 1).padStart(2, "0")}</span>
                      <span className={styles.branchText}>
                        <strong>{branchTitle}</strong>
                        <small>{english ? branch.detailEn : branch.detailEs}</small>
                      </span>
                      <span className={styles.branchArrow} aria-hidden="true">
                        {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                      </span>
                    </button>
                    {open && (
                      <div className={styles.subtopics} id={`mind-map-${mapId}-branch-${branch.id}`}>
                        {branch.items.map((item) => (
                          <div className={styles.subtopic} key={item.titleEs}>
                            <span className={styles.subtopicDot} aria-hidden="true" />
                            <div className={styles.subtopicBody}>
                              <h3>{english ? item.titleEn : item.titleEs}</h3>
                              <p>{english ? item.detailEn : item.detailEs}</p>
                              <div className={styles.sources}>
                                {item.sources.map((source) => (
                                  <a key={source.href} href={source.href} target="_blank" rel="noopener noreferrer">
                                    {source.label}<ExternalLink size={12} aria-hidden="true" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          </div>
          <footer className={styles.mapFooter}>
            <p>{english ? map.noteEn : map.noteEs}</p>
            <span>{english ? map.reviewedEn : map.reviewedEs}</span>
          </footer>
        </div>
        <p className={styles.caption}>{english ? "Interactive mind map. Expand a branch or use the central control to expand/collapse all branches." : "Mapa mental interactivo. Despliega una rama o utiliza el control central para expandir o contraer todas las ramas."}</p>
      </div>
    </section>
  )
}
