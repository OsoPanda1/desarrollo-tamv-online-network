import Link from "next/link"
import { SignOutButton } from "@/components/portal/sign-out-button"

const links = [
  ["/portal", "Resumen"],
  ["/portal/perfil", "Identidad"],
  ["/portal/propuestas", "Propuestas"],
  ["/portal/intereses", "Intereses"],
  ["/portal/hcu", "Ejecuciones HCU"],
  ["/portal/moderacion", "Moderación"],
] as const

export function PortalNav({ active }: { active: string }) {
  return <nav className="portal-nav" aria-label="Navegación del portal">{links.map(([href, label]) => <Link className={active === href ? "is-active" : undefined} href={href} aria-current={active === href ? "page" : undefined} key={href}>{label}</Link>)}<SignOutButton /></nav>
}
