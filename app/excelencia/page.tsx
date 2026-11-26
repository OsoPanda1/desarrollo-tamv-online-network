import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, BookOpenCheck, Repeat, Scale, SearchCheck } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { TamvSectionMedia } from "@/components/tamv-section-media"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { FairRecordGenerator } from "@/components/excellence/fair-record-generator"
import { resolveLocale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? { title: "Academic excellence — evidence, arbitration, living document", description: "Four pillars of TAMV academic excellence: verifiable TQAF-10 rigour, independent TRI-E arbitration, FAIR reproducibility, and continuous BookPI improvement, plus the six-step document cycle and the FAIR record generator." }
    : { title: "Excelencia académica — evidencia, arbitraje y documento vivo", description: "Cuatro pilares de la excelencia académica TAMV: rigor verificable TQAF-10, arbitraje independiente TRI-E, reproducibilidad FAIR y mejora continua BookPI, más el ciclo documental de seis pasos y el generador de ficha FAIR." }
}

type Pair = { es: string; en: string }
const t = (english: boolean, pair: Pair) => (english ? pair.en : pair.es)

const pillars: { n: string; title: Pair; body: Pair; icon: typeof SearchCheck }[] = [
  { n: "01", title: { es: "Rigor verificable", en: "Verifiable rigour" }, body: { es: "Cada output se audita contra el decálogo TQAF-10 (§4.2) antes de llevar la afiliación de la red: integridad, vacío de conocimiento, metodología, evidencia, replicabilidad, FAIR, autoría, dictamen, afiliación y preservación. El expediente TAMV marca hoy 0/10 y el sello, no emitido — ese es el punto de partida honesto, no una vergüenza que se maquilla.", en: "Every output is audited against the TQAF-10 decalogue (§4.2) before carrying the network's affiliation: integrity, knowledge gap, methodology, evidence, replicability, FAIR, authorship, verdict, affiliation, and preservation. The TAMV record stands at 0/10 today and the seal unissued — that is the honest starting point, not a blemish to hide." }, icon: SearchCheck },
  { n: "02", title: { es: "Arbitraje independiente", en: "Independent arbitration" }, body: { es: "La autoría y el arbitraje nunca son la misma persona: el pipeline editorial de §5 separa recepción, clasificación N1/N2/N3, auditoría de integridad, revisión por pares con rol TRI-E y aprobación del Comité de Gobernanza Científica. Sin dictamen registrado, no hay publicación con respaldo.", en: "Authorship and arbitration are never the same person: the §5 editorial pipeline separates receipt, N1/N2/N3 classification, integrity audit, peer review under the TRI-E role, and approval by the Scientific Governance Committee. Without a recorded verdict, there is no backed publication." }, icon: Scale },
  { n: "03", title: { es: "Reproducibilidad", en: "Reproducibility" }, body: { es: "Método, parámetros, datos y código quedan enlazados con identificadores persistentes (DOI, ORCID, TRI) y metadatos FAIR, para que otra persona pueda repetir el resultado y obtener lo mismo — o refutarlo con la misma evidencia sobre la mesa.", en: "Method, parameters, data, and code are linked with persistent identifiers (DOI, ORCID, TRI) and FAIR metadata, so someone else can repeat the result and get the same outcome — or refute it with the same evidence on the table." }, icon: Repeat },
  { n: "04", title: { es: "Mejora continua", en: "Continuous improvement" }, body: { es: "Todo error entra a la cadena causal y toda corrección deja registro BookPI, prueba de no regresión y, cuando aplica, errata pública. La excelencia aquí es un historial de correcciones verificables, no una foto fija.", en: "Every error enters the causal chain, and every correction leaves a BookPI record, a no-regression test, and, when applicable, a public erratum. Excellence here is a history of verifiable corrections, not a fixed snapshot." }, icon: BookOpenCheck },
]

