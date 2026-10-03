"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  FormDialogHeader,
  formDialogContentClass,
} from "@/components/FormDialogParts"
import { LessonStatus } from "@/drizzle/schema"
import { ReactNode, useState } from "react"
import LessonForm from "./LessonForm"

export default function LessonFormDialog({
  sections,
  defaultSectionId,
  lesson,
  children,
}: {
  children: ReactNode
  sections: { id: string; name: string }[]
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
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children}
      <DialogContent showCloseButton={false} className={formDialogContentClass}>
        <FormDialogHeader
          title={lesson == null ? "New Lesson" : `Edit ${lesson.name}`}
        />
        <LessonForm
          sections={sections}
          onSuccess={() => setIsOpen(false)}
          lesson={lesson}
          defaultSectionId={defaultSectionId}
        />
      </DialogContent>
    </Dialog>
  )
}
