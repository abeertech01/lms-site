"use client"

import { usePathname } from "next/navigation"

// NOTE: on desktop the bar is a centered, wrapping line. At 720px and below (as in the
// mobile design) it becomes one row: the label stays pinned on the left and the text
// scrolls past. With reduced motion the text stays still and wraps instead.
export function AnnouncementBar() {
  const pathname = usePathname()

  // NOTE: the fair-pricing bar belongs to the landing page only.
  if (pathname !== "/") return null

  return (
    <div className="flex flex-wrap justify-center gap-2.5 bg-foreground px-5 py-2.5 text-sm text-background text-center max-[720px]:flex-nowrap max-[720px]:justify-start max-[720px]:gap-0 max-[720px]:overflow-hidden max-[720px]:px-0 motion-reduce:max-[720px]:flex-wrap motion-reduce:max-[720px]:justify-center motion-reduce:max-[720px]:gap-2.5 motion-reduce:max-[720px]:px-5">
      <span className="bg-lime px-2 py-0.5 rounded-full font-medium font-mono text-xs text-foreground whitespace-nowrap max-[720px]:relative max-[720px]:z-1 max-[720px]:mr-2 max-[720px]:ml-3 max-[720px]:shrink-0 max-[720px]:shadow-[-14px_0_0_6px_#17150f,8px_0_8px_4px_#17150f] motion-reduce:max-[720px]:m-0 motion-reduce:max-[720px]:shadow-none">
        FAIR PRICING
      </span>
      <span className="max-[720px]:shrink-0 max-[720px]:animate-promo-scroll max-[720px]:whitespace-nowrap motion-reduce:max-[720px]:whitespace-normal">
        Learning from a lower-income country? A regional discount is applied
        automatically at checkout.
      </span>
    </div>
  )
}
