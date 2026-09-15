import ActionButton from "@/components/ActionButton"
import { SkeletonButton } from "@/components/Skeleton"
import { Button } from "@/components/ui/button"
import { db } from "@/drizzle/db"
import {
  CourseSectionTable,
  LessonStatus,
  LessonTable,
  UserLessonCompleteTable,
} from "@/drizzle/schema"
import { updateLessonCompleteStatus } from "@/features/lessons/actions/userLessonComplete"
import { YouTubeVideoPlayer } from "@/features/lessons/components/YouTubeVideoPlayer"
import { getLessonIdTag } from "@/features/lessons/db/cache/lessons"
import { getUserLessonCompleteIdTag } from "@/features/lessons/db/cache/userLessonComplete"
import {
  canViewLesson,
  wherePublicLessons,
} from "@/features/lessons/permissions/lessons"
import { canUpdateUserLessonCompleteStatus } from "@/features/lessons/permissions/userLessonComplete"
import { getCurrentUser } from "@/services/clerk"
import { and, asc, desc, eq, gt, lt } from "drizzle-orm"
import { CheckSquare2Icon, LockIcon, XSquareIcon } from "lucide-react"
import { cacheTag } from "next/cache"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ReactNode, Suspense } from "react"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
    lesson.id
  )

  return (
    // Mobile: title+description, then video, then buttons, each its own row.
    // Desktop: original layout — video, then a title/buttons row, then description.
    // Grid areas let each block render once and just get regrouped per breakpoint,
    // instead of duplicating the Previous/Next lookups (real DB queries) per viewport.
    <div
      className="my-4 grid items-start gap-4 [grid-template-areas:'title'_'description'_'video'_'buttons'] md:grid-cols-[1fr_auto] md:[grid-template-areas:'video_video'_'title_buttons'_'description_description']"
    >
      <h1 className="[grid-area:title] text-2xl font-semibold">
        {lesson.name}
      </h1>

      <div className="[grid-area:description]">
        {canView ? (
          lesson.description && <p>{lesson.description}</p>
        ) : (
          <p>This lesson is locked. Please purchase the course to view it.</p>
        )}
      </div>

      <div className="[grid-area:video] aspect-video">
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
          <div className="flex items-center justify-center bg-primary text-primary-foreground h-full w-full">
            <LockIcon className="size-16" />
          </div>
        )}
      </div>

      <div className="[grid-area:buttons] flex gap-2 flex-wrap">
        <Suspense fallback={<SkeletonButton />}>
          <ToLessonButton
            lesson={lesson}
            courseId={courseId}
            lessonFunc={getPreviousLesson}
          >
            Previous
          </ToLessonButton>
        </Suspense>
        {canUpdateCompletionStatus && (
          <ActionButton
            action={updateLessonCompleteStatus.bind(
              null,
              lesson.id,
              !isLessonComplete
            )}
            variant={"outline"}
          >
            <div className="flex gap-2 items-center">
              {isLessonComplete ? (
                <>
                  <CheckSquare2Icon /> Mark Incomplete
                </>
              ) : (
                <>
                  <XSquareIcon /> Mark Complete
                </>
              )}
            </div>
          </ActionButton>
        )}
        <Suspense fallback={<SkeletonButton />}>
          <ToLessonButton
            lesson={lesson}
            courseId={courseId}
            lessonFunc={getNextLesson}
          >
            Next
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
}) {
  const toLesson = await lessonFunc(lesson)
  if (toLesson == null) return null

  return (
    <Button variant={"outline"} asChild>
      <Link href={`/courses/${courseId}/lessons/${toLesson.id}`}>
        {children}
      </Link>
    </Button>
  )
}

async function getPreviousLesson(lesson: {
  id: string
  sectionId: string
  order: number
}) {
  let previousLesson = await db.query.LessonTable.findFirst({
    where: and(
      lt(LessonTable.order, lesson.order),
      eq(LessonTable.sectionId, lesson.sectionId),
      wherePublicLessons
    ),
    orderBy: desc(LessonTable.order),
    columns: { id: true },
  })

  if (previousLesson == null) {
    const section = await db.query.CourseSectionTable.findFirst({
      where: eq(CourseSectionTable.id, lesson.sectionId),
      columns: { order: true, courseId: true },
    })

    if (section == null) return

    const previousSection = await db.query.CourseSectionTable.findFirst({
      where: and(
        lt(CourseSectionTable.order, section.order),
        eq(CourseSectionTable.courseId, section.courseId)
      ),
      orderBy: desc(LessonTable.order),
      columns: { id: true },
    })

    if (previousSection == null) return

    previousLesson = await db.query.LessonTable.findFirst({
      where: and(
        eq(LessonTable.sectionId, previousSection.id),
        wherePublicLessons
      ),
      orderBy: desc(LessonTable.order),
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
    where: and(
      gt(LessonTable.order, lesson.order),
      eq(LessonTable.sectionId, lesson.sectionId),
      wherePublicLessons
    ),
    orderBy: asc(LessonTable.order),
    columns: { id: true },
  })

  if (nextLesson == null) {
    const section = await db.query.CourseSectionTable.findFirst({
      where: eq(CourseSectionTable.id, lesson.sectionId),
      columns: { order: true, courseId: true },
    })

    if (section == null) return

    const nextSection = await db.query.CourseSectionTable.findFirst({
      where: and(
        gt(CourseSectionTable.order, section.order),
        eq(CourseSectionTable.courseId, section.courseId)
      ),
      orderBy: asc(LessonTable.order),
      columns: { id: true },
    })

    if (nextSection == null) return

    nextLesson = await db.query.LessonTable.findFirst({
      where: and(eq(LessonTable.sectionId, nextSection.id), wherePublicLessons),
      orderBy: asc(LessonTable.order),
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
    where: and(eq(LessonTable.id, id), wherePublicLessons),
  })
}

async function getIsLessonComplete(userId: string, lessonId: string) {
  "use cache"
  cacheTag(getUserLessonCompleteIdTag({ userId, lessonId }))

  const data = await db.query.UserLessonCompleteTable.findFirst({
    where: and(
      eq(UserLessonCompleteTable.userId, userId),
      eq(UserLessonCompleteTable.lessonId, lessonId)
    ),
  })

  return data != null
}
