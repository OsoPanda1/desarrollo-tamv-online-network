import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Compass,
  FileSearch,
  Network,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { TamvSectionMedia } from "@/components/tamv-section-media"
import { TamvLearningLab } from "@/components/tamv-learning-lab"
import { TamvMindMap } from "@/components/tamv-mind-map"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { localizedPath, resolveLocale, type Locale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string }>

export const dynamic = "force-dynamic"

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? {
        title: "How to use TAMV — practical guide",
        description: "A practical walkthrough of TAMV Online Network: its purpose, the available sections, how to explore sources, and how to contribute responsibly.",
      }
    : {
        title: "Cómo usar TAMV — guía práctica",
        description: "Guía práctica de TAMV Online Network: qué es, cómo recorrer sus secciones, consultar fuentes y participar de forma responsable.",
      }
}

type GuideCard = {
  number: string
  title: string
  text: string
  href: string
  action: string
  icon: LucideIcon
  note?: string
}

function getGuideCards(locale: Locale): GuideCard[] {
  if (locale === "en") {
    return [
      { number: "01", title: "Explore projects", text: "Browse the public project directory, compare each purpose and inspect the declared status before drawing conclusions.", href: "/proyectos", action: "Browse projects", icon: Compass },
      { number: "02", title: "Read research and sources", text: "Start with a question, open the research area, and follow its source links. Treat a record as a pointer to evidence—not proof of peer review or scientific validity.", href: "/investigacion", action: "Open research", icon: Search, note: "The federated search bridge depends on a verified production endpoint. It can report that it is not configured." },
      { number: "03", title: "Inspect the HCU map", text: "Explore the graph to find related concepts and documented relationships. The visualization is exploratory and does not demonstrate causation.", href: "/hcu", action: "Open HCU map", icon: Network },
      { number: "04", title: "Check ecosystem metadata", text: "Review the public GitHub metadata returned for the eight catalogued repositories. This is source-level metadata, not a live health check for each application.", href: "/ecosistema", action: "View repository status", icon: FileSearch },
      { number: "05", title: "Use the developer resources", text: "Read endpoint contracts and examples before integrating. Check authorization, license, provenance, and whether the endpoint is actually deployed.", href: "/desarrolladores", action: "Open developer guide", icon: BookOpen },
      { number: "06", title: "Participate with context", text: "Use governance and community resources to understand review expectations. A proposal or contact does not guarantee acceptance, financing, employment, or accreditation.", href: "/comunidad", action: "Find participation paths", icon: UsersRound },
    ]
  }

  return [
    { number: "01", title: "Explora los proyectos", text: "Recorre el directorio público, compara el propósito de cada proyecto y revisa el estado declarado antes de sacar conclusiones.", href: "/proyectos", action: "Ver proyectos", icon: Compass },
    { number: "02", title: "Lee investigación y fuentes", text: "Empieza con una pregunta, entra a Investigación y sigue los enlaces de sus fuentes. Un registro dirige a evidencia; no prueba revisión por pares ni validez científica.", href: "/investigacion", action: "Abrir investigación", icon: Search, note: "La búsqueda federada depende de un endpoint de producción verificado. Puede informar que aún no está configurada." },
    { number: "03", title: "Explora el mapa HCU", text: "Usa el grafo para encontrar conceptos relacionados y relaciones documentadas. La visualización es exploratoria y no demuestra causalidad.", href: "/hcu", action: "Abrir mapa HCU", icon: Network },
    { number: "04", title: "Revisa metadatos del ecosistema", text: "Consulta los metadatos públicos de GitHub de los ocho repositorios catalogados. Son datos de las fuentes, no una prueba de salud en vivo de cada aplicación.", href: "/ecosistema", action: "Ver estado de repositorios", icon: FileSearch },
    { number: "05", title: "Usa los recursos para desarrolladores", text: "Lee contratos y ejemplos de API antes de integrar. Comprueba permisos, licencia, procedencia y si el endpoint está realmente desplegado.", href: "/desarrolladores", action: "Abrir guía de desarrollo", icon: BookOpen },
    { number: "06", title: "Participa con contexto", text: "Consulta gobernanza y comunidad para conocer los criterios de revisión. Una propuesta o un contacto no garantizan aceptación, financiación, empleo ni acreditación.", href: "/comunidad", action: "Ver formas de participar", icon: UsersRound },
  ]
}

