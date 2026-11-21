import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { PortalNav } from "@/components/portal/portal-nav"
import { TamvAppShell } from "@/components/tamv-app-shell"
import type { HcuSimulationOutput } from "@/lib/hcu/model"
import { requireUser } from "@/lib/auth-helpers"
import { getUserHcuRun } from "@/lib/research/queries"

export const metadata: Metadata = { title: "Ejecución HCU", robots: { index: false } }
export const dynamic = "force-dynamic"
type Params = Promise<{ id: string }>

export default async function HcuRunDetailPage({ params }: { params: Params }) {
  const account = await requireUser()
  const { id } = await params
  const run = await getUserHcuRun(account.id, id)
  if (!run) notFound()
  const output = run.output as HcuSimulationOutput
  return <TamvAppShell><section className="portal-section container"><header className="portal-page-heading"><p className="eyebrow">EJECUCIÓN HCU · {run.modelVersion}</p><h1>{run.scenario} · {run.startYear}–{run.endYear}</h1><p>Semilla {run.seed} · {run.createdAt.toLocaleString("es-MX")}</p><Link className="text-link" href="/portal/hcu"><ArrowLeft aria-hidden="true" /> Volver al historial</Link></header><PortalNav active="/portal/hcu" /><div className="portal-content-card"><div className="content-card-heading"><div><p className="eyebrow">SERIE ANUAL</p><h2>Rango de variación de la simulación</h2></div><Link className="text-link" href={`/api/v1/hcu/runs/${run.id}/export`} target="_blank">Exportar JSON-LD <ArrowUpRight aria-hidden="true" /></Link></div><div className="hcu-series">{output.series.map((point) => <div className="hcu-series-row" key={point.year}><strong>{point.year}</strong><div className="hcu-range-track" aria-label={`${point.year}: ${point.p10}–${point.p90}; mediana ${point.median}`}><span className="hcu-range" style={{ left: `${point.p10}%`, width: `${Math.max(0, point.p90 - point.p10)}%` }} /><i className="hcu-median" style={{ left: `${point.median}%` }} /></div><span>{point.median.toFixed(1)}</span></div>)}</div><dl className="proposal-record-data"><div><dt>SHA-256 DE ENTRADA</dt><dd><code>{run.inputHash}</code></dd></div><div><dt>SHA-256 DE SALIDA</dt><dd><code>{run.outputHash}</code></dd></div></dl><div className="detail-note"><strong>Supuestos y límites</strong><span>{output.assumptions.join(" ")}</span></div></div></section></TamvAppShell>
}
