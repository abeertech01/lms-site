import { LoadingSpinner } from "@/components/LoadingSpinner"
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
import Link from "next/link"
import { Suspense } from "react"
import { Eyebrow } from "../../../_landing/Eyebrow"

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
      <section className="mx-auto px-6 pt-9 pb-27.5 w-full max-w-310">
        <Link
          href={`/all-products/${productId}`}
          className="text-[13px] text-ink-soft hover:text-accent transition-colors"
        >
          ← {product.name}
        </Link>
        <Eyebrow className="mt-5.5">Checkout</Eyebrow>
        <h1 className="mt-2.5 mb-8 font-semibold text-[clamp(32px,4vw,48px)] leading-none tracking-[-0.045em]">
          Complete your <span className="text-accent">purchase.</span>
        </h1>
        <StripeCheckoutForm product={product} user={user} />
      </section>
    )
  }

  const { authMode } = await searchParams
  const isSignUp = authMode === "signUp"

  return (
    <section className="flex flex-col items-center mx-auto px-6 pt-14 pb-27.5 w-full max-w-310">
      <Eyebrow>Checkout</Eyebrow>
      <h1 className="mt-3 mb-8 font-semibold text-[clamp(32px,4vw,48px)] leading-none tracking-[-0.045em] text-center text-balance">
        You need an <span className="text-accent">account</span> to make a
        purchase
      </h1>
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
    </section>
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
