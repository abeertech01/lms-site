import { relations } from "drizzle-orm"
import { pgTable, text } from "drizzle-orm/pg-core"
import { createdAt, id, updatedAt } from "../schemaHelper"

export const CourseTable = pgTable("course", {
  id,
  name: text().notNull(),
  description: text().notNull(),
  createdAt,
  updatedAt,
})

export const CourseRelationships = relations(
  CourseTable,
  ({ one, many }) => ({})
)
