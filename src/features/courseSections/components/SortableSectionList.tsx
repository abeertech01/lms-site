"use client"

import { SortableItem, SortableList } from "@/components/SortableList"
import { CourseSectionStatus } from "@/drizzle/schema"
import { formatPlural } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { EyeClosed, Trash2Icon } from "lucide-react"
import SectionFormDialog from "./SectionFormDialog"
import { DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import ActionButton from "@/components/ActionButton"
import { deleteSection, updateSectionOrders } from "../actions/sections"

export function SortableSectionList({
  courseId,
  sections,
}: {
  courseId: string
  sections: {
    id: string
    name: string
    status: CourseSectionStatus
    lessonsCount?: number
  }[]
}) {
  return (
    <SortableList items={sections} onOrderChange={updateSectionOrders}>
      {(items) =>
        items.map((section) => (
          <SortableItem
            key={section.id}
            id={section.id}
            className="flex items-center gap-3.5"
          >
            <span
              className={cn(
                "flex flex-1 items-center gap-2 min-w-0 font-medium text-[15px]",
                section.status === "private" && "text-muted-foreground",
              )}
            >
              {section.status === "private" && <EyeClosed className="size-4" />}
              {section.name}
            </span>
            {section.lessonsCount != null && (
              <span className="font-mono text-[11px] text-ink-soft uppercase whitespace-nowrap">
                {formatPlural(section.lessonsCount, {
                  singular: "lesson",
                  plural: "lessons",
                })}
              </span>
            )}
            <SectionFormDialog section={section} courseId={courseId}>
              <DialogTrigger render={<Button size={"sm"}>Edit</Button>} />
            </SectionFormDialog>
            <ActionButton
              action={deleteSection.bind(null, section.id)}
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
