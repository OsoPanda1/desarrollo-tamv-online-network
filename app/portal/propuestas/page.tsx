import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Plus } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { PortalNav } from "@/components/portal/portal-nav"
import { requireUser } from "@/lib/auth-helpers"
import { proposalStatusLabels } from "@/lib/research/workflow"
import { getUserProposals } from "@/lib/research/queries"

export const metadata: Metadata = { title: "Mis propuestas", robots: { index: false } }
export const dynamic = "force-dynamic"

export default async function UserProposalsPage() {
  const account = await requireUser("/portal/propuestas")
  const proposals = await getUserProposals(account.id)
  return <TamvAppShell><section className="portal-section container"><header className="portal-page-heading"><p className="eyebrow">TRABAJO ACADÉMICO</p><h1>Tus propuestas, con seguimiento.</h1><p>Los envíos comienzan como privados. El estado muestra el proceso editorial, no una acreditación ni revisión por pares.</p><Link className="button button-copper" href="/portal/propuestas/nueva">Nueva propuesta <Plus aria-hidden="true" /></Link></header><PortalNav active="/portal/propuestas" />
    {proposals.length ? <div className="proposal-list">{proposals.map((proposal) => <article className="proposal-list-card" key={proposal.id}><div className="proposal-list-heading"><div><span className="status-pill">{proposalStatusLabels[proposal.status]?.[0] ?? proposal.status}</span><h2><Link href={`/portal/propuestas/${proposal.id}`}>{proposal.title}</Link></h2><p>{proposal.proposalType} · {proposal.createdAt.toLocaleDateString("es-MX")}</p></div><ArrowUpRight aria-hidden="true" /></div><p>{proposal.abstract.slice(0, 260)}{proposal.abstract.length > 260 ? "…" : ""}</p><div className="proposal-list-meta"><span>{proposal.visibility === "public" ? "Resumen público con consentimiento" : "Privada"}</span><Link href={`/portal/propuestas/${proposal.id}`}>Abrir seguimiento <ArrowUpRight aria-hidden="true" /></Link></div></article>)}</div> : <div className="empty-panel"><h2>Aún no hay propuestas.</h2><p>Comparte un artículo, dataset, tesis, reporte, prototipo o recurso docente.</p><Link className="button button-copper" href="/portal/propuestas/nueva">Iniciar propuesta <Plus aria-hidden="true" /></Link></div>}
  </section></TamvAppShell>
}
