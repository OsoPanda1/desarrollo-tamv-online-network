import { ArrowUpRight } from "lucide-react"
import { TamvNavigationChrome } from "@/components/tamv-navigation-chrome"
import { TamvDonationCTA } from "@/components/shared/tamv-donation-cta"
import { TamvBuildFingerprint, TamvSovereignConsole } from "./tamv-sovereign-console"
import { TamvSectionMedia } from "./tamv-section-media"
import { TamvMindMap } from "./tamv-mind-map"
import { localizedPath, type Locale } from "@/lib/i18n"

export function TamvInstitutionalSite({ locale = "es" }: { locale?: Locale }) {
  const english = locale === "en"
  return (
    <>
      <TamvNavigationChrome locale={locale} />
      <main id="contenido" lang={locale}>
        <section id="inicio" className="tamv-hero-banner" aria-label={english ? "TAMV Online Network institutional banner" : "Banner institucional de TAMV Online Network"}>
          <img
            src="/tamv-hero-banner.jpg"
            alt={english
              ? "TAMV Online Network banner: Advanced Versatile Mexican Technology, an independent Latin American open science platform, with a glowing globe over a Mexican town and the seven federations."
              : "Banner de TAMV Online Network: Tecnología Avanzada Mexicana Versátil, plataforma latinoamericana independiente de ciencia abierta, con un globo luminoso sobre una ciudad mexicana y las siete federaciones."}
            width={1584}
            height={672}
            fetchPriority="high"
            decoding="async"
          />
        </section>
        <TamvSovereignConsole locale={locale} />
        <details className="home-extras-disclosure" lang={locale}>
          <summary>{english ? "Explore the extended atlas and media library" : "Explorar el atlas ampliado y la biblioteca multimedia"} <span aria-hidden="true">+</span></summary>
          <div className="home-extras-content">
            <TamvMindMap mapId="governance" locale={locale} />
            <TamvSectionMedia area="home" locale={locale} />
          </div>
        </details>
      </main>
      <footer className="site-footer" lang={locale}>
        <div className="container footer-main">
          <a className="footer-brand" href={english ? "/?lang=en#inicio" : "/#inicio"} aria-label={english ? "TAMV Online Network, back to top" : "TAMV Online Network, volver al inicio"}>
            <span className="brand-mark" aria-hidden="true" />
            <span><strong>TAMV</strong><small>ONLINE NETWORK</small></span>
          </a>
          <p>
            {english ? "Research · Technology · Living memory" : "Investigación · Tecnología · Memoria viva"}
            <br />
            {english ? "An independent Mexican initiative originating in Mineral del Monte, Hidalgo." : "Iniciativa mexicana independiente, originada en Mineral del Monte, Hidalgo."}
            <br />
            <span>{english ? "Founding author: Edwin Oswaldo Castillo Trejo (Anubis Villaseñor)." : "Autor fundacional: Edwin Oswaldo Castillo Trejo (Anubis Villaseñor)."}</span>
          </p>
          <div className="ai-lounge-profile">
            <span className="ai-lounge-label">{english ? "PUBLIC AUTHOR PROFILE" : "PERFIL PÚBLICO DE AUTOR"}</span>
            <a href="https://lounge.ai/@tamvonline" target="_blank" rel="noopener noreferrer">AI Lounge <ArrowUpRight aria-hidden="true" /></a>
          </div>
          <nav className="footer-links" aria-label={english ? "Institutional links" : "Enlaces institucionales"}>
            <a href={localizedPath("/origenes", locale)}>{english ? "Origins" : "Orígenes"}</a>
            <a href={localizedPath("/quienes-somos", locale)}>{english ? "Institutional identity" : "Identidad institucional"}</a>
            <a href={localizedPath("/proyectos", locale)}>{english ? "Projects" : "Proyectos"}</a>
            <a href={localizedPath("/guia", locale)}>{english ? "Practical guide" : "Guía práctica"}</a>
            <a href={localizedPath("/investigacion", locale)}>{english ? "Research" : "Investigación"}</a>
            <a href={localizedPath("/ecosistema", locale)}>{english ? "Ecosystem" : "Ecosistema"}</a>
            <a href={localizedPath("/desarrolladores", locale)}>{english ? "Developers" : "Desarrolladores"}</a>
            <a href={localizedPath("/estandar", locale)}>{english ? "Open integrity standard" : "Estándar de integridad abierta"}</a>
            <a href={localizedPath("/comunidad", locale)}>{english ? "Community" : "Comunidad"}</a>
            <a href="https://orcid.org/0009-0008-5050-1539" target="_blank" rel="noopener noreferrer">ORCID <ArrowUpRight aria-hidden="true" /></a>
            <a href="https://isni.org/isni/0000000531699229" target="_blank" rel="noopener noreferrer">ISNI <ArrowUpRight aria-hidden="true" /></a>
          </nav>
          <div className="footer-support"><TamvDonationCTA locale={locale} variant="compact" label={english ? "Support TAMV" : "Apoyar TAMV"} /></div>
        </div>
        <TamvBuildFingerprint locale={locale} />
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} TAMV Online Network</span>
          <span>{english ? "Independent initiative; no accreditation or third-party endorsement is implied." : "Iniciativa independiente; no implica acreditación ni respaldo de terceros."}</span>
          <a href="mailto:anubiscastillo@visitarealdelmonte.online">{english ? "Institutional contact" : "Contacto institucional"} <ArrowUpRight aria-hidden="true" /></a>
        </div>
      </footer>
    </>
  )
}
