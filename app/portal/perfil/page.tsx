import type { Metadata } from "next"
import { ProfileForm, type ProfileFormValue } from "@/components/portal/profile-form"
import { PortalNav } from "@/components/portal/portal-nav"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { requireUser } from "@/lib/auth-helpers"
import { getUserResearchProfile } from "@/lib/research/queries"

export const metadata: Metadata = { title: "Identidad de investigación", robots: { index: false } }
export const dynamic = "force-dynamic"

export default async function ResearcherProfilePage() {
  const account = await requireUser("/portal/perfil")
  const profile = await getUserResearchProfile(account.id)
  const initial: ProfileFormValue = profile ? {
    publicName: profile.publicName,
    affiliation: profile.affiliation,
    orcid: profile.orcid,
    isni: profile.isni,
    researchLines: profile.researchLines,
    isPublic: profile.isPublic,
    tri: profile.tri,
    verificationStatus: profile.verificationStatus,
  } : {
    publicName: account.name,
    affiliation: null,
    orcid: null,
    isni: null,
    researchLines: [],
    isPublic: false,
    tri: null,
    verificationStatus: "declared",
  }
  return <TamvAppShell><section className="portal-section container"><header className="portal-page-heading"><p className="eyebrow">IDENTIDAD DE INVESTIGACIÓN</p><h1>Una ficha bajo tu control.</h1><p>Completa datos de atribución y decide si quieres aparecer en el directorio público. El identificador TRI se asigna al guardar por primera vez.</p></header><PortalNav active="/portal/perfil" /><div className="portal-content-card profile-editor"><div><p className="eyebrow">PERFIL</p><h2>Información profesional</h2><p>El estado de verificación se conserva como declarado hasta una comprobación externa.</p></div><ProfileForm initial={initial} /></div></section></TamvAppShell>
}
