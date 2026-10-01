import { defineRelations } from "drizzle-orm"
import * as schema from "./schema"

// NOTE: v1's relational-query API replaced the old per-table relations()
// helper with one centralized defineRelations() call. Relation names below
// (e.g. "user", "courseProducts") match the old per-table relations() keys
// 1:1 so db.query.X.findFirst({ with: { ... } }) shapes stay the same.
// Every one() below sets optional: false — each is backed by a NOT NULL FK
// column, so the referenced row always exists; without this flag Drizzle
// types the relation as nullable by default.
export const dbRelations = defineRelations(schema, (r) => ({
  UserTable: {
    userCourseAccesses: r.many.UserCourseAccessTable({
      from: r.UserTable.id,
      to: r.UserCourseAccessTable.userId,
    }),
  },
  CourseTable: {
    courseProducts: r.many.CourseProductTable({
      from: r.CourseTable.id,
      to: r.CourseProductTable.courseId,
    }),
    userCourseAccesses: r.many.UserCourseAccessTable({
      from: r.CourseTable.id,
      to: r.UserCourseAccessTable.courseId,
    }),
    courseSections: r.many.CourseSectionTable({
      from: r.CourseTable.id,
      to: r.CourseSectionTable.courseId,
    }),
  },
  CourseProductTable: {
    course: r.one.CourseTable({
      from: r.CourseProductTable.courseId,
      to: r.CourseTable.id,
      optional: false,
    }),
    product: r.one.ProductTable({
      from: r.CourseProductTable.productId,
      to: r.ProductTable.id,
      optional: false,
    }),
  },
  CourseSectionTable: {
    course: r.one.CourseTable({
      from: r.CourseSectionTable.courseId,
      to: r.CourseTable.id,
      optional: false,
    }),
    lessons: r.many.LessonTable({
      from: r.CourseSectionTable.id,
      to: r.LessonTable.sectionId,
    }),
  },
  LessonTable: {
    section: r.one.CourseSectionTable({
      from: r.LessonTable.sectionId,
      to: r.CourseSectionTable.id,
      optional: false,
    }),
    userLessonComplete: r.many.UserLessonCompleteTable({
      from: r.LessonTable.id,
      to: r.UserLessonCompleteTable.lessonId,
    }),
  },
  ProductTable: {
    courseProducts: r.many.CourseProductTable({
      from: r.ProductTable.id,
      to: r.CourseProductTable.productId,
    }),
  },
  PurchaseTable: {
    user: r.one.UserTable({
      from: r.PurchaseTable.userId,
      to: r.UserTable.id,
      optional: false,
    }),
    product: r.one.ProductTable({
      from: r.PurchaseTable.productId,
      to: r.ProductTable.id,
      optional: false,
    }),
  },
  UserCourseAccessTable: {
    user: r.one.UserTable({
      from: r.UserCourseAccessTable.userId,
      to: r.UserTable.id,
      optional: false,
    }),
    course: r.one.CourseTable({
      from: r.UserCourseAccessTable.courseId,
      to: r.CourseTable.id,
      optional: false,
    }),
  },
  UserLessonCompleteTable: {
    user: r.one.UserTable({
      from: r.UserLessonCompleteTable.userId,
      to: r.UserTable.id,
      optional: false,
    }),
    lesson: r.one.LessonTable({
      from: r.UserLessonCompleteTable.lessonId,
      to: r.LessonTable.id,
      optional: false,
    }),
  },
}))
