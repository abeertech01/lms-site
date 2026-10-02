"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { ChevronUpIcon } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"

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
  const activeSection =
    typeof lessonId === "string"
      ? course.courseSections.find((section) =>
          section.lessons.find((lesson) => lesson.id === lessonId),
        )
      : course.courseSections[0]

  const [openSections, setOpenSections] = useState<string[]>(
    activeSection ? [activeSection.id] : [],
  )

  // NOTE: CoursePageClient stays mounted while navigating between lessons
  // (the layout wraps the lesson page), so the active section can change
  // without a remount — Accordion's defaultValue only applies on first
  // mount. Adjusting state during render (React's recommended pattern for
  // this, rather than useEffect+setState, which costs an extra render) keeps
  // the newly active section expanded on navigation without collapsing any
  // section the user opened manually.
  const [trackedSectionId, setTrackedSectionId] = useState(activeSection?.id)
  if (activeSection?.id !== trackedSectionId) {
    setTrackedSectionId(activeSection?.id)
    if (activeSection != null && !openSections.includes(activeSection.id)) {
      setOpenSections([...openSections, activeSection.id])
    }
  }

  const lessons = course.courseSections.flatMap((section) => section.lessons)
  const completedCount = lessons.filter((lesson) => lesson.isComplete).length

  return (
    <div>
      <Link
        href="/courses"
        className="text-[13px] text-ink-soft hover:text-accent transition-colors"
      >
        ← My courses
      </Link>
      <h2 className="mt-2.5 font-semibold text-[19px] tracking-[-0.02em]">
        {course.name}
      </h2>
      {lessons.length > 0 && (
        <div className="mt-4.5">
          <div className="bg-[#eae6dc] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-accent rounded-full h-full transition-[width] duration-300"
              style={{
                width: `${(completedCount / lessons.length) * 100}%`,
              }}
            />
          </div>
          <div className="mt-2.5 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.03em]">
            {completedCount} of {lessons.length} lessons complete
          </div>
        </div>
      )}
      <Accordion
        multiple
        value={openSections}
        onValueChange={setOpenSections}
        className="mt-4.5"
      >
        {course.courseSections.map((section) => (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="border-t not-last:border-b-0"
          >
            <AccordionPrimitive.Header className="flex">
              <AccordionPrimitive.Trigger className="group/trigger flex flex-1 justify-between items-center gap-3 py-3.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50 font-semibold text-sm text-left leading-[1.3] tracking-[-0.01em] cursor-pointer">
                {section.name}
                <ChevronUpIcon
                  aria-hidden="true"
                  className="size-4 text-muted-foreground transition-transform rotate-180 group-aria-expanded/trigger:rotate-0 shrink-0"
                />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionContent className="flex flex-col gap-1 pb-3.5 [&_a]:no-underline">
              {section.lessons.map((lesson) => {
                const isActive = lesson.id === lessonId
                return (
                  <Link
                    key={lesson.id}
                    href={`/courses/${course.id}/lessons/${lesson.id}`}
                    className={cn(
                      "flex items-center gap-3 px-2.5 py-2.25 rounded-[10px] text-[13.5px] leading-[1.3] transition-colors",
                      isActive
                        ? "bg-violet-soft font-medium text-accent"
                        : "hover:bg-secondary",
                    )}
                  >
                    <span
                      className={cn(
                        "place-items-center grid border-[1.5px] rounded-full size-4.5 font-bold text-[10px] text-foreground shrink-0",
                        lesson.isComplete
                          ? "border-foreground bg-lime"
                          : isActive
                            ? "border-accent"
                            : "border-[#b9b4a6]",
                      )}
                    >
                      {lesson.isComplete ? "✓" : ""}
                    </span>
                    <span>{lesson.name}</span>
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
