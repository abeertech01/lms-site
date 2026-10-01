import { Badge } from "@/components/ui/badge"
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

function Navbar() {
  return (
    <header className="top-0 z-10 sticky flex bg-background shadow h-12">
      <nav className="flex gap-4 container">
        <div className="flex items-center gap-2 mr-auto">
          <Link className="flex items-center px-2" href={"/"}>
            <div className="flex items-center bg-violet-100 rounded-lg">
              <Image
                src="/triplea-logo.png"
                alt="TripleA"
                width={160}
                height={80}
                className="w-auto h-10"
                priority
              />
            </div>
          </Link>
          <Badge>Admin</Badge>
        </div>

        <Link
          href={"/admin/courses"}
          className="hidden md:flex items-center hover:bg-accent/10 px-2"
        >
          Courses
        </Link>
        <Link
          href={"/admin/my-products"}
          className="hidden md:flex items-center hover:bg-accent/10 px-2"
        >
          My Products
        </Link>
        <Link
          href={"/admin/sales"}
          className="hidden md:flex items-center hover:bg-accent/10 px-2"
        >
          Sales
        </Link>
        <div className="self-center size-8">
          <AdminUserMenu />
        </div>
      </nav>
    </header>
  )
}
