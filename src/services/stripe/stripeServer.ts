import { env } from "@/data/env/server"
import Stripe from "stripe"

// NOTE: this package's types only reflect its pinned API version — leaving
// apiVersion unset falls back to the Stripe account's dashboard-default
// version instead, which can silently drift out of sync with these types.
export const stripeServerClient = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: Stripe.API_VERSION,
  typescript: true,
})
