"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import RequiredLabelIcon from "@/components/RequiredLabelIcon"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { actionToast } from "@/hooks/use-toast"
import { AlertCircle, CircleCheckBig } from "lucide-react"
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
  const form = useForm<z.infer<typeof sectionSchema>>({
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
    actionToast({
      actionData: data,
      icon: data.error ? (
        <AlertCircle className="w-5 h-5 text-white" />
      ) : (
        <CircleCheckBig className="w-5 h-5 text-white" />
      ),
    })
    if (!data.error) onSuccess?.()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 @container"
      >
        {/* @container and @lg
         * @container makes the element 1024px wide.
         * normally lg works based on viewport. But @lg works based on its parent. So, @lg activates when its parent is 1024px or large.
         */}
        <div className="grid grid-cols-1 @lg:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <RequiredLabelIcon />
                  Name
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courseSectionStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="self-end">
          <Button disabled={form.formState.isSubmitting} type="submit">
            Save
          </Button>
        </div>
      </form>
    </Form>
  )
}
