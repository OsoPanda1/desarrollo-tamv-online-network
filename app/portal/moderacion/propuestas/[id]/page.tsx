import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { TqafAssessmentPanel } from "@/components/portal/tqaf-assessment-panel"
import { PortalNav } from "@/components/portal/portal-nav"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { requireModeratorPage } from "@/lib/auth-helpers"
import { db } from "@/lib/db"
import { researchProposals } from "@/lib/db/schema"
import { getTqafAssessmentsForProposal } from "@/lib/research/queries"
import { eq } from "drizzle-orm"

export const metadata: Metadata = { title: "Evaluación TQAF", robots: { index: false } }
export const dynamic = "force-dynamic"
type Params = Promise<{ id: string }>

export default async function TqafReviewPage({ params }: { params: Params }) {
  const { user } = await requireModeratorPage()
  const { id } = await params
  const [proposal] = await db
    .select({ id: researchProposals.id, userId: researchProposals.userId, title: researchProposals.title, abstract: researchProposals.abstract, status: researchProposals.status })
    .from(researchProposals)
    .where(eq(researchProposals.id, id))
    .limit(1)
  if (!proposal) notFound()
  if (proposal.userId === user.id) redirect("/portal/moderacion")
  const assessments = await getTqafAssessmentsForProposal(proposal.id, proposal.userId)

  return <TamvAppShell><section className="portal-section container">
    <header className="portal-page-heading"><p className="eyebrow">EVALUACIÓN DE EVIDENCIA · TQAF-10</p><h1>{proposal.title}</h1><p>Estado editorial: {proposal.status}. La evaluación se registra como evento encadenado y no sustituye un proceso de revisión externa.</p><Link className="text-link" href="/portal/moderacion"><ArrowLeft aria-hidden="true" /> Volver a moderación</Link></header>
    <PortalNav active="/portal/moderacion" />
    <article className="portal-content-card tqaf-proposal-summary"><p className="eyebrow">RESUMEN PRIVADO</p><p>{proposal.abstract}</p></article>
    <TqafAssessmentPanel proposalId={proposal.id} assessments={assessments} mode="reviewer" />
  </section></TamvAppShell>
}
