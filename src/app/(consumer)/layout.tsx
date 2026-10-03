import { auth } from "@clerk/nextjs/server"
import Image from "next/image"
import Link from "next/link"
import { ReactNode, Suspense } from "react"
import { AnnouncementBar } from "./AnnouncementBar"
import { HeaderAuth, SignedInNav, SignedOutNav } from "./HeaderNav"
import { getCurrentUser } from "@/services/clerk"
import { canAccessAdminPages } from "@/permissions/general"

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

function Navbar() {
  return (
    <header className="top-0 z-20 sticky bg-background/85 backdrop-blur-md border-b">
      <nav className="flex items-center gap-8 mx-auto px-6 py-3.5 w-full max-w-310 max-[720px]:gap-3 max-[720px]:px-4 max-[720px]:py-2.5 max-[380px]:px-3.5">
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
          <ServerHeaderNav />
        </Suspense>
      </nav>
    </header>
  )
}

// NOTE: renders the header the way the server sees the visitor, so the very first paint
// is already right. HeaderAuth takes over in the browser once Clerk has loaded.
async function ServerHeaderNav() {
  const { userId } = await auth()

  if (userId == null) return <HeaderAuth initial={<SignedOutNav />} />

  const user = await getCurrentUser({ allData: true })
  return (
    <HeaderAuth initial={<SignedInNav isAdmin={canAccessAdminPages(user)} />} />
  )
}
