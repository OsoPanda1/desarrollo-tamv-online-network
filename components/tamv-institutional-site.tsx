import Image from "next/image"
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Compass,
  Fingerprint,
  Globe2,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { TamvProjectExplorer } from "./tamv-project-explorer"
import { TamvResearchTopics } from "./tamv-research-topics"
import { TamvSiteHeader } from "./tamv-site-header"
import { TamvSiteGuide } from "./tamv-site-guide"
import { governancePrinciples, roadmapSteps, researchInventory } from "./tamv-data"
import { getPublicProjects, getPublicResearchTopics } from "@/lib/research/queries"
import type { Locale } from "@/lib/i18n"
import { TamvDonationCTA } from "@/components/shared/tamv-donation-cta"

const workAreas = [
  {
    number: "01",
    icon: Compass,
    title: "Memoria territorial",
    text: "Tecnologías para documentar patrimonio, relatos locales y conocimiento situado con respeto a sus comunidades.",
  },
  {
    number: "02",
    icon: Network,
    title: "Infraestructura digital",
    text: "Sistemas interoperables, identidad, procedencia y versiones documentadas para que el conocimiento pueda perdurar.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Inteligencia artificial",
    text: "Diseños que priorizan propósito, límites de autoridad, supervisión humana y comunicación responsable.",
  },
  {
    number: "04",
    icon: BookOpen,
    title: "Investigación abierta",
    text: "Fuentes, métodos, materiales y resultados conectados mediante referencias consultables y atribución explícita.",
  },
]

const federationAreas = [
  "Identidad y confianza",
  "Conocimiento e investigación",
  "Gobernanza y responsabilidad",
  "Inteligencia artificial",
  "Aprendizaje y academia",
  "Economía y participación",
  "Territorio y comunidad",
]

