import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, ArrowUpRight, BookOpen, HandHeart, ShieldCheck } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { PageIntro } from "@/components/shared/page-intro"
import { resolveLocale, localizedPath } from "@/lib/i18n"

export const dynamic = "force-dynamic"

type SearchParams = Promise<{ lang?: string }>

const allowedDonationHosts = new Set([
  "buy.stripe.com",
  "checkout.stripe.com",
  "paypal.com",
  "www.paypal.com",
  "paypal.me",
  "ko-fi.com",
  "www.ko-fi.com",
  "opencollective.com",
  "www.opencollective.com",
  "donorbox.org",
  "www.donorbox.org",
  "liberapay.com",
  "www.liberapay.com",
  "github.com",
])

function resolveDonationTarget(rawValue: string | undefined) {
  if (!rawValue?.trim()) return { target: null, state: "missing" as const }
  try {
    const url = new URL(rawValue)
    const approvedHost = allowedDonationHosts.has(url.hostname.toLowerCase())
    const approvedGitHubSponsors = url.hostname.toLowerCase() === "github.com" && /^\/sponsors\/[A-Za-z0-9-]+\/?$/.test(url.pathname)
    if (url.protocol !== "https:" || url.username || url.password || (!approvedHost && !approvedGitHubSponsors)) {
      return { target: null, state: "rejected" as const }
    }
    return { target: url.toString(), state: "ready" as const }
  } catch {
    return { target: null, state: "rejected" as const }
  }
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const locale = resolveLocale((await searchParams).lang)
  return locale === "en"
    ? { title: "Support the network", description: "Ways to support independent research, open documentation, digital infrastructure and living territorial memory." }
    : { title: "Apoyar la red", description: "Formas de apoyar la investigación independiente, la documentación abierta, la infraestructura digital y la memoria territorial viva." }
}

export default async function SupportPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  const { target, state } = resolveDonationTarget(process.env.TAMV_DONATION_URL)

  if (target) redirect(target)

  return (
    <TamvAppShell locale={locale}>
      <PageIntro
        number="09"
        eyebrow={english ? "SUSTAINABILITY AND PARTICIPATION" : "SOSTENIBILIDAD Y PARTICIPACIÓN"}
        title={english ? "Support the work behind" : "Apoya el trabajo detrás de"}
        accent={english ? "the network." : "la red."}
        description={english
          ? "TAMV Online Network is an independent initiative. Contributions should be transparent, voluntary, and connected to a clear purpose: keeping research, documentation, digital tools, and community work sustainable."
          : "TAMV Online Network es una iniciativa independiente. Las aportaciones deben ser transparentes, voluntarias y vinculadas a un propósito claro: sostener investigación, documentación, herramientas digitales y trabajo comunitario."}
        locale={locale}
        actions={<Link className="support-back-link" href={localizedPath("/", locale)}><ArrowLeft aria-hidden="true" /> {english ? "Back to the network" : "Volver al sitio institucional"}</Link>}
      />

      <section className="support-page-section">
        <div className="container support-page-grid">
          <article className="support-feature-card">
            <div className="support-feature-symbol"><HandHeart aria-hidden="true" /></div>
            <p className="eyebrow">{english ? "VOLUNTARY SUPPORT" : "APOYO VOLUNTARIO"}</p>
            <h2>{english ? "Sustain independent work, with transparent boundaries." : "Sostener el trabajo independiente, con límites transparentes."}</h2>
            <p>{english
              ? "Support can help cover hosting, domain renewal, backups, accessibility, research materials, and maintenance of open tools. The project does not publish amounts, impact figures, or funding claims that have not been documented."
              : "El apoyo puede contribuir a alojamiento, renovación de dominios, respaldos, accesibilidad, materiales de investigación y mantenimiento de herramientas abiertas. El proyecto no publica cantidades, cifras de impacto ni afirmaciones de financiación que no estén documentadas."}</p>
            <div className="support-status" role="status">
              {state === "rejected" ? <ShieldCheck aria-hidden="true" /> : <BookOpen aria-hidden="true" />}
              <div>
                <strong>{state === "rejected"
                  ? (english ? "Payment destination not accepted" : "Destino de pago no aceptado")
                  : (english ? "Online checkout not configured" : "Pasarela de pago no configurada")}</strong>
                <span>{state === "rejected"
                  ? (english ? "The configured URL does not match the HTTPS payment-provider allowlist. No redirect or payment attempt was made." : "La URL configurada no coincide con la lista permitida de proveedores HTTPS. No se realizó ninguna redirección ni intento de pago.")
                  : (english ? "This environment has no approved donation checkout URL. This page does not collect or process payments." : "Este entorno no tiene una URL aprobada de pasarela de donación. Esta página no solicita ni procesa pagos.")}</span>
              </div>
            </div>
            <div className="support-feature-actions">
              <a className="button button-copper" href="mailto:anubiscastillo@visitarealdelmonte.online?subject=Apoyo%20a%20TAMV%20Online%20Network">
                {english ? "Ask about contribution options" : "Consultar formas de colaboración"} <ArrowUpRight aria-hidden="true" />
              </a>
              <Link className="button button-outline-dark" href={localizedPath("/gobernanza", locale)}>
                {english ? "Read governance principles" : "Consultar principios de gobernanza"}
              </Link>
            </div>
          </article>

          <aside className="support-purpose-panel">
            <p className="eyebrow">{english ? "POSSIBLE USES" : "DESTINOS POSIBLES"}</p>
            <h3>{english ? "A contribution should have a traceable purpose." : "Una aportación debe tener un propósito trazable."}</h3>
            <ul>
              <li><span>01</span><div><strong>{english ? "Infrastructure" : "Infraestructura"}</strong><p>{english ? "Hosting, observability, backups, security updates, and domain continuity." : "Alojamiento, observabilidad, respaldos, actualizaciones de seguridad y continuidad de dominios."}</p></div></li>
              <li><span>02</span><div><strong>{english ? "Open knowledge" : "Conocimiento abierto"}</strong><p>{english ? "Research documentation, source curation, accessibility, and reproducibility." : "Documentación de investigación, curaduría de fuentes, accesibilidad y reproducibilidad."}</p></div></li>
              <li><span>03</span><div><strong>{english ? "Community and territory" : "Comunidad y territorio"}</strong><p>{english ? "Materials, local collaboration, and respectful preservation of living memory." : "Materiales, colaboración local y preservación respetuosa de la memoria viva."}</p></div></li>
            </ul>
            <p className="support-purpose-note">{english
              ? "These are proposed purposes, not a statement that funds have already been received or spent. Any future payment method must disclose the recipient, fees, terms, and applicable reporting."
              : "Estos son destinos propuestos, no una afirmación de que ya se hayan recibido o gastado fondos. Cualquier método de pago futuro deberá informar quién recibe, comisiones, condiciones y rendición de cuentas aplicable."}</p>
          </aside>
        </div>
      </section>
    </TamvAppShell>
  )
}
