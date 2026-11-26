import type { Metadata } from "next"
import Link from "next/link"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { TamvSectionMedia } from "@/components/tamv-section-media"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { localizedPath, resolveLocale, type Locale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const locale = resolveLocale((await searchParams).lang)
  return locale === "en"
    ? {
        title: "Who we are | TAMV Online Network",
        description: "TAMV's mission, vision, founding identity, cooperation protocol, governance boundaries and community protection commitments.",
        openGraph: { locale: "en_US", title: "Who we are | TAMV Online Network" },
      }
    : {
        title: "Quiénes somos | TAMV Online Network",
        description: "Misión, visión, origen fundacional, protocolo de cooperación, límites de gobernanza y compromisos de protección de TAMV.",
        openGraph: { locale: "es_MX", title: "Quiénes somos | TAMV Online Network" },
      }
}

type Pair = { es: string; en: string }
const text = (locale: Locale, pair: Pair) => locale === "en" ? pair.en : pair.es

export default async function WhoWeArePage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"

  const principles: { n: string; title: Pair; body: Pair }[] = [
    { n: "01", title: { es: "Territorio antes que espectáculo", en: "Territory before spectacle" }, body: { es: "La tecnología debe producir capacidad útil en las comunidades que la inspiran. La procedencia local es una responsabilidad, no un adorno publicitario.", en: "Technology should produce useful capacity for the communities that inspire it. Local origin is a responsibility, not marketing decoration." } },
    { n: "02", title: { es: "Evidencia antes que afirmación", en: "Evidence before assertion" }, body: { es: "Separamos lo declarado, especificado, implementado, probado, desplegado y revisado externamente. Una ficha o un hash no demuestra por sí solo que una afirmación sea verdadera.", en: "We separate declared, specified, implemented, tested, deployed and independently reviewed states. A catalog entry or hash alone does not prove that a claim is true." } },
    { n: "03", title: { es: "La autoridad tiene límites", en: "Authority has boundaries" }, body: { es: "Isabella y los routers de intención pueden orientar y proponer. Las acciones privilegiadas necesitan autorización del servidor, política aplicable y una vía de supervisión humana.", en: "Isabella and intent routers may guide and recommend. Privileged actions need server-side authorization, applicable policy and a human oversight path." } },
    { n: "04", title: { es: "Apertura responsable", en: "Responsible openness" }, body: { es: "El conocimiento se publica cuando hay derechos y condiciones adecuadas. La privacidad, la seguridad y los protocolos culturales comunitarios pueden exigir acceso limitado.", en: "Knowledge is published when rights and conditions permit. Privacy, safety and community cultural protocols can require restricted access." } },
    { n: "05", title: { es: "Interoperabilidad por contrato", en: "Interoperability by contract" }, body: { es: "Compartir nombre o enlazar dos dominios no crea integración de datos ni identidad. Cada puente requiere contratos, autorización local, procedencia, idempotencia, reconciliación y pruebas.", en: "Sharing a name or linking domains does not create data or identity integration. Each bridge needs contracts, local authorization, provenance, idempotency, reconciliation and tests." } },
    { n: "06", title: { es: "Mejora basada en evidencia", en: "Evidence-driven improvement" }, body: { es: "Una falla repetida debe terminar en análisis de causa raíz, una corrección verificable y una prueba de regresión, no en capas indefinidas de parches.", en: "A repeated failure should lead to root-cause analysis, a verifiable correction and a regression test—not indefinite layers of patches." } },
    { n: "07", title: { es: "Sostenibilidad transparente", en: "Transparent sustainability" }, body: { es: "Las cuotas no se presentan como inversión, empleo, acreditación ni financiamiento garantizado. Los destinos de ingresos son propuestas hasta que existan decisiones y reportes financieros verificables.", en: "Membership fees are not presented as investment, employment, accreditation or guaranteed funding. Revenue destinations remain proposals until verified decisions and financial reports exist." } },
  ]

  return (
    <TamvAppShell locale={locale}>
      <div className="tamv-charter-page">
        <section className="tamv-charter-hero">
          <div className="container tamv-charter-hero-grid">
            <div className="tamv-charter-hero-copy">
              <p className="tamv-charter-eyebrow"><span>CANON / 01</span> {english ? "FOUNDATION & PURPOSE" : "FUNDAMENTO Y PROPÓSITO"}</p>
              <h1>{english ? <>Technology with <em>territory.</em><br />Infrastructure with <em>memory.</em></> : <>Tecnología con <em>territorio.</em><br />Infraestructura con <em>memoria.</em></>}</h1>
              <p className="tamv-charter-lead">{english ? "TAMV is an independent Mexican initiative connecting research, software, digital communities and living territorial memory. Its ambition is measured by useful capability, transparent evidence and the autonomy it helps build." : "TAMV es una iniciativa mexicana independiente que conecta investigación, software, comunidades digitales y memoria territorial viva. Su ambición se mide por la capacidad útil, la evidencia transparente y la autonomía que ayuda a construir."}</p>
              <div className="tamv-charter-actions">
                <Link className="tamv-charter-primary" href={localizedPath("/unete", locale)}>{english ? "Find your way to contribute" : "Encuentra tu forma de contribuir"} <span>↗</span></Link>
                <LanguageSwitch pathname="/quienes-somos" locale={locale} />
              </div>
            </div>
            <aside className="tamv-charter-seal" aria-label={english ? "Founding references" : "Referencias fundacionales"}>
              <div className="tamv-charter-seal-index">TAMV / ORIGIN RECORD</div>
              <div className="tamv-charter-seal-mark">T<span>A</span>MV</div>
              <div className="tamv-charter-seal-line" />
              <p>{english ? "FOUNDING SIGNATURE" : "FIRMA FUNDACIONAL"}</p>
              <strong>Edwin Oswaldo<br />Castillo Trejo</strong>
              <span>Anubis Villaseñor</span>
              <div className="tamv-charter-seal-meta">
                <span>ORCID <a href="https://orcid.org/0009-0008-5050-1539" target="_blank" rel="noopener noreferrer">0009-0008-5050-1539</a></span>
                <span>ISNI <a href="https://isni.org/isni/0000000531699229" target="_blank" rel="noopener noreferrer">0000000531699229</a></span>
                <span>{english ? "ORIGIN" : "ORIGEN"} <b>Mineral del Monte · Hidalgo · México</b></span>
              </div>
            </aside>
          </div>
          <div className="container tamv-charter-banner">
            <span>TECNOLOGÍA AVANZADA MEXICANA VERSÁTIL</span>
            <span aria-hidden="true">/</span>
            <span>TERRITORIO AUTÓNOMO DE MEMORIA VIVA</span>
            <span aria-hidden="true">/</span>
            <span>{english ? "LATIN AMERICA · OPEN FUTURES" : "LATINOAMÉRICA · FUTUROS ABIERTOS"}</span>
          </div>
        </section>

        <section className="tamv-charter-section">
          <div className="container tamv-charter-mission-grid">
            <div className="tamv-charter-section-intro">
              <p className="tamv-charter-eyebrow"><span>01</span> {english ? "WHY TAMV EXISTS" : "POR QUÉ EXISTE TAMV"}</p>
              <h2>{english ? <>The future is not declared.<br />It is <em>constructed.</em></> : <>El futuro no se proclama.<br />Se <em>construye.</em></>}</h2>
              <p>{english ? "Our mission is to turn knowledge, technology and territorial identity into tools that can be examined, maintained and used by the people they serve." : "Nuestra misión es convertir conocimiento, tecnología e identidad territorial en herramientas examinables, mantenibles y útiles para las personas a las que sirven."}</p>
            </div>
            <div className="tamv-charter-mission-cards">
              <article><span>MISSION / MISIÓN</span><h3>{english ? "Strengthen local capability." : "Fortalecer capacidades locales."}</h3><p>{english ? "Create accessible, traceable and cooperative tools that preserve living memory, support responsible research and connect builders across Latin America." : "Crear herramientas accesibles, trazables y cooperativas que preserven la memoria viva, apoyen la investigación responsable y conecten constructores de Latinoamérica."}</p></article>
              <article><span>VISION / VISIÓN</span><h3>{english ? "A sovereign, interoperable digital network." : "Una red digital soberana e interoperable."}</h3><p>{english ? "An ecosystem in which people can discover knowledge, collaborate on technology and inspect the evidence behind operational claims—without substituting promises for proof." : "Un ecosistema en el que las personas descubran conocimiento, colaboren en tecnología e inspeccionen la evidencia detrás de afirmaciones operativas, sin sustituir pruebas por promesas."}</p></article>
            </div>
          </div>
        </section>

        <section className="tamv-charter-section tamv-charter-principles">
          <div className="container">
            <div className="tamv-charter-heading">
              <div><p className="tamv-charter-eyebrow"><span>02</span> {english ? "OPERATING PHILOSOPHY" : "FILOSOFÍA OPERATIVA"}</p><h2>{english ? <>Seven principles.<br /><em>One accountable system.</em></> : <>Siete principios.<br /><em>Un sistema responsable.</em></>}</h2></div>
              <p>{english ? "These principles are operating rules to implement and test—not claims that every future capability is already active." : "Son reglas operativas que deben implementarse y probarse; no afirman que todas las capacidades futuras ya estén activas."}</p>
            </div>
            <div className="tamv-charter-principle-grid">{principles.map((item) => <article key={item.n}><span>{item.n}</span><h3>{text(locale, item.title)}</h3><p>{text(locale, item.body)}</p></article>)}</div>
          </div>
        </section>

        <section className="tamv-charter-section">
          <div className="container tamv-charter-identity-grid">
            <div>
              <p className="tamv-charter-eyebrow"><span>03</span> {english ? "FOUNDER & LEGACY" : "FUNDADOR Y LEGADO"}</p>
              <h2>{english ? "Built from a place.<br /><em>Responsible to its people.</em>" : "Construido desde un lugar.<br /><em>Responsable ante su gente.</em>"}</h2>
              <p>{english ? "Project materials identify Edwin Oswaldo Castillo Trejo, using the creative signature Anubis Villaseñor, as founder and principal architect. The intended legacy is a durable, attributable record of what was designed, built, tested, corrected and learned." : "Los materiales del proyecto identifican a Edwin Oswaldo Castillo Trejo, bajo la firma creativa Anubis Villaseñor, como fundador y arquitecto principal. El legado buscado es un registro durable y atribuible de lo diseñado, construido, probado, corregido y aprendido."}</p>
            </div>
            <div className="tamv-charter-legacy-list">
              <article><span>01 / MEMORY</span><strong>{english ? "Preserve provenance and authorship." : "Preservar procedencia y autoría."}</strong><p>{english ? "Link canonical sources and version history. Never pass a project record off as independent recognition." : "Enlazar fuentes canónicas e historial de versiones. No presentar un registro de proyecto como reconocimiento independiente."}</p></article>
              <article><span>02 / SERVICE</span><strong>{english ? "Build for tangible use." : "Construir para un uso tangible."}</strong><p>{english ? "The project becomes stronger when people can complete real tasks safely, not when the vocabulary gets larger." : "El proyecto crece cuando las personas completan tareas reales de forma segura, no cuando aumenta el vocabulario."}</p></article>
              <article><span>03 / CORRECTION</span><strong>{english ? "Document failure and repair." : "Documentar fallas y correcciones."}</strong><p>{english ? "Keep the root cause, regression test, release evidence and rollback path close to the change." : "Mantener cerca del cambio la causa raíz, la prueba de regresión, la evidencia de publicación y el camino de reversión."}</p></article>
            </div>
          </div>
        </section>

        <section className="tamv-charter-section tamv-charter-participation">
          <div className="container">
            <div className="tamv-charter-heading">
              <div><p className="tamv-charter-eyebrow"><span>04</span> {english ? "COOPERATION & AFFILIATION" : "COOPERACIÓN Y AFILIACIÓN"}</p><h2>{english ? "Bring a problem.<br /><em>Build the evidence together.</em>" : "Trae un problema.<br /><em>Construyamos la evidencia.</em>"}</h2></div>
              <p>{english ? "Participation begins with a concrete contribution. No path implies automatic admission, employment, investment, funding or certification." : "La participación empieza con una contribución concreta. Ninguna ruta implica ingreso automático, empleo, inversión, financiamiento ni certificación."}</p>
            </div>
            <div className="tamv-charter-participation-grid">
              <article><span>R / RESEARCH</span><h3>{english ? "Research & open knowledge" : "Investigación y conocimiento abierto"}</h3><p>{english ? "Propose a question, source review or reproducible artifact with source, date, license and method." : "Propón una pregunta, revisión de fuentes o artefacto reproducible con fuente, fecha, licencia y método."}</p><Link href={localizedPath("/investigacion", locale)}>{english ? "Explore research" : "Explorar investigación"} <span>↗</span></Link></article>
              <article><span>D / DEVELOPMENT</span><h3>{english ? "Engineering & interoperability" : "Ingeniería e interoperabilidad"}</h3><p>{english ? "Start with a focused issue, API contract, reproducible test or accessibility improvement." : "Empieza con una incidencia enfocada, contrato de API, prueba reproducible o mejora de accesibilidad."}</p><Link href={localizedPath("/desarrolladores", locale)}>{english ? "Open developer path" : "Abrir ruta de desarrollo"} <span>↗</span></Link></article>
              <article><span>T / TERRITORY</span><h3>{english ? "Territory & living memory" : "Territorio y memoria viva"}</h3><p>{english ? "Propose a local use case while documenting data rights, community authority, consent and benefit." : "Propón un caso de uso local y documenta derechos de datos, autoridad comunitaria, consentimiento y beneficio."}</p><Link href={localizedPath("/proyectos", locale)}>{english ? "Browse projects" : "Consultar proyectos"} <span>↗</span></Link></article>
              <article><span>C / COMMUNITY</span><h3>{english ? "Community & learning" : "Comunidad y aprendizaje"}</h3><p>{english ? "Improve shared resources, learn the contribution workflow or help test a specific user journey." : "Mejora recursos compartidos, aprende el flujo de contribución o ayuda a probar una experiencia concreta."}</p><Link href={localizedPath("/unete", locale)}>{english ? "Join TAMV" : "Unirte a TAMV"} <span>↗</span></Link></article>
            </div>
            <div className="tamv-charter-cooperation-flow" aria-label={english ? "Cooperation workflow" : "Flujo de cooperación"}>
              <span>01 / {english ? "INTAKE" : "RECEPCIÓN"}</span><i aria-hidden="true" />
              <span>02 / {english ? "SCOPE & RIGHTS" : "ALCANCE Y DERECHOS"}</span><i aria-hidden="true" />
              <span>03 / {english ? "BUILD & TEST" : "CONSTRUIR Y PROBAR"}</span><i aria-hidden="true" />
              <span>04 / {english ? "REVIEW" : "REVISIÓN"}</span><i aria-hidden="true" />
              <span>05 / {english ? "RELEASE & MONITOR" : "PUBLICAR Y MONITOREAR"}</span>
            </div>
          </div>
        </section>

        <section className="tamv-charter-section tamv-charter-protection">
          <div className="container tamv-charter-protection-grid">
            <div>
              <p className="tamv-charter-eyebrow"><span>05</span> {english ? "PROTECTION & TRUST" : "PROTECCIÓN Y CONFIANZA"}</p>
              <h2>{english ? "Open knowledge.<br /><em>Protected people.</em>" : "Conocimiento abierto.<br /><em>Personas protegidas.</em>"}</h2>
              <p>{english ? "Digital sovereignty requires both discoverability and the right to restrict sensitive access. Public visibility does not erase consent, privacy, intellectual property or community-defined cultural protocols." : "La soberanía digital requiere tanto descubribilidad como derecho a limitar accesos sensibles. La visibilidad pública no elimina el consentimiento, la privacidad, la propiedad intelectual ni los protocolos culturales definidos por la comunidad."}</p>
            </div>
            <div className="tamv-charter-protection-list">
              <article><span>01</span><div><strong>{english ? "Keep secrets server-side." : "Mantén los secretos del lado del servidor."}</strong><p>{english ? "Never publish keys, session cookies, database credentials, private keys or production data dumps." : "Nunca publiques llaves, cookies de sesión, credenciales de base de datos, claves privadas ni volcados de producción."}</p></div></article>
              <article><span>02</span><div><strong>{english ? "Respect consent and community authority." : "Respeta el consentimiento y la autoridad comunitaria."}</strong><p>{english ? "Do not publish personal or culturally sensitive material merely because it can be accessed. Define purpose, access, retention and benefit first." : "No publiques información personal o culturalmente sensible solo porque es accesible. Define primero propósito, acceso, conservación y beneficio."}</p></div></article>
              <article><span>03</span><div><strong>{english ? "Report vulnerabilities privately." : "Reporta vulnerabilidades en privado."}</strong><p>{english ? "Use the private GitHub vulnerability-reporting path when enabled; never test accounts or systems without permission." : "Usa el canal privado de vulnerabilidades de GitHub cuando esté habilitado; no pruebes cuentas o sistemas sin autorización."}</p></div></article>
              <article><span>04</span><div><strong>{english ? "Verify before trusting." : "Verifica antes de confiar."}</strong><p>{english ? "A public link, digest, DOI or repository catalog entry does not by itself establish identity, security, truth or production readiness." : "Un enlace público, hash, DOI o registro de catálogo no establece por sí solo identidad, seguridad, veracidad ni preparación para producción."}</p></div></article>
            </div>
          </div>
          <div className="container tamv-charter-protection-links">
            <Link href={localizedPath("/privacidad", locale)}>{english ? "Privacy notice" : "Aviso de privacidad"} <span>↗</span></Link>
            <Link href={localizedPath("/gobernanza", locale)}>{english ? "Governance policies" : "Políticas de gobernanza"} <span>↗</span></Link>
            <Link href={localizedPath("/ecosistema", locale)}>{english ? "Federation catalog and limits" : "Catálogo de federación y límites"} <span>↗</span></Link>
            <Link href={localizedPath("/institucionalizacion", locale)}>{english ? "Institutionalization and ROR roadmap" : "Ruta de institucionalización y ROR"} <span>↗</span></Link>
          </div>
        </section>

        <section className="tamv-charter-closing">
          <div className="container">
            <p className="tamv-charter-eyebrow"><span>06</span> {english ? "THE COMMITMENT" : "EL COMPROMISO"}</p>
            <h2>{english ? <>The future is built from <em>where we stand.</em></> : <>El futuro se construye desde <em>donde estamos.</em></>}</h2>
            <p>{english ? "A future worthy of the name is not a slogan. It is capability that people can use, evidence others can inspect, memory that communities can govern, and systems that can be corrected when they fail." : "Un futuro digno de ese nombre no es un eslogan. Es capacidad que las personas pueden usar, evidencia que otras pueden inspeccionar, memoria que las comunidades pueden gobernar y sistemas que pueden corregirse cuando fallan."}</p>
            <div className="tamv-charter-closing-actions"><Link href={localizedPath("/unete", locale)}>{english ? "Join the work" : "Únete al trabajo"} <span>↗</span></Link><Link href={localizedPath("/ecosistema", locale)}>{english ? "Inspect the ecosystem" : "Inspeccionar el ecosistema"} <span>↗</span></Link></div>
          </div>
        </section>
      </div>
    <TamvSectionMedia area="who-we-are" locale={locale} />
      </TamvAppShell>
  )
}
