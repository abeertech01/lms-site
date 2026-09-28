import { createEnv } from "@t3-oss/env-nextjs"
import z from "zod"

export const env = createEnv({
  server: {
    // NOTE: pooled URL for the app, unpooled (direct) URL for drizzle-kit migrations.
    NEONDB_DATABASE_URL: z.string().min(1),
    NEONDB_DATABASE_URL_UNPOOLED: z.string().min(1),
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_WEBHOOK_SECRET: z.string().min(1),
    ARCJET_KEY: z.string().min(1),
    TEST_IP_ADDRESS: z.string().min(1).optional(),
    STRIPE_PPP_50_COUPON_ID: z.string().min(1),
    STRIPE_PPP_40_COUPON_ID: z.string().min(1),
    STRIPE_PPP_30_COUPON_ID: z.string().min(1),
    STRIPE_PPP_20_COUPON_ID: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
  },
  experimental__runtimeEnv: process.env,
})
