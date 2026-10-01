import { getCourseTag, getGlobalTag, getIdTag } from "@/lib/dataCache"
import { updateTag } from "next/cache"

export function getCourseSectionGlobalTag() {
  return getGlobalTag("courseSections")
}

export function getCourseSectionIdTag(id: string) {
  return getIdTag("courseSections", id)
}

export function getCourseSectionCourseTag(courseId: string) {
  return getCourseTag("courseSections", courseId)
}

// NOTE: only ever called from Server Actions (create/update/delete/reorder
// section), immediately followed by a redirect/refresh reading these tags,
// so updateTag() (read-your-writes) is used instead of revalidateTag().
export function revalidateCourseSectionCache({
  id,
  courseId,
}: {
  id: string
  courseId: string
}) {
  updateTag(getCourseSectionGlobalTag())
  updateTag(getCourseSectionIdTag(id))
  updateTag(getCourseSectionCourseTag(courseId))
}
