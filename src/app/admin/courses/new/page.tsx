import CourseForm from "@/features/courses/components/CourseForm"
import Link from "next/link"
import { Eyebrow } from "../../../(consumer)/_landing/Eyebrow"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default function NewCoursePage() {
  return (
    <section className="mx-auto px-6 pt-5 pb-27.5 w-full max-w-190 animate-rise">
      <Link
        href="/admin/courses"
        className="text-[13px] text-ink-soft hover:text-accent transition-colors"
      >
        ← Courses
      </Link>
      <Eyebrow className="mt-3.5">Admin</Eyebrow>
      <h1 className="mt-2 font-semibold text-[44px] leading-none tracking-[-0.045em]">
        New <span className="text-accent">course.</span>
      </h1>
      <div className="bg-card mt-5.5 px-7.5 py-6.5 border rounded-[22px]">
        <CourseForm />
      </div>
    </section>
  )
}
