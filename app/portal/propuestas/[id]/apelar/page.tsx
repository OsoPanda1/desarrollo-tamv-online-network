import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { AppealForm } from "@/components/portal/appeal-form"
import { PortalNav } from "@/components/portal/portal-nav"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { requireUser } from "@/lib/auth-helpers"
import { getUserProposal } from "@/lib/research/queries"

export const metadata: Metadata = { title: "Apelar una decisión", robots: { index: false } }
export const dynamic = "force-dynamic"
type Params = Promise<{ id: string }>

export default async function ProposalAppealPage({ params }: { params: Params }) {
  const account = await requireUser()
  const { id } = await params
  const record = await getUserProposal(account.id, id)
  const appealOpen = record?.appeals.some((appeal) => appeal.status === "received" || appeal.status === "under_review") ?? false
  if (!record || (record.proposal.status !== "rejected" && !appealOpen)) notFound()
  return <TamvAppShell><section className="portal-section container"><header className="portal-page-heading"><p className="eyebrow">REVISIÓN Y CORRECCIÓN</p><h1>Presenta una apelación.</h1><p>Las apelaciones se asignan a una persona distinta de quien tomó la decisión original.</p></header><PortalNav active="/portal/propuestas" /><div className="portal-content-card profile-editor"><div><p className="eyebrow">{record.proposal.title}</p><h2>Motivo de revisión</h2><p>Describe los puntos de procedimiento o contexto que deseas que se revisen.</p></div><AppealForm proposalId={id} submitted={appealOpen} /></div></section></TamvAppShell>
}
