import PageHeader from "@/components/PageHeader"
import CourseForm from "@/features/courses/components/CourseForm"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default function NewCoursePage() {
  return (
    <div className="my-6 container">
      <PageHeader title="New Course" />
      <CourseForm />
    </div>
  )
}
