import { db } from "@/drizzle/db"
import type { UserRole } from "@/drizzle/schema"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

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

  const user = await getUserByClerkId(clerkUserId)

  if (user == null) {
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

// NOTE: stores the DB id + role on the Clerk user, so they show up in the
// session token (sessionClaims.role is what the admin layout checks).
export async function syncClerkUserMetadata(user: {
  id: string
  clerkUserId: string
  role: UserRole
}) {
  const client = await clerkClient()
  return client.users.updateUserMetadata(user.clerkUserId, {
    publicMetadata: {
      dbId: user.id,
      role: user.role,
    },
  })
}

async function getUserByClerkId(clerkUserId: string) {
  return db.query.UserTable.findFirst({
    where: { clerkUserId },
  })
}
