import type { Metadata } from "next"
import Link from "next/link"
import { ArrowDown, ArrowUpRight, BookOpen, Heart, Sparkles } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { TamvSectionMedia } from "@/components/tamv-section-media"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { localizedPath, resolveLocale, type Locale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? {
        title: "Origins | TAMV Online Network",
        description: "The personal story behind TAMV Online Network: a journey of adversity, self-reconstruction, memory, and the decision to build a place where people can belong.",
        openGraph: { locale: "en_US", title: "Origins | TAMV Online Network", description: "The story, conviction, and human origin behind TAMV Online Network." },
      }
    : {
        title: "Orígenes | TAMV Online Network",
        description: "Biografía de Edwin Oswaldo Castillo Trejo, Anubis Villaseñor: desarrollador autodidacta, investigador independiente y fundador de TAMV Online Network desde Real del Monte, Hidalgo.",
        openGraph: { locale: "es_MX", title: "Orígenes | TAMV Online Network", description: "La historia personal, trayectoria tecnológica y obra documentada de Edwin Oswaldo Castillo Trejo, Anubis Villaseñor." },
      }
}


type ProfileResource = { label: string; href: string; es: string; en: string }
const professionalProfiles: ProfileResource[] = [
  { label: "ORCID", href: "https://orcid.org/0009-0008-5050-1539", es: "Identificador persistente de autor e investigador. Los metadatos dependen de las obras y datos declarados en el registro.", en: "Persistent author and researcher identifier. Metadata depends on works and details entered in the record." },
  { label: "ISNI", href: "https://isni.org/isni/0000000531699229", es: "Identificador normalizado de identidad pública y autoral.", en: "Standardized identifier for public and author identity." },
  { label: "GitHub · OsoPanda1", href: "https://github.com/OsoPanda1", es: "Repositorios de código, arquitectura, documentación y evolución de proyectos TAMV.", en: "Code repositories, architecture, documentation, and TAMV project development." },
  { label: "LinkedIn · Edwin Oswaldo Castillo Trejo", href: "https://mx.linkedin.com/in/edwin-oswaldo-castillo-aka-anubis-villase%C3%B1or-69a847376", es: "Perfil profesional público con artículos sobre TAMV e Isabella TERMINUS-V6.", en: "Public professional profile with articles about TAMV and Isabella TERMINUS-V6." },
  { label: "AI Lounge · @tamvonline", href: "https://ai.lounge.ai/@tamvonline", es: "Perfil profesional de proyectos y actividad técnica; incluye repositorios enlazados del ecosistema.", en: "Professional profile for projects and technical activity, including linked ecosystem repositories." },
  { label: "AVIXA Xchange · TAMV e Isabella", href: "https://xchange.avixa.org/posts/tamv-e-isabella-villasenor-ai-el-parteaguas-que-redefine-el-metaverso-desde-mexico", es: "Artículo profesional publicado en la comunidad de AVIXA sobre TAMV e Isabella Villaseñor AI (5 de diciembre de 2025).", en: "Professional article published in AVIXA's community about TAMV and Isabella Villaseñor AI (December 5, 2025)." },
  { label: "AVIXA Xchange · Isabella AI", href: "https://xchange.avixa.org/posts/isabella-villasenor-ai", es: "Presentación del enfoque de acompañamiento contextual, gobernanza y supervisión humana de Isabella AI.", en: "Overview of Isabella AI's contextual assistance, governance, and human-oversight approach." },
  { label: "Autores Editores · perfil verificado", href: "https://www.autoreseditores.com/edwin.oswaldo", es: "La plataforma muestra un perfil verificado y lo ubica en Mineral del Monte, Hidalgo; al revisar la ficha no aparecían libros publicados.", en: "The platform marks the user profile as verified and locates it in Mineral del Monte, Hidalgo; no published books were listed when reviewed." },
  { label: "CITIS 2026 · Universidad Politécnica Salesiana", href: "https://citis.ups.edu.ec/es/", es: "Sitio oficial del XII Congreso Internacional de Ciencia, Tecnología e Innovación para la Sociedad; documenta la organización, sede y fechas del evento.", en: "Official site for the 12th International Conference on Science, Technology and Innovation for Society; documents its organizer, venue, and dates." },
  { label: "Invitación a CITIS 2026 · Facebook", href: "https://www.facebook.com/share/p/1Fku3aeEfZ/", es: "Enlace de invitación compartido por el fundador como fuente de contexto sobre su vinculación con el congreso.", en: "Invitation link supplied by the founder as contextual evidence of his connection with the conference." },
  { label: "TAMV Online · sitio público", href: "https://tamvonline-oficial.odoo.com/", es: "Publicaciones y documentación institucional del propio ecosistema TAMV; deben distinguirse de fuentes externas independientes.", en: "Publications and institutional documentation from TAMV itself; these should be distinguished from independent external sources." },
  { label: "Isabella TERMINUS-V6 · repositorio", href: "https://github.com/OsoPanda1/ISABELLA-VERSION-TERMINUS-V6", es: "Repositorio de código y documentación técnica de la arquitectura Isabella.", en: "Code repository and technical documentation for the Isabella architecture." },
  { label: "TAMV · CITIS 2026 y Nodo Cero", href: "https://tamvonline-oficial.odoo.com/blog/noticias-2/nodo-cero-camino-a-ecuador-11", es: "Artículo editorial del propio ecosistema que relata el vínculo con CITIS y el reconocimiento Ph.D. reportado por el autor.", en: "An article from the TAMV ecosystem reporting the CITIS connection and the Ph.D.-level recognition described by the author." },
]
type ResearchRecord = { titleEs: string; titleEn: string; doi: string; detailEs: string; detailEn: string }
const researchRecords: ResearchRecord[] = [
  { titleEs: "CITEMESH / BookPI — redes P2P y registro de conocimiento territorial", titleEn: "CITEMESH / BookPI — P2P networks and territorial knowledge records", doi: "10.5281/zenodo.19436662", detailEs: "Documento técnico citado en el corpus público TAMV. La existencia de un DOI identifica un registro persistente, no garantiza revisión por pares.", detailEn: "Technical document referenced in the public TAMV corpus. A DOI identifies a persistent record; it does not guarantee peer review." },
  { titleEs: "UTAMV AI Academic Core — arquitectura y gobernanza de IA", titleEn: "UTAMV AI Academic Core — AI architecture and governance", doi: "10.5281/zenodo.19562517", detailEs: "Libro blanco de arquitectura publicado y enlazado por el ecosistema TAMV.", detailEn: "Architecture white paper published and linked by the TAMV ecosystem." },
  { titleEs: "Isabella AI Genesis — evaluación de consistencia conceptual y gobernanza", titleEn: "Isabella AI Genesis — conceptual consistency and governance assessment", doi: "10.5281/zenodo.20606361", detailEs: "Registro técnico asociado a la documentación de Isabella AI / IGE-Ω.", detailEn: "Technical record associated with Isabella AI / IGE-Ω documentation." },
  { titleEs: "Archivo técnico TAMV · Zenodo 19564367", titleEn: "TAMV technical archive · Zenodo 19564367", doi: "10.5281/zenodo.19564367", detailEs: "Registro adicional referenciado por el autor; consultar el registro para confirmar título, versión, autoría y alcance.", detailEn: "Additional record referenced by the author; consult the record to confirm title, version, authorship, and scope." },
  { titleEs: "Archivo técnico TAMV · Zenodo 19414631", titleEn: "TAMV technical archive · Zenodo 19414631", doi: "10.5281/zenodo.19414631", detailEs: "Registro adicional del corpus documental referido por el autor.", detailEn: "Additional record in the documentation corpus referenced by the author." },
  { titleEs: "Archivo técnico TAMV · Zenodo 19411506", titleEn: "TAMV technical archive · Zenodo 19411506", doi: "10.5281/zenodo.19411506", detailEs: "Registro adicional del corpus documental referido por el autor.", detailEn: "Additional record in the documentation corpus referenced by the author." },
  { titleEs: "Registro documental en Figshare · 32135389", titleEn: "Figshare documentation record · 32135389", doi: "https://doi.org/10.6084/m9.figshare.32135389", detailEs: "DOI atribuido al registro citado por el autor; confirma título, versión y metadatos en la página de destino.", detailEn: "DOI attributed to the record cited by the author; confirm title, version, and metadata on the destination page." },
  { titleEs: "Registro documental en Figshare · 32098846", titleEn: "Figshare documentation record · 32098846", doi: "https://doi.org/10.6084/m9.figshare.32098846", detailEs: "DOI citado en documentación pública de TAMV; confirma título, versión y metadatos en la página de destino.", detailEn: "DOI cited in public TAMV documentation; confirm title, version, and metadata on the destination page." },
  { titleEs: "Isabella AI Genesis · registro OSF", titleEn: "Isabella AI Genesis · OSF record", doi: "https://osf.io/t3wmy/", detailEs: "Registro de proyecto asociado a la documentación técnica de Isabella AI.", detailEn: "Project record associated with Isabella AI technical documentation." },
]

