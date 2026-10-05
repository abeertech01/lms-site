import { cacheLife, cacheTag } from "next/cache"
import { isSanityConfigured } from "../env"
import { client } from "./client"

export type PostSummary = {
  _id: string
  title: string
  slug: string
  excerpt: string
  publishedAt: string
  coverImage: { asset: { _ref: string }; alt?: string } | null
  authorName: string | null
}

export type Post = PostSummary & {
  body: unknown[] | null
  authorBio: string | null
  seo: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: { asset: { _ref: string } }
    noIndex?: boolean
  } | null
  _updatedAt: string
}

const SUMMARY_FIELDS = `
  _id, title, "slug": slug.current, excerpt, publishedAt, coverImage,
  "authorName": author->name
`

// NOTE: every cached read is tagged "post". The webhook (api/revalidate/sanity) invalidates that tag when
// an editor publishes in Studio, so new content shows up without a redeploy.
export async function getPosts(): Promise<PostSummary[]> {
  "use cache"
  cacheTag("post")
  cacheLife("hours")

  if (!isSanityConfigured) return []
  return client.fetch(
    `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) { ${SUMMARY_FIELDS} }`,
  )
}

export async function getPost(slug: string): Promise<Post | null> {
  "use cache"
  cacheTag("post", `post:${slug}`)
  cacheLife("hours")

  if (!isSanityConfigured) return null
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0] {
      ${SUMMARY_FIELDS}, _updatedAt, body, seo, "authorBio": author->bio
    }`,
    { slug },
  )
}
