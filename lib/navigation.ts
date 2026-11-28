import type { Locale } from "@/lib/i18n"

export type NavigationLink = {
  href: string
  labelEs: string
  labelEn: string
}

export type NavigationGroup = {
  id: string
  labelEs: string
  labelEn: string
  links: NavigationLink[]
}

export const primaryNavigation: NavigationLink[] = [
  { href: "/proyectos", labelEs: "Proyectos", labelEn: "Projects" },
  { href: "/guia", labelEs: "Guía práctica", labelEn: "Practical guide" },
  { href: "/origenes", labelEs: "Orígenes", labelEn: "Origins" },
  { href: "/atlas", labelEs: "Atlas", labelEn: "Atlas" },
]

export const discoveryNavigation: NavigationLink[] = [
  { href: "/investigacion", labelEs: "Investigación", labelEn: "Research" },
  { href: "/investigadores", labelEs: "Perfiles", labelEn: "Profiles" },
  { href: "/ecosistema", labelEs: "Ecosistema", labelEn: "Ecosystem" },
  { href: "/desarrolladores", labelEs: "Desarrolladores", labelEn: "Developers" },
  { href: "/estandar", labelEs: "Estándar", labelEn: "Standard" },
  { href: "/membresias", labelEs: "Membresías", labelEn: "Memberships" },
  { href: "/institucionalizacion", labelEs: "Institucionalización", labelEn: "Institutional pathway" },
  { href: "/gobernanza", labelEs: "Gobernanza", labelEn: "Governance" },
  { href: "/soberania-digital", labelEs: "Soberanía digital e IA", labelEn: "Digital sovereignty and AI" },
]

export const userNavigation: NavigationGroup[] = [
  {
    id: "user-start",
    labelEs: "Comenzar",
    labelEn: "Get started",
    links: [
      { href: "/guia", labelEs: "Guía práctica", labelEn: "Practical guide" },
      { href: "/formacion", labelEs: "Formación", labelEn: "Learning" },
      { href: "/comunidad", labelEs: "Comunidad", labelEn: "Community" },
      { href: "/membresias", labelEs: "Membresías", labelEn: "Memberships" },
    ],
  },
  {
    id: "user-research",
    labelEs: "Investigar y consultar",
    labelEn: "Research and discover",
    links: [
      { href: "/investigacion", labelEs: "Investigación", labelEn: "Research" },
      { href: "/investigacion/publicaciones", labelEs: "Publicaciones", labelEn: "Publications" },
      { href: "/investigadores", labelEs: "Perfiles públicos", labelEn: "Public profiles" },
      { href: "/fuentes", labelEs: "Fuentes", labelEn: "Sources" },
      { href: "/soberania-digital", labelEs: "Soberanía digital e IA", labelEn: "Digital sovereignty and AI" },
    ],
  },
  {
    id: "user-create",
    labelEs: "Crear y publicar",
    labelEn: "Create and publish",
    links: [
      { href: "/portal/propuestas/nueva", labelEs: "Nueva propuesta", labelEn: "New proposal" },
      { href: "/portal/propuestas", labelEs: "Mis propuestas", labelEn: "My proposals" },
      { href: "/hcu", labelEs: "Mapa HCU", labelEn: "HCU map" },
      { href: "/atlas", labelEs: "Atlas visual", labelEn: "Visual atlas" },
    ],
  },
  {
    id: "user-account",
    labelEs: "Mi espacio",
    labelEn: "My space",
    links: [
      { href: "/portal", labelEs: "Portal", labelEn: "Portal" },
      { href: "/portal/perfil", labelEs: "Identidad", labelEn: "Identity" },
      { href: "/portal/intereses", labelEs: "Intereses", labelEn: "Interests" },
      { href: "/cuenta", labelEs: "Cuenta", labelEn: "Account" },
      { href: "/apoyar", labelEs: "Apoyar", labelEn: "Support" },
    ],
  },
]

export const organizationNavigation: NavigationGroup[] = [
  {
    id: "organization-companies",
    labelEs: "Empresas e inversión",
    labelEn: "Companies and investment",
    links: [
      { href: "/institucionalizacion", labelEs: "Institucionalización", labelEn: "Institutional pathway" },
      { href: "/membresias", labelEs: "Membresías", labelEn: "Memberships" },
      { href: "/unete", labelEs: "Participar", labelEn: "Participate" },
      { href: "/apoyar", labelEs: "Apoyo", labelEn: "Support" },
    ],
  },
  {
    id: "organization-institutions",
    labelEs: "Instituciones",
    labelEn: "Institutions",
    links: [
      { href: "/quienes-somos", labelEs: "Identidad institucional", labelEn: "Institutional identity" },
      { href: "/gobernanza", labelEs: "Gobernanza", labelEn: "Governance" },
      { href: "/soberania-digital", labelEs: "Soberanía digital e IA", labelEn: "Digital sovereignty and AI" },
      { href: "/estandar", labelEs: "Estándar de integridad", labelEn: "Integrity standard" },
      { href: "/utamv", labelEs: "UTAMV", labelEn: "UTAMV" },
    ],
  },
  {
    id: "organization-academies",
    labelEs: "Academias e investigación",
    labelEn: "Academies and research",
    links: [
      { href: "/investigacion", labelEs: "Agenda abierta", labelEn: "Open agenda" },
      { href: "/investigacion/publicaciones", labelEs: "Publicaciones", labelEn: "Publications" },
      { href: "/investigadores", labelEs: "Investigadores", labelEn: "Researchers" },
      { href: "/excelencia", labelEs: "Excelencia", labelEn: "Excellence" },
      { href: "/soberania-digital", labelEs: "Soberanía digital e IA", labelEn: "Digital sovereignty and AI" },
      { href: "/auditoria-creator", labelEs: "Auditoría creator", labelEn: "Creator audit" },
    ],
  },
  {
    id: "organization-development",
    labelEs: "Desarrollo e innovación",
    labelEn: "Development and innovation",
    links: [
      { href: "/desarrolladores", labelEs: "Desarrolladores", labelEn: "Developers" },
      { href: "/arquitectura", labelEs: "Arquitectura", labelEn: "Architecture" },
      { href: "/ecosistema", labelEs: "Ecosistema", labelEn: "Ecosystem" },
      { href: "/proyectos", labelEs: "Proyectos", labelEn: "Projects" },
    ],
  },
]

export function navigationLabel(link: NavigationLink, locale: Locale) {
  return locale === "en" ? link.labelEn : link.labelEs
}

export function isNavigationPathActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
}
