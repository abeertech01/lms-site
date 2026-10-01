import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core"
import { UserTable } from "./user"
import { CourseTable } from "./course"
import { createdAt, updatedAt } from "../schemaHelper"

export const UserCourseAccessTable = pgTable(
  "user_course_access",
  {
    userId: uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    courseId: uuid()
      .notNull()
      .references(() => CourseTable.id, { onDelete: "cascade" }),
    createdAt,
    updatedAt,
  },
  (t) => [primaryKey({ columns: [t.userId, t.courseId] })],
)
