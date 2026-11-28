"use client"

import { useEffect, useState } from "react"
import type { Locale } from "@/lib/i18n"

type Snapshot = {
  measuredAt: string
  databaseMeasuredAt: string
  instance: {
    uptimeSeconds: number
    nodeVersion: string
    environment: string
    region: string | null
    commit: string | null
  }
  database: { ok: boolean; latencyMs: number | null; probe: string; budgetMs: number }
  memory: { rssMb: number; heapUsedMb: number; heapTotalMb: number }
  counts: {
    publishedProposals: number | null
    publicResearchers: number | null
    publicTopics: number | null
    publicHcuAtoms: number | null
  }
}

type Sample = {
  at: number
  latencyMs: number | null
  rssMb: number
}

const POLL_MS = 30_000
const MAX_SAMPLES = 12

function formatUptime(seconds: number, es: boolean) {
  const days = Math.floor(seconds / 86_400)
  const hours = Math.floor((seconds % 86_400) / 3_600)
  const minutes = Math.floor((seconds % 3_600) / 60)
  if (days > 0) return es ? `${days} d ${hours} h` : `${days}d ${hours}h`
  if (hours > 0) return es ? `${hours} h ${minutes} min` : `${hours}h ${minutes}m`
  return es ? `${minutes} min` : `${minutes}m`
}

