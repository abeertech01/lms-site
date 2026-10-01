import ActionButton from "@/components/ActionButton"
import { SkeletonButton } from "@/components/Skeleton"
import { Button } from "@/components/ui/button"
import { db } from "@/drizzle/db"
import { LessonStatus } from "@/drizzle/schema"
import { updateLessonCompleteStatus } from "@/features/lessons/actions/userLessonComplete"
import { YouTubeVideoPlayer } from "@/features/lessons/components/YouTubeVideoPlayer"
import { getLessonIdTag } from "@/features/lessons/db/cache/lessons"
import { getUserLessonCompleteIdTag } from "@/features/lessons/db/cache/userLessonComplete"
import { canViewLesson } from "@/features/lessons/permissions/lessons"
import { canUpdateUserLessonCompleteStatus } from "@/features/lessons/permissions/userLessonComplete"
import { getCurrentUser } from "@/services/clerk"
import { CheckCircle2Icon, CircleIcon, LockIcon } from "lucide-react"
import { cacheTag } from "next/cache"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ComponentProps, ReactNode, Suspense } from "react"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
  const lesson = await getLesson(lessonId)

  if (lesson == null) return notFound()

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SuspenseBoundary lesson={lesson} courseId={courseId} />
    </Suspense>
  )
}

function LoadingSkeleton() {
  return null
}

