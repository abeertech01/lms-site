import type { MetadataRoute } from "next"
import { env } from "@/data/env/client"

// NOTE: served at /robots.txt. Tells crawlers what to skip and where the sitemap is.
// Private or app-only areas are blocked so they never appear in search results.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/studio", "/api", "/courses", "/purchases"],
    },
    sitemap: `${env.NEXT_PUBLIC_SERVER_URL}/sitemap.xml`,
  }
}
