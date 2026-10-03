import { Button } from "@/components/ui/button"
import { DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db } from "@/drizzle/db"
import CourseForm from "@/features/courses/components/CourseForm"
import { getCourseIdTag } from "@/features/courses/db/cache/courses"
import SectionFormDialog from "@/features/courseSections/components/SectionFormDialog"
import { SortableSectionList } from "@/features/courseSections/components/SortableSectionList"
import { getCourseSectionCourseTag } from "@/features/courseSections/db/cache"
import LessonFormDialog from "@/features/lessons/components/LessonFormDialog"
import { SortableLessonList } from "@/features/lessons/components/SortableLessonList"
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons"
import { cn } from "@/lib/utils"
import { EyeClosed } from "lucide-react"
import { cacheTag } from "next/cache"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Eyebrow } from "../../../../(consumer)/_landing/Eyebrow"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const course = await getCourse(courseId)

  if (course == null) return notFound()

  const sections = course.courseSections.map((section) => ({
    ...section,
    lessonsCount: section.lessons.length,
  }))

  return (
    <div className="mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 pt-9 pb-27.5 w-full max-w-310">
      <div className="animate-rise">
        <Link
          href="/admin/courses"
          className="text-[13px] text-ink-soft hover:text-accent transition-colors"
        >
          ← Courses
        </Link>
        <Eyebrow className="mt-5.5">Edit course</Eyebrow>
        <h1 className="mt-3 font-semibold text-[clamp(40px,5.4vw,68px)] leading-[0.98] tracking-[-0.045em] max-[720px]:text-[clamp(32px,11vw,48px)] max-[720px]:leading-[1.02] max-[380px]:text-[clamp(28px,10.5vw,36px)]">
          {course.name}
        </h1>
      </div>
      <Tabs defaultValue="lessons" className="mt-7 gap-6">
        <TabsList>
          <TabsTrigger value="lessons" className="max-[720px]:min-h-11">
            Lessons
          </TabsTrigger>
          <TabsTrigger value="details" className="max-[720px]:min-h-11">
            Details
          </TabsTrigger>
        </TabsList>
        <TabsContent value="lessons" className="flex flex-col gap-5">
          <div className="bg-card px-7 pt-2 pb-3 max-[720px]:px-4 max-[720px]:pt-1 max-[720px]:pb-2 border rounded-[22px]">
            <div className="flex justify-between items-center gap-4 pt-4.5 pb-3.5 border-b">
              <h2 className="font-semibold text-lg tracking-[-0.02em]">
                Sections
              </h2>
              <SectionFormDialog courseId={course.id}>
                <DialogTrigger
                  render={
                    <Button
                      variant={"outline"}
                      size={"sm"}
                      className="max-[720px]:h-11"
                    >
                      + New section
                    </Button>
                  }
                />
              </SectionFormDialog>
            </div>
            <SortableSectionList courseId={course.id} sections={sections} />
          </div>
          {course.courseSections.map((section) => (
            <div
              key={section.id}
              className="bg-card px-7 pt-2 pb-3 max-[720px]:px-4 max-[720px]:pt-1 max-[720px]:pb-2 border rounded-[22px]"
            >
              <div className="flex justify-between items-center gap-4 pt-4.5 pb-3.5 border-b">
                <h2
                  className={cn(
                    "flex items-center gap-2 font-semibold text-lg tracking-[-0.02em]",
                    section.status === "private" && "text-muted-foreground",
                  )}
                >
                  {section.status === "private" && (
                    <EyeClosed className="size-4" />
                  )}
                  {section.name}
                </h2>
                <LessonFormDialog
                  defaultSectionId={section.id}
                  sections={course.courseSections}
                >
                  <DialogTrigger
                    render={
                      <Button
                        variant={"outline"}
                        size={"sm"}
                        className="max-[720px]:h-11"
                      >
                        + New lesson
                      </Button>
                    }
                  />
                </LessonFormDialog>
              </div>
              <SortableLessonList
                sections={course.courseSections}
                lessons={section.lessons}
              />
            </div>
          ))}
        </TabsContent>
        <TabsContent value="details">
          <div className="bg-card px-7.5 py-7.5 max-[720px]:px-4 max-[720px]:py-5 border rounded-[22px] max-w-190">
            <CourseForm course={course} />
          </div>
        </TabsContent>
      </Tabs>
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
    columns: { id: true, name: true, description: true },
    where: { id },
    with: {
      courseSections: {
        orderBy: { order: "asc" },
        columns: { id: true, status: true, name: true },
        with: {
          lessons: {
            orderBy: { order: "asc" },
            columns: {
              id: true,
              name: true,
              status: true,
              description: true,
              youtubeVideoId: true,
              sectionId: true,
            },
          },
        },
      },
    },
  })
}
