import { clerkMiddleware } from "@clerk/nextjs/server"

// NOTE: createRouteMatcher-based path protection is deprecated — Clerk now
// recommends per-resource auth.protect() calls in each protected page,
// layout, route handler, or Server Function instead, since path matching
// here can drift out of sync with how Next.js actually routes requests.
// clerkMiddleware() itself still has to stay: it's what makes auth state
// available to the rest of the app.
// https://clerk.com/docs/guides/development/upgrading/upgrade-guides/migrate-from-create-route-matcher
export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Always run for Clerk-specific frontend API routes
    "/__clerk/(.*)",
  ],
}
