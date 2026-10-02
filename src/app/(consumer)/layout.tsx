import { Show, SignInButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { ReactNode, Suspense } from "react"
import { UserMenu } from "./UserMenu"
import { GetStartedButton } from "./GetStartedButton"
import { getCurrentUser } from "@/services/clerk"
import { canAccessAdminPages } from "@/permissions/general"

const navLinkClass =
  "hidden md:flex items-center text-muted-foreground text-base hover:text-accent transition-colors"

export default function ConsumerLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      {children}
    </>
  )
}

function AnnouncementBar() {
  return (
    <div className="flex flex-wrap justify-center gap-2.5 bg-foreground px-5 py-2.5 text-sm text-background text-center">
      <span className="bg-lime px-2 py-0.5 rounded-full font-medium font-mono text-xs text-foreground whitespace-nowrap">
        FAIR PRICING
      </span>
      <span>
        Learning from a lower-income country? A regional discount is applied
        automatically at checkout.
      </span>
    </div>
  )
}

function Navbar() {
  return (
    <header className="top-0 z-20 sticky bg-background/85 backdrop-blur-md border-b">
      <nav className="flex items-center gap-8 mx-auto px-6 py-3.5 w-full max-w-310">
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

        <Suspense fallback={null}>
          <Show when="signed-in" fallback={<SignedOutNav />}>
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
              <Suspense fallback={null}>
                <UserMenuWithAdminCheck />
              </Suspense>
            </div>
          </Show>
        </Suspense>
      </nav>
    </header>
  )
}

function SignedOutNav() {
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
      <div className="flex items-center gap-2.5 ml-auto shrink-0">
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
    </>
  )
}

async function UserMenuWithAdminCheck() {
  const user = await getCurrentUser({ allData: true })
  const isAdmin = canAccessAdminPages(user)

  return (
    <>
      {isAdmin && (
        <Link href="/admin" className={navLinkClass}>
          Admin
        </Link>
      )}
      <div className="size-9 shrink-0">
        <UserMenu isAdmin={isAdmin} />
      </div>
    </>
  )
}
