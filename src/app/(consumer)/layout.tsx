import Image from "next/image"
import Link from "next/link"
import { ReactNode } from "react"

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
      </nav>
    </header>
  )
}
