import type { MetadataRoute } from "next"
import { env } from "@/data/env/client"
import { getSitemapPosts } from "@/sanity/lib/queries"

// NOTE: served at /sitemap.xml. It lists the public pages plus every published blog post,
// so Google can discover new posts without waiting to stumble on a link.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_SERVER_URL
  const posts = await getSitemapPosts()

  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/all-products`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/blog`, changeFrequency: "daily", priority: 0.8 },
    ...posts.map(post => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post._updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]
}
