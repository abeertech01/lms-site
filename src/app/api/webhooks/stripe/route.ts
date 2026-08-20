import { env } from "@/data/env/server"
import { db } from "@/drizzle/db"
import { ProductTable, UserTable } from "@/drizzle/schema"
import { addUserCourseAccess } from "@/features/courses/db/userCourseAccess"
import { insertPurchase } from "@/features/purchases/db/purchases"
import { stripeServerClient } from "@/services/stripe/stripeServer"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

/** NOTE: 
 * Essentially what do GET and POST do?
 * GET —
 * When user completes payment on Stripe's checkout page, Stripe redirects user back to the site. This is when GET handler is triggered.
 There it retrieves the checkout session from Stripe,
Processes the purchase (grants course access, records purchase). Then Redirects user to success or failure page
 * 
 * POST —
 * Stripe sends a webhook event to your server (independent of the user's browser)
 Verifies the webhook signature (security) and processes the same checkout session. Then returns a 200 status to Stripe to acknowledge receipt
 */
export async function GET(request: NextRequest) {
  const stripeSessionId = request.nextUrl.searchParams.get("stripeSessionId") // NOTE: we get it when return_url gets hit.
  if (stripeSessionId == null) redirect("/products/purchase-failure")

  let redirectUrl: string
  try {
    const checkoutSession = await stripeServerClient.checkout.sessions.retrieve(
      stripeSessionId,
      { expand: ["line_items"] }
    )
    const productId = await processStripeCheckout(checkoutSession)

    redirectUrl = `/products/${productId}/purchase/success`
  } catch {
    redirectUrl = "/products/purchase-failure"
  }

  return NextResponse.redirect(new URL(redirectUrl, request.url))
  /** NOTE:
   * redirect() from next/navigation only works in Server Components and Server Actions.
   * It cannot be used inside an API Route or Route Handler (like your GET function).
   That’s because redirect() throws a special internal error  handled only by the App Router —
   but route handlers return NextResponse objects, not  components.
   * Why new URL(redirectUrl, request.url) instead of just the string?
   It ensures the redirect target is an absolute URL (as NextResponse.redirect() requires a full URL — not a relative one).
   */
}

export async function POST(request: NextRequest) {
  const event = await stripeServerClient.webhooks.constructEvent(
    await request.text(),
    request.headers.get("stripe-signature") as string,
    env.STRIPE_WEBHOOK_SECRET
  )

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      try {
        await processStripeCheckout(event.data.object)
      } catch {
        return new Response(null, { status: 500 })
      }
    }
  }

  return new Response(null, { status: 200 })
}

async function processStripeCheckout(checkoutSession: Stripe.Checkout.Session) {
  const userId = checkoutSession.metadata?.userId
  const productId = checkoutSession.metadata?.productId

  if (userId == null || productId == null) {
    throw new Error("Missing metadata")
  }

  const [product, user] = await Promise.all([
    getProduct(productId),
    await getUser(userId),
  ])

  if (product == null) throw new Error("Product not found")
  if (user == null) throw new Error("User not found")

  const courseIds = product.courseProducts.map((cp) => cp.courseId)
  await db.transaction(async (trx) => {
    try {
      await addUserCourseAccess({ userId: user.id, courseIds }, trx) // NOTE: adds courses the user has access to
      await insertPurchase(
        {
          stripeSessionId: checkoutSession.id,
          pricePaidInCents:
            checkoutSession.amount_total || product.priceInDollars * 100,
          productDetails: product,
          userId: user.id,
          productId,
        },
        trx
      ) // NOTE: inserts purchase data in the database.
    } catch (error) {
      trx.rollback()
      throw error
    }
  })

  return productId
}

function getProduct(id: string) {
  return db.query.ProductTable.findFirst({
    columns: {
      id: true,
      priceInDollars: true,
      name: true,
      description: true,
      imageUrl: true,
    },
    where: eq(ProductTable.id, id),
    with: {
      courseProducts: { columns: { courseId: true } },
    },
  })
}

function getUser(id: string) {
  return db.query.UserTable.findFirst({
    columns: { id: true },
    where: eq(UserTable.id, id),
  })
}
