import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { getPoolMax } from "./pool-config"
import * as schema from "./schema"

const globalForPool = globalThis as typeof globalThis & { tamvPool?: Pool }

export const pool =
  globalForPool.tamvPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: getPoolMax(process.env.PG_POOL_MAX),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  })

if (process.env.NODE_ENV !== "production") globalForPool.tamvPool = pool

export const db = drizzle(pool, { schema })
