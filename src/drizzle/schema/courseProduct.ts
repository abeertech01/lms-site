import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core"
import { CourseTable } from "./course"
import { ProductTable } from "./product"
import { createdAt, updatedAt } from "../schemaHelper"
import { relations } from "drizzle-orm"

export const CourseProductTable = pgTable(
  "course_products",
  {
    courseId: uuid()
      .notNull()
      .references(() => CourseTable.id, { onDelete: "restrict" }),
    productId: uuid()
      .notNull()
      .references(() => ProductTable.id, { onDelete: "cascade" }),
    createdAt,
    updatedAt,
  },
  (t) => [primaryKey({ columns: [t.courseId, t.productId] })]
)
/** courseId - { onDelete: "restrict" }
 * 'restrict' restricts deletion of a course when it is in a product.
 * here: basically user cannot delete the course because of 'restrict'. CourseProduct record will not be affected.
 *
 ** productId - { onDelete: "cascade" }
 * 'cascade' allows to delete CourseProduct record, when user deletes the related product.
 */

export const CourseProductRelationships = relations(
  CourseProductTable,
  ({ one }) => ({
    course: one(CourseTable, {
      fields: [CourseProductTable.courseId],
      references: [CourseTable.id],
    }),
    product: one(ProductTable, {
      fields: [CourseProductTable.productId],
      references: [ProductTable.id],
    }),
  })
)

/** relations
 * Here it says - Every CourseProductTable record is related to single course and single product.
 */
