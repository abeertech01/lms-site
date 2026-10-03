"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { ReactNode, useState } from "react"

const tabs = [
  { id: "popular", label: "Most popular" },
  { id: "new", label: "Newly added" },
] as const

type TabId = (typeof tabs)[number]["id"]

// NOTE: both product grids are rendered on the server and passed in as nodes;
// this component only decides which one is visible.
export function CatalogTabs({
  heading,
  popular,
  newest,
}: {
  heading: ReactNode
  popular: ReactNode
  newest: ReactNode
}) {
  const [tab, setTab] = useState<TabId>("popular")

  return (
    <section
      id="courses"
      className="mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 pt-27.5 pb-10 w-full max-w-310 scroll-mt-16"
    >
      <div className="flex flex-wrap justify-between items-end gap-6">
        {heading}
        <div
          role="tablist"
          aria-label="Product list"
          className="flex gap-1 bg-secondary p-1 rounded-full"
        >
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "px-4.5 py-2 rounded-full font-medium text-sm cursor-pointer transition-colors",
                tab === id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div role="tabpanel" className="mt-12">
        {tab === "popular" ? popular : newest}
      </div>
      <div className="mt-7 text-center">
        <Link
          href="/all-products"
          className="pb-0.5 border-current border-b font-medium text-[15px]"
        >
          Browse all products
        </Link>
      </div>
    </section>
  )
}
