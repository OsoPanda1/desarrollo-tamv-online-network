"use client"

import Link from "next/link"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import type { HcuSimulationOutput } from "@/lib/hcu/model"
import { PortalCheckboxField, PortalField, PortalFieldGroup } from "@/components/shared/portal-form-fields"

type SimulationResult = { id: string; modelVersion: string; inputHash: string; outputHash: string; output: HcuSimulationOutput }
type AtomOption = { id: string; nameEs: string; nameEn: string; isQuarantined: boolean }
type ShockDraft = { atomId: string; year: number; intensity: number }

export function HcuSimulator({ atoms, loggedIn, locale = "es" }: { atoms: AtomOption[]; loggedIn: boolean; locale?: "es" | "en" }) {
  const english = locale === "en"
  const [scenario, setScenario] = useState("baseline")
  const [startYear, setStartYear] = useState(2026)
  const [endYear, setEndYear] = useState(2050)
  const [seed, setSeed] = useState(20261101)
  const [mcRuns, setMcRuns] = useState(200)
  const [shocks, setShocks] = useState<ShockDraft[]>([{ atomId: atoms[0]?.id ?? "", year: 2026, intensity: 0.3 }])
  const [quarantine, setQuarantine] = useState<string[]>([])
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function run(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResult(null)
    setError(null)
    setLoading(true)
    try {
      const response = await fetch("/api/v1/hcu/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, startYear, endYear, seed, mcRuns, shocks, quarantine }),
      })
      const body = await response.json() as SimulationResult & { error?: string }
      if (!response.ok) throw new Error(body.error ?? "No fue posible ejecutar la simulación.")
      setResult(body)
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "No fue posible ejecutar la simulación.")
    } finally {
      setLoading(false)
    }
  }

  function toggleQuarantine(id: string, checked: boolean) {
    setQuarantine((current) => checked ? [...current, id] : current.filter((atomId) => atomId !== id))
  }

  function updateShock(index: number, key: keyof ShockDraft, value: string) {
    setShocks((current) => current.map((shock, position) => position === index
      ? { ...shock, [key]: key === "atomId" ? value : Number(value) }
      : shock))
  }

  function updateStartYear(value: number) {
    setStartYear(value)
    if (value > endYear) setEndYear(value)
    setShocks((current) => current.map((shock) => ({ ...shock, year: Math.max(value, Math.min(endYear, shock.year)) })))
  }

  function updateEndYear(value: number) {
    setEndYear(value)
    if (value < startYear) setStartYear(value)
    setShocks((current) => current.map((shock) => ({ ...shock, year: Math.min(value, Math.max(startYear, shock.year)) })))
  }

  return <div className="hcu-simulator-layout">
    <form className="portal-form hcu-simulator-form" onSubmit={run}>
      <div className="hcu-simulator-head"><p className="eyebrow">{english ? "EXPLORATORY INSTRUMENT" : "INSTRUMENTO EXPLORATORIO"}</p><h2>{english ? "Shape a scenario." : "Configura un escenario."}</h2><p>{english ? "The result is deterministic for a seed and graph digest; parameters remain hypotheses, not forecasts." : "El resultado es determinista para una semilla y la huella del grafo; los parámetros son hipótesis, no pronósticos."}</p></div>
      <PortalFieldGroup>
        <PortalField id="hcu-scenario" label={english ? "Scenario" : "Escenario"}><select id="hcu-scenario" value={scenario} onChange={(event) => setScenario(event.target.value)}><option value="baseline">{english ? "A · Controlled expansion" : "A · Expansión controlada"}</option><option value="conservative">{english ? "B · Structural transformation" : "B · Transformación estructural"}</option><option value="collaborative">{english ? "C · Systemic mutation" : "C · Mutación sistémica"}</option></select></PortalField>
        <PortalFieldGroup className="form-two-columns">
          <PortalField id="hcu-start-year" label={english ? "Start year" : "Año inicial"}><Input id="hcu-start-year" type="number" min={2026} max={endYear} value={startYear} onChange={(event) => updateStartYear(Number(event.target.value))} required /></PortalField>
          <PortalField id="hcu-end-year" label={english ? "End year" : "Año final"}><Input id="hcu-end-year" type="number" min={startYear} max={2050} value={endYear} onChange={(event) => updateEndYear(Number(event.target.value))} required /></PortalField>
        </PortalFieldGroup>
        <PortalField id="hcu-seed" label={english ? "Seed" : "Semilla"}><Input id="hcu-seed" type="number" min={0} max={2147483647} value={seed} onChange={(event) => setSeed(Number(event.target.value))} required /></PortalField>
        <PortalField id="hcu-runs" label={english ? "Sensitivity samples (20–200)" : "Muestras de sensibilidad (20–200)"}><Input id="hcu-runs" type="number" min={20} max={200} step={10} value={mcRuns} onChange={(event) => setMcRuns(Number(event.target.value))} required /></PortalField>
      </PortalFieldGroup>
      <fieldset className="portal-fieldset"><legend>{english ? "Exogenous shocks" : "Choques exógenos"}</legend><p>{english ? "Add up to 16 signed inputs. They are scenario assumptions, not observed events." : "Agrega hasta 16 entradas con signo. Son supuestos del escenario, no eventos observados."}</p>
        <div className="hcu-shock-list">
          {shocks.map((shock, index) => <div className="hcu-shock-row" key={`shock-${index}`}>
            <PortalField id={`hcu-shock-atom-${index}`} label={`${english ? "Affected node" : "Nodo afectado"} ${index + 1}`}><select id={`hcu-shock-atom-${index}`} value={shock.atomId} onChange={(event) => updateShock(index, "atomId", event.target.value)} required>{atoms.map((atom) => <option key={atom.id} value={atom.id}>{english ? atom.nameEn : atom.nameEs}</option>)}</select></PortalField>
            <PortalField id={`hcu-shock-year-${index}`} label={english ? "Year" : "Año"}><Input id={`hcu-shock-year-${index}`} type="number" min={startYear} max={endYear} value={shock.year} onChange={(event) => updateShock(index, "year", event.target.value)} required /></PortalField>
            <PortalField id={`hcu-shock-intensity-${index}`} label={english ? "Intensity (−1 to 1)" : "Intensidad (−1 a 1)"}><Input id={`hcu-shock-intensity-${index}`} type="number" min={-1} max={1} step={0.1} value={shock.intensity} onChange={(event) => updateShock(index, "intensity", event.target.value)} required /></PortalField>
            <button className="button button-quiet hcu-remove-shock" type="button" onClick={() => setShocks((current) => current.filter((_, position) => position !== index))} aria-label={`${english ? "Remove shock" : "Eliminar choque"} ${index + 1}`}>{english ? "Remove" : "Eliminar"}</button>
          </div>)}
        </div>
        <button className="button button-outline-light" type="button" disabled={shocks.length >= 16 || atoms.length === 0} onClick={() => setShocks((current) => [...current, { atomId: atoms[0]?.id ?? "", year: startYear, intensity: 0.2 }])}>{english ? "Add a shock" : "Añadir choque"}</button>
      </fieldset>
      <fieldset className="portal-fieldset"><legend>{english ? "Quarantine nodes" : "Poner nodos en cuarentena"}</legend><p>{english ? "Quarantined nodes still receive effects but do not transmit signals." : "Los nodos en cuarentena siguen recibiendo efectos, pero no transmiten señales."}</p>
        <div className="hcu-checkbox-list">{atoms.map((atom) => <PortalCheckboxField id={`quarantine-${atom.id}`} key={atom.id} checked={quarantine.includes(atom.id)} onCheckedChange={(checked) => toggleQuarantine(atom.id, checked)} label={english ? atom.nameEn : atom.nameEs} />)}</div>
      </fieldset>
      {!loggedIn && <p className="form-note">{english ? "A researcher account is required to run and save a result." : "Se requiere una cuenta de investigación para ejecutar y guardar el resultado."} <Link href="/sign-in">{english ? "Sign in" : "Inicia sesión"}</Link>.</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-copper" type="submit" disabled={!loggedIn || loading || atoms.length === 0}>{loading ? (english ? "Running…" : "Ejecutando…") : (english ? "Run and save" : "Ejecutar y guardar")}</button>
      <p className="form-note">{english ? "Limit: 20 saved runs per day. SHA-256 and SHA3-512 digests are local integrity aids, not signatures or external anchors." : "Límite: 20 ejecuciones guardadas al día. Las huellas SHA-256 y SHA3-512 ayudan a comprobar integridad local; no son firmas ni anclajes externos."}</p>
    </form>
    <section className="hcu-results" aria-live="polite" aria-labelledby="hcu-results-title">
      <div className="hcu-results-header"><p className="eyebrow">{english ? "ANNUAL OUTPUT" : "SALIDA ANUAL"}</p><h2 id="hcu-results-title">{english ? "A range, not a forecast." : "Un rango, no un pronóstico."}</h2></div>
      {!result ? <div className="hcu-results-empty"><span>HCU / 02</span><p>{english ? "Run a scenario to view tension, uncertainty, and its reproducible input digest." : "Ejecuta un escenario para ver tensión, incertidumbre y la huella reproducible de sus entradas."}</p></div> : <>
        <div className="hcu-run-metadata"><span>{result.modelVersion}</span><span>SHA-256 {result.outputHash.slice(0, 14)}…</span><Link href={`/api/v1/hcu/runs/${result.id}/export`} target="_blank" rel="noopener noreferrer">{english ? "Export JSON-LD" : "Exportar JSON-LD"}</Link></div>
        <p className="hcu-source-digest">SHA3-512 {result.output.sourceGraphHash?.slice(0, 32) ?? "—"}…</p>
        <div className="hcu-series">{result.output.series.map((point) => <div className="hcu-series-row" key={point.year}><strong>{point.year}</strong><div className="hcu-range-track" aria-label={`${point.year}: ${point.p10}–${point.p90}; mediana ${point.median}`}><span className="hcu-range" style={{ left: `${point.p10}%`, width: `${Math.max(0, point.p90 - point.p10)}%` }} /><i className="hcu-median" style={{ left: `${point.median}%` }} /></div><span>{point.median.toFixed(1)}</span></div>)}</div>
        <dl className="hcu-result-metrics"><div><dt>{english ? "Mean risk" : "Riesgo medio"}</dt><dd>{result.output.series.at(-1)?.meanRisk.toFixed(1)}</dd></div><div><dt>{english ? "Uncertainty" : "Incertidumbre"}</dt><dd>{result.output.series.at(-1)?.uncertainty.toFixed(1)}</dd></div><div><dt>{english ? "Seed" : "Semilla"}</dt><dd>{result.output.input?.seed ?? seed}</dd></div></dl>
        <details className="hcu-assumptions"><summary>{english ? "Model assumptions and limitations" : "Supuestos y límites del modelo"}</summary><ul>{result.output.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul><p>Input SHA-256: <code>{result.inputHash}</code></p><p>{english ? "Saved shocks" : "Choques guardados"}: {result.output.input?.shocks.length ?? "not recorded"}</p></details>
      </>}
    </section>
  </div>
}
