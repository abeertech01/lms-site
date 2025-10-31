import { relations } from "drizzle-orm"
import { integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core"
import { createdAt, id, updatedAt } from "../schemaHelper"
import { CourseProductTable } from "./courseProduct"

export const productStatuses = ["public", "private"] as const
export type ProductStatus = (typeof productStatuses)[number]
export const productStatusEnum = pgEnum("product_status", productStatuses)
/** NOTE:
 * Meaning of (typeof productStatuses)[number]
 * type of an array is literally the array.
 * (typeof productStatuses)[number] = it signifies to a single element of that array. Either element can be the type.
 */

export const ProductTable = pgTable("products", {
  id,
  name: text().notNull(),
  description: text().notNull(),
  imageUrl: text().notNull(),
  priceInDollars: integer().notNull(),
  status: productStatusEnum().notNull().default("private"),
  createdAt,
  updatedAt,
})

export const ProductRelationships = relations(ProductTable, ({ many }) => ({
  courseProducts: many(CourseProductTable),
}))
