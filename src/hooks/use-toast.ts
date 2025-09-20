"use client"

import { toast as sonnerToast } from "sonner"

type Style = {
  color: string
  backgroundColor: string
  border: string
}

type ToastOptions = {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: (event: React.MouseEvent<HTMLButtonElement>) => void
  variant?: "default" | "destructive"
  style?: Style
  icon?: React.ReactNode
}

function toast({
  title,
  description,
  actionLabel,
  onAction,
  style,
  icon,
}: ToastOptions) {
  return sonnerToast(title ?? "", {
    description,
    action:
      actionLabel && onAction
        ? {
            label: actionLabel,
            onClick: onAction,
          }
        : undefined,
    style,
    icon,
  })
}

function actionToast({
  actionData,
  icon = undefined,
}: {
  actionData: { error: boolean; message: string }
  icon?: React.ReactNode
}) {
  return toast({
    title: actionData.error ? "Error" : "Success",
    description: actionData.message,
    variant: actionData.error ? "destructive" : "default",
    style: {
      backgroundColor: "#ec003f",
      color: "white",
      border: "2px solid #c70036",
    },
    ...(icon && { icon }),
  })
}

// If you still want a hook wrapper for API parity
function useToast() {
  return {
    toast,
    actionToast,
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  }
}

export { useToast, toast, actionToast }
