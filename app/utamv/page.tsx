import type { Metadata } from "next"
import { Fragment } from "react"
import Link from "next/link"
import { ArrowUpRight, ShieldAlert } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { resolveLocale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? { title: "UTAMV master document — integration version 3.0", description: "UTAMV master document §§0–10: verifiability principle, four-layer TQAF-TRI architecture, canonical record, TRI identity system, TQAF-10, editorial pipeline, data seal, governance, HCU instrument, method and limits." }
    : { title: "Documento maestro UTAMV — versión de integración 3.0", description: "Documento maestro UTAMV §§0–10: principio rector de verificabilidad, arquitectura de cuatro capas TQAF-TRI, ficha canónica, sistema TRI, TQAF-10, pipeline editorial, sello de datos, gobernanza, instrumento HCU, método y límites." }
}

type Pair = { es: string; en: string }
const t = (english: boolean, pair: Pair) => (english ? pair.en : pair.es)

const sections: { id: string; num: string; title: Pair }[] = [
  { id: "s0", num: "§0", title: { es: "Principio rector: verificabilidad frente a la dogmática académica", en: "Guiding principle: verifiability against academic dogma" } },
  { id: "s1", num: "§1", title: { es: "Arquitectura institucional de cuatro capas (TQAF-TRI)", en: "Four-layer institutional architecture (TQAF-TRI)" } },
  { id: "s2", num: "§2", title: { es: "Identidad institucional, matriz canónica y soberanía territorial", en: "Institutional identity, canonical record, and territorial sovereignty" } },
  { id: "s3", num: "§3", title: { es: "Sistema de atribución e identidad académica TAMV (TRI)", en: "TAMV academic attribution and identity system (TRI)" } },
  { id: "s4", num: "§4", title: { es: "Marco de calidad científica: TQAF y estándares TQAF-10 — 0/10", en: "Scientific quality framework: TQAF and the TQAF-10 standards — 0/10" } },
  { id: "s5", num: "§5", title: { es: "Pipeline editorial y flujo de auditoría trazable — 2/8", en: "Editorial pipeline and traceable audit flow — 2/8" } },
  { id: "s6", num: "§6", title: { es: "Sello de verificación, registro de procedencia y exportación FAIR — No emitido", en: "Verification seal, provenance record, and FAIR export — Not issued" } },
  { id: "s7", num: "§7", title: { es: "Gobernanza tecnológica, privacidad y soberanía", en: "Technology governance, privacy, and sovereignty" } },
  { id: "s8", num: "§8", title: { es: "Instrumento HCU: modelación causal y registro de evidencia", en: "HCU instrument: causal modelling and evidence record" } },
  { id: "s9", num: "§9", title: { es: "Método, reproducibilidad y límites de validez", en: "Method, reproducibility, and limits of validity" } },
  { id: "s10", num: "§10", title: { es: "Referencias y glosario", en: "References and glossary" } },
]

const canonicalRecord: { field: Pair; value: string }[] = [
  { field: { es: "Nombre oficial", en: "Official name" }, value: "METAVERSO TAMV Online Network" },
  { field: { es: "Denominación expandida", en: "Expanded name" }, value: "Tecnología Avanzada Mexicana Versátil — Red Educativa e Institucional" },
  { field: { es: "Acrónimo institucional", en: "Institutional acronym" }, value: "TAMV / UTAMV" },
  { field: { es: "Naturaleza jurídica / operativa", en: "Legal / operational nature" }, value: "Organización independiente de investigación aplicada, arquitectura de sistemas y ciencia abierta" },
  { field: { es: "Estructura de gobernanza", en: "Governance structure" }, value: "Arquitectura sintético-federada de 7 federaciones" },
  { field: { es: "Jurisdicción y sede", en: "Jurisdiction and seat" }, value: "Mineral del Monte (Real del Monte), Estado de Hidalgo, Estados Unidos Mexicanos" },
  { field: { es: "Nodo Cero (base operativa)", en: "Node Zero (operating base)" }, value: "Nodo Cero LDTOCS — Hub territorial y centro de procesamiento de datos" },
  { field: { es: "Portal web oficial", en: "Official web portal" }, value: "visitarealdelmonte.online/tamv" },
  { field: { es: "Repositorios canónicos", en: "Canonical repositories" }, value: "github.com/OsoPanda1" },
  { field: { es: "Canal de verificación", en: "Verification channel" }, value: "anubiscastillo@visitarealdelmonte.online" },
  { field: { es: "ORCID del Director", en: "Director's ORCID" }, value: "0009-0008-5050-1539 (Edwin Oswaldo Castillo Trejo) · dígito de control válido" },
  { field: { es: "ISNI del Director", en: "Director's ISNI" }, value: "0000 0005 3169 9229 · dígito de control válido" },
  { field: { es: "Registros DOI de base", en: "Base DOI records" }, value: "OSF: 10.17605/OSF.IO/T3WMY · Zenodo: 10.5281/zenodo.19436662 · formato válido" },
]

const triRoles: { code: string; role: Pair; contribution: Pair }[] = [
  { code: "TRI-F", role: { es: "Founding Custodian / Dirección Científica", en: "Founding Custodian / Scientific Direction" }, contribution: { es: "Preservación del canon conceptual, visión sistémica y liderazgo de la arquitectura civilizatoria.", en: "Preservation of the conceptual canon, systemic vision, and leadership of the civilizational architecture." } },
  { code: "TRI-R", role: { es: "Research Fellow / Investigador Principal", en: "Research Fellow / Principal Investigator" }, contribution: { es: "Formulación de hipótesis, modelado matemático, diseño metodológico y redacción científica.", en: "Hypothesis formulation, mathematical modelling, methodological design, and scientific writing." } },
  { code: "TRI-D", role: { es: "Systems Engineer & Code Architect", en: "Systems Engineer & Code Architect" }, contribution: { es: "Desarrollo de software, implementación de motores, construcción de algoritmos (ML/WebGL/criptografía) y reproducibilidad técnica.", en: "Software development, engine implementation, algorithm construction (ML/WebGL/cryptography), and technical reproducibility." } },
  { code: "TRI-E", role: { es: "Editor & Auditor Neutral", en: "Editor & Neutral Auditor" }, contribution: { es: "Verificación de integridad metodológica, revisión por pares y auditoría de seguridad y código.", en: "Methodological integrity verification, peer review, and security and code audit." } },
  { code: "TRI-C", role: { es: "Specialized Collaborator", en: "Specialized Collaborator" }, contribution: { es: "Aportación de datos primarios, trabajo de campo, preservación histórica o análisis territorial.", en: "Primary data, fieldwork, historical preservation, or territorial analysis." } },
  { code: "TRI-A", role: { es: "External Associated Researcher", en: "External Associated Researcher" }, contribution: { es: "Coautoría de investigadores adscritos a universidades o centros de investigación externos.", en: "Co-authorship by researchers affiliated with external universities or research centres." } },
  { code: "TRI-S", role: { es: "Student / Junior Developer", en: "Student / Junior Developer" }, contribution: { es: "Investigador en formación que participa bajo mentoría técnica documentada.", en: "Researcher in training participating under documented technical mentorship." } },
]

