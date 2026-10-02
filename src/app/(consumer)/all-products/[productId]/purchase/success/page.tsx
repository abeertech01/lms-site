import { LoadingSpinner } from "@/components/LoadingSpinner"
import { db } from "@/drizzle/db"
import { getCourseIdTag } from "@/features/courses/db/cache/courses"
import { getCourseSectionCourseTag } from "@/features/courseSections/db/cache"
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons"
import { getProductIdTag } from "@/features/products/db/cache"
import { getPurchaseUserTag } from "@/features/purchases/db/cache"
import { formatPlural, formatPrice } from "@/lib/formatters"
import { sumArray } from "@/lib/sumArray"
import { getCurrentUser } from "@/services/clerk"
import { cacheTag } from "next/cache"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Eyebrow } from "../../../../_landing/Eyebrow"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function ProductPurchaseSuccessPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const product = await getPublicProduct(productId)

  if (product == null) return notFound()

  const sectionCount = sumArray(product.courses, (c) => c.courseSections.length)
  const lessonCount = sumArray(product.courses, (c) =>
    sumArray(c.courseSections, (s) => s.lessons.length),
  )

  return (
    <section className="items-center gap-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] mx-auto px-6 pt-20 pb-27.5 w-full max-w-310">
      <div className="animate-rise">
        <div className="place-items-center grid bg-lime rounded-full size-16 font-semibold text-[30px] animate-pop">
          ✓
        </div>
        <Eyebrow className="mt-8">Payment received</Eyebrow>
        <h1 className="mt-3.5 font-semibold text-[clamp(44px,6vw,84px)] leading-[0.95] tracking-[-0.045em] text-balance">
          Purchase <span className="text-accent">successful.</span>
        </h1>
        <p className="mt-5.5 max-w-120 text-[19px] text-muted-foreground leading-[1.55]">
          Thank you for purchasing{" "}
          <strong className="font-semibold text-foreground">
            {product.name}
          </strong>
          . It&apos;s in your library and ready whenever you are.
        </p>
        <div className="flex flex-wrap gap-3.5 mt-8.5">
          <Link
            href="/courses"
            className="bg-primary px-7 py-4 rounded-full font-medium text-[16px] text-primary-foreground hover:text-white whitespace-nowrap transition-colors hover:bg-accent"
          >
            View my courses →
          </Link>
          <Link
            href="/all-products"
            className="px-6.5 py-3.75 border border-foreground rounded-full font-medium text-[16px] hover:text-background whitespace-nowrap transition-colors hover:bg-foreground"
          >
            Keep browsing
          </Link>
        </div>
      </div>

      <div className="animate-rise [animation-delay:100ms]">
        <div className="relative bg-secondary border rounded-[26px] aspect-16/10 overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
            priority
          />
        </div>
        <dl className="bg-card mt-4 px-6 py-1.5 border rounded-[20px] text-[15px]">
          <Row label="Product" value={product.name} />
          <Row
            label="Content"
            value={`${formatPlural(lessonCount, { singular: "lesson", plural: "lessons" })} · ${formatPlural(sectionCount, { singular: "section", plural: "sections" })}`}
          />
          <Suspense
            fallback={<LoadingSpinner className="mx-auto my-3 size-6" />}
          >
            <AmountPaidRow productId={productId} />
          </Suspense>
        </dl>
      </div>
    </section>
  )
}

function Row({
  label,
  value,
  bold = false,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div className="flex justify-between gap-4 py-4 border-b last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={bold ? "font-semibold text-right" : "font-medium text-right"}
      >
        {value}
      </dd>
    </div>
  )
}

// NOTE: the success page has no purchase id in its URL, so the amount comes from
// the signed-in user's most recent purchase of this product.
async function AmountPaidRow({ productId }: { productId: string }) {
  const { userId } = await getCurrentUser()
  if (userId == null) return null

  const purchase = await getLatestPurchase(userId, productId)
  if (purchase == null) return null

  return (
    <Row
      label="Amount paid"
      value={formatPrice(purchase.pricePaidInCents / 100, {
        showZeroAsNumber: true,
      })}
      bold
    />
  )
}

async function getLatestPurchase(userId: string, productId: string) {
  "use cache"
  cacheTag(getPurchaseUserTag(userId))

  return db.query.PurchaseTable.findFirst({
    columns: { pricePaidInCents: true },
    where: { userId, productId },
    orderBy: { createdAt: "desc" },
  })
}

async function getPublicProduct(id: string) {
  "use cache"
  cacheTag(getProductIdTag(id))

  const product = await db.query.ProductTable.findFirst({
    columns: { name: true, imageUrl: true },
    where: { id, status: "public" },
    with: {
      courseProducts: {
        columns: {},
        with: {
          course: {
            columns: { id: true },
            with: {
              courseSections: {
                columns: { id: true },
                where: { status: "public" },
                with: {
                  lessons: {
                    columns: { id: true },
                    where: { status: { in: ["public", "preview"] } },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (product == null) return product

  cacheTag(
    ...product.courseProducts.flatMap((cp) => [
      getLessonCourseTag(cp.course.id),
      getCourseSectionCourseTag(cp.course.id),
      getCourseIdTag(cp.course.id),
    ]),
  )

  const { courseProducts, ...other } = product

  return { ...other, courses: courseProducts.map((cp) => cp.course) }
}
