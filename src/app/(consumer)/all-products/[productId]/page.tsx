import { SkeletonButton } from "@/components/Skeleton"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { VideoIcon } from "lucide-react"
import { cacheTag } from "next/cache"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

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
  const lessonCount = sumArray(product.courses, (course) =>
    sumArray(course.courseSections, (s) => s.lessons.length),
  )

  return (
    <div className="my-6 container">
      <div className="flex justify-between items-center gap-16">
        <div className="flex flex-col items-start gap-6">
          <div className="flex flex-col gap-2">
            <Suspense
              fallback={
                <div className="text-xl">
                  {formatPrice(product.priceInDollars)}
                </div>
              }
            >
              <Price price={product.priceInDollars} />
            </Suspense>
            <h1 className="font-semibold text-4xl">{product.name}</h1>
            <div className="text-muted-foreground">
              {formatPlural(courseCount, {
                singular: "course",
                plural: "courses",
              })}{" "}
              •{" "}
              {formatPlural(lessonCount, {
                singular: "lesson",
                plural: "lessons",
              })}
            </div>
          </div>
          <div className="text-xl">{product.description}</div>
          <Suspense fallback={<SkeletonButton className="w-36 h-16" />}>
            <PurchaseButton productId={product.id} />
          </Suspense>
        </div>
        <div className="relative max-w-lg aspect-video grow">
          <Image
            src={product.imageUrl}
            fill
            alt={product.name}
            className="rounded-xl object-contain"
          />
        </div>
      </div>
      <div className="items-start gap-8 grid grid-cols-1 lg:grid-cols-2 mt-8">
        {product.courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle>{course.name}</CardTitle>
              <CardDescription>
                {formatPlural(course.courseSections.length, {
                  singular: "section",
                  plural: "sections",
                })}{" "}
                •{" "}
                {formatPlural(
                  sumArray(course.courseSections, (s) => s.lessons.length),
                  {
                    plural: "lessons",
                    singular: "lesson",
                  },
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion multiple>
                {course.courseSections.map((section) => (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger className="flex gap-2">
                      <div className="flex flex-col grow">
                        <span className="text-lg">{section.name}</span>
                        <span className="text-muted-foreground">
                          {formatPlural(section.lessons.length, {
                            plural: "lessons",
                            singular: "lesson",
                          })}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-2">
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-2 text-base"
                        >
                          <VideoIcon className="size-4" />
                          {lesson.status === "preview" ? (
                            <Link
                              href={`/courses/${course.id}/lessons/${lesson.id}`}
                              className="text-accent underline"
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

async function PurchaseButton({ productId }: { productId: string }) {
  const { userId } = await getCurrentUser()
  const alreadyOwnsProduct =
    userId != null && (await userOwnsProduct({ userId, productId }))

  if (alreadyOwnsProduct) {
    return <p>You already own this product</p>
  } else {
    return (
      <Button
        className="px-8 py-4 rounded-lg h-auto text-xl"
        nativeButton={false}
        render={
          <Link href={`/all-products/${productId}/purchase`}>Get Now</Link>
        }
      />
    )
  }
}

async function Price({ price }: { price: number }) {
  const coupon = await getUserCoupon()
  if (price === 0 || coupon == null) {
    return <div className="text-xl">{formatPrice(price)}</div>
  }

  return (
    <div className="flex items-baseline gap-2">
      <div className={"line-through text-sm opacity-50"}>
        {formatPrice(price)}
      </div>

      <div className="text-xl">
        {formatPrice(price * (1 - coupon.discountPercentage))}
      </div>
    </div>
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
