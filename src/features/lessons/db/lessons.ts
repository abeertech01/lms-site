import { db, transaction } from "@/drizzle/db"
import { LessonTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { revalidateLessonCache } from "./cache/lessons"

export async function getNextCourseLessonOrder(sectionId: string) {
  const lesson = await db.query.LessonTable.findFirst({
    columns: { order: true },
    where: { sectionId },
    orderBy: { order: "desc" },
  })

  return lesson ? lesson.order + 1 : 0
}

/** NOTE:
 * transaction(async (trx) => { ... }) is our helper from "@/drizzle/db",
 * not db.transaction(). The default `db` uses Neon's HTTP driver, which can't
 * run interactive transactions, so the helper opens a short-lived WebSocket
 * pool for just this transaction and closes it afterwards.
 * Inside the block, run every query on `trx` (not `db`) so it takes part in the
 * transaction. If anything throws (or trx.rollback() is called), everything
 * rolls back; otherwise it commits.
 *
 * First element of Promise.all inserts a new lesson.
 * Second element looks up the section (where: { id: data.sectionId }) to get
 * its courseId, which is needed to revalidate the cache.
 */
export async function insertLesson(data: typeof LessonTable.$inferInsert) {
  const [newLesson, courseId] = await transaction(async (trx) => {
    const [[newLesson], section] = await Promise.all([
      trx.insert(LessonTable).values(data).returning(),
      trx.query.CourseSectionTable.findFirst({
        columns: { courseId: true },
        where: { id: data.sectionId },
      }),
    ])

    if (section == null) return trx.rollback()

    return [newLesson, section.courseId]
  })
  if (newLesson == null) throw new Error("Failed to create lesson")

  revalidateLessonCache({ courseId, id: newLesson.id })

  return newLesson
}

export async function updateLesson(
  id: string,
  data: Partial<typeof LessonTable.$inferInsert>,
) {
  const [updatedLesson, courseId] = await transaction(async (trx) => {
    const currentLesson = await trx.query.LessonTable.findFirst({
      where: { id },
      columns: { sectionId: true },
    })
    if (
      data.sectionId != null &&
      currentLesson?.sectionId !== data.sectionId &&
      data.order == null
    ) {
      data.order = await getNextCourseLessonOrder(data.sectionId)
    }

    const [updatedLesson] = await trx
      .update(LessonTable)
      .set(data)
      .where(eq(LessonTable.id, id))
      .returning()
    if (updatedLesson == null) {
      trx.rollback()
      throw new Error("Failed to update lesson")
    }

    const section = await trx.query.CourseSectionTable.findFirst({
      columns: { courseId: true },
      where: { id: updatedLesson.sectionId },
    })

    if (section == null) return trx.rollback()

    return [updatedLesson, section.courseId]
  })

  revalidateLessonCache({ courseId, id: updatedLesson.id })

  return updatedLesson
}

export async function deleteLesson(id: string) {
  const [deletedLesson, courseId] = await transaction(async (trx) => {
    const [deletedLesson] = await trx
      .delete(LessonTable)
      .where(eq(LessonTable.id, id))
      .returning()
    if (deletedLesson == null) {
      trx.rollback()
      throw new Error("Failed to delete lesson")
    }

    const section = await trx.query.CourseSectionTable.findFirst({
      columns: { courseId: true },
      where: { id: deletedLesson.sectionId },
    })

    if (section == null) return trx.rollback()

    return [deletedLesson, section.courseId]
  })

  revalidateLessonCache({ id: deletedLesson.id, courseId })

  return deletedLesson
}

export async function updateLessonOrders(lessonIds: string[]) {
  const [lessons, courseId] = await transaction(async (trx) => {
    const lessons = await Promise.all(
      lessonIds.map((id, index) =>
        db
          .update(LessonTable)
          .set({ order: index })
          .where(eq(LessonTable.id, id))
          .returning({
            sectionId: LessonTable.sectionId,
            id: LessonTable.id,
          }),
      ),
    )
    const sectionId = lessons[0]?.[0]?.sectionId
    if (sectionId == null) return trx.rollback()

    const section = await trx.query.CourseSectionTable.findFirst({
      columns: { courseId: true },
      where: { id: sectionId },
    })

    if (section == null) return trx.rollback()

    return [lessons, section.courseId]
  })

  lessons.flat().forEach(({ id }) => {
    revalidateLessonCache({
      courseId,
      id,
    })
  })
}
