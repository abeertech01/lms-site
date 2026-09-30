import { Button } from "@/components/ui/button"
import { Show, SignInButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { ReactNode, Suspense } from "react"
import { UserMenu } from "./UserMenu"

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
    <header className="top-0 z-10 sticky flex bg-background shadow h-12">
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

        <Suspense fallback={null}>
          <Show
            when="signed-in"
            fallback={
              <Button
                className="self-center"
                render={<SignInButton>Sign In</SignInButton>}
              />
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
        </Suspense>
      </nav>
    </header>
  )
}

function UserMenuWithAdminCheck() {
  return (
    <>
      {/* <div className="self-center size-8">
        <UserMenu isAdmin={isAdmin} />
      </div> */}
    </>
  )
}
