import { env } from "@/data/env/server"
import { db, transaction } from "@/drizzle/db"
import { addUserCourseAccess } from "@/features/courses/db/userCourseAccess"
import { insertPurchase } from "@/features/purchases/db/purchases"
import { stripeServerClient } from "@/services/stripe/stripeServer"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

/** NOTE:
 * GET — Stripe's embedded checkout sends the user back here (return_url) after paying.
 * We process the session right away so the user lands on their courses without waiting for the webhook.
 *
 * POST — Stripe's event destination calls this independently of the user's browser.
 * It's the source of truth: it still runs if the user closes the tab before the redirect.
 *
 * Both paths are safe to run for the same session: stripeSessionId is unique and
 * course access inserts use onConflictDoNothing, so a second run is a no-op.
 */
export async function GET(request: NextRequest) {
  const stripeSessionId = request.nextUrl.searchParams.get("stripeSessionId") // NOTE: we get it when return_url gets hit.

  let redirectUrl = "/all-products/purchase-failure"
  if (stripeSessionId != null) {
    try {
      const checkoutSession =
        await stripeServerClient.checkout.sessions.retrieve(stripeSessionId)
      const productId = await processStripeCheckout(checkoutSession)
      if (productId != null) {
        redirectUrl = `/all-products/${productId}/purchase/success`
      }
    } catch (error) {
      console.error("Stripe return: failed to process checkout", error)
    }
  }

  // NOTE: redirect() from next/navigation is for Server Components/Actions; a Route Handler
  // returns a response instead, and NextResponse.redirect() needs an absolute URL.
  return NextResponse.redirect(new URL(redirectUrl, request.url))
}

/** NOTE:
 * Snapshot events: Stripe sends the full event (with the Checkout Session inside) to this URL.
 * constructEventAsync() verifies the signature, so a forged request is rejected with a 400.
 * We still re-fetch the session from Stripe instead of trusting event.data.object, because events
 * can arrive late or out of order — the fresh session has the current payment_status.
 */
export async function POST(request: NextRequest) {
  let event: Stripe.Event
  try {
    event = await stripeServerClient.webhooks.constructEventAsync(
      await request.text(), // NOTE: must be the raw body — the signature is computed over the exact bytes.
      request.headers.get("stripe-signature") ?? "",
      env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (error) {
    console.error("Stripe webhook: signature verification failed", error)
    return new Response(null, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      try {
        const checkoutSession =
          await stripeServerClient.checkout.sessions.retrieve(
            event.data.object.id,
          )
        await processStripeCheckout(checkoutSession)
      } catch (error) {
        // NOTE: a non-2xx makes Stripe retry the delivery later.
        console.error("Stripe webhook: failed to process checkout", error)
        return new Response(null, { status: 500 })
      }
    }
  }

  return new Response(null, { status: 200 })
}

/** NOTE:
 * Returns the productId once access is granted, or null when the session isn't paid yet.
 * checkout.session.completed also fires for delayed methods (e.g. bank debits) with
 * payment_status "unpaid" — those get access later on async_payment_succeeded.
 */
async function processStripeCheckout(checkoutSession: Stripe.Checkout.Session) {
  if (checkoutSession.payment_status === "unpaid") return null

  const userId = checkoutSession.metadata?.userId
  const productId = checkoutSession.metadata?.productId

  if (userId == null || productId == null) {
    throw new Error("Missing metadata")
  }

  const [product, user] = await Promise.all([
    getProduct(productId),
    getUser(userId),
  ])

  if (product == null) throw new Error("Product not found")
  if (user == null) throw new Error("User not found")

  const courseIds = product.courseProducts.map((cp) => cp.courseId)
  // NOTE: an error thrown inside transaction() rolls everything back, so access is never granted without a purchase row (or vice versa).
  await transaction(async (trx) => {
    await addUserCourseAccess({ userId: user.id, courseIds }, trx) // NOTE: adds courses the user has access to
    await insertPurchase(
      {
        stripeSessionId: checkoutSession.id,
        pricePaidInCents:
          checkoutSession.amount_total ?? product.priceInDollars * 100,
        productDetails: product,
        userId: user.id,
        productId,
      },
      trx,
    ) // NOTE: inserts purchase data in the database.
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
    where: { id },
    with: {
      courseProducts: { columns: { courseId: true } },
    },
  })
}

function getUser(id: string) {
  return db.query.UserTable.findFirst({
    columns: { id: true },
    where: { id },
  })
}
