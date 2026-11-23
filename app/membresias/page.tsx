import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, BookOpenCheck, Building2, CircleHelp, GraduationCap, Network, ShieldCheck, Users } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { PageIntro } from "@/components/shared/page-intro"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { MembershipCheckout, MembershipPortalButton } from "@/components/membership-checkout"
import { MembershipStatus } from "@/components/membership-status"
import { resolveLocale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string; checkout?: string }>
export const dynamic = "force-dynamic"

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? { title: "Memberships", description: "Monthly TAMV memberships for developers and organizations: project collaboration, a practical profile-and-pitch course, and guided preparation for external startup resources." }
    : { title: "Membresías", description: "Membresías mensuales TAMV para desarrolladores y empresas: colaboración en proyectos, curso práctico de perfil y pitch, y preparación guiada para recursos externos de startups." }
}

const individualBenefits = [
  { es: "Ruta para postular a oportunidades de colaboración en proyectos TAMV; incorporación sujeta a revisión, capacidad y criterios de cada proyecto.", en: "A route to apply for collaboration opportunities in TAMV projects; participation depends on review, capacity and each project's criteria.", Icon: Users },
  { es: "Curso práctico de perfil profesional de desarrollador, portafolio verificable y presentación de proyectos.", en: "Practical course for a developer profile, verifiable portfolio, and project presentation.", Icon: GraduationCap },
  { es: "Plantillas de preparación para startup, validación, modelo de negocio y pitch para inversionistas.", en: "Startup preparation templates for validation, business models, and investor pitches.", Icon: BookOpenCheck },
  { es: "Ruta guiada para explorar la comunidad y recursos públicos de AI Lounge.", en: "Guided path to explore the AI Lounge community and public resources.", Icon: Network },
]

const businessBenefits = [
  { es: "Perfil de organización y punto de contacto para oportunidades de colaboración TAMV.", en: "Organization profile and contact point for TAMV collaboration opportunities.", Icon: Building2 },
  { es: "Curso de preparación para presentar la empresa, su propuesta de valor y su proyecto ante posibles aliados o inversionistas.", en: "Preparation course to present the company, its value proposition and project to potential partners or investors.", Icon: BookOpenCheck },
  { es: "Estructura de pitch, diagnóstico de evidencia, hoja de ruta y riesgos del proyecto.", en: "Pitch structure, evidence review, roadmap, and project risk framing.", Icon: ShieldCheck },
  { es: "Ruta de exploración de programas externos para startups; los criterios y beneficios dependen de cada proveedor.", en: "Guided exploration of external startup programs; eligibility and benefits depend on each provider.", Icon: Network },
]

