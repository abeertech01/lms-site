import { Button } from "@/components/ui/button"
import { canAccessAdminPages } from "@/permissions/general"
import { getCurrentUser } from "@/services/clerk"
import { Show, SignInButton } from "@clerk/nextjs"
import Link from "next/link"
import { ReactNode, Suspense } from "react"
import { UserMenu } from "./UserMenu"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function ConsumerLayout({
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
        <Link
          className="mr-auto text-lg hover:underline px-2 flex items-center"
          href={"/"}
        >
          TripleA
        </Link>

        <Show
          when="signed-in"
          fallback={
            <Button className="self-center" asChild>
              <SignInButton>Sign In</SignInButton>
            </Button>
          }
        >
          <Link
            href={"/products"}
            className="hidden md:flex hover:bg-accent/10 items-center px-2"
          >
            All Products
          </Link>
          <Link
            href={"/courses"}
            className="hidden md:flex hover:bg-accent/10 items-center px-2"
          >
            My Courses
          </Link>
          <div className="size-8 self-center">
            <Suspense fallback={null}>
              <UserMenuWithAdminCheck />
            </Suspense>
          </div>
        </Show>
      </nav>
    </header>
  )
}

async function UserMenuWithAdminCheck() {
  const user = await getCurrentUser({ allData: true })
  const isAdmin = canAccessAdminPages(user)

  return <UserMenu isAdmin={isAdmin} />
}
