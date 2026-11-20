"use client"

import { ArrowUpRight, Menu, X } from "lucide-react"
import { useState } from "react"

const links = [
  { href: "#institucion", label: "Institución" },
  { href: "#ecosistema", label: "Ecosistema" },
  { href: "#investigacion", label: "Investigación" },
  { href: "#gobernanza", label: "Gobernanza" },
  { href: "#hoja-de-ruta", label: "Hoja de ruta" },
]

export function TamvSiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="site-header">
      <div className="utility-bar">
        <div className="container utility-inner">
          <span>INVESTIGACIÓN · TECNOLOGÍA · MEMORIA VIVA</span>
          <span>MINERAL DEL MONTE · HIDALGO · MÉXICO</span>
        </div>
      </div>
      <div className="container header-inner">
        <a className="brand-lockup" href="#inicio" aria-label="TAMV Online Network, inicio" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-type">
            <strong>TAMV</strong>
            <small>ONLINE NETWORK</small>
          </span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Cerrar navegación" : "Abrir navegación"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav
          className={`primary-navigation${menuOpen ? " is-open" : ""}`}
          id="primary-navigation"
          aria-label="Navegación principal"
        >
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={closeMenu}>
              {link.label}
            </a>
          ))}
          <a className="nav-contact" href="#contacto" onClick={closeMenu}>
            Contacto <ArrowUpRight aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  )
}
