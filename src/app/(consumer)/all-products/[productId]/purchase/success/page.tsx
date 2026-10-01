import { Button } from "@/components/ui/button"
import { db } from "@/drizzle/db"
import { getProductIdTag } from "@/features/products/db/cache"
import { cacheTag } from "next/cache"
import Image from "next/image"
import Link from "next/link"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function ProductPurchaseSuccessPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const product = await getPublicProduct(productId)

  if (product == null) return

  return (
    <div className="my-6 container">
      <div className="flex justify-between items-center gap-16">
        <div className="flex flex-col items-start gap-4">
          <div className="font-semibold text-3xl">Purchase Successful</div>
          <div className="text-xl">
            Thank you for purchasing {product.name}.
          </div>
          <Button
            nativeButton={false}
            className="px-8 py-4 rounded-lg h-auto text-xl"
            render={<Link href={"/courses"}>View My Courses</Link>}
          />
        </div>
        <div className="relative max-w-lg aspect-video grow">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="rounded-xl object-contain"
          />
        </div>
      </div>
    </div>
  )
}

async function getPublicProduct(id: string) {
  "use cache"
  cacheTag(getProductIdTag(id))

  return db.query.ProductTable.findFirst({
    columns: {
      name: true,
      imageUrl: true,
    },
    where: { id, status: "public" },
  })
}
