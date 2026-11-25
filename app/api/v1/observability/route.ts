import { db, pool } from "@/lib/db"
import { hcuAtoms, researchProposals, researchTopics, researcherProfiles } from "@/lib/db/schema"
import { apiJson } from "@/lib/http"
import { and, count, eq } from "drizzle-orm"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

const DATABASE_PROBE_TIMEOUT_MS = 1_500
const processStartedAt = Date.now()

type Probe = { ok: boolean; latencyMs: number | null }

async function probeDatabase(): Promise<Probe> {
  const started = performance.now()
  const probeQuery = {
    text: "SELECT 1",
    query_timeout: DATABASE_PROBE_TIMEOUT_MS,
  }
  try {
    await pool.query(probeQuery)
    return { ok: true, latencyMs: Math.round((performance.now() - started) * 100) / 100 }
  } catch {
    return { ok: false, latencyMs: null }
  }
}

async function safeCount(run: () => PromiseLike<{ value: number | string }[]>): Promise<number | null> {
  try {
    const [row] = await run()
    const value = Number(row?.value ?? 0)
    return Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

const toMb = (bytes: number) => Math.round((bytes / (1024 * 1024)) * 10) / 10

/**
 * Public observability snapshot for this single instance.
 *
 * Everything here is measured or counted at request time. Nothing is
 * extrapolated: the payload explicitly says it covers one process, not the
 * whole platform, and every field can be `null` when the measurement fails.
 * No host, connection string, driver text, or secret is ever returned.
 */
export async function GET() {
  const [database, publishedProposals, publicResearchers, publicTopics, publicHcuAtoms] = await Promise.all([
    probeDatabase(),
    safeCount(() =>
      db
        .select({ value: count() })
        .from(researchProposals)
        .where(and(eq(researchProposals.status, "published"), eq(researchProposals.visibility, "public"))),
    ),
    safeCount(() =>
      db
        .select({ value: count() })
        .from(researcherProfiles)
        .where(eq(researcherProfiles.isPublic, true)),
    ),
    safeCount(() =>
      db
        .select({ value: count() })
        .from(researchTopics)
        .where(and(eq(researchTopics.userId, "system"), eq(researchTopics.status, "open"))),
    ),
    safeCount(() =>
      db
        .select({ value: count() })
        .from(hcuAtoms)
        .where(and(eq(hcuAtoms.userId, "system"), eq(hcuAtoms.visibility, "public"))),
    ),
  ])

  const memory = process.memoryUsage()
  const commit = process.env.VERCEL_GIT_COMMIT_SHA

  return apiJson(
    {
      status: "measured",
      service: "tamv-online-network",
      measuredAt: new Date().toISOString(),
      scope: "single-instance",
      instance: {
        uptimeSeconds: Math.round((Date.now() - processStartedAt) / 1000),
        processUptimeSeconds: Math.round(process.uptime()),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV ?? "unknown",
        region: process.env.VERCEL_REGION ?? null,
        commit: commit ? commit.slice(0, 7) : null,
      },
      database: {
        ok: database.ok,
        latencyMs: database.latencyMs,
        probe: "SELECT 1",
        budgetMs: DATABASE_PROBE_TIMEOUT_MS,
      },
      memory: {
        rssMb: toMb(memory.rss),
        heapUsedMb: toMb(memory.heapUsed),
        heapTotalMb: toMb(memory.heapTotal),
      },
      counts: {
        publishedProposals,
        publicResearchers,
        publicTopics,
        publicHcuAtoms,
      },
      notes: {
        es: "Medición de una sola instancia. Los conteos son agregados públicos y pueden ser nulos si la consulta falla.",
        en: "Single-instance measurement. Counts are public aggregates and may be null when a query fails.",
      },
    },
    200,
  )
}
