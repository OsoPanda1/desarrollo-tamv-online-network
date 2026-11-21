import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { AppealForm } from "@/components/portal/appeal-form"
import { ConsentControl } from "@/components/portal/consent-control"
import { EvidenceForm } from "@/components/portal/evidence-form"
import { PortalNav } from "@/components/portal/portal-nav"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { requireUser } from "@/lib/auth-helpers"
import { proposalStatusLabels } from "@/lib/research/workflow"
import { getUserProposal } from "@/lib/research/queries"

export const metadata: Metadata = { title: "Seguimiento de propuesta", robots: { index: false } }
export const dynamic = "force-dynamic"
type Params = Promise<{ id: string }>

export default async function ProposalDetailPage({ params }: { params: Params }) {
  const account = await requireUser()
  const { id } = await params
  const record = await getUserProposal(account.id, id)
  if (!record) notFound()
  const { proposal, events, evidence, reviews, appeals } = record
  const status = proposalStatusLabels[proposal.status]?.[0] ?? proposal.status
  const isClosed = ["published", "withdrawn"].includes(proposal.status)

  return <TamvAppShell><section className="portal-section container">
    <header className="portal-page-heading"><p className="eyebrow">SEGUIMIENTO DE PROPUESTA</p><h1>{proposal.title}</h1><p><span className="status-pill">{status}</span> · {proposal.proposalType} · {proposal.createdAt.toLocaleDateString("es-MX")}</p><Link className="text-link" href="/portal/propuestas"><ArrowLeft aria-hidden="true" /> Volver a mis propuestas</Link></header>
    <PortalNav active="/portal/propuestas" />
    <div className="proposal-detail-grid">
      <div className="proposal-detail-main">
        <article className="portal-content-card"><p className="eyebrow">RESUMEN</p><p className="proposal-abstract">{proposal.abstract}</p><dl className="proposal-record-data"><div><dt>VISIBILIDAD</dt><dd>{proposal.visibility === "public" ? "Público" : "Privado"}</dd></div><div><dt>LICENCIA</dt><dd>{proposal.license ?? "No declarada"}</dd></div><div><dt>FUENTE</dt><dd>{proposal.sourceUrl ? <a href={proposal.sourceUrl} target="_blank" rel="noopener noreferrer">{proposal.sourceUrl} <ArrowUpRight aria-hidden="true" /></a> : "No proporcionada"}</dd></div></dl><p className="form-note">El consentimiento autoriza la difusión del resumen al publicarse; no hace públicas automáticamente las referencias de evidencia.</p>{!isClosed && <ConsentControl proposalId={proposal.id} initialValue={proposal.shareConsent} />}</article>
        <article className="portal-content-card"><div className="content-card-heading"><div><p className="eyebrow">PROCEDENCIA</p><h2>Referencias y versiones</h2></div><span>{evidence.length} {evidence.length === 1 ? "referencia" : "referencias"}</span></div>{evidence.length ? <ul className="evidence-list">{evidence.map((item) => <li key={item.id}><div><strong>{item.label}</strong><span>{item.kind} · v{item.version} · {item.verificationStatus}</span>{item.description && <p>{item.description}</p>}</div><a href={item.url} target="_blank" rel="noopener noreferrer">Abrir <ArrowUpRight aria-hidden="true" /></a></li>)}</ul> : <p className="form-note">Aún no hay referencias registradas.</p>}{!isClosed && <details className="inline-disclosure"><summary>Añadir referencia de evidencia</summary><EvidenceForm proposalId={proposal.id} /></details>}</article>
        <article className="portal-content-card"><p className="eyebrow">HISTORIAL</p><h2>Eventos editoriales</h2>{events.length ? <ol className="proposal-timeline">{events.map((event) => <li key={event.id}><span className="timeline-dot" /><div><strong>{event.action.replaceAll("_", " ")}</strong><time dateTime={event.createdAt.toISOString()}>{event.createdAt.toLocaleString("es-MX")}</time>{event.detail && <p>{event.detail}</p>}{event.eventHash && <code>SHA-256 · {event.eventHash.slice(0, 20)}…</code>}</div></li>)}</ol> : <p>No hay eventos registrados.</p>}
          {reviews.length > 0 && <div className="review-feedback-list"><h3>Retroalimentación</h3>{reviews.map((review) => <article key={review.id}><span>{review.conflictOfInterest ? "Recusación por conflicto" : review.outcome}</span><p>{review.feedback}</p><time dateTime={review.createdAt.toISOString()}>{review.createdAt.toLocaleDateString("es-MX")}</time></article>)}</div>}
          {appeals.map((appeal) => <div className="detail-note" key={appeal.id}><strong>Apelación · {appeal.status}</strong><span>{appeal.reason}{appeal.resolutionNote ? ` — ${appeal.resolutionNote}` : ""}</span></div>)}
        </article>
        {proposal.status === "rejected" && <article className="portal-content-card"><p className="eyebrow">VÍA DE APELACIÓN</p><h2>Solicita una segunda revisión.</h2><p>La apelación debe asignarse a una persona distinta de quien tomó la decisión original.</p><Link className="button button-outline-light" href={`/portal/propuestas/${proposal.id}/apelar`}>Presentar apelación <ArrowUpRight aria-hidden="true" /></Link></article>}
      </div>
      <aside className="proposal-detail-aside"><p className="eyebrow">ESTADO ACTUAL</p><h2>{status}</h2><p>El estado describe el flujo editorial local. No debe interpretarse como acreditación, certificación ni revisión externa.</p><Link className="text-link" href="/gobernanza#proceso">Consultar reglas editoriales <ArrowUpRight aria-hidden="true" /></Link></aside>
    </div>
  </section></TamvAppShell>
}
