import { getGlobalTag, getIdTag, getUserTag } from "@/lib/dataCache"
import { revalidateTag } from "next/cache"

export function getUserCourseAccessGlobalTag() {
  return getGlobalTag("userCourseAccess")
}

export function getUserCourseAccessIdTag({
  courseId,
  userId,
}: {
  courseId: string
  userId: string
}) {
  return getIdTag("userCourseAccess", `course:${courseId}-user:${userId}`)
}

export function getUserCourseAccessUserTag(userId: string) {
  return getUserTag("userCourseAccess", userId)
}

// NOTE: called from both the Stripe route handler and a Server Action, so
// updateTag() (Server Actions-only) can't be used here. `{ expire: 0 }`
// expires the data immediately (no stale-while-revalidate), so "My Courses"
// shows the new course right after checkout. `'max'` served stale data once.
export function revalidateUserCourseAccessCache({
  courseId,
  userId,
}: {
  courseId: string
  userId: string
}) {
  revalidateTag(getUserCourseAccessGlobalTag(), { expire: 0 })
  revalidateTag(getUserCourseAccessIdTag({ courseId, userId }), { expire: 0 })
  revalidateTag(getUserCourseAccessUserTag(userId), { expire: 0 })
}
