import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { forbidden, notFound } from "next/navigation"
import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/next"
import { env } from "./data/env/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api(.*)",
  "/products(.*)",
])

const isAdminRoute = createRouteMatcher(["/admin(.*)"])

/**
 * Shield protects your app from common attacks e.g. SQL injection
 * LIVE = Active enforcement — the rule actually blocks, rate-limits, or rejects real requests when triggered.
 * DRY_RUN = the rule records and logs what it would have done but doesn’t block requests. Basically this one is used in testing purpose, it doesn't really block or limit use.
 *
 * slidingWindow: This defines a rate-limiting strategy — i.e., how many requests are allowed in a certain time frame. (per person)
 */
const aj = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:MONITOR", "CATEGORY:PREVIEW"],
    }),
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 100,
    }),
  ],
})

export default clerkMiddleware(async (auth, req) => {
  const decision = await aj.protect(req)

  if (decision.isDenied()) return forbidden()

  if (isAdminRoute(req)) {
    const user = await auth.protect()
    if (user.sessionClaims.role !== "admin") return notFound()
  }

  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
