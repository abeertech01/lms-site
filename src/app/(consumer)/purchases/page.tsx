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
import { Eyebrow } from "../_landing/Eyebrow"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

const sectionClass =
  "mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 w-full max-w-310"

export default async function PurchasePage() {
  await auth.protect()

  return (
    <>
      <section
        className={`${sectionClass} pt-18 max-[720px]:pt-10 animate-rise`}
      >
        <Eyebrow>Receipts</Eyebrow>
        <div className="flex flex-wrap justify-between items-end gap-8 mt-3.5">
          <h1 className="font-semibold text-[clamp(44px,6vw,80px)] leading-[0.95] tracking-[-0.045em] max-[720px]:text-[clamp(32px,11vw,48px)] max-[720px]:leading-[1.02] max-[380px]:text-[clamp(28px,10.5vw,36px)]">
            Purchase <span className="text-accent">history.</span>
          </h1>
          <p className="max-w-95 text-[18px] text-muted-foreground leading-[1.55]">
            Every order you&apos;ve made, in one place.
          </p>
        </div>
      </section>
      <section className={`${sectionClass} pt-12 pb-27.5`}>
        <Suspense fallback={<UserPurchaseTableSkeleton />}>
          <SuspenseBoundary />
        </Suspense>
      </section>
    </>
  )
}

async function SuspenseBoundary() {
  const { userId, redirectToSignIn } = await getCurrentUser()
  if (userId == null) return redirectToSignIn()

  const purchases = await getPurchases(userId)

  if (purchases.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3.5 px-8 py-9 border-[1.5px] border-line-strong border-dashed rounded-[28px] text-center animate-rise">
        <span className="place-items-center grid bg-[#eae6dc] rounded-full size-14 text-[22px] text-muted-foreground">
          $
        </span>
        <h2 className="font-semibold text-[clamp(28px,3.4vw,44px)] leading-[1.05] tracking-[-0.04em]">
          You have made no purchases yet.
        </h2>
        <p className="max-w-105 text-[17px] text-muted-foreground leading-[1.55]">
          Your orders and receipts will appear here after your first purchase.
        </p>
        <Link
          href="/all-products"
          className="bg-primary mt-1.5 px-7 py-3.5 rounded-full font-medium text-[15px] text-primary-foreground hover:text-white whitespace-nowrap transition-colors hover:bg-accent"
        >
          Browse products →
        </Link>
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
