import { env } from "@/data/env/server"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/schema.ts",
  strict: true,
  verbose: true,
  dialect: "postgresql",
  dbCredentials: {
    password: env.DB_PASSWORD,
    user: env.DB_USER,
    database: env.DB_NAME,
    host: env.DB_HOST,
    port: env.DB_PORT,
    ssl: false,
  },
})
/** port
 * setting port is necessary if you don't want the default port.
 * if you don't set a port postgres will use 5432 as default.
 * when I set "5433:5432" in compose file, it gave me error, because I didn't set port in drizzle.config.ts file. so, it set port 5432 as default. so, it mismatched and got us error.
 * port can be set in db.ts and drizzle.config.ts. But if I set in only one place, it has to be in drizzle.config.ts file. for safety, set it in both file.
 */
