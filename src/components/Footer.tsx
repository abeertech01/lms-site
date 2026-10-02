import { cacheLife } from "next/cache"
import Image from "next/image"
import Link from "next/link"

const columns = [
  {
    title: "Learn",
    links: [
      { label: "All products", href: "/all-products" },
      { label: "How it works", href: "/#how" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/sign-in" },
      { label: "Create account", href: "/sign-up" },
      { label: "My courses", href: "/courses" },
    ],
  },
]

export async function Footer() {
  const year = await getCurrentYear()

  return (
    <footer className="mx-auto px-6 pt-14 pb-10 w-full max-w-310">
      <div className="flex flex-wrap justify-between gap-10">
        <div className="max-w-75">
          <Image
            src="/triplea-logo.png"
            alt="TripleA"
            width={1245}
            height={309}
            className="w-auto h-7"
          />
          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            Practical, project-based courses for people who learn by building.
          </p>
        </div>
        <div className="flex flex-wrap gap-16 text-sm">
          {columns.map((column) => (
            <div key={column.title} className="flex flex-col gap-2.5">
              <span className="font-mono text-ink-soft text-xs uppercase">
                {column.title}
              </span>
              {column.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap justify-between gap-4 mt-14 pt-6 border-t text-[13px] text-ink-soft">
        <span>© {year} TripleA. All rights reserved.</span>
        <span className="font-mono">Learn · Apply · Achieve</span>
      </div>
    </footer>
  )
}

async function getCurrentYear() {
  "use cache"
  cacheLife("days")

  return new Date().getFullYear()
}
