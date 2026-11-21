import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, BookOpen, FileText, Network, UserRound } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { PortalNav } from "@/components/portal/portal-nav"
import { getAppRole, requireUser } from "@/lib/auth-helpers"
import { getPortalCounts, getUserResearchProfile } from "@/lib/research/queries"

export const metadata: Metadata = { title: "Portal de investigación", robots: { index: false } }
export const dynamic = "force-dynamic"

export default async function PortalPage() {
  const account = await requireUser()
  const [profile, counts, role] = await Promise.all([
    getUserResearchProfile(account.id),
    getPortalCounts(account.id),
    getAppRole(account.id),
  ])
  return <TamvAppShell>
    <section className="portal-section container">
      <header className="portal-welcome"><div><p className="eyebrow">ESPACIO PRIVADO DE INVESTIGACIÓN</p><h1>Hola, {profile?.publicName ?? account.name}.</h1><p>Un espacio para dar seguimiento a tu identidad, propuestas, colaboraciones y ejecuciones HCU.</p></div><span className="portal-role">{role === "member" ? "INVESTIGADOR/A" : role.toUpperCase()}</span></header>
      <PortalNav active="/portal" />
      <div className="portal-metrics-grid">
        <article><FileText aria-hidden="true" /><strong>{counts.proposals}</strong><span>Propuestas en tu cuenta</span><Link href="/portal/propuestas">Ver propuestas <ArrowUpRight aria-hidden="true" /></Link></article>
        <article><UserRound aria-hidden="true" /><strong>{profile ? "01" : "—"}</strong><span>{profile ? `Identidad ${profile.tri ?? "declarada"}` : "Perfil de investigación"}</span><Link href="/portal/perfil">{profile ? "Editar perfil" : "Crear perfil"} <ArrowUpRight aria-hidden="true" /></Link></article>
        <article><Network aria-hidden="true" /><strong>{counts.runs}</strong><span>Simulaciones HCU guardadas</span><Link href="/portal/hcu">Ver ejecuciones <ArrowUpRight aria-hidden="true" /></Link></article>
        <article><BookOpen aria-hidden="true" /><strong>{counts.interests}</strong><span>Intereses de colaboración</span><Link href="/portal/intereses">Revisar intereses <ArrowUpRight aria-hidden="true" /></Link></article>
      </div>
      <div className="portal-next-steps"><div><p className="eyebrow">SIGUIENTE PASO</p><h2>{profile ? "Mantén la procedencia al día." : "Completa tu perfil de investigación."}</h2><p>Tu perfil es privado al crearse. Solo se publica si activas esa opción; ORCID e ISNI permanecen como identificadores declarados hasta una verificación externa.</p></div><Link className="button button-copper" href={profile ? "/portal/propuestas/nueva" : "/portal/perfil"}>{profile ? "Crear propuesta" : "Configurar perfil"} <ArrowUpRight aria-hidden="true" /></Link></div>
    </section>
  </TamvAppShell>
}
