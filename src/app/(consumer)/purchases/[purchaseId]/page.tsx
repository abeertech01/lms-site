import { LoadingSpinner } from "@/components/LoadingSpinner"
import { db } from "@/drizzle/db"
import { getPurchaseIdTag } from "@/features/purchases/db/cache"
import { formatDate, formatPrice } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { getCurrentUser } from "@/services/clerk"
import { stripeServerClient } from "@/services/stripe/stripeServer"
import { cacheTag } from "next/cache"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import Stripe from "stripe"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function PurchasePage({
  params,
}: {
  params: Promise<{ purchaseId: string }>
}) {
  const { purchaseId } = await params

  return (
    <div className="mx-auto px-6 pt-10 pb-27.5 w-full max-w-310 animate-rise">
      <Suspense fallback={<LoadingSpinner className="mx-auto size-36" />}>
        <SuspenseBoundary purchaseId={purchaseId} />
      </Suspense>
    </div>
  )
}

async function SuspenseBoundary({ purchaseId }: { purchaseId: string }) {
  const { userId, redirectToSignIn, user } = await getCurrentUser({
    allData: true,
  })
  if (userId == null || user == null) return redirectToSignIn()

  const purchase = await getPurchase({ userId, id: purchaseId })

  if (purchase == null) return notFound()

  const { receiptUrl, pricingRows } = await getStripeDetails(
    purchase.stripeSessionId,
    purchase.pricePaidInCents,
    purchase.refundedAt != null,
  )

  // NOTE: like the design, the last word of the product name is highlighted ("AI/ML Engineering").
  const nameWords = purchase.productDetails.name.split(" ")
  const lastWord = nameWords.length > 1 ? nameWords.pop() : null

  return (
    <>
      <Link
        href="/purchases"
        className="text-[13px] text-ink-soft hover:text-accent transition-colors"
      >
        ← Purchase history
      </Link>
      <div className="flex flex-wrap justify-between items-center gap-6 mt-6">
        <h1 className="font-semibold text-[clamp(40px,5vw,68px)] leading-[0.98] tracking-[-0.045em]">
          {nameWords.join(" ")}
          {lastWord != null && (
            <>
              {" "}
              <span className="text-accent">{lastWord}</span>
            </>
          )}
        </h1>
        {receiptUrl && (
          <Link
            target="_blank"
            href={receiptUrl}
            className="px-5.5 py-2.75 border border-foreground rounded-full font-medium text-sm hover:text-background whitespace-nowrap transition-colors hover:bg-foreground"
          >
            View receipt ↗
          </Link>
        )}
      </div>

      <div className="bg-card mt-11 border rounded-3xl max-w-230 overflow-hidden">
        <div className="flex flex-wrap justify-between items-center gap-4 px-9 py-7 border-b">
          <div className="min-w-0">
            <div className="font-semibold text-[22px] tracking-[-0.02em]">
              Receipt
            </div>
            <div className="mt-1.5 font-mono text-ink-soft text-xs break-all">
              ID: {purchaseId}
            </div>
          </div>
          <span
            className={cn(
              "px-4.5 py-2 rounded-full font-semibold text-sm",
              purchase.refundedAt
                ? "border border-line-strong text-muted-foreground"
                : "bg-lime",
            )}
          >
            {purchase.refundedAt ? "Refunded" : "Paid"}
          </span>
        </div>

        <dl className="gap-x-10 gap-y-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] px-9 py-8 border-b">
          <ReceiptField label="Date" value={formatDate(purchase.createdAt)} />
          <ReceiptField label="Product" value={purchase.productDetails.name} />
          <ReceiptField label="Customer" value={user.name} />
          <ReceiptField label="Seller" value="Triple A" />
        </dl>

        <div className="flex flex-col gap-4.5 px-9 py-7">
          {pricingRows.map(({ label, amountInDollars, isBold }) => {
            const isRefund = label === "Refund"
            const isDiscount = !isBold && !isRefund && amountInDollars < 0

            return isBold ? (
              <div
                key={label}
                className="flex justify-between items-baseline gap-4 pt-5 border-foreground border-t"
              >
                <span className="font-semibold text-[19px]">{label}</span>
                <span className="font-semibold text-4xl tracking-[-0.03em]">
                  {formatPrice(amountInDollars, { showZeroAsNumber: true })}
                </span>
              </div>
            ) : (
              <div
                key={label}
                className={cn(
                  "flex justify-between gap-4 text-[17px]",
                  isDiscount && "text-accent",
                  isRefund && "text-destructive",
                )}
              >
                <span>{label}</span>
                <span>
                  {formatPrice(amountInDollars, { showZeroAsNumber: true })}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

function ReceiptField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[11px] text-ink-soft uppercase tracking-[0.08em]">
        {label}
      </dt>
      <dd className="mt-2 font-medium text-[18px]">{value}</dd>
    </div>
  )
}

async function getPurchase({ userId, id }: { userId: string; id: string }) {
  "use cache"
  cacheTag(getPurchaseIdTag(id))

  return db.query.PurchaseTable.findFirst({
    columns: {
      pricePaidInCents: true,
      refundedAt: true,
      productDetails: true,
      createdAt: true,
      stripeSessionId: true,
    },
    where: { id, userId },
  })
}

async function getStripeDetails(
  stripeSessionId: string,
  pricePaidInCents: number,
  isRefunded: boolean,
) {
  const { payment_intent, total_details, amount_total, amount_subtotal } =
    await stripeServerClient.checkout.sessions.retrieve(stripeSessionId, {
      expand: [
        "payment_intent.latest_charge",
        "total_details.breakdown.discounts",
      ],
    })

  const refundAmount =
    typeof payment_intent !== "string" &&
    typeof payment_intent?.latest_charge !== "string"
      ? payment_intent?.latest_charge?.amount_refunded
      : isRefunded
        ? pricePaidInCents
        : undefined
  /** NOTE: refundAmount
   * the first check is to see whether a refund amount is already set.
   * if the refund amount is set, that is refundAmount. If it's not set, then we need to see if isRefunded is true.
   * if isRefunded is true, it will be pricePaidInCents. Otherwise, there will be no refund amount, it will be undefined.
   */

  return {
    receiptUrl: getReceiptUrl(payment_intent),
    pricingRows: getPricingRows(total_details, {
      total: (amount_total ?? pricePaidInCents) - (refundAmount ?? 0),
      subtotal: amount_subtotal ?? pricePaidInCents,
      refund: refundAmount,
    }),
  }
}

function getReceiptUrl(paymentIntent: Stripe.PaymentIntent | string | null) {
  if (
    typeof paymentIntent === "string" ||
    typeof paymentIntent?.latest_charge === "string"
  )
    return

  return paymentIntent?.latest_charge?.receipt_url
}

function getPricingRows(
  totalDetails: Stripe.Checkout.Session.TotalDetails | null,
  {
    total,
    subtotal,
    refund,
  }: { total: number; subtotal: number; refund?: number },
) {
  /** NOTE:
   * Essentially what this function does is it gets all the details related to pricing like what is the price amount, refund amount, coupon label, percentage etc. Basically all the things related to pricing.
   */
  const pricingRows: {
    label: string
    amountInDollars: number
    isBold?: boolean
  }[] = []

  if (totalDetails?.breakdown != null) {
    totalDetails.breakdown.discounts.forEach((discount) => {
      const coupon = discount.discount.source.coupon
      if (coupon == null || typeof coupon === "string") return

      pricingRows.push({
        label: `${coupon.name} (${coupon.percent_off}% off)`,
        amountInDollars: discount.amount / -100,
      })
    })
  }

  if (refund) {
    pricingRows.push({
      label: "Refund",
      amountInDollars: refund / -100,
    })
  }

  if (pricingRows.length === 0) {
    return [{ label: "Total", amountInDollars: total / 100, isBold: true }]
  }

  return [
    {
      label: "Subtotal",
      amountInDollars: subtotal / 100,
    },
    ...pricingRows,
    {
      label: "Total",
      amountInDollars: total / 100,
      isBold: true,
    },
  ]
}
