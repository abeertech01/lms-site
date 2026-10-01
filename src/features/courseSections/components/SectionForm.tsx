"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import RequiredLabelIcon from "@/components/RequiredLabelIcon"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { actionToast } from "@/hooks/use-toast"
import { CourseSectionStatus, courseSectionStatuses } from "@/drizzle/schema"
import { sectionSchema } from "../schemas/sections"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createSection, updateSection } from "../actions/sections"

export default function SectionForm({
  section,
  courseId,
  onSuccess,
}: {
  section?: {
    id: string
    name: string
    status: CourseSectionStatus
  }
  courseId: string
  onSuccess?: () => void
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof sectionSchema>>({
    resolver: zodResolver(sectionSchema),
    defaultValues: section ?? {
      name: "",
      status: "public",
    },
  })

  async function onSubmit(values: z.infer<typeof sectionSchema>) {
    const action =
      section == null
        ? createSection.bind(null, courseId)
        : updateSection.bind(null, section.id)
    const data = await action(values)
    actionToast({ actionData: data })
    if (!data.error) onSuccess?.()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="@container flex flex-col gap-6"
    >
      {/* NOTE:
       * @container and @lg
       * @container makes the element 1024px wide.
       * normally lg works based on viewport. But @lg works based on its parent. So, @lg activates when its parent is 1024px or large.
       */}
      <div className="gap-6 grid grid-cols-1 @lg:grid-cols-2">
        <Field data-invalid={errors.name != null}>
          <FieldLabel htmlFor="name">
            <RequiredLabelIcon />
            Name
          </FieldLabel>
          <Input id="name" {...register("name")} />
          <FieldError errors={errors.name ? [errors.name] : undefined} />
        </Field>
        <Field data-invalid={errors.status != null}>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {courseSectionStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={errors.status ? [errors.status] : undefined} />
        </Field>
      </div>
      <div className="self-end">
        <Button disabled={isSubmitting} type="submit">
          Save
        </Button>
      </div>
    </form>
  )
}
