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
      backgroundColor: actionData.error
        ? "oklch(58.6% 0.253 17.585)"
        : "oklch(59.6% 0.145 163.225)",
      color: "white",
      border: actionData.error
        ? "2px solid oklch(51.4% 0.222 16.935)"
        : "2px solid oklch(50.8% 0.118 165.612)",
    },
    ...(icon && { icon }),
  })
}

// NOTE: If you still want a hook wrapper for API parity
function useToast() {
  return {
    toast,
    actionToast,
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  }
}

export { useToast, toast, actionToast }
