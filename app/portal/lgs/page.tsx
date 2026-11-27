import type { Metadata } from "next"
import { ShieldCheck } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { requireLgsFounder } from "@/lib/lgs-founder-guard"
import { LgsGovernanceWorkspace } from "@/components/lgs/lgs-governance-workspace"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const metadata: Metadata = {
  title: "LATAMV Governance System — Espacio fundacional",
  description: "Espacio privado de trabajo normativo y técnico de LATAMV Governance System.",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
}

export default async function LgsFounderPage() {
  const founder = await requireLgsFounder()
  return (
    <TamvAppShell>
      <main className="lgs-workspace container" aria-labelledby="lgs-title">
        <header className="lgs-private-header">
          <div>
            <p className="eyebrow">TAMV ONLINE NETWORK · ESPACIO RESTRINGIDO</p>
            <h1 id="lgs-title">LATAMV Governance System</h1>
            <p>Especificación fundacional, laboratorio de evidencia y arquitectura de conformidad.</p>
          </div>
          <div className="lgs-access-status" role="status">
            <ShieldCheck aria-hidden="true" />
            <span><strong>Acceso autorizado</strong><small>{founder.email}</small></span>
          </div>
        </header>
        <LgsGovernanceWorkspace />
      </main>
    </TamvAppShell>
  )
}
