import { SkeletonArray, SkeletonText } from "@/components/Skeleton"
import { formatDate, formatPrice } from "@/lib/formatters"
import Image from "next/image"
import Link from "next/link"

const rowClass =
  "gap-4 grid grid-cols-[minmax(0,1fr)_auto_auto] max-[720px]:grid-cols-[minmax(0,1fr)_auto] max-[720px]:gap-x-3 max-[720px]:gap-y-3.5 max-[720px]:p-4 md:grid-cols-[minmax(0,1fr)_110px_120px] items-center px-5 md:px-7"

export function UserPurchaseTable({
  purchases,
}: {
  purchases: {
    id: string
    pricePaidInCents: number
    createdAt: Date
    refundedAt: Date | null
    productDetails: {
      name: string
      imageUrl: string
    }
  }[]
}) {
  return (
    <div className="bg-card border rounded-[22px] overflow-hidden">
      <div
        className={`${rowClass} py-4 max-[720px]:hidden border-b font-mono text-[11px] text-ink-soft uppercase tracking-[0.06em]`}
      >
        <span>Product</span>
        <span>Amount</span>
        <span className="text-right">Actions</span>
      </div>
      <ul>
        {purchases.map((purchase) => (
          <li
            key={purchase.id}
            className={`${rowClass} py-3.5 border-b last:border-b-0`}
          >
            <div className="flex items-center gap-3.5 max-[720px]:col-span-2 min-w-0">
              <Image
                className="rounded-xl border size-13 object-cover shrink-0"
                src={purchase.productDetails.imageUrl}
                alt={purchase.productDetails.name}
                width={192}
                height={192}
              />
              <div className="max-[720px]:flex-1 min-w-0">
                <div className="font-semibold text-[15px] tracking-[-0.01em]">
                  {purchase.productDetails.name}
                </div>
                <div className="mt-0.75 text-[13px] text-ink-soft">
                  {formatDate(purchase.createdAt)}
                </div>
              </div>
            </div>
            <span className="font-medium text-[15px] max-[720px]:text-lg max-[720px]:font-semibold">
              {purchase.refundedAt ? (
                <span className="px-3 py-1 border border-line-strong rounded-full text-[13px] text-muted-foreground">
                  Refunded
                </span>
              ) : (
                formatPrice(purchase.pricePaidInCents / 100)
              )}
            </span>
            <div className="text-right max-[720px]:justify-self-end">
              <Link
                href={`/purchases/${purchase.id}`}
                className="inline-block max-[720px]:inline-flex max-[720px]:items-center max-[720px]:justify-center max-[720px]:min-h-11 px-4 py-1.75 border border-line-strong hover:border-foreground rounded-full font-medium text-[13px] hover:text-background transition-colors hover:bg-foreground"
              >
                Details
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function UserPurchaseTableSkeleton() {
  return (
    <div className="bg-card border rounded-[22px] overflow-hidden">
      <div
        className={`${rowClass} py-4 max-[720px]:hidden border-b font-mono text-[11px] text-ink-soft uppercase tracking-[0.06em]`}
      >
        <span>Product</span>
        <span>Amount</span>
        <span className="text-right">Actions</span>
      </div>
      <SkeletonArray amount={3}>
        <div className={`${rowClass} py-3.5 border-b last:border-b-0`}>
          <div className="flex items-center gap-3.5">
            <div className="bg-secondary rounded-xl size-13 animate-pulse shrink-0" />
            <div className="flex flex-col gap-1">
              <SkeletonText className="w-36" />
              <SkeletonText className="w-3/4" />
            </div>
          </div>
          <SkeletonText className="w-12" />
          <div className="bg-secondary rounded-full w-16 h-8 animate-pulse" />
        </div>
      </SkeletonArray>
    </div>
  )
}
