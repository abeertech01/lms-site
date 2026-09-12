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

// NOTE: called from both the Stripe webhook route handler and a Server
// Action, so updateTag() (Server Actions-only) can't be used here. `'max'`
// gives the longest stale-while-revalidate window; if the purchase/"My
// Courses" pages show stale data right after checkout, that's the tradeoff
// to revisit (see NEXTJS_16_UPGRADE_PLAN.md, Phase 5).
export function revalidatePurchaseCache({
  id,
  userId,
}: {
  id: string
  userId: string
}) {
  revalidateTag(getPurchaseGlobalTag(), "max")
  revalidateTag(getPurchaseIdTag(id), "max")
  revalidateTag(getPurchaseUserTag(userId), "max")
}
