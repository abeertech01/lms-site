import PageHeader from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { db } from "@/drizzle/db"
import {
  UserPurchaseTable,
  UserPurchaseTableSkeleton,
} from "@/features/purchases/components/UserPurchaseTable"
import { getPurchaseUserTag } from "@/features/purchases/db/cache"
import { getCurrentUser } from "@/services/clerk"
import { auth } from "@clerk/nextjs/server"
import { cacheTag } from "next/cache"
import Link from "next/link"
import { Suspense } from "react"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function PurchasePage() {
  await auth.protect()

  return (
    <div className="my-6 container">
      <PageHeader title="Purchase History" />
      <Suspense fallback={<UserPurchaseTableSkeleton />}>
        <SuspenseBoundary />
      </Suspense>
    </div>
  )
}

async function SuspenseBoundary() {
  const { userId, redirectToSignIn } = await getCurrentUser()
  if (userId == null) return redirectToSignIn()

  const purchases = await getPurchases(userId)

  if (purchases.length === 0) {
    return (
      <div className="flex flex-col items-start gap-2">
        You have made no purchases yet
        <Button
          size={"lg"}
          nativeButton={false}
          render={<Link href={"/"}>Browse Courses</Link>}
        />
      </div>
    )
  }

  return <UserPurchaseTable purchases={purchases} />
}

async function getPurchases(userId: string) {
  "use cache"
  cacheTag(getPurchaseUserTag(userId))

  return db.query.PurchaseTable.findMany({
    columns: {
      id: true,
      pricePaidInCents: true,
      refundedAt: true,
      productDetails: true,
      createdAt: true,
    },
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
}
