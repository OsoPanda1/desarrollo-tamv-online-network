import { Client } from "pg";
import { BudgetExceededError, withinBudget } from "../health.ts";

export interface ReadinessClient {
  query(config: { text: string; query_timeout: number }, values?: unknown[]): Promise<{ rows: Array<Record<string, unknown>> }>;
  release(): void;
}

export interface ReadinessPool {
  connect(): Promise<ReadinessClient>;
}

export interface CancelClient {
  connect(): Promise<unknown>;
  query(config: { text: string; query_timeout: number }, values: unknown[]): Promise<unknown>;
  end(): Promise<unknown>;
}

export interface ProbeDatabaseOptions {
  timeoutMs: number;
  connectionString?: string;
  createCancelClient?: () => CancelClient;
}

export type PublicDatabaseCounts = {
  publishedProposals: number;
  publicResearchers: number;
  publicTopics: number;
  publicHcuAtoms: number;
};

const CANCEL_QUERY_TIMEOUT_MS = 500;
const PUBLIC_COUNTS_QUERY = `
  SELECT
    (SELECT count(*) FROM public.research_proposals
      WHERE status = $1 AND visibility = $2 AND share_consent = TRUE) AS published_proposals,
    (SELECT count(*) FROM public.researcher_profiles
      WHERE is_public = TRUE) AS public_researchers,
    (SELECT count(*) FROM public.research_topics
      WHERE user_id = $3 AND status = $4) AS public_topics,
    (SELECT count(*) FROM public.hcu_atoms
      WHERE user_id = $3 AND visibility = $2) AS public_hcu_atoms
`;

function defaultCancelClient(connectionString?: string): CancelClient {
  return new Client({ connectionString, connectionTimeoutMillis: 500 }) as unknown as CancelClient;
}

function cancelBackend(backendPid: number, options: ProbeDatabaseOptions): Promise<void> {
  const createCancelClient = options.createCancelClient ?? (() => defaultCancelClient(options.connectionString));
  return (async () => {
    const canceller = createCancelClient();
    try {
      await canceller.connect();
      await canceller.query(
        { text: "SELECT pg_cancel_backend($1)", query_timeout: CANCEL_QUERY_TIMEOUT_MS },
        [backendPid],
      );
    } finally {
      await canceller.end();
    }
  })().catch(() => {
    // Readiness still fails closed if cancellation itself cannot connect.
  });
}

export async function withPooledClientWithinBudget<T>(
  pool: ReadinessPool,
  timeoutMs: number,
  operation: (client: ReadinessClient, remainingMs: () => number) => Promise<T>,
  onTimeout?: () => void,
): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new RangeError("timeoutMs must be a positive finite number");
  }

  const deadline = Date.now() + timeoutMs;
  const remainingMs = () => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new BudgetExceededError();
    return remaining;
  };
  let client: ReadinessClient | undefined;
  let released = false;
  let finished = false;
  const release = () => {
    if (!client || released) return;
    released = true;
    client.release();
  };

  const pending = (async () => {
    const acquired = await pool.connect();
    client = acquired;
    if (finished) {
      release();
      throw new BudgetExceededError();
    }
    return operation(acquired, remainingMs);
  })();

  try {
    return await withinBudget(pending, timeoutMs, onTimeout);
  } finally {
    finished = true;
    release();
  }
}

export async function probeDatabaseReadiness(
  pool: ReadinessPool,
  options: ProbeDatabaseOptions,
): Promise<boolean> {
  let backendPid: number | undefined;

  try {
    return await withPooledClientWithinBudget(
      pool,
      options.timeoutMs,
      async (client, remainingMs) => {
        const identity = await client.query(
          { text: "SELECT pg_backend_pid()", query_timeout: remainingMs() },
        );
        backendPid = Number(identity.rows[0]?.pg_backend_pid);
        await client.query({ text: "SELECT 1", query_timeout: remainingMs() });
        return true;
      },
      () => {
        const pid = backendPid;
        if (typeof pid !== "number" || !Number.isSafeInteger(pid) || pid <= 0) return;
        void cancelBackend(pid, options);
      },
    );
  } catch (error) {
    if (error instanceof BudgetExceededError) return false;
    throw error;
  }
}

function publicCount(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

export async function probeDatabasePublicCounts(
  pool: ReadinessPool,
  options: { timeoutMs: number },
): Promise<PublicDatabaseCounts | null> {
  try {
    return await withPooledClientWithinBudget(pool, options.timeoutMs, async (client, remainingMs) => {
      const result = await client.query(
        { text: PUBLIC_COUNTS_QUERY, query_timeout: remainingMs() },
        ["published", "public", "system", "open"],
      );
      const row = result.rows[0];
      const publishedProposals = publicCount(row?.published_proposals);
      const publicResearchers = publicCount(row?.public_researchers);
      const publicTopics = publicCount(row?.public_topics);
      const publicHcuAtoms = publicCount(row?.public_hcu_atoms);
      if (
        publishedProposals === null ||
        publicResearchers === null ||
        publicTopics === null ||
        publicHcuAtoms === null
      ) return null;
      return { publishedProposals, publicResearchers, publicTopics, publicHcuAtoms };
    });
  } catch {
    return null;
  }
}
