import { db } from "@/drizzle/db"
import {
  CourseProductTable,
  CourseSectionTable,
  LessonTable,
  ProductTable,
} from "@/drizzle/schema"
import { ProductCard } from "@/features/products/components/ProductCard"
import { getProductGlobalTag } from "@/features/products/db/cache"
import { getCourseSectionGlobalTag } from "@/features/courseSections/db/cache"
import { getLessonGlobalTag } from "@/features/lessons/db/cache/lessons"
import { wherePublicProducts } from "@/features/products/permissions/products"
import { asc, countDistinct, eq } from "drizzle-orm"
import { cacheTag } from "next/cache"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ProductsPage() {
  const products = await getPublicProducts()

  return (
    <div className="container my-6">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  )
}

async function getPublicProducts() {
  "use cache"
  cacheTag(
    getProductGlobalTag(),
    getCourseSectionGlobalTag(),
    getLessonGlobalTag()
  )

  return db
    .select({
      id: ProductTable.id,
      name: ProductTable.name,
      description: ProductTable.description,
      priceInDollars: ProductTable.priceInDollars,
      imageUrl: ProductTable.imageUrl,
      lessonsCount: countDistinct(LessonTable),
    })
    .from(ProductTable)
    .leftJoin(
      CourseProductTable,
      eq(CourseProductTable.productId, ProductTable.id)
    )
    .leftJoin(
      CourseSectionTable,
      eq(CourseSectionTable.courseId, CourseProductTable.courseId)
    )
    .leftJoin(LessonTable, eq(LessonTable.sectionId, CourseSectionTable.id))
    .where(wherePublicProducts)
    .groupBy(ProductTable.id)
    .orderBy(asc(ProductTable.name))
}