export default async function GuidePage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  const cards = getGuideCards(locale)

  const quickSteps = english
    ? [
        { title: "Choose your goal", text: "Explore projects, consult sources, learn about the architecture, or prepare a technical contribution." },
        { title: "Open the relevant section", text: "Use the cards below. The main navigation stays available at the top of every page." },
        { title: "Follow the evidence", text: "Open cited records and check dates, ownership, license, and the difference between a proposal and a verified implementation." },
        { title: "Check limits before reuse", text: "Public visibility is not a license. Check each project's license and the provider's terms before copying or integrating information." },
        { title: "Contribute in a focused way", text: "Start with a reproducible issue, a small change, tests and a clear note of what remains unverified." },
      ]
    : [
        { title: "Define qué necesitas", text: "Explorar proyectos, consultar fuentes, entender la arquitectura o preparar una contribución técnica." },
        { title: "Abre la sección adecuada", text: "Usa las tarjetas de esta página. La navegación principal permanece disponible en la parte superior." },
        { title: "Sigue la evidencia", text: "Abre los registros citados y comprueba fechas, autoría declarada, licencia y la diferencia entre una propuesta y una implementación verificada." },
        { title: "Comprueba los límites antes de reutilizar", text: "Que algo sea público no concede una licencia. Revisa la licencia de cada proyecto y las condiciones de su proveedor antes de copiar o integrar información." },
        { title: "Contribuye de forma concreta", text: "Empieza con un problema reproducible, un cambio acotado, pruebas y una nota clara sobre lo que sigue sin verificarse." },
      ]

  const conceptItems = english
    ? [
        { label: "T — Technology", text: "Tools and infrastructure designed around real problems, clear boundaries, and responsible operation." },
        { label: "A — Advanced", text: "A direction for iterative research and technical development—not a claim that every component is mature or production-ready." },
        { label: "M — Mexican", text: "An independent initiative originating in Hidalgo, Mexico, with a Latin American perspective and territorial context." },
        { label: "V — Versatile", text: "A cross-domain approach connecting research, digital infrastructure, AI, governance, and living memory." },
      ]
    : [
        { label: "T — Tecnología", text: "Herramientas e infraestructura orientadas a problemas reales, límites claros y operación responsable." },
        { label: "A — Avanzada", text: "Una dirección de investigación y desarrollo iterativo; no significa que cada componente esté maduro o listo para producción." },
        { label: "M — Mexicana", text: "Una iniciativa independiente con origen en Hidalgo, México, con perspectiva latinoamericana y contexto territorial." },
        { label: "V — Versátil", text: "Un enfoque entre dominios que conecta investigación, infraestructura digital, IA, gobernanza y memoria viva." },
      ]

  return (
    <TamvAppShell locale={locale}>
      <PageIntro
        number="00"
        eyebrow={english ? "START HERE / PRACTICAL GUIDE" : "EMPIEZA AQUÍ / GUÍA PRÁCTICA"}
        title={english ? "Understand TAMV." : "Entiende TAMV."}
        accent={english ? "Use it with clarity." : "Úsalo con claridad."}
        description={english
          ? "A guided route through TAMV Online Network: what it is, what you can explore today, how to read status and evidence, and where to take your next step."
          : "Un recorrido guiado por TAMV Online Network: qué es, qué puedes explorar hoy, cómo interpretar estados y evidencias y dónde dar tu siguiente paso."}
        locale={locale}
        actions={<LanguageSwitch pathname="/guia" locale={locale} />}
      />

      <TamvMindMap mapId="isabella" locale={locale} />
      <section className="section tamv-guide-overview" aria-labelledby="tamv-guide-definition">
        <div className="container tamv-guide-overview-grid">
          <div className="tamv-guide-definition">
            <p className="eyebrow">{english ? "01 / WHAT IT IS" : "01 / QUÉ ES"}</p>
            <h2 id="tamv-guide-definition">{english ? <>A connected initiative, <em>not a magic button.</em></> : <>Una iniciativa conectada, <em>no un botón mágico.</em></>}</h2>
            <p className="tamv-guide-lead">{english
              ? "TAMV Online Network is an independent Mexican initiative that brings together research, technology, digital infrastructure, communities, and living territorial memory in a Latin American perspective."
              : "TAMV Online Network es una iniciativa mexicana independiente que reúne investigación, tecnología, infraestructura digital, comunidades y memoria territorial viva desde una perspectiva latinoamericana."}</p>
            <p>{english
              ? "The wider ecosystem is made up of multiple repositories, websites, and applications with separate deployments and data boundaries. A shared brand or a repository catalog does not mean all systems are already synchronized or share one identity system."
              : "El ecosistema amplio está formado por repositorios, sitios y aplicaciones con despliegues y límites de datos separados. Compartir marca o figurar en un catálogo no significa que todos los sistemas ya estén sincronizados o compartan un único sistema de identidad."}</p>
          </div>
          <aside className="tamv-guide-concept" aria-label={english ? "Meaning of TAMV" : "Significado de TAMV"}>
            <span className="tamv-guide-concept-kicker">{english ? "THE NAME" : "EL NOMBRE"}</span>
            <h3>{english ? "Technology. Territory. Memory." : "Tecnología. Territorio. Memoria."}</h3>
            <div className="tamv-guide-concept-items">
              {conceptItems.map((item) => <article key={item.label}><strong>{item.label}</strong><p>{item.text}</p></article>)}
            </div>
          </aside>
        </div>
      </section>

      <section className="section tamv-guide-steps-section" aria-labelledby="tamv-guide-steps">
        <div className="container">
          <div className="tamv-guide-section-heading">
            <div><p className="eyebrow">{english ? "02 / WHERE TO GO" : "02 / POR DÓNDE EMPEZAR"}</p><h2 id="tamv-guide-steps">{english ? "Choose your next step." : "Elige tu siguiente paso."}</h2></div>
            <p>{english ? "Each destination has a different purpose. Follow the path that matches your question." : "Cada sección tiene un propósito distinto. Sigue la ruta que mejor responda a tu pregunta."}</p>
          </div>
          <div className="tamv-guide-cards">
            {cards.map(({ number, title, text, href, action, icon: Icon, note }) => (
              <article className="tamv-guide-card" key={number}>
                <div className="tamv-guide-card-top"><span>{number}</span><Icon aria-hidden="true" /></div>
                <h3>{title}</h3>
                <p>{text}</p>
                {note ? <p className="tamv-guide-card-note">{note}</p> : null}
                <Link className="tamv-guide-card-link" href={localizedPath(href, locale)}>{action}<ArrowRight aria-hidden="true" /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section tamv-guide-howto-section" aria-labelledby="tamv-guide-howto">
        <div className="container tamv-guide-howto-grid">
          <div>
            <p className="eyebrow">{english ? "03 / HOW TO USE IT" : "03 / CÓMO USARLO"}</p>
            <h2 id="tamv-guide-howto">{english ? <>Five steps to <em>use TAMV well.</em></> : <>Cinco pasos para <em>usar TAMV bien.</em></>}</h2>
            <p className="tamv-guide-section-intro">{english
              ? "You do not need to understand the entire architecture before starting. Pick one question and follow a traceable path."
              : "No necesitas comprender toda la arquitectura antes de empezar. Elige una pregunta y sigue un recorrido trazable."}</p>
          </div>
          <ol className="tamv-guide-howto-list">
            {quickSteps.map((step, index) => (
              <li key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>
            ))}
          </ol>
        </div>
      </section>

      <TamvLearningLab locale={locale} />

      <section className="section tamv-guide-trust-section" aria-labelledby="tamv-guide-limits">
        <div className="container">
          <div className="tamv-guide-section-heading">
            <div><p className="eyebrow">{english ? "04 / READ STATUS RESPONSIBLY" : "04 / INTERPRETA LOS ESTADOS CON RESPONSABILIDAD"}</p><h2 id="tamv-guide-limits">{english ? "What the evidence does—and does not—say." : "Qué dice la evidencia y qué no dice."}</h2></div>
            <p>{english ? "TAMV separates documented intentions, public metadata, working features, and independently verified outcomes." : "TAMV distingue entre intenciones documentadas, metadatos públicos, funciones operativas y resultados verificados de forma independiente."}</p>
          </div>
          <div className="tamv-guide-boundaries">
            <article><ShieldCheck aria-hidden="true" /><h3>{english ? "Catalogued" : "Catalogado"}</h3><p>{english ? "A system is listed with a declared role. It is not proof of a live connection." : "Un sistema aparece con una función declarada. No demuestra que exista una conexión activa."}</p></article>
            <article><FileSearch aria-hidden="true" /><h3>{english ? "Metadata available" : "Metadatos disponibles"}</h3><p>{english ? "A source returned public metadata. It does not prove the application deploys or works." : "Una fuente devolvió metadatos públicos. No demuestra que la aplicación esté desplegada o funcione."}</p></article>
            <article><Network aria-hidden="true" /><h3>{english ? "Adapter implemented" : "Adaptador implementado"}</h3><p>{english ? "Code has been written. It still needs passing tests and endpoint-level integration evidence." : "El código está escrito. Aún necesita pruebas aprobadas y evidencia de integración con el endpoint."}</p></article>
            <article><ShieldCheck aria-hidden="true" /><h3>{english ? "Verified" : "Verificado"}</h3><p>{english ? "Use this label only when a recorded test proves a defined behavior for a specific version and environment." : "Usa esta etiqueta solo cuando una prueba registrada demuestre un comportamiento definido para una versión y entorno concretos."}</p></article>
          </div>
          <div className="tamv-guide-warning"><ShieldCheck aria-hidden="true" /><p>{english
            ? "TAMV is an independent initiative. A DOI, public profile, code repository, AI response, or listing does not by itself establish accreditation, peer review, legal incorporation, a third-party partnership, or scientific validity."
            : "TAMV es una iniciativa independiente. Un DOI, perfil público, repositorio, respuesta de IA o registro en un catálogo no demuestra por sí solo acreditación, revisión por pares, constitución legal, una alianza con terceros ni validez científica."}</p></div>
        </div>
      </section>

      <section className="section tamv-guide-next-section" aria-labelledby="tamv-guide-next">
        <div className="container tamv-guide-next-panel">
          <div><p className="eyebrow">{english ? "05 / CONTINUE" : "05 / CONTINÚA"}</p><h2 id="tamv-guide-next">{english ? <>Start small. <em>Leave evidence.</em></> : <>Empieza en pequeño. <em>Deja evidencia.</em></>}</h2><p>{english
            ? "For contributors, the best next step is a narrow issue, a reproducible change, and a clear report of what was tested. For visitors, choose the section that answers your question and inspect the sources."
            : "Para colaborar, el mejor siguiente paso es un problema acotado, un cambio reproducible y un informe claro de lo que se probó. Para visitantes, elige la sección que responde tu pregunta y consulta sus fuentes."}</p></div>
          <div className="tamv-guide-next-actions">
            <Link className="button button-outline-dark" href={localizedPath("/desarrolladores", locale)}>{english ? "Developer guide" : "Guía para desarrolladores"}<ArrowUpRight aria-hidden="true" /></Link>
            <Link className="button button-outline-dark" href={localizedPath("/gobernanza", locale)}>{english ? "Governance" : "Gobernanza"}<ArrowUpRight aria-hidden="true" /></Link>
            <Link className="button button-outline-dark" href={localizedPath("/comunidad", locale)}>{english ? "Community" : "Comunidad"}<ArrowUpRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    <TamvSectionMedia area="guide" locale={locale} />
      </TamvAppShell>
  )
}
