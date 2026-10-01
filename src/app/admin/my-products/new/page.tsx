import PageHeader from "@/components/PageHeader"
import { db } from "@/drizzle/db"
import { getCourseGlobalTag } from "@/features/courses/db/cache/courses"
import ProductForm from "@/features/products/components/ProductForm"
import { cacheTag } from "next/cache"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function NewProductPage() {
  return (
    <div className="my-6 container">
      <PageHeader title="New Product" />
      <ProductForm courses={await getCourses()} />
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
