import { env } from "@/data/env/server"
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http"

export const db = drizzleHttp(env.NEONDB_DATABASE_URL)
