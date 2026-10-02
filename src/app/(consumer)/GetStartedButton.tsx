"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

// NOTE: on the landing page "Get started" leads to the catalog; everywhere else
// (all-products, product pages…) the visitor has already seen products, so the
// button says "Sign up" and leads to the sign-up page.
export function GetStartedButton() {
  const isLanding = usePathname() === "/"

  return (
    <Link
      href={isLanding ? "/all-products" : "/sign-up"}
      className="bg-primary px-5 py-2.5 rounded-full font-medium text-primary-foreground text-base hover:text-white whitespace-nowrap transition-colors hover:bg-accent"
    >
      {isLanding ? "Get started" : "Sign up"}
    </Link>
  )
}
