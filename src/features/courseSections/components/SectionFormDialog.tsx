"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  FormDialogHeader,
  formDialogContentClass,
} from "@/components/FormDialogParts"
import { CourseSectionStatus } from "@/drizzle/schema"
import { ReactNode, useState } from "react"
import SectionForm from "./SectionForm"

export default function SectionFormDialog({
  courseId,
  section,
  children,
}: {
  courseId: string
  children: ReactNode
  section?: { id: string; name: string; status: CourseSectionStatus }
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children}
      <DialogContent showCloseButton={false} className={formDialogContentClass}>
        <FormDialogHeader
          title={section == null ? "New Section" : `Edit ${section.name}`}
        />
        <SectionForm
          section={section}
          courseId={courseId}
          onSuccess={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
