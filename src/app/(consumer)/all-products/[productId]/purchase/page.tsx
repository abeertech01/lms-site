import { LoadingSpinner } from "@/components/LoadingSpinner"
import PageHeader from "@/components/PageHeader"
import { db } from "@/drizzle/db"
import { getProductIdTag } from "@/features/products/db/cache"
import {
  userHasAccessToProductCourses,
  userOwnsProduct,
} from "@/features/products/db/products"
import { getCurrentUser } from "@/services/clerk"
import { StripeCheckoutForm } from "@/services/stripe/components/StripeCheckoutForm"
import { SignIn, SignUp } from "@clerk/nextjs"
import { cacheTag } from "next/cache"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default function PurchasePage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>
  searchParams: Promise<{ authMode: string }>
}) {
  return (
    <Suspense fallback={<LoadingSpinner className="mx-auto my-6 size-36" />}>
      <SuspendedComponent params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function SuspendedComponent({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>
  searchParams: Promise<{ authMode: string }>
}) {
  const { productId } = await params
  const { user } = await getCurrentUser({ allData: true })
  const product = await getPublicProduct(productId)

  if (product == null) return notFound()

  if (user != null) {
    const alreadyHasAccess =
      (await userOwnsProduct({ userId: user.id, productId })) ||
      (await userHasAccessToProductCourses({ userId: user.id, productId }))

    if (alreadyHasAccess) {
      redirect("/courses")
    }

    return (
      <div className="my-6 container">
        <StripeCheckoutForm product={product} user={user} />
      </div>
    )
  }

  const { authMode } = await searchParams
  const isSignUp = authMode === "signUp"

  return (
    <div className="flex flex-col items-center my-6 container">
      <PageHeader title="You need an account to make a purchase" />
      {isSignUp ? (
        <SignUp
          routing="hash"
          signInUrl={`/all-products/${productId}/purchase?authMode=signIn`}
          forceRedirectUrl={`/all-products/${productId}/purchase`}
        />
      ) : (
        <SignIn
          routing="hash"
          signUpUrl={`/all-products/${productId}/purchase?authMode=signUp`}
          forceRedirectUrl={`/all-products/${productId}/purchase`}
        />
      )}
    </div>
  )
}

async function getPublicProduct(id: string) {
  "use cache"
  cacheTag(getProductIdTag(id))

  return db.query.ProductTable.findFirst({
    columns: {
      name: true,
      id: true,
      imageUrl: true,
      description: true,
      priceInDollars: true,
    },
    where: { id, status: "public" },
  })
}
