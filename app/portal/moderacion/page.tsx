import type { Metadata } from "next"
import { desc, eq, inArray } from "drizzle-orm"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { AdminBootstrapForm } from "@/components/portal/admin-bootstrap-form"
import { ModerationControls } from "@/components/portal/moderation-controls"
import { PortalNav } from "@/components/portal/portal-nav"
import { getAppRole, getServerSession } from "@/lib/auth-helpers"
import { db } from "@/lib/db"
import { adminBootstrapState, collaborationInterests, researchProposals, researchTopics, user } from "@/lib/db/schema"
import { proposalStatusLabels } from "@/lib/research/workflow"
import { redirect } from "next/navigation"

export const metadata: Metadata = { title: "Moderación editorial", robots: { index: false } }
export const dynamic = "force-dynamic"

export default async function ModerationPage() {
  const session = await getServerSession()
  if (!session?.user) redirect("/sign-in?next=%2Fportal%2Fmoderacion")
  const role = await getAppRole(session.user.id)
  const canReview = ["admin", "editor", "reviewer"].includes(role)

  if (!canReview) {
    const [bootstrap] = await db.select({ claimedAt: adminBootstrapState.claimedAt }).from(adminBootstrapState).where(inArray(adminBootstrapState.id, [1])).limit(1)
    return <TamvAppShell><section className="portal-section container"><header className="portal-page-heading"><p className="eyebrow">GOBERNANZA EDITORIAL</p><h1>Moderación con permisos.</h1><p>El acceso requiere una sesión y un rol editorial verificado en el servidor.</p></header><PortalNav active="/portal/moderacion" />
      {!bootstrap?.claimedAt && role === "member" ? <div className="portal-content-card profile-editor"><div><p className="eyebrow">CONFIGURACIÓN DE UN SOLO USO</p><h2>Reclamar administración inicial</h2><p>La cuenta que posea el token de instalación puede reclamar el rol una sola vez. El token no se almacena.</p></div><AdminBootstrapForm /></div> : <div className="empty-panel"><h2>No tienes permisos de moderación.</h2><p>Solicita una invitación editorial al equipo responsable.</p></div>}
    </section></TamvAppShell>
  }

  const proposals = await db
    .select({ id: researchProposals.id, title: researchProposals.title, abstract: researchProposals.abstract, proposalType: researchProposals.proposalType, status: researchProposals.status, shareConsent: researchProposals.shareConsent, createdAt: researchProposals.createdAt })
    .from(researchProposals)
    .where(inArray(researchProposals.status, ["received", "triage", "in_review", "changes_requested", "accepted", "appealed"]))
    .orderBy(desc(researchProposals.createdAt))
  const interests = await db
    .select({ id: collaborationInterests.id, interestType: collaborationInterests.interestType, message: collaborationInterests.message, consentToShare: collaborationInterests.consentToShare, status: collaborationInterests.status, createdAt: collaborationInterests.createdAt, email: user.email, topicTitle: researchTopics.titleEs })
    .from(collaborationInterests)
    .innerJoin(user, eq(user.id, collaborationInterests.userId))
    .leftJoin(researchTopics, eq(researchTopics.id, collaborationInterests.topicId))
    .orderBy(desc(collaborationInterests.createdAt))
    .limit(100)

  return <TamvAppShell><section className="portal-section container"><header className="portal-page-heading"><p className="eyebrow">CONSOLA EDITORIAL · {role.toUpperCase()}</p><h1>Revisión y triage.</h1><p>Revisa solo lo necesario. Declara conflictos, registra retroalimentación y sigue las transiciones publicadas.</p></header><PortalNav active="/portal/moderacion" />
    {proposals.length ? <div className="moderation-queue">{proposals.map((proposal) => <article className="moderation-card" key={proposal.id}><div className="moderation-proposal"><div className="proposal-list-heading"><div><span className="status-pill">{proposalStatusLabels[proposal.status]?.[0] ?? proposal.status}</span><h2>{proposal.title}</h2><p>{proposal.proposalType} · recibido {proposal.createdAt.toLocaleDateString("es-MX")}</p></div></div><p>{proposal.abstract}</p><p className="form-note">{proposal.shareConsent ? "La persona autora autorizó que el resumen pueda hacerse público si se publica." : "Sin consentimiento de difusión pública; no publicar."}</p></div><div className="moderation-action"><ModerationControls proposalId={proposal.id} status={proposal.status} /></div></article>)}</div> : <div className="empty-panel"><h2>La cola está al día.</h2><p>No hay propuestas pendientes de revisión.</p></div>}
    <section className="moderation-interest-section" aria-labelledby="interest-queue-title"><header className="portal-page-heading"><p className="eyebrow">COLABORACIÓN Y ALCANCE</p><h2 id="interest-queue-title">Solicitudes de colaboración y financiación.</h2><p>La revisión es manual. No se envían datos a terceros ni se prometen inversiones; compartir fuera de TAMV requiere consentimiento explícito.</p></header>
      {interests.length ? <div className="moderation-queue">{interests.map((interest) => {
        const interestLabels: Record<string, string> = { join: "Sumarse a la conversación", cocreate: "Cocrear un trabajo", publish: "Compartir investigación", funding: "Introducción a posibles aliados o financiadores" }
        const subject = encodeURIComponent(`TAMV · seguimiento de ${interestLabels[interest.interestType] ?? "colaboración"}`)
        return <article className="moderation-card moderation-interest-card" key={interest.id}><div className="moderation-proposal"><div className="proposal-list-heading"><div><span className="status-pill">{interest.status}</span><h3>{interestLabels[interest.interestType] ?? interest.interestType}</h3><p>{interest.topicTitle ?? "Interés general"} · {interest.createdAt.toLocaleDateString("es-MX")}</p></div></div><p>{interest.message}</p><p className="form-note">{interest.consentToShare ? "Consentimiento registrado para una posible introducción externa; confirmar alcance antes de compartir." : "Sin consentimiento para compartir fuera de TAMV; mantener contacto interno únicamente."}</p></div><div className="moderation-action"><a className="button button-outline-light" href={`mailto:${encodeURIComponent(interest.email)}?subject=${subject}`}>Responder por correo</a></div></article>
      })}</div> : <div className="empty-panel"><h3>No hay solicitudes de colaboración.</h3><p>Las expresiones de interés nuevas aparecerán aquí para revisión humana.</p></div>}
    </section>
  </section></TamvAppShell>
}
