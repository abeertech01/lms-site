import { cn } from "@/lib/utils"

export default function PageHeader({
  title,
  children,
  className,
}: {
  title: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn("flex justify-between items-center gap-4 mb-8", className)}
    >
      <h1 className="font-semibold text-2xl">{title}</h1>
      {children && <div>{children}</div>}
    </div>
  )
}
