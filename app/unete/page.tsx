import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Mail, ShieldCheck } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { resolveLocale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? { title: "Join TAMV — four doors, one standard", description: "Join TAMV through a concrete door: research in a project, TRI-D engineering, TRI-E arbitration, or TRI-C work from the territory — plus the routes to propose a new project and to publish research." }
    : { title: "Únete a TAMV — cuatro puertas, un mismo estándar", description: "Únete a TAMV por una puerta concreta: investigar en un proyecto, ingeniería TRI-D, arbitraje TRI-E o colaboración TRI-C desde el territorio — más las rutas para proponer un proyecto nuevo y publicar investigación." }
}

type Pair = { es: string; en: string }
const t = (english: boolean, pair: Pair) => (english ? pair.en : pair.es)

const doors: { door: Pair; title: Pair; body: Pair; needs: Pair[]; links: { href: string; label: Pair; external?: boolean }[] }[] = [
  {
    door: { es: "Puerta 1 · TRI-R / TRI-A / TRI-S", en: "Door 1 · TRI-R / TRI-A / TRI-S" },
    title: { es: "Investigar en un proyecto TAMV", en: "Research in a TAMV project" },
    body: { es: "Te integras a una línea viva del ecosistema — Isabella, BookPI, UTAMV, el Mapa HCU, memoria territorial — con hipótesis, método y mentoría documentada.", en: "You join a living line of the ecosystem — Isabella, BookPI, UTAMV, the HCU Map, territorial memory — with a hypothesis, a method, and documented mentorship." },
    needs: [
      { es: "Cuenta TAMV y ORCID.", en: "A TAMV account and ORCID." },
      { es: "Una pregunta de investigación.", en: "A research question." },
      { es: "Dos líneas sobre tu evidencia inicial.", en: "Two lines about your initial evidence." },
    ],
    links: [
      { href: "/proyectos", label: { es: "Ver los proyectos", en: "See the projects" } },
      { href: "/portal/propuestas/nueva", label: { es: "Proponer mi integración", en: "Propose joining" } },
    ],
  },
  {
    door: { es: "Puerta 2 · TRI-D", en: "Door 2 · TRI-D" },
    title: { es: "Aportar ingeniería y código", en: "Contribute engineering and code" },
    body: { es: "Construyes en los repositorios de la red bajo el protocolo de contribución: contratos primero, análisis causal, pruebas y registro BookPI antes del merge.", en: "You build in the network's repositories under the contribution protocol: contracts first, causal analysis, tests, and a BookPI record before the merge." },
    needs: [
      { es: "Cuenta TAMV y GitHub.", en: "A TAMV account and GitHub." },
      { es: "Un primer issue o RFC con el problema que vas a resolver.", en: "A first issue or RFC stating the problem you will solve." },
    ],
    links: [
      { href: "https://github.com/OsoPanda1/desarrollo-tamv-online-network", label: { es: "Repositorio del hub TAMV", en: "TAMV hub repository" }, external: true },
      { href: "/desarrolladores", label: { es: "Área de desarrolladores", en: "Developers area" } },
    ],
  },
  {
    door: { es: "Puerta 3 · TRI-E", en: "Door 3 · TRI-E" },
    title: { es: "Auditar y dictaminar", en: "Audit and arbitrate" },
    body: { es: "Revisas el trabajo de otros con independencia verificable: tu TRI no puede coincidir con el de la autoría que dictaminas, y tu dictamen queda en el registro de procedencia.", en: "You review the work of others with verifiable independence: your TRI cannot match the authorship you arbitrate, and your verdict stays in the provenance record." },
    needs: [
      { es: "Cuenta Premium o invitación del Comité.", en: "A Premium account or a Committee invitation." },
      { es: "ORCID y un área de especialidad declarada.", en: "ORCID and a declared area of expertise." },
    ],
    links: [
      { href: "/portal", label: { es: "Ir al portal", en: "Go to the portal" } },
      { href: "/gobernanza", label: { es: "Leer las reglas de revisión", en: "Read the review rules" } },
    ],
  },
  {
    door: { es: "Puerta 4 · TRI-C", en: "Door 4 · TRI-C" },
    title: { es: "Colaborar desde el territorio", en: "Collaborate from the territory" },
    body: { es: "Aportas datos primarios, trabajo de campo, memoria histórica o análisis territorial desde tu comunidad — la evidencia que ningún modelo puede inventar.", en: "You contribute primary data, fieldwork, historical memory, or territorial analysis from your community — the evidence no model can invent." },
    needs: [
      { es: "Cuenta TAMV.", en: "A TAMV account." },
      { es: "Una descripción de tu territorio y del material o saber que custodias.", en: "A description of your territory and of the material or knowledge you steward." },
    ],
    links: [
      { href: "/comunidad", label: { es: "Ver la comunidad", en: "See the community" } },
      { href: "mailto:anubiscastillo@visitarealdelmonte.online?subject=Colaborar%20desde%20mi%20territorio%20%E2%80%94%20TRI-C", label: { es: "Presentar mi colaboración", en: "Present my collaboration" }, external: true },
    ],
  },
]

