import { db } from "@/drizzle/db"
import { getCourseGlobalTag } from "@/features/courses/db/cache/courses"
import ProductForm from "@/features/products/components/ProductForm"
import { cacheTag } from "next/cache"
import Link from "next/link"
import { Eyebrow } from "../../../(consumer)/_landing/Eyebrow"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function NewProductPage() {
  return (
    <section className="mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 pt-5 pb-27.5 w-full max-w-250 animate-rise">
      <Link
        href="/admin/my-products"
        className="text-[13px] text-ink-soft hover:text-accent transition-colors"
      >
        ← My products
      </Link>
      <Eyebrow className="mt-3.5">Admin</Eyebrow>
      <h1 className="mt-2 font-semibold text-[32px] leading-none tracking-[-0.04em] max-[720px]:text-[clamp(32px,11vw,48px)] max-[720px]:leading-[1.02] max-[380px]:text-[clamp(28px,10.5vw,36px)]">
        New <span className="text-accent">product.</span>
      </h1>
      <div className="bg-card mt-5.5 px-6 py-5 border rounded-[22px]">
        <ProductForm courses={await getCourses()} />
      </div>
    </section>
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
