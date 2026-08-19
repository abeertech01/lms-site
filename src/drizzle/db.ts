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
  },
})
/** NOTE:
 * port
 * port must not be missed, if the app is not running on port 5432.
 */
