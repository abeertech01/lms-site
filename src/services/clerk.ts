import { db } from "@/drizzle/db"
import { UserRole, UserTable } from "@/drizzle/schema"
import { getUserIdTag } from "@/features/users/db/cache"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { redirect } from "next/navigation"

const client = await clerkClient()

export async function getCurrentUser({ allData = false } = {}) {
  const { userId, sessionClaims, redirectToSignIn } = await auth()

  if (userId != null && sessionClaims.dbId == null) {
    /** NOTE:
     * In this state — there is a user but it's not saved in the database yet.
     */
    redirect("/api/clerk/syncUsers")
  }

  const user =
    allData && sessionClaims?.dbId != null
      ? await getUser(sessionClaims.dbId)
      : undefined

  if (userId != null && allData && user == null) {
    /** NOTE:
     * The session's dbId points at a row that doesn't exist in this
     * database (e.g. it was issued against a different environment's
     * database, such as local dev vs. production). Re-sync instead of
     * treating the user as signed out.
     */
    redirect("/api/clerk/syncUsers")
  }

  return {
    clerkUserId: userId,
    userId: sessionClaims?.dbId,
    role: sessionClaims?.role,
    user,
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

async function getUser(id: string) {
  "use cache"
  cacheTag(getUserIdTag(id))
  console.log("Called")

  return await db.query.UserTable.findFirst({
    where: eq(UserTable.id, id),
  })
}
