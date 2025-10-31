"use server"

import { getUserCoupon } from "@/lib/userCountryHeader"
import { stripeServerClient } from "../stripeServer"
import { env } from "@/data/env/client"

export async function getClientSessionSecret(
  product: {
    priceInDollars: number
    name: string
    id: string
    imageUrl: string
    description: string
  },
  user: {
    email: string
    id: string
  }
) {
  const coupon = await getUserCoupon()
  const discounts = coupon ? [{ coupon: coupon.stripeCouponId }] : undefined

  const session = await stripeServerClient.checkout.sessions.create({
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [
              new URL(product.imageUrl, env.NEXT_PUBLIC_SERVER_URL).href,
            ],
            /* NOTE:
            new URL(product.imageUrl, env.NEXT_PUBLIC_SERVER_URL).href
            It creates a full absolute URL for the product image — even if product.imageUrl is a relative path.
            */
            description: product.description,
          },
          unit_amount: product.priceInDollars * 100,
        },
      },
    ],
    ui_mode: "embedded",
    mode: "payment",
    return_url: `${env.NEXT_PUBLIC_SERVER_URL}/api/webhooks/stripe?stripeSessionId={CHECKOUT_SESSION_ID}`,
    /** NOTE:
     * return_url is where we send a user after a successful purchase.
     * {CHECKOUT_SESSION_ID} - a special code for the checkout session id, sending along the url as stripeSessionId
     */
    customer_email: user.email,
    payment_intent_data: {
      receipt_email: user.email,
    },
    discounts,
    metadata: {
      productId: product.id,
      userId: user.id,
    },
  })

  if (session.client_secret == null) throw new Error("Client secret is null")

  return session.client_secret
}
