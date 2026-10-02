import { db } from "@/drizzle/db"
import { getCourseIdTag } from "@/features/courses/db/cache/courses"
import { getCourseSectionCourseTag } from "@/features/courseSections/db/cache"
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons"
import { cacheTag } from "next/cache"
import Link from "next/link"
import { notFound } from "next/navigation"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const [course, firstLessonId] = await Promise.all([
    getCourse(courseId),
    getFirstLessonId(courseId),
  ])

  if (course == null) return notFound()

  return (
    <div className="animate-rise">
      <div className="font-mono text-accent text-xs uppercase tracking-[0.08em]">
        Course
      </div>
      <h1 className="mt-2.5 font-semibold text-[clamp(28px,3.4vw,44px)] leading-[1.05] tracking-[-0.04em] text-balance">
        {course.name}
      </h1>
      <p className="mt-5 max-w-170 text-[18px] text-muted-foreground leading-[1.55] text-pretty">
        {course.description}
      </p>
      {firstLessonId != null && (
        <Link
          href={`/courses/${courseId}/lessons/${firstLessonId}`}
          className="inline-flex items-center bg-primary mt-8 px-6.5 py-3.5 rounded-full font-medium text-[15px] text-primary-foreground hover:text-white whitespace-nowrap transition-colors hover:bg-accent"
        >
          Start course →
        </Link>
      )}
    </div>
  )
}

async function getCourse(id: string) {
  "use cache"
  cacheTag(getCourseIdTag(id))

  return db.query.CourseTable.findFirst({
    columns: { id: true, name: true, description: true },
    where: { id },
  })
}

// NOTE: the first lesson a learner can open, in the sidebar's order.
async function getFirstLessonId(courseId: string) {
  "use cache"
  cacheTag(getCourseSectionCourseTag(courseId), getLessonCourseTag(courseId))

  const sections = await db.query.CourseSectionTable.findMany({
    where: { courseId, status: "public" },
    orderBy: { order: "asc" },
    columns: { id: true },
    with: {
      lessons: {
        where: { status: { in: ["public", "preview"] } },
        orderBy: { order: "asc" },
        columns: { id: true },
        limit: 1,
      },
    },
  })

  return sections.find((section) => section.lessons.length > 0)?.lessons[0]?.id
}
