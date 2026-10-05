// NOTE: these are public identifiers (not secrets), so NEXT_PUBLIC_ is fine. The Studio runs in the browser and needs them too.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ""
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production"
export const apiVersion = "2025-01-01"

export const isSanityConfigured = projectId !== ""
