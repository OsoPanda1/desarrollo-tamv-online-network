"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRight, Menu, X } from "lucide-react"
import { useState } from "react"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { TamvDonationCTA } from "@/components/shared/tamv-donation-cta"
import { localizedPath, type Locale } from "@/lib/i18n"
import { TamvAssistant } from "@/components/tamv-assistant"

const links = [
  { href: "/proyectos", labelEs: "Proyectos", labelEn: "Projects" },
  { href: "/investigacion", labelEs: "Investigación", labelEn: "Research" },
  { href: "/comunidad", labelEs: "Comunidad", labelEn: "Community" },
  { href: "/desarrolladores", labelEs: "Desarrolladores", labelEn: "Developers" },
  { href: "/membresias", labelEs: "Membresías", labelEn: "Memberships" },
  { href: "/hcu", labelEs: "Mapa HCU", labelEn: "HCU map" },
  { href: "/fuentes", labelEs: "Fuentes", labelEn: "Sources" },
  { href: "/gobernanza", labelEs: "Gobernanza", labelEn: "Governance" },
]

export function TamvSiteHeader({ locale = "es" }: { locale?: Locale }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const english = locale === "en"
  const homeHash = pathname === "/" ? "#inicio" : `${localizedPath("/", locale)}#inicio`
  const contactHash = pathname === "/" ? "#contacto" : `${localizedPath("/", locale)}#contacto`

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
        <button className="menu-toggle" type="button" aria-label={menuOpen ? (english ? "Close navigation" : "Cerrar navegación") : (english ? "Open navigation" : "Abrir navegación")} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((isOpen) => !isOpen)}>
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav className={`primary-navigation${menuOpen ? " is-open" : ""}`} id="primary-navigation" aria-label={english ? "Main navigation" : "Navegación principal"}>
          {links.map((link) => (
            <Link key={link.href} href={localizedPath(link.href, locale)} aria-current={pathname.startsWith(link.href) ? "page" : undefined} onClick={closeMenu}>{english ? link.labelEn : link.labelEs}</Link>
          ))}
          <Link href={`${localizedPath("/", locale)}#guia`} onClick={closeMenu}>{english ? "Guide" : "Guía"}</Link>
          {!pathname.startsWith("/portal") && <LanguageSwitch pathname={pathname} locale={locale} />}
          <TamvDonationCTA locale={locale} variant="compact" />
          <Link className="nav-contact" href={contactHash} onClick={closeMenu}>{english ? "Contact" : "Contacto"} <ArrowUpRight aria-hidden="true" /></Link>
          <Link className="nav-portal" href="/portal" onClick={closeMenu}>{english ? "Portal" : "Portal"} <ArrowUpRight aria-hidden="true" /></Link>
        </nav>
      </div>
    </header>
    <TamvAssistant locale={locale} />
    </>
  )
}