async function SuspenseBoundary({
  lesson,
  courseId,
}: {
  lesson: {
    id: string
    youtubeVideoId: string
    name: string
    description: string | null
    status: LessonStatus
    sectionId: string
    order: number
  }
  courseId: string
}) {
  const { userId, role } = await getCurrentUser()
  const isLessonComplete =
    userId == null ? false : await getIsLessonComplete(userId, lesson.id)
  const canView = await canViewLesson({ role, userId }, lesson)
  const canUpdateCompletionStatus = await canUpdateUserLessonCompleteStatus(
    { userId },
    lesson.id,
  )

  return (
    // Mobile: title, complete-toggle, description, video, nav — each its own row.
    // Desktop: video, then a title/complete-toggle row, then description, then nav.
    // Grid areas let each block render once and just get regrouped per breakpoint,
    // instead of duplicating the Previous/Next lookups (real DB queries) per viewport.
    <div className="items-start gap-4 grid md:grid-cols-[1fr_auto] my-4 [grid-template-areas:'title'_'complete'_'description'_'video'_'nav'] md:[grid-template-areas:'video_video'_'title_complete'_'description_description'_'nav_nav']">
      <h1 className="font-semibold text-2xl [grid-area:title]">
        {lesson.name}
      </h1>

      <div className="flex items-center self-center [grid-area:complete]">
        {canUpdateCompletionStatus && (
          <ActionButton
            action={updateLessonCompleteStatus.bind(
              null,
              lesson.id,
              !isLessonComplete,
            )}
            variant={"ghost"}
            className="group gap-2 hover:bg-violet-600 px-3 text-muted-foreground hover:text-white"
          >
            <span className="flex items-center gap-2">
              {isLessonComplete ? (
                <CheckCircle2Icon className="size-5 text-violet-600 group-hover:text-white" />
              ) : (
                <CircleIcon className="size-5 text-violet-600 group-hover:text-white" />
              )}
              {isLessonComplete ? "Completed" : "Mark as complete"}
            </span>
          </ActionButton>
        )}
      </div>

      <div className="[grid-area:description]">
        {canView ? (
          lesson.description && (
            <>
              <div className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                Description
              </div>
              <p>{lesson.description}</p>
            </>
          )
        ) : (
          <p>This lesson is locked. Please purchase the course to view it.</p>
        )}
      </div>

      <div className="rounded-lg aspect-video overflow-hidden [grid-area:video]">
        {canView ? (
          <YouTubeVideoPlayer
            videoId={lesson.youtubeVideoId}
            onFinishedVideo={
              !isLessonComplete && canUpdateCompletionStatus
                ? updateLessonCompleteStatus.bind(null, lesson.id, true)
                : undefined
            }
          />
        ) : (
          <div className="flex justify-center items-center bg-primary w-full h-full text-primary-foreground">
            <LockIcon className="size-16" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-2 [grid-area:nav]">
        <Suspense fallback={<SkeletonButton />}>
          <ToLessonButton
            lesson={lesson}
            courseId={courseId}
            lessonFunc={getPreviousLesson}
          >
            Previous
          </ToLessonButton>
        </Suspense>
        <Suspense fallback={<SkeletonButton />}>
          <ToLessonButton
            lesson={lesson}
            courseId={courseId}
            lessonFunc={getNextLesson}
            variant="default"
            className="bg-violet-600 hover:bg-violet-600/90"
          >
            Next lesson
          </ToLessonButton>
        </Suspense>
      </div>
    </div>
  )
}

async function ToLessonButton({
  children,
  courseId,
  lesson,
  lessonFunc,
  variant = "outline",
  className,
}: {
  children: ReactNode
  courseId: string
  lesson: {
    id: string
    sectionId: string
    order: number
  }
  lessonFunc: (lesson: {
    id: string
    sectionId: string
    order: number
  }) => Promise<{ id: string } | undefined>
  variant?: ComponentProps<typeof Button>["variant"]
  className?: string
}) {
  const toLesson = await lessonFunc(lesson)
  if (toLesson == null) return null

  return (
    <Button
      variant={variant}
      className={className}
      nativeButton={false}
      render={
        <Link href={`/courses/${courseId}/lessons/${toLesson.id}`}>
          {children}
        </Link>
      }
    />
  )
}

async function getPreviousLesson(lesson: {
  id: string
  sectionId: string
  order: number
}) {
  let previousLesson = await db.query.LessonTable.findFirst({
    where: {
      order: { lt: lesson.order },
      sectionId: lesson.sectionId,
      status: { in: ["public", "preview"] },
    },
    orderBy: { order: "desc" },
    columns: { id: true },
  })

  if (previousLesson == null) {
    const section = await db.query.CourseSectionTable.findFirst({
      where: { id: lesson.sectionId },
      columns: { order: true, courseId: true },
    })

    if (section == null) return

    const previousSection = await db.query.CourseSectionTable.findFirst({
      where: {
        order: { lt: section.order },
        courseId: section.courseId,
      },
      orderBy: { order: "desc" },
      columns: { id: true },
    })

    if (previousSection == null) return

    previousLesson = await db.query.LessonTable.findFirst({
      where: {
        sectionId: previousSection.id,
        status: { in: ["public", "preview"] },
      },
      orderBy: { order: "desc" },
      columns: { id: true },
    })
  }

  return previousLesson
}

async function getNextLesson(lesson: {
  id: string
  sectionId: string
  order: number
}) {
  let nextLesson = await db.query.LessonTable.findFirst({
    where: {
      order: { gt: lesson.order },
      sectionId: lesson.sectionId,
      status: { in: ["public", "preview"] },
    },
    orderBy: { order: "asc" },
    columns: { id: true },
  })

  if (nextLesson == null) {
    const section = await db.query.CourseSectionTable.findFirst({
      where: { id: lesson.sectionId },
      columns: { order: true, courseId: true },
    })

    if (section == null) return

    const nextSection = await db.query.CourseSectionTable.findFirst({
      where: {
        order: { gt: section.order },
        courseId: section.courseId,
      },
      orderBy: { order: "asc" },
      columns: { id: true },
    })

    if (nextSection == null) return

    nextLesson = await db.query.LessonTable.findFirst({
      where: {
        sectionId: nextSection.id,
        status: { in: ["public", "preview"] },
      },
      orderBy: { order: "asc" },
      columns: { id: true },
    })
  }

  return nextLesson
}

async function getLesson(id: string) {
  "use cache"
  cacheTag(getLessonIdTag(id))

  return db.query.LessonTable.findFirst({
    columns: {
      id: true,
      youtubeVideoId: true,
      name: true,
      description: true,
      status: true,
      sectionId: true,
      order: true,
    },
    where: { id, status: { in: ["public", "preview"] } },
  })
}

async function getIsLessonComplete(userId: string, lessonId: string) {
  "use cache"
  cacheTag(getUserLessonCompleteIdTag({ userId, lessonId }))

  const data = await db.query.UserLessonCompleteTable.findFirst({
    where: { userId, lessonId },
  })

  return data != null
}
