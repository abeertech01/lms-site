"use client"

import { toast as toastManager } from "@/components/ui/toast"
import type { MouseEvent, ReactNode } from "react"

type ToastOptions = {
  title?: ReactNode
  description?: ReactNode
  actionLabel?: string
  onAction?: (event: MouseEvent<HTMLButtonElement>) => void
  type?: string
}

function toast({
  title,
  description,
  actionLabel,
  onAction,
  type,
}: ToastOptions) {
  return toastManager.add({
    title,
    description,
    type,
    actionProps:
      actionLabel && onAction
        ? { children: actionLabel, onClick: onAction }
        : undefined,
  })
}

function actionToast({
  actionData,
}: {
  actionData: { error: boolean; message: string }
}) {
  return toast({
    title: actionData.error ? "Error" : "Success",
    description: actionData.message,
    type: actionData.error ? "error" : "success",
  })
}

// NOTE: If you still want a hook wrapper for API parity
function useToast() {
  return {
    toast,
    actionToast,
    dismiss: (id?: string) => toastManager.close(id),
  }
}

export { useToast, toast, actionToast }
