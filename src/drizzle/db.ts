import { drizzle as drizzleNodePostgres } from "drizzle-orm/node-postgres"
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless"
import * as schema from "./schema"
import { env } from "@/data/env/server"

const isLocalHost = env.DB_HOST === "localhost" || env.DB_HOST === "127.0.0.1"

const connection = {
  password: env.DB_PASSWORD,
  user: env.DB_USER,
  database: env.DB_NAME,
  host: env.DB_HOST,
  port: env.DB_PORT,
  ssl: isLocalHost ? false : { rejectUnauthorized: false },
  // pg.Pool's default is 0 (wait forever) for connectionTimeoutMillis, which turns a bad
  // connection into a full 300s hang on Vercel instead of a fast, debuggable error.
  connectionTimeoutMillis: 10_000,
  // Without this, a query on a connection the DB provider silently dropped while idle
  // (common on serverless) hangs until Vercel's 300s function timeout kills it instead
  // of failing fast.
  query_timeout: 15_000,
  // Recycle idle pool clients before the DB provider has a chance to drop them itself,
  // and keep the TCP socket alive so a dead connection is detected sooner.
  idleTimeoutMillis: 10_000,
  keepAlive: true,
}

// Local dev talks to the plain Postgres container from docker-compose over
// a normal TCP connection, so it keeps the standard node-postgres driver
// (Neon's serverless driver's WebSocket protocol can't reach a non-Neon
// database). Neon (Preview/Production) uses Neon's own serverless driver
// instead: unlike node-postgres, it's built to handle Neon's
// autosuspend/cold-start correctly, so a request no longer hangs for
// Vercel's full 300s function limit when the compute has to wake up —
// it was this hang, not the timeouts above, that caused an outage. Both
// drivers implement the same query-builder/transaction API, so nothing
// else in the codebase (db.transaction, db.query.*, etc.) needed to change.
export const db = isLocalHost
  ? drizzleNodePostgres({ schema, connection })
  : drizzleNeon({ schema, connection })
/** NOTE:
 * port
 * port must not be missed, if the app is not running on port 5432.
 */