export async function TamvInstitutionalSite({ locale = "es" }: { locale?: Locale }) {
  const [projects, topics] = await Promise.all([getPublicProjects(), getPublicResearchTopics()])
  if (locale === "en") return <EnglishInstitutionalSite projects={projects} topics={topics} />
  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <TamvSiteHeader locale={locale} />
      <main id="contenido" lang={locale}>
        <section className="hero-section" id="inicio">
          <div className="hero-grain" aria-hidden="true" />
          <div className="container hero-layout">
            <div className="hero-copy">
              <p className="eyebrow eyebrow-light"><span /> Iniciativa mexicana independiente</p>
              <h1>El futuro digital <em>necesita raíces.</em></h1>
              <p className="hero-description">
                TAMV Online Network articula investigación, tecnología y memoria territorial en una visión latinoamericana: crear conocimiento que pueda compartirse, examinarse y perdurar.
              </p>
              <div className="hero-actions">
                <a className="button button-copper" href="#ecosistema">
                  Explorar el ecosistema <ArrowRight aria-hidden="true" />
                </a>
                <a className="button button-outline-light" href="#investigacion">
                  Leer la investigación <ArrowUpRight aria-hidden="true" />
                </a>
                <a className="button button-outline-light" href="#guia">
                  Cómo usar TAMV <BookOpen aria-hidden="true" />
                </a>
                <TamvDonationCTA locale={locale} variant="compact" label="Apoyar TAMV" />
              </div>
              <div className="hero-location">
                <span className="location-dot" aria-hidden="true" />
                <span>ORIGEN TERRITORIAL</span>
                <strong>Real del Monte, Hidalgo, México</strong>
              </div>
            </div>
            <figure className="hero-visual">
              <div className="hero-image-frame">
                <Image
                  src="/tamv-research-editorial.png"
                  alt="Imagen editorial conceptual de una mesa de archivo con un mapa sin rótulos, documentos, cuaderno y brújula."
                  fill
                  priority
                  sizes="(max-width: 760px) 100vw, 42vw"
                />
                <div className="hero-image-overlay">
                  <div className="hero-image-topline"><span>CUADERNO DE CAMPO</span><span>HIDALGO · MÉXICO</span></div>
                  <div className="hero-image-caption">
                    <span>MEMORIA TERRITORIAL / 01</span>
                    <strong>El conocimiento comienza con contexto.</strong>
                  </div>
                </div>
              </div>
              <figcaption className="hero-image-foot"><span>INVESTIGACIÓN CON RAÍCES</span><span>IMAGEN EDITORIAL CONCEPTUAL</span></figcaption>
            </figure>
          </div>
          <a className="hero-scroll" href="#institucion" aria-label="Continuar a la sección institucional"><ArrowDown aria-hidden="true" /></a>
        </section>

        <section className="facts-section" aria-label="Datos del inventario documental">
          <div className="container facts-grid">
            <article><strong>07</strong><span>Federaciones en el modelo de referencia</span></article>
            <article><strong>{researchInventory.platforms}</strong><span>Plataformas incluidas en el inventario comparativo</span></article>
            <article><strong>{researchInventory.capabilities}</strong><span>Capacidades reseñadas en el documento de investigación</span></article>
            <p className="facts-caveat">Cifras del material documental proporcionado; no son métricas de adopción, rendimiento ni validación independiente.</p>
          </div>
        </section>

        <section className="section institutional-section" id="institucion">
          <div className="container institutional-layout">
            <div className="section-rail"><span>01 / IDENTIDAD</span><span className="rail-line" /><span>Una iniciativa en evolución</span></div>
            <div className="institutional-copy">
              <p className="eyebrow">QUIÉNES SOMOS</p>
              <h2>Una infraestructura de conocimiento <em>con vocación humana.</em></h2>
              <div className="institutional-intro-grid">
                <div>
                  <p className="lead-copy">TAMV Online Network es una iniciativa independiente, de origen mexicano, que explora cómo conectar sistemas digitales, investigación, creatividad y memoria de los territorios.</p>
                  <p className="body-copy">Su trabajo se organiza alrededor de documentos, marcos arquitectónicos y proyectos en evolución. La institución busca que cada afirmación pueda enlazarse con una fuente, cada sistema exponga su alcance y cada colaboración preserve la autoría y el contexto.</p>
                </div>
                <figure className="official-logo-card">
                  <div className="official-logo-frame">
                    <Image
                      src="/tamv-official.jpg"
                      alt="Logotipo oficial de TAMV Online Network: emblema hexagonal dorado y azul, nombre TAMV Online y lema institucional."
                      fill
                      sizes="(max-width: 760px) 220px, 240px"
                    />
                  </div>
                  <figcaption><span>IDENTIDAD OFICIAL</span><strong>TAMV Online Network</strong></figcaption>
                </figure>
              </div>
              <div className="mission-grid">
                <article><span>PROPÓSITO</span><h3>Conectar lo que merece perdurar.</h3><p>Hacer más visible y relacionable el conocimiento producido por personas, comunidades y equipos.</p></article>
                <article><span>PRINCIPIO</span><h3>La confianza se construye con evidencia.</h3><p>Distinguir la visión, la documentación, el prototipo y la operación para facilitar un diálogo honesto.</p></article>
              </div>
              <div className="values-line"><span>VALORES</span><b>Dignidad humana</b><b>Interoperabilidad</b><b>Responsabilidad</b><b>Memoria viva</b></div>
            </div>
          </div>
        </section>

        <section className="section work-section" id="lineas-de-trabajo">
          <div className="container">
            <div className="section-heading-row">
              <div><p className="eyebrow">02 / LÍNEAS DE TRABAJO</p><h2>Cuatro perspectivas. <em>Un horizonte compartido.</em></h2></div>
              <p>Una agenda que conecta innovación tecnológica y experiencia humana, desde el contexto regional hasta los desafíos globales.</p>
            </div>
            <div className="work-grid">
              {workAreas.map(({ number, icon: Icon, title, text }) => (
                <article className="work-card" key={number}>
                  <div className="work-card-top"><span>{number}</span><Icon aria-hidden="true" /></div>
                  <h3>{title}</h3><p>{text}</p>
                  <span className="work-card-rule" aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </section>
        <div className="container institutional-support-slot"><TamvDonationCTA locale={locale} variant="compact" label="Apoyar las líneas de trabajo" /></div>

        <section className="section ecosystem-section" id="ecosistema">
          <div className="container">
            <div className="section-heading-row ecosystem-heading">
              <div><p className="eyebrow">03 / ECOSISTEMA TAMV</p><h2>Componentes con propósito, <em>madurez explícita.</em></h2></div>
              <p>Explora los proyectos descritos en los materiales de TAMV. Cada ficha separa su propósito de aquello que todavía requiere implementación o verificación externa.</p>
            </div>
            <TamvProjectExplorer projects={projects} locale={locale} />
          </div>
        </section>
        <div className="container institutional-support-slot"><TamvDonationCTA locale={locale} variant="compact" label="Apoyar el ecosistema" /></div>

        <TamvSiteGuide locale={locale} />

        <section className="section architecture-section" id="arquitectura">
          <div className="container architecture-layout">
            <div className="architecture-intro">
              <p className="eyebrow eyebrow-light">04 / ARQUITECTURA DE REFERENCIA</p>
              <h2>Federar capacidades. <em>Conservar contexto.</em></h2>
              <p>La arquitectura heptafederada se presenta como un modelo para interconectar ámbitos autónomos. Los nombres siguientes organizan la visión editorial de esta página; no sustituyen una especificación técnica canónica.</p>
              <a className="button button-outline-light" href="#gobernanza">Principios de gobernanza <ArrowRight aria-hidden="true" /></a>
            </div>
            <div className="federation-panel">
              <div className="federation-panel-header"><span>ÁMBITOS DEL MODELO</span><span>7 / FEDERACIONES</span></div>
              <div className="federation-list">
                {federationAreas.map((area, index) => (
                  <div className="federation-item" key={area}><span>0{index + 1}</span><strong>{area}</strong><span className="federation-status">Enmarcado</span></div>
                ))}
              </div>
              <p className="federation-note">Esquema de referencia basado en la documentación adjunta. La delimitación operativa requiere validación y gobernanza pública.</p>
            </div>
          </div>
        </section>
        <div className="container institutional-support-slot"><TamvDonationCTA locale={locale} variant="compact" label="Sostener la infraestructura abierta" /></div>

        <section className="section research-section" id="investigacion">
          <div className="container research-layout">
            <div>
              <p className="eyebrow">05 / INVESTIGACIÓN Y CONOCIMIENTO ABIERTO</p>
              <h2>Investigar también es <em>mostrar los límites.</em></h2>
              <p className="lead-copy">El inventario comparativo anexo reúne referentes de investigación, desarrollo, gobernanza y publicación científica para identificar capacidades que podrían orientar el diseño de TAMV.</p>
              <p className="body-copy">No es un ranking mundial certificado ni una auditoría independiente de cada plataforma. Cada característica debe contrastarse con documentación oficial, licencias, fecha de verificación y condiciones de acceso antes de convertirse en requisito.</p>
              <a className="inline-link" href="https://doi.org/10.5281/zenodo.19436662" target="_blank" rel="noopener noreferrer">
                Consultar registro documental en Zenodo <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
            <aside className="research-card">
              <div className="research-card-label"><BookOpen aria-hidden="true" /> CUADERNO DE REFERENCIA</div>
              <strong>{researchInventory.platforms}<span>+</span></strong>
              <h3>plataformas observadas</h3>
              <div className="research-divider" />
              <div className="research-metadata"><span>CAPACIDADES INVENTARIADAS</span><b>{researchInventory.capabilities}</b></div>
              <div className="research-metadata"><span>AGRUPACIONES TEMÁTICAS</span><b>{researchInventory.categories}</b></div>
              <p>Inventario de trabajo proporcionado para orientar una futura verificación sistemática.</p>
            </aside>
          </div>
        </section>
        <div className="container institutional-support-slot"><TamvDonationCTA locale={locale} variant="compact" label="Apoyar la investigación abierta" /></div>

        <TamvResearchTopics topics={topics} locale={locale} />

        <section className="section governance-section" id="gobernanza">
          <div className="container">
            <div className="section-heading-row">
              <div><p className="eyebrow">07 / ÉTICA Y GOBERNANZA</p><h2>La transparencia requiere <em>responsabilidades visibles.</em></h2></div>
              <p>La ambición tecnológica necesita contrapesos, fuentes consultables y mecanismos de corrección. Estas prácticas son criterios de diseño y trabajo, no un sello de certificación.</p>
            </div>
            <div className="governance-grid">
              {governancePrinciples.map((principle) => (
                <article className="governance-card" key={principle.number}>
                  <span className="governance-number">{principle.number}</span>
                  <Check aria-hidden="true" />
                  <h3>{principle.title}</h3>
                  <p>{principle.text}</p>
                </article>
              ))}
            </div>
            <div className="governance-notice"><ShieldCheck aria-hidden="true" /><p>Los registros, DOI y perfiles públicos facilitan la atribución; por sí solos no demuestran revisión por pares, acreditación, seguridad, impacto ni reconocimiento institucional externo.</p></div>
          </div>
        </section>
        <div className="container institutional-support-slot"><TamvDonationCTA locale={locale} variant="compact" label="Apoyar la gobernanza responsable" /></div>

        <section className="section roadmap-section" id="hoja-de-ruta">
          <div className="container roadmap-layout">
            <div className="roadmap-heading">
              <p className="eyebrow">08 / PRÓXIMOS HORIZONTES</p>
              <h2>Crecer al ritmo de <em>la evidencia.</em></h2>
              <p>Una hoja de ruta propuesta para convertir documentación y visión en capacidades evaluables y colaborativas.</p>
            </div>
            <div className="roadmap-list">
              {roadmapSteps.map((step) => (
                <article className="roadmap-step" key={step.phase}>
                  <span className="roadmap-phase">{step.phase}</span>
                  <div><h3>{step.title}</h3><p>{step.text}</p></div>
                  <span className="roadmap-arrow" aria-hidden="true"><ArrowRight /></span>
                </article>
              ))}
              <p className="roadmap-disclaimer">Secuencia orientativa; no constituye calendario comprometido ni prueba de ejecución.</p>
            </div>
          </div>
        </section>
        <div className="container institutional-support-slot"><TamvDonationCTA locale={locale} variant="compact" label="Apoyar la continuidad del proyecto" /></div>

        <section className="section builders-section" id="desarrolladores" aria-labelledby="builders-title">
          <div className="container">
            <div className="section-heading-row">
              <div><p className="eyebrow">09 / DESARROLLO ABIERTO</p><h2 id="builders-title">Del descubrimiento a <em>la primera contribución.</em></h2></div>
              <p>Una ruta de entrada práctica para desarrolladores, investigadores y comunidades: entender un dato público, explorar el campo HCU y proponer una mejora que pueda revisarse y reproducirse.</p>
            </div>
            <div className="builders-grid">
              <article className="builders-card">
                <div className="builders-card-top"><span>01 / EXPLORAR</span><Network aria-hidden="true" /></div>
                <h3>Comprende el grafo HCU</h3>
                <p>Inspecciona dominios, relaciones y parámetros declarados en una visualización 3D. La geometría es exploratoria, no una prueba de causalidad.</p>
                <a href="/hcu">Abrir observatorio HCU <ArrowUpRight aria-hidden="true" /></a>
              </article>
              <article className="builders-card">
                <div className="builders-card-top"><span>02 / REUTILIZAR</span><BookOpen aria-hidden="true" /></div>
                <h3>Prueba contratos públicos</h3>
                <p>Consulta el catálogo interoperable o descarga metadatos en CSV. Comprueba la procedencia y la licencia de cada registro antes de reutilizarlo.</p>
                <div className="builders-card-links"><a href="/api/v1/exports/research">JSON-LD <ArrowUpRight aria-hidden="true" /></a><a href="/api/v1/exports/research?format=csv">CSV <ArrowUpRight aria-hidden="true" /></a></div>
              </article>
              <article className="builders-card">
                <div className="builders-card-top"><span>03 / CONTRIBUIR</span><ShieldCheck aria-hidden="true" /></div>
                <h3>Empieza con un cambio acotado</h3>
                <p>Documentación, pruebas, accesibilidad, traducción y trazabilidad son buenas puertas de entrada para mejorar una parte sin aceptar todo el ecosistema.</p>
                <a href="https://github.com/OsoPanda1/desarrollo-tamv-online-network/issues" target="_blank" rel="noopener noreferrer">Explorar incidencias <ArrowUpRight aria-hidden="true" /></a>
              </article>
            </div>
            <div className="builders-actions">
              <a className="button button-copper" href="/desarrolladores">Abrir guía de desarrolladores <ArrowRight aria-hidden="true" /></a>
              <a className="button button-outline-dark" href="https://github.com/OsoPanda1/desarrollo-tamv-online-network" target="_blank" rel="noopener noreferrer">Ver código fuente <ArrowUpRight aria-hidden="true" /></a>
            </div>
            <p className="builders-caveat">El repositorio no garantiza que cada módulo esté desplegado ni que toda propuesta sea aceptada. Las contribuciones se evalúan por alcance, evidencia, pruebas, licencia y capacidad real de mantenimiento.</p>
          </div>
        </section>

        <section className="section contact-section" id="contacto">
          <div className="container contact-panel">
            <div className="contact-emblem"><span className="brand-mark contact-brand-emblem" aria-hidden="true" /><span>HIDALGO<br />MÉXICO</span></div>
            <div className="contact-copy">
              <p className="eyebrow eyebrow-light">COLABORACIÓN INSTITUCIONAL</p>
              <h2>El conocimiento crece <em>cuando se comparte.</em></h2>
              <p>Para investigación, alianzas, prensa o colaboración técnica, inicia una conversación con el equipo de TAMV.</p>
              <a className="button button-copper" href="mailto:anubiscastillo@visitarealdelmonte.online?subject=Colaboraci%C3%B3n%20con%20TAMV%20Online%20Network">
                Contacto institucional <ArrowUpRight aria-hidden="true" />
              </a>
              <div className="contact-support-action"><TamvDonationCTA locale={locale} variant="compact" label="Contribuir a TAMV" /></div>
            </div>
            <div className="contact-side"><Fingerprint aria-hidden="true" /><span>INICIATIVA<br />INDEPENDIENTE</span></div>
          </div>
        </section>
      </main>

      <footer className="site-footer" lang={locale}>
        <div className="container footer-main">
          <a className="footer-brand" href="#inicio" aria-label="TAMV Online Network, volver al inicio"><span className="brand-mark" aria-hidden="true" /><span><strong>TAMV</strong><small>ONLINE NETWORK</small></span></a>
          <p>Investigación · Tecnología · Memoria viva<br />Iniciativa de origen mexicano, con sede territorial en Hidalgo.</p>
          <div className="ai-lounge-profile" aria-label="Perfil de TAMV Online en AI Lounge"><span className="ai-lounge-label">PRESENCIA EN COMUNIDADES DE IA</span><a href="https://lounge.ai/@tamvonline" target="_blank" rel="noopener noreferrer" aria-label="Visitar el perfil de TAMV Online en AI Lounge"><img src="https://lounge.ai/api/badge/tamvonline" alt="Edwin Oswaldo Castillo Trejo en AI Lounge" height="28" loading="lazy" decoding="async" /></a></div>
          <nav className="footer-links" aria-label="Enlaces institucionales">
            <a href="#ecosistema">Ecosistema</a><a href="#investigacion">Investigación</a><a href="#temas">Temas</a><a href="#gobernanza">Gobernanza</a><a href="https://orcid.org/0009-0008-5050-1539" target="_blank" rel="noopener noreferrer">ORCID <ArrowUpRight aria-hidden="true" /></a>
          </nav>
          <div className="footer-support"><TamvDonationCTA locale={locale} variant="compact" label="Apoyar TAMV" /></div>
        </div>
        <div className="container footer-bottom"><span>© {new Date().getFullYear()} TAMV Online Network</span><span>Una iniciativa independiente; no implica acreditación ni respaldo de terceros.</span><a href="mailto:anubiscastillo@visitarealdelmonte.online">Contacto <ArrowUpRight aria-hidden="true" /></a></div>
      </footer>
    </>
  )
}

function EnglishInstitutionalSite({ projects, topics }: { projects: Awaited<ReturnType<typeof getPublicProjects>>; topics: Awaited<ReturnType<typeof getPublicResearchTopics>> }) {
  const workAreas = [
    { number: "01", icon: Compass, title: "Territorial memory", text: "Documenting local heritage, community narratives, and situated knowledge with respect for the people who hold it." },
    { number: "02", icon: Network, title: "Digital infrastructure", text: "Interoperable systems, identity, provenance, and documented versions that help knowledge endure." },
    { number: "03", icon: Sparkles, title: "Artificial intelligence", text: "Designs that prioritize purpose, bounded authority, human oversight, and responsible communication." },
    { number: "04", icon: BookOpen, title: "Open research", text: "Connecting sources, methods, materials, and results through citations and explicit attribution." },
  ]
  const federations = ["Identity and trust", "Knowledge and research", "Governance and accountability", "Artificial intelligence", "Learning and academia", "Economy and participation", "Place and community"]

  return <>
    <a className="skip-link" href="#contenido">Skip to content</a>
    <TamvSiteHeader locale="en" />
    <main id="contenido" lang="en">
      <section className="hero-section" id="inicio">
        <div className="hero-grain" aria-hidden="true" />
        <div className="container hero-layout">
          <div className="hero-copy">
            <p className="eyebrow eyebrow-light"><span /> Independent Mexican initiative</p>
            <h1>Digital futures <em>need roots.</em></h1>
            <p className="hero-description">TAMV Online Network connects research, technology, and territorial memory through a Latin American perspective: creating knowledge that can be shared, examined, and sustained.</p>
            <div className="hero-actions"><a className="button button-copper" href="#ecosistema">Explore the ecosystem <ArrowRight aria-hidden="true" /></a><a className="button button-outline-light" href="#investigacion">Explore research <ArrowUpRight aria-hidden="true" /></a><a className="button button-outline-light" href="#guia">How to use TAMV <BookOpen aria-hidden="true" /></a><TamvDonationCTA locale="en" variant="compact" label="Support TAMV" /></div>
            <div className="hero-location"><span className="location-dot" aria-hidden="true" /><span>PLACE OF ORIGIN</span><strong>Real del Monte, Hidalgo, Mexico</strong></div>
          </div>
          <figure className="hero-visual"><div className="hero-image-frame"><Image src="/tamv-research-editorial.png" alt="Conceptual editorial image of an archival desk with a map, documents, notebook, and compass." fill priority sizes="(max-width: 760px) 100vw, 42vw" /><div className="hero-image-overlay"><div className="hero-image-topline"><span>FIELD NOTEBOOK</span><span>HIDALGO · MEXICO</span></div><div className="hero-image-caption"><span>TERRITORIAL MEMORY / 01</span><strong>Knowledge begins with context.</strong></div></div></div><figcaption className="hero-image-foot"><span>ROOTED RESEARCH</span><span>CONCEPTUAL EDITORIAL IMAGE</span></figcaption></figure>
        </div>
        <a className="hero-scroll" href="#institucion" aria-label="Continue to the institutional overview"><ArrowDown aria-hidden="true" /></a>
      </section>

      <section className="facts-section" aria-label="Documentary inventory figures"><div className="container facts-grid"><article><strong>07</strong><span>Federations in the reference model</span></article><article><strong>{researchInventory.platforms}</strong><span>Platforms included in the comparative inventory</span></article><article><strong>{researchInventory.capabilities}</strong><span>Capabilities summarized in the research document</span></article><p className="facts-caveat">Figures come from the supplied documentary material; they are not adoption, performance, or independent validation metrics.</p></div></section>

      <section className="section institutional-section" id="institucion"><div className="container institutional-layout"><div className="section-rail"><span>01 / IDENTITY</span><span className="rail-line" /><span>An initiative in development</span></div><div className="institutional-copy"><p className="eyebrow">WHO WE ARE</p><h2>A knowledge infrastructure <em>with a human purpose.</em></h2><div className="institutional-intro-grid"><div><p className="lead-copy">TAMV Online Network is an independent initiative originating in Mexico. It explores how digital systems, research, creativity, and territorial memory can connect.</p><p className="body-copy">Its work is organized around documents, architectural frameworks, and evolving projects. The goal is to link claims to sources, make system boundaries visible, and preserve authorship and context in every collaboration.</p></div><figure className="official-logo-card"><div className="official-logo-frame"><Image src="/tamv-official.jpg" alt="TAMV Online Network official logo." fill sizes="(max-width: 760px) 220px, 240px" /></div><figcaption><span>INSTITUTIONAL IDENTITY</span><strong>TAMV Online Network</strong></figcaption></figure></div><div className="mission-grid"><article><span>PURPOSE</span><h3>Connect what deserves to endure.</h3><p>Make knowledge produced by people, communities, and teams more visible and discoverable.</p></article><article><span>PRINCIPLE</span><h3>Trust is built with evidence.</h3><p>Distinguish vision, documentation, prototypes, and operations to support honest dialogue.</p></article></div><div className="values-line"><span>VALUES</span><b>Human dignity</b><b>Interoperability</b><b>Accountability</b><b>Living memory</b></div></div></div></section>

      <section className="section work-section" id="lineas-de-trabajo"><div className="container"><div className="section-heading-row"><div><p className="eyebrow">02 / AREAS OF WORK</p><h2>Four perspectives. <em>One shared horizon.</em></h2></div><p>An agenda connecting technological innovation and human experience, from regional contexts to global challenges.</p></div><div className="work-grid">{workAreas.map(({ number, icon: Icon, title, text }) => <article className="work-card" key={number}><div className="work-card-top"><span>{number}</span><Icon aria-hidden="true" /></div><h3>{title}</h3><p>{text}</p><span className="work-card-rule" aria-hidden="true" /></article>)}</div></div></section>
      <div className="container institutional-support-slot"><TamvDonationCTA locale="en" variant="compact" label="Support the areas of work" /></div>

      <section className="section ecosystem-section" id="ecosistema"><div className="container"><div className="section-heading-row ecosystem-heading"><div><p className="eyebrow">03 / TAMV ECOSYSTEM</p><h2>Purposeful components, <em>explicit maturity.</em></h2></div><p>Explore projects described in TAMV materials. Each record separates stated purpose from work that still needs implementation or external verification.</p></div><TamvProjectExplorer projects={projects} locale="en" /></div></section>
      <div className="container institutional-support-slot"><TamvDonationCTA locale="en" variant="compact" label="Support the TAMV ecosystem" /></div>

      <section className="section architecture-section" id="arquitectura"><div className="container architecture-layout"><div className="architecture-intro"><p className="eyebrow eyebrow-light">04 / REFERENCE ARCHITECTURE</p><h2>Federate capabilities. <em>Preserve context.</em></h2><p>The heptafederated architecture is presented as a model for connecting autonomous domains. The labels below organize this editorial overview; they are not a canonical technical specification.</p><a className="button button-outline-light" href="/gobernanza?lang=en">Governance principles <ArrowRight aria-hidden="true" /></a></div><div className="federation-panel"><div className="federation-panel-header"><span>MODEL DOMAINS</span><span>7 / FEDERATIONS</span></div><div className="federation-list">{federations.map((area, index) => <div className="federation-item" key={area}><span>0{index + 1}</span><strong>{area}</strong><span className="federation-status">Framed</span></div>)}</div><p className="federation-note">Reference outline based on the supplied documents. Operational boundaries require validation and public governance.</p></div></div></section>
      <div className="container institutional-support-slot"><TamvDonationCTA locale="en" variant="compact" label="Sustain open infrastructure" /></div>

      <section className="section research-section" id="investigacion"><div className="container research-layout"><div><p className="eyebrow">05 / OPEN RESEARCH AND KNOWLEDGE</p><h2>Research also means <em>showing its limits.</em></h2><p className="lead-copy">The attached comparative inventory brings together research, development, governance, and scholarly publishing references to inform future TAMV design.</p><p className="body-copy">It is not a certified global ranking or an independent audit of each platform. Before becoming a requirement, every capability should be checked against official documentation, licensing, verification dates, and access conditions.</p><a className="inline-link" href="https://doi.org/10.5281/zenodo.19436662" target="_blank" rel="noopener noreferrer">View the documentary record on Zenodo <ArrowUpRight aria-hidden="true" /></a></div><aside className="research-card"><div className="research-card-label"><BookOpen aria-hidden="true" /> REFERENCE NOTEBOOK</div><strong>{researchInventory.platforms}<span>+</span></strong><h3>platforms reviewed</h3><div className="research-divider" /><div className="research-metadata"><span>INVENTORIED CAPABILITIES</span><b>{researchInventory.capabilities}</b></div><div className="research-metadata"><span>THEMATIC GROUPS</span><b>{researchInventory.categories}</b></div><p>Working inventory supplied to guide systematic verification.</p></aside></div></section>
      <div className="container institutional-support-slot"><TamvDonationCTA locale="en" variant="compact" label="Support open research" /></div>

            <TamvResearchTopics topics={topics} locale="en" />
      <TamvSiteGuide locale="en" />

      <section className="section governance-section" id="gobernanza"><div className="container"><div className="section-heading-row"><div><p className="eyebrow">07 / ETHICS AND GOVERNANCE</p><h2>Transparency requires <em>visible accountability.</em></h2></div><p>Technological ambition needs checks and balances, traceable sources, and ways to correct mistakes. These are design and working principles, not a certification label.</p></div><div className="governance-grid">{governancePrinciples.map((principle) => <article className="governance-card" key={principle.number}><span className="governance-number">{principle.number}</span><Check aria-hidden="true" /><h3>{principle.titleEn}</h3><p>{principle.textEn}</p></article>)}</div><div className="governance-notice"><ShieldCheck aria-hidden="true" /><p>Records, DOIs, and public profiles support attribution. By themselves they do not establish peer review, accreditation, security, impact, or external institutional recognition.</p></div></div></section>
      <div className="container institutional-support-slot"><TamvDonationCTA locale="en" variant="compact" label="Support responsible governance" /></div>

      <section className="section roadmap-section" id="hoja-de-ruta"><div className="container roadmap-layout"><div className="roadmap-heading"><p className="eyebrow">08 / NEXT HORIZONS</p><h2>Grow at the pace of <em>evidence.</em></h2><p>A proposed path for turning documentation and vision into capabilities that can be evaluated and shared.</p></div><div className="roadmap-list">{roadmapSteps.map((step) => <article className="roadmap-step" key={step.phase}><span className="roadmap-phase">{step.phase}</span><div><h3>{step.titleEn}</h3><p>{step.textEn}</p></div><span className="roadmap-arrow" aria-hidden="true"><ArrowRight /></span></article>)}<p className="roadmap-disclaimer">Suggested sequence; not a committed schedule or evidence of execution.</p></div></div></section>
      <div className="container institutional-support-slot"><TamvDonationCTA locale="en" variant="compact" label="Support project continuity" /></div>

      <section className="section builders-section" id="desarrolladores" aria-labelledby="builders-title">
        <div className="container">
          <div className="section-heading-row">
            <div><p className="eyebrow">09 / OPEN DEVELOPMENT</p><h2 id="builders-title">From discovery to <em>a first contribution.</em></h2></div>
            <p>A practical entry path for developers, researchers and communities: inspect public data, explore HCU, then propose a change that can be reviewed and reproduced.</p>
          </div>
          <div className="builders-grid">
            <article className="builders-card">
              <div className="builders-card-top"><span>01 / EXPLORE</span><Network aria-hidden="true" /></div>
              <h3>Understand the HCU graph</h3>
              <p>Inspect domains, relationships and declared parameters in a 3D visualization. Its geometry is exploratory, not proof of causality.</p>
              <a href="/hcu?lang=en">Open HCU observatory <ArrowUpRight aria-hidden="true" /></a>
            </article>
            <article className="builders-card">
              <div className="builders-card-top"><span>02 / REUSE</span><BookOpen aria-hidden="true" /></div>
              <h3>Try public contracts</h3>
              <p>Read the interoperable catalog or download CSV metadata. Check provenance and each record's license before reuse.</p>
              <div className="builders-card-links"><a href="/api/v1/exports/research">JSON-LD <ArrowUpRight aria-hidden="true" /></a><a href="/api/v1/exports/research?format=csv">CSV <ArrowUpRight aria-hidden="true" /></a></div>
            </article>
            <article className="builders-card">
              <div className="builders-card-top"><span>03 / CONTRIBUTE</span><ShieldCheck aria-hidden="true" /></div>
              <h3>Start with a focused change</h3>
              <p>Documentation, tests, accessibility, translation and provenance are useful ways to improve one part without adopting the entire ecosystem.</p>
              <a href="https://github.com/OsoPanda1/desarrollo-tamv-online-network/issues" target="_blank" rel="noopener noreferrer">Browse issues <ArrowUpRight aria-hidden="true" /></a>
            </article>
          </div>
          <div className="builders-actions">
            <a className="button button-copper" href="/desarrolladores?lang=en">Open developer guide <ArrowRight aria-hidden="true" /></a>
            <a className="button button-outline-dark" href="https://github.com/OsoPanda1/desarrollo-tamv-online-network" target="_blank" rel="noopener noreferrer">View source code <ArrowUpRight aria-hidden="true" /></a>
          </div>
          <p className="builders-caveat">The repository does not guarantee every module is deployed or every proposal accepted. Contributions are evaluated on scope, evidence, tests, licensing and actual maintenance capacity.</p>
        </div>
      </section>

      <section className="section contact-section" id="contacto"><div className="container contact-panel"><div className="contact-emblem"><span className="brand-mark contact-brand-emblem" aria-hidden="true" /><span>HIDALGO<br />MEXICO</span></div><div className="contact-copy"><p className="eyebrow eyebrow-light">INSTITUTIONAL COLLABORATION</p><h2>Knowledge grows <em>when it is shared.</em></h2><p>For research, partnerships, press, or technical collaboration, start a conversation with the TAMV team.</p><a className="button button-copper" href="mailto:anubiscastillo@visitarealdelmonte.online?subject=TAMV%20Online%20Network%20collaboration">Institutional contact <ArrowUpRight aria-hidden="true" /></a><div className="contact-support-action"><TamvDonationCTA locale="en" variant="compact" label="Contribute to TAMV" /></div></div><div className="contact-side"><Fingerprint aria-hidden="true" /><span>INDEPENDENT<br />INITIATIVE</span></div></div></section>
    </main>
    <footer className="site-footer" lang="en"><div className="container footer-main"><a className="footer-brand" href="/?lang=en#inicio" aria-label="TAMV Online Network, back to top"><span className="brand-mark" aria-hidden="true" /><span><strong>TAMV</strong><small>ONLINE NETWORK</small></span></a><p>Research · Technology · Living memory<br />An independent initiative originating in Hidalgo, Mexico.</p><div className="ai-lounge-profile" aria-label="TAMV Online on AI Lounge"><span className="ai-lounge-label">AI COMMUNITY PRESENCE</span><a href="https://lounge.ai/@tamvonline" target="_blank" rel="noopener noreferrer" aria-label="Visit TAMV Online on AI Lounge"><img src="https://lounge.ai/api/badge/tamvonline" alt="Edwin Oswaldo Castillo Trejo on AI Lounge" height="28" loading="lazy" decoding="async" /></a></div><nav className="footer-links" aria-label="Institutional links"><a href="/proyectos?lang=en">Projects</a><a href="/investigacion?lang=en">Research</a><a href="/hcu?lang=en">HCU</a><a href="/fuentes?lang=en">Sources</a><a href="/gobernanza?lang=en">Governance</a><a href="https://orcid.org/0009-0008-5050-1539" target="_blank" rel="noopener noreferrer">ORCID <ArrowUpRight aria-hidden="true" /></a></nav><div className="footer-support"><TamvDonationCTA locale="en" variant="compact" label="Support TAMV" /></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} TAMV Online Network</span><span>An independent initiative; no accreditation or third-party endorsement is implied.</span><a href="mailto:anubiscastillo@visitarealdelmonte.online">Contact <ArrowUpRight aria-hidden="true" /></a></div></footer>
  </>
}
