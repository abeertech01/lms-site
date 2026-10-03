import { db } from "@/drizzle/db"
import { auth } from "@clerk/nextjs/server"
import { getCourseIdTag } from "@/features/courses/db/cache/courses"
import { getCourseSectionCourseTag } from "@/features/courseSections/db/cache"
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons"
import { getCurrentUser } from "@/services/clerk"
import { cacheTag } from "next/cache"
import { notFound } from "next/navigation"
import { ReactNode, Suspense } from "react"
import { CoursePageClient } from "./_client"
import { getUserLessonCompleteUserTag } from "@/features/lessons/db/cache/userLessonComplete"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function CoursePageLayout({
  params,
  children,
}: {
  params: Promise<{ courseId: string }>
  children: ReactNode
}) {
  await auth.protect()

  const { courseId } = await params
  const course = await getCourse(courseId)

  if (course == null) return notFound()

  return (
    <div className="items-start gap-8 grid grid-cols-1 md:grid-cols-[300px_1fr] mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 pt-8 pb-12 max-w-310 max-[720px]:gap-5 max-[720px]:pt-5">
      <aside className="md:top-21 md:sticky bg-card p-5 max-[720px]:p-4 max-[720px]:order-2 border rounded-[22px] min-w-0">
        <Suspense
          fallback={<CoursePageClient course={mapCourse(course, [])} />}
        >
          <SuspenseBoundary course={course} />
        </Suspense>
      </aside>
      <div className="min-w-0 max-[720px]:order-1">{children}</div>
    </div>
  )
}

async function getCourse(id: string) {
  "use cache"
  cacheTag(
    getCourseIdTag(id),
    getCourseSectionCourseTag(id),
    getLessonCourseTag(id),
  )

  return db.query.CourseTable.findFirst({
    where: { id },
    columns: { id: true, name: true },
    with: {
      courseSections: {
        orderBy: { order: "asc" },
        where: { status: "public" },
        columns: { id: true, name: true },
        with: {
          lessons: {
            orderBy: { order: "asc" },
            where: { status: { in: ["public", "preview"] } },
            columns: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  })
}

async function SuspenseBoundary({
  course,
}: {
  course: {
    name: string
    id: string
    courseSections: {
      name: string
      id: string
      lessons: {
        name: string
        id: string
      }[]
    }[]
  }
}) {
  const { userId } = await getCurrentUser()
  const completedLessonIds =
    userId == null ? [] : await getCompletedLessonIds(userId)

  return <CoursePageClient course={mapCourse(course, completedLessonIds)} />
}

async function getCompletedLessonIds(userId: string) {
  "use cache"
  cacheTag(getUserLessonCompleteUserTag(userId))

  const data = await db.query.UserLessonCompleteTable.findMany({
    columns: { lessonId: true },
    where: {
      userId,
    },
  })

  return data.map((d) => d.lessonId)
}

function mapCourse(
  course: {
    name: string
    id: string
    courseSections: {
      name: string
      id: string
      lessons: {
        name: string
        id: string
      }[]
    }[]
  },
  completedLessonIds: string[],
) {
  return {
    ...course,
    courseSections: course.courseSections.map((section) => {
      return {
        ...section,
        lessons: section.lessons.map((lesson) => {
          return {
            ...lesson,
            isComplete: completedLessonIds.includes(lesson.id),
          }
        }),
      }
    }),
  }
}
