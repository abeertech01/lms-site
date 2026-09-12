import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/next"
import { env } from "./data/env/server"
import { setUserCountryHeader } from "./lib/userCountryHeader"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api(.*)",
  "/products(.*)",
])

const isAdminRoute = createRouteMatcher(["/admin(.*)"])

/** NOTE:
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

const proxy = clerkMiddleware(async (auth, req) => {
  const decision = await aj.protect(
    env.TEST_IP_ADDRESS
      ? {
          ...req,
          ip: env.TEST_IP_ADDRESS,
          headers: req.headers,
        }
      : req
  )

  if (decision.isDenied()) {
    return new NextResponse(null, { status: 403 })
  }

  if (isAdminRoute(req)) {
    const user = await auth.protect()
    if (user.sessionClaims.role !== "admin") {
      return new NextResponse(null, { status: 404 })
    }
  }

  if (!isPublicRoute(req)) {
    await auth.protect()
  }

  if (!decision.ip.isVpn() && !decision.ip.isProxy()) {
    const headers = new Headers(req.headers)
    setUserCountryHeader(headers, decision.ip.country) // NOTE: sets the country header, thus we can get the country name and we'll be able to use it.

    return NextResponse.next({ request: { headers } })
  }
})

export default proxy

export const config = {
  matcher: [
    // NOTE: Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // NOTE: Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
