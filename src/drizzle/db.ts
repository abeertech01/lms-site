import { Pool, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import { attachDatabasePool } from "@vercel/functions"
import ws from "ws"
import * as schema from "./schema"
import { env } from "@/data/env/server"

// NOTE: Neon's serverless driver talks to the database over WebSocket instead
// of a plain TCP socket. node-postgres (plain TCP) doesn't handle Neon's
// autosuspend/cold-start: a request needing a fresh connection while the
// compute was asleep just hung on the socket until Vercel's 300s function
// limit killed it — a real outage, twice (fixed once, then undone by a later
// commit that switched back to node-postgres). This driver is built by Neon
// specifically to handle that wake-up correctly. Both local dev and
// production now point at the same Neon database, so there's no separate
// "local Postgres" driver path to keep around.
neonConfig.webSocketConstructor = ws

const pool = new Pool({
  connectionString: env.NEONDB_DATABASE_URL,
  // pg.Pool's default is 0 (wait forever) for connectionTimeoutMillis, which turns a bad
  // connection into a full 300s hang on Vercel instead of a fast, debuggable error.
  connectionTimeoutMillis: 10_000,
  // Without this, a query on a connection the DB provider silently dropped while idle
  // (common on serverless) hangs until Vercel's 300s function timeout kills it instead
  // of failing fast.
  query_timeout: 15_000,
  // Short, per Vercel's pooling guide: closes unused connections quickly while still
  // allowing reuse under load.
  idleTimeoutMillis: 5_000,
})

export const db = drizzle({ client: pool, schema })

// NOTE: Vercel Fluid Compute suspends idle function instances, and timers
// (like idleTimeoutMillis above) don't run while suspended — so pooled
// connections outlive the instance's pause and go stale. This keeps the
// instance alive just long enough to close idle connections before it
// suspends. It's a no-op outside Vercel (local dev).
// See: https://vercel.com/kb/guide/connection-pooling-with-functions
attachDatabasePool(pool)
