import ActionButton from "@/components/ActionButton"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatPlural } from "@/lib/formatters"
import { Trash2Icon } from "lucide-react"
import Link from "next/link"
import { deleteCourse } from "../actions/courses"

/* eslint-disable @typescript-eslint/no-explicit-any */
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            {formatPlural(courses.length, {
              singular: "course",
              plural: "courses",
            })}
          </TableHead>
          <TableHead>Students</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={course.id}>
            <TableCell>
              <div className="flex flex-col gap-1">
                <div className="font-semibold">{course.name}</div>
                <div className="text-muted-foreground">
                  {formatPlural(course.sectionsCount, {
                    singular: "section",
                    plural: "sections",
                  })}{" "}
                  •
                  {formatPlural(course.lessonsCount, {
                    singular: "lesson",
                    plural: "lessons",
                  })}
                </div>
              </div>
            </TableCell>
            <TableCell>{course.studentsCount}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href={`/admin/courses/${course.id}/edit`}>Edit</Link>
                </Button>
                {/** action={deleteCourse.bind(null, course.id)}
                 * Each button gets its own pre-configured delete function.
                 *
                 * why couldn't we do onClick={deleteCourse(course.id)} or onClick={() => deleteCourse(course.id)} ?
                 * explained in the bottom of the component
                 */}
                <ActionButton
                  variant={"destructiveOutline"}
                  requireAreYouSure
                  action={deleteCourse.bind(null, course.id)}
                >
                  <Trash2Icon />
                  <span className="sr-only">Delete</span>
                </ActionButton>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/*
 * ❌ action={deleteCourse(course.id)}
 * This calls deleteCourse immediately during render.
 * React expects a function reference for onClick, not the result of calling a function.
 *
 * ✅ onClick={() => deleteCourse(course.id)}
 * This creates a new function that, when clicked, will call deleteCourse(course.id).
 * Works perfectly fine.
 */
