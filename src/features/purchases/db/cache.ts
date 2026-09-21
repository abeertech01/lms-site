import { getGlobalTag, getIdTag, getUserTag } from "@/lib/dataCache"
import { revalidateTag } from "next/cache"

export function getPurchaseGlobalTag() {
  return getGlobalTag("purchases")
}

export function getPurchaseIdTag(id: string) {
  return getIdTag("purchases", id)
}

export function getPurchaseUserTag(userId: string) {
  return getUserTag("purchases", userId)
}

// NOTE: called from both the Stripe route handler and a Server Action, so
// updateTag() (Server Actions-only) can't be used here. `{ expire: 0 }`
// expires the data immediately (no stale-while-revalidate), so the user
// lands on fresh data right after checkout. `'max'` served stale "My
// Courses" once after a purchase.
export function revalidatePurchaseCache({
  id,
  userId,
}: {
  id: string
  userId: string
}) {
  revalidateTag(getPurchaseGlobalTag(), { expire: 0 })
  revalidateTag(getPurchaseIdTag(id), { expire: 0 })
  revalidateTag(getPurchaseUserTag(userId), { expire: 0 })
}
