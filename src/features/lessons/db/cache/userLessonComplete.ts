import { getGlobalTag, getIdTag, getUserTag } from "@/lib/dataCache"
import { updateTag } from "next/cache"

export function getUserLessonCompleteGlobalTag() {
  return getGlobalTag("userLessonComplete")
}

export function getUserLessonCompleteIdTag({
  lessonId,
  userId,
}: {
  lessonId: string
  userId: string
}) {
  return getIdTag("userLessonComplete", `lesson:${lessonId}-user:${userId}`)
}

export function getUserLessonCompleteUserTag(userId: string) {
  return getUserTag("userLessonComplete", userId)
}

// NOTE: only ever called from the updateLessonCompleteStatus Server Action,
// where the UI needs to reflect the change immediately, so updateTag()
// (read-your-writes) is used instead of revalidateTag().
export function revalidateUserLessonCompleteCache({
  lessonId,
  userId,
}: {
  lessonId: string
  userId: string
}) {
  updateTag(getUserLessonCompleteGlobalTag())
  updateTag(getUserLessonCompleteIdTag({ lessonId, userId }))
  updateTag(getUserLessonCompleteUserTag(userId))
}
