import type { Metadata } from "next"
import { ProposalForm } from "@/components/portal/proposal-form"
import { PortalNav } from "@/components/portal/portal-nav"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { requireUser } from "@/lib/auth-helpers"
import { getPublicResearchTopics } from "@/lib/research/queries"

export const metadata: Metadata = { title: "Nueva propuesta", robots: { index: false } }
export const dynamic = "force-dynamic"
type SearchParams = Promise<{ topic?: string }>

export default async function NewProposalPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser("/portal/propuestas/nueva")
  const [{ topic }, topics] = await Promise.all([searchParams, getPublicResearchTopics()])
  return <TamvAppShell><section className="portal-section container"><header className="portal-page-heading"><p className="eyebrow">ENVÍO PRIVADO</p><h1>Presenta un trabajo para conversación editorial.</h1><p>El resumen solo se publica tras decisión editorial y consentimiento explícito. Un envío no garantiza aceptación ni financiación.</p></header><PortalNav active="/portal/propuestas" /><div className="portal-content-card proposal-editor"><div><p className="eyebrow">PROPUESTA</p><h2>Información inicial</h2><p>Incluye una pregunta clara, el método disponible, las fuentes y los límites actuales del trabajo.</p></div><ProposalForm topics={topics.map(({ id, slug, titleEs }) => ({ id, slug, titleEs }))} initialTopicId={topic ?? ""} /></div></section></TamvAppShell>
}
