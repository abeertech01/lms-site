import PageHeader from "@/components/PageHeader"
import { db } from "@/drizzle/db"
import { PurchaseTable } from "@/features/purchases/components/PurchaseTable"
import { getPurchaseGlobalTag } from "@/features/purchases/db/cache"
import { getUserGlobalTag } from "@/features/users/db/cache"
import { cacheTag } from "next/cache"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function PurchasesPage() {
  const purchases = await getPurchases()

  return (
    <div className="my-6 container">
      <PageHeader title="Sales" />

      <PurchaseTable purchases={purchases} />
    </div>
  )
}

async function getPurchases() {
  "use cache"
  cacheTag(getPurchaseGlobalTag(), getUserGlobalTag())

  return db.query.PurchaseTable.findMany({
    columns: {
      id: true,
      pricePaidInCents: true,
      refundedAt: true,
      productDetails: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    with: { user: { columns: { name: true } } },
  })
}