const tqaf10: { n: string; criterion: Pair; status: Pair; basis: Pair }[] = [
  { n: "1", criterion: { es: "Integridad y antiplagio", en: "Integrity and anti-plagiarism" }, status: { es: "Pendiente", en: "Pending" }, basis: { es: "Falta la declaración de autenticidad. El instrumento verifica integridad de datos, no originalidad textual.", en: "The authenticity declaration is missing. The instrument verifies data integrity, not textual originality." } },
  { n: "2", criterion: { es: "Vacío de conocimiento y justificación", en: "Knowledge gap and justification" }, status: { es: "Pendiente", en: "Pending" }, basis: { es: "Falta el planteamiento del problema no resuelto (mínimo 80 caracteres).", en: "The statement of the unresolved problem is missing (minimum 80 characters)." } },
  { n: "3", criterion: { es: "Metodología reproducible", en: "Reproducible methodology" }, status: { es: "Parcial", en: "Partial" }, basis: { es: "Parámetros de escenario, semilla de sensibilidad y determinismo verificados (§9). Falta referenciar el repositorio de código con identificador persistente.", en: "Scenario parameters, sensitivity seed, and determinism verified (§9). The code repository with a persistent identifier is still unreferenced." } },
  { n: "4", criterion: { es: "Respaldo de evidencia empírica", en: "Empirical evidence backing" }, status: { es: "Pendiente", en: "Pending" }, basis: { es: "0 de 8 hiperaristas activas citan una fuente con formato válido (DOI o URL). El formato se verifica; el contenido de la fuente, no.", en: "0 of 8 active hyperedges cite a source in valid format (DOI or URL). Format is verified; source content is not." } },
  { n: "5", criterion: { es: "Declaración de replicabilidad", en: "Replicability declaration" }, status: { es: "Pendiente", en: "Pending" }, basis: { es: "Falta clasificar la replicabilidad (Total, Parcial o Condicionada).", en: "Replicability still needs classification (Total, Partial, or Conditional)." } },
  { n: "6", criterion: { es: "Cumplimiento de estándares FAIR", en: "FAIR standards compliance" }, status: { es: "Pendiente", en: "Pending" }, basis: { es: "0 de 8 fuentes con DOI válido; DOI del expediente sin asignar. Exportación JSON-LD disponible (§6).", en: "0 of 8 sources with a valid DOI; record DOI unassigned. JSON-LD export available (§6)." } },
  { n: "7", criterion: { es: "Matriz de autoría transparente", en: "Transparent authorship matrix" }, status: { es: "Pendiente", en: "Pending" }, basis: { es: "0 de 26 átomos con código TRI válido y rol asignado.", en: "0 of 26 atoms with a valid TRI code and assigned role." } },
  { n: "8", criterion: { es: "Acta de auditoría y dictamen", en: "Audit record and verdict" }, status: { es: "Pendiente", en: "Pending" }, basis: { es: "No hay dictámenes registrados (§5).", en: "No verdicts recorded (§5)." } },
  { n: "9", criterion: { es: "Normalización de afiliación", en: "Affiliation normalisation" }, status: { es: "Pendiente", en: "Pending" }, basis: { es: "Identidad de la sesión incompleta o con TRI/ORCID inválido (§3).", en: "Session identity incomplete or with invalid TRI/ORCID (§3)." } },
  { n: "10", criterion: { es: "Preservación inmutable y política de erratas", en: "Immutable preservation and errata policy" }, status: { es: "Parcial", en: "Partial" }, basis: { es: "Registro de cambios encadenado con 2 entradas (política de erratas local). El depósito en Zenodo/OSF/Figshare es un proceso externo aún no declarado.", en: "Chained change record with 2 entries (local errata policy). Deposit in Zenodo/OSF/Figshare is an external process not yet declared." } },
]

const pipeline: { n: string; stage: Pair; status: Pair; detail: Pair }[] = [
  { n: "1", stage: { es: "Recepción e ingesta en el Nodo Cero", en: "Receipt and ingestion at Node Zero" }, status: { es: "Completa", en: "Complete" }, detail: { es: "Expediente con 26 átomos y 8 hiperaristas, ingresado en este instrumento (almacenamiento local).", en: "Record with 26 atoms and 8 hyperedges, entered in this instrument (local storage)." } },
  { n: "2", stage: { es: "Clasificación de nivel (N1 / N2 / N3)", en: "Level classification (N1 / N2 / N3)" }, status: { es: "Pendiente", en: "Pending" }, detail: { es: "Falta declarar el nivel del expediente (§4).", en: "The record level still needs to be declared (§4)." } },
  { n: "3", stage: { es: "Control de identidad y metadatos", en: "Identity and metadata control" }, status: { es: "Pendiente", en: "Pending" }, detail: { es: "Identidad de la sesión incompleta o inválida (§3).", en: "Session identity incomplete or invalid (§3)." } },
  { n: "4", stage: { es: "Auditoría de integridad y código (TQAF etapa 1)", en: "Integrity and code audit (TQAF stage 1)" }, status: { es: "Completa", en: "Complete" }, detail: { es: "Controles críticos superados (4/4).", en: "Critical controls passed (4/4)." } },
  { n: "5", stage: { es: "Arbitraje técnico y revisión por pares (TQAF etapa 2)", en: "Technical arbitration and peer review (TQAF stage 2)" }, status: { es: "Pendiente", en: "Pending" }, detail: { es: "Sin dictámenes (§5).", en: "No verdicts (§5)." } },
  { n: "6", stage: { es: "Aprobación del Comité de Gobernanza Científica", en: "Scientific Governance Committee approval" }, status: { es: "Pendiente", en: "Pending" }, detail: { es: "Sin acta del Comité.", en: "No Committee record." } },
  { n: "7", stage: { es: "Metadatos FAIR y asignación de DOI", en: "FAIR metadata and DOI assignment" }, status: { es: "Pendiente", en: "Pending" }, detail: { es: "Sin DOI asignado (Zenodo/OSF/Crossref).", en: "No DOI assigned (Zenodo/OSF/Crossref)." } },
  { n: "8", stage: { es: "Publicación abierta y registro en el catálogo TAMV", en: "Open publication and registration in the TAMV catalog" }, status: { es: "Pendiente", en: "Pending" }, detail: { es: "Sin publicación declarada.", en: "No publication declared." } },
]

const auditControls: { code: string; control: Pair; result: Pair; detail: Pair }[] = [
  { code: "A1", control: { es: "Integridad referencial de hiperaristas", en: "Hyperedge referential integrity" }, result: { es: "Superado · Crítico", en: "Passed · Critical" }, detail: { es: "Todos los extremos resuelven a nodos existentes.", en: "All endpoints resolve to existing nodes." } },
  { code: "A2", control: { es: "Rangos admisibles (puntajes 0–100, fuerza (0,1], rezago 1–15 años)", en: "Admissible ranges (scores 0–100, strength (0,1], lag 1–15 years)" }, result: { es: "Superado · Crítico", en: "Passed · Critical" }, detail: { es: "Sin valores fuera de rango.", en: "No out-of-range values." } },
  { code: "A3", control: { es: "Unicidad de identificadores y nombres", en: "Identifier and name uniqueness" }, result: { es: "Superado · Crítico", en: "Passed · Critical" }, detail: { es: "Sin duplicados.", en: "No duplicates." } },
  { code: "A4", control: { es: "Cadena del registro de procedencia íntegra", en: "Provenance record chain intact" }, result: { es: "Superado · Crítico", en: "Passed · Critical" }, detail: { es: "2 entradas verificadas.", en: "2 entries verified." } },
  { code: "A5", control: { es: "Coincidencia con el sello de datos", en: "Match with the data seal" }, result: { es: "Superado · Advertencia", en: "Passed · Warning" }, detail: { es: "No hay sello de datos emitido (no aplica).", en: "No data seal issued (not applicable)." } },
  { code: "A6", control: { es: "Reproducibilidad numérica (dos ejecuciones idénticas)", en: "Numerical reproducibility (two identical runs)" }, result: { es: "Superado · Advertencia", en: "Passed · Warning" }, detail: { es: "Resumen SHA3-512 de la simulación: adcdebb15b20197ba0d62f81…", en: "Simulation SHA3-512 summary: adcdebb15b20197ba0d62f81…" } },
  { code: "A7", control: { es: "Átomos sin hiperaristas activas", en: "Atoms without active hyperedges" }, result: { es: "Aviso · Advertencia", en: "Notice · Warning" }, detail: { es: "3 aislados: Razonamiento Neuro-Simbólico, Créditos ISA, Medicina Preventiva.", en: "3 isolated: Neuro-Symbolic Reasoning, ISA Credits, Preventive Medicine." } },
]

const levels: { code: string; type: Pair; control: Pair }[] = [
  { code: "N3", type: { es: "Resultados científicos y académicos: preprints, data papers, algoritmos ML, artículos, modelos formales de IA y conjuntos de datos de campo.", en: "Scientific and academic results: preprints, data papers, ML algorithms, articles, formal AI models, and field datasets." }, control: { es: "Arbitraje experto, revisión por pares y verificación de reproducibilidad.", en: "Expert arbitration, peer review, and reproducibility verification." } },
  { code: "N2", type: { es: "Especificaciones técnicas y arquitectónicas: white papers, esquemas de red, contratos criptográficos, manuales, arquitecturas de software.", en: "Technical and architectural specifications: white papers, network schemas, cryptographic contracts, manuals, software architectures." }, control: { es: "Auditoría de código, análisis de vulnerabilidades y verificación de ejecución.", en: "Code audit, vulnerability analysis, and execution verification." } },
  { code: "N1", type: { es: "Documentos institucionales y de gobernanza: manifiestos, políticas editoriales, guías operativas de dominio.", en: "Institutional and governance documents: manifestos, editorial policies, domain operating guides." }, control: { es: "Revisión de coherencia doctrinal y corrección de estilo.", en: "Doctrinal coherence review and style correction." } },
]