const cycle: { n: string; title: Pair; detail: Pair }[] = [
  { n: "1", title: { es: "Crear con plantilla", en: "Create from a template" }, detail: { es: "Todo documento nace con su plantilla y su ficha FAIR.", en: "Every document starts with its template and its FAIR record." } },
  { n: "2", title: { es: "Identificar · TRI / ORCID / BookPI", en: "Identify · TRI / ORCID / BookPI" }, detail: { es: "Autoría con TRI y ORCID; la decisión de publicar abre su registro BookPI.", en: "Authorship with TRI and ORCID; the decision to publish opens its BookPI record." } },
  { n: "3", title: { es: "Revisar · TQAF-10", en: "Review · TQAF-10" }, detail: { es: "Auditoría contra los diez criterios antes de cualquier respaldo.", en: "Audit against the ten criteria before any backing." } },
  { n: "4", title: { es: "Versionar · PATCH / MINOR / MAJOR", en: "Version · PATCH / MINOR / MAJOR" }, detail: { es: "Una sola versión vigente; las anteriores se conservan marcadas como superseded, nunca se borran.", en: "One current version; earlier ones are kept marked as superseded, never deleted." } },
  { n: "5", title: { es: "Depositar · DOI + CC BY 4.0", en: "Deposit · DOI + CC BY 4.0" }, detail: { es: "Depósito con DOI persistente y licencia abierta declarada.", en: "Deposit with a persistent DOI and a declared open licence." } },
  { n: "6", title: { es: "Preservar y corregir · erratas públicas", en: "Preserve and correct · public errata" }, detail: { es: "Errata o retractación en el mismo lugar del documento, con fecha y causa.", en: "Erratum or retraction in the same place as the document, with date and cause." } },
]

const levelControls: { code: string; title: Pair; control: Pair }[] = [
  { code: "N3", title: { es: "Científico", en: "Scientific" }, control: { es: "Arbitraje experto, revisión por pares y verificación de reproducibilidad antes de cualquier DOI.", en: "Expert arbitration, peer review, and reproducibility verification before any DOI." } },
  { code: "N2", title: { es: "Técnico", en: "Technical" }, control: { es: "Auditoría de código, análisis de vulnerabilidades y verificación de ejecución.", en: "Code audit, vulnerability analysis, and execution verification." } },
  { code: "N1", title: { es: "Institucional", en: "Institutional" }, control: { es: "Revisión de coherencia doctrinal y corrección de estilo.", en: "Doctrinal coherence review and style correction." } },
]

const method4l: { code: string; title: Pair; body: Pair }[] = [
  { code: "L1", title: { es: "LANDSCAPE", en: "LANDSCAPE" }, body: { es: "Análisis estructural y mapeo de ecosistemas digitales; blindaje: visión de sistema total frente a canal único.", en: "Structural analysis and mapping of digital ecosystems; safeguard: a whole-system view versus a single channel." } },
  { code: "L2", title: { es: "LEVERAGE", en: "LEVERAGE" }, body: { es: "Puntos críticos de presión para maximizar ROI; foco en micro-comportamientos de alto impacto.", en: "Critical pressure points to maximise ROI; focus on high-impact micro-behaviours." } },
  { code: "L3", title: { es: "LOOP", en: "LOOP" }, body: { es: "Ciclos temporales y retroalimentación; control de espirales de crecimiento y churn.", en: "Temporal cycles and feedback; control of growth spirals and churn." } },
  { code: "L4", title: { es: "LEARN", en: "LEARN" }, body: { es: "Experiencia táctica convertida en reglas de negocio dinámicas; memoria estructurada y evolución algorítmica.", en: "Tactical experience turned into dynamic business rules; structured memory and algorithmic evolution." } },
]

