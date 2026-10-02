import { SkeletonArray, SkeletonText } from "@/components/Skeleton"
import { db } from "@/drizzle/db"
import {
  CourseProductTable,
  CourseSectionTable,
  CourseTable,
  LessonTable,
  ProductTable,
  UserCourseAccessTable,
  UserLessonCompleteTable,
} from "@/drizzle/schema"
import { getProductGlobalTag } from "@/features/products/db/cache"
import { getCourseIdTag } from "@/features/courses/db/cache/courses"
import { getUserCourseAccessUserTag } from "@/features/courses/db/cache/userCourseAccess"
import { getCourseSectionCourseTag } from "@/features/courseSections/db/cache"
import { wherePublicCourseSections } from "@/features/courseSections/permissions/sections"
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons"
import { getUserLessonCompleteUserTag } from "@/features/lessons/db/cache/userLessonComplete"
import { wherePublicLessons } from "@/features/lessons/permissions/lessons"
import { formatPlural } from "@/lib/formatters"
import { getCurrentUser } from "@/services/clerk"
import { auth } from "@clerk/nextjs/server"
import { and, countDistinct, eq, inArray, isNotNull } from "drizzle-orm"
import { cacheTag } from "next/cache"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { Eyebrow } from "../_landing/Eyebrow"

export const instant = false

const sectionClass = "mx-auto px-6 w-full max-w-310"
const gridClass =
  "gap-6 grid grid-cols-[repeat(auto-fill,minmax(max(min(100%,270px),calc((100%-48px)/3-0.5px)),1fr))]"

export default async function CoursesPage() {
  await auth.protect()

  return (
    <>
      <section className={`${sectionClass} pt-18 animate-rise`}>
        <Eyebrow>Your library</Eyebrow>
        <div className="flex flex-wrap justify-between items-end gap-8 mt-3.5">
          <h1 className="font-semibold text-[clamp(44px,6vw,80px)] leading-[0.95] tracking-[-0.045em]">
            My <span className="text-accent">courses.</span>
          </h1>
          <p className="max-w-95 text-[18px] text-muted-foreground leading-[1.55]">
            Everything you own, yours to keep. Pick up where you left off.
          </p>
        </div>
      </section>
      <Suspense fallback={<CoursesSkeleton />}>
        <CoursesContent />
      </Suspense>
    </>
  )
}

async function CoursesContent() {
  const { userId, redirectToSignIn } = await getCurrentUser()
  if (userId == null) return redirectToSignIn()

  const courses = await getUserCourses(userId)

  if (courses.length === 0) return <EmptyState />

  return (
    <>
      <section className={`${sectionClass} pt-12`}>
        <div className="flex justify-between items-center pb-4.5 border-foreground border-b font-mono text-muted-foreground text-xs uppercase tracking-[0.06em]">
          <span>
            {formatPlural(courses.length, {
              plural: "courses",
              singular: "course",
            })}
          </span>
          <span>Lifetime access</span>
        </div>
      </section>

      <section className={`${sectionClass} pt-8`}>
        <div className={gridClass}>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      <section className={`${sectionClass} pt-6 pb-27.5`}>
        <div className="flex flex-wrap justify-between items-center gap-5 px-8 py-7 border-[1.5px] border-line-strong border-dashed rounded-[22px]">
          <div>
            <div className="font-semibold text-xl tracking-[-0.02em]">
              Ready for the next one?
            </div>
            <div className="mt-1.5 text-[15px] text-muted-foreground">
              Regional pricing is applied automatically at checkout.
            </div>
          </div>
          <Link
            href="/all-products"
            className="px-5 py-2.75 border border-foreground rounded-full font-medium text-sm hover:text-background whitespace-nowrap transition-colors hover:bg-foreground"
          >
            Browse products →
          </Link>
        </div>
      </section>
    </>
  )
}