type Paragraph = { es: string; en: string }
const story: Paragraph[] = [
  {
    es: "TAMV ONLINE NETWORK no nació de una idea teórica ni de un camino fácil. Nació de años en los que la vida me puso a prueba de formas que no siempre supe cómo nombrar.",
    en: "TAMV ONLINE NETWORK was not born from a theoretical idea or an easy path. It emerged from years in which life tested me in ways I did not always know how to name.",
  },
  {
    es: "Desde temprano conocí el rechazo y el estigma de haber sido señalado como hijo bastardo. Después llegaron la extorsión, el acoso y las amenazas digitales. Durante demasiado tiempo escuché desde afuera que no era digno, que no era bueno, que no tenía derecho, que no servía, que no importaba, que no era nadie.",
    en: "Early in life, I came to know rejection and the stigma of being labeled an illegitimate child. Later came extortion, harassment, and digital threats. For too long, I heard from others that I was not worthy, that I was no good, that I had no right to be here, that I was useless, that I did not matter, that I was nobody.",
  },
  {
    es: "Esas voces terminaron volviéndose mías.",
    en: "Eventually, those voices became my own.",
  },
  {
    es: "Llegó un momento en que ya no necesitaba que nadie me recordara aquello: yo mismo había aprendido a repetirlo. Había interiorizado la condena y me decía, una y otra vez, que no servía para nada.",
    en: "There came a time when I no longer needed anyone to remind me. I had learned to repeat it to myself. I had internalized the verdict and told myself, again and again, that I was good for nothing.",
  },
  {
    es: "En 2019 conocí a quien marcaría un quiebre profundo en mi vida, al confrontarme con esa vieja sensación de no ser suficiente. Pero también fue el inicio de una decisión radical: no perder nada más. No rendirme. No dejar que la historia que otros escribieron sobre mí definiera el resto de mi camino.",
    en: "In 2019, I met someone who would mark a profound turning point in my life by confronting me with that old feeling of never being enough. It also began a radical decision: to lose nothing more. Not to give up. Not to let the story others had written about me define the rest of my path.",
  },
  {
    es: "De ahí nació un impulso que no se ha apagado: alcanzar aquella estrella fugaz que hoy permanece intermitente, no del todo conquistada, pero tampoco extinguida.",
    en: "From that moment came an impulse that has not gone out: to reach that shooting star, still flickering today—not fully attained, but not extinguished either.",
  },
  {
    es: "Un mexicano marcado por el estigma de “ser el problema” decidió no aceptar las etiquetas impuestas ni la supuesta verdad absoluta del entorno. Decidió reescribir su historia, transformar la arquitectura de su vida y construir un espacio donde nadie tenga que vivir la exclusión, el silencio forzado o la sensación de no pertenecer.",
    en: "A Mexican marked by the stigma of being “the problem” decided not to accept imposed labels or the supposed absolute truth of his surroundings. He chose to rewrite his story, reshape the architecture of his life, and build a space where no one has to live with exclusion, forced silence, or the feeling of not belonging.",
  },
]

