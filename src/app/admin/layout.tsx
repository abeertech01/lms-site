import { Badge } from "@/components/ui/badge"
import { canAccessAdminPages } from "@/permissions/general"
import { getCurrentUser } from "@/services/clerk"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { ReactNode } from "react"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
    <header className="flex h-12 shadow bg-background z-10">
      <nav className="flex gap-4 container">
        <div className="mr-auto flex items-center gap-2">
          <Link className="text-lg hover:underline" href={"/"}>
            Triple A
          </Link>
          <Badge>Admin</Badge>
        </div>

        <Link
          href={"/admin/courses"}
          className="hover:bg-accent/10 flex items-center px-2"
        >
          Courses
        </Link>
        <Link
          href={"/admin/products"}
          className="hover:bg-accent/10 flex items-center px-2"
        >
          Products
        </Link>
        <Link
          href={"/admin/sales"}
          className="hover:bg-accent/10 flex items-center px-2"
        >
          Sales
        </Link>
        <div className="size-8 self-center">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: {
                  width: "100%",
                  height: "100%",
                },
              },
            }}
          />
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
    <Link href={"/admin"} className="hover:bg-accent/10 flex items-center px-2">
      Admin
    </Link>
  )
}
