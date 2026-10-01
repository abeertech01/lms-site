import { getGlobalTag, getIdTag } from "@/lib/dataCache"
import { updateTag } from "next/cache"

export function getProductGlobalTag() {
  return getGlobalTag("products")
}

export function getProductIdTag(id: string) {
  return getIdTag("products", id)
}

// NOTE: only ever called from Server Actions (create/update/delete product),
// immediately followed by a redirect to a page reading these tags, so
// updateTag() (read-your-writes) is used instead of revalidateTag().
export function revalidateProductCache(id: string) {
  updateTag(getProductGlobalTag())
  updateTag(getProductIdTag(id))
}
