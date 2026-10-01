import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core"
import { UserTable } from "./user"
import { LessonTable } from "./lesson"
import { createdAt, updatedAt } from "../schemaHelper"

export const UserLessonCompleteTable = pgTable(
  "user_lesson_complete",
  {
    userId: uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    lessonId: uuid()
      .notNull()
      .references(() => LessonTable.id, { onDelete: "cascade" }),
    createdAt,
    updatedAt,
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
)
