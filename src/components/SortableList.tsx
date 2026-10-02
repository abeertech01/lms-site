"use client"

import { DragDropProvider } from "@dnd-kit/react"
import { useSortable } from "@dnd-kit/react/sortable"
import { move } from "@dnd-kit/helpers"
import {
  createContext,
  ReactNode,
  startTransition,
  useContext,
  useOptimistic,
} from "react"
import { cn } from "@/lib/utils"
import { GripVerticalIcon } from "lucide-react"
import { actionToast } from "@/hooks/use-toast"

type PromiseResponse = {
  error: boolean
  message: string
}

// NOTE: @dnd-kit/react's useSortable needs each item's index. Instead of
// making every consumer pass it, SortableList shares the current order here.
const SortableOrderContext = createContext<string[]>([])

export function SortableList<T extends { id: string }>({
  items,
  onOrderChange,
  children,
}: {
  items: T[]
  onOrderChange: (newOrder: string[]) => Promise<PromiseResponse>
  children: (items: T[]) => ReactNode
}) {
  const [optimisticItems, setOptimisticItems] = useOptimistic(items)

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return

        const newItems = move(optimisticItems, event)
        startTransition(async () => {
          setOptimisticItems(newItems)
          const actionData = await onOrderChange(
            newItems.map((item) => item.id),
          )
          actionToast({ actionData })
        })
      }}
    >
      <SortableOrderContext value={optimisticItems.map((item) => item.id)}>
        <div className="flex flex-col">{children(optimisticItems)}</div>
      </SortableOrderContext>
    </DragDropProvider>
  )
}

export function SortableItem({
  id,
  children,
  className,
}: {
  id: string
  children: ReactNode
  className?: string
}) {
  const index = useContext(SortableOrderContext).indexOf(id)
  const { ref, handleRef, isDragging } = useSortable({ id, index })

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3.5 py-3 border-[#f3f0e9] border-b last:border-b-0",
        isDragging && "z-10 bg-card rounded-xl border shadow-md px-3",
      )}
    >
      <GripVerticalIcon
        ref={handleRef}
        className="size-5 text-[#b9b4a6] cursor-grab shrink-0"
      />
      <div className={cn("grow", className)}>{children}</div>
    </div>
  )
}
