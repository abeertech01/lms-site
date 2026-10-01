import { db, transaction } from "@/drizzle/db"
import {
  CourseProductTable,
  CourseSectionTable,
  LessonTable,
  ProductTable,
  PurchaseTable,
} from "@/drizzle/schema"
import { and, countDistinct, desc, eq, isNull } from "drizzle-orm"
import { cacheTag } from "next/cache"
import { wherePublicProducts } from "../permissions/products"
import { getProductGlobalTag, revalidateProductCache } from "./cache"
import { getCourseSectionGlobalTag } from "@/features/courseSections/db/cache"
import { getLessonGlobalTag } from "@/features/lessons/db/cache/lessons"
import {
  getPurchaseGlobalTag,
  getPurchaseUserTag,
} from "@/features/purchases/db/cache"
import { getUserCourseAccessUserTag } from "@/features/courses/db/cache/userCourseAccess"

export async function userOwnsProduct({
  userId,
  productId,
}: {
  userId: string
  productId: string
}) {
  "use cache"
  cacheTag(getPurchaseUserTag(userId))

  const existingPurchase = await db.query.PurchaseTable.findFirst({
    where: {
      productId,
      userId,
      refundedAt: { isNull: true },
    },
  })

  return existingPurchase != null
}

export async function userHasAccessToProductCourses({
  userId,
  productId,
}: {
  userId: string
  productId: string
}) {
  "use cache"
  cacheTag(getUserCourseAccessUserTag(userId))

  const product = await db.query.ProductTable.findFirst({
    where: {
      id: productId,
    },
    columns: {},
    with: {
      courseProducts: { columns: { courseId: true } },
    },
  })

  if (product == null || product.courseProducts.length === 0) return false

  const accesses = await db.query.UserCourseAccessTable.findMany({
    where: {
      userId,
      courseId: { in: product.courseProducts.map((cp) => cp.courseId) },
    },
  })

  return accesses.length === product.courseProducts.length
}

export async function getMostPurchasedProducts(limit = 4) {
  "use cache"
  cacheTag(
    getProductGlobalTag(),
    getPurchaseGlobalTag(),
    getCourseSectionGlobalTag(),
    getLessonGlobalTag(),
  )

  return db
    .select({
      id: ProductTable.id,
      name: ProductTable.name,
      description: ProductTable.description,
      priceInDollars: ProductTable.priceInDollars,
      imageUrl: ProductTable.imageUrl,
      lessonsCount: countDistinct(LessonTable.id),
    })
    .from(ProductTable)
    .leftJoin(
      PurchaseTable,
      and(
        eq(PurchaseTable.productId, ProductTable.id),
        isNull(PurchaseTable.refundedAt),
      ),
    )
    .leftJoin(
      CourseProductTable,
      eq(CourseProductTable.productId, ProductTable.id),
    )
    .leftJoin(
      CourseSectionTable,
      eq(CourseSectionTable.courseId, CourseProductTable.courseId),
    )
    .leftJoin(LessonTable, eq(LessonTable.sectionId, CourseSectionTable.id))
    .where(wherePublicProducts)
    .groupBy(ProductTable.id)
    .orderBy(desc(countDistinct(PurchaseTable.id)))
    .limit(limit)
}

export async function getLatestProducts(limit = 4) {
  "use cache"
  cacheTag(
    getProductGlobalTag(),
    getCourseSectionGlobalTag(),
    getLessonGlobalTag(),
  )

  return db
    .select({
      id: ProductTable.id,
      name: ProductTable.name,
      description: ProductTable.description,
      priceInDollars: ProductTable.priceInDollars,
      imageUrl: ProductTable.imageUrl,
      lessonsCount: countDistinct(LessonTable.id),
    })
    .from(ProductTable)
    .leftJoin(
      CourseProductTable,
      eq(CourseProductTable.productId, ProductTable.id),
    )
    .leftJoin(
      CourseSectionTable,
      eq(CourseSectionTable.courseId, CourseProductTable.courseId),
    )
    .leftJoin(LessonTable, eq(LessonTable.sectionId, CourseSectionTable.id))
    .where(wherePublicProducts)
    .groupBy(ProductTable.id)
    .orderBy(desc(ProductTable.createdAt))
    .limit(limit)
}

export async function insertProduct(
  data: typeof ProductTable.$inferInsert & { courseIds: string[] },
) {
  const newProduct = await transaction(async (trx) => {
    const [newProduct] = await trx.insert(ProductTable).values(data).returning()
    if (newProduct == null) {
      trx.rollback()
      throw new Error("Failed to create product")
    }

    await trx.insert(CourseProductTable).values(
      data.courseIds.map((courseId) => ({
        productId: newProduct.id,
        courseId,
      })),
    )

    return newProduct
  })

  revalidateProductCache(newProduct.id)

  return newProduct
}

export async function updateProduct(
  id: string,
  data: Partial<typeof ProductTable.$inferInsert> & { courseIds: string[] },
) {
  const updatedProduct = await transaction(async (trx) => {
    const [updatedProduct] = await trx
      .update(ProductTable)
      .set(data)
      .where(eq(ProductTable.id, id))
      .returning()
    if (updatedProduct == null) {
      trx.rollback()
      throw new Error("Failed to create product")
    }

    await trx
      .delete(CourseProductTable)
      .where(eq(CourseProductTable.productId, updatedProduct.id))

    await trx.insert(CourseProductTable).values(
      data.courseIds.map((courseId) => ({
        productId: updatedProduct.id,
        courseId,
      })),
    )

    return updatedProduct
  })

  revalidateProductCache(updatedProduct.id)

  return updatedProduct
}

export async function deleteProduct(id: string) {
  const [deletedProduct] = await db
    .delete(ProductTable)
    .where(eq(ProductTable.id, id))
    .returning()
  if (deletedProduct == null) throw new Error("Failed to delete the product")

  revalidateProductCache(deletedProduct.id)
  return deletedProduct
}
