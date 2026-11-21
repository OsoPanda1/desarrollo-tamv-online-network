import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { PortalNav } from "@/components/portal/portal-nav"
import { requireUser } from "@/lib/auth-helpers"
import { getPublicResearchTopics, getUserInterests } from "@/lib/research/queries"

export const metadata: Metadata = { title: "Mis intereses de colaboración", robots: { index: false } }
export const dynamic = "force-dynamic"

export default async function InterestsPage() {
  const account = await requireUser("/portal/intereses")
  const [interests, topics] = await Promise.all([getUserInterests(account.id), getPublicResearchTopics()])
  const topicNames = new Map(topics.map((topic) => [topic.id, topic.titleEs]))
  return <TamvAppShell><section className="portal-section container"><header className="portal-page-heading"><p className="eyebrow">COLABORACIÓN</p><h1>Tus conversaciones, bajo tu control.</h1><p>Los intereses se guardan como privados. El consentimiento externo, si lo diste, es visible en cada registro.</p></header><PortalNav active="/portal/intereses" />
    {interests.length ? <div className="proposal-list">{interests.map((interest) => <article className="proposal-list-card interest-list-card" key={interest.id}><div className="proposal-list-heading"><div><span className="status-pill">{interest.status}</span><h2>{topicNames.get(interest.topicId ?? "") ?? "Interés general"}</h2><p>{({ join: "Sumarme a la conversación", cocreate: "Cocrear un trabajo", publish: "Compartir investigación", funding: "Introducción a posibles aliados o financiadores" } as Record<string, string>)[interest.interestType] ?? interest.interestType} · {interest.createdAt.toLocaleDateString("es-MX")}</p></div></div><p>{interest.message}</p><div className="proposal-list-meta"><span>{interest.consentToShare ? "Autorizaste compartir este mensaje" : "Solo visible en el portal TAMV"}</span><Link href="/investigacion">Explorar más temas <ArrowUpRight aria-hidden="true" /></Link></div></article>)}</div> : <div className="empty-panel"><h2>Aún no has guardado intereses.</h2><p>Explora las líneas de investigación y registra tu forma de participar.</p><Link className="button button-copper" href="/investigacion">Ver temas de investigación <ArrowUpRight aria-hidden="true" /></Link></div>}
  </section></TamvAppShell>
}