function CourseCard({
  course,
}: {
  course: Awaited<ReturnType<typeof getUserCourses>>[number]
}) {
  const percent =
    course.lessonsCount === 0
      ? 0
      : Math.round((course.lessonsComplete / course.lessonsCount) * 100)

  return (
    <Link href={`/courses/${course.id}`} className="group block h-full">
      <article className="flex flex-col bg-card group-hover:shadow-[0_30px_60px_-30px_rgba(40,30,10,0.3)] border rounded-[20px] h-full overflow-hidden text-foreground transition duration-200 group-hover:-translate-y-1">
        {/* NOTE: falls back to the design's striped placeholder when no product image is found. */}
        <div className="relative bg-[repeating-linear-gradient(135deg,#ECE8DF_0_10px,#E4DFD4_10px_20px)] aspect-16/10">
          {course.imageUrl != null && (
            <Image
              src={course.imageUrl}
              alt={course.name}
              fill
              sizes="(min-width: 1024px) 400px, 100vw"
              className="object-cover"
            />
          )}
          <span className="top-3.5 left-3.5 absolute bg-lime px-2.5 py-1.25 rounded-full font-medium font-mono text-[10.5px] tracking-[0.04em] whitespace-nowrap">
            ✓ OWNED
          </span>
        </div>
        <div className="flex flex-col flex-1 gap-3 p-5.5">
          <div className="flex flex-wrap gap-2 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.03em]">
            <span>
              {formatPlural(course.sectionsCount, {
                plural: "sections",
                singular: "section",
              })}
            </span>
            <span>·</span>
            <span>
              {formatPlural(course.lessonsCount, {
                plural: "lessons",
                singular: "lesson",
              })}
            </span>
          </div>
          <h3 className="font-semibold text-[22px] leading-[1.15] tracking-[-0.03em]">
            {course.name}
          </h3>
          <p
            className="text-[14.5px] text-muted-foreground line-clamp-3 leading-normal text-pretty"
            title={course.description}
          >
            {course.description}
          </p>
          <div className="flex flex-col gap-4 mt-auto pt-4 border-t">
            {course.lessonsCount > 0 && (
              <div>
                <div className="flex justify-between text-[13px] text-muted-foreground">
                  <span>
                    {course.lessonsComplete} of {course.lessonsCount} lessons
                  </span>
                  <span className="font-mono">{percent}%</span>
                </div>
                <div className="bg-secondary mt-2 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-accent rounded-full h-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )}
            <span className="block bg-primary px-4 py-3 rounded-full font-medium text-primary-foreground text-sm text-center">
              View course →
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

function EmptyState() {
  return (
    <section className={`${sectionClass} pt-12 pb-27.5 animate-rise`}>
      <div className="flex flex-col items-center gap-3.5 px-8 py-9 border-[1.5px] border-line-strong border-dashed rounded-[28px] text-center">
        <span className="place-items-center grid bg-[#eae6dc] rounded-full size-14 text-[22px] text-muted-foreground">
          ▶
        </span>
        <h2 className="font-semibold text-[clamp(28px,3.4vw,44px)] leading-[1.05] tracking-[-0.04em]">
          You have no courses yet.
        </h2>
        <p className="max-w-105 text-[17px] text-muted-foreground leading-[1.55]">
          Once you buy a product, its courses show up here, ready to start.
        </p>
        <Link
          href="/all-products"
          className="bg-primary mt-1.5 px-7 py-3.5 rounded-full font-medium text-[15px] text-primary-foreground hover:text-white whitespace-nowrap transition-colors hover:bg-accent"
        >
          Browse products →
        </Link>
      </div>
    </section>
  )
}

function CoursesSkeleton() {
  return (
    <section className={`${sectionClass} pt-12`}>
      <div className={`${gridClass} pt-8 border-t border-foreground`}>
        <SkeletonArray amount={3}>
          <div className="flex flex-col bg-card border rounded-[20px] overflow-hidden">
            <div className="bg-secondary aspect-16/10 animate-pulse" />
            <div className="flex flex-col gap-3 p-5.5">
              <SkeletonText className="w-1/2" />
              <SkeletonText className="w-3/4" />
              <SkeletonText rows={2} />
            </div>
          </div>
        </SkeletonArray>
      </div>
    </section>
  )
}

async function getUserCourses(userId: string) {
  "use cache"
  cacheTag(
    getUserCourseAccessUserTag(userId),
    getUserLessonCompleteUserTag(userId),
    getProductGlobalTag(), // NOTE: the cover image comes from a product
  )

  const courses = await db
    .select({
      id: CourseTable.id,
      name: CourseTable.name,
      description: CourseTable.description,
      sectionsCount: countDistinct(CourseSectionTable.id), // NOTE: countDistinct(column) counts how many unique (non-duplicate) values exist in that column. It’s just Drizzle’s way of writing SQL’s COUNT(DISTINCT column).
      lessonsCount: countDistinct(LessonTable.id),
      lessonsComplete: countDistinct(UserLessonCompleteTable.lessonId),
    })
    .from(CourseTable)
    .leftJoin(
      UserCourseAccessTable,
      and(
        eq(UserCourseAccessTable.courseId, CourseTable.id),
        eq(UserCourseAccessTable.userId, userId),
      ),
    )
    .leftJoin(
      CourseSectionTable,
      and(
        eq(CourseSectionTable.courseId, CourseTable.id),
        wherePublicCourseSections,
      ),
    )
    .leftJoin(
      LessonTable,
      and(eq(LessonTable.sectionId, CourseSectionTable.id), wherePublicLessons),
    )
    .leftJoin(
      UserLessonCompleteTable,
      and(
        eq(UserLessonCompleteTable.lessonId, LessonTable.id),
        eq(UserLessonCompleteTable.userId, userId),
      ),
    )
    .where(isNotNull(UserCourseAccessTable.courseId))
    .orderBy(CourseTable.name)
    .groupBy(CourseTable.id)

  // NOTE: courses have no image of their own, so each card borrows the cover of
  // a product that contains the course (first by name, so it's stable).
  const productImages =
    courses.length === 0
      ? []
      : await db
          .select({
            courseId: CourseProductTable.courseId,
            imageUrl: ProductTable.imageUrl,
          })
          .from(CourseProductTable)
          .innerJoin(
            ProductTable,
            eq(ProductTable.id, CourseProductTable.productId),
          )
          .where(
            inArray(
              CourseProductTable.courseId,
              courses.map((course) => course.id),
            ),
          )
          .orderBy(ProductTable.name)
  const imageByCourseId = new Map<string, string>()
  for (const { courseId, imageUrl } of productImages) {
    if (!imageByCourseId.has(courseId)) imageByCourseId.set(courseId, imageUrl)
  }

  courses.forEach((course) => {
    cacheTag(
      getCourseIdTag(course.id),
      getCourseSectionCourseTag(course.id),
      getLessonCourseTag(course.id),
    )
  })

  return courses.map((course) => ({
    ...course,
    imageUrl: imageByCourseId.get(course.id) ?? null,
  }))
}