export default async function MembershipsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const locale = resolveLocale(params.lang)
  const english = locale === "en"
  const checkoutNotice = params.checkout === "success"
    ? (english ? "Payment submitted. Access activates only after Stripe confirms the subscription through the signed webhook." : "Pago enviado. El acceso se activa únicamente cuando Stripe confirma la suscripción mediante el webhook firmado.")
    : params.checkout === "cancelled"
      ? (english ? "Checkout was cancelled. No membership activation was recorded from this return." : "Cancelaste el checkout. Este regreso no registra la activación de ninguna membresía.")
      : null

  return <TamvAppShell locale={locale}>
    <PageIntro
      eyebrow={english ? "MEMBERSHIPS · MONTHLY ACCESS" : "MEMBRESÍAS · ACCESO MENSUAL"}
      title={english ? "Build with TAMV." : "Construye con TAMV."}
      accent={english ? "Turn your work into a credible project." : "Convierte tu trabajo en un proyecto defendible."}
      description={english
        ? "A clear path for developers and organizations: contribute, document evidence, strengthen a professional profile, and prepare a startup or project for conversations with partners and investors."
        : "Una ruta concreta para desarrolladores y organizaciones: colaborar, documentar evidencias, fortalecer un perfil profesional y preparar una startup o proyecto para conversar con aliados e inversionistas."}
      locale={locale}
      actions={<LanguageSwitch pathname="/membresias" locale={locale} />}
    />

    <section className="section"><div className="container">
      {checkoutNotice && <p className="membership-status-notice" role="status"><ShieldCheck aria-hidden="true" />{checkoutNotice}</p>}
      <MembershipStatus locale={locale} />
      <div className="section-heading-row">
        <div><p className="eyebrow">{english ? "01 / PLANS" : "01 / PLANES"}</p><h2>{english ? "Choose your membership." : "Elige tu membresía."}</h2></div>
        <p>{english ? "The monthly amount is set in Mexican pesos. Checkout and recurring billing are processed by Stripe; TAMV does not store card details." : "El importe mensual se establece en pesos mexicanos. Stripe procesa el checkout y los cobros recurrentes; TAMV no almacena los datos de tu tarjeta."}</p>
      </div>

      <div className="membership-grid">
        <article className="membership-card">
          <p className="eyebrow">{english ? "FOR INDIVIDUAL BUILDERS" : "PARA PERSONAS DESARROLLADORAS"}</p>
          <h3>{english ? "Individual membership" : "Membresía individual"}</h3>
          <p className="membership-price"><strong>$229</strong><span>MXN / {english ? "month" : "mes"}</span></p>
          <p>{english ? "For developers, researchers, students, and independent builders who want a clearer professional path." : "Para desarrolladores, investigadores, estudiantes y creadores independientes que buscan una ruta profesional más clara."}</p>
          <ul className="membership-benefits">{individualBenefits.map(({ es, en, Icon }) => <li key={es}><Icon aria-hidden="true" /><span>{english ? en : es}</span></li>)}</ul>
          <MembershipCheckout planId="individual" locale={locale} />
          <div className="membership-manage"><MembershipPortalButton planId="individual" locale={locale} /></div>
        </article>

        <article className="membership-card membership-card-business">
          <p className="eyebrow">{english ? "FOR COMPANIES AND TEAMS" : "PARA EMPRESAS Y ORGANIZACIONES"}</p>
          <h3>{english ? "Business membership" : "Membresía empresarial"}</h3>
          <p className="membership-price"><strong>$699</strong><span>MXN / {english ? "month per organization" : "mes por empresa"}</span></p>
          <p>{english ? "For companies and startup teams preparing a credible profile, a project narrative and a structured pitch." : "Para empresas y equipos startup que preparan un perfil sólido, la narrativa de su proyecto y una presentación estructurada."}</p>
          <ul className="membership-benefits">{businessBenefits.map(({ es, en, Icon }) => <li key={es}><Icon aria-hidden="true" /><span>{english ? en : es}</span></li>)}</ul>
          <MembershipCheckout planId="business" locale={locale} />
          <div className="membership-manage"><MembershipPortalButton planId="business" locale={locale} /></div>
        </article>
      </div>

      <div className="governance-notice membership-governance"><ShieldCheck aria-hidden="true" /><p>{english
        ? "Recurring billing: subscriptions renew monthly until cancelled in Stripe's customer portal. Project participation is not automatic and depends on each project's review and capacity. Membership does not guarantee investment, investor introductions, grants, credits, or acceptance by an external accelerator."
        : "Cobro recurrente: la suscripción se renueva mensualmente hasta cancelarla desde el portal de clientes de Stripe. La membresía no incorpora automáticamente a un proyecto; la participación depende de la revisión y capacidad de cada equipo. Tampoco garantiza inversión, presentaciones con inversionistas, subvenciones, créditos o aceptación en aceleradoras externas."}</p></div>
    </div></section>

    <section className="section"><div className="container">
      <div className="section-heading-row">
        <div><p className="eyebrow">{english ? "02 / MEMBER COURSE" : "02 / CURSO PARA MIEMBROS"}</p><h2>{english ? "Profile, portfolio, startup, pitch." : "Perfil, portafolio, startup y pitch."}</h2></div>
        <p>{english ? "The learning path is structured around deliverables, evidence, and investor-facing communication — not promises of funding." : "La ruta formativa se organiza por entregables, evidencia y comunicación para posibles inversionistas; no vende promesas de financiamiento."}</p>
      </div>
      <div className="membership-course-callout">
        <div><GraduationCap aria-hidden="true" /><h3>{english ? "Developer profile and investor pitch course" : "Curso de perfil de desarrollador y pitch para inversión"}</h3></div>
        <p>{english ? "Five practical modules take you from professional identity and portfolio to startup validation, business model and an evidence-based pitch. Module completion is saved to your TAMV account." : "Cinco módulos prácticos te llevan desde la identidad profesional y el portafolio hasta la validación de la startup, el modelo de negocio y un pitch basado en evidencias. El avance queda guardado en tu cuenta TAMV."}</p>
        <Link className="text-link" href="/formacion">{english ? "Open the member learning path" : "Abrir la ruta formativa para miembros"} <ArrowUpRight aria-hidden="true" /></Link>
      </div>
    </div></section>

    <section className="section"><div className="container">
      <div className="section-heading-row">
        <div><p className="eyebrow">{english ? "03 / EXTERNAL NETWORK" : "03 / RED EXTERNA"}</p><h2>{english ? "Explore AI Lounge responsibly." : "Explora AI Lounge con expectativas claras."}</h2></div>
        <p>{english ? "AI Lounge is an independent third-party community. TAMV links to its official public site; no affiliate or partner pass is configured in this deployment." : "AI Lounge es una comunidad externa e independiente. TAMV enlaza su sitio público oficial; este despliegue no tiene configurado un pase de afiliación ni un convenio con esa plataforma."}</p>
      </div>
      <div className="membership-course-callout">
        <div><Network aria-hidden="true" /><h3>AI Lounge</h3></div>
        <p>{english
          ? "Your TAMV membership includes a guided route to create or review your external profile and explore public resources. Private investor contacts, warm introductions, premium masterminds, credits, and other external perks remain subject to AI Lounge's current plans, eligibility and terms; they are not included or guaranteed by TAMV."
          : "Tu membresía TAMV incluye una ruta guiada para crear o revisar tu perfil externo y explorar recursos públicos. Los contactos privados de inversionistas, las presentaciones, las sesiones premium, los créditos y otros beneficios externos dependen de los planes, criterios y términos vigentes de AI Lounge; TAMV no los incluye ni los garantiza."}</p>
        <div className="membership-external-links">
          <a className="text-link" href="https://ai.lounge.ai/" target="_blank" rel="noopener noreferrer">{english ? "Open AI Lounge community" : "Abrir la comunidad AI Lounge"} <ArrowUpRight aria-hidden="true" /></a>
          <a className="text-link" href="https://ai.lounge.ai/upgrade" target="_blank" rel="noopener noreferrer">{english ? "Review the provider's current plans" : "Consultar los planes vigentes del proveedor"} <ArrowUpRight aria-hidden="true" /></a>
          <a className="text-link" href="https://ai.lounge.ai/perks" target="_blank" rel="noopener noreferrer">{english ? "Browse startup programs and eligibility" : "Explorar programas para startups y requisitos"} <ArrowUpRight aria-hidden="true" /></a>
        </div>
      </div>
    </div></section>

    <section className="section"><div className="container">
      <div className="section-heading-row">
        <div><p className="eyebrow">{english ? "04 / TERMS AT A GLANCE" : "04 / CONDICIONES ESENCIALES"}</p><h2>{english ? "Billing and scope." : "Cobro y alcance."}</h2></div>
        <p>{english ? "Review the conditions before subscribing; the Stripe checkout will show the exact amount and payment method available for your account." : "Revisa las condiciones antes de contratar; el checkout de Stripe mostrará el importe exacto y los medios de pago disponibles para tu cuenta."}</p>
      </div>
      <div className="doc-grid">
        <article className="doc-card"><CircleHelp aria-hidden="true" /><h3>{english ? "Monthly renewal" : "Renovación mensual"}</h3><p>{english ? "The individual plan is MXN $229 per month; the business plan is MXN $699 per organization per month. The customer portal is used to manage eligible cancellations and payment methods." : "El plan individual cuesta $229 MXN al mes; el empresarial cuesta $699 MXN por empresa al mes. El portal de cliente permite gestionar cancelaciones disponibles y métodos de pago."}</p></article>
        <article className="doc-card"><ShieldCheck aria-hidden="true" /><h3>{english ? "No guaranteed outcome" : "Sin resultados garantizados"}</h3><p>{english ? "TAMV provides preparation and a path to apply. Membership is not a degree, certification, guarantee of publication, funded project, investment or access to a third party's paid systems." : "TAMV proporciona preparación y una vía para postular. La membresía no constituye un título, una certificación ni una garantía de publicación, financiamiento, inversión o acceso a sistemas de pago de terceros."}</p></article>
      </div>
    </div></section>
  </TamvAppShell>
}
