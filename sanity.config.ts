"use client"

import { defineConfig } from "sanity"
import { structureTool } from "sanity/structure"
import { dataset, projectId } from "@/sanity/env"
import { schemaTypes } from "@/sanity/schemaTypes"

// NOTE: Studio (the editor UI) is mounted inside this app at /studio, see src/app/studio.
export default defineConfig({
  name: "default",
  title: "TripleA Blog",
  basePath: "/studio",
  // NOTE: Sanity throws on an empty projectId, the placeholder keeps the build alive until the env var is set.
  projectId: projectId || "unconfigured",
  dataset,
  schema: { types: schemaTypes },
  plugins: [structureTool()],
})
