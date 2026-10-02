import { env } from "@/data/env/server"
import { deleteUser, insertUser, updateUser } from "@/features/users/db/users"
import { syncClerkUserMetadata } from "@/services/clerk"
import { verifyWebhook, type WebhookEvent } from "@clerk/nextjs/webhooks"
import { NextRequest } from "next/server"

/** NOTE:
 * Clerk calls this whenever a user is created, updated or deleted, so our UserTable stays in sync with Clerk.
 *
 * verifyWebhook() reads the svix-id / svix-timestamp / svix-signature headers and checks the signature
 * against the raw body — the manual `new Webhook(secret).verify(...)` from svix isn't needed anymore.
 * Clerk sends deliveries through Svix, which retries any non-2xx response.
 */
export async function POST(request: NextRequest) {
  let event: WebhookEvent
  try {
    event = await verifyWebhook(request, {
      signingSecret: env.CLERK_WEBHOOK_SECRET,
    })
  } catch (error) {
    console.error("Clerk webhook: signature verification failed", error)
    return new Response(null, { status: 400 })
  }

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const email = event.data.email_addresses.find(
          (email) => email.id === event.data.primary_email_address_id,
        )?.email_address
        if (email == null) return new Response("No email", { status: 400 })

        // NOTE: email-only sign-ups have no first/last name; fall back to the email's local part
        // instead of rejecting the user, otherwise they'd never reach the DB.
        const name =
          `${event.data.first_name ?? ""} ${event.data.last_name ?? ""}`.trim() ||
          email.split("@")[0]

        if (event.type === "user.created") {
          const user = await insertUser({
            clerkUserId: event.data.id,
            email,
            name,
            imageUrl: event.data.image_url,
            role: "user",
          })

          await syncClerkUserMetadata(user) // NOTE: puts dbId + role into the session token.
        } else {
          await updateUser(
            { clerkUserId: event.data.id },
            {
              email,
              name,
              imageUrl: event.data.image_url,
              role: event.data.public_metadata.role,
            },
          )
        }
        break
      }
      case "user.deleted": {
        if (event.data.id != null) {
          await deleteUser({ clerkUserId: event.data.id })
        }
        break
      }
    }
  } catch (error) {
    // NOTE: a non-2xx makes Svix retry the delivery later.
    console.error(`Clerk webhook: failed to process ${event.type}`, error)
    return new Response(null, { status: 500 })
  }

  return new Response(null, { status: 200 })
}
