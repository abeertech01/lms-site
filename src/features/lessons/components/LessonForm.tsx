"use client"

import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import RequiredLabelIcon from "@/components/RequiredLabelIcon"
import { Input } from "@/components/ui/input"
import { actionToast } from "@/hooks/use-toast"
import { LessonStatus, lessonStatuses } from "@/drizzle/schema"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { lessonSchema } from "../schemas/lessons"
import { Textarea } from "@/components/ui/textarea"
import { createLesson, updateLesson } from "../actions/lessons"
import { FormDialogBody, FormDialogFooter } from "@/components/FormDialogParts"

export default function LessonForm({
  sections,
  defaultSectionId,
  onSuccess,
  lesson,
}: {
  sections: {
    id: string
    name: string
  }[]
  onSuccess?: () => void
  defaultSectionId?: string
  lesson?: {
    id: string
    name: string
    status: LessonStatus
    youtubeVideoId: string
    description: string | null
    sectionId: string
  }
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof lessonSchema>>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      name: lesson?.name ?? "",
      status: lesson?.status ?? "public",
      youtubeVideoId: lesson?.youtubeVideoId ?? "",
      description: lesson?.description ?? "",
      sectionId: lesson?.sectionId ?? defaultSectionId ?? sections[0]?.id ?? "",
    },
  })

  async function onSubmit(values: z.infer<typeof lessonSchema>) {
    const action =
      lesson == null ? createLesson : updateLesson.bind(null, lesson.id)
    const data = await action(values)
    actionToast({ actionData: data })
    if (!data.error) onSuccess?.()
  }

  const videoId = useWatch({ control, name: "youtubeVideoId" })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col flex-1 min-h-0"
    >
      <FormDialogBody>
        <Field data-invalid={errors.name != null}>
          <FieldLabel htmlFor="name">
            <RequiredLabelIcon />
            Name
          </FieldLabel>
          <Input id="name" {...register("name")} />
          <FieldError errors={errors.name ? [errors.name] : undefined} />
        </Field>
        <Field data-invalid={errors.youtubeVideoId != null}>
          <FieldLabel htmlFor="youtubeVideoId">
            <RequiredLabelIcon />
            Youtube Video Id
          </FieldLabel>
          <Input id="youtubeVideoId" {...register("youtubeVideoId")} />
          <FieldError
            errors={errors.youtubeVideoId ? [errors.youtubeVideoId] : undefined}
          />
        </Field>
        <Field data-invalid={errors.sectionId != null}>
          <FieldLabel htmlFor="sectionId">Section</FieldLabel>
          <Controller
            control={control}
            name="sectionId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="sectionId" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError
            errors={errors.sectionId ? [errors.sectionId] : undefined}
          />
        </Field>
        <Field data-invalid={errors.status != null}>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lessonStatuses.map((status) => (
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
        <Field data-invalid={errors.description != null}>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            className="min-h-28 resize-y"
            {...register("description")}
          />
          <FieldError
            errors={errors.description ? [errors.description] : undefined}
          />
        </Field>
        {/* NOTE: a still of the video, like the design (the old form embedded the full player). */}
        {videoId && (
          <div className="bg-[repeating-linear-gradient(135deg,#ECE8DF_0_8px,#E4DFD4_8px_16px)] rounded-[14px] aspect-video overflow-hidden shrink-0">
            <div
              role="img"
              aria-label="Video thumbnail"
              className="bg-cover bg-center size-full"
              style={{
                backgroundImage: `url(https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg)`,
              }}
            />
          </div>
        )}
      </FormDialogBody>
      <FormDialogFooter isSubmitting={isSubmitting} />
    </form>
  )
}
