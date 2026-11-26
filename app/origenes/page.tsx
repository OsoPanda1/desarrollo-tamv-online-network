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
        description: "La historia personal detrás de TAMV Online Network: adversidad, reconstrucción, memoria y la decisión de construir un lugar donde las personas puedan pertenecer.",
        openGraph: { locale: "es_MX", title: "Orígenes | TAMV Online Network", description: "La historia, la convicción y el origen humano detrás de TAMV Online Network." },
      }
}

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
