import { Button } from "@/components/ui/button"
import Link from "next/link"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function ProductPurchaseFailurePage() {
  return (
    <div className="my-6 container">
      <div className="flex flex-col items-start gap-4">
        <div className="font-semibold text-3xl">Purchase Failed</div>
        <div className="text-xl">
          There was a problem purchasing your product.
        </div>
        <Button
          className="px-8 py-4 rounded-lg h-auto text-xl"
          render={<Link href={"/"}>Try again</Link>}
        />
      </div>
    </div>
  )
}
