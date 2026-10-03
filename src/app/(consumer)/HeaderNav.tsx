"use client"

import { SignInButton, useAuth, useUser } from "@clerk/nextjs"
import Link from "next/link"
import { ReactNode } from "react"
import { GetStartedButton } from "./GetStartedButton"
import { MobileMenu } from "./MobileMenu"
import { UserMenu } from "./UserMenu"

const navLinkClass =
  "hidden md:flex items-center text-muted-foreground text-base hover:text-accent transition-colors"

export function SignedOutNav() {
  return (
    <>
      <div className="flex flex-1 gap-5.5 min-w-0">
        <Link href="/all-products" className={navLinkClass}>
          All products
        </Link>
        <Link href="/#how" className={navLinkClass}>
          How it works
        </Link>
        <Link href="/#inside" className={navLinkClass}>
          What&apos;s inside
        </Link>
        <Link href="/#faq" className={navLinkClass}>
          FAQ
        </Link>
      </div>
      <div className="flex items-center gap-2.5 max-[720px]:hidden ml-auto shrink-0">
        <SignInButton>
          <button
            type="button"
            className="px-3.5 py-2 font-medium text-base cursor-pointer"
          >
            Sign in
          </button>
        </SignInButton>
        <GetStartedButton />
      </div>
      <MobileMenu />
    </>
  )
}

export function SignedInNav({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex flex-1 justify-end items-center gap-7 min-w-0">
      <Link href="/all-products" className={navLinkClass}>
        All products
      </Link>
      <Link href="/courses" className={navLinkClass}>
        My courses
      </Link>
      <Link href="/purchases" className={navLinkClass}>
        Purchases history
      </Link>
      {isAdmin && (
        <Link href="/admin" className={navLinkClass}>
          Admin
        </Link>
      )}
      <div className="size-9 shrink-0">
        <UserMenu isAdmin={isAdmin} />
      </div>
    </div>
  )
}

/** NOTE:
 * Chooses between the signed-in and signed-out header.
 *
 * - Before Clerk has loaded in the browser, it shows `initial`: what the server
 *   rendered from the request's session, so there is no flash on page load.
 * - After that it follows Clerk's own state in the browser, so signing in or out
 *   swaps the header immediately. Relying on the server re-render alone (what
 *   Clerk's server-side <Show> does) made the swap lag by half a second on desktop
 *   and never arrive on mobile until a reload.
 * - Both versions use the same components, so React updates in place instead of
 *   remounting when the browser takes over.
 *
 * The Admin link follows the same role in Clerk's public metadata that the admin
 * layout checks, so the link and the access rule can't disagree.
 */
export function HeaderAuth({ initial }: { initial: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()

  if (!isLoaded) return initial
  if (!isSignedIn) return <SignedOutNav />

  return <SignedInNav isAdmin={user?.publicMetadata?.role === "admin"} />
}
