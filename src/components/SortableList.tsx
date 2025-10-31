"use client"

import { DndContext, DragEndEvent } from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useOptimistic, ReactNode, startTransition, useId } from "react"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { AlertCircle, CircleCheckBig, GripVerticalIcon } from "lucide-react"
import { actionToast } from "@/hooks/use-toast"

type PromiseResponse = {
  error: boolean
  message: string
}

/** NOTE: 
 * children: (items: T[]) => ReactNode
 * means the children is a function — not plain JSX.
That function receives the items array (typed as T[])
and returns some JSX (ReactNode).

when you call children(optimisticItems),
it invokes '(items) => ...' and renders the returned JSX.
 */

export function SortableList<T extends { id: string }>({
  items,
  onOrderChange,
  children,
}: {
  items: T[]
  onOrderChange: (newOrder: string[]) => Promise<PromiseResponse>
  children: (items: T[]) => ReactNode
}) {
  const dndContextId = useId()
  const [optimisticItems, setOptimisticItems] = useOptimistic(items)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const activeId = active.id.toString()
    const overId = over?.id.toString()
    if (overId == null || activeId == null) return

    function getNewArray(array: T[], activeId: string, overId: string) {
      const oldIndex = array.findIndex((section) => section.id === activeId)
      const newIndex = array.findIndex((section) => section.id === overId)
      return arrayMove(array, oldIndex, newIndex)
    }

    startTransition(async () => {
      setOptimisticItems((items) => getNewArray(items, activeId, overId))
      const actionData = await onOrderChange(
        getNewArray(optimisticItems, activeId, overId).map((s) => s.id)
      )
      actionToast({
        actionData,
        icon: actionData.error ? (
          <AlertCircle className="w-5 h-5 text-white" />
        ) : (
          <CircleCheckBig className="w-5 h-5 text-white" />
        ),
      })
    })
  }

  return (
    <DndContext id={dndContextId} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col">{children(optimisticItems)}</div>
      </SortableContext>
    </DndContext>
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
  const {
    setNodeRef,
    transform,
    transition,
    activeIndex,
    index,
    attributes,
    listeners,
  } = useSortable({ id })
  const isActive = activeIndex === index

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "flex gap-1 items-center bg-background rounded-lg p-2",
        isActive && "z-10 border shadow-md"
      )}
    >
      <GripVerticalIcon
        className="text-muted-foreground size-6 p-1"
        {...attributes}
        {...listeners}
      />
      <div className={cn("flex-grow", className)}>{children}</div>
    </div>
  )
}
