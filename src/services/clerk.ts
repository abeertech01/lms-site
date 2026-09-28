import { db } from "@/drizzle/db"
import { UserRole, UserTable } from "@/drizzle/schema"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

const client = await clerkClient()

export async function getCurrentUser({ allData = false } = {}) {
  const { userId: clerkUserId, redirectToSignIn } = await auth()

  if (clerkUserId == null) {
    return {
      clerkUserId,
      userId: undefined,
      role: undefined,
      user: undefined,
      redirectToSignIn,
    }
  }

  /** NOTE:
   * The DB user is looked up by clerkUserId, not by the dbId/role stored in
   * the Clerk session token. Local dev and production share one Clerk
   * instance but have separate databases, so the token's dbId can point at
   * the *other* environment's row, and a freshly synced user's token keeps
   * the old value until it refreshes — that sent signed-in users round a
   * syncUsers redirect loop and hung pages. clerkUserId is the same in every
   * database, so it's always the right key.
   */
  const user = await getUserByClerkId(clerkUserId)

  if (user == null) {
    /** NOTE:
     * In this state — there is a user but it's not saved in the database yet.
     * syncUsers inserts the row, so the next request finds it (no loop).
     */
    redirect("/api/clerk/syncUsers")
  }

  return {
    clerkUserId,
    userId: user.id,
    role: user.role,
    user: allData ? user : undefined,
    redirectToSignIn,
  }
}

export function syncClerkUserMetadata(user: {
  id: string
  clerkUserId: string
  role: UserRole
}) {
  return client.users.updateUserMetadata(user.clerkUserId, {
    publicMetadata: {
      dbId: user.id,
      role: user.role,
    },
  })
}

// NOTE: deliberately not "use cache". The user cache is revalidated with
// stale-while-revalidate, so a cached "not found" could outlive the syncUsers
// insert and cause another redirect. clerkUserId is unique (indexed), so this
// is a single fast lookup per signed-in request.
async function getUserByClerkId(clerkUserId: string) {
  return db.query.UserTable.findFirst({
    where: eq(UserTable.clerkUserId, clerkUserId),
  })
}
