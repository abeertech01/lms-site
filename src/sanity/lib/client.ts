import { createClient } from "next-sanity"
import { apiVersion, dataset, projectId } from "../env"

// NOTE: useCdn is off on purpose. Next.js already caches results (see queries.ts),
// and the CDN could hand back stale content right after a revalidation.
export const client = createClient({
  // NOTE: createClient throws on an empty projectId, which would break the build before Sanity is set up.
  // The placeholder is never queried, queries.ts returns early while isSanityConfigured is false.
  projectId: projectId || "unconfigured",
  dataset,
  apiVersion,
  useCdn: false,
})
