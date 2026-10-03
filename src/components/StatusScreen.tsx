import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { ReactNode } from "react"

// NOTE: the full-page message used by not-found.tsx, error.tsx and global-error.tsx.
// It has no hooks, so it works in both server and client components.
export function StatusScreen({
  badge,
  eyebrow,
  title,
  description,
  tone = "default",
  children,
}: {
  badge: string
  eyebrow: string
  title: ReactNode
  description: ReactNode
  tone?: "default" | "error"
  children?: ReactNode
}) {
  const isError = tone === "error"

  return (
    <section className="flex flex-col items-start mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 pt-10 pb-24 w-full max-w-310 min-h-[70vh]">
      <Link href="/" className="flex items-center">
        <Image
          src="/triplea-logo.png"
          alt="TripleA"
          width={1245}
          height={309}
          className="w-auto h-7"
        />
      </Link>

      <div className="my-auto pt-16 animate-rise">
        <div
          className={cn(
            "place-items-center grid rounded-full size-16 font-semibold text-[28px] animate-pop",
            isError ? "bg-destructive/15 text-destructive" : "bg-lime",
          )}
        >
          {badge}
        </div>
        <div
          className={cn(
            "mt-8 font-mono text-xs uppercase tracking-[0.08em]",
            isError ? "text-destructive" : "text-accent",
          )}
        >
          {eyebrow}
        </div>
        <h1 className="mt-3.5 font-semibold text-[clamp(44px,6vw,84px)] leading-[0.95] tracking-[-0.045em] text-balance max-[720px]:text-[clamp(32px,11vw,48px)] max-[720px]:leading-[1.02] max-[380px]:text-[clamp(28px,10.5vw,36px)]">
          {title}
        </h1>
        <p className="mt-5.5 max-w-120 text-[19px] text-muted-foreground leading-[1.55]">
          {description}
        </p>
        <div className="flex flex-wrap gap-3.5 mt-8.5">{children}</div>
      </div>
    </section>
  )
}

// NOTE: the two button styles used in StatusScreen's actions.
export const statusPrimaryClass =
  "bg-primary px-7 py-4 rounded-full font-medium text-[16px] text-primary-foreground hover:text-white whitespace-nowrap transition-colors hover:bg-accent cursor-pointer"
export const statusSecondaryClass =
  "px-6.5 py-3.75 border border-foreground rounded-full font-medium text-[16px] hover:text-background whitespace-nowrap transition-colors hover:bg-foreground cursor-pointer"
