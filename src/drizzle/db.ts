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
  })
  pool.on("error", (err: unknown) => console.error("db tx pool error", err))
  try {
    return await drizzleWs({ client: pool, schema }).transaction(fn)
  } finally {
    await pool.end()
  }
}
