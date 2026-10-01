import { db } from "@/drizzle/db"
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
import { getProductGlobalTag } from "./cache"
import { getCourseSectionGlobalTag } from "@/features/courseSections/db/cache"
import { getLessonGlobalTag } from "@/features/lessons/db/cache/lessons"
import { getPurchaseGlobalTag } from "@/features/purchases/db/cache"

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
