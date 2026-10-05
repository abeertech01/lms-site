"use client"

import { SignInButton } from "@clerk/nextjs"
import { MenuIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

const allProductsLink = { label: "All products", href: "/all-products" }
// NOTE: these three sections only exist on the landing page, so they are left out on the All products page.
const blogLink = { label: "Blog", href: "/blog" }

const landingLinks = [
  { label: "How it works", href: "/#how" },
  { label: "What's inside", href: "/#inside" },
  { label: "FAQ", href: "/#faq" },
]

const itemClass =
  "flex min-h-11.5 w-full items-center rounded-[10px] px-3.5 text-left text-[15px] transition-colors hover:bg-secondary cursor-pointer"

// NOTE: the signed-out menu for phones (720px and below). On larger screens the
// header shows the links and the Sign in / Get started buttons instead, so both
// the button and the panel are hidden there.
export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const links =
    pathname === "/all-products"
      ? [allProductsLink, blogLink]
      : [allProductsLink, blogLink, ...landingLinks]

  // NOTE: close the menu after navigating (adjusting state during render, like the course sidebar).
  const [lastPathname, setLastPathname] = useState(pathname)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    const close = () => setOpen(false)

    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    window.addEventListener("scroll", close, { passive: true })
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("scroll", close)
    }
  }, [open])

  return (
    <div ref={rootRef} className="hidden max-[720px]:block ml-auto">
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
        className="place-items-center grid bg-background border border-line-strong rounded-full size-10 cursor-pointer"
      >
        <MenuIcon className="size-4.5" strokeWidth={1.8} />
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="top-full right-4 absolute gap-0.5 grid bg-card shadow-[0_24px_48px_-20px_rgba(40,30,10,0.35)] mt-1.5 p-2 border rounded-2xl w-[min(280px,calc(100vw-32px))] max-h-[calc(100vh-90px)] overflow-auto"
        >
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              {link.label}
            </Link>
          ))}
          <div className="bg-[#eeebe3] mx-1 my-1.5 h-px" />
          <SignInButton>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              Sign in
            </button>
          </SignInButton>
          <Link
            href="/sign-up"
            onClick={() => setOpen(false)}
            className="flex justify-center items-center bg-primary mt-1 rounded-full min-h-11.5 text-[15px] text-primary-foreground hover:text-white transition-colors hover:bg-accent"
          >
            Sign up
          </Link>
        </div>
      )}
    </div>
  )
}