const references: string[] = [
  "[1] World Economic Forum (2017). World Economic Forum launches platform to map global transformation (Transformation Maps, 9 de noviembre de 2017). weforum.org.",
  "[2] Wilkinson, M. D. et al. (2016). The FAIR Guiding Principles for scientific data management and stewardship. Scientific Data 3, 160018. doi:10.1038/sdata.2016.18",
  "[3] Brand, A., Allen, L., Altman, M., Hlava, M. y Scott, J. (2015). Beyond authorship: attribution, contribution, collaboration, and credit. Learned Publishing 28(2), 151–155. doi:10.1087/20150211",
  "[4] Committee on Publication Ethics (COPE). Core Practices. publicationethics.org.",
  "[5] NIST (2015). FIPS 202: SHA-3 Standard: Permutation-Based Hash and Extendable-Output Functions. doi:10.6028/NIST.FIPS.202",
  "[6] Berge, C. (1973). Graphs and Hypergraphs. North-Holland, Ámsterdam.",
  "[7] Gordon, T. J. y Hayward, H. (1968). Initial experiments with the cross impact matrix method of forecasting. Futures 1(2), 100–116.",
  "[8] Meadows, D. H. (2008). Thinking in Systems: A Primer. Chelsea Green Publishing.",
  "[9] ISO 7064:1983. Data processing — Check character systems (sistema MOD 11-2, usado por ORCID e ISNI, ISO 27729).",
]

const glossary: { term: string; def: Pair }[] = [
  { term: "Átomo cognitivo", def: { es: "Nodo del hipergrafo con tres puntajes declarados (X, Y, Z) y atribución TRI; en los prototipos, «Cognitive Quantum Atom».", en: "Hypergraph node with three declared scores (X, Y, Z) and TRI attribution; in the prototypes, “Cognitive Quantum Atom”." } },
  { term: "Hiperarista", def: { es: "Relación dirigida de varios orígenes a varios destinos, con signo, fuerza, rezago y fuente; sustituye las líneas A–B.", en: "Directed relation from several origins to several destinations, with sign, strength, lag, and source; replaces the A–B lines." } },
  { term: "Ω Core", def: { es: "Nodo de lectura agregada que promedia dominios y expone tensión sistémica, riesgo ponderado y diagnóstico; no emite señales.", en: "Aggregate reading node that averages domains and exposes systemic tension, weighted risk, and diagnosis; it emits no signals." } },
  { term: "Incertidumbre y coherencia (Q, κ)", def: { es: "Magnitudes definidas en §9.1; el «colapso» corresponde a fijar el estado en el año visible al seleccionar un nodo.", en: "Quantities defined in §9.1; “collapse” means fixing the state at the visible year when a node is selected." } },
  { term: "Fase ψ", def: { es: "Ángulo determinista derivado del hash del identificador del nodo; sirve para distribuirlo visualmente, no es una magnitud física.", en: "Deterministic angle derived from the hash of the node identifier; it distributes the node visually and is not a physical quantity." } },
  { term: "Pod cognitivo", def: { es: "Representación de carga computacional simulada por nodo; no corresponde a recursos de Kubernetes.", en: "Simulated computational load per node; it does not correspond to Kubernetes resources." } },
  { term: "Cuarentena", def: { es: "Contención de propagación que anula la salida del nodo en la simulación («Cuarentena VETRA» en los prototipos).", en: "Propagation containment that zeroes the node's output in the simulation (“VETRA Quarantine” in the prototypes)." } },
  { term: "Orbitales S, P, D, F", def: { es: "Niveles de madurez estructural definidos en §9.3.", en: "Structural maturity levels defined in §9.3." } },
  { term: "ISCIR, VETRA", def: { es: "Términos heredados de los prototipos; su definición formal está pendiente (Q4).", en: "Terms inherited from the prototypes; their formal definition is pending (Q4)." } },
]

const questions: { code: string; q: Pair }[] = [
  { code: "Q1", q: { es: "Correspondencia entre los seis dominios del HCU y las siete federaciones de la gobernanza sintético-federada.", en: "Correspondence between the six HCU domains and the seven federations of the synthetic-federated governance." } },
  { code: "Q2", q: { es: "Procedencia y método de obtención de los puntajes X, Y, Z de los átomos.", en: "Provenance and method for obtaining the atoms' X, Y, Z scores." } },
  { code: "Q3", q: { es: "Plan de calibración empírica de fuerzas y rezagos con las fuentes citadas por hiperarista.", en: "Empirical calibration plan for strengths and lags using the sources cited per hyperedge." } },
  { code: "Q4", q: { es: "Definición formal de ISCIR y VETRA: se mencionan en los prototipos, pero no figuran en el BLUEPRINT.", en: "Formal definition of ISCIR and VETRA: mentioned in the prototypes, but absent from the BLUEPRINT." } },
]

