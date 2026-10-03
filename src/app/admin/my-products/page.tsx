import { db } from "@/drizzle/db"
import {
  CourseProductTable,
  ProductTable as DbProductTable,
  PurchaseTable,
} from "@/drizzle/schema"
import ProductTable from "@/features/products/components/ProductTable"
import { getProductGlobalTag } from "@/features/products/db/cache"
import { asc, countDistinct, eq } from "drizzle-orm"
import { cacheTag } from "next/cache"
import Link from "next/link"
import { Eyebrow } from "../../(consumer)/_landing/Eyebrow"

export default async function MyProductsPage() {
  const products = await getProducts()

  return (
    <>
      <section className="mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 pt-14 max-[720px]:pt-8 w-full max-w-310 animate-rise">
        <Eyebrow>Admin</Eyebrow>
        <div className="flex flex-wrap justify-between items-end gap-8 mt-3.5">
          <h1 className="font-semibold text-[clamp(44px,6vw,80px)] leading-[0.95] tracking-[-0.045em] max-[720px]:text-[clamp(32px,11vw,48px)] max-[720px]:leading-[1.02] max-[380px]:text-[clamp(28px,10.5vw,36px)]">
            My products<span className="text-accent">.</span>
          </h1>
          <Link
            href="/admin/my-products/new"
            className="bg-primary px-6 py-3.5 max-[720px]:min-h-11 max-[720px]:inline-flex max-[720px]:items-center rounded-full font-medium text-[15px] text-primary-foreground hover:text-white whitespace-nowrap transition-colors hover:bg-accent"
          >
            + New product
          </Link>
        </div>
      </section>
      <section className="mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 pt-10 pb-27.5 w-full max-w-310">
        <ProductTable products={products} />
      </section>
    </>
  )
}

async function getProducts() {
  "use cache"
  cacheTag(getProductGlobalTag())

  return await db
    .select({
      id: DbProductTable.id,
      name: DbProductTable.name,
      status: DbProductTable.status,
      priceInDollars: DbProductTable.priceInDollars,
      description: DbProductTable.description,
      imageUrl: DbProductTable.imageUrl,
      coursesCount: countDistinct(CourseProductTable.courseId), // NOTE: countDistinct(column) counts how many unique (non-duplicate) values exist in that column. It’s just Drizzle’s way of writing SQL’s COUNT(DISTINCT column).
      customersCount: countDistinct(PurchaseTable.userId),
    })
    .from(DbProductTable)
    .leftJoin(PurchaseTable, eq(PurchaseTable.productId, DbProductTable.id))
    .leftJoin(
      CourseProductTable,
      eq(CourseProductTable.productId, DbProductTable.id),
    )
    .orderBy(asc(DbProductTable.name))
    .groupBy(DbProductTable.id)
}