const projectFields: Pair[] = [
  { es: "Nombre del proyecto: un nombre que diga qué hace, no solo cómo suena.", en: "Project name: a name that says what it does, not only how it sounds." },
  { es: "Problema que resuelve: el vacío, en concreto — qué no está resuelto hoy, para quién y cómo lo sabes.", en: "Problem it solves: the gap, in concrete terms — what is unresolved today, for whom, and how you know." },
  { es: "Territorio y comunidad a la que sirve.", en: "Territory and community it serves." },
  { es: "Dominio o federación más cercana: IA y Cognición, Economía Soberana, Gobernanza, Clima y Biosfera, Salud y Vida, Seguridad, o Transversal.", en: "Closest domain or federation: AI & Cognition, Sovereign Economy, Governance, Climate & Biosphere, Health & Life, Security, or Cross-cutting." },
  { es: "Qué aportas tú: equipo, datos, código o campo.", en: "What you bring: team, data, code, or fieldwork." },
  { es: "Primera evidencia que entregarás en 90 días.", en: "First evidence you will deliver within 90 days." },
]

const portalFields: Pair[] = [
  { es: "Título de trabajo (8–160 caracteres).", en: "Working title (8–160 characters)." },
  { es: "Tipo de propuesta: artículo, conjunto de datos, tesis, reporte, prototipo, curso u otro formato.", en: "Proposal type: article, dataset, thesis, report, prototype, course, or another format." },
  { es: "Tema relacionado, si aplica.", en: "Related topic, if any." },
  { es: "Resumen de 100 a 5.000 caracteres, con pregunta, método, fuentes y límites.", en: "Abstract of 100 to 5,000 characters, with question, method, sources, and limits." },
  { es: "Enlace a fuente o material y licencia propuesta (opcionales).", en: "Source or material link and proposed licence (optional)." },
  { es: "Consentimiento para que el resumen pueda publicarse si la propuesta llega a publicarse.", en: "Consent for the abstract to be published if the proposal is published." },
]

const publishSteps: { n: string; title: Pair; body: Pair }[] = [
  { n: "1", title: { es: "Propuesta", en: "Proposal" }, body: { es: "Envías tu trabajo por el portal privado, con título, tipo, resumen, fuentes y licencia.", en: "You submit your work through the private portal, with title, type, abstract, sources, and licence." } },
  { n: "2", title: { es: "Hilo y discusión", en: "Thread and discussion" }, body: { es: "La discusión y las propuestas viven en el portal real, con moderación, revisión y apelación — no en la sesión del navegador.", en: "Discussion and submissions live in the real portal, with moderation, review, and appeal — not in the browser session." } },
  { n: "3", title: { es: "Arbitraje TQAF", en: "TQAF arbitration" }, body: { es: "Revisión con dictamen registrado; sin dictamen, no hay publicación con respaldo.", en: "Review with a recorded verdict; without a verdict, there is no backed publication." } },
  { n: "4", title: { es: "DOI y catálogo", en: "DOI and catalogue" }, body: { es: "Metadatos FAIR y DOI; el trabajo publicado aparece en el catálogo con consentimiento de autoría.", en: "FAIR metadata and a DOI; the published work appears in the catalogue with author consent." } },
]

