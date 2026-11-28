import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, BookOpen, ShieldCheck } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { ExternalAuditRequestBuilder } from "@/components/research/external-audit-request-builder"
import { SovereigntyBibliographyExplorer, type SovereigntyBibliographyRecord } from "@/components/research/sovereignty-bibliography-explorer"
import { localizedPath, resolveLocale } from "@/lib/i18n"
import {
  AI_GOVERNANCE_CONTROLS,
  AUDIT_ACCESS_RULES,
  AUDIT_PROTOCOL,
  bilingual,
  CORE_READING,
  DECOLONIAL_COMMITMENTS,
  FRAMEWORK_LIMITATIONS,
  GLOSSARY,
  IMPLEMENTATION_MAP,
  NORMATIVE_REFERENCES,
  SOVEREIGNTY_CYCLE,
  SOVEREIGNTY_FRAMEWORK,
  SOVEREIGNTY_LAYERS,
  SOVEREIGNTY_METHODS,
  SOVEREIGNTY_PRINCIPLES,
} from "@/lib/governance/digital-sovereignty"
import bibliography from "@/data/governance/digital-sovereignty-bibliography.json"
import "./page.css"

type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? { title: "Sovereign protection and AI governance", description: "TAMV Online's public methodological framework, traceable bibliography, and conditional external-audit protocol." }
    : { title: "Protección soberana y gobernanza para la IA", description: "Marco metodológico público, bibliografía trazable y protocolo condicional de auditoría externa de TAMV Online." }
}

const bibliographyRecords: SovereigntyBibliographyRecord[] = bibliography.records.map((record) => ({
  key: record.key,
  title: record.title,
  authors: record.authors,
  journal: record.journal,
  year: record.year,
  doi: record.doi,
  url: record.url,
  themes: record.themes,
  line: record.line,
  metadataFlags: record.metadataFlags,
}))

