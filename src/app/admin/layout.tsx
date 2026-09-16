import { Badge } from "@/components/ui/badge"
import { canAccessAdminPages } from "@/permissions/general"
import { getCurrentUser } from "@/services/clerk"
import Image from "next/image"
import Link from "next/link"
import { ReactNode } from "react"
import { AdminUserMenu } from "./AdminUserMenu"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

function Navbar() {
  return (
    <header className="sticky top-0 z-10 flex bg-background shadow h-12">
      <nav className="flex gap-4 container">
        <div className="flex items-center gap-2 mr-auto">
          <Link className="flex items-center" href={"/"}>
            <div className="flex items-center rounded-lg bg-violet-100 px-3 py-1.5">
              <Image
                src="/triplea-logo.png"
                alt="TripleA"
                width={160}
                height={80}
                className="w-auto h-6"
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

async function AdminLink() {
  const user = await getCurrentUser({ allData: true })
  console.log(user.user?.name)
  if (!canAccessAdminPages(user)) return null

  return (
    <Link href={"/admin"} className="flex items-center hover:bg-accent/10 px-2">
      Admin
    </Link>
  )
}
