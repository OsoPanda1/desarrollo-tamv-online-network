import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Network } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { PortalNav } from "@/components/portal/portal-nav"
import { requireUser } from "@/lib/auth-helpers"
import { getPublicHcuGraph, getUserHcuModel, getUserHcuRuns, getUserResearchProfile } from "@/lib/research/queries"
import { HcuModelEditor } from "@/components/hcu/hcu-model-editor"

export const metadata: Metadata = { title: "Espacio privado HCU", robots: { index: false } }
export const dynamic = "force-dynamic"

export default async function HcuRunsPage() {
  const account = await requireUser("/portal/hcu")
  const [runs, publicGraph, privateModel, profile] = await Promise.all([getUserHcuRuns(account.id), getPublicHcuGraph(), getUserHcuModel(account.id), getUserResearchProfile(account.id)])
  return <TamvAppShell><section className="portal-section container"><header className="portal-page-heading"><p className="eyebrow">HCU / ESPACIO PRIVADO</p><h1>Modelos de trabajo y simulaciones.</h1><p>Tus borradores no se publican automáticamente. Cada corrida conserva su entrada, semilla, versión y huella del grafo usado.</p><Link className="button button-copper" href="/hcu#simulador">Abrir simulador <Network aria-hidden="true" /></Link></header><PortalNav active="/portal/hcu" />
    <HcuModelEditor identityRegistered={Boolean(profile?.tri && profile?.roleCode)} domains={publicGraph.domains.map(({ id, nameEs }) => ({ id, nameEs }))} publicAtoms={publicGraph.atoms.map(({ id, nameEs, influenceX, riskY, evidenceZ }) => ({ id, nameEs, influenceX, riskY, evidenceZ }))} ownAtoms={privateModel.atoms.map(({ id, domainId, nameEs, descriptionEs, influenceX, riskY, evidenceZ }) => ({ id, domainId, nameEs, descriptionEs, influenceX, riskY, evidenceZ }))} ownEdges={privateModel.edges.map(({ id, sourceAtomIds, targetAtomIds, sourceTitle, sourceUrl, weight, sign, delayYears, tqafLevel, evidenceStatus }) => ({ id, sourceAtomIds, targetAtomIds, sourceTitle, sourceUrl, weight, sign, delayYears, tqafLevel, evidenceStatus }))} />
    <section className="hcu-run-history" aria-labelledby="hcu-runs-title"><div className="content-card-heading"><div><p className="eyebrow">HCU / EJECUCIONES PRIVADAS</p><h2 id="hcu-runs-title">Historial reproducible</h2></div><span>{runs.length} {runs.length === 1 ? "corrida" : "corridas"}</span></div>
    {runs.length ? <div className="proposal-list">{runs.map((run) => <article className="proposal-list-card" key={run.id}><div className="proposal-list-heading"><div><span className="status-pill">{run.modelVersion}</span><h3><Link href={`/portal/hcu/${run.id}`}>{run.scenario} · {run.startYear}–{run.endYear}</Link></h3><p>{run.createdAt.toLocaleString("es-MX")} · semilla {run.seed}</p></div><ArrowUpRight aria-hidden="true" /></div><div className="hcu-hash-line"><span>Entrada · {run.inputHash.slice(0, 18)}…</span><span>Salida · {run.outputHash.slice(0, 18)}…</span></div><div className="proposal-list-meta"><span>SHA-256 · exportación FAIR privada</span><Link href={`/portal/hcu/${run.id}`}>Abrir ejecución <ArrowUpRight aria-hidden="true" /></Link></div></article>)}</div> : <div className="empty-panel"><h3>No hay simulaciones guardadas.</h3><p>Ejecuta un escenario en el mapa HCU; cada corrida queda asociada a tu cuenta.</p><Link className="button button-copper" href="/hcu#simulador">Abrir mapa HCU</Link></div>}
    </section>
  </section></TamvAppShell>
}
