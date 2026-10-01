import { db } from "@/drizzle/db"
import { auth } from "@clerk/nextjs/server"
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

async function getUserByClerkId(clerkUserId: string) {
  return db.query.UserTable.findFirst({
    where: { clerkUserId },
  })
}
