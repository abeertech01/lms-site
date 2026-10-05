import { revalidateTag } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"
import { parseBody } from "next-sanity/webhook"

// NOTE: Sanity calls this when a post is published/edited/deleted (set up in the Sanity project's API > Webhooks).
// The signature check makes sure only Sanity can trigger it.
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) {
    return new NextResponse("Missing SANITY_REVALIDATE_SECRET", { status: 500 })
  }

  const { isValidSignature, body } = await parseBody<{
    _type?: string
    slug?: string
  }>(req, secret)

  if (!isValidSignature) {
    return new NextResponse("Invalid signature", { status: 401 })
  }

  revalidateTag("post", "max")
  if (body?.slug) revalidateTag(`post:${body.slug}`, "max")

  return NextResponse.json({ revalidated: true })
}
