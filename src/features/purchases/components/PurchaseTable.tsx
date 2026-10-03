import ActionButton from "@/components/ActionButton"
import { formatDate, formatPlural, formatPrice } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { refundPurchase } from "../actions/purchases"

const rowClass =
  "gap-4 grid grid-cols-[minmax(0,1fr)_auto] max-[720px]:gap-x-3.5 max-[720px]:gap-y-2.5 max-[720px]:p-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_90px_150px] items-center px-5 md:px-7"

export function PurchaseTable({
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
    user: {
      name: string
    }
  }[]
}) {
  return (
    <div className="bg-card border rounded-[22px] overflow-hidden">
      <div
        className={`${rowClass} py-4 max-[720px]:hidden border-b font-mono text-[11px] text-ink-soft uppercase tracking-[0.06em]`}
      >
        <span>
          {formatPlural(purchases.length, {
            singular: "sale",
            plural: "sales",
          })}
        </span>
        <span className="hidden md:block">Customer</span>
        <span className="hidden md:block">Amount</span>
        <span className="hidden md:block text-right">Actions</span>
      </div>
      <ul>
        {purchases.map((purchase) => {
          const isRefunded = purchase.refundedAt != null

          return (
            <li
              key={purchase.id}
              className={`${rowClass} py-3.5 border-b last:border-b-0`}
            >
              <div className="flex items-center gap-3.5 max-[720px]:col-span-full min-w-0">
                <Image
                  className="rounded-xl border size-13 object-cover shrink-0"
                  src={purchase.productDetails.imageUrl}
                  alt={purchase.productDetails.name}
                  width={192}
                  height={192}
                />
                <div className="min-w-0">
                  <div className="font-semibold text-[15px] tracking-[-0.01em]">
                    {purchase.productDetails.name}
                  </div>
                  <div className="mt-0.75 text-[13px] text-ink-soft">
                    {formatDate(purchase.createdAt)}
                    <span className="md:hidden max-[720px]:hidden">
                      {" "}
                      · {purchase.user.name}
                    </span>
                  </div>
                </div>
              </div>
              <span className="hidden md:block max-[720px]:block max-[720px]:text-muted-foreground max-[720px]:[overflow-wrap:anywhere] min-w-0 text-sm">
                {purchase.user.name}
              </span>
              <span
                className={cn(
                  "hidden md:block max-[720px]:block max-[720px]:justify-self-end max-[720px]:text-[17px] max-[720px]:font-semibold font-medium text-[15px]",
                  isRefunded && "line-through text-muted-foreground",
                )}
              >
                {formatPrice(purchase.pricePaidInCents / 100)}
              </span>
              <div className="flex max-[720px]:flex-wrap justify-end max-[720px]:justify-start max-[720px]:col-span-full">
                {isRefunded ? (
                  <span className="bg-secondary px-4 py-1.75 rounded-full font-medium text-[13px] text-muted-foreground">
                    Refunded
                  </span>
                ) : (
                  purchase.pricePaidInCents > 0 && (
                    <ActionButton
                      action={refundPurchase.bind(null, purchase.id)}
                      variant={"destructiveOutline"}
                      size={"sm"}
                      className="max-[720px]:h-11"
                      requireAreYouSure
                    >
                      Refund
                    </ActionButton>
                  )
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
