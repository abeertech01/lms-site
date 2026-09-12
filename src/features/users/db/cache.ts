import { getGlobalTag, getIdTag } from "@/lib/dataCache"
import { revalidateTag } from "next/cache"

export function getUserGlobalTag() {
  return getGlobalTag("users")
}

export function getUserIdTag(id: string) {
  return getIdTag("users", id)
}

// NOTE: called from the Clerk webhook route handler (and the manual
// syncUsers route), never from a Server Action, so updateTag()
// (Server Actions-only) can't be used here.
export function revalidateUserCache(id: string) {
  revalidateTag(getUserGlobalTag(), "max")
  revalidateTag(getUserIdTag(id), "max")
}
