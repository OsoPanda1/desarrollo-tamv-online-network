import { Client } from "pg";
import { probeWithinBudget } from "../health.ts";

export interface ReadinessClient {
  query(config: { text: string; query_timeout: number }): Promise<{ rows: Array<Record<string, unknown>> }>;
  query(text: string): Promise<{ rows: Array<Record<string, unknown>> }>;
  release(): void;
}

export interface ReadinessPool {
  connect(): Promise<ReadinessClient>;
}

export interface CancelClient {
  connect(): Promise<unknown>;
  query(text: string, values: unknown[]): Promise<unknown>;
  end(): Promise<unknown>;
}

export interface ProbeDatabaseOptions {
  timeoutMs: number;
  connectionString?: string;
  createCancelClient?: () => CancelClient;
}

function defaultCancelClient(connectionString?: string): CancelClient {
  return new Client({ connectionString, connectionTimeoutMillis: 500 }) as unknown as CancelClient;
}

/**
 * Runs a readiness query on a pooled client. If the outer budget expires, the
 * exact backend PID is cancelled from a separate connection so a saturated or
 * slow query is not left running after the 503 response.
 */
export async function probeDatabaseReadiness(
  pool: ReadinessPool,
  options: ProbeDatabaseOptions,
): Promise<boolean> {
  const client = await pool.connect();
  let cancelPromise: Promise<void> | undefined;

  try {
    const identity = await client.query("SELECT pg_backend_pid()");
    const backendPid = Number(identity.rows[0]?.pg_backend_pid);

    const ready = await probeWithinBudget(
      client.query({ text: "SELECT 1", query_timeout: options.timeoutMs }),
      options.timeoutMs,
      () => {
        if (!Number.isSafeInteger(backendPid) || backendPid <= 0) return;
        const createCancelClient = options.createCancelClient ?? (() => defaultCancelClient(options.connectionString));
        cancelPromise = (async () => {
          const canceller = createCancelClient();
          try {
            await canceller.connect();
            await canceller.query("SELECT pg_cancel_backend($1)", [backendPid]);
          } finally {
            await canceller.end();
          }
        })().catch(() => {
          // Readiness still fails closed if cancellation itself cannot connect.
        });
      },
    );

    if (cancelPromise) await cancelPromise;
    return ready;
  } finally {
    client.release();
  }
}
