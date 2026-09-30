import { neon, neonConfig, Pool } from "@neondatabase/serverless"
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http"
import { drizzle as drizzleWs } from "drizzle-orm/neon-serverless"
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import ws from "ws"
import * as schema from "./schema"
import { env } from "@/data/env/server"

// NOTE: Every query is a standalone HTTPS request — no pooled socket survives
// between requests. A module-level WebSocket Pool on Vercel Fluid Compute kept
// connections across instance suspensions; they went dead silently, the next
// query hung on one, and because "use cache" dedupes in-flight fills, every
// request on that instance hung with it until Vercel recycled the instance.
//
// That still isn't the full picture: Node's fetch keeps its own keep-alive
// sockets per process, and Fluid Compute can freeze an instance mid-request —
// a socket that goes stale across a freeze hangs a query forever on thaw
// instead of erroring, since fetch() has no built-in timeout. Confirmed live:
// GET /, GET /products and a POST all hung together and died at the 300s
// Vercel limit. This aborts any single query past 15s so one bad connection
// fails fast instead of freezing every concurrent request on the instance.
neonConfig.fetchFunction = (url: string | URL | Request, init?: RequestInit) =>
  fetch(url, { ...init, signal: AbortSignal.timeout(15_000) })

export const db = drizzleHttp({
  client: neon(env.NEONDB_DATABASE_URL),
  schema,
})

export type Queryable = Omit<
  PgDatabase<PgQueryResultHKT, typeof schema>,
  "$client"
>

neonConfig.webSocketConstructor = ws

type Tx = Parameters<
  Parameters<ReturnType<typeof drizzleWs<typeof schema>>["transaction"]>[0]
>[0]

// NOTE: The HTTP driver can't do interactive transactions, so each one gets its
// own WebSocket pool that lives only for that transaction (Neon's guidance for
// serverless: never share a Pool across requests).
export async function transaction<T>(fn: (trx: Tx) => Promise<T>) {
  const pool = new Pool({
    connectionString: env.NEONDB_DATABASE_URL,
    connectionTimeoutMillis: 10_000,
    // NOTE: without this, a query on a connection that went stale (same
    // stale-socket-after-freeze failure as the HTTP driver above) hangs until
    // Vercel's 300s function limit kills it instead of failing fast.
    query_timeout: 15_000,
  })
  pool.on("error", (err: unknown) => console.error("db tx pool error", err))
  try {
    return await drizzleWs({ client: pool, schema }).transaction(fn)
  } finally {
    await pool.end()
  }
}
