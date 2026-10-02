import { db } from "@/drizzle/db"
import CourseTable from "@/features/courses/components/CourseTable"
import { getCourseGlobalTag } from "@/features/courses/db/cache/courses"
import { cacheTag } from "next/cache"
import Link from "next/link"
import { Eyebrow } from "../../(consumer)/_landing/Eyebrow"
import {
  CourseSectionTable,
  CourseTable as DbCourseTable,
  LessonTable,
  UserCourseAccessTable,
} from "@/drizzle/schema"
import { asc, countDistinct, eq } from "drizzle-orm"
import { getUserCourseAccessGlobalTag } from "@/features/courses/db/cache/userCourseAccess"
import { getCourseSectionGlobalTag } from "@/features/courseSections/db/cache"
import { getLessonGlobalTag } from "@/features/lessons/db/cache/lessons"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function CoursesPage() {
  const courses = await getCourses()

  return (
    <>
      <section className="mx-auto px-6 pt-14 w-full max-w-310 animate-rise">
        <Eyebrow>Admin</Eyebrow>
        <div className="flex flex-wrap justify-between items-end gap-8 mt-3.5">
          <h1 className="font-semibold text-[clamp(44px,6vw,80px)] leading-[0.95] tracking-[-0.045em]">
            Courses<span className="text-accent">.</span>
          </h1>
          <Link
            href="/admin/courses/new"
            className="bg-primary px-6 py-3.5 rounded-full font-medium text-[15px] text-primary-foreground hover:text-white whitespace-nowrap transition-colors hover:bg-accent"
          >
            + New course
          </Link>
        </div>
      </section>
      <section className="mx-auto px-6 pt-10 pb-27.5 w-full max-w-310">
        <CourseTable courses={courses} />
      </section>
    </>
  )
}

async function getCourses() {
  "use cache"
  cacheTag(
    getCourseGlobalTag(),
    getUserCourseAccessGlobalTag(),
    getCourseSectionGlobalTag(),
    getLessonGlobalTag(),
  )

  return await db
    .select({
      id: DbCourseTable.id,
      name: DbCourseTable.name,
      sectionsCount: countDistinct(CourseSectionTable.id),
      lessonsCount: countDistinct(LessonTable.id),
      studentsCount: countDistinct(UserCourseAccessTable.userId),
    })
    .from(DbCourseTable)
    .leftJoin(
      CourseSectionTable,
      eq(CourseSectionTable.courseId, DbCourseTable.id),
    )
    .leftJoin(LessonTable, eq(LessonTable.sectionId, CourseSectionTable.id))
    .leftJoin(
      UserCourseAccessTable,
      eq(UserCourseAccessTable.courseId, DbCourseTable.id),
    )
    .orderBy(asc(DbCourseTable.name))
    .groupBy(DbCourseTable.id)
}
