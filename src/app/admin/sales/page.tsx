import { db } from "@/drizzle/db"
import { PurchaseTable } from "@/features/purchases/components/PurchaseTable"
import { getPurchaseGlobalTag } from "@/features/purchases/db/cache"
import { getUserGlobalTag } from "@/features/users/db/cache"
import { cacheTag } from "next/cache"
import { Eyebrow } from "../../(consumer)/_landing/Eyebrow"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function PurchasesPage() {
  const purchases = await getPurchases()

  return (
    <>
      <section className="mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 pt-14 max-[720px]:pt-8 w-full max-w-310 animate-rise">
        <Eyebrow>Admin</Eyebrow>
        <div className="flex flex-wrap justify-between items-end gap-8 mt-3.5">
          <h1 className="font-semibold text-[clamp(44px,6vw,80px)] leading-[0.95] tracking-[-0.045em] max-[720px]:text-[clamp(32px,11vw,48px)] max-[720px]:leading-[1.02] max-[380px]:text-[clamp(28px,10.5vw,36px)]">
            Sales<span className="text-accent">.</span>
          </h1>
          <p className="max-w-95 text-[18px] text-muted-foreground leading-[1.55]">
            Every purchase across your products.
          </p>
        </div>
      </section>
      <section className="mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 pt-10 pb-27.5 w-full max-w-310">
        <PurchaseTable purchases={purchases} />
      </section>
    </>
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