export default async function UtamvPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  return <TamvAppShell locale={locale}>
    <PageIntro number="07" eyebrow={english ? "UTAMV / MASTER DOCUMENT" : "UTAMV / DOCUMENTO MAESTRO"} title={english ? "The master document," : "El documento maestro,"} accent={english ? "in the open." : "en abierto."} description={english ? "UTAMV Campus Online master document of institutional and academic integration, version 3.0. An internal working draft: no claim here is a verified or certified TQAF-10 output while the seal (§6) reads “Not issued”." : "Documento maestro de integración institucional y académica de UTAMV Campus Online, versión 3.0. Borrador interno de trabajo: ninguna afirmación aquí es un output verificado ni certificado conforme a TQAF-10 mientras el sello (§6) figure como «No emitido»."} locale={locale} actions={<LanguageSwitch pathname="/utamv" locale={locale} />} />

    <section className="section"><div className="container">
      <div className="doc-status-row" role="status">
        <span><strong>{english ? "Record" : "Expediente"}:</strong> {english ? "Internal draft" : "Borrador interno"}</span>
        <span><strong>TQAF-10:</strong> 0/10</span>
        <span><strong>{english ? "Pipeline" : "Pipeline"}:</strong> 2/8</span>
        <span><strong>{english ? "Data seal" : "Sello de datos"}:</strong> {english ? "Not issued" : "No emitido"}</span>
        <span><strong>{english ? "Record" : "Registro"}:</strong> 2 {english ? "entries" : "entradas"}</span>
        <span><strong>{english ? "Tension 2032 (C)" : "Tensión 2032 (C)"}:</strong> 40%</span>
        <span><strong>{english ? "Issued" : "Emisión"}:</strong> {english ? "1 November 2026" : "1 de noviembre de 2026"}</span>
        <span><strong>{english ? "Node" : "Nodo"}:</strong> {english ? "Node Zero, Real del Monte, Hidalgo, Mexico" : "Nodo Cero, Real del Monte, Hidalgo, México"}</span>
      </div>

      <div className="doc-warning" role="note">
        <ShieldAlert aria-hidden="true" />
        <strong>{english ? "RVOE DISCLAIMER — READ FIRST" : "DESLINDE RVOE — LÉASE PRIMERO"}</strong>
        <p>{english ? "TAMV Online Network does not operate as a school-based higher-education institution subject to traditional Reconocimiento de Validez Oficial de Estudios (RVOE), and it does not issue state professional degrees or licences (títulos or cédulas profesionales estatales)." : "TAMV Online Network no opera como una institución escolarizada de educación superior sujeta a Reconocimiento de Validez Oficial de Estudios (RVOE) tradicional, ni expide títulos o cédulas profesionales de carácter estatal."}</p>
        <p>{english ? "Its institutional function is to operate as an Academy and Open Science Network, running technical arbitration, author attribution, and research publication protocols under international standards recognised by the global scientific community." : "Su función institucional es operar como una Academia y Red de Ciencia Abierta, ejecutando protocolos de arbitraje técnico, atribución autoral y publicación de investigaciones bajo estándares internacionales reconocidos por la comunidad científica global."}</p>
      </div>

      <nav aria-label={english ? "Document index" : "Índice del documento"}>
        <ul className="doc-index">
          {sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.num} · {t(english, s.title)}</a></li>)}
        </ul>
      </nav>
    </div></section>

    <section className="section"><div className="container">

      <details className="doc-details" id="s0" open>
        <summary>{sections[0].num} · {t(english, sections[0].title)}</summary>
        <p>{english ? "TAMV Online Network adopts a fundamental epistemological premise: no organisation, regardless of age, budget, or state backing, can claim “absolute academic excellence” by historical prerogative or administrative decree. Scientific quality and technological rigour are not inherited attributes; they are emergent properties of transparency, reproducibility, and continuous methodological traceability." : "TAMV Online Network asume una premisa epistemológica fundamental: ninguna organización, independientemente de su antigüedad, presupuesto o respaldo estatal, puede atribuirse «excelencia académica absoluta» por prerrogativa histórica o decreto administrativo. La calidad científica y el rigor tecnológico no son atributos heredados; son propiedades emergentes de la transparencia, la reproducibilidad y la trazabilidad metodológica continua."}</p>
        <p>{english ? "To that end, the Auditable Evidence-Based Quality Assurance System (TQAF) is established. Every output issued under the network's affiliation — theoretical research, software architecture, protocol specification, AI model, or open-science resource — must demonstrate in the open:" : "Para ello se establece el Sistema de Garantía de Calidad Basado en Evidencias Auditable (TQAF). Cada output emitido bajo la afiliación de la red — investigación teórica, arquitectura de software, especificación de protocolos, modelo de IA o recurso de ciencia abierta — debe demostrar en abierto:"}</p>
        <ul>
          <li>{english ? "Scientific integrity and methodological traceability of origin." : "Integridad científica y trazabilidad metodológica de origen."}</li>
          <li>{english ? "Technical reproducibility, code audit, and verifiable availability of artefacts." : "Reproducibilidad técnica, auditoría de código y disponibilidad verificable de artefactos."}</li>
          <li>{english ? "Transparency in authorship attribution through structured metadata under FAIR principles (Findable, Accessible, Interoperable, Reusable) [2]." : "Transparencia en la atribución de autoría mediante metadatos estructurados bajo principios FAIR (Findable, Accessible, Interoperable, Reusable) [2]."}</li>
          <li>{english ? "Formal collegial review mechanisms and traceability through immutable provenance recorders." : "Mecanismos formales de revisión colegiada, trazabilidad mediante registradores de procedencia inmutables."}</li>
        </ul>
        <p>{english ? "The framework adopts and expands the editorial good practices and publication ethics promoted by the Committee on Publication Ethics (COPE) [4], aligning them with the seven-federation architecture and the 3S philosophy (Simple, Sencillo y Sobrio) that governs the network." : "El marco adopta y expande las buenas prácticas editoriales y de ética en la publicación promovidas por el Committee on Publication Ethics (COPE) [4], alineándolas con la arquitectura de siete federaciones y la filosofía 3S (Simple, Sencillo y Sobrio) que rige a la red."}</p>
        <p>{english ? "Scope of this document. Beyond stating the framework, it incorporates a computational instrument, the Hyperdimensional Cognitive Universe (HCU, §8), which runs the controls of §3 to §6 over the record's own data. Every state shown is computed from the current data. Initial scores and parameters are working hypotheses, not measurements (see §9)." : "Alcance de este documento. Además de enunciar el marco, incorpora un instrumento computacional, el Universo Cognitivo Hiperdimensional (HCU, §8), que ejecuta sobre los datos del propio expediente los controles de §3 a §6. Todo estado mostrado se calcula a partir de los datos actuales. Los puntajes y parámetros iniciales son hipótesis de trabajo, no mediciones (véase §9)."}</p>
      </details>

      <details className="doc-details" id="s1" open>
        <summary>{sections[1].num} · {t(english, sections[1].title)}</summary>
        <p>{english ? "Viability before international registries (ROR ID) and the open-science community requires separating identity, attribution, quality, and infrastructure. The state of each layer is computed live from the record, according to the document." : "La viabilidad ante registros internacionales (ROR ID) y la comunidad de ciencia abierta exige separar identidad, atribución, calidad e infraestructura. El estado de cada capa se calcula en vivo a partir del expediente, según el documento."}</p>
        <div className="doc-table-wrap"><table className="doc-table">
          <thead><tr><th>{english ? "Layer" : "Capa"}</th><th>{english ? "Content" : "Contenido"}</th><th>{english ? "State" : "Estado"}</th></tr></thead>
          <tbody>
            <tr><td>1</td><td>{english ? "Institutional identity, territorial sovereignty, and node matrix. Canonical record with 13 registered fields (§2). Node Zero and seven federations declared; ROR ID in process." : "Identidad institucional, soberanía territorial y matriz de nodos. Ficha canónica con 13 campos registrados (§2). Nodo Cero y siete federaciones declarados; ROR ID en trámite."}</td><td>{english ? "Registered" : "Registrada"}</td></tr>
            <tr><td>2</td><td>{english ? "Attribution and academic identity system (TRI). 0 of 26 atoms with valid TRI and role. Session identity: incomplete." : "Sistema de atribución e identidad académica (TRI). 0 de 26 átomos con TRI y rol válidos. Identidad de la sesión: incompleta."}</td><td>{english ? "Pending" : "Pendiente"}</td></tr>
            <tr><td>3</td><td>{english ? "Scientific quality framework (TQAF-10) and editorial pipeline. TQAF-10: 0 of 10 criteria met. Stage 1: passed. Pipeline: 2 of 8 stages complete." : "Marco de calidad científica (TQAF-10) y pipeline editorial. TQAF-10: 0 de 10 criterios satisfechos. Etapa 1: superada. Pipeline: 2 de 8 etapas completas."}</td><td>{english ? "Partial" : "Parcial"}</td></tr>
            <tr><td>4</td><td>{english ? "Open-science infrastructure, FAIR metadata, and interoperability. 0 of 8 hyperedges with a valid-format source. Chained record: 2 intact entries. JSON-LD export available." : "Infraestructura de ciencia abierta, metadatos FAIR e interoperabilidad. 0 de 8 hiperaristas con fuente de formato válido. Registro encadenado: 2 entradas íntegras. Exportación JSON-LD disponible."}</td><td>{english ? "Partial" : "Parcial"}</td></tr>
          </tbody>
        </table></div>
      </details>

      <details className="doc-details" id="s2" open>
        <summary>{sections[2].num} · {t(english, sections[2].title)}</summary>
        <h3>{english ? "2.1 · Canonical institutional record" : "2.1 · Ficha canónica institucional"}</h3>
        <dl className="doc-kv">
          {canonicalRecord.map((row) => <Fragment key={row.field.es}><dt>{t(english, row.field)}</dt><dd>{row.value}</dd></Fragment>)}
        </dl>
        <p>{english ? "Data transcribed from BLUEPRINT v3.0. The instrument verifies the format and check digit of ORCID and ISNI (ISO 7064 mod 11-2) and the format of DOIs; it does not query the external registries [9], so it does not certify that the identifiers exist or correspond to the stated person or deposit." : "Datos transcritos del BLUEPRINT v3.0. El instrumento verifica el formato y el dígito de control de ORCID e ISNI (ISO 7064 mod 11-2) y el formato de los DOI; no consulta los registros externos [9], por lo que no acredita que los identificadores existan ni correspondan a la persona o al depósito indicados."}</p>
        <p>{english ? "Note on DOI 10.5281/zenodo.19436662: this identifier carries a triple attribution in the Drive documents. The Atlas V4 header assigns it to Atlas; Atlas V4 §XV assigns it to the Conceptual Consistency Evaluation of Isabella V1.0; and the OSF document §V assigns it to the “TAMV Paradigm & RDM Digital Hub” project. The Master Manual assigns that same Evaluation to DOI 10.5281/zenodo.20606361. The attribution shown in this record is therefore unresolved." : "Nota sobre el DOI 10.5281/zenodo.19436662: este identificador recibe una triple atribución en los documentos de Drive. El encabezado de Atlas V4 lo asigna al Atlas; Atlas V4 §XV lo asigna a la Evaluación de Consistencia Conceptual de Isabella V1.0; y el documento OSF §V lo asigna al proyecto «TAMV Paradigm & RDM Digital Hub». El Manual Maestro asigna esa misma Evaluación al DOI 10.5281/zenodo.20606361. La atribución que figura en esta ficha queda, por tanto, sin resolver."}</p>
        <p>{english ? "The record does not enumerate the seven federations. The HCU instrument models six thematic domains; the correspondence between the two sets is yet to be defined (open question Q1, §9)." : "La ficha no enumera las siete federaciones. El instrumento HCU modela seis dominios temáticos; la correspondencia entre ambos conjuntos está por definir (pregunta abierta Q1, §9)."}</p>
        <h3>{english ? "2.2 · Declaration of autonomy and institutional disclaimer" : "2.2 · Declaración de autonomía y deslinde institucional"}</h3>
        <p>{english ? "METAVERSO TAMV Online Network and the Universidad Tecnológica Avanzada Meta Virtual (UTAMV) constitute an infrastructure for sovereign research and technological development, born to validate field work, distributed systems engineering, and affective-cognitive computing developed through self-management." : "METAVERSO TAMV Online Network y la Universidad Tecnológica Avanzada Meta Virtual (UTAMV) constituyen una infraestructura de investigación y desarrollo tecnológico soberano, nacida para validar el trabajo de campo, la ingeniería de sistemas distribuidos y la computación afectivo-cognitiva desarrollada desde la autogestión."}</p>
        <div className="doc-warning" role="note">
          <strong>{english ? "Transparency and operational clarity clause" : "Cláusula de transparencia y claridad operativa"}</strong>
          <p>{english ? "TAMV Online Network does not operate as a school-based higher-education institution subject to traditional Reconocimiento de Validez Oficial de Estudios (RVOE), and it does not issue state professional degrees or licences. Its institutional function is to operate as an Academy and Open Science Network, running technical arbitration protocols, author attribution, skills certification, and research publication under international standards recognised by the global scientific community." : "TAMV Online Network no opera como una institución escolarizada de educación superior sujeta a Reconocimiento de Validez Oficial de Estudios (RVOE) tradicional, ni expide títulos o cédulas profesionales de carácter estatal. Su función institucional es operar como una Academia y Red de Ciencia Abierta, ejecutando protocolos de arbitraje técnico, atribución autoral, certificación de competencias y publicación de investigaciones bajo estándares internacionales reconocidos por la comunidad científica global."}</p>
          <p>{english ? "Nuance from the Canonical Document §7.3: UTAMV distinguishes non-formal education, internal certificates, and microcredentials from regulated official degrees. No document in the Drive corpus mentions RVOE or asserts accreditation." : "Matiz del Documento Canónico §7.3: UTAMV distingue la formación no formal, los certificados internos y las microcredenciales de los títulos oficiales regulados. Ningún documento del corpus de Drive menciona el RVOE ni afirma acreditación."}</p>
        </div>
      </details>

      <details className="doc-details" id="s3">
        <summary>{sections[3].num} · {t(english, sections[3].title)}</summary>
        <p>{english ? "To suppress irresponsible anonymity and impersonation in collaborative development environments, every researcher or developer who publishes under TAMV affiliation holds a unique code: TAMV Research Identity (TRI). Structure: TRI (prefix) · TAMV (issuer) · AAAA (year of assignment) · XXXX (unique numeral). Canonical example: TRI-TAMV-2026-0001 (General Direction of Architecture)." : "Para suprimir el anonimato irresponsable y la usurpación en entornos de desarrollo colaborativo, todo investigador o desarrollador que publique bajo la afiliación de TAMV dispone de un código único: TAMV Research Identity (TRI). Estructura: TRI (prefijo) · TAMV (emisor) · AAAA (año de asignación) · XXXX (numeral único). Ejemplo canónico: TRI-TAMV-2026-0001 (Dirección General de Arquitectura)."}</p>
        <h3>{english ? "3.1 · Affiliation role matrix (adapted CRediT taxonomy) [3]" : "3.1 · Matriz de roles de afiliación (taxonomía CRediT adaptada) [3]"}</h3>
        <div className="doc-table-wrap"><table className="doc-table">
          <thead><tr><th>{english ? "Code" : "Código"}</th><th>{english ? "Role" : "Rol"}</th><th>{english ? "Required contribution" : "Contribución exigida"}</th></tr></thead>
          <tbody>{triRoles.map((r) => <tr key={r.code}><td>{r.code}</td><td>{t(english, r.role)}</td><td>{t(english, r.contribution)}</td></tr>)}</tbody>
        </table></div>
        <h3>{english ? "3.2 · Working-session identity" : "3.2 · Identidad de la sesión de trabajo"}</h3>
        <p>{english ? "Whoever operates this instrument identifies themselves there. Identity is validated (TRI format, ORCID check digit, matrix role) and stamped on every provenance record entry (§6). Without valid identity, entries remain “unidentified”. In the transcribed record state: Pending — name missing; TRI with invalid format (TRI-TAMV-AAAA-XXXX); ORCID invalid or with an incorrect check digit; role missing." : "Quien opera este instrumento se identifica allí. La identidad se valida (formato TRI, dígito de control de ORCID, rol de la matriz) y se estampa en cada entrada del registro de procedencia (§6). Sin identidad válida, las entradas quedan como «sin identificar». En el estado transcrito del expediente: Pendiente — falta el nombre; TRI con formato inválido (TRI-TAMV-AAAA-XXXX); ORCID inválido o con dígito de control incorrecto; falta el rol."}</p>
        <p>{english ? "Normalised affiliation (TQAF-10, criterion 9): [Author name], [TRI code], [ORCID code]. TAMV Online Network / UTAMV, Node Zero, Real del Monte, Hidalgo, Mexico." : "Afiliación normalizada (TQAF-10, criterio 9): [Nombre del autor], [Código TRI], [Código ORCID]. TAMV Online Network / UTAMV, Nodo Cero, Real del Monte, Hidalgo, México."}</p>
      </details>

      <details className="doc-details" id="s4" open>
        <summary>{sections[4].num} · {t(english, sections[4].title)}</summary>
        <p>{english ? "The TAMV Quality Assurance Framework audits every technical resource before granting it the network's institutional affiliation." : "El TAMV Quality Assurance Framework audita cada recurso técnico antes de otorgarle la afiliación institucional de la red."}</p>
        <h3>{english ? "4.1 · Evidence levels (N1–N3)" : "4.1 · Niveles de evidencia (N1–N3)"}</h3>
        <div className="doc-table-wrap"><table className="doc-table">
          <thead><tr><th>{english ? "Level" : "Nivel"}</th><th>{english ? "Output type" : "Tipo de output"}</th><th>{english ? "Control applied" : "Control aplicado"}</th></tr></thead>
          <tbody>{levels.map((l) => <tr key={l.code}><td>{l.code}</td><td>{t(english, l.type)}</td><td>{t(english, l.control)}</td></tr>)}</tbody>
        </table></div>
        <h3>{english ? "4.2 · TQAF-10 decalogue: record state" : "4.2 · Decálogo TQAF-10: estado del expediente"}</h3>
        <p>{english ? "No resource obtains a DOI record or institutional backing without verified compliance with all ten principles. Each criterion is assessed with one of five labels: Verified (checked by the instrument), Declared (stated by the author; requires human review), Partial, Pending, or External (requires a process outside the instrument)." : "Ningún recurso obtiene registro DOI o respaldo institucional sin el cumplimiento verificado de los diez principios. Cada criterio se evalúa con una de cinco etiquetas: Verificado (lo comprueba el instrumento), Declarado (lo afirma el autor; exige revisión humana), Parcial, Pendiente, o Externo (requiere un proceso fuera del instrumento)."}</p>
        <div className="doc-table-wrap"><table className="doc-table">
          <thead><tr><th>{english ? "No." : "N.º"}</th><th>{english ? "Criterion" : "Criterio"}</th><th>{english ? "State" : "Estado"}</th><th>{english ? "Basis of the state" : "Fundamento del estado"}</th></tr></thead>
          <tbody>{tqaf10.map((c) => <tr key={c.n}><td>{c.n}</td><td>{t(english, c.criterion)}</td><td>{t(english, c.status)}</td><td>{t(english, c.basis)}</td></tr>)}</tbody>
        </table></div>
        <h3>{english ? "4.3 · Record declarations (transcribed state)" : "4.3 · Declaraciones del expediente (estado transcrito)"}</h3>
        <p>{english ? "Record level — undeclared · Replicability — undeclared · Record version 0.1.0 · Textual-match report, code repository, record DOI, preservation DOI, cryptographic signature, and publication URL — not recorded in the transcribed state." : "Nivel del expediente — sin declarar · Replicabilidad — sin declarar · Versión del expediente 0.1.0 · Informe de coincidencia textual, repositorio de código, DOI del expediente, DOI de preservación, firma criptográfica y URL de publicación — sin registrar en el estado transcrito."}</p>
      </details>

      <details className="doc-details" id="s5" open>
        <summary>{sections[5].num} · {t(english, sections[5].title)}</summary>
        <p>{english ? "The flow guarantees independence between authorship and arbitration. Stages 1, 2, 4, 7, and part of 3 and 5 are determined automatically; stages 6 and 8 are declarative because they depend on acts outside the instrument." : "El flujo garantiza la independencia entre la autoría y el arbitraje. Las etapas 1, 2, 4, 7 y parte de la 3 y la 5 se determinan automáticamente; las etapas 6 y 8 son declarativas porque dependen de actos fuera del instrumento."}</p>
        <div className="doc-table-wrap"><table className="doc-table">
          <thead><tr><th>{english ? "No." : "N.º"}</th><th>{english ? "Stage" : "Etapa"}</th><th>{english ? "State" : "Estado"}</th><th>{english ? "Detail" : "Detalle"}</th></tr></thead>
          <tbody>{pipeline.map((p) => <tr key={p.n}><td>{p.n}</td><td>{t(english, p.stage)}</td><td>{t(english, p.status)}</td><td>{t(english, p.detail)}</td></tr>)}</tbody>
        </table></div>
        <h3>{english ? "5.1 · Integrity audit (TQAF stage 1) — one critical defect means direct rejection" : "5.1 · Auditoría de integridad (TQAF etapa 1) — un defecto crítico implica rechazo directo"}</h3>
        <div className="doc-table-wrap"><table className="doc-table">
          <thead><tr><th>{english ? "Control" : "Control"}</th><th>{english ? "Check" : "Control"}</th><th>{english ? "Result" : "Resultado"}</th><th>{english ? "Detail" : "Detalle"}</th></tr></thead>
          <tbody>{auditControls.map((a) => <tr key={a.code}><td>{a.code}</td><td>{t(english, a.control)}</td><td>{t(english, a.result)}</td><td>{t(english, a.detail)}</td></tr>)}</tbody>
        </table></div>
        <h3>{english ? "5.2 · Arbitration verdicts and records" : "5.2 · Dictámenes de arbitraje y actas"}</h3>
        <p>{english ? "No verdicts recorded. Independence is verified by comparing the verdict-maker's TRI with the authorship TRIs recorded in the atoms and in the session identity." : "Sin dictámenes registrados. La independencia se verifica comparando el TRI del dictaminador con los TRI de autoría registrados en los átomos y en la identidad de la sesión."}</p>
      </details>

      <details className="doc-details" id="s6" open>
        <summary>{sections[6].num} · {t(english, sections[6].title)}</summary>
        <p>{english ? "The network seal is issued by Committee decision, not by this instrument. Shown here is the seal draft, with the data the record already certifies and the conditions still missing." : "El sello de la red se emite por decisión del Comité, no por este instrumento. Aquí se muestra el proyecto de sello con los datos que el expediente ya acredita y las condiciones que faltan."}</p>
        <div className="doc-note"><strong>TAMV Verified Output — {english ? "Level N? · Seal draft — Not issued" : "Nivel N? · Proyecto de sello — No emitido"}</strong><br />
          {english ? "DOI identifier: unassigned · Principal author: — · Identifiers: TRI unassigned | ORCID: —" : "Identificador DOI: sin asignar · Autor principal: — · Identificadores: TRI sin asignar | ORCID: —"}<br />
          {english ? "Affiliation: METAVERSO TAMV Online Network / UTAMV Campus Online · Node Zero: Real del Monte, Hidalgo, Mexico" : "Afiliación: METAVERSO TAMV Online Network / UTAMV Campus Online · Nodo Cero: Real del Monte, Hidalgo, México"}<br />
          {english ? "Quality standard: TQAF-10: 0 of 10 criteria met · pipeline 2 of 8 stages complete · Open licence: Creative Commons Attribution 4.0 International (CC BY 4.0), per the BLUEPRINT" : "Estándar de calidad: TQAF-10: 0 de 10 criterios satisfechos · pipeline 2 de 8 etapas completas · Licencia abierta: Creative Commons Attribution 4.0 International (CC BY 4.0), según el BLUEPRINT"}<br />
          {english ? "Data integrity: SHA3-512 1c215be31a7254580723d5d046af2cb5… · no data seal" : "Integridad de datos: SHA3-512 1c215be31a7254580723d5d046af2cb5… · sin sello de datos"}<br />
          {english ? "Pending conditions: TQAF-10 criteria 1 to 10 (with 3 and 10 partial) and pipeline stages 2, 3, 5, 6, and 7, per the detail in §4 and §5." : "Condiciones pendientes: criterios 1 a 10 de TQAF-10 (con 3 y 10 en estado parcial) y etapas 2, 3, 5, 6 y 7 del pipeline, según el detalle de §4 y §5."}
        </div>
        <p>{english ? "DISCLAIMER. This badge certifies that the work passed TAMV's internal methodological quality and technical reproducibility tests, remaining exposed to open peer review by the international scientific community. This draft certifies nothing until the Committee issues it." : "DESLINDE. Este distintivo certifica que el trabajo superó las pruebas internas de calidad metodológica y reproducibilidad técnica de TAMV, quedando expuesto a la revisión por pares abierta de la comunidad científica internacional. Este proyecto no certifica nada hasta que el Comité lo emita."}</p>
        <h3>{english ? "6.1 · Data integrity seal" : "6.1 · Sello de integridad de datos"}</h3>
        <p>{english ? "Computes SHA3-512 [5] over the canonical form of each atom (values, attribution, and incident hyperedges with their sources) and a root over all hashes. It detects any later change. It is local integrity: not a signature and not an external anchor. In the transcribed state: no data state has been sealed yet." : "Calcula SHA3-512 [5] sobre la forma canónica de cada átomo (valores, atribución e hiperaristas incidentes con sus fuentes) y una raíz sobre todos los hashes. Detecta cualquier cambio posterior. Es integridad local: no es una firma ni un anclaje externo. En el estado transcrito: aún no se ha sellado ningún estado de los datos."}</p>
        <h3>{english ? "6.2 · Chained provenance record" : "6.2 · Registro de procedencia encadenado"}</h3>
        <p>{english ? "Each data change, declaration, or verdict is appended with the session identity, timestamp, and the previous entry's hash. Altering an entry breaks the chain. It does not replace an external deposit: whoever controls the browser can rewrite the whole chain." : "Cada cambio de datos, declaración o dictamen se agrega con la identidad de la sesión, la marca de tiempo y el hash de la entrada anterior. Alterar una entrada rompe la cadena. No sustituye un depósito externo: quien controla el navegador puede reescribir toda la cadena."}</p>
        <div className="doc-table-wrap"><table className="doc-table">
          <thead><tr><th>#</th><th>{english ? "Timestamp" : "Fecha-hora"}</th><th>{english ? "Identity" : "Identidad"}</th><th>{english ? "Event" : "Evento"}</th><th>{english ? "Hash" : "Hash"}</th></tr></thead>
          <tbody>
            <tr><td>#2</td><td>2026-11-21 03:40</td><td>{english ? "unidentified" : "sin identificar"}</td><td>{english ? "shock recorded · D5@2032 +1.0" : "choque registrado · D5@2032 +1.0"}</td><td>5ddcb4fbe73f</td></tr>
            <tr><td>#1</td><td>2026-11-21 03:40</td><td>{english ? "unidentified" : "sin identificar"}</td><td>{english ? "shock recorded · D5@2032 +1.0" : "choque registrado · D5@2032 +1.0"}</td><td>99b2511d416d</td></tr>
          </tbody>
        </table></div>
        <h3>{english ? "6.3 · Export (per the document)" : "6.3 · Exportación (según el documento)"}</h3>
        <p>{english ? "FAIR metadata (JSON-LD) · Model data (JSON) · Provenance record (JSON)." : "Metadatos FAIR (JSON-LD) · Datos del modelo (JSON) · Registro de procedencia (JSON)."}</p>
      </details>

      <details className="doc-details" id="s7">
        <summary>{sections[7].num} · {t(english, sections[7].title)}</summary>
        <h3>{english ? "TRI record data protection and privacy" : "Protección de datos y privacidad del registro TRI"}</h3>
        <p>{english ? "The system collects and publishes only the fields needed for scientific attribution: public name, ORCID, lines of research, institutional affiliation, and official repositories. Processing of sensitive personal data unrelated to academic activity is prohibited." : "El sistema recopila y publica únicamente los campos necesarios para la atribución científica: nombre público, ORCID, líneas de investigación, filiación institucional y repositorios oficiales. Se prohíbe el tratamiento de datos personales sensibles no vinculados a la actividad académica."}</p>
        <h3>{english ? "Sovereign resilience and infrastructure" : "Resiliencia e infraestructura soberana"}</h3>
        <p>{english ? "Metadata, arbitration records, and source code are stored redundantly in Node Zero infrastructure and in decentralised open-access platforms (OSF, Zenodo, GitHub, CERN OpenAIRE), to keep the collection permanently available regardless of external operational or political contingencies." : "Los metadatos, las actas de arbitraje y el código fuente se almacenan de forma redundante en la infraestructura del Nodo Cero y en plataformas descentralizadas de acceso abierto (OSF, Zenodo, GitHub, CERN OpenAIRE), para asegurar disponibilidad permanente del acervo independientemente de contingencias operativas o políticas externas."}</p>
        <div className="doc-note"><strong>{english ? "State in this instrument (per the document)" : "Estado en este instrumento (según el documento)"}</strong><span> {english ? "All data on that page is kept only in that browser's local storage. Nothing is transmitted to any server. The redundancy described is a network policy, not a function of that instrument: it requires depositing the §6.3 exports in the stated repositories." : "Todos los datos de esa página se guardan solo en el almacenamiento local de ese navegador. No se transmiten a ningún servidor. La redundancia descrita es una política de la red, no una función de ese instrumento: exige depositar las exportaciones de §6.3 en los repositorios indicados."}</span></div>
      </details>

      <details className="doc-details" id="s8" open>
        <summary>{sections[8].num} · {t(english, sections[8].title)}</summary>
        <p><Link className="text-link" href={`/hcu?lang=${locale}`}>{english ? "Open the interactive Transformative Map (HCU 3D)" : "Abrir el Mapa Transformativo interactivo (HCU 3D)"} <ArrowUpRight aria-hidden="true" /></Link></p>
        <p>{english ? "The Hyperdimensional Cognitive Universe represents 6 domains, their cognitive atoms (26 in total), and the hyperedges linking them, with the Ω Core as the aggregate reading nucleus. Each visual element encodes a computed value; no indicator is random or decorative. The format follows the precedent of the World Economic Forum's Transformation Maps [1]; this instrument adds direction, sign, magnitude, and lag for each link, evidence per edge, and simulation." : "El Universo Cognitivo Hiperdimensional representa 6 dominios, sus átomos cognitivos (26 en total) y las hiperaristas que los vinculan, con el Ω Core como núcleo de lectura agregada. Cada elemento visual codifica un valor calculado; ningún indicador es aleatorio ni decorativo. El formato sigue el precedente de las Transformation Maps del Foro Económico Mundial [1]; este instrumento añade dirección, signo, magnitud y rezago de cada vínculo, evidencia por arista y simulación."}</p>
        <p>{english ? "How it is used. (1) Select an atom or search by intent. (2) Record a shock: a node, a year, and an intensity. (3) Move the timeline and compare scenarios A, B, and C. (4) Quarantine a node to contain its propagation. (5) Cite the source of each hyperedge and seal the data (§6). Moving from hypothesis to knowledge requires step 5." : "Cómo se usa. (1) Selecciona un átomo o busca por intención. (2) Registra un choque: un nodo, un año y una intensidad. (3) Mueve la línea temporal y compara los escenarios A, B y C. (4) Pon en cuarentena un nodo para contener su propagación. (5) Cita la fuente de cada hiperarista y sella los datos (§6). Pasar de hipótesis a conocimiento exige el paso 5."}</p>
        <h3>{english ? "Domains" : "Dominios"}</h3>
        <ul>
          <li>{english ? "Domain 1 — AI and Cognition: Generative AI, Autonomous Agents, Executive Memory, Neuro-Symbolic Reasoning, Education" : "Dominio 1 — IA y Cognición: IA Generativa, Agentes Autónomos, Memoria Ejecutiva, Razonamiento Neuro-Simbólico, Educación"}</li>
          <li>{english ? "Domain 2 — Sovereign Economy: AI Markets, Digital Economy, Sustainable Finance, ISA Credits, Work" : "Dominio 2 — Economía Soberana: Mercados de IA, Economía Digital, Finanzas Sostenibles, Créditos ISA, Trabajo"}</li>
          <li>{english ? "Domain 3 — Governance: Global Governance, Scientific Integrity, Digital Democracy, VETRA Governance" : "Dominio 3 — Gobernanza: Gobernanza Global, Integridad Científica, Democracia Digital, VETRA Governance"}</li>
          <li>{english ? "Domain 4 — Climate and Biosphere: Climate Change, Energy Transition, Biodiversity, Circular Economy" : "Dominio 4 — Clima y Biosfera: Cambio Climático, Transición Energética, Biodiversidad, Economía Circular"}</li>
          <li>{english ? "Domain 5 — Health and Life: Global Health, Mental Health, Biotechnology, Preventive Medicine" : "Dominio 5 — Salud y Vida: Salud Global, Salud Mental, Biotecnología, Medicina Preventiva"}</li>
          <li>{english ? "Domain 6 — Security: Cybersecurity, Cybercrime, Hybrid Warfare, Digital Sovereignty" : "Dominio 6 — Seguridad: Ciberseguridad, Ciberdelito, Guerra Híbrida, Soberanía Digital"}</li>
        </ul>
        <h3>{english ? "Example transcribed from the document · Security · State in 2032 · Scenario C · Shock +1.0 in 2032" : "Ejemplo transcrito del documento · Seguridad · Estado en 2032 · Escenario C · Choque +1.0 en 2032"}</h3>
        <p>{english ? "Activation +1.00 · P10–P90 band +1.00 … +1.00 · Sign stability 100% of 200. Security is no longer only military: it is digital, informational, biological, and cognitive (the document's reading of the domain)." : "Activación +1.00 · Banda P10–P90 +1.00 … +1.00 · Estabilidad de signo 100% de 200. La seguridad ya no es solo militar: es digital, informacional, biológica y cognitiva (lectura del dominio en el documento)."}</p>
        <div className="doc-table-wrap"><table className="doc-table">
          <thead><tr><th>{english ? "Symbol" : "Símbolo"}</th><th>{english ? "Quantity" : "Magnitud"}</th><th>{english ? "Value" : "Valor"}</th></tr></thead>
          <tbody>
            <tr><td>X</td><td>{english ? "Influence" : "Influencia"}</td><td>92.8</td></tr>
            <tr><td>Y</td><td>{english ? "Risk" : "Riesgo"}</td><td>88</td></tr>
            <tr><td>Z</td><td>{english ? "Evidence" : "Evidencia"}</td><td>93.3</td></tr>
            <tr><td>T</td><td>{english ? "Time" : "Tiempo"}</td><td>2032</td></tr>
            <tr><td>Q</td><td>{english ? "Uncertainty" : "Incertidumbre"}</td><td>20.6%</td></tr>
            <tr><td>Ω</td><td>{english ? "Adjusted potential" : "Potencial ajustado"}</td><td>73.7</td></tr>
          </tbody>
        </table></div>
        <p>{english ? "Atoms of the domain (activation): Cybersecurity +1.00 · Cybercrime −1.00 · Hybrid Warfare +0.04 · Digital Sovereignty +0.43" : "Átomos del dominio (activación): Ciberseguridad +1.00 · Ciberdelito −1.00 · Guerra Híbrida +0.04 · Soberanía Digital +0.43"}</p>
        <div className="doc-table-wrap"><table className="doc-table">
          <thead><tr><th>{english ? "Year" : "Año"}</th><th>{english ? "Scenario A" : "Escenario A"}</th><th>{english ? "Scenario B" : "Escenario B"}</th><th>{english ? "Scenario C" : "Escenario C"}</th></tr></thead>
          <tbody>
            <tr><td>2030</td><td>+0.03</td><td>+0.07</td><td>+0.11</td></tr>
            <tr><td>2038</td><td>+0.09</td><td>+0.28</td><td>+0.90</td></tr>
            <tr><td>2050</td><td>+0.00</td><td>−0.03</td><td>+0.37</td></tr>
          </tbody>
        </table></div>
        <p>{english ? "Relative activations in [−1, 1]; they are not probabilities. This page adds no X/Y/Z scores for other domains or atoms: the document only transcribes the Security example; the remaining scores are not in the integrated text (see open question Q2, §9)." : "Activaciones relativas en [−1, 1]; no son probabilidades. Esta página no añade puntajes X/Y/Z para los demás dominios o átomos: el documento solo transcribe el ejemplo de Seguridad; los puntajes del resto no vienen en el texto integrado (véase la pregunta abierta Q2, §9)."}</p>
        <p>{english ? "Layers and controls cited in the instrument: Domain · Risk · Evidence · Pods · Uncertainty · Hyperedges · Flow · Orbital rotation. Colour = domain · size = influence · ring = activation (continuous: intensifies; dotted: reduces). Record data v0.1.0 · SHA3-512 root 1c215be31a725458…." : "Capas y controles citados en el instrumento: Dominio · Riesgo · Evidencia · Pods · Incertidumbre · Hiperaristas · Flujo · Rotación orbital. Color = dominio · tamaño = influencia · anillo = activación (continuo: intensifica; punteado: reduce). Datos del expediente v0.1.0 · raíz SHA3-512 1c215be31a725458…."}</p>
      </details>

      <details className="doc-details" id="s9" open>
        <summary>{sections[9].num} · {t(english, sections[9].title)}</summary>
        <p>{english ? "The model is a discrete annual system over a directed hypergraph [6]: each hyperedge connects a set of origins with a set of destinations. Shock propagation between nodes with lags follows the tradition of cross-impact analysis [7] and systems thinking [8]. It does not claim to reproduce either method: it is a working model with explicit parameters." : "El modelo es un sistema discreto anual sobre un hipergrafo dirigido [6]: cada hiperarista conecta un conjunto de orígenes con un conjunto de destinos. La propagación de choques entre nodos con rezagos se inscribe en la tradición del análisis de impactos cruzados [7] y del pensamiento sistémico [8]. No pretende reproducir ninguno de esos métodos: es un modelo de trabajo con parámetros explícitos."}</p>
        <h3>{english ? "9.1 · Formulation" : "9.1 · Formulación"}</h3>
        <pre><code>{`a_i(t) = clip[-1,1]( δ·a_i(t-1) + Σ σ_ei · w_e · γ · (1 + α·(r_i - ½)) · s_e(t-λ_e) + c_i(t) + u_i(t) )
s_e(τ) = |S_e|^(-½) · Σ q_j · a_j(τ) · q_j = 0 if j is quarantined; 1 otherwise
c_i(t): domain ← 0.25·γ·mean(a_atoms(t-1)) ; atom ← 0.10·γ·a_domain(t-1)
u_i(t): exogenous shocks recorded (node, year, intensity)
Q_i(t) = clip[0,1]( 0.10 + 0.50·(1 - Z_i) + 0.012·(year - 2026) )
Ω_i(t) = X_i · (1 - Q_i(t)) · κ_i(t) = Z_i · (1 - Q_i(t))
Tension(t) = Σ X_i·|a_i(t)| / Σ X_i (i over the atoms)`}</code></pre>
        <p>{english ? "X: systemic influence, r: risk (÷100), Z: declared evidence (÷100). w_e: strength; λ_e: lag in years (≥ 1); σ_ei = ±1 per the effect on the destination. Domain and Ω Core values are aggregates (means) of their atoms." : "X: influencia sistémica, r: riesgo (÷100), Z: evidencia declarada (÷100). w_e: fuerza; λ_e: rezago en años (≥ 1); σ_ei = ±1 según el efecto sobre el destino. Los valores de dominio y Ω Core son agregados (medias) de sus átomos."}</p>
        <h3>{english ? "9.2 · Scenarios" : "9.2 · Escenarios"}</h3>
        <div className="doc-table-wrap"><table className="doc-table">
          <thead><tr><th>{english ? "Scenario" : "Escenario"}</th><th>{english ? "Name" : "Nombre"}</th><th>γ {english ? "gain" : "ganancia"}</th><th>δ {english ? "persistence" : "persistencia"}</th><th>α {english ? "risk amplification" : "amplificación por riesgo"}</th></tr></thead>
          <tbody>
            <tr><td>A</td><td>{english ? "Controlled expansion" : "Expansión controlada"}</td><td>0.8</td><td>0.6</td><td>0.2</td></tr>
            <tr><td>B</td><td>{english ? "Structural transformation" : "Transformación estructural"}</td><td>1</td><td>0.72</td><td>0.5</td></tr>
            <tr><td>C</td><td>{english ? "Systemic mutation" : "Mutación sistémica"}</td><td>1.3</td><td>0.85</td><td>1</td></tr>
          </tbody>
        </table></div>
        <h3>{english ? "9.3 · Derived rules" : "9.3 · Reglas derivadas"}</h3>
        <p>{english ? "Orbital S/P/D/F (S: no active hyperedges; P: at least one, no cross-domain; D: at least two with cross-domain; F: D and evidence ≥ 95 — a structural maturity measure, not importance) · ISCIR index (Ω7: evidence ≥ 95 and all incident hyperedges with a valid source; Ω6: evidence ≥ 90; Ω5: otherwise; internal index, not a TQAF certification) · Confidence = 0.7·Z + 0.3·traceability · Pod load = 8 + 4·degree + 80·|a| (simulated 0–99 index, not telemetry) · Sensitivity: 200 Monte Carlo runs with seed 20261101 (w ±25%, lag ±1 year, γ ±15%, δ ±10%; band = 10th–90th percentiles) · Deterministic reproducibility, same SHA3-512 summary (control A6 of §5)." : "Orbital S/P/D/F (S: sin hiperaristas activas; P: al menos una, sin cruce de dominios; D: al menos dos con cruce; F: D y evidencia ≥ 95 — medida de madurez estructural, no de importancia) · Índice ISCIR (Ω7: evidencia ≥ 95 y todas las hiperaristas incidentes con fuente válida; Ω6: evidencia ≥ 90; Ω5: en otro caso; índice interno, no certificación TQAF) · Confianza = 0.7·Z + 0.3·trazabilidad · Carga de pod = 8 + 4·grado + 80·|a| (índice simulado 0–99, no telemetría) · Sensibilidad: 200 ejecuciones Monte Carlo con semilla 20261101 (w ±25%, rezago ±1 año, γ ±15%, δ ±10%; banda = percentiles 10–90) · Reproducibilidad determinista, mismo resumen SHA3-512 (control A6 de §5)."}</p>
        <h3>{english ? "9.4 · Limits of validity" : "9.4 · Límites de validez"}</h3>
        <ul>
          <li><strong>{english ? "Uncalibrated parameters." : "Parámetros no calibrados."}</strong> {english ? "Strengths, lags, and scenario parameters are initial hypotheses, not empirical estimates. Hyperedges marked “hypothesis” were added by whoever implemented the instrument and do not come from the prototypes." : "Las fuerzas, los rezagos y los parámetros de escenario son hipótesis iniciales, no estimaciones empíricas. Las hiperaristas marcadas «hipótesis» fueron añadidas por quien implementó el instrumento y no provienen de los prototipos."}</li>
          <li><strong>{english ? "Scores without measurement." : "Puntajes sin medición."}</strong> {english ? "Each atom's influence, risk, and evidence come from the author's prototypes. Education and Work, nodes named by the prototypes but without scores, carry provisional values and are marked." : "Influencia, riesgo y evidencia de cada átomo provienen de los prototipos del autor. Educación y Trabajo, nodos referidos por los prototipos pero sin puntajes, llevan valores provisionales y están marcados."}</li>
          <li><strong>{english ? "Relative magnitudes." : "Magnitudes relativas."}</strong> {english ? "An activation of 0.5 is neither a probability nor a physical measure. The sensitivity band reflects the model's own structural uncertainty, not a statistical confidence interval." : "Una activación de 0.5 no es una probabilidad ni una medida física. La banda de sensibilidad refleja incertidumbre estructural del propio modelo, no un intervalo de confianza estadístico."}</li>
          <li><strong>{english ? "Linearity." : "Linealidad."}</strong> {english ? "The model is linear with saturation at ±1; it includes no endogenous structural change, thresholds, or feedback outside the declared hyperedges." : "El modelo es lineal con saturación en ±1; no incluye cambios estructurales endógenos, umbrales ni retroalimentación fuera de las hiperaristas declaradas."}</li>
          <li><strong>{english ? "Local integrity." : "Integridad local."}</strong> {english ? "The seal and the chained record detect alterations, but they live in the browser. Immutability requires an external deposit (criterion 10)." : "El sello y el registro encadenado detectan alteraciones, pero residen en el navegador. La inmutabilidad requiere depósito externo (criterio 10)."}</li>
          <li><strong>{english ? "Terminology." : "Terminología."}</strong> {english ? "“Quantum state”, “coherence”, and “phase ψ” come from the prototypes and are used as system nomenclature; the model is classical and implies no quantum computing. See the glossary." : "«Estado cuántico», «coherencia» y «fase ψ» provienen de los prototipos y se usan como nomenclatura del sistema; el modelo es clásico y no implica computación cuántica. Véase el glosario."}</li>
        </ul>
        <h3>{english ? "9.5 · Open questions" : "9.5 · Preguntas abiertas"}</h3>
        <ul>{questions.map((q) => <li key={q.code}><strong>{q.code}.</strong> {t(english, q.q)}</li>)}</ul>
      </details>

      <details className="doc-details" id="s10">
        <summary>{sections[10].num} · {t(english, sections[10].title)}</summary>
        <h3>{english ? "References" : "Referencias"}</h3>
        <ol>{references.map((r) => <li key={r.slice(0, 6)}>{r}</li>)}</ol>
        <h3>{english ? "Glossary and equivalences with the prototypes" : "Glosario y equivalencias con los prototipos"}</h3>
        <dl className="doc-kv">
          {glossary.map((g) => <Fragment key={g.term}><dt>{g.term}</dt><dd>{t(english, g.def)}</dd></Fragment>)}
        </dl>
        <div className="doc-note"><strong>{english ? "Auditable master document · Integration version 3.0 · 1 November 2026." : "Documento maestro auditable · Versión de integración 3.0 · 1 de noviembre de 2026."}</strong><span> {english ? "This document and the instrument are in working-draft state: they do not constitute a verified or certified output under TQAF-10 while the seal draft (§6) reads “Not issued”." : "Este documento y el instrumento se encuentran en estado de borrador de trabajo: no constituyen un output verificado ni certificado conforme a TQAF-10 mientras el proyecto de sello (§6) figure como «No emitido»."}</span></div>
        <p><Link className="text-link" href={`/excelencia?lang=${locale}`}>{english ? "Academic excellence: pillars, document cycle, and FAIR record" : "Excelencia académica: pilares, ciclo documental y ficha FAIR"} <ArrowUpRight aria-hidden="true" /></Link></p>
      </details>

    </div></section>
  </TamvAppShell>
}
