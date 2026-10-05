import { NextStudio } from "next-sanity/studio"
import config from "../../../../sanity.config"

export { metadata, viewport } from "next-sanity/studio"

// NOTE: the [[...tool]] catch-all lets Studio own every URL under /studio (its own client-side routing).
export default function StudioPage() {
  return <NextStudio config={config} />
}
