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
    ? { title: "TAMV account — Free to take part, Premium to research in depth", description: "Two TAMV account modes under one identity: your name, your TRI role, and your ORCID. Better Auth handles registration and sign-in; recurring individual and business memberships are managed through Stripe." }
    : { title: "Cuenta TAMV — Free para participar, Premium para investigar a fondo", description: "Dos modalidades de cuenta TAMV con una misma identidad: tu nombre, tu rol TRI y tu ORCID. Better Auth gestiona el registro y el acceso; las membresías individuales y empresariales recurrentes se contratan y gestionan mediante Stripe." }
}

type Pair = { es: string; en: string }
const t = (english: boolean, pair: Pair) => (english ? pair.en : pair.es)

const freeFeatures: Pair[] = [
  { es: "Cuenta de comunidad con código TRI en formación (TRI-S / TRI-C).", en: "Community account with a TRI code in formation (TRI-S / TRI-C)." },
  { es: "Foro y comunidad: leer y participar en la discusión del portal.", en: "Forum and community: read and take part in the portal discussion." },
  { es: "Proponer temas de discusión por el canal canónico.", en: "Propose discussion topics through the canonical channel." },
  { es: "Mapa Transformativo HCU completo: escenarios, fallas y Atlas.", en: "Full HCU Transformative Map: scenarios, failures, and Atlas." },
  { es: "Guía El Camino, checklist TQAF-10 y plantilla BookPI.", en: "El Camino guide, TQAF-10 checklist, and BookPI template." },
  { es: "Ciencia abierta completa: obras, DOI y repositorios en GitHub.", en: "Full open science: works, DOIs, and GitHub repositories." },
]

const premiumFeatures: Pair[] = [
  { es: "Acceso al curso práctico de perfil profesional, portafolio verificable, validación de startup y presentación para inversionistas.", en: "Access to the practical course on professional profile, verifiable portfolio, startup validation, and investor presentation." },
  { es: "Progreso del curso guardado en tu cuenta mientras la membresía esté activa.", en: "Course progress saved to your account while the membership is active." },
  { es: "Ruta para postular a oportunidades de colaboración en proyectos TAMV; participar depende de la revisión y capacidad de cada proyecto.", en: "A route to apply for TAMV project collaboration; participation depends on each project's review and capacity." },
  { es: "Plantillas para modelo de negocio, hitos, evidencias y pitch; no reemplazan asesoría profesional financiera o jurídica.", en: "Templates for business model, milestones, evidence, and pitch; they do not replace professional financial or legal advice." },
  { es: "Guía para explorar AI Lounge y crear un perfil externo. Las membresías Pro, contactos privados y beneficios externos no están incluidos.", en: "Guidance to explore AI Lounge and create an external profile. Pro memberships, private contacts, and external benefits are not included." },
  { es: "Para empresas existe un plan separado por organización; compara alcances y condiciones antes de contratar.", en: "A separate per-organization business plan is available; compare scope and terms before subscribing." },
]

const roles: { code: string; title: Pair }[] = [
  { code: "TRI-S", title: { es: "Student / Junior Developer", en: "Student / Junior Developer" } },
  { code: "TRI-R", title: { es: "Research Fellow / Investigador Principal", en: "Research Fellow / Principal Investigator" } },
  { code: "TRI-D", title: { es: "Systems Engineer & Code Architect", en: "Systems Engineer & Code Architect" } },
  { code: "TRI-E", title: { es: "Editor & Auditor Neutral", en: "Editor & Neutral Auditor" } },
  { code: "TRI-C", title: { es: "Specialized Collaborator", en: "Specialized Collaborator" } },
  { code: "TRI-A", title: { es: "External Associated Researcher", en: "External Associated Researcher" } },
]

