import { getCourseTag, getGlobalTag, getIdTag } from "@/lib/dataCache"
import { updateTag } from "next/cache"

export function getLessonGlobalTag() {
  return getGlobalTag("lessons")
}

export function getLessonIdTag(id: string) {
  return getIdTag("lessons", id)
}

export function getLessonCourseTag(courseId: string) {
  return getCourseTag("lessons", courseId)
}

// NOTE: only ever called from Server Actions (create/update/delete/reorder
// lesson), immediately followed by a redirect/refresh reading these tags,
// so updateTag() (read-your-writes) is used instead of revalidateTag().
export function revalidateLessonCache({
  id,
  courseId,
}: {
  id: string
  courseId: string
}) {
  updateTag(getLessonGlobalTag())
  updateTag(getLessonIdTag(id))
  updateTag(getLessonCourseTag(courseId))
}
