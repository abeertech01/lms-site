import { cn } from "@/lib/utils"
import { ReactNode } from "react"

// NOTE: the small mono label above each landing-page heading ("01 — The catalog").
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "font-mono text-accent text-xs uppercase tracking-[0.08em]",
        className,
      )}
    >
      {children}
    </div>
  )
}
