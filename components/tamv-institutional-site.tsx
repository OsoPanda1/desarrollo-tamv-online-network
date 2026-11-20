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
import { TamvSiteHeader } from "./tamv-site-header"
import { governancePrinciples, roadmapSteps, researchInventory } from "./tamv-data"

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

export function TamvInstitutionalSite() {
  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <TamvSiteHeader />
      <main id="contenido">
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

        <section className="section ecosystem-section" id="ecosistema">
          <div className="container">
            <div className="section-heading-row ecosystem-heading">
              <div><p className="eyebrow">03 / ECOSISTEMA TAMV</p><h2>Componentes con propósito, <em>madurez explícita.</em></h2></div>
              <p>Explora los proyectos descritos en los materiales de TAMV. Cada ficha separa su propósito de aquello que todavía requiere implementación o verificación externa.</p>
            </div>
            <TamvProjectExplorer />
          </div>
        </section>

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

        <section className="section governance-section" id="gobernanza">
          <div className="container">
            <div className="section-heading-row">
              <div><p className="eyebrow">06 / ÉTICA Y GOBERNANZA</p><h2>La transparencia requiere <em>responsabilidades visibles.</em></h2></div>
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

        <section className="section roadmap-section" id="hoja-de-ruta">
          <div className="container roadmap-layout">
            <div className="roadmap-heading">
              <p className="eyebrow">07 / PRÓXIMOS HORIZONTES</p>
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
            </div>
            <div className="contact-side"><Fingerprint aria-hidden="true" /><span>INICIATIVA<br />INDEPENDIENTE</span></div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-main">
          <a className="footer-brand" href="#inicio" aria-label="TAMV Online Network, volver al inicio"><span className="brand-mark" aria-hidden="true" /><span><strong>TAMV</strong><small>ONLINE NETWORK</small></span></a>
          <p>Investigación · Tecnología · Memoria viva<br />Iniciativa de origen mexicano, con sede territorial en Hidalgo.</p>
          <nav className="footer-links" aria-label="Enlaces institucionales">
            <a href="#ecosistema">Ecosistema</a><a href="#investigacion">Investigación</a><a href="#gobernanza">Gobernanza</a><a href="https://orcid.org/0009-0008-5050-1539" target="_blank" rel="noopener noreferrer">ORCID <ArrowUpRight aria-hidden="true" /></a>
          </nav>
        </div>
        <div className="container footer-bottom"><span>© {new Date().getFullYear()} TAMV Online Network</span><span>Una iniciativa independiente; no implica acreditación ni respaldo de terceros.</span><a href="mailto:anubiscastillo@visitarealdelmonte.online">Contacto <ArrowUpRight aria-hidden="true" /></a></div>
      </footer>
    </>
  )
}
