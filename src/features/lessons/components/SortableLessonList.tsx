"use client"

import { SortableItem, SortableList } from "@/components/SortableList"
import { LessonStatus } from "@/drizzle/schema"
import { cn } from "@/lib/utils"
import { EyeClosed, Trash2Icon, VideoIcon } from "lucide-react"
import { DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import ActionButton from "@/components/ActionButton"
import LessonFormDialog from "./LessonFormDialog"
import { deleteLesson, updateLessonOrders } from "../actions/lessons"

export function SortableLessonList({
  sections,
  lessons,
}: {
  sections: {
    id: string
    name: string
  }[]
  lessons: {
    id: string
    name: string
    status: LessonStatus
    youtubeVideoId: string
    description: string | null
    sectionId: string
  }[]
}) {
  return (
    <SortableList items={lessons} onOrderChange={updateLessonOrders}>
      {(items) =>
        items.map((lesson) => (
          <SortableItem
            key={lesson.id}
            id={lesson.id}
            className="flex items-center gap-3.5"
          >
            <span
              className={cn(
                "flex flex-1 items-center gap-2 min-w-0 text-[15px]",
                lesson.status === "private" && "text-muted-foreground",
              )}
            >
              {lesson.status === "private" && <EyeClosed className="size-4" />}
              {lesson.status === "preview" && <VideoIcon className="size-4" />}
              {lesson.name}
            </span>
            <LessonFormDialog lesson={lesson} sections={sections}>
              <DialogTrigger render={<Button size={"sm"}>Edit</Button>} />
            </LessonFormDialog>
            <ActionButton
              action={deleteLesson.bind(null, lesson.id)}
              requireAreYouSure
              variant={"destructiveOutline"}
              size={"icon-sm"}
            >
              <Trash2Icon />
              <span className="sr-only">Delete</span>
            </ActionButton>
          </SortableItem>
        ))
      }
    </SortableList>
  )
}
