import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { createdAt, id, updatedAt } from "../schemaHelper"
import { relations } from "drizzle-orm"
import { UserCourseAccessTable } from "./userCourseAccess"

export const userRoles = ["user", "admin"] as const
export type UserRole = (typeof userRoles)[number]
export const userRoleEnum = pgEnum("user_role", userRoles)

export const UserTable = pgTable("users", {
  id,
  clerkUserId: text().notNull().unique(),
  email: text().notNull(),
  name: text().notNull(),
  role: userRoleEnum().notNull().default("user"),
  imageUrl: text(),
  deletedAt: timestamp({ withTimezone: true }),
  createdAt,
  updatedAt,
})
/** deletedAt: timestamp({ withTimezone: true })
 * user stores the timestamp in its local time. But it's being stored in utc time.
 */

export const UserRelationships = relations(UserTable, ({ many }) => ({
  userCourseAccesses: many(UserCourseAccessTable),
}))
