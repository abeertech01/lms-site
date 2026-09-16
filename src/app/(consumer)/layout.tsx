import { Button } from "@/components/ui/button"
import { canAccessAdminPages } from "@/permissions/general"
import { getCurrentUser } from "@/services/clerk"
import { Show, SignInButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { ReactNode, Suspense } from "react"
import { UserMenu } from "./UserMenu"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

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
    <header className="sticky top-0 z-10 flex bg-background shadow h-12">
      <nav className="flex gap-4 container">
        <Link className="flex items-center mr-auto px-2" href={"/"}>
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
            className="hidden md:flex items-center hover:bg-accent/10 px-2"
          >
            All Products
          </Link>
          <Link
            href={"/courses"}
            className="hidden md:flex items-center hover:bg-accent/10 px-2"
          >
            My Courses
          </Link>
          <Link
            href={"/purchases"}
            className="hidden md:flex items-center hover:bg-accent/10 px-2"
          >
            Purchases History
          </Link>
          <Suspense fallback={null}>
            <UserMenuWithAdminCheck />
          </Suspense>
        </Show>
      </nav>
    </header>
  )
}

async function UserMenuWithAdminCheck() {
  const user = await getCurrentUser({ allData: true })
  const isAdmin = canAccessAdminPages(user)

  return (
    <>
      {isAdmin && (
        <Link
          href="/admin"
          className="hidden md:flex items-center hover:bg-accent/10 px-2"
        >
          Admin
        </Link>
      )}
      <div className="self-center size-8">
        <UserMenu isAdmin={isAdmin} />
      </div>
    </>
  )
}
