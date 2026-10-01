import Image from "next/image"
import Link from "next/link"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex flex-col justify-center items-center px-4 py-12 min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="-z-10 absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,var(--color-violet-100),transparent)] dark:bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,var(--color-violet-950),transparent)]"
      />

      <Link href="/" className="flex flex-col items-center gap-3 mb-8">
        <div className="flex items-center bg-violet-100 dark:bg-violet-950 rounded-xl">
          <Image
            src="/triplea-logo.png"
            alt="TripleA"
            width={160}
            height={80}
            className="w-auto h-12"
            priority
          />
        </div>
      </Link>

      <div className="w-full max-w-sm">{children}</div>

      <Link
        href="/"
        className="mt-8 text-muted-foreground hover:text-foreground text-sm transition-colors"
      >
        ← Back to home
      </Link>
    </div>
  )
}
