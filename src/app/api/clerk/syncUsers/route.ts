import { insertUser } from "@/features/users/db/users"
import { syncClerkUserMetadata } from "@/services/clerk"
import { currentUser } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

/** NOTE:
 * Safety net for the Clerk webhook: getCurrentUser() redirects here when a signed-in user
 * has no row in our DB yet (webhook delayed, failed, or the user predates it).
 * It inserts the user, then sends them back to the page they came from.
 * insertUser is an upsert on clerkUserId, so running this twice is harmless.
 */
export async function GET(request: NextRequest) {
  const user = await currentUser()

  if (user == null) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  const email = user.primaryEmailAddress?.emailAddress
  if (email == null) {
    return new Response("User email missing", { status: 500 })
  }

  const dbUser = await insertUser({
    clerkUserId: user.id,
    // NOTE: same fallback as the Clerk webhook — email-only sign-ups have no name.
    name: user.fullName?.trim() || email.split("@")[0],
    email,
    imageUrl: user.imageUrl,
    role: user.publicMetadata.role ?? "user",
  })

  try {
    // NOTE: only the role claim (used by the admin layout) depends on this;
    // getCurrentUser looks the user up by clerkUserId, so a Clerk API failure
    // here (e.g. 429 Too Many Requests) shouldn't block the user.
    await syncClerkUserMetadata(dbUser)
  } catch (error) {
    console.error("syncUsers: failed to sync Clerk metadata", error)
  }

  return NextResponse.redirect(getReturnUrl(request))
}

// NOTE: only follow the referer back to our own site — an off-site referer
// would otherwise turn this route into an open redirect.
function getReturnUrl(request: NextRequest) {
  const referer = request.headers.get("referer")
  if (referer != null) {
    const url = new URL(referer, request.url)
    if (url.origin === request.nextUrl.origin) return url
  }
  return new URL("/", request.url)
}
