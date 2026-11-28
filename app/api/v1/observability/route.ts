import { pool } from "@/lib/db"
import { probeDatabasePublicCounts, probeDatabaseReadiness } from "@/lib/db/readiness"
import { createSingleFlightTtlCache } from "@/lib/health"
import { apiJson } from "@/lib/http"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

const DATABASE_PROBE_TIMEOUT_MS = 1_500
const processStartedAt = Date.now()

type Probe = { ok: boolean; latencyMs: number | null }
type DatabaseSnapshot = {
  database: Probe;
  publishedProposals: number | null;
  publicResearchers: number | null;
  publicTopics: number | null;
  publicHcuAtoms: number | null;
  databaseMeasuredAt: string;
};

async function probeDatabase(): Promise<Probe> {
  const started = performance.now()
  try {
    const ok = await probeDatabaseReadiness(pool, {
      timeoutMs: DATABASE_PROBE_TIMEOUT_MS,
      connectionString: process.env.DATABASE_URL,
    })
    return { ok, latencyMs: ok ? Math.round((performance.now() - started) * 100) / 100 : null }
  } catch {
    return { ok: false, latencyMs: null }
  }
}

async function measureDatabaseSnapshot(): Promise<DatabaseSnapshot> {
  const [database, counts] = await Promise.all([
    probeDatabase(),
    probeDatabasePublicCounts(pool, { timeoutMs: DATABASE_PROBE_TIMEOUT_MS }),
  ])

  return {
    database,
    publishedProposals: counts?.publishedProposals ?? null,
    publicResearchers: counts?.publicResearchers ?? null,
    publicTopics: counts?.publicTopics ?? null,
    publicHcuAtoms: counts?.publicHcuAtoms ?? null,
    databaseMeasuredAt: new Date().toISOString(),
  };
}

const getDatabaseSnapshot = createSingleFlightTtlCache(measureDatabaseSnapshot, 30_000);

const toMb = (bytes: number) => Math.round((bytes / (1024 * 1024)) * 10) / 10

/**
 * Public observability snapshot for this single instance.
 *
 * Database readiness and public counts share a 30-second snapshot, including
 * failed probes and null counts. Memory, uptime, and measuredAt remain specific
 * to each request. No host, connection string, driver text, or secret is returned.
 */
export async function GET() {
  const {
    database,
    publishedProposals,
    publicResearchers,
    publicTopics,
    publicHcuAtoms,
    databaseMeasuredAt,
  } = await getDatabaseSnapshot()

  const memory = process.memoryUsage()
  const commit = process.env.VERCEL_GIT_COMMIT_SHA

  return apiJson(
    {
      status: "measured",
      service: "tamv-online-network",
      measuredAt: new Date().toISOString(),
      databaseMeasuredAt,
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
        es: "Instantánea de una sola instancia. PostgreSQL y los conteos públicos se comparten durante 30 s; memoria y uptime corresponden a cada solicitud. Los conteos pueden ser nulos si la consulta falla.",
        en: "Single-instance snapshot. PostgreSQL and public counts are shared for 30 seconds; memory and uptime are request-specific. Counts may be null when a query fails.",
      },
    },
    200,
  )
}
