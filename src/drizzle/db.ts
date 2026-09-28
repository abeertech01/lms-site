import { drizzle } from "drizzle-orm/node-postgres"
import { attachDatabasePool } from "@vercel/functions"
import * as schema from "./schema"
import { env } from "@/data/env/server"

export const db = drizzle({
  schema,
  connection: {
    // NOTE: Neon's connection string already includes sslmode=require.
    connectionString: env.NEONDB_DATABASE_URL,
    // pg.Pool's default is 0 (wait forever) for connectionTimeoutMillis, which turns a bad
    // connection into a full 300s hang on Vercel instead of a fast, debuggable error.
    connectionTimeoutMillis: 10_000,
    // Without this, a query on a connection the DB provider silently dropped while idle
    // (common on serverless) hangs until Vercel's 300s function timeout kills it instead
    // of failing fast.
    query_timeout: 15_000,
    // Short, per Vercel's pooling guide: closes unused connections quickly while still
    // allowing reuse under load. Keep the TCP socket alive so a dead one is detected sooner.
    idleTimeoutMillis: 5_000,
    keepAlive: true,
  },
})

// NOTE: Vercel Fluid Compute suspends idle function instances, and timers
// (like idleTimeoutMillis above) don't run while suspended — so pooled
// connections outlive the instance's pause and go stale, and the homepage's
// background cache refresh was hanging until Vercel's 300s limit. This keeps
// the instance alive just long enough to close idle connections before it
// suspends. It's a no-op outside Vercel (local dev).
// See: https://vercel.com/kb/guide/connection-pooling-with-functions
attachDatabasePool(db.$client)
