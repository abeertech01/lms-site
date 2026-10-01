import { env } from "@/data/env/server"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/schema.ts",
  strict: true,
  verbose: true,
  dialect: "postgresql",
  dbCredentials: {
    // NOTE: migrations use the direct (unpooled) connection — pgbouncer's
    // transaction pooling can break migrations.
    url: env.NEONDB_DATABASE_URL_UNPOOLED,
  },
})
