import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* NOTE: config options here */
  cacheComponents: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // NOTE: Next.js auto-externalizes "pg", but not these two — bundling `ws`
  // (used for Neon's WebSocket driver, which needs it to survive cold-start
  // wake-ups) silently breaks it: connections established fine standalone,
  // but died mid-query once run through Next's bundled output. Keeping them
  // as native `require()`s instead of bundling fixes it.
  serverExternalPackages: ["@neondatabase/serverless", "ws"],
}

export default nextConfig
