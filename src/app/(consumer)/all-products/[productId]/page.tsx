import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion"
import { db } from "@/drizzle/db"
import { getCourseIdTag } from "@/features/courses/db/cache/courses"
import { getCourseSectionCourseTag } from "@/features/courseSections/db/cache"
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons"
import { getProductIdTag } from "@/features/products/db/cache"
import { userOwnsProduct } from "@/features/products/db/products"
import { formatPlural, formatPrice } from "@/lib/formatters"
import { sumArray } from "@/lib/sumArray"
import { getUserCoupon } from "@/lib/userCountryHeader"
import { getCurrentUser } from "@/services/clerk"
import { ChevronUpIcon, PlayIcon } from "lucide-react"
import { cacheTag } from "next/cache"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { Eyebrow } from "../../_landing/Eyebrow"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const product = await getPublicProduct(productId)

  if (product == null) return notFound()

  const courseCount = product.courses.length
  const sectionCount = sumArray(product.courses, (c) => c.courseSections.length)
  const lessonCount = sumArray(product.courses, (course) =>
    sumArray(course.courseSections, (s) => s.lessons.length),
  )

  // NOTE: like the design, the last word of the name is highlighted ("AI/ML Engineering").
  const nameWords = product.name.split(" ")
  const lastWord = nameWords.length > 1 ? nameWords.pop() : null

  return (
    <>
      <section className="mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 pt-9 w-full max-w-310 animate-rise">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[13px] text-ink-soft"
        >
          <Link href="/all-products" className="hover:text-accent">
            All products
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="items-center gap-12 grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] mt-9">
          <div>
            <h1 className="font-semibold text-[clamp(42px,5.6vw,76px)] leading-[0.95] tracking-[-0.045em] text-balance max-[720px]:text-[clamp(32px,11vw,48px)] max-[720px]:leading-[1.02] max-[380px]:text-[clamp(28px,10.5vw,36px)]">
              {nameWords.join(" ")}
              {lastWord != null && (
                <>
                  {" "}
                  <span className="text-accent">{lastWord}</span>
                </>
              )}
            </h1>
            <div className="flex flex-wrap gap-2.5 mt-5.5 font-mono text-muted-foreground text-xs uppercase tracking-[0.05em]">
              <span>
                {formatPlural(courseCount, {
                  singular: "course",
                  plural: "courses",
                })}
              </span>
              <span>·</span>
              <span>
                {formatPlural(sectionCount, {
                  singular: "section",
                  plural: "sections",
                })}
              </span>
              <span>·</span>
              <span>
                {formatPlural(lessonCount, {
                  singular: "lesson",
                  plural: "lessons",
                })}
              </span>
            </div>
            <p className="mt-5.5 max-w-140 text-[19px] text-muted-foreground leading-[1.55] text-pretty">
              {product.description}
            </p>
            <div className="mt-8">
              <Suspense
                fallback={
                  <span className="inline-flex bg-primary opacity-60 px-7 py-4 rounded-full font-medium text-[16px] text-primary-foreground">
                    Get now — {formatPrice(product.priceInDollars)}
                  </span>
                }
              >
                <HeroPurchase
                  productId={product.id}
                  price={product.priceInDollars}
                />
              </Suspense>
            </div>
          </div>
          <div className="relative bg-secondary border rounded-[26px] aspect-4/3 overflow-hidden">
            <Image
              src={product.imageUrl}
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              alt={product.name}
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section className="mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 pt-18 w-full max-w-310">
        <div className="items-start gap-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <Eyebrow>Curriculum</Eyebrow>
            <h2 className="mt-3 font-semibold text-[clamp(28px,3.4vw,42px)] leading-none tracking-[-0.04em]">
              What&apos;s inside
            </h2>
            <div className="flex flex-col gap-5 mt-7">
              {product.courses.map((course) => (
                <CurriculumCard key={course.id} course={course} />
              ))}
            </div>
          </div>

          <aside className="lg:top-22 lg:sticky flex flex-col gap-5.5 bg-foreground p-8 rounded-3xl min-w-0 text-background">
            <Eyebrow className="text-lime">One-time payment</Eyebrow>
            <Suspense
              fallback={
                <div className="font-semibold text-[56px] leading-none tracking-[-0.04em]">
                  {formatPrice(product.priceInDollars)}
                </div>
              }
            >
              <PriceCard
                productId={product.id}
                price={product.priceInDollars}
              />
            </Suspense>
            <ul className="flex flex-col gap-3 pt-5.5 border-[#35322a] border-t text-[15px] text-[#d8d3c6]">
              <li className="flex gap-3">
                <span className="text-lime">✓</span>
                {formatPlural(lessonCount, {
                  singular: "video lesson",
                  plural: "video lessons",
                })}{" "}
                in{" "}
                {formatPlural(sectionCount, {
                  singular: "section",
                  plural: "sections",
                })}
              </li>
              <li className="flex gap-3">
                <span className="text-lime">✓</span>
                Lifetime access, learn at your pace
              </li>
              <li className="flex gap-3">
                <span className="text-lime">✓</span>
                Regional pricing applied automatically
              </li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 pt-24 pb-27.5 w-full max-w-310">
        <div className="flex flex-wrap justify-between items-center gap-5 px-8 py-7 border-[1.5px] border-line-strong border-dashed rounded-[22px]">
          <div>
            <div className="font-semibold text-xl tracking-[-0.02em]">
              Not sure this is the one?
            </div>
            <div className="mt-1.5 text-[15px] text-muted-foreground">
              Browse the rest of the catalog.
            </div>
          </div>
          <Link
            href="/all-products"
            className="px-5 py-2.75 border border-foreground rounded-full font-medium text-sm hover:text-background whitespace-nowrap transition-colors hover:bg-foreground"
          >
            All products →
          </Link>
        </div>
      </section>
    </>
  )
}

