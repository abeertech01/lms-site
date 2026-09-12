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

// NOTE: called from both the Stripe webhook route handler and a Server
// Action, so updateTag() (Server Actions-only) can't be used here. `'max'`
// gives the longest stale-while-revalidate window; if "My Courses" shows
// stale access right after checkout, that's the tradeoff to revisit
// (see NEXTJS_16_UPGRADE_PLAN.md, Phase 5).
export function revalidateUserCourseAccessCache({
  courseId,
  userId,
}: {
  courseId: string
  userId: string
}) {
  revalidateTag(getUserCourseAccessGlobalTag(), "max")
  revalidateTag(getUserCourseAccessIdTag({ courseId, userId }), "max")
  revalidateTag(getUserCourseAccessUserTag(userId), "max")
}
