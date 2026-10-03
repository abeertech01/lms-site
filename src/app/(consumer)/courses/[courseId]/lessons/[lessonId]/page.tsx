import ActionButton from "@/components/ActionButton"
import { db } from "@/drizzle/db"
import { LessonStatus } from "@/drizzle/schema"
import { updateLessonCompleteStatus } from "@/features/lessons/actions/userLessonComplete"
import { YouTubeVideoPlayer } from "@/features/lessons/components/YouTubeVideoPlayer"
import { getCourseSectionCourseTag } from "@/features/courseSections/db/cache"
import {
  getLessonCourseTag,
  getLessonIdTag,
} from "@/features/lessons/db/cache/lessons"
import { getUserLessonCompleteIdTag } from "@/features/lessons/db/cache/userLessonComplete"
import { canViewLesson } from "@/features/lessons/permissions/lessons"
import { canUpdateUserLessonCompleteStatus } from "@/features/lessons/permissions/userLessonComplete"
import { getCurrentUser } from "@/services/clerk"
import { SkeletonText } from "@/components/Skeleton"
import { LockIcon } from "lucide-react"
import { cacheTag } from "next/cache"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ReactNode, Suspense } from "react"
import { cn } from "@/lib/utils"

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
  return (
    <div className="flex flex-col gap-7">
      <div className="bg-secondary rounded-3xl aspect-video animate-pulse" />
      <div className="flex flex-col gap-3">
        <SkeletonText className="w-1/4" />
        <SkeletonText className="w-3/4" />
      </div>
      <SkeletonText rows={2} className="w-full" />
    </div>
  )
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
  const position = await getLessonPosition(courseId, lesson.id)

  return (
    // Mobile: title, complete-toggle, description, video, nav — each its own row.
    // Desktop: video, then a title/complete-toggle row, then description, then nav.
    // Grid areas let each block render once and just get regrouped per breakpoint,
    // instead of duplicating the Previous/Next lookups (real DB queries) per viewport.
    <div className="items-start gap-7 grid md:grid-cols-[1fr_auto] [grid-template-areas:'video'_'title'_'complete'_'description'_'nav'] md:[grid-template-areas:'video_video'_'title_complete'_'description_description'_'nav_nav']">
      <div className="min-w-0 [grid-area:title]">
        {position != null && (
          <div className="font-mono text-accent text-xs uppercase tracking-[0.08em]">
            {position.sectionName} · Lesson {position.number}
          </div>
        )}
        <h1 className="mt-2.5 font-semibold text-[clamp(28px,3.4vw,44px)] leading-[1.05] tracking-[-0.04em] text-balance max-[720px]:text-[clamp(20px,6vw,26px)] max-[720px]:leading-[1.2] max-[720px]:tracking-[-0.025em]">
          {lesson.name}
        </h1>
      </div>

      <div className="flex items-center self-center [grid-area:complete]">
        {canUpdateCompletionStatus && (
          <ActionButton
            action={updateLessonCompleteStatus.bind(
              null,
              lesson.id,
              !isLessonComplete,
            )}
            variant="ghost"
            className={cn(
              "px-5 py-2.75 max-[720px]:min-h-11 rounded-full h-auto font-medium text-sm whitespace-nowrap",
              isLessonComplete
                ? "bg-lime text-foreground hover:bg-lime/80"
                : "border border-foreground hover:bg-foreground hover:text-background",
            )}
          >
            {isLessonComplete ? "✓ Completed" : "Mark as complete"}
          </ActionButton>
        )}
      </div>

      <div className="pt-6 border-t [grid-area:description]">
        {canView ? (
          lesson.description && (
            <>
              <div className="font-mono text-ink-soft text-xs uppercase tracking-[0.08em]">
                Description
              </div>
              <p className="mt-3 max-w-170 text-[18px] text-muted-foreground leading-[1.55] text-pretty">
                {lesson.description}
              </p>
            </>
          )
        ) : (
          <p className="text-[18px] text-muted-foreground">
            This lesson is locked. Please purchase the course to view it.
          </p>
        )}
      </div>

      <div className="bg-foreground rounded-3xl max-[720px]:rounded-2xl aspect-video overflow-hidden [grid-area:video]">
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
          <div className="place-items-center grid bg-[repeating-linear-gradient(135deg,#1D1A14_0_14px,#17150F_14px_28px)] w-full h-full">
            <span className="place-items-center grid bg-lime rounded-full size-21 text-foreground">
              <LockIcon className="size-8" />
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 [grid-area:nav] w-full">
        <Suspense fallback={<NavPill label="Previous" arrow="←" disabled />}>
          <ToLessonButton
            lesson={lesson}
            courseId={courseId}
            lessonFunc={getPreviousLesson}
            direction="previous"
          />
        </Suspense>
        <Suspense fallback={<NavPill label="Next lesson" arrow="→" disabled />}>
          <ToLessonButton
            lesson={lesson}
            courseId={courseId}
            lessonFunc={getNextLesson}
            direction="next"
          />
        </Suspense>
      </div>
    </div>
  )
}

// NOTE: when there is no previous/next lesson the pill stays visible but dimmed, like the design.
function NavPill({
  label,
  arrow,
  href,
  disabled = false,
}: {
  label: ReactNode
  arrow: "←" | "→"
  href?: string
  disabled?: boolean
}) {
  const isNext = arrow === "→"
  const className = cn(
    "inline-flex items-center max-[720px]:flex-[1_1_140px] max-[720px]:justify-center max-[720px]:min-h-11 rounded-full font-medium text-[15px] whitespace-nowrap transition-colors",
    isNext
      ? "bg-primary px-6.5 py-3.5 text-primary-foreground"
      : "border border-foreground px-6 py-3.25",
    disabled
      ? "opacity-35"
      : isNext
        ? "hover:bg-accent hover:text-white"
        : "hover:bg-foreground hover:text-background",
  )
  const content = isNext ? (
    <>
      {label} {arrow}
    </>
  ) : (
    <>
      {arrow} {label}
    </>
  )

  if (disabled || href == null) {
    return (
      <span aria-disabled="true" className={className}>
        {content}
      </span>
    )
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  )
}

async function ToLessonButton({
  courseId,
  lesson,
  lessonFunc,
  direction,
}: {
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
  direction: "previous" | "next"
}) {
  const toLesson = await lessonFunc(lesson)
  const label = direction === "next" ? "Next lesson" : "Previous"
  const arrow = direction === "next" ? "→" : "←"

  if (toLesson == null) {
    return <NavPill label={label} arrow={arrow} disabled />
  }

  return (
    <NavPill
      label={label}
      arrow={arrow}
      href={`/courses/${courseId}/lessons/${toLesson.id}`}
    />
  )
}

// NOTE: the section name and the lesson's number within the whole course, for the
// small label above the title ("DevOps Foundations · Lesson 2").
async function getLessonPosition(courseId: string, lessonId: string) {
  "use cache"
  cacheTag(getCourseSectionCourseTag(courseId), getLessonCourseTag(courseId))

  const sections = await db.query.CourseSectionTable.findMany({
    where: { courseId, status: "public" },
    orderBy: { order: "asc" },
    columns: { id: true, name: true },
    with: {
      lessons: {
        where: { status: { in: ["public", "preview"] } },
        orderBy: { order: "asc" },
        columns: { id: true },
      },
    },
  })

  let number = 0
  for (const section of sections) {
    for (const lesson of section.lessons) {
      number++
      if (lesson.id === lessonId) {
        return { sectionName: section.name, number }
      }
    }
  }

  return null
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
