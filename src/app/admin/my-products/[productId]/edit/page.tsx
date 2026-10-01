import PageHeader from "@/components/PageHeader"
import { db } from "@/drizzle/db"
import { getCourseGlobalTag } from "@/features/courses/db/cache/courses"
import ProductForm from "@/features/products/components/ProductForm"
import { getProductIdTag } from "@/features/products/db/cache"
import { cacheTag } from "next/cache"
import { notFound } from "next/navigation"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const product = await getProduct(productId)

  if (product == null) return notFound()

  return (
    <div className="my-6 container">
      <PageHeader title="New Product" />
      <ProductForm
        product={{
          ...product,
          courseIds: product.courseProducts.map((c) => c.courseId),
        }}
        courses={await getCourses()}
      />
    </div>
  )
}

async function getCourses() {
  "use cache"
  cacheTag(getCourseGlobalTag())

  return db.query.CourseTable.findMany({
    orderBy: { name: "asc" },
    columns: { id: true, name: true },
  })
}

async function getProduct(id: string) {
  "use cache"
  cacheTag(getProductIdTag(id))

  return db.query.ProductTable.findFirst({
    columns: {
      id: true,
      name: true,
      description: true,
      priceInDollars: true,
      status: true,
      imageUrl: true,
    },
    where: { id },
    with: { courseProducts: { columns: { courseId: true } } },
  })
}
