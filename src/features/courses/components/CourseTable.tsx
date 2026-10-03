import ActionButton from "@/components/ActionButton"
import { Button } from "@/components/ui/button"
import { formatPlural } from "@/lib/formatters"
import { Trash2Icon } from "lucide-react"
import Link from "next/link"
import { deleteCourse } from "../actions/courses"

const rowClass =
  "gap-4 grid grid-cols-[minmax(0,1fr)_auto_auto] max-[720px]:grid-cols-[minmax(0,1fr)_auto] max-[720px]:gap-x-3.5 max-[720px]:gap-y-3 max-[720px]:p-4 md:grid-cols-[minmax(0,1fr)_90px_180px] items-center px-5 md:px-7"

export default function CourseTable({
  courses,
}: {
  courses: {
    id: string
    name: string
    sectionsCount: number
    lessonsCount: number
    studentsCount: number
  }[]
}) {
  return (
    <div className="bg-card border rounded-[22px] overflow-hidden">
      <div
        className={`${rowClass} py-4 max-[720px]:hidden border-b font-mono text-[11px] text-ink-soft uppercase tracking-[0.06em]`}
      >
        <span>
          {formatPlural(courses.length, {
            singular: "course",
            plural: "courses",
          })}
        </span>
        <span>Students</span>
        <span className="text-right">Actions</span>
      </div>
      <ul>
        {courses.map((course) => (
          <li
            key={course.id}
            className={`${rowClass} py-3.5 border-b last:border-b-0`}
          >
            <div className="max-[720px]:col-span-2 min-w-0">
              <div className="font-semibold text-[15px] tracking-[-0.01em]">
                {course.name}
              </div>
              <div className="mt-0.75 text-[13px] text-ink-soft">
                {formatPlural(course.sectionsCount, {
                  singular: "section",
                  plural: "sections",
                })}{" "}
                ·{" "}
                {formatPlural(course.lessonsCount, {
                  singular: "lesson",
                  plural: "lessons",
                })}
              </div>
            </div>
            <span className="font-medium text-[15px] max-[720px]:text-sm max-[720px]:font-normal max-[720px]:text-muted-foreground">
              {course.studentsCount}
              <span className="hidden max-[720px]:inline">
                {course.studentsCount === 1 ? " student" : " students"}
              </span>
            </span>
            <div className="flex max-[720px]:flex-wrap justify-end items-center gap-2">
              <Button
                size="sm"
                className="max-[720px]:h-11"
                nativeButton={false}
                render={
                  <Link href={`/admin/courses/${course.id}/edit`}>Edit</Link>
                }
              />
              {/** NOTE:
               * action={deleteCourse.bind(null, course.id)}
               * Each button gets its own pre-configured delete function.
               *
               * why couldn't we do onClick={deleteCourse(course.id)} or onClick={() => deleteCourse(course.id)} ?
               * explained in the bottom of the component
               */}
              <ActionButton
                variant={"destructiveOutline"}
                size={"icon"}
                requireAreYouSure
                action={deleteCourse.bind(null, course.id)}
              >
                <Trash2Icon />
                <span className="sr-only">Delete</span>
              </ActionButton>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* NOTE:
 * ❌ action={deleteCourse(course.id)}
 * This calls deleteCourse immediately during render.
 * React expects a function reference for onClick, not the result of calling a function.
 *
 * ✅ onClick={() => deleteCourse(course.id)}
 * This creates a new function that, when clicked, will call deleteCourse(course.id).
 * Works perfectly fine.
 */
