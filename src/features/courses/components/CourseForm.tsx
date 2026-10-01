"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { courseSchema } from "../schemas/courses"
import z from "zod"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import RequiredLabelIcon from "@/components/RequiredLabelIcon"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { createCourse, updateCourse } from "../actions/courses"
import { actionToast } from "@/hooks/use-toast"

export default function CourseForm({
  course,
}: {
  course?: {
    id: string
    name: string
    description: string
  }
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: course ?? {
      name: "",
      description: "",
    },
  })

  async function onSubmit(values: z.infer<typeof courseSchema>) {
    const action =
      course == null ? createCourse : updateCourse.bind(null, course.id)
    const data = await action(values)
    actionToast({ actionData: data })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Field data-invalid={errors.name != null}>
        <FieldLabel htmlFor="name">
          <RequiredLabelIcon />
          Name
        </FieldLabel>
        <Input id="name" {...register("name")} />
        <FieldError errors={errors.name ? [errors.name] : undefined} />
      </Field>
      <Field data-invalid={errors.description != null}>
        <FieldLabel htmlFor="description">
          <RequiredLabelIcon />
          Description
        </FieldLabel>
        <Textarea
          id="description"
          className="min-h-20 resize-none"
          {...register("description")}
        />
        <FieldError
          errors={errors.description ? [errors.description] : undefined}
        />
      </Field>
      <div className="self-end">
        <Button disabled={isSubmitting} type="submit">
          Save
        </Button>
      </div>
    </form>
  )
}
