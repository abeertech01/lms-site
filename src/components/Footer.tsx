import { cacheLife } from "next/cache"

export async function Footer() {
  const year = await getCurrentYear()

  return (
    <footer className="py-6 border-t">
      <p className="text-muted-foreground text-sm text-center container">
        © {year} TripleA. All rights reserved.
      </p>
    </footer>
  )
}

async function getCurrentYear() {
  "use cache"
  cacheLife("days")

  return new Date().getFullYear()
}
