"use client"

import { Button } from "@/components/ui/button"
import { DialogClose, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { XIcon } from "lucide-react"
import { ReactNode } from "react"

// NOTE: shared pieces of the "edit / new" pop-ups for lessons and sections:
// a header with the title and a round close button, a scrolling body, and a footer
// pinned to the bottom with Cancel and Save. Use FormDialogContentClass on DialogContent.
export const formDialogContentClass =
  "flex flex-col gap-0 overflow-hidden p-0 sm:max-w-[560px] max-h-[calc(100dvh-48px)] max-[720px]:max-h-[92dvh] max-[720px]:overflow-hidden max-[720px]:pb-0"

export function FormDialogHeader({ title }: { title: ReactNode }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b shrink-0">
      <DialogTitle className="flex-1 min-w-0 overflow-hidden font-semibold text-lg text-ellipsis tracking-[-0.02em] whitespace-nowrap">
        {title}
      </DialogTitle>
      <DialogClose
        render={
          <button
            type="button"
            aria-label="Close"
            className="place-items-center grid hover:bg-background rounded-full size-9 transition-colors cursor-pointer shrink-0"
          />
        }
      >
        <XIcon className="size-4" />
      </DialogClose>
    </div>
  )
}

export function FormDialogBody({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col flex-1 gap-4.5 px-6 py-5 min-h-0 overflow-y-auto",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function FormDialogFooter({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <div className="flex justify-end items-center gap-3 px-6 py-3.5 border-t shrink-0">
      <DialogClose
        render={
          <button
            type="button"
            className="border border-line-strong hover:border-foreground rounded-full px-5.5 py-2.75 max-[720px]:min-h-11 max-[720px]:flex-1 font-medium text-sm transition-colors cursor-pointer"
          />
        }
      >
        Cancel
      </DialogClose>
      <Button
        disabled={isSubmitting}
        type="submit"
        className="px-7 py-2.75 max-[720px]:min-h-11 max-[720px]:flex-1 h-auto"
      >
        Save
      </Button>
    </div>
  )
}