export default async function DigitalSovereigntyPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  const text = (value: { es: string; en: string }) => bilingual(value, locale)
  const recordsByKey = new Map(bibliographyRecords.map((record) => [record.key, record]))
  const flaggedRecords = bibliographyRecords.filter((record) => record.metadataFlags.length > 0).length

  return (
    <TamvAppShell locale={locale}>
      <PageIntro
        number="05"
        eyebrow={english ? "SOVEREIGN PROTECTION · AI GOVERNANCE" : "PROTECCIÓN SOBERANA · GOBERNANZA DE IA"}
        title={english ? "Sovereignty is" : "La soberanía es"}
        accent={english ? "a verifiable practice." : "una práctica verificable."}
        description={text(SOVEREIGNTY_FRAMEWORK.scope)}
        locale={locale}
        actions={<LanguageSwitch pathname="/soberania-digital" locale={locale} />}
      />

      <section className="section sovereignty-status-section" aria-labelledby="sovereignty-status-title">
        <div className="container">
          <div className="sovereignty-status-card">
            <ShieldCheck aria-hidden="true" />
            <div>
              <p className="eyebrow" id="sovereignty-status-title">{SOVEREIGNTY_FRAMEWORK.id} · {english ? "VERSION" : "VERSIÓN"} {SOVEREIGNTY_FRAMEWORK.version}</p>
              <h2>{english ? "Public draft, not certification" : "Borrador público, no certificación"}</h2>
              <p>{text(SOVEREIGNTY_FRAMEWORK.statusNote)}</p>
            </div>
            <Link className="button button-outline-dark" href={localizedPath("/gobernanza", locale)}>{english ? "Public policies" : "Políticas públicas"} <ArrowUpRight aria-hidden="true" /></Link>
          </div>
          <div className="sovereignty-separation" aria-label={english ? "Separation of authority and capability" : "Separación de autoridad y capacidad"}>
            {["CAPABILITY", "AUTHORITY", "EXECUTION", "EVIDENCE", "LEARNING", "PRODUCTION"].map((term) => <span key={term}>{english ? term : ({ CAPABILITY: "CAPACIDAD", AUTHORITY: "AUTORIDAD", EXECUTION: "EJECUCIÓN", EVIDENCE: "EVIDENCIA", LEARNING: "APRENDIZAJE", PRODUCTION: "PRODUCCIÓN" } as Record<string, string>)[term]}</span>)}
          </div>
          <p className="sovereignty-separation-note">{english ? "None of these states automatically implies the next. Authentication, MFA, or a signature is not consent; an AI agent never inherits human sovereign authority." : "Ninguno de estos estados implica automáticamente el siguiente. Autenticación, MFA o firma no equivalen a consentimiento; un agente de IA nunca hereda autoridad soberana humana."}</p>
        </div>
      </section>

      <section className="section sovereignty-hub-section">
        <div className="container policy-layout sovereignty-hub-layout">
          <nav className="policy-index sovereignty-index" aria-label={english ? "Framework index" : "Índice del marco"}>
            <p className="eyebrow">{english ? "ONE FRAMEWORK" : "UN SOLO MARCO"}</p>
            {[
              ["principios", english ? "Principles" : "Principios"],
              ["capas", english ? "Sovereignty layers" : "Capas de soberanía"],
              ["ciclo", english ? "Operating cycle" : "Ciclo operativo"],
              ["metodos", english ? "Research methods" : "Métodos de investigación"],
              ["control-ia", english ? "AI controls" : "Controles de IA"],
              ["responsabilidad", english ? "Decolonial responsibility" : "Responsabilidad decolonial"],
              ["implementacion", english ? "Current implementation" : "Implementación actual"],
              ["auditoria-externa", english ? "External audit" : "Auditoría externa"],
              ["referencias", english ? "References and reading" : "Referencias y lectura"],
              ["bibliografia", english ? "Bibliography" : "Bibliografía"],
              ["glosario", english ? "Glossary" : "Glosario"],
              ["limites", english ? "Limitations" : "Límites"],
            ].map(([id, label]) => <a href={`#${id}`} key={id}>{label}</a>)}
          </nav>

          <div className="policy-content sovereignty-content">
            <section id="principios" className="sovereignty-content-section">
              <div className="sovereignty-section-heading"><div><span className="eyebrow">01 / {english ? "PRINCIPLES" : "PRINCIPIOS"}</span><h2>{english ? "Rules before automation" : "Reglas antes que automatización"}</h2></div><p>{english ? "Eight commitments convert sovereignty from a slogan into decisions, records, boundaries, and remedies." : "Ocho compromisos convierten la soberanía de consigna en decisiones, registros, límites y reparaciones."}</p></div>
              <div className="sovereignty-principle-grid">
                {SOVEREIGNTY_PRINCIPLES.map((principle, index) => (
                  <article className="governance-card sovereignty-principle" key={principle.id}>
                    <span className="sovereignty-card-number">{String(index + 1).padStart(2, "0")}</span>
                    <h3>{text(principle.title)}</h3>
                    <p>{text(principle.description)}</p>
                    <p className="sovereignty-practice"><strong>{english ? "Practice:" : "Práctica:"}</strong> {text(principle.practice)}</p>
                  </article>
                ))}
              </div>
            </section>

            <section id="capas" className="sovereignty-content-section">
              <div className="sovereignty-section-heading"><div><span className="eyebrow">02 / {english ? "LAYERS" : "CAPAS"}</span><h2>{english ? "Five places where sovereignty is decided" : "Cinco lugares donde se decide la soberanía"}</h2></div><p>{english ? "Owning infrastructure alone is insufficient. Each layer requires authority, controls, and bounded evidence." : "Poseer infraestructura no basta. Cada capa exige autoridad, controles y evidencia acotada."}</p></div>
              <div className="sovereignty-layer-grid">
                {SOVEREIGNTY_LAYERS.map((layer, index) => (
                  <article className="sovereignty-layer" key={layer.id}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{text(layer.title)}</h3>
                    <p className="sovereignty-question">{text(layer.question)}</p>
                    <dl><dt>{english ? "Control" : "Control"}</dt><dd>{text(layer.control)}</dd><dt>{english ? "Evidence" : "Evidencia"}</dt><dd>{text(layer.evidence)}</dd></dl>
                  </article>
                ))}
              </div>
            </section>

            <section id="ciclo" className="sovereignty-content-section">
              <div className="sovereignty-section-heading"><div><span className="eyebrow">03 / {english ? "METHOD" : "MÉTODO"}</span><h2>{english ? "Govern · Map · Measure · Manage" : "Gobernar · Mapear · Medir · Gestionar"}</h2></div><p>{english ? "A repeatable operating cycle with explicit outputs; not a claim of alignment with any external framework." : "Un ciclo operativo repetible con productos explícitos; no es una declaración de equivalencia con ningún marco externo."}</p></div>
              <ol className="sovereignty-cycle">
                {SOVEREIGNTY_CYCLE.map((step, index) => <li key={step.id}><span>{String(index + 1).padStart(2, "0")}</span><h3>{text(step.title)}</h3><p>{text(step.description)}</p><p className="sovereignty-output"><strong>{english ? "Output:" : "Producto:"}</strong> {text(step.output)}</p></li>)}
              </ol>
            </section>

            <section id="metodos" className="sovereignty-content-section">
              <div className="sovereignty-section-heading"><div><span className="eyebrow">04 / {english ? "RESEARCH METHODS" : "MÉTODOS DE INVESTIGACIÓN"}</span><h2>{english ? "Methods with their limits attached" : "Métodos con sus límites incorporados"}</h2></div><p>{english ? "The bibliography supplies leads, not verified findings. Abstracts and full texts were not part of the supplied corpus." : "La bibliografía aporta pistas, no hallazgos verificados. El corpus suministrado no incluyó resúmenes ni textos completos."}</p></div>
              <div className="sovereignty-method-list">
                {SOVEREIGNTY_METHODS.map((method) => <details key={method.id}><summary>{text(method.title)}</summary><div><p><strong>{english ? "Use:" : "Uso:"}</strong> {text(method.use)}</p><p><strong>{english ? "Boundary:" : "Límite:"}</strong> {text(method.boundary)}</p></div></details>)}
              </div>
            </section>

            <section id="control-ia" className="sovereignty-content-section">
              <div className="sovereignty-section-heading"><div><span className="eyebrow">05 / {english ? "AI GOVERNANCE" : "GOBERNANZA DE IA"}</span><h2>{english ? "Human authority is not delegated to a model" : "La autoridad humana no se delega al modelo"}</h2></div><p>{english ? "Controls are fail-closed requirements. A successful technical capability does not establish permission or legitimacy." : "Los controles son requisitos que fallan en cerrado. Una capacidad técnica exitosa no establece permiso ni legitimidad."}</p></div>
              <div className="governance-grid sovereignty-control-grid">
                {AI_GOVERNANCE_CONTROLS.map((control) => <article className="governance-card" key={control.id}><h3>{text(control.title)}</h3><p>{text(control.description)}</p></article>)}
              </div>
            </section>

            <section id="responsabilidad" className="sovereignty-content-section">
              <div className="sovereignty-section-heading"><div><span className="eyebrow">06 / {english ? "DECOLONIAL RESPONSIBILITY" : "RESPONSABILIDAD DECOLONIAL"}</span><h2>{english ? "Autonomy must redistribute power" : "La autonomía debe redistribuir poder"}</h2></div><p>{english ? "Changing providers is not enough if decision-making, data, language, attribution, and benefits remain extractive." : "Cambiar de proveedor no basta si las decisiones, los datos, las lenguas, la atribución y los beneficios siguen siendo extractivos."}</p></div>
              <div className="sovereignty-commitment-grid">
                {DECOLONIAL_COMMITMENTS.map((commitment) => <article key={text(commitment.title)}><BookOpen aria-hidden="true" /><h3>{text(commitment.title)}</h3><p>{text(commitment.description)}</p></article>)}
              </div>
            </section>

            <section id="implementacion" className="sovereignty-content-section">
              <div className="sovereignty-section-heading"><div><span className="eyebrow">07 / {english ? "IMPLEMENTATION MAP" : "MAPA DE IMPLEMENTACIÓN"}</span><h2>{english ? "What exists, and what it does not prove" : "Qué existe y qué no demuestra"}</h2></div><p>{english ? "This map distinguishes published rules, structural checks, restricted evidence, and capabilities that are not implemented." : "Este mapa distingue reglas publicadas, controles estructurales, evidencia restringida y capacidades no implementadas."}</p></div>
              <div className="sovereignty-implementation-list">
                {IMPLEMENTATION_MAP.map((item) => <article key={item.route}><div><h3>{text(item.area)}</h3><span className="sovereignty-status-tag">{text(item.status)}</span></div><p>{text(item.limit)}</p><Link href={localizedPath(item.route.split("#", 1)[0], locale) + (item.route.includes("#") ? item.route.slice(item.route.indexOf("#")) : "")} className="inline-link">{english ? "Open related page" : "Abrir página relacionada"} <ArrowUpRight aria-hidden="true" /></Link></article>)}
              </div>
            </section>

            <section id="auditoria-externa" className="sovereignty-content-section">
              <div className="sovereignty-section-heading"><div><span className="eyebrow">08 / {english ? "CONDITIONAL EXTERNAL AUDIT" : "AUDITORÍA EXTERNA CONDICIONAL"}</span><h2>{english ? "A request starts review; it never grants access" : "Una solicitud inicia revisión; nunca concede acceso"}</h2></div><p>{english ? "External access exists only when a corresponding request or notice has been verified and an engagement has been accepted. The current request tool is local and creates no case." : "El acceso externo solo existe cuando se verificó la solicitud o aviso correspondiente y se aceptó un encargo. La herramienta actual es local y no crea casos."}</p></div>
              <div className="governance-notice"><ShieldCheck aria-hidden="true" /><p>{english ? "No external auditor role, scoped access grant, case workflow, or auditor portal is implemented. The protocol below is a public draft for future engagements, not an operational service." : "No existen rol de auditor externo, concesión de acceso acotada, flujo de casos ni portal de auditores. El protocolo siguiente es un borrador público para encargos futuros, no un servicio operativo."}</p></div>
              <ol className="sovereignty-audit-protocol">
                {AUDIT_PROTOCOL.map((step, index) => <li key={step.id}><span className="sovereignty-card-number">{String(index + 1).padStart(2, "0")}</span><div><h3>{text(step.title)}</h3><p>{text(step.action)}</p><dl><dt>{english ? "Output" : "Producto"}</dt><dd>{text(step.output)}</dd><dt>{english ? "Boundary" : "Límite"}</dt><dd>{text(step.boundary)}</dd></dl></div></li>)}
              </ol>
              <div className="sovereignty-access-rules"><h3>{english ? "Non-negotiable access rules" : "Reglas de acceso no negociables"}</h3><ul>{AUDIT_ACCESS_RULES.map((rule) => <li key={text(rule)}>{text(rule)}</li>)}</ul></div>
              <ExternalAuditRequestBuilder locale={locale} />
            </section>

            <section id="referencias" className="sovereignty-content-section">
              <div className="sovereignty-section-heading"><div><span className="eyebrow">09 / {english ? "REFERENCES" : "REFERENCIAS"}</span><h2>{english ? "Official references and core reading" : "Referencias oficiales y lectura central"}</h2></div><p>{english ? "References inform the draft; they do not confer certification, equivalence, or legal compliance." : "Las referencias informan el borrador; no confieren certificación, equivalencia ni cumplimiento jurídico."}</p></div>
              <div className="sovereignty-reference-grid">
                {NORMATIVE_REFERENCES.map((reference) => <article key={reference.id}><h3><a href={reference.url} target="_blank" rel="noopener noreferrer">{text(reference.title)} <ArrowUpRight aria-hidden="true" /></a></h3><p>{text(reference.use)}</p></article>)}
              </div>
              <h3 className="sovereignty-subheading">{english ? "Selected works in the supplied bibliography" : "Obras seleccionadas de la bibliografía suministrada"}</h3>
              <ol className="sovereignty-core-reading">
                {CORE_READING.map((reading) => {
                  const record = recordsByKey.get(reading.key)
                  return <li key={reading.key}><span>{reading.key}</span><div><h4>{record?.title ?? reading.key}</h4><p>{text(reading.note)}</p></div>{record?.doi && <a href={`https://doi.org/${encodeURIComponent(record.doi)}`} target="_blank" rel="noopener noreferrer">DOI <ArrowUpRight aria-hidden="true" /></a>}</li>
                })}
              </ol>
            </section>

            <section id="bibliografia" className="sovereignty-content-section">
              <div className="sovereignty-section-heading"><div><span className="eyebrow">10 / {english ? "TRACEABLE BIBLIOGRAPHY" : "BIBLIOGRAFÍA TRAZABLE"}</span><h2>{english ? "364 source records, without silent corrections" : "364 registros fuente, sin correcciones silenciosas"}</h2></div><p>{english ? "Search is local. Themes are editorial inference from titles and metadata; no abstract, full text, DOI resolution, authorship, or peer-review status was verified." : "La búsqueda es local. Los temas son inferencia editorial de títulos y metadatos; no se verificaron resúmenes, textos completos, resolución de DOI, autoría ni revisión por pares."}</p></div>
              <div className="sovereignty-corpus-summary">
                <div><strong>{bibliography.source.entryCount}</strong><span>{english ? "records" : "registros"}</span></div>
                <div><strong>{bibliography.coverage.firstYear}–{bibliography.coverage.lastYear}</strong><span>{english ? "declared years" : "años declarados"}</span></div>
                <div><strong>{bibliography.coverage.withDoi}</strong><span>{english ? "with DOI" : "con DOI"}</span></div>
                <div><strong>{flaggedRecords}</strong><span>{english ? "with warnings" : "con advertencias"}</span></div>
              </div>
              <div className="sovereignty-source-integrity">
                <div><span>{english ? "Source SHA-256" : "SHA-256 de origen"}</span><code>{bibliography.source.sha256}</code></div>
                <div><span>{english ? "Exact source" : "Fuente exacta"}</span><p>{bibliography.source.filename} · {bibliography.source.bytes.toLocaleString("en-US")} bytes</p></div>
                <a className="button button-outline-dark" href="/research/soberania-digital/search-papers.bib" download>{english ? "Download source .bib" : "Descargar fuente .bib"} <ArrowUpRight aria-hidden="true" /></a>
              </div>
              <SovereigntyBibliographyExplorer records={bibliographyRecords} locale={locale} />
            </section>

            <section id="glosario" className="sovereignty-content-section">
              <div className="sovereignty-section-heading"><div><span className="eyebrow">11 / {english ? "GLOSSARY" : "GLOSARIO"}</span><h2>{english ? "Terms that must not be conflated" : "Términos que no deben confundirse"}</h2></div></div>
              <dl className="sovereignty-glossary">{GLOSSARY.map((entry) => <div key={text(entry.term)}><dt>{text(entry.term)}</dt><dd>{text(entry.definition)}</dd></div>)}</dl>
            </section>

            <section id="limites" className="sovereignty-content-section">
              <div className="sovereignty-section-heading"><div><span className="eyebrow">12 / {english ? "LIMITATIONS" : "LÍMITES"}</span><h2>{english ? "Claims this framework does not make" : "Afirmaciones que este marco no hace"}</h2></div></div>
              <ul className="sovereignty-limitations">{FRAMEWORK_LIMITATIONS.map((limitation) => <li key={text(limitation)}>{text(limitation)}</li>)}</ul>
              <div className="governance-notice"><ShieldCheck aria-hidden="true" /><p>{english ? "Transparent governance requires publishing both the rule and the gap. External scientific, legal, security, and operational validation remains pending." : "La gobernanza transparente exige publicar la regla y la brecha. La validación científica, jurídica, de seguridad y operacional externa sigue pendiente."}</p></div>
            </section>
          </div>
        </div>
      </section>
    </TamvAppShell>
  )
}