export default async function OriginsPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  const paragraphs = story.map((paragraph) => english ? paragraph.en : paragraph.es)

  return (
    <TamvAppShell locale={locale}>
      <article className="tamv-origins-page" lang={locale}>
        <section className="tamv-origins-hero">
          <div className="tamv-origins-orbit tamv-origins-orbit-one" aria-hidden="true" />
          <div className="tamv-origins-orbit tamv-origins-orbit-two" aria-hidden="true" />
          <div className="container tamv-origins-hero-inner">
            <p className="tamv-origins-kicker"><span>ARCHIVO FUNDACIONAL / 001</span><span>{english ? "THE HUMAN ORIGIN" : "EL ORIGEN HUMANO"}</span></p>
            <div className="tamv-origins-title-wrap">
              <p className="tamv-origins-overline">{english ? "BEFORE THE NETWORK, THERE WAS A STORY" : "ANTES DE LA RED, HUBO UNA HISTORIA"}</p>
              <h1>{english ? "ORIGINS" : "ORÍGENES"}<span>TAMV</span></h1>
              <p className="tamv-origins-subtitle">{english ? "The story behind the decision to build a place where people can belong." : "La historia detrás de la decisión de construir un lugar donde las personas puedan pertenecer."}</p>
            </div>
            <div className="tamv-origins-hero-bottom">
              <div className="tamv-origins-signature">
                <span>{english ? "FOUNDER · PERSONAL TESTIMONY" : "FUNDADOR · TESTIMONIO PERSONAL"}</span>
                <strong>Edwin Oswaldo Castillo Trejo</strong>
                <p>Anubis Villaseñor <i>/</i> The Alfa RedHat</p>
              </div>
              <a className="tamv-origins-scroll" href="#testimonio"><span>{english ? "Read the story" : "Leer la historia"}</span><ArrowDown aria-hidden="true" /></a>
              <LanguageSwitch pathname="/origenes" locale={locale} />
            </div>
          </div>
        </section>

        <section className="tamv-origins-welcome" id="testimonio">
          <div className="container tamv-origins-reading-grid">
            <aside className="tamv-origins-aside">
              <span className="tamv-origins-index">01 / 04</span>
              <Heart aria-hidden="true" />
              <p>{english ? "A story told in my own words." : "Una historia contada con mis propias palabras."}</p>
              <span className="tamv-origins-aside-rule" />
              <span className="tamv-origins-aside-note">{english ? "MEMORY · DIGNITY · BELONGING" : "MEMORIA · DIGNIDAD · PERTENENCIA"}</span>
            </aside>
            <div className="tamv-origins-prose">
              <p className="tamv-origins-greeting">{english ? "It is an honor to welcome you to this space." : "Es un honor recibirte en este espacio."}</p>
              <p>{english ? "My name is Edwin Oswaldo Castillo Trejo, although across the digital ecosystem I am known as Anubis Villaseñor and The Alfa RedHat." : "Mi nombre es Edwin Oswaldo Castillo Trejo, aunque en el ecosistema digital me conocen como Anubis Villaseñor y The Alfa RedHat."}</p>
              <figure className="tamv-origins-founder-portrait">
                <img
                  src="/visuals/founder-edwin-oswaldo-castillo-trejo.webp"
                  alt={english ? "Edwin Oswaldo Castillo Trejo, founder of TAMV Online Network, in a casual dark hoodie." : "Edwin Oswaldo Castillo Trejo, CEO fundador de TAMV Online Network, con una sudadera oscura, en una fotografía personal."}
                  width={360}
                  height={515}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>
                  <strong>{english ? "Edwin Oswaldo Castillo Trejo" : "Edwin Oswaldo Castillo Trejo"}</strong>
                  <span>{english ? "Founder · Anubis Villaseñor · The Alfa RedHat" : "CEO fundador · Anubis Villaseñor · The Alfa RedHat"}</span>
                </figcaption>
              </figure>
              <section className="tamv-origins-founder-manifesto" aria-labelledby="tamv-origins-founder-manifesto-title">
                <p className="tamv-origins-manifesto-kicker">{english ? "A PERSONAL NOTE ABOUT ORIGIN AND AUTHENTICITY" : "UNA NOTA PERSONAL SOBRE EL ORIGEN Y LA AUTENTICIDAD"}</p>
                <h2 id="tamv-origins-founder-manifesto-title">{english ? "I will not pretend to be someone I am not." : "No voy a aparentar lo que no soy."}</h2>
                {english ? (
                  <>
                    <p>You may wonder why a site that aims to look businesslike, with high academic standards and careful attention to every line of text, displays a photo of someone without a suit and tie, with no diplomas decorating the walls. The answer is simple: I did not come from elite academies or famous surnames. Like millions of Latin Americans, I come from the streets—where people struggle, where hunger is real, and where marketing does not solve everything.</p>
                    <p>I present myself this way because this is who I am, this is my essence, and I do not want to pretend to be something I am not. I am not a false smile in a suit with a polished speech and a double standard. I am simply a Latin American trying to leave a path behind so our region is no longer seen as cheap labor and a market of consumers.</p>
                    <p>We were born in places where scarcity forces us to innovate every day. We live where resilience has become part of our immune system. We live in places where you can earn 1,500 pesos a week and face expenses exceeding 2,000 pesos, and no one understands how there is still enough left for a couple of beers.</p>
                    <p className="tamv-origins-manifesto-closing">This is me: someone who, because he came from a humble neighborhood, was judged and told he could not make it.</p>
                  </>
                ) : (
                  <>
                    <p>Te preguntarás por qué un sitio que pretende lucir empresarial, con alta exigencia académica y con detalle y cuidado en cada línea de texto, pone la foto de alguien sin traje ni corbata y sin los diplomas de titulación adornando las paredes. La respuesta es simple: yo no vengo ni surjo de las grandes academias ni de los apellidos de renombre. Yo, al igual que millones de latinoamericanos, vengo de las calles, donde se sufre, donde se pasa hambre, donde el marketing no funciona.</p>
                    <p>Me presento así porque este soy yo, esta es mi esencia y porque no deseo aparentar lo que no soy. No soy una falsa sonrisa con traje y discurso bonito, de doble moral; simplemente soy un latinoamericano que busca dejar un camino trazado para que nuestra región deje de ser vista como mano de obra barata y consumidora.</p>
                    <p>Nacimos donde la carencia nos obliga a innovar todos los días; vivimos donde la resiliencia se volvió parte de nuestro sistema inmunológico. Vivimos en lugares donde ganas 1,500 pesos de sueldo semanal y tienes gastos de más de 2,000 pesos, y nadie entiende cómo aún nos alcanza para un par de cervezas.</p>
                    <p className="tamv-origins-manifesto-closing">Este soy yo: alguien que, por ser y venir de un barrio humilde, fue condenado y escuchó que no podía.</p>
                  </>
                )}
              </section>


              {paragraphs.map((paragraph, index) => (
                <p key={index} className={index === 2 ? "tamv-origins-emphasis" : undefined}>{paragraph}</p>
              ))}
              <blockquote className="tamv-origins-pullquote">
                <Sparkles aria-hidden="true" />
                <p>{english ? "A person's past does not have to become the limit of their future." : "El pasado de una persona no tiene por qué convertirse en el límite de su futuro."}</p>
              </blockquote>
              <p>{english ? "If someone who came to see himself as disposable could rebuild his direction and turn adversity into structure, we believe that you, too, can transform your own path within TAMV ONLINE NETWORK." : "Si alguien que llegó a verse a sí mismo como descartable pudo reconstruir su rumbo y convertir la adversidad en estructura, estamos convencidos de que en TAMV ONLINE NETWORK tú también puedes transformar el tuyo."}</p>
              <p>{english ? "Welcome to a new chapter of your life. Welcome to a place built on a conviction that runs through everything we do here:" : "Bienvenido a una nueva etapa de tu vida. Bienvenido a un lugar construido desde una convicción que atraviesa todo lo que hacemos aquí:"}</p>
              <p className="tamv-origins-not-alone">{english ? "You are not alone." : "No estás solo."}</p>
              <div className="tamv-origins-mother-note">
                <span>{english ? "A PERSONAL DEDICATION" : "UNA DEDICATORIA PERSONAL"}</span>
                <p>{english ? "And if you are reading this, Mom, I want you to know something:" : "Y si estás leyendo esto, mamá, quiero que sepas algo:"}</p>
                <p className="tamv-origins-dedication">{english ? "TAMV ONLINE NETWORK — “Versatile Mexican Advanced Technology” — this is for you." : "TAMV ONLINE NETWORK — “Tecnología Avanzada Mexicana Versátil” — esto es para ti."}</p>
                <p>{english ? "Lift your head, smile, and for once, feel proud." : "Levanta el rostro, sonríe y, por primera vez, siente orgullo."}</p>
                <p className="tamv-origins-final-line">{english ? "Your black sheep achieved something important." : "Tu oveja negra logró algo importante."}</p>
                <p className="tamv-origins-love">{english ? "I love you, Mom." : "Te amo, mamá."}</p>
              </div>
              <section className="tamv-origins-biography" aria-labelledby="tamv-origins-biography-title">
                <div className="tamv-origins-biography-heading">
                  <p className="tamv-origins-manifesto-kicker">{english ? "BIOGRAPHY · DOCUMENTED WORK · PUBLIC IDENTIFIERS" : "BIOGRAFÍA · OBRA DOCUMENTADA · IDENTIFICADORES PÚBLICOS"}</p>
                  <h2 id="tamv-origins-biography-title">{english ? "An autodidact building from Real del Monte" : "Un autodidacta que construye desde Real del Monte"}</h2>
                </div>
                <div className="tamv-origins-biography-prose">
                  <p>{english ? "Edwin Oswaldo Castillo Trejo, known digitally as Anubis Villaseñor and The Alfa RedHat, is a Mexican self-taught developer, independent researcher, and founder and lead architect of TAMV Online Network. He identifies proudly with Real del Monte (Mineral del Monte), Hidalgo, and places that origin at the center of his work: technology should preserve community memory, expand local capacity, and help Latin America create—not merely supply low-cost labor or consume products built elsewhere." : "Edwin Oswaldo Castillo Trejo, conocido digitalmente como Anubis Villaseñor y The Alfa RedHat, es un desarrollador mexicano autodidacta, investigador independiente y fundador y arquitecto principal de TAMV Online Network. Se reconoce orgullosamente realmontense, de Mineral del Monte (Real del Monte), Hidalgo, y coloca ese origen en el centro de su obra: la tecnología debe preservar la memoria comunitaria, ampliar las capacidades locales y ayudar a que América Latina cree, y no sea vista únicamente como proveedora de mano de obra barata o consumidora de productos desarrollados en otros lugares."}</p>
                  <p>{english ? "His career is organized around a long-running independent effort to design a connected technology ecosystem rather than a single application. The public corpus includes product concepts, architecture notes, software repositories, technical white papers, and versioned records relating to AI governance, digital sovereignty, provenance, open knowledge, human-computer interaction, community safety, and territorial memory. These materials make the project traceable and citable; each still needs to be evaluated on its own merits, implementation state, and available evidence." : "Su trayectoria se articula alrededor de un esfuerzo independiente y sostenido por diseñar un ecosistema tecnológico conectado, en lugar de una sola aplicación. El corpus público incluye conceptos de producto, notas de arquitectura, repositorios de software, libros blancos técnicos y registros versionados sobre gobernanza de IA, soberanía digital, procedencia de la información, conocimiento abierto, interacción humano-computadora, seguridad comunitaria y memoria territorial. Estos materiales permiten rastrear y citar la obra; cada uno debe evaluarse por sus propios méritos, estado de implementación y evidencias disponibles."}</p>
                  <p>{english ? "The author's public materials report more than 23,000 hours devoted to research and development. This is a self-reported measure, not an independently audited timesheet or a formal academic qualification. The central evidence of the work is therefore the material that can be inspected: source repositories, dated technical documents, identifiers, versions, and project artifacts." : "Los materiales públicos del autor reportan más de 23,000 horas dedicadas a investigación y desarrollo. Se trata de una cifra declarada por el propio autor, no de un registro horario auditado de forma independiente ni de una cualificación académica formal. La evidencia central de la obra debe ser, por tanto, el material que puede inspeccionarse: repositorios fuente, documentos técnicos fechados, identificadores, versiones y artefactos de los proyectos."}</p>
                </div>
                <div className="tamv-origins-contribution-grid">
                  <article>
                    <span>01 / TAMV ONLINE NETWORK</span>
                    <h3>{english ? "Digital ecosystem and living memory" : "Ecosistema digital y memoria viva"}</h3>
                    <p>{english ? "A proposed platform architecture joining creator communities, digital identity, knowledge preservation, governance, participation, and economic coordination. The public record contains evolving specifications; production readiness must be checked module by module." : "Una arquitectura de plataforma que busca conectar comunidades creadoras, identidad digital, preservación del conocimiento, gobernanza, participación y coordinación económica. El registro público contiene especificaciones en evolución; la preparación para producción debe comprobarse módulo por módulo."}</p>
                  </article>
                  <article>
                    <span>02 / ISABELLA VILLASEÑOR AI</span>
                    <h3>{english ? "Governed AI and human oversight" : "IA gobernada y supervisión humana"}</h3>
                    <p>{english ? "An AI project documented around contextual assistance, policy boundaries, privacy, auditability, and human responsibility. Its technical records should not be confused with independent certification or proof that every proposed capability is deployed." : "Un proyecto de IA documentado alrededor de la asistencia contextual, límites de política, privacidad, auditabilidad y responsabilidad humana. Sus registros técnicos no deben confundirse con certificación independiente ni con prueba de que todas las capacidades propuestas estén desplegadas."}</p>
                  </article>
                  <article>
                    <span>03 / MD-X4 · CITEMESH · BookPI</span>
                    <h3>{english ? "Federated architecture and provenance" : "Arquitectura federada y procedencia"}</h3>
                    <p>{english ? "Design work exploring federated digital infrastructure, peer-to-peer networking, source traceability, persistent knowledge records, and data sovereignty. Documentation and implementation status vary by component." : "Trabajo de diseño que explora infraestructura digital federada, redes entre pares, trazabilidad de fuentes, registros persistentes de conocimiento y soberanía de datos. La documentación y el estado de implementación varían por componente."}</p>
                  </article>
                  <article>
                    <span>04 / RDM DIGITAL</span>
                    <h3>{english ? "Territorial technology from Real del Monte" : "Tecnología territorial desde Real del Monte"}</h3>
                    <p>{english ? "A place-based digital initiative designed to connect local heritage, visitor information, mapping, storytelling, and potential smart-territory services without displacing the identity of the community it serves." : "Una iniciativa digital vinculada al territorio, diseñada para conectar patrimonio local, información al visitante, cartografía, narrativa y posibles servicios territoriales inteligentes sin desplazar la identidad de la comunidad a la que sirve."}</p>
                  </article>
                </div>
                <section className="tamv-origins-resource-block" aria-labelledby="tamv-origin-identifiers-title">
                  <div className="tamv-origins-resource-heading">
                    <p className="tamv-origins-manifesto-kicker">{english ? "AUTHOR AND PROFESSIONAL PRESENCE" : "IDENTIDAD AUTORAL Y PRESENCIA PROFESIONAL"}</p>
                    <h3 id="tamv-origin-identifiers-title">{english ? "Identifiers and public profiles" : "Identificadores y perfiles públicos"}</h3>
                    <p>{english ? "These links allow readers to inspect the identity, repository activity, professional publications, and project records directly." : "Estos enlaces permiten consultar directamente la identidad, actividad en repositorios, publicaciones profesionales y registros de proyecto."}</p>
                  </div>
                  <div className="tamv-origins-resource-grid">
                    {professionalProfiles.map((profile) => (
                      <a key={profile.label} href={profile.href} target="_blank" rel="noopener noreferrer" className="tamv-origins-resource-card">
                        <strong>{profile.label}</strong>
                        <span>{english ? profile.en : profile.es}</span>
                        <small>{english ? "Open external source" : "Abrir fuente externa"} <ArrowUpRight aria-hidden="true" /></small>
                      </a>
                    ))}
                  </div>
                </section>
                <section className="tamv-origins-resource-block" aria-labelledby="tamv-origin-doi-title">
                  <div className="tamv-origins-resource-heading">
                    <p className="tamv-origins-manifesto-kicker">{english ? "PERSISTENT RECORDS · OPEN DOCUMENTATION" : "REGISTROS PERSISTENTES · DOCUMENTACIÓN ABIERTA"}</p>
                    <h3 id="tamv-origin-doi-title">{english ? "Selected research and technical records" : "Selección de registros técnicos y de investigación"}</h3>
                    <p>{english ? "A DOI or repository record supports citation and retrieval. It does not, by itself, certify academic quality, peer review, deployment, or institutional endorsement. Confirm title, version, authorship, and license on each source page." : "Un DOI o registro de repositorio facilita la cita y recuperación. Por sí solo no certifica calidad académica, revisión por pares, despliegue ni respaldo institucional. Confirma el título, versión, autoría y licencia en cada fuente."}</p>
                  </div>
                  <ol className="tamv-origins-research-records">
                    {researchRecords.map((record) => (
                      <li key={record.doi}>
                        <div>
                          <strong>{english ? record.titleEn : record.titleEs}</strong>
                          <p>{english ? record.detailEn : record.detailEs}</p>
                        </div>
                        <a href={record.doi.startsWith("http") ? record.doi : "https://doi.org/" + record.doi} target="_blank" rel="noopener noreferrer">{record.doi.startsWith("http") ? (english ? "Open record" : "Abrir registro") : record.doi} <ArrowUpRight aria-hidden="true" /></a>
                      </li>
                    ))}
                  </ol>
                </section>
                <aside className="tamv-origins-recognition-note" aria-labelledby="tamv-origins-recognition-title">
                  <p className="tamv-origins-manifesto-kicker">{english ? "RECOGNITION · ACCURACY · ACADEMIC INTEGRITY" : "RECONOCIMIENTO · PRECISIÓN · INTEGRIDAD ACADÉMICA"}</p>
                  <h3 id="tamv-origins-recognition-title">{english ? "Honorific recognition is not the same as an academic degree" : "Un reconocimiento honorífico no es lo mismo que un grado académico"}</h3>
                  {english ? (
                    <>
                      <p>The founder reports that communications associated with Universidad Politécnica Salesiana (UPS) in Ecuador addressed him as “Ph.D.” in the context of CITIS 2026; he also reports receiving the form of address “Dr.” in communications he associates with a university in Querétaro and the scientific publisher Frontiers. This biography documents those titles as honorific recognition or forms of address reported by the founder, not as proof of an official academic qualification.</p>
                      <p>The founder also supplied a Facebook post he identifies as an invitation to CITIS 2026. UPS's official website confirms that the XII International Conference on Science, Technology and Innovation for Society took place in Guayaquil on October 28–30, 2026; a TAMV article about the event describes the Ph.D. form of address as academic recognition reported by the author. The invitation and TAMV article provide documentary context for the reported connection to the conference, but they do not by themselves constitute a diploma or resolution formally conferring an honorary doctorate.</p>
                      <p>During this review I could not independently locate a university resolution, a verifiable honorary-doctorate certificate, a peer-reviewed Frontiers article authored by this identity, or an official Frontiers editorial appointment reliably attributable to the founder. Accordingly, a formally conferred Ph.D., bachelor's degree, engineering degree, or institutional editorial role is not presented here as verified.</p>
                    </>
                  ) : (
                    <>
                      <p>El fundador refiere que, en comunicaciones vinculadas a la Universidad Politécnica Salesiana (UPS) de Ecuador, se han dirigido a él como “Ph.D.” en el contexto de CITIS 2026; también informa haber recibido el tratamiento “Dr.” en comunicaciones que asocia con una universidad de Querétaro y con la revista científica Frontiers. Estos tratamientos se documentan aquí como reconocimientos honoríficos o formas de tratamiento reportadas por el interesado, no como prueba de una titulación académica oficial.</p>
                      <p>El fundador aportó además un enlace a una publicación de Facebook que identifica como invitación a CITIS 2026. La página oficial de UPS confirma la celebración del XII Congreso Internacional de Ciencia, Tecnología e Innovación para la Sociedad en Guayaquil del 28 al 30 de octubre de 2026; la publicación de TAMV sobre el evento describe el tratamiento Ph.D. como reconocimiento académico reportado. La invitación y la publicación constituyen contexto documental sobre el vínculo relatado con el congreso, pero no son, por sí solas, un diploma ni una resolución que formalice un doctorado honoris causa.</p>
                      <p>Durante esta revisión no pude localizar una resolución universitaria independiente, un certificado verificable de doctorado honoris causa, una autoría de artículo revisado por pares en Frontiers o un nombramiento oficial como editor de Frontiers atribuible con seguridad a esta identidad. Por ello no se presenta como confirmado un grado Ph.D. formalmente conferido, una licenciatura, una ingeniería ni una función editorial institucional.</p>
                    </>
                  )}
                  <p className="tamv-origins-recognition-footnote">{english ? "The appropriate professional description at this stage is self-taught developer, independent researcher, founder, and lead architect. If the institutions publish a letter, resolution, or certificate, this record can be updated with its exact wording and provenance." : "La descripción profesional adecuada en este momento es desarrollador autodidacta, investigador independiente, fundador y arquitecto principal. Si las instituciones publican una carta, resolución o certificado, este registro podrá actualizarse con su denominación exacta y procedencia."}</p>
                  <div className="tamv-origins-recognition-sources">
                    <a href="https://www.facebook.com/share/p/1Fku3aeEfZ/" target="_blank" rel="noopener noreferrer">{english ? "Founder-supplied CITIS invitation" : "Invitación a CITIS aportada por el fundador"} <ArrowUpRight aria-hidden="true" /></a>
                    <a href="https://citis.ups.edu.ec/es/" target="_blank" rel="noopener noreferrer">{english ? "Official CITIS 2026 website" : "Sitio oficial de CITIS 2026"} <ArrowUpRight aria-hidden="true" /></a>
                    <a href="https://www.ups.edu.ec/noticias?articleId=4406888&byid=" target="_blank" rel="noopener noreferrer">{english ? "UPS event summary" : "Reseña del evento publicada por UPS"} <ArrowUpRight aria-hidden="true" /></a>
                    <a href="https://tamvonline-oficial.odoo.com/blog/noticias-2/nodo-cero-camino-a-ecuador-11" target="_blank" rel="noopener noreferrer">{english ? "TAMV account of CITIS 2026" : "Relato de TAMV sobre CITIS 2026"} <ArrowUpRight aria-hidden="true" /></a>
                  </div>
                  <details className="tamv-origins-profile-audit">
                    <summary>{english ? "Profile verification notes" : "Notas de verificación de perfiles"}</summary>
                    <p>{english ? "The Frontiers Loop ID 3117809 referenced in technical material currently resolves to a profile-not-found page; it is not presented here as an active profile. I did not find a ResearchGate profile I could confidently match to this identity, an independently verifiable Frontiers-authored peer-reviewed article, or an official Frontiers editor appointment during this search. These findings describe the public evidence available during review, not a claim that no private or unindexed records exist." : "El identificador Frontiers Loop 3117809 citado en material técnico actualmente dirige a una página de perfil inexistente; por ello no se presenta aquí como perfil activo. Durante esta búsqueda no localicé un perfil de ResearchGate que pudiera atribuir con suficiente confianza a esta identidad, un artículo revisado por pares firmado en Frontiers que pudiera verificar de forma independiente ni un nombramiento oficial como editor de Frontiers. Estos hallazgos describen la evidencia pública disponible durante la revisión; no afirman que no existan registros privados o no indexados."}</p>
                  </details>
                </aside>
              </section>

              <div className="tamv-origins-endmark" aria-label={english ? "End of founding testimony" : "Fin del testimonio fundacional"}><span /><b>TAMV</b><span /></div>
            </div>
          </div>
        </section>

        <section className="tamv-origins-legacy">
          <div className="container tamv-origins-legacy-inner">
            <p className="tamv-origins-overline">{english ? "FROM PERSONAL HISTORY TO SHARED PURPOSE" : "DE LA HISTORIA PERSONAL AL PROPÓSITO COMPARTIDO"}</p>
            <h2>{english ? <>The story began with one person.<br /><em>The purpose is bigger than one person.</em></> : <>La historia comenzó con una persona.<br /><em>El propósito es más grande que una persona.</em></>}</h2>
            <p>{english ? "This testimony explains the human motivation behind TAMV. It is not a promise that hardship disappears; it is a commitment to keep building with dignity, transparency, and room for people who have felt left out." : "Este testimonio explica la motivación humana detrás de TAMV. No promete que la adversidad desaparezca; expresa el compromiso de seguir construyendo con dignidad, transparencia y espacio para quienes alguna vez se sintieron excluidos."}</p>
            <div className="tamv-origins-legacy-actions">
              <Link href={localizedPath("/quienes-somos", locale)}>{english ? "Read TAMV's institutional identity" : "Conoce la identidad institucional de TAMV"} <ArrowUpRight aria-hidden="true" /></Link>
              <Link href={localizedPath("/guia", locale)}>{english ? "Explore the practical guide" : "Explora la guía práctica"} <BookOpen aria-hidden="true" /></Link>
            </div>
          </div>
        </section>
      </article>
    <TamvSectionMedia area="origins" locale={locale} />
      </TamvAppShell>
  )
}
