import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Network } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { PortalNav } from "@/components/portal/portal-nav"
import { requireUser } from "@/lib/auth-helpers"
import { getUserHcuRuns } from "@/lib/research/queries"

export const metadata: Metadata = { title: "Mis ejecuciones HCU", robots: { index: false } }
export const dynamic = "force-dynamic"

export default async function HcuRunsPage() {
  const account = await requireUser("/portal/hcu")
  const runs = await getUserHcuRuns(account.id)
  return <TamvAppShell><section className="portal-section container"><header className="portal-page-heading"><p className="eyebrow">HCU / EJECUCIONES PRIVADAS</p><h1>Simulaciones con versión y semilla.</h1><p>El historial es privado a tu cuenta. Los hashes son resúmenes locales, no certificados ni anclajes externos.</p><Link className="button button-copper" href="/hcu#simulador">Abrir simulador <Network aria-hidden="true" /></Link></header><PortalNav active="/portal/hcu" />
    {runs.length ? <div className="proposal-list">{runs.map((run) => <article className="proposal-list-card" key={run.id}><div className="proposal-list-heading"><div><span className="status-pill">{run.modelVersion}</span><h2><Link href={`/portal/hcu/${run.id}`}>{run.scenario} · {run.startYear}–{run.endYear}</Link></h2><p>{run.createdAt.toLocaleString("es-MX")} · semilla {run.seed}</p></div><ArrowUpRight aria-hidden="true" /></div><div className="hcu-hash-line"><span>Entrada · {run.inputHash.slice(0, 18)}…</span><span>Salida · {run.outputHash.slice(0, 18)}…</span></div><div className="proposal-list-meta"><span>SHA-256 · exportación FAIR privada</span><Link href={`/portal/hcu/${run.id}`}>Abrir ejecución <ArrowUpRight aria-hidden="true" /></Link></div></article>)}</div> : <div className="empty-panel"><h2>No hay simulaciones guardadas.</h2><p>Ejecuta un escenario en el mapa HCU; cada corrida queda asociada a tu cuenta.</p><Link className="button button-copper" href="/hcu#simulador">Abrir mapa HCU</Link></div>}
  </section></TamvAppShell>
}
