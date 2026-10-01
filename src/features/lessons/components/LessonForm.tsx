"use client"

import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import RequiredLabelIcon from "@/components/RequiredLabelIcon"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
import { YouTubeVideoPlayer } from "./YouTubeVideoPlayer"

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
                <SelectTrigger id="sectionId">
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
                <SelectTrigger id="status">
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
      </div>
      <Field data-invalid={errors.description != null}>
        <FieldLabel htmlFor="description">Description</FieldLabel>
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
      {videoId && (
        <div className="aspect-video">
          <YouTubeVideoPlayer videoId={videoId} />
        </div>
      )}
    </form>
  )
}