function Sparkline({
  values,
  label,
  unit,
  locale,
}: {
  values: number[]
  label: string
  unit: string
  locale: Locale
}) {
  const es = locale === "es"
  if (values.length < 2) {
    return (
      <p className="telemetry-empty">
        {es ? "Recolectando muestras de esta pestaña…" : "Collecting samples from this tab…"}
      </p>
    )
  }
  const width = 320
  const height = 96
  const pad = 8
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const points = values.map((value, index) => {
    const x = pad + (index / (values.length - 1)) * (width - pad * 2)
    const y = height - pad - ((value - min) / span) * (height - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const area = `M ${pad} ${height - pad} L ${points.join(" L ")} L ${width - pad} ${height - pad} Z`
  const latest = values[values.length - 1]
  const trend = latest > values[0] ? (es ? "ascendente" : "rising") : latest < values[0] ? (es ? "descendente" : "falling") : (es ? "estable" : "stable")
  const summary = `${label}: ${latest} ${unit}; ${es ? "mínimo" : "minimum"} ${min} ${unit}; ${es ? "máximo" : "maximum"} ${max} ${unit}; ${es ? "tendencia" : "trend"} ${trend}`
  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={summary}>
      <title>{summary}</title>
      <desc>{summary}</desc>
      <path d={area} className="spark-area" />
      <polyline points={points.join(" ")} className="spark-line" />
      <circle
        cx={width - pad}
        cy={height - pad - ((values[values.length - 1] - min) / span) * (height - pad * 2)}
        r="3"
        className="spark-dot"
      />
    </svg>
  )
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: string
}) {
  return (
    <div className="telemetry-metric">
      <span className="telemetry-label">{label}</span>
      <strong>{value}</strong>
      {detail && <span className="telemetry-detail">{detail}</span>}
    </div>
  )
}

/**
 * Observability deck for one instance. PostgreSQL readiness and public counts
 * come from a shared 30-second snapshot; memory and uptime are request-specific.
 * When the endpoint fails the deck says so instead of inventing a placeholder.
 */
export function TelemetryDeck({ locale = "es" }: { locale?: Locale }) {
  const es = locale === "es"
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [samples, setSamples] = useState<Sample[]>([])
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [paused, setPaused] = useState(false)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    if (paused) return
    let cancelled = false
    let inFlight = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const controller = new AbortController()

    function schedule() {
      if (!cancelled && document.visibilityState === "visible") timer = setTimeout(load, POLL_MS)
    }

    async function load() {
      if (cancelled || inFlight || document.visibilityState === "hidden") return
      inFlight = true
      try {
        const response = await fetch("/api/v1/observability", { cache: "no-store", signal: controller.signal })
        if (!response.ok) throw new Error("bad status")
        const data = (await response.json()) as Snapshot
        if (cancelled) return
        setSnapshot(data)
        setError(false)
        setSamples((previous) =>
          [
            ...previous,
            {
              at: Date.now(),
              latencyMs: data.database.latencyMs,
              rssMb: data.memory.rssMb,
            },
          ].slice(-MAX_SAMPLES),
        )
      } catch {
        if (!cancelled) setError(true)
      } finally {
        inFlight = false
        if (!cancelled) setLoading(false)
        schedule()
      }
    }

    function visibilityChanged() {
      if (document.visibilityState === "hidden") {
        if (timer) clearTimeout(timer)
      } else if (!inFlight) {
        void load()
      }
    }

    document.addEventListener("visibilitychange", visibilityChanged)
    void load()
    return () => {
      cancelled = true
      controller.abort()
      if (timer) clearTimeout(timer)
      document.removeEventListener("visibilitychange", visibilityChanged)
    }
  }, [nonce, paused])

  const latencyValues = samples.map((sample) => sample.latencyMs).filter((value): value is number => value !== null)
  const memoryValues = samples.map((sample) => sample.rssMb)

  return (
    <div className="telemetry-deck">
      <header className="telemetry-head">
        <div>
          <p className="eyebrow">{es ? "TELEMETRÍA Y OBSERVABILIDAD" : "TELEMETRY & OBSERVABILITY"}</p>
          <h2>{es ? "Lo que esta instancia puede medir" : "What this instance can measure"}</h2>
          <p className="telemetry-lede">
            {es
              ? "Instantánea de una sola instancia: PostgreSQL y los conteos públicos comparten una caché de 30 s; memoria y uptime corresponden a cada solicitud. Sin histórico inventado."
              : "Single-instance snapshot: PostgreSQL and public counts share a cached 30-second snapshot; memory and uptime are request-specific. No invented history."}
          </p>
        </div>
        <div className="telemetry-status" data-state={paused ? "waiting" : error ? "down" : loading ? "waiting" : "live"}>
          <span className="telemetry-dot" aria-hidden="true" />
          {paused ? (es ? "En pausa" : "Paused") : error ? (es ? "Sin conexión" : "Offline") : loading ? (es ? "Midiendo" : "Measuring") : es ? "Actualizado" : "Updated"}
        </div>
      </header>

      {error && !snapshot && (
        <p className="telemetry-alert" role="status">
          {es
            ? "No se pudo leer la telemetría. No mostramos cifras sustitutas."
            : "Telemetry could not be read. We do not show substitute figures."}
        </p>
      )}

      <div className="telemetry-grid">
        <Metric
          label={es ? "Latencia de sonda" : "Probe latency"}
          value={snapshot?.database.latencyMs != null ? `${snapshot.database.latencyMs} ms` : "—"}
          detail={es ? `SELECT 1 · presupuesto ${snapshot?.database.budgetMs ?? 1500} ms` : `SELECT 1 · ${snapshot?.database.budgetMs ?? 1500} ms budget`}
        />
        <Metric
          label={es ? "PostgreSQL" : "PostgreSQL"}
          value={snapshot ? (snapshot.database.ok ? (es ? "Responde" : "Responding") : es ? "No responde" : "Not responding") : "—"}
          detail={es ? "Sonda y conteos en caché compartida de 30 s" : "Probe and counts use a shared 30-second cache"}
        />
        <Metric
          label="RSS"
          value={snapshot ? `${snapshot.memory.rssMb} MB` : "—"}
          detail={es ? `Heap ${snapshot?.memory.heapUsedMb ?? "—"} / ${snapshot?.memory.heapTotalMb ?? "—"} MB` : `Heap ${snapshot?.memory.heapUsedMb ?? "—"} / ${snapshot?.memory.heapTotalMb ?? "—"} MB`}
        />
        <Metric
          label={es ? "Actividad" : "Uptime"}
          value={snapshot ? formatUptime(snapshot.instance.uptimeSeconds, es) : "—"}
          detail={snapshot?.instance.region ? `Region ${snapshot.instance.region}` : es ? "Región no declarada" : "Region not declared"}
        />
      </div>

      <div className="telemetry-charts">
        <figure className="telemetry-chart">
          <figcaption>
            <span className="graph-kicker">{es ? "GRAFO 09" : "GRAPH 09"}</span>
            <h3>{es ? "Latencia de sonda cacheada" : "Cached probe latency"}</h3>
            <p>
              {es
                ? `Últimas ${samples.length} consultas de esta pestaña, cada ${POLL_MS / 1000} s. Los valores pueden repetirse mientras se reutiliza la caché; no es un promedio histórico.`
                : `Last ${samples.length} samples from this tab, every ${POLL_MS / 1000}s. Values may repeat while the cache is reused; this is not a historical average.`}
            </p>
          </figcaption>
          <Sparkline values={latencyValues} label={es ? "Latencia" : "Latency"} unit="ms" locale={locale} />
        </figure>
        <figure className="telemetry-chart">
          <figcaption>
            <span className="graph-kicker">{es ? "GRAFO 10" : "GRAPH 10"}</span>
            <h3>{es ? "Memoria del proceso" : "Process memory"}</h3>
            <p>
              {es
                ? "RSS del proceso Node de esta instancia. No representa el consumo total de la plataforma."
                : "RSS of this instance's Node process. It does not represent the platform's total usage."}
            </p>
          </figcaption>
          <Sparkline values={memoryValues} label="RSS" unit="MB" locale={locale} />
        </figure>
      </div>

      <div className="telemetry-counts">
        <h3>{es ? "Conteos públicos agregados" : "Public aggregate counts"}</h3>
        <dl>
          <div>
            <dt>{es ? "Propuestas publicadas" : "Published proposals"}</dt>
            <dd>{snapshot?.counts.publishedProposals ?? "—"}</dd>
          </div>
          <div>
            <dt>{es ? "Investigadores públicos" : "Public researchers"}</dt>
            <dd>{snapshot?.counts.publicResearchers ?? "—"}</dd>
          </div>
          <div>
            <dt>{es ? "Temas abiertos" : "Open topics"}</dt>
            <dd>{snapshot?.counts.publicTopics ?? "—"}</dd>
          </div>
          <div>
            <dt>{es ? "Átomos HCU públicos" : "Public HCU atoms"}</dt>
            <dd>{snapshot?.counts.publicHcuAtoms ?? "—"}</dd>
          </div>
        </dl>
      </div>

      <footer className="telemetry-foot">
        <span>
          {snapshot
            ? `${es ? "Solicitud" : "Request"} ${new Date(snapshot.measuredAt).toLocaleTimeString(es ? "es-MX" : "en-US")} · ${es ? "Base de datos" : "Database"} ${new Date(snapshot.databaseMeasuredAt).toLocaleTimeString(es ? "es-MX" : "en-US")} · ${snapshot.instance.nodeVersion}`
            : es
              ? "Esperando la primera lectura"
              : "Waiting for the first reading"}
        </span>
        {snapshot?.instance.commit && <span>{es ? "Commit" : "Commit"} {snapshot.instance.commit}</span>}
        <button type="button" className="telemetry-refresh" onClick={() => setPaused((value) => !value)}>
          {paused ? (es ? "Reanudar" : "Resume") : es ? "Pausar" : "Pause"}
        </button>
        <button type="button" className="telemetry-refresh" onClick={() => { setPaused(false); setNonce((value) => value + 1) }}>
          {es ? "Actualizar" : "Refresh"}
        </button>
      </footer>
    </div>
  )
}
