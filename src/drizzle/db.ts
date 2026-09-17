import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "./schema"
import { env } from "@/data/env/server"

const isLocalHost = env.DB_HOST === "localhost" || env.DB_HOST === "127.0.0.1"

export const db = drizzle({
  schema,
  connection: {
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
  },
})
/** NOTE:
 * port
 * port must not be missed, if the app is not running on port 5432.
 */
