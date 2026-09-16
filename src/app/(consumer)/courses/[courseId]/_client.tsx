"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { CheckCircle2Icon, CircleIcon } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export function CoursePageClient({
  course,
}: {
  course: {
    id: string
    name: string
    courseSections: {
      id: string
      name: string
      lessons: {
        id: string
        name: string
        isComplete: boolean
      }[]
    }[]
  }
}) {
  const { lessonId } = useParams()
  const defaultValue =
    typeof lessonId === "string"
      ? course.courseSections.find((section) =>
          section.lessons.find((lesson) => lesson.id === lessonId),
        )
      : course.courseSections[0]

  const lessons = course.courseSections.flatMap((section) => section.lessons)
  const completedCount = lessons.filter((lesson) => lesson.isComplete).length

  return (
    <div>
      <div className="font-semibold text-lg">{course.name}</div>
      {lessons.length > 0 && (
        <div className="mt-2">
          <div className="bg-violet-100 rounded-full w-full h-1.5 overflow-hidden">
            <div
              className="bg-violet-600 rounded-full h-full"
              style={{
                width: `${(completedCount / lessons.length) * 100}%`,
              }}
            />
          </div>
          <div className="mt-1.5 text-muted-foreground text-sm">
            {completedCount} of {lessons.length} lessons complete
          </div>
        </div>
      )}
      <Accordion
        type="multiple"
        defaultValue={defaultValue ? [defaultValue.id] : undefined}
      >
        {course.courseSections.map((section) => (
          <AccordionItem key={section.id} value={section.id}>
            <AccordionTrigger className="text-lg hover:no-underline">
              {section.name}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-1">
              {section.lessons.map((lesson) => {
                const isActive = lesson.id === lessonId
                return (
                  <Link
                    key={lesson.id}
                    href={`/courses/${course.id}/lessons/${lesson.id}`}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm",
                      isActive
                        ? "bg-violet-100 text-violet-700"
                        : "text-foreground hover:bg-accent/50",
                    )}
                  >
                    {lesson.isComplete ? (
                      <CheckCircle2Icon
                        className={cn(
                          "size-5 shrink-0",
                          isActive
                            ? "text-violet-600"
                            : "text-muted-foreground",
                        )}
                      />
                    ) : (
                      <CircleIcon
                        className={cn(
                          "size-5 shrink-0",
                          isActive
                            ? "text-violet-600"
                            : "text-muted-foreground",
                        )}
                      />
                    )}
                    {lesson.name}
                  </Link>
                )
              })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
