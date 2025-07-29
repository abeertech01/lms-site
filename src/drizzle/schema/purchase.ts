import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { createdAt, id, updatedAt } from "../schemaHelper"
import { UserTable } from "./user"
import { ProductTable } from "./product"
import { relations } from "drizzle-orm"

export const PurchaseTable = pgTable("purchases", {
  id,
  pricePaidInCents: integer().notNull(),
  productDetails: jsonb()
    .notNull()
    .$type<{ name: string; description: string; imageUrl: string }>(),
  userId: uuid()
    .notNull()
    .references(() => UserTable.id, { onDelete: "restrict" }),
  productId: uuid()
    .notNull()
    .references(() => ProductTable.id, { onDelete: "restrict" }),
  stripeSessionId: text().notNull().unique(),
  refundedAt: timestamp({ withTimezone: true }),
  createdAt,
  updatedAt,
})
/** pricePaidCents
 * stripe handles everything in cents, that's why the field is named in cents
 *
 ** jsonb()
 * jsonb is a PostgreSQL data type that stores JSON data in a binary-optimized format, allowing for faster queries, indexing, and efficient storage. It's better than json in most cases.
 * Binary-optimized means PostgreSQL stores the JSON object in binary format.
 */

export const PurchaseRelationships = relations(PurchaseTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [PurchaseTable.userId],
    references: [UserTable.id],
  }),
  product: one(ProductTable, {
    fields: [PurchaseTable.productId],
    references: [ProductTable.id],
  }),
}))