export default async function AccountPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  return <TamvAppShell locale={locale}>
    <PageIntro eyebrow={english ? "TAMV ACCOUNT · REGISTRATION AND ACCESS" : "CUENTA TAMV · REGISTRO Y ACCESO"} title={english ? "Free to take part," : "Free para participar,"} accent={english ? "Premium to research in depth." : "Premium para investigar a fondo."} description={english ? "Two modes, one identity: your name, your TRI role, and your ORCID. Registration and sign-in run here, on the real portal — not on a session form." : "Dos modalidades, una misma identidad: tu nombre, tu rol TRI y tu ORCID. El registro y el acceso funcionan aquí, en el portal real — no en un formulario de sesión."} locale={locale} actions={<LanguageSwitch pathname="/cuenta" locale={locale} />} />

    <section className="section"><div className="container">
      <div className="section-heading-row">
        <div><p className="eyebrow">{english ? "01 / TWO MODES" : "01 / DOS MODALIDADES"}</p><h2>{english ? "Choose your mode." : "Elige tu modalidad."}</h2></div>
        <p>{english ? "Free is for reading, learning, discussing, and taking the first step of El Camino with your own identity. Premium is for those who research, build, or audit inside TAMV projects and want full editorial support." : "Free es para leer, aprender, discutir y dar el primer paso del Camino con identidad propia. Premium es para quien investiga, construye o audita dentro de los proyectos TAMV y quiere acompañamiento editorial completo."}</p>
      </div>
      <div className="doc-grid">
        <article className="doc-card">
          <p className="eyebrow">{english ? "MODE · FREE" : "MODALIDAD · FREE"}</p>
          <h3>{english ? "$0 · forever, no card" : "$0 · para siempre, sin tarjeta"}</h3>
          <p>{english ? "For reading, learning, discussing, and taking the first step of El Camino with your own identity." : "Para leer, aprender, discutir y dar el primer paso del Camino con identidad propia."}</p>
          <ul>{freeFeatures.map((feature) => <li key={feature.es}>{t(english, feature)}</li>)}</ul>
          <p><Link className="text-link" href="/sign-up">{english ? "Create my Free account" : "Crear mi cuenta Free"} <ArrowUpRight aria-hidden="true" /></Link></p>
        </article>
        <article className="doc-card">
          <p className="eyebrow">{english ? "MODE · PREMIUM · RESEARCH" : "MODALIDAD · PREMIUM · INVESTIGACIÓN"}</p>
          <h3>{english ? "$229 MXN/month individual · $699 MXN/month per business" : "$229 MXN/mes individual · $699 MXN/mes por empresa"}</h3>
          <p>{english ? "The individual plan is billed per user; the business plan is billed per organization. Compare the included scope and current third-party conditions on the memberships page. Checkout and recurring billing run through Stripe when the deployment is configured and approved." : "El plan individual se cobra por usuario; el empresarial, por organización. Compara el alcance incluido y las condiciones vigentes de terceros en la página de membresías. El checkout y el cobro recurrente funcionan mediante Stripe cuando el despliegue está configurado y aprobado."}</p>
          <ul>{premiumFeatures.map((feature) => <li key={feature.es}>{t(english, feature)}</li>)}</ul>
          <p><Link className="text-link" href={`/membresias?lang=${locale}`}>{english ? "Compare paid memberships" : "Comparar membresías de pago"} <ArrowUpRight aria-hidden="true" /></Link></p>
        </article>
      </div>
      <div className="governance-notice"><ShieldCheck aria-hidden="true" /><p>{english ? "Limits, stated plainly: paid membership access activates only after a signed Stripe webhook confirms the subscription. Membership is not a promise of investor funding, acceptance into every TAMV project, or paid access to a third-party platform. Registration is /sign-up and access is /sign-in, with Better Auth." : "Límites, declarados sin rodeos: el acceso de pago se activa únicamente cuando un webhook firmado de Stripe confirma la suscripción. La membresía no garantiza inversión, aceptación en todos los proyectos TAMV ni acceso de pago a plataformas de terceros. El registro real es /sign-up y el acceso es /sign-in, con Better Auth."}</p></div>
    </div></section>

    <section className="section"><div className="container">
      <div className="section-heading-row">
        <div><p className="eyebrow">{english ? "02 / YOUR TRI ROLE" : "02 / TU ROL TRI"}</p><h2>{english ? "One identity, one role." : "Una identidad, un rol."}</h2></div>
        <p>{english ? "Your TRI role states what you do in the network. Free accounts start in formation (TRI-S / TRI-C); a full role follows your matrix and the confirmation from the canonical channel." : "Tu rol TRI declara qué haces en la red. Las cuentas Free empiezan en formación (TRI-S / TRI-C); el rol pleno sigue tu matriz y la confirmación del canal canónico."}</p>
      </div>
      <div className="doc-table-wrap"><table className="doc-table">
        <thead><tr><th>{english ? "Code" : "Código"}</th><th>{english ? "Role" : "Rol"}</th></tr></thead>
        <tbody>{roles.map((role) => <tr key={role.code}><td>{role.code}</td><td>{t(english, role.title)}</td></tr>)}</tbody>
      </table></div>
      <p>{english ? "Link your ORCID iD to your account so your works carry a persistent author identifier. Create one free at orcid.org if you do not have one yet." : "Vincula tu ORCID iD a tu cuenta para que tus obras lleven un identificador persistente de autoría. Si aún no tienes, créalo gratis en orcid.org."}</p>
    </div></section>

    <section className="section"><div className="container">
      <div className="section-heading-row">
        <div><p className="eyebrow">{english ? "03 / REAL ACCESS" : "03 / ACCESO REAL"}</p><h2>{english ? "Register and sign in here." : "Regístrate y entra aquí."}</h2></div>
        <p>{english ? "The old hub kept a session-only login that validated the format of a TRI code and an ORCID check digit. It is not carried over: it never verified a registration. Access now lives in the portal, with a real account." : "El hub anterior tenía un login solo de sesión que validaba el formato de un código TRI y el dígito de control ORCID. No se porta: nunca verificaba un registro. El acceso ahora vive en el portal, con una cuenta real."}</p>
      </div>
      <div className="policy-cta"><div><h3>{english ? "Create your account" : "Crea tu cuenta"}</h3><p>{english ? "Real registration with Better Auth. If you already have an account, sign in and continue in the portal." : "Registro real con Better Auth. Si ya tienes cuenta, inicia sesión y continúa en el portal."}</p></div><div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}><Link className="button" href="/sign-up">{english ? "Create account" : "Crear cuenta"} <ArrowUpRight aria-hidden="true" /></Link><Link className="button button-outline-light" href="/sign-in">{english ? "Sign in" : "Iniciar sesión"} <ArrowUpRight aria-hidden="true" /></Link><Link className="button button-outline-light" href="/portal">{english ? "Open the portal" : "Abrir el portal"} <ArrowUpRight aria-hidden="true" /></Link></div></div>
      <p style={{ marginTop: 18 }}><Mail aria-hidden="true" style={{ width: 15, height: 15, verticalAlign: "-2px", marginRight: 6, color: "var(--copper-dark)" }} /><a className="text-link" href="mailto:anubiscastillo@visitarealdelmonte.online">anubiscastillo@visitarealdelmonte.online</a> <span>{english ? "— the formal channel of the network, for TRI verification and account questions." : "— canal formal de la red, para verificación TRI y preguntas sobre tu cuenta."}</span></p>
    </div></section>
  </TamvAppShell>
}