function CurriculumCard({
  course,
}: {
  course: {
    id: string
    name: string
    courseSections: {
      id: string
      name: string
      lessons: { id: string; name: string; status: string }[]
    }[]
  }
}) {
  return (
    <div className="bg-card px-7 py-2 border rounded-[22px]">
      <div className="pt-5.5 pb-4.5 border-b">
        <div className="font-semibold text-[17px]">{course.name}</div>
        <div className="mt-1 text-sm text-muted-foreground">
          {formatPlural(course.courseSections.length, {
            singular: "section",
            plural: "sections",
          })}{" "}
          ·{" "}
          {formatPlural(
            sumArray(course.courseSections, (s) => s.lessons.length),
            { plural: "lessons", singular: "lesson" },
          )}
        </div>
      </div>
      <Accordion
        multiple
        defaultValue={course.courseSections.map((section) => section.id)}
      >
        {course.courseSections.map((section) => (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="border-b last:border-b-0"
          >
            <AccordionPrimitive.Header className="flex">
              <AccordionPrimitive.Trigger className="group/trigger flex flex-1 justify-between items-center gap-4 py-5.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50 text-left cursor-pointer">
                <span>
                  <span className="block font-semibold text-xl tracking-[-0.02em]">
                    {section.name}
                  </span>
                  <span className="block mt-1 text-sm text-muted-foreground">
                    {formatPlural(section.lessons.length, {
                      plural: "lessons",
                      singular: "lesson",
                    })}
                  </span>
                </span>
                <ChevronUpIcon
                  aria-hidden="true"
                  className="size-5 text-muted-foreground transition-transform rotate-180 group-aria-expanded/trigger:rotate-0 shrink-0"
                />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionContent className="flex flex-col gap-1.5 pb-5.5 [&_a]:no-underline">
              {section.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center gap-3.5 bg-background px-3.5 py-3 rounded-xl text-base"
                >
                  <span className="place-items-center grid bg-foreground rounded-full size-7 text-background shrink-0">
                    <PlayIcon className="size-3 fill-current" />
                  </span>
                  {lesson.status === "preview" ? (
                    <Link
                      href={`/courses/${course.id}/lessons/${lesson.id}`}
                      className="text-accent hover:underline"
                    >
                      {lesson.name}
                    </Link>
                  ) : (
                    lesson.name
                  )}
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

// NOTE: both purchase panels need the visitor (do they already own it?) and the
// regional coupon, which are request-time data, so they render inside <Suspense>.
async function getPurchaseContext(productId: string, price: number) {
  const { userId } = await getCurrentUser()
  const owns = userId != null && (await userOwnsProduct({ userId, productId }))
  const coupon = await getUserCoupon()
  const discounted = price !== 0 && coupon != null
  const finalPrice = discounted
    ? price * (1 - coupon.discountPercentage)
    : price

  return { owns, discounted, finalPrice }
}

async function HeroPurchase({
  productId,
  price,
}: {
  productId: string
  price: number
}) {
  const { owns, discounted, finalPrice } = await getPurchaseContext(
    productId,
    price,
  )

  if (owns) {
    return (
      <div className="flex flex-wrap items-center gap-4.5">
        <Link
          href="/courses"
          className="bg-primary px-7 py-4 rounded-full font-medium text-[16px] text-primary-foreground hover:text-white whitespace-nowrap transition-colors hover:bg-accent"
        >
          You own this — go to my courses →
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-4.5">
      <Link
        href={`/all-products/${productId}/purchase`}
        className="bg-primary px-7 py-4 rounded-full font-medium text-[16px] text-primary-foreground hover:text-white whitespace-nowrap transition-colors hover:bg-accent"
      >
        Get now — {formatPrice(finalPrice)}
      </Link>
      {discounted && (
        <span className="font-mono text-[13px] text-accent">
          Regional pricing applied
        </span>
      )}
    </div>
  )
}

async function PriceCard({
  productId,
  price,
}: {
  productId: string
  price: number
}) {
  const { owns, discounted, finalPrice } = await getPurchaseContext(
    productId,
    price,
  )

  return (
    <>
      <div className="flex flex-wrap items-baseline gap-3">
        <div className="font-semibold text-[56px] leading-none tracking-[-0.04em]">
          {formatPrice(finalPrice)}
        </div>
        {discounted && (
          <div className="opacity-50 text-lg line-through">
            {formatPrice(price)}
          </div>
        )}
      </div>
      {owns ? (
        <Link
          href="/courses"
          className="bg-lime px-6 py-3.75 rounded-full font-medium text-[16px] text-foreground text-center transition-colors hover:bg-white"
        >
          Go to my courses
        </Link>
      ) : (
        <Link
          href={`/all-products/${productId}/purchase`}
          className="bg-lime px-6 py-3.75 rounded-full font-medium text-[16px] text-foreground text-center transition-colors hover:bg-white"
        >
          Get now
        </Link>
      )}
    </>
  )
}

async function getPublicProduct(id: string) {
  "use cache"
  cacheTag(getProductIdTag(id))
  // NOTE: A big/detailed explanation has been given in the bottom of this function.

  const product = await db.query.ProductTable.findFirst({
    columns: {
      id: true,
      name: true,
      description: true,
      priceInDollars: true,
      imageUrl: true,
    },
    where: { id, status: "public" },
    with: {
      courseProducts: {
        columns: {},
        with: {
          course: {
            columns: { id: true, name: true },
            with: {
              courseSections: {
                columns: { id: true, name: true },
                where: { status: "public" },
                orderBy: { order: "asc" },
                with: {
                  lessons: {
                    columns: { id: true, name: true, status: true },
                    where: { status: { in: ["public", "preview"] } },
                    orderBy: { order: "asc" },
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

  return {
    ...other,
    courses: courseProducts.map((cp) => cp.course),
  }
  /** NOTE:
   * The product data includes information from the
   * - product itself
   * - Associated courses
   * - Course sections
   * - Lessons
   *
   * If you only tag the cache with the product ID, the cache won't know to invalidate when:
   * - A course name changes
   * - A section is added/removed
   * - A lesson status updates
   *
   * The second cacheTag method caches this outcome when any course associated to LessonCourse, SectionCourse and Course tables changes, it invalidates this product's cache. This invalidating happens when revalidateTag function gets triggered with their respective associated ids
   */
}
