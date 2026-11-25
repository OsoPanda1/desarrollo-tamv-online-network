import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { TamvSiteHeader } from "@/components/tamv-site-header"
import { localizedPath, type Locale } from "@/lib/i18n"
import { TamvDonationCTA } from "@/components/shared/tamv-donation-cta"
import { PageVisualLayer } from "@/components/visuals/visual-layer"

export function TamvAppShell({ children, locale = "es" }: { children: React.ReactNode; locale?: Locale }) {
  const english = locale === "en"
  return (
    <>
      <a className="skip-link" href="#contenido">{english ? "Skip to content" : "Saltar al contenido"}</a>
      <TamvSiteHeader locale={locale} />
      <main id="contenido" className="app-main" lang={locale}>{children}</main>
      <PageVisualLayer locale={locale} />
      <div className="container app-support-slot"><TamvDonationCTA locale={locale} variant="inline" /></div>
      <footer className="site-footer" lang={locale}>
        <div className="container footer-main">
          <Link className="footer-brand" href={localizedPath("/", locale)} aria-label={english ? "TAMV Online Network, home" : "TAMV Online Network, inicio"}>
            <span className="brand-mark" aria-hidden="true" />
            <span><strong>TAMV</strong><small>ONLINE NETWORK</small></span>
          </Link>
          <p>{english ? <>Research · Technology · Living memory<br />Independent initiative, originating in Hidalgo, Mexico.</> : <>Investigación · Tecnología · Memoria viva<br />Iniciativa independiente, con origen en Hidalgo, México.</>}</p>
          <nav className="footer-links" aria-label={english ? "Institutional links" : "Enlaces institucionales"}>
            <Link href={localizedPath("/quienes-somos", locale)}>{english ? "Who we are" : "Quiénes somos"}</Link>
            <Link href={localizedPath("/investigacion", locale)}>{english ? "Research" : "Investigación"}</Link>
            <Link href={localizedPath("/guia", locale)}>{english ? "Practical guide" : "Guía práctica"}</Link>
            <Link href={localizedPath("/proyectos", locale)}>{english ? "Projects" : "Proyectos"}</Link>
            <Link href={localizedPath("/hcu", locale)}>{english ? "HCU map" : "Mapa HCU"}</Link>
            <Link href={localizedPath("/fuentes", locale)}>{english ? "Sources" : "Fuentes"}</Link>
            <Link href={localizedPath("/gobernanza", locale)}>{english ? "Governance" : "Gobernanza"}</Link>
            <Link href={localizedPath("/atlas", locale)}>{english ? "Visual atlas" : "Atlas visual"}</Link>
            <Link href={localizedPath("/logros", locale)}>{english ? "Achievements" : "Logros"}</Link>
            <Link href={localizedPath("/desarrolladores", locale)}>API <ArrowUpRight aria-hidden="true" /></Link>
            <Link href={localizedPath("/ecosistema", locale)}>{english ? "Ecosystem metadata" : "Metadatos del ecosistema"}</Link>
          </nav>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} TAMV Online Network</span>
          <span>{english ? "Editorial statuses do not imply peer review, accreditation, or funding." : "Los estados editoriales no equivalen a revisión por pares, acreditación ni financiación."}</span>
          <Link href="/portal">{english ? "Research portal" : "Portal de investigación"}</Link>
        </div>
      </footer>
    </>
  )
}