export default async function ExcellencePage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  return <TamvAppShell locale={locale}>
    <PageIntro number="08" eyebrow={english ? "ACADEMIC EXCELLENCE · UTAMV" : "EXCELENCIA ACADÉMICA · UTAMV"} title={english ? "Excellence that is" : "Excelencia que se"} accent={english ? "demonstrated." : "demuestra."} description={english ? "Evidence, arbitration, and a living document. TAMV's academic improvement is not announced: it is operated. Four pillars turn the master document's guiding principle — evidence precedes the claim — into the network's daily practice, and one document system sustains them all." : "Evidencia, arbitraje y documento vivo. La mejora académica de TAMV no se anuncia: se opera. Cuatro pilares convierten el principio rector del documento maestro — la evidencia precede al claim — en práctica diaria de la red, y un sistema documental los sostiene a todos."} locale={locale} actions={<LanguageSwitch pathname="/excelencia" locale={locale} />} />

    <section className="section"><div className="container">
      <div className="section-heading-row">
        <div><p className="eyebrow">{english ? "01 / FOUR PILLARS" : "01 / CUATRO PILARES"}</p><h2>{english ? "The principle, made practice." : "El principio, hecho práctica."}</h2></div>
        <p>{english ? "Each pillar is a control, not a slogan: it can be checked against a record, a verdict, or a deposit." : "Cada pilar es un control, no un eslogan: se comprueba contra un registro, un dictamen o un depósito."}</p>
      </div>
      <div className="doc-grid">
        {pillars.map((p) => {
          const Icon = p.icon
          return <article className="doc-card" key={p.n}>
            <p className="eyebrow">{english ? `PILLAR ${p.n}` : `PILAR ${p.n}`}</p>
            <h3><Icon aria-hidden="true" style={{ width: 18, height: 18, verticalAlign: "-3px", marginRight: 8, color: "var(--copper-dark)" }} />{t(english, p.title)}</h3>
            <p>{t(english, p.body)}</p>
          </article>
        })}
      </div>
      <p><Link className="text-link" href={`/utamv?lang=${locale}`}>{english ? "Read the UTAMV master document (§§0–10)" : "Leer el documento maestro UTAMV (§§0–10)"} <ArrowUpRight aria-hidden="true" /></Link></p>
    </div></section>

    <section className="section"><div className="container">
      <div className="section-heading-row">
        <div><p className="eyebrow">{english ? "02 / DOCUMENT IMPLEMENTATION" : "02 / IMPLEMENTACIÓN DOCUMENTAL"}</p><h2>{english ? "Every document walks the same cycle." : "Cada documento recorre el mismo ciclo."}</h2></div>
        <p>{english ? "The TAMV document system joins the canonical repository structure, PATCH / MINOR / MAJOR versioning, and FAIR preservation (§6.3). A document outside this cycle is a personal draft, not a network output." : "El sistema documental de TAMV une la estructura canónica de repositorios, el versionado PATCH / MINOR / MAJOR y la preservación FAIR (§6.3). Un documento fuera de este ciclo es un borrador personal, no un output de la red."}</p>
      </div>
      <div className="doc-table-wrap"><table className="doc-table">
        <thead><tr><th>{english ? "Step" : "Paso"}</th><th>{english ? "Stage" : "Etapa"}</th><th>{english ? "What it requires" : "Qué exige"}</th></tr></thead>
        <tbody>{cycle.map((s) => <tr key={s.n}><td>{s.n}</td><td>{t(english, s.title)}</td><td>{t(english, s.detail)}</td></tr>)}</tbody>
      </table></div>
      <h3 style={{ margin: "26px 0 10px", color: "var(--navy)", font: "500 24px/1.2 var(--serif)" }}>{english ? "Control by document level (§4.1)" : "Control por nivel de documento (§4.1)"}</h3>
      <div className="doc-table-wrap"><table className="doc-table">
        <thead><tr><th>{english ? "Level" : "Nivel"}</th><th>{english ? "Type" : "Tipo"}</th><th>{english ? "Control" : "Control"}</th></tr></thead>
        <tbody>{levelControls.map((l) => <tr key={l.code}><td>{l.code}</td><td>{t(english, l.title)}</td><td>{t(english, l.control)}</td></tr>)}</tbody>
      </table></div>
      <div className="doc-note"><strong>{english ? "Every level requires:" : "Todo nivel exige:"}</strong><span> {english ? "authorship with TRI and ORCID, a declared licence, and a BookPI record of the decision to publish." : "autoría con TRI y ORCID, licencia declarada y registro BookPI de la decisión de publicar."}</span></div>
      <h3 style={{ margin: "26px 0 10px", color: "var(--navy)", font: "500 24px/1.2 var(--serif)" }}>{english ? "Implementation rules" : "Reglas de implementación"}</h3>
      <ul style={{ color: "#5e6b75", fontSize: 12, lineHeight: 1.85 }}>
        <li>{english ? "Name and place: every document lives in its repository's docs/, with its record and its history; nothing circulates only by messaging." : "Nombre y lugar: cada documento vive en docs/ de su repositorio, con su ficha y su historial; nada circula solo por mensajería."}</li>
        <li>{english ? "Metadata first: the FAIR record is completed before drafting, not after publishing." : "Metadatos primero: la ficha FAIR se completa antes de redactar, no después de publicar."}</li>
        <li>{english ? "One current version: earlier versions are kept marked as superseded, never deleted." : "Una sola versión vigente: las anteriores se conservan marcadas como superseded, nunca se borran."}</li>
        <li>{english ? "Erratum or retraction: published in the same place as the document, with date and cause." : "Errata o retractación: se publica en el mismo lugar del documento, con fecha y causa."}</li>
      </ul>
    </div></section>

    <section className="section" id="generador-fair"><div className="container">
      <div className="section-heading-row">
        <div><p className="eyebrow">{english ? "03 / DOCUMENT TOOL · FAIR RECORD" : "03 / HERRAMIENTA DOCUMENTAL · FICHA FAIR"}</p><h2>{english ? "A record you can file." : "Una ficha que se puede archivar."}</h2></div>
        <p>{english ? "The record is generated in your browser and never leaves it unless you copy, download, or email it yourself." : "La ficha se genera en tu navegador y no sale de él salvo que tú la copies, la descargues o la envíes por correo."}</p>
      </div>
      <FairRecordGenerator locale={locale} />
    </div></section>

    <section className="section"><div className="container">
      <div className="section-heading-row">
        <div><p className="eyebrow">{english ? "04 / DOCUMENTED METHOD · 4L METHOD" : "04 / MÉTODO DOCUMENTADO · MÉTODO 4L"}</p><h2>{english ? "The 4L Method: a documented method, not a legal claim." : "Método 4L: un método documentado, no una afirmación legal."}</h2></div>
        <p>{english ? "The 4L Method is presented in the document “PROTOCOLO MAESTRO LEGAL Y TÉCNICO — MÉTODO 4L™ TAMV™” as “Hybrid Intelligence Engineering” and a “Mental Operating System”, in four modules." : "El Método 4L se presenta en el documento «PROTOCOLO MAESTRO LEGAL Y TÉCNICO — MÉTODO 4L™ TAMV™» como «Ingeniería de Inteligencia Híbrida» y «Sistema Operativo Mental», en cuatro módulos."}</p>
      </div>
      <div className="doc-grid">
        {method4l.map((m) => <article className="doc-card" key={m.code}>
          <p className="eyebrow">{m.code}</p>
          <h3>{t(english, m.title)}</h3>
          <p>{t(english, m.body)}</p>
        </article>)}
      </div>
      <div className="doc-note"><strong>{english ? "Identifiers:" : "Identificadores:"}</strong><span> {english ? "DOI Zenodo 10.5281/zenodo.19411506; Figshare 10.6084/M9.FIGSHARE.32098846; Frontier ID 3117809." : "DOI Zenodo 10.5281/zenodo.19411506; Figshare 10.6084/M9.FIGSHARE.32098846; Frontier ID 3117809."}</span></div>
      <div className="doc-note"><strong>{english ? "Explicit warning:" : "Advertencia explícita:"}</strong><span> {english ? "The document claims full validity as legal support and that unlicensed use violates OMPI/WIPO treaties. Those are statements of the document, not facts: it cites no law, specific treaty, trademark or patent registration number, or lawyer, and gives no licence terms. They are not carried here as facts." : "El documento afirma plena validez como soporte legal y que el uso sin licencia viola tratados OMPI/WIPO. Son declaraciones del documento, no hechos: no cita ley, tratado específico, número de registro de marca o patente, ni abogado, y no detalla términos de licencia. No se portan aquí como hechos."}</span></div>
    </div></section>
  <TamvSectionMedia area="excellence" locale={locale} />
      </TamvAppShell>
}