export default async function JoinPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  return <TamvAppShell locale={locale}>
    <PageIntro eyebrow={english ? "JOIN · TAMV COMMUNITY AND RESEARCH" : "ÚNETE · COMUNIDAD E INVESTIGACIÓN TAMV"} title={english ? "Four doors in," : "Cuatro puertas de entrada,"} accent={english ? "one standard." : "un mismo estándar."} description={english ? "Joining TAMV is not filling in a form and waiting: it is entering through a concrete door, with a TRI role, a first piece of evidence, and a record. Choose yours." : "Formar parte de TAMV no es llenar un formulario y esperar: es entrar por una puerta concreta, con un rol TRI, una primera evidencia y un registro. Elige la tuya."} locale={locale} actions={<LanguageSwitch pathname="/unete" locale={locale} />} />

    <section className="section"><div className="container">
      <div className="section-heading-row">
        <div><p className="eyebrow">{english ? "01 / FOUR DOORS" : "01 / CUATRO PUERTAS"}</p><h2>{english ? "Enter through a concrete door." : "Entra por una puerta concreta."}</h2></div>
        <p>{english ? "Each door names its role, what you need, and where the real work happens. If you do not have an account yet, start at /cuenta." : "Cada puerta indica su rol, qué necesitas y dónde ocurre el trabajo real. Si aún no tienes cuenta, empieza en /cuenta."}</p>
      </div>
      <div className="doc-grid">
        {doors.map((door) => <article className="doc-card" key={door.title.es}>
          <p className="eyebrow">{t(english, door.door)}</p>
          <h3>{t(english, door.title)}</h3>
          <p>{t(english, door.body)}</p>
          <p><strong>{english ? "You need:" : "Necesitas:"}</strong></p>
          <ul>{door.needs.map((need) => <li key={need.es}>{t(english, need)}</li>)}</ul>
          <p>{door.links.map((link, index) => <span key={link.href}>{index > 0 && <> · </>}{link.external ? <a className="text-link" href={link.href} target={link.href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">{t(english, link.label)} <ArrowUpRight aria-hidden="true" /></a> : <Link className="text-link" href={link.href}>{t(english, link.label)} <ArrowUpRight aria-hidden="true" /></Link>}</span>)}</p>
        </article>)}
      </div>
      <div className="governance-notice"><ShieldCheck aria-hidden="true" /><p>{english ? "The old hub forum kept discussion only in the browser session. That forum is not carried over: discussion, submissions, review, and appeals now live in the real portal, with moderation and a visible record." : "El foro del hub anterior guardaba la discusión solo en la sesión del navegador. Ese foro no se porta: la discusión, las propuestas, la revisión y las apelaciones ahora viven en el portal real, con moderación y registro visible."}</p></div>
    </div></section>

    <section className="section" id="unete-proyecto"><div className="container">
      <div className="section-heading-row">
        <div><p className="eyebrow">{english ? "02 / PROPOSE A NEW PROJECT" : "02 / PROPONER UN PROYECTO NUEVO"}</p><h2>{english ? "Your project, to the network standard." : "Tu proyecto, con el estándar de la red."}</h2></div>
        <p>{english ? "A TAMV project is born with territorial purpose, an autonomy criterion, and first evidence. The hub's project generator becomes a guide here: prepare the record below and submit it through the real proposal portal." : "Un proyecto TAMV nace con propósito territorial, criterio de autonomía y primera evidencia. El generador del hub se convierte aquí en guía: prepara la ficha siguiente y envíala por el portal real de propuestas."}</p>
      </div>
      <h3 style={{ margin: "0 0 10px", color: "var(--navy)", font: "500 24px/1.2 var(--serif)" }}>{english ? "What your proposal must state" : "Qué debe declarar tu propuesta"}</h3>
      <ul>{projectFields.map((field) => <li key={field.es}>{t(english, field)}</li>)}</ul>
      <h3 style={{ margin: "26px 0 10px", color: "var(--navy)", font: "500 24px/1.2 var(--serif)" }}>{english ? "What the portal form asks for" : "Qué pide el formulario del portal"}</h3>
      <ul>{portalFields.map((field) => <li key={field.es}>{t(english, field)}</li>)}</ul>
      <p>{english ? "Submissions start private. Only authorized staff manage them inside the portal, and an abstract is published only with explicit consent." : "Las propuestas empiezan como privadas. Solo el equipo autorizado las gestiona dentro del portal, y el resumen se publica solo con consentimiento explícito."}</p>
      <div className="policy-cta"><div><h3>{english ? "Ready to propose it?" : "¿Listo para proponerlo?"}</h3><p>{english ? "The portal requires sign-in. A submission does not guarantee acceptance or funding." : "El portal requiere iniciar sesión. Un envío no garantiza aceptación ni financiación."}</p></div><Link className="button" href="/portal/propuestas/nueva">{english ? "Propose a new project" : "Proponer un proyecto nuevo"} <ArrowUpRight aria-hidden="true" /></Link></div>
    </div></section>

    <section className="section" id="unete-publicar"><div className="container">
      <div className="section-heading-row">
        <div><p className="eyebrow">{english ? "03 / PUBLISH YOUR RESEARCH" : "03 / PUBLICAR EN EL FORO TAMV"}</p><h2>{english ? "From thread to DOI." : "Tu investigación, del hilo al DOI."}</h2></div>
        <p>{english ? "The publication route follows the §5 pipeline: proposal, discussion thread, TQAF arbitration with a verdict, then FAIR metadata and a DOI in the TAMV catalogue — with the seal only if the Committee issues it." : "La ruta de publicación es la del pipeline §5: propuesta, hilo de discusión, arbitraje TQAF con dictamen, luego metadatos FAIR y DOI en el catálogo TAMV — con el sello solo si el Comité lo emite."}</p>
      </div>
      <div className="doc-table-wrap"><table className="doc-table">
        <thead><tr><th>{english ? "Step" : "Paso"}</th><th>{english ? "Stage" : "Etapa"}</th><th>{english ? "What happens" : "Qué ocurre"}</th></tr></thead>
        <tbody>{publishSteps.map((step) => <tr key={step.n}><td>{step.n}</td><td>{t(english, step.title)}</td><td>{t(english, step.body)}</td></tr>)}</tbody>
      </table></div>
      <p><Link className="text-link" href="/investigacion/publicaciones">{english ? "See published works" : "Ver las publicaciones"} <ArrowUpRight aria-hidden="true" /></Link> · <Link className="text-link" href="/excelencia">{english ? "How excellence is audited (TQAF-10)" : "Cómo se audita la excelencia (TQAF-10)"} <ArrowUpRight aria-hidden="true" /></Link> · <Link className="text-link" href="/portal/propuestas/nueva">{english ? "Start a submission" : "Iniciar un envío"} <ArrowUpRight aria-hidden="true" /></Link></p>
    </div></section>

    <section className="section"><div className="container">
      <div className="policy-cta"><div><h3>{english ? "Canonical channel · official contact" : "Canal canónico · contacto oficial de la red"}</h3><p>{english ? "The only formal channel of the network. Forum topics, Free and Premium account requests, new projects, submissions, TRI-E applications, and TRI verification all pass through it — so every request has a sender, a date, and a folio." : "Único canal formal de la red. Por él pasan las propuestas de temas del Foro, las solicitudes de cuenta Free y Premium, las propuestas de proyecto, los envíos para publicar, las postulaciones TRI-E y la verificación de identidades TRI — para que cada gestión tenga remitente, fecha y folio."}</p></div><a className="text-link" href="mailto:anubiscastillo@visitarealdelmonte.online"><Mail aria-hidden="true" /> anubiscastillo@visitarealdelmonte.online <ArrowUpRight aria-hidden="true" /></a></div>
      <p style={{ marginTop: 18 }}><Link className="text-link" href="/cuenta">{english ? "Create my account first" : "Crear mi cuenta primero"} <ArrowUpRight aria-hidden="true" /></Link></p>
    </div></section>
  </TamvAppShell>
}
