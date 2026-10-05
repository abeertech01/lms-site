import type { SchemaTypeDefinition } from "sanity"
import { authorType } from "./authorType"
import { categoryType } from "./categoryType"
import { postType } from "./postType"

export const schemaTypes: SchemaTypeDefinition[] = [
  postType,
  authorType,
  categoryType,
]
