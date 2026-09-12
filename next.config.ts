import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* NOTE: config options here */
  cacheComponents: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
}

export default nextConfig
