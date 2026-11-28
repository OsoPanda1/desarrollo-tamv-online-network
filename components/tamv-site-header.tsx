"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRight, Menu, Search, UserRound, X } from "lucide-react"
import { useEffect, useState } from "react"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { TamvDonationCTA } from "@/components/shared/tamv-donation-cta"
import { localizedPath, type Locale } from "@/lib/i18n"
import { discoveryNavigation, isNavigationPathActive, navigationLabel, primaryNavigation } from "@/lib/navigation"
import { TamvAssistant } from "@/components/tamv-assistant"

export function TamvSiteHeader({ locale = "es" }: { locale?: Locale }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const english = locale === "en"
  const homeHash = pathname === "/" ? "#inicio" : `${localizedPath("/", locale)}#inicio`
  const contactHash = pathname === "/" ? "#contacto" : `${localizedPath("/", locale)}#contacto`

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <>
      <header className="site-header" lang={locale}>
        <div className="utility-bar">
          <div className="container utility-inner">
            <span>{english ? "RESEARCH · TECHNOLOGY · LIVING MEMORY" : "INVESTIGACIÓN · TECNOLOGÍA · MEMORIA VIVA"}</span>
            <span>{english ? "MINERAL DEL MONTE · HIDALGO · MEXICO" : "MINERAL DEL MONTE · HIDALGO · MÉXICO"}</span>
          </div>
        </div>
        <div className="container header-inner">
          <Link className="brand-lockup" href={homeHash} aria-label={english ? "TAMV Online Network, home" : "TAMV Online Network, inicio"} onClick={closeMenu}>
            <span className="brand-mark" aria-hidden="true" />
            <span className="brand-type"><strong>TAMV</strong><small>ONLINE NETWORK</small></span>
          </Link>
          <form className="header-search" action={`${localizedPath("/investigacion", locale)}#buscador-federado`} method="get" role="search">
            <label className="sr-only" htmlFor="tamv-global-search">{english ? "Search public research metadata" : "Buscar metadatos públicos de investigación"}</label>
            <Search aria-hidden="true" />
            <input
              type="hidden"
              name="lang"
              value={locale}
            />
            <input
              id="tamv-global-search"
              type="search"
              name="q"
              minLength={3}
              maxLength={180}
              required
              autoComplete="off"
              placeholder={english ? "Search research…" : "Buscar investigación…"}
            />
            <button type="submit" aria-label={english ? "Submit search" : "Enviar búsqueda"}>{english ? "Search" : "Buscar"}</button>
          </form>
          <nav className={`primary-navigation${menuOpen ? " is-open" : ""}`} id="primary-navigation" aria-label={english ? "Main navigation" : "Navegación principal"}>
            {primaryNavigation.map((link) => (
              <Link key={link.href} href={localizedPath(link.href, locale)} aria-current={isNavigationPathActive(pathname, link.href) ? "page" : undefined} onClick={closeMenu}>{navigationLabel(link, locale)}</Link>
            ))}
            <details className="nav-discovery" key={pathname}>
              <summary>{english ? "Explore more" : "Más secciones"} <span aria-hidden="true">+</span></summary>
              <div className="nav-discovery-panel">
                {discoveryNavigation.map((link) => (
                  <Link key={link.href} href={localizedPath(link.href, locale)} aria-current={isNavigationPathActive(pathname, link.href) ? "page" : undefined} onClick={closeMenu}>{navigationLabel(link, locale)}</Link>
                ))}
              </div>
            </details>
            <div className="nav-actions">
              {!pathname.startsWith("/portal") && <LanguageSwitch pathname={pathname} locale={locale} />}
              <Link className="nav-profile" href={localizedPath("/portal/perfil", locale)} aria-label={english ? "My profile" : "Mi perfil"} onClick={closeMenu}>
                <UserRound aria-hidden="true" />
                <span>{english ? "Profile" : "Perfil"}</span>
              </Link>
              <TamvDonationCTA locale={locale} variant="compact" />
              <Link className="nav-contact" href={contactHash} onClick={closeMenu}>{english ? "Contact" : "Contacto"} <ArrowUpRight aria-hidden="true" /></Link>
              <Link className="nav-portal" href="/portal" onClick={closeMenu}>{english ? "Portal" : "Portal"} <ArrowUpRight aria-hidden="true" /></Link>
            </div>
          </nav>
          <button className="menu-toggle" type="button" aria-label={menuOpen ? (english ? "Close navigation" : "Cerrar navegación") : (english ? "Open navigation" : "Abrir navegación")} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((isOpen) => !isOpen)}>
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </header>
      <TamvAssistant locale={locale} />
    </>
  )
}
