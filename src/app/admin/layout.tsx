import { auth } from "@clerk/nextjs/server"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ReactNode } from "react"
import { AdminUserMenu } from "./AdminUserMenu"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { sessionClaims } = await auth.protect()
  if (sessionClaims.role !== "admin") notFound()

  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

const navLinkClass =
  "hidden md:flex items-center text-muted-foreground text-base hover:text-accent transition-colors"

function Navbar() {
  return (
    <header className="top-0 z-20 sticky bg-background/85 backdrop-blur-md border-b">
      <nav className="flex items-center gap-4 mx-auto px-6 py-3.5 w-full max-w-310">
        <Link className="flex items-center shrink-0" href="/">
          <Image
            src="/triplea-logo.png"
            alt="TripleA"
            width={1245}
            height={309}
            className="w-auto h-7"
            priority
          />
        </Link>
        <span className="bg-lime px-3 py-1.25 rounded-full font-semibold text-xs tracking-[0.02em]">
          Admin
        </span>

        <div className="flex flex-1 justify-end items-center gap-7 ml-4 min-w-0">
          <Link href="/admin/courses" className={navLinkClass}>
            Courses
          </Link>
          <Link href="/admin/my-products" className={navLinkClass}>
            My products
          </Link>
          <Link href="/admin/sales" className={navLinkClass}>
            Sales
          </Link>
          <Link
            href="/"
            className="hidden md:flex items-center text-ink-soft text-base hover:text-accent transition-colors"
          >
            ← Back to site
          </Link>
          <div className="size-9 shrink-0">
            <AdminUserMenu />
          </div>
        </div>
      </nav>
    </header>
  )
}
