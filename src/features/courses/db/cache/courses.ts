import { getGlobalTag, getIdTag } from "@/lib/dataCache"
import { updateTag } from "next/cache"

export function getCourseGlobalTag() {
  return getGlobalTag("courses")
}

export function getCourseIdTag(id: string) {
  return getIdTag("courses", id)
}

// NOTE: only ever called from Server Actions (create/update/delete course),
// immediately followed by a redirect to a page reading these tags, so
// updateTag() (read-your-writes) is used instead of revalidateTag().
export function revalidateCourseCache(id: string) {
  updateTag(getCourseGlobalTag())
  updateTag(getCourseIdTag(id))
}
