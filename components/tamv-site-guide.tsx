import { ArrowRight, ArrowUpRight, BookOpen, Compass, Search, ShieldCheck, UsersRound } from "lucide-react"
import { localizedPath, type Locale } from "@/lib/i18n"

export function TamvSiteGuide({ locale = "es" }: { locale?: Locale }) {
  const english = locale === "en"
  const steps = english
    ? [
        { number: "01", icon: Compass, title: "Explore projects", text: "Browse the project directory and filter by architecture, AI, academia, or territory. Each record describes its purpose and evidence status.", href: localizedPath("/proyectos", locale), action: "Open projects" },
        { number: "02", icon: Search, title: "Search for connections", text: "On the HCU map, combine plain-language terms such as “AI + education” or “territory + memory” to explore related concepts and documented relationships.", href: localizedPath("/hcu", locale), action: "Open HCU map" },
        { number: "03", icon: BookOpen, title: "Check sources and topics", text: "Use Research and Sources to follow citations, methods, and project maturity. Look for the difference between a proposal, a prototype, an operation, and independent validation.", href: localizedPath("/fuentes", locale), action: "Review sources" },
        { number: "04", icon: UsersRound, title: "Join the conversation", text: "Visit the community or research portal to find ways to participate. A proposal is a starting point for editorial review—not a promise of acceptance, funding, or accreditation.", href: localizedPath("/comunidad", locale), action: "Find ways to participate" },
      ]
    : [
        { number: "01", icon: Compass, title: "Explora los proyectos", text: "Recorre el directorio y filtra por arquitectura, IA, academia o territorio. Cada ficha describe su propósito y el estado de la evidencia.", href: localizedPath("/proyectos", locale), action: "Abrir proyectos" },
        { number: "02", icon: Search, title: "Busca conexiones", text: "En el mapa HCU, combina términos cotidianos como «IA + educación» o «territorio + memoria» para explorar conceptos relacionados y relaciones documentadas.", href: localizedPath("/hcu", locale), action: "Abrir mapa HCU" },
        { number: "03", icon: BookOpen, title: "Contrasta fuentes y temas", text: "Consulta Investigación y Fuentes para seguir citas, métodos y madurez de los proyectos. Distingue entre propuesta, prototipo, operación y validación independiente.", href: localizedPath("/fuentes", locale), action: "Revisar fuentes" },
        { number: "04", icon: UsersRound, title: "Súmate a la conversación", text: "Visita Comunidad o el portal de investigación para conocer opciones de participación. Una propuesta inicia una revisión editorial; no garantiza aceptación, financiación ni acreditación.", href: localizedPath("/comunidad", locale), action: "Ver cómo participar" },
      ]

  const openSciencePlatforms = [
    {
      name: "Zenodo",
      category: english ? "RESEARCH REPOSITORY" : "REPOSITORIO DE INVESTIGACIÓN",
      description: english ? "A public record for sharing and citing research outputs, data, and software." : "Registro público para compartir y citar resultados de investigación, datos y software.",
      href: "https://doi.org/10.5281/zenodo.19436662",
      action: english ? "View the TAMV record" : "Ver el registro documental",
    },
    {
      name: "figshare",
      category: english ? "RESEARCH OUTPUTS" : "RESULTADOS DE INVESTIGACIÓN",
      description: english ? "A platform for publishing and discovering research data, figures, and other materials." : "Plataforma para publicar y descubrir datos, figuras y otros materiales de investigación.",
      href: "https://figshare.com/",
      action: english ? "Explore figshare" : "Explorar figshare",
    },
    {
      name: "OSF",
      category: english ? "OPEN PROJECTS" : "PROYECTOS ABIERTOS",
      description: english ? "Tools for organizing and sharing research projects, materials, and workflows." : "Herramientas para organizar y compartir proyectos, materiales y flujos de investigación.",
      href: "https://osf.io/",
      action: english ? "Explore OSF" : "Explorar OSF",
    },
    {
      name: "ORCID",
      category: english ? "RESEARCHER ID" : "IDENTIDAD INVESTIGADORA",
      description: english ? "A persistent identifier that helps connect researchers with their scholarly work." : "Identificador persistente que ayuda a vincular a cada investigador con su producción académica.",
      href: "https://orcid.org/0009-0008-5050-1539",
      action: english ? "View linked ORCID profile" : "Ver perfil ORCID enlazado",
    },
    {
      name: "OpenAIRE",
      category: english ? "DISCOVERY NETWORK" : "RED DE DESCUBRIMIENTO",
      description: english ? "A European research infrastructure connecting publications, data, projects, and services." : "Infraestructura europea que conecta publicaciones, datos, proyectos y servicios de investigación.",
      href: "https://explore.openaire.eu/",
      action: english ? "Explore OpenAIRE" : "Explorar OpenAIRE",
    },
    {
      name: "DataCite",
      category: english ? "PERSISTENT IDENTIFIERS" : "IDENTIFICADORES PERSISTENTES",
      description: english ? "DOI services and standards that support the identification and citation of research outputs." : "Servicios DOI y estándares para identificar y citar resultados de investigación.",
      href: "https://datacite.org/",
      action: english ? "Explore DataCite" : "Explorar DataCite",
    },
    {
      name: "CERN Open Science",
      category: english ? "OPEN SCIENCE PROGRAMME" : "PROGRAMA DE CIENCIA ABIERTA",
      description: english ? "CERN’s resources and initiatives for making research more openly accessible." : "Recursos e iniciativas del CERN para facilitar el acceso abierto a la investigación.",
      href: "https://openscience.cern/",
      action: english ? "Explore CERN Open Science" : "Explorar CERN Open Science",
    },
  ]

  const benefits = english
    ? [
        { title: "Context before labels", text: "Explore technology through the people, places, and questions it is meant to serve." },
        { title: "A clearer path to information", text: "Move from project themes to research, sources, and governance without losing your bearings." },
        { title: "Evidence you can inspect", text: "Find the references and maturity notes behind public descriptions, including what remains unverified." },
        { title: "Room for collaboration", text: "Use the directory and community resources to discover a relevant next step or conversation." },
      ]
    : [
        { title: "Contexto antes que etiquetas", text: "Explora la tecnología desde las personas, los territorios y las preguntas a las que busca servir." },
        { title: "Un camino claro a la información", text: "Pasa de los temas y proyectos a la investigación, las fuentes y la gobernanza sin perder el hilo." },
        { title: "Evidencia que puedes revisar", text: "Encuentra referencias y notas de madurez, incluido aquello que aún no cuenta con verificación independiente." },
        { title: "Espacio para colaborar", text: "Usa el directorio y los recursos comunitarios para descubrir un siguiente paso o una conversación pertinente." },
      ]

  return (
    <section className="section guide-section" id="guia" aria-labelledby="guide-title" lang={locale}>
      <div className="container">
        <div className="guide-heading">
          <div>
            <p className="eyebrow">{english ? "A PRACTICAL GUIDE" : "GUÍA PRÁCTICA"}</p>
            <h2 id="guide-title">{english ? <>A clearer way to explore <em>TAMV.</em></> : <>Una forma clara de explorar <em>TAMV.</em></>}</h2>
          </div>
          <p>{english ? "TAMV is an independent initiative connecting research, technology, and territorial memory. Start with a question, follow the sources, and choose the section that fits what you want to learn." : "TAMV es una iniciativa independiente que conecta investigación, tecnología y memoria territorial. Empieza con una pregunta, sigue las fuentes y elige la sección que te ayude a avanzar."}</p>
        </div>

        <div className="guide-steps">
          {steps.map(({ number, icon: Icon, title, text, href, action }) => (
            <article className="guide-step" key={number}>
              <div className="guide-step-top"><span>{number}</span><Icon aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{text}</p>
              <a href={href}>{action}<ArrowRight aria-hidden="true" /></a>
            </article>
          ))}
        </div>

        <section className="open-science-section" aria-labelledby="open-science-title">
          <div className="open-science-heading">
            <div>
              <p className="eyebrow">{english ? "OPEN SCIENCE PRESENCE" : "PRESENCIA EN COMUNIDADES OPEN SCIENCE"}</p>
              <h3 id="open-science-title">{english ? <>Research that stays <em>open and connected.</em></> : <>Investigación que permanece <em>abierta y conectada.</em></>}</h3>
            </div>
            <p>{english ? "Explore repositories, researcher identifiers, and open-science infrastructures that can help make research outputs discoverable and citable." : "Explora repositorios, identificadores de investigadores e infraestructuras de ciencia abierta que ayudan a descubrir y citar resultados de investigación."}</p>
          </div>
          <div className="open-science-grid">
            {openSciencePlatforms.map((platform) => (
              <a className="open-science-card" href={platform.href} key={platform.name} target="_blank" rel="noopener noreferrer">
                <span className="open-science-card-top"><strong>{platform.name}</strong><span>{platform.category}</span></span>
                <p>{platform.description}</p>
                <span className="open-science-card-action">{platform.action}<ArrowUpRight aria-hidden="true" /></span>
              </a>
            ))}
          </div>
          <p className="open-science-note">{english ? "These links point to public platforms and the existing Zenodo and ORCID records. Their inclusion does not imply formal affiliation, endorsement, or a verified institutional account on each service." : "Estos enlaces dirigen a plataformas públicas y a los registros existentes de Zenodo y ORCID. Su inclusión no implica afiliación formal, respaldo ni una cuenta institucional verificada en cada servicio."}</p>
        </section>

        <div className="guide-benefits">
          <div className="guide-benefits-heading">
            <div><p className="eyebrow">{english ? "WHY USE TAMV" : "¿POR QUÉ USAR TAMV?"}</p><h3>{english ? "Useful by design. Honest about its limits." : "Útil por diseño. Honesto sobre sus límites."}</h3></div>
            <ShieldCheck aria-hidden="true" />
          </div>
          <div className="guide-benefits-grid">
            {benefits.map((benefit, index) => <article key={benefit.title}><span>0{index + 1}</span><div><h4>{benefit.title}</h4><p>{benefit.text}</p></div></article>)}
          </div>
          <p className="guide-source-note">
            {english ? "Background source:" : "Fuente institucional de contexto:"} <a href="https://tamvonline-oficial.odoo.com" target="_blank" rel="noopener noreferrer">TAMV Online Network ↗</a>. {english ? "Statements about RDM Digital Hub, Nodo Cero, offline/edge capabilities, and progress indicators are attributed to that source and have not been independently verified by this site." : "Las afirmaciones sobre RDM Digital Hub, Nodo Cero, capacidades offline/perimetrales e indicadores de avance se atribuyen a esa fuente y no han sido verificadas de forma independiente por este sitio."}
          </p>
        </div>
      </div>
    </section>
  )
}
