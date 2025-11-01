import { db } from "@/drizzle/db"
import {
  ProductTable,
  PurchaseTable,
  UserCourseAccessTable,
} from "@/drizzle/schema"
import { revalidateUserCourseAccessCache } from "./cache/userCourseAccess"
import { and, eq, inArray, isNull } from "drizzle-orm"

export async function addUserCourseAccess(
  {
    userId,
    courseIds,
  }: {
    userId: string
    courseIds: string[]
  },
  trx: Omit<typeof db, "$client"> = db
) {
  /** NOTE: Omit<typeof db, "$client">
   * It means use the same type as db, but omit the internal $client property.
   * db → main Drizzle instance with $client (the database connection)
   * trx → transaction-bound Drizzle instance without exposing $client
   * Drizzle replaces $client with a transaction client, so it doesn’t want you to mess with or rely on the original one.
   */
  const accesses = await trx
    .insert(UserCourseAccessTable)
    .values(courseIds.map((courseId) => ({ userId, courseId })))
    .onConflictDoNothing()
    .returning()

  accesses.forEach(revalidateUserCourseAccessCache)

  return accesses
}

export async function revokeUserCourseAccess(
  {
    userId,
    productId,
  }: {
    userId: string
    productId: string
  },
  trx: Omit<typeof db, "$client">
) {
  const validPurchases = await trx.query.PurchaseTable.findMany({
    where: and(
      eq(PurchaseTable.userId, userId),
      isNull(PurchaseTable.refundedAt)
    ),
    with: {
      product: {
        with: { courseProducts: { columns: { courseId: true } } },
      },
    },
  })

  const refundPurchase = await trx.query.ProductTable.findFirst({
    where: eq(ProductTable.id, productId),
    with: { courseProducts: { columns: { courseId: true } } },
  })

  if (refundPurchase == null) return

  const validCourseIds = validPurchases.flatMap((p) =>
    p.product.courseProducts.map((cp) => cp.courseId)
  )

  const removeCourseIds = refundPurchase.courseProducts
    .flatMap((cp) => cp.courseId)
    .filter((courseId) => !validCourseIds.includes(courseId))

  const revokedAccesses = await trx
    .delete(UserCourseAccessTable)
    .where(
      and(
        eq(UserCourseAccessTable.userId, userId),
        inArray(UserCourseAccessTable.courseId, removeCourseIds)
      )
    )
    .returning()

  revokedAccesses.forEach(revalidateUserCourseAccessCache)

  return revokedAccesses
}
