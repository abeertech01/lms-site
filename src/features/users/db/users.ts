import { db } from "@/drizzle/db"
import { UserTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { revalidateUserCache } from "./cache"

/** NOTE:
 * "use cache"
 * This is a directive, telling the system to cache the result of this function.
 *
 ** cacheTag()
 * This labels the cached result with a tag

export async function test() {
  "use cache"
  cacheTag("test")
}

revalidateTag("test")
*/

/** NOTE:
 * typeof UserTable.$inferInsert
 * This gives you the TypeScript type representing the structure of values allowed when inserting into UserTable.
 *
 ** returning()
 * returning gets the saved user forming an array
 *
 ** [newUser]
 * here it suggests that newUser is of User type. But the user object could be unreturned.
 * To make sure no issues, add ("noUncheckedIndexedAccess": true) in compilerOptions of tsconfig
 * This will make sure that if newUser is not returned, it will have type of 'undefined'.
 *
 ** What does onConflictDoUpdate() do?
 * When you try to insert a row and it conflicts with a unique constraint — like clerkUserId being unique this method does not insert a new row, updates the existing row instead.
 * [UserTable.clerkUserId] - unique constraint to check conflict.
 * onConflictDoUpdate = UPSERT (insert-or-update)
 */
export async function insertUser(data: typeof UserTable.$inferInsert) {
  const [newUser] = await db
    .insert(UserTable)
    .values(data)
    .returning()
    .onConflictDoUpdate({
      target: [UserTable.clerkUserId],
      set: data,
    })

  if (!newUser) throw new Error("Failed to create a user")
  revalidateUserCache(newUser.id)

  return newUser
}

export async function updateUser(
  { clerkUserId }: { clerkUserId: string },
  data: Partial<typeof UserTable.$inferInsert>
) {
  const [updatedUser] = await db
    .update(UserTable)
    .set(data)
    .where(eq(UserTable.clerkUserId, clerkUserId))
    .returning()

  if (updatedUser == null) throw new Error("Failed to update the user")
  revalidateUserCache(updatedUser.id)

  return updatedUser
}

export async function deleteUser({ clerkUserId }: { clerkUserId: string }) {
  const [deletedUser] = await db
    .update(UserTable)
    .set({
      deletedAt: new Date(),
      email: "redacted@deleted.com",
      name: "Deleted User",
      clerkUserId: "deleted",
      imageUrl: null,
    })
    .where(eq(UserTable.clerkUserId, clerkUserId))
    .returning()

  if (deletedUser == null) throw new Error("Failed to delete the user")
  revalidateUserCache(deletedUser.id)

  return deletedUser
}
