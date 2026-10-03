import { db } from "@/drizzle/db"
import {
  CourseProductTable,
  CourseSectionTable,
  LessonTable,
  ProductTable,
} from "@/drizzle/schema"
import { getCourseSectionGlobalTag } from "@/features/courseSections/db/cache"
import { getLessonGlobalTag } from "@/features/lessons/db/cache/lessons"
import { ProductCard } from "@/features/products/components/ProductCard"
import { getProductGlobalTag } from "@/features/products/db/cache"
import { wherePublicProducts } from "@/features/products/permissions/products"
import { asc, countDistinct, eq } from "drizzle-orm"
import { cacheTag } from "next/cache"
import { Eyebrow } from "../_landing/Eyebrow"

export const instant = false

export default async function AllProductsPage() {
  const products = await getPublicProducts()

  return (
    <>
      <section className="mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 pt-18 max-[720px]:pt-10 w-full max-w-310 animate-rise">
        <Eyebrow>All products</Eyebrow>
        <div className="flex flex-wrap justify-between items-end gap-8 mt-3.5">
          <h1 className="font-semibold text-[clamp(44px,6vw,80px)] leading-[0.95] tracking-[-0.045em] text-balance max-[720px]:text-[clamp(32px,11vw,48px)] max-[720px]:leading-[1.02] max-[380px]:text-[clamp(28px,10.5vw,36px)]">
            Pick what you&apos;ll{" "}
            <span className="text-accent">build next.</span>
          </h1>
          <p className="max-w-105 text-[18px] text-muted-foreground leading-[1.55]">
            Self-paced, project-based courses. Pay once, keep access for good.
          </p>
        </div>
      </section>

      <section className="mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 pt-12 w-full max-w-310">
        {products.length === 0 ? (
          <p className="py-16 border-t border-foreground text-muted-foreground">
            No products yet — check back soon.
          </p>
        ) : (
          <div className="gap-6 grid grid-cols-[repeat(auto-fill,minmax(max(min(100%,270px),calc((100%-48px)/3-0.5px)),1fr))] pt-8 border-t border-foreground">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </section>

      <FairPricingSection />
    </>
  )
}

function FairPricingSection() {
  return (
    <section className="mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 pt-24 pb-27.5 w-full max-w-310">
      <div className="gap-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] bg-foreground p-[clamp(32px,5vw,64px)] rounded-[28px] text-background">
        <div>
          <Eyebrow className="text-lime">Fair pricing</Eyebrow>
          <h2 className="mt-3.5 font-semibold text-[clamp(30px,3.6vw,46px)] leading-none tracking-[-0.04em]">
            Good education shouldn&apos;t depend on{" "}
            <span className="text-lime">where you live.</span>
          </h2>
        </div>
        <div className="flex flex-col justify-center gap-5.5">
          <div className="flex gap-4">
            <span className="font-mono text-lime">01</span>
            <p className="text-[16px] text-[#b5afa3] leading-[1.55]">
              Learners in lower-income countries get a discounted price on every
              product.
            </p>
          </div>
          <div className="flex gap-4">
            <span className="font-mono text-lime">02</span>
            <p className="text-[16px] text-[#b5afa3] leading-[1.55]">
              It&apos;s applied automatically at checkout — no codes, no forms,
              no proof needed.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

async function getPublicProducts() {
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
    .orderBy(asc(ProductTable.name))
}
