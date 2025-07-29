import { relations } from "drizzle-orm"
import { pgTable, text } from "drizzle-orm/pg-core"
import { createdAt, id, updatedAt } from "../schemaHelper"
import { CourseProductTable } from "./courseProduct"
import { UserCourseAccessTable } from "./userCourseAccess"

export const CourseTable = pgTable("course", {
  id,
  name: text().notNull(),
  description: text().notNull(),
  createdAt,
  updatedAt,
})

export const CourseRelationships = relations(CourseTable, ({ many }) => ({
  courseProducts: many(CourseProductTable),
  userCourseAccesses: many(UserCourseAccessTable),
}))
